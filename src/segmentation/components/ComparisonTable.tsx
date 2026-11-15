import { Fragment, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ClaimEvidence, SegmentationView } from "../types";
import { claimDisplay, formatCount, formatMetric, formatShare, LABELS, modelUsageLabel, relativeScale } from "../format";
import { cn } from "@/lib/utils";

export interface ComparisonTableProps {
  view: SegmentationView;
  /** Group ids to hide. Claims group id: "__claims"; interpretation: "__interpretation". */
  hiddenGroups?: Set<string>;
  /** Neutral within-row magnitude bars (no colour judgement). */
  showBars?: boolean;
}

export const CLAIMS_GROUP = "__claims";
export const INTERPRETATION_GROUP = "__interpretation";

/** Segments as columns, characteristics as grouped rows. Column count is fully dynamic. */
export function ComparisonTable({ view, hiddenGroups = new Set(), showBars = true }: ComparisonTableProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (k: string) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const segs = view.segments;
  const span = segs.length + 1;
  const claimRows = view.claim_rows ?? [];
  const interpRows = view.interpretation_rows ?? [];

  return (
    <div className="relative max-h-[78vh] overflow-auto border-y border-rule-strong">
      <table className="w-full min-w-max border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 top-0 z-30 w-36 min-w-36 sm:w-56 sm:min-w-56 border-b border-rule-strong bg-background px-4 py-4 text-left align-bottom md:w-72 md:min-w-72">
              <span className="font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-muted-foreground">Characteristic</span>
            </th>
            {segs.map((s, i) => (
              <th key={s.id} scope="col" className="sticky top-0 z-20 min-w-40 border-b border-l border-rule-strong border-l-border bg-background px-4 py-4 text-left align-bottom font-normal">
                <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <div className="font-serif text-lg leading-tight text-foreground">{s.name}</div>
                {s.description && <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>}
                <div className="mt-2 font-mono text-xs text-foreground">
                  n = {formatCount(s.record_count)} <span className="text-muted-foreground">records</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.metric_groups.filter((g) => !hiddenGroups.has(g.id)).map((g) => (
            <Fragment key={g.id}>
              <GroupRow span={span} label={g.label} sub={g.description ?? (view.nutrition_basis ? `Values ${view.nutrition_basis} unless the unit states otherwise` : null)} />
              {g.metrics.map((m) => {
                const rowKey = `${g.id}.${m.key}`;
                const values = segs.map((s) => s.metrics[m.key]);
                return (
                  <Fragment key={rowKey}>
                    <tr className="group">
                      <RowLabel open={open.has(rowKey)} onToggle={() => toggle(rowKey)} label={m.label}
                        meta={[m.unit, m.statistic].filter(Boolean).join(" · ")} />
                      {segs.map((s, i) => {
                        const v = values[i];
                        const scale = showBars ? relativeScale(v, values) : null;
                        return (
                          <Cell key={s.id}>
                            <span className={cn("font-mono tabular-nums", v == null && "text-xs italic text-muted-foreground")}>{formatMetric(v, m)}</span>
                            {scale !== null && <Bar value={scale} />}
                          </Cell>
                        );
                      })}
                    </tr>
                    {open.has(rowKey) && (
                      <Explain span={span}>
                        <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
                          <dt className="text-muted-foreground">Unit</dt><dd>{m.unit ?? LABELS.notSpecified}</dd>
                          <dt className="text-muted-foreground">Statistic</dt><dd>{m.statistic ?? LABELS.notSpecified}</dd>
                          <dt className="text-muted-foreground">Segmentation model</dt><dd>{modelUsageLabel(m.used_in_model)}</dd>
                          {m.description && (<><dt className="text-muted-foreground">Note</dt><dd>{m.description}</dd></>)}
                        </dl>
                        <p className="mt-2 text-muted-foreground">“{LABELS.notAvailable}” means the value is missing; it is not zero.{showBars && " Bars show magnitude relative to the largest value in this row only and carry no evaluative meaning."}</p>
                      </Explain>
                    )}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}

          {claimRows.length > 0 && !hiddenGroups.has(CLAIMS_GROUP) && (
            <>
              <GroupRow span={span} label="Communicated propositions"
                sub={view.claims_basis ?? "Detected among assessed packs only. The packaging sample is not representative of all records."} />
              {claimRows.map((c) => {
                const rowKey = `claims.${c.key}`;
                return (
                  <Fragment key={rowKey}>
                    <tr>
                      <RowLabel open={open.has(rowKey)} onToggle={() => toggle(rowKey)} label={c.label} meta="Detected / assessed packs" />
                      {segs.map((s) => <Cell key={s.id}><ClaimCell evidence={s.claims?.[c.key]} showBar={showBars} /></Cell>)}
                    </tr>
                    {open.has(rowKey) && (
                      <Explain span={span}>
                        {c.description && <p className="mb-2">{c.description}</p>}
                        <p>Share = packs with the proposition <em>detected</em> ÷ packs with <em>assessable</em> evidence. Ambiguous, unassessable and not-assessed packs are excluded from the denominator and listed separately when supplied.</p>
                        <p className="mt-1 text-muted-foreground">Absence of detected evidence is not a negative claim. “Not assessed” means no packaging evidence was reviewed for this segment.</p>
                      </Explain>
                    )}
                  </Fragment>
                );
              })}
            </>
          )}

          {interpRows.length > 0 && !hiddenGroups.has(INTERPRETATION_GROUP) && (
            <>
              <GroupRow span={span} label="Interpretation" sub="Text supplied with the data. Nothing here is generated by the interface." />
              {interpRows.map((r) => (
                <tr key={r.key}>
                  <RowLabel label={r.label} meta={r.description ?? undefined} />
                  {segs.map((s) => {
                    const t = s.interpretation?.[r.key];
                    return <Cell key={s.id}>{t ? <span className="font-serif text-[0.95rem] leading-snug">{t}</span> : <span className="text-xs text-muted-foreground">Not supplied</span>}</Cell>;
                  })}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GroupRow({ label, sub, span }: { label: string; sub?: string | null; span: number }) {
  return (
    <tr>
      <th colSpan={1} scope="rowgroup" className="sticky left-0 z-10 border-b border-border bg-secondary px-4 pb-2 pt-6 text-left">
        <div className="font-serif text-base font-medium text-foreground">{label}</div>
        {sub && <div className="mt-0.5 text-xs font-normal text-muted-foreground">{sub}</div>}
      </th>
      <td colSpan={span - 1} className="border-b border-border bg-secondary" />
    </tr>
  );
}

function RowLabel({ label, meta, open, onToggle }: { label: string; meta?: string | undefined; open?: boolean; onToggle?: () => void }) {
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <th scope="row" className="sticky left-0 z-10 border-b border-border bg-background px-4 py-3 text-left align-top font-normal">
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-1.5 text-left hover:text-primary">
          <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            <span className="block font-medium text-foreground">{label}</span>
            {meta && <span className="block font-mono text-[11px] text-muted-foreground">{meta}</span>}
          </span>
        </button>
      ) : (
        <span className="block pl-5">
          <span className="block font-medium">{label}</span>
          {meta && <span className="block text-[11px] text-muted-foreground">{meta}</span>}
        </span>
      )}
    </th>
  );
}

const Cell = ({ children }: { children: ReactNode }) => (
  <td className="border-b border-l border-border px-4 py-3 align-top">{children}</td>
);

function Explain({ span, children }: { span: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={span} className="border-b border-border bg-muted p-0">
        <div className="sticky left-0 max-w-[min(100vw-2.5rem,46rem)] px-4 py-3 pl-9 text-xs leading-relaxed text-foreground">{children}</div>
      </td>
    </tr>
  );
}

export const Bar = ({ value }: { value: number }) => (
  <div className="mt-1.5 h-[3px] w-full max-w-28 bg-muted" aria-hidden>
    <div className="h-full bg-bar" style={{ width: `${Math.max(2, value * 100)}%` }} />
  </div>
);

export function ClaimCell({ evidence, showBar }: { evidence: ClaimEvidence | null | undefined; showBar: boolean }) {
  const d = claimDisplay(evidence);
  if (d.kind === "missing") return <span className="text-xs italic text-muted-foreground">Not assessed</span>;
  const e = d.evidence;
  const extras: [string, number | null | undefined][] = [
    ["not detected", e.not_detected_count], ["ambiguous", e.ambiguous_count],
    ["unassessable", e.unassessable_count], ["not assessed", e.not_assessed_count],
  ];
  return (
    <div>
      {d.kind === "incidence" ? (
        <>
          <span className="font-mono tabular-nums">{formatShare(d.share)}</span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">{d.detected} / {d.assessed} assessed</span>
          {showBar && <Bar value={d.share} />}
        </>
      ) : (
        <span className="text-xs italic text-muted-foreground">{LABELS.noAssessable}</span>
      )}
      <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-muted-foreground">
        {extras.filter(([, n]) => typeof n === "number").map(([l, n]) => <li key={l}>{n} {l}</li>)}
      </ul>
    </div>
  );
}

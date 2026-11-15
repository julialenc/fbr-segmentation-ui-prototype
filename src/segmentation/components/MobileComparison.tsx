import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SegmentationView } from "../types";
import { formatCount, formatMetric, LABELS, modelUsageLabel, relativeScale } from "../format";
import { Bar, ClaimCell, CLAIMS_GROUP, INTERPRETATION_GROUP } from "./ComparisonTable";
import { cn } from "@/lib/utils";

interface Props {
  view: SegmentationView;
  hiddenGroups?: Set<string>;
  showBars?: boolean;
}

type Row =
  | { kind: "metric"; key: string; group: string; groupId: string; def: SegmentationView["metric_groups"][number]["metrics"][number] }
  | { kind: "claim"; key: string; group: string; groupId: string; def: NonNullable<SegmentationView["claim_rows"]>[number] }
  | { kind: "interp"; key: string; group: string; groupId: string; def: NonNullable<SegmentationView["interpretation_rows"]>[number] };

/** Characteristic-first mobile layout: one characteristic at a time, segments stacked vertically. */
export function MobileComparison({ view, hiddenGroups = new Set(), showBars = true }: Props) {
  const rows = useMemo<Row[]>(() => [
    ...view.metric_groups.filter((g) => !hiddenGroups.has(g.id)).flatMap((g) =>
      g.metrics.map((m) => ({ kind: "metric" as const, key: `${g.id}.${m.key}`, group: g.label, groupId: g.id, def: m }))),
    ...(hiddenGroups.has(CLAIMS_GROUP) ? [] : (view.claim_rows ?? []).map((c) =>
      ({ kind: "claim" as const, key: `claims.${c.key}`, group: "Communicated propositions", groupId: CLAIMS_GROUP, def: c }))),
    ...(hiddenGroups.has(INTERPRETATION_GROUP) ? [] : (view.interpretation_rows ?? []).map((r) =>
      ({ kind: "interp" as const, key: `interp.${r.key}`, group: "Interpretation", groupId: INTERPRETATION_GROUP, def: r }))),
  ], [view, hiddenGroups]);

  const [selected, setSelected] = useState<string | null>(null);
  const idx = Math.max(0, rows.findIndex((r) => r.key === selected));
  const row = rows[idx];
  if (!row) return <p className="px-5 py-6 text-sm text-muted-foreground">No characteristics shown. Enable a group above.</p>;

  const groups = Array.from(new Set(rows.map((r) => r.group)));
  const go = (d: number) => setSelected(rows[(idx + d + rows.length) % rows.length]!.key);
  const values = row.kind === "metric" ? view.segments.map((s) => s.metrics[row.def.key]) : [];

  return (
    <div className="px-5">
      <div className="border-t border-rule-strong pt-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Characteristic</span>
          <select value={row.key} onChange={(e) => setSelected(e.target.value)}
            className="h-11 w-full min-w-0 rounded-sm border border-input bg-card px-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {rows.filter((r) => r.group === g).map((r) => <option key={r.key} value={r.key}>{r.def.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <NavBtn label="Previous characteristic" onClick={() => go(-1)}><ChevronLeft className="size-4" /></NavBtn>
          <p className="text-center font-mono text-xs text-muted-foreground">{idx + 1} of {rows.length}</p>
          <NavBtn label="Next characteristic" onClick={() => go(1)}><ChevronRight className="size-4" /></NavBtn>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{row.group}</p>
        <h2 className="mt-1 break-words font-serif text-2xl leading-tight">{row.def.label}</h2>
        <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
          {row.kind === "metric" ? [row.def.unit, row.def.statistic].filter(Boolean).join(" · ") || LABELS.notSpecified
            : row.kind === "claim" ? (view.claims_basis ?? "Detected / assessed packs. Packaging sample not representative of all records.")
            : "Text supplied with the data"}
        </p>

        <details className="mt-3 border-y border-border text-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center gap-1.5 py-2.5 text-foreground">
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform [details[open]_&]:rotate-90" aria-hidden />
            About this characteristic
          </summary>
          <div className="pb-3 pl-5 text-[13px] leading-relaxed">
            {row.kind === "metric" && (
              <>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
                  <dt className="text-muted-foreground">Unit</dt><dd>{row.def.unit ?? LABELS.notSpecified}</dd>
                  <dt className="text-muted-foreground">Statistic</dt><dd>{row.def.statistic ?? LABELS.notSpecified}</dd>
                  <dt className="text-muted-foreground">Model</dt><dd>{modelUsageLabel(row.def.used_in_model)}</dd>
                </dl>
                {row.def.description && <p className="mt-2">{row.def.description}</p>}
                <p className="mt-2 text-muted-foreground">“{LABELS.notAvailable}” means the value is missing; it is not zero.{showBars && " Bars show magnitude relative to the largest value for this characteristic only and carry no evaluative meaning."}</p>
              </>
            )}
            {row.kind === "claim" && (
              <>
                {row.def.description && <p className="mb-2">{row.def.description}</p>}
                <p>Share = packs with the proposition <em>detected</em> ÷ packs with <em>assessable</em> evidence. Ambiguous, unassessable and not-assessed packs are excluded from the denominator and listed separately when supplied.</p>
                <p className="mt-1 text-muted-foreground">Absence of detected evidence is not a negative claim.</p>
              </>
            )}
            {row.kind === "interp" && <p>{row.def.description ?? "Nothing here is generated by the interface."}</p>}
          </div>
        </details>

        <ol className="mt-2">
          {view.segments.map((s, i) => {
            const v = values[i];
            const scale = row.kind === "metric" && showBars ? relativeScale(v, values) : null;
            return (
              <li key={s.id} className="border-b border-border py-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <p className="break-words font-serif text-lg leading-snug">{s.name}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">n = {formatCount(s.record_count)}</span>
                </div>
                <div className="mt-2 text-[15px]">
                  {row.kind === "metric" && (
                    <>
                      <span className={cn("font-mono tabular-nums", v == null && "text-sm italic text-muted-foreground")}>{formatMetric(v, row.def)}</span>
                      {v != null && row.def.unit && <span className="ml-1.5 font-mono text-xs text-muted-foreground">{row.def.unit}</span>}
                      {scale !== null && <Bar value={scale} />}
                    </>
                  )}
                  {row.kind === "claim" && <ClaimCell evidence={s.claims?.[row.def.key]} showBar={showBars} />}
                  {row.kind === "interp" && (s.interpretation?.[row.def.key]
                    ? <p className="font-serif leading-snug">{s.interpretation[row.def.key]}</p>
                    : <span className="text-sm text-muted-foreground">Not supplied</span>)}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function NavBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="grid size-11 place-items-center rounded-sm border border-input bg-card text-foreground hover:bg-secondary">
      {children}
    </button>
  );
}

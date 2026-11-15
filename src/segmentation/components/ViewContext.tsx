import type { SegmentationReport, SegmentationView } from "../types";
import { formatCount } from "../format";

/** Denominators, population definitions and notes for the active view. */
export function ViewContext({ report, view }: { report: SegmentationReport; view: SegmentationView }) {
  const total = view.segments.reduce((a, s) => a + (s.record_count ?? 0), 0);
  const allCounts = view.segments.every((s) => typeof s.record_count === "number");
  const items: [string, string][] = [
    ["Nutrition basis", view.nutrition_basis ?? "Not specified — see units per row"],
    ["Records counted", view.segment_count_basis ?? "Population not specified"],
    ["Records across segments", allCounts ? `${formatCount(total)} (sum of segment counts)` : "Incomplete — some counts not available"],
    ["Claims evidence", view.claims_basis ?? "Assessed packaging subsample; not representative of all records"],
    ["Model", [report.model.status, report.model.algorithm ?? "algorithm undecided", report.model.feature_set ?? "feature set undecided"].join(" · ")],
  ];
  return (
    <aside className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
        {items.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:pt-0.5">{k}</dt>
            <dd className="text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      {view.notes && view.notes.length > 0 && (
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Notes supplied with this view</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {view.notes.map((n) => <li key={n} className="border-l-2 border-border pl-3">{n}</li>)}
          </ul>
        </div>
      )}
    </aside>
  );
}

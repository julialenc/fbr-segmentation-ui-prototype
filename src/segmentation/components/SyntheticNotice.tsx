import type { SegmentationReport } from "../types";

/** Prominent status banner. Shown whenever the report is synthetic or the model is not approved. */
export function SyntheticNotice({ report }: { report: SegmentationReport }) {
  const approved = report.model.status?.toUpperCase() === "APPROVED";
  if (!report.synthetic_demo && approved) return null;
  return (
    <div role="status" className="border-y-2 border-notice-border bg-notice text-notice-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-4 md:px-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em]">
          {report.synthetic_demo ? "Synthetic demonstration — no analytical results approved" : "No analytical results approved"}
        </p>
        <p className="text-xs opacity-80">
          Model status: {report.model.status}
          {report.disclaimer ? ` · ${report.disclaimer}` : ""}
        </p>
      </div>
    </div>
  );
}

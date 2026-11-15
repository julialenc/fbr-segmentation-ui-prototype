import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { demoReport } from "@/data/demo-report";
import {
  CLAIMS_GROUP, ComparisonTable, INTERPRETATION_GROUP, MobileComparison, parseReport, SyntheticNotice,
  ViewContext, ViewSelector, type SegmentationReport,
} from "@/segmentation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Segment comparison — F&B Positioning Radar (prototype)" },
      { name: "description", content: "Prototype interface for comparing food and beverage product segments by nutrition and packaging claims. Synthetic data." },
      { property: "og:title", content: "Segment comparison — F&B Positioning Radar" },
      { property: "og:description", content: "Reusable comparison interface for multidimensional F&B product segments. Synthetic demonstration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [report, setReport] = useState<SegmentationReport>(demoReport);
  const [sel, setSel] = useState({ region: demoReport.views[0]!.region, category: demoReport.views[0]!.category });
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [bars, setBars] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const view = report.views.find((v) => v.region === sel.region && v.category === sel.category) ?? report.views[0]!;

  const groups = useMemo(() => [
    ...view.metric_groups.map((g) => ({ id: g.id, label: g.label })),
    ...(view.claim_rows?.length ? [{ id: CLAIMS_GROUP, label: "Communicated propositions" }] : []),
    ...(view.interpretation_rows?.length ? [{ id: INTERPRETATION_GROUP, label: "Interpretation" }] : []),
  ], [view]);

  const toggleGroup = (id: string) => setHidden((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function onFile(f: File | undefined) {
    if (!f) return;
    try {
      const r = parseReport(JSON.parse(await f.text()));
      setReport(r); setSel({ region: r.views[0]!.region, category: r.views[0]!.category }); setHidden(new Set()); setLoadError(null);
    } catch (e) { setLoadError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      <SyntheticNotice report={report} />
      <header className="mx-auto max-w-[1400px] px-5 pb-6 pt-10 md:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Food &amp; Beverage Positioning Radar · Segment comparison</p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight md:text-[2.6rem]">
          {view.region} <span className="text-muted-foreground">/</span> {view.category}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {view.segments.length} segments · schema {report.schema_version} · view <span className="font-mono">{view.id}</span>
        </p>
      </header>

      <section className="mx-auto max-w-[1400px] border-t border-border px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <ViewSelector views={report.views} region={sel.region} category={sel.category} onChange={setSel} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Show</span>
            {groups.map((g) => (
              <label key={g.id} className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" className="accent-primary" checked={!hidden.has(g.id)} onChange={() => toggleGroup(g.id)} />
                {g.label}
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-1.5 text-muted-foreground">
              <input type="checkbox" className="accent-primary" checked={bars} onChange={(e) => setBars(e.target.checked)} />
              Relative bars
            </label>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-xs text-muted-foreground">
          Segments are defined separately for each region and category. A profile in one view is not the same as, or directly comparable with, a similarly named profile in another view.
        </p>
      </section>

      <main className="mx-auto max-w-[1400px] px-0 md:px-8">
        <div className="block compact:hidden">
          <ComparisonTable view={view} hiddenGroups={hidden} showBars={bars} />
        </div>
        <div className="hidden compact:block">
          <MobileComparison view={view} hiddenGroups={hidden} showBars={bars} />
        </div>
        <p className="px-5 pt-2 text-xs text-muted-foreground md:px-0">
          n = count of records in the analytical population defined below. Not sales, market share, penetration or consumer demand.
        </p>
      </main>

      <section className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
        <h2 className="mb-5 font-serif text-xl">Denominators and provenance</h2>
        <ViewContext report={report} view={view} />
      </section>

      <footer className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 border-t border-border px-5 py-6 text-xs text-muted-foreground md:px-8">
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-sm border border-input bg-card px-3 py-1.5 text-foreground hover:bg-secondary">
          Load report JSON…
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {report !== demoReport && (
          <button type="button" className="underline" onClick={() => { setReport(demoReport); setSel({ region: demoReport.views[0]!.region, category: demoReport.views[0]!.category }); }}>Restore demonstration data</button>
        )}
        <span>Files are read in the browser only; nothing is uploaded.</span>
        {loadError && <pre className="w-full whitespace-pre-wrap text-destructive">{loadError}</pre>}
      </footer>
    </div>
  );
}

import type { SegmentationView } from "../types";

interface Props {
  views: SegmentationView[];
  region: string;
  category: string;
  onChange: (next: { region: string; category: string }) => void;
}

const unique = (xs: string[]) => Array.from(new Set(xs));

/** Region and category selectors derived from the report's views. */
export function ViewSelector({ views, region, category, onChange }: Props) {
  const regions = unique(views.map((v) => v.region));
  const categories = unique(views.filter((v) => v.region === region).map((v) => v.category));
  return (
    <div className="flex flex-wrap gap-4">
      <Field label="Region" value={region} options={regions}
        onChange={(r) => onChange({ region: r, category: views.find((v) => v.region === r)?.category ?? "" })} />
      <Field label="Product category" value={category} options={categories}
        onChange={(c) => onChange({ region, category: c })} />
    </div>
  );
}

function Field({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-[12rem] flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-sm border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

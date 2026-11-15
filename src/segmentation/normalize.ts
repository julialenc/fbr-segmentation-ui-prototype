/** Validates untyped JSON into a SegmentationReport. Throws with readable messages. */
import type { SegmentationReport } from "./types";

export function parseReport(input: unknown): SegmentationReport {
  const errors: string[] = [];
  const r = input as Partial<SegmentationReport> | null;
  if (!r || typeof r !== "object") throw new Error("Report must be a JSON object.");
  if (!Array.isArray(r.views) || r.views.length === 0) errors.push("`views` must be a non-empty array.");
  if (!r.model || typeof r.model !== "object") errors.push("`model` object is required.");
  (r.views ?? []).forEach((v, i) => {
    const at = `views[${i}]`;
    if (!v?.id) errors.push(`${at}.id is required.`);
    if (!v?.region) errors.push(`${at}.region is required.`);
    if (!v?.category) errors.push(`${at}.category is required.`);
    if (!Array.isArray(v?.metric_groups)) errors.push(`${at}.metric_groups must be an array.`);
    if (!Array.isArray(v?.segments) || v.segments.length === 0) errors.push(`${at}.segments must be a non-empty array.`);
    v?.segments?.forEach((s, j) => {
      if (!s?.id || !s?.name) errors.push(`${at}.segments[${j}] needs id and name.`);
      if (s && (typeof s.metrics !== "object" || s.metrics === null)) errors.push(`${at}.segments[${j}].metrics must be an object.`);
    });
  });
  if (errors.length) throw new Error(errors.join("\n"));
  return {
    schema_version: r.schema_version ?? "unknown",
    synthetic_demo: r.synthetic_demo !== false,
    disclaimer: r.disclaimer ?? null,
    model: r.model!,
    views: r.views!,
    ...(r.display_rules ? { display_rules: r.display_rules } : {}),
  };
}

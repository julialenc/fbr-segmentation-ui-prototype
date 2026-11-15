# Assumptions and deliberately undecided integration points

## Assumptions made by the prototype
- A report contains independent **views**, one per region × category. Segments are never matched across views.
- `record_count` counts records of the population named in `segment_count_basis`.
- `assessed_count` is the claim denominator (packs with assessable evidence). `unassessable`, `ambiguous`, `not_assessed` are excluded from it and shown only when supplied; nothing is derived.
- Ambiguous packs are assumed to be outside `assessed_count`; confirm with the pipeline.
- Number formatting: 0 decimals for values ≥ 100, otherwise 1, unless `decimals` is set. Locale en-GB.
- Relative bars scale to the row maximum within the current view only.
- `null` and absent keys are treated identically ("Not available").

## Undecided (to be fixed by the analytical process)
- Clustering method, feature set, number of segments, segment names and definitions (`model.*` are null/UNDECIDED).
- Which metrics are model inputs (`used_in_model` is optional; unspecified is shown as such).
- Summary statistic (median, mean, trimmed mean), uncertainty intervals, and whether to show dispersion — not yet in the schema.
- Claim taxonomy, OCR/LLM confidence thresholds, and the packaging sample selection rule (`claims_basis`).
- Whether claim incidence should carry confidence intervals or minimum-denominator suppression.
- Minimum segment size for display / disclosure thresholds.
- Region and category taxonomies and whether views may have sub-categories.
- Final schema versioning and JSON Schema publication; `normalize.ts` performs minimal checks only.
- Source of interpretation text and its review/approval workflow.
- Hosting: the app is a static-capable TanStack Start/Vite React app with no proprietary service dependency; `src/segmentation/` can be copied into any React 18+ project with Tailwind (or restyled).

# F&B Positioning Radar — Segment comparison interface (prototype)

> **Synthetic demonstration — no analytical results approved.** All data in `src/data/` is invented for UI testing.

A reusable React + TypeScript interface for comparing multidimensional product segments: segments as columns, characteristics as grouped rows (nutritional composition, communicated propositions, optional supplied interpretation). It performs **no** segmentation and has no backend, database, auth or AI calls.

## Structure

| Concern | Location |
|---|---|
| Typed data interface | `src/segmentation/types.ts` |
| Validation of external JSON | `src/segmentation/normalize.ts` |
| Display & formatting rules | `src/segmentation/format.ts` (+ `format.test.ts`) |
| Reusable components | `src/segmentation/components/` (`ComparisonTable`, `ViewSelector`, `ViewContext`, `SyntheticNotice`) |
| Synthetic demonstration data | `src/data/fbr_segmentation_ui_synthetic_fixture.json` (supplied), `src/data/supplementary_synthetic_views.json` (extra optional-field cases), assembled in `src/data/demo-report.ts` |
| Demo page | `src/routes/index.tsx` |

Run: `bun install && bun run dev`. Tests: `bunx vitest run`.

## Replacing the demonstration data

1. Produce a JSON file matching `SegmentationReport` (see `types.ts`).
2. Either load it at runtime via **Load report JSON…** (read in-browser only), or replace the import in `src/data/demo-report.ts`.
3. Set `synthetic_demo: false` and `model.status: "APPROVED"` only when results are approved; otherwise the notice stays visible.

### Mapping from Python outputs

A typical pipeline (pandas) can emit one view per region × category:

```python
view = {
  "id": f"{region}-{category}",
  "region": region, "category": category,
  "nutrition_basis": "per 100 g",
  "segment_count_basis": "OFF records with complete nutrition, export 2026-xx-xx",
  "claims_basis": "Packs selected for OCR/LLM review (selection rule …)",
  "metric_groups": [{"id": "composition", "label": "Nutritional composition",
      "metrics": [{"key": c, "label": LABELS[c], "unit": "g/100 g",
                   "statistic": "Median", "used_in_model": c in FEATURES} for c in cols]}],
  "claim_rows": [{"key": k, "label": CLAIM_LABELS[k]} for k in claim_keys],
  "segments": [{
      "id": str(seg), "name": names[seg], "description": desc[seg],
      "record_count": int(n),
      "metrics": {c: (None if pd.isna(v) else float(v)) for c, v in medians.loc[seg].items()},
      "claims": {k: {"assessed_count": int(a), "detected_count": int(d),
                     "ambiguous_count": int(amb), "unassessable_count": int(u),
                     "not_assessed_count": int(na)} for k, (a, d, amb, u, na) in claim_tallies[seg].items()},
  } for seg, n in sizes.items()],
}
json.dump({"schema_version": "...", "synthetic_demo": False, "model": {...}, "views": views}, f, allow_nan=False)
```

Key rules: write `None`/`null` for missing values (never `NaN` or `0`); tally claim statuses per segment rather than ratios; keep `segment_count_basis` precise.

## Display rules enforced

- Missing numeric → "Not available", never 0.
- Claim share = detected ÷ assessed; zero assessed → "No assessable evidence"; missing evidence object → "Not assessed". Absence is never a negative claim.
- Counts are labelled as records of a named population — never sales, share, penetration or demand.
- No good/bad/healthy colouring. Optional grey bars show magnitude relative to the row maximum only.
- Interpretation text is shown only when supplied.
- Views are presented independently; the UI states they are not comparable.

See `docs/ASSUMPTIONS.md` for undecided points.

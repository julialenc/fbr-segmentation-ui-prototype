/**
 * Segmentation report data interface (prototype, schema_version "0.1-prototype").
 *
 * This describes the JSON the comparison interface accepts. It mirrors the
 * supplied synthetic fixture and adds OPTIONAL fields the UI already knows how
 * to render. It is NOT an approved analytical schema: field names may change
 * once the segmentation method is approved. Adapt here and in `normalize.ts`.
 *
 * Conventions
 * - `null` or an absent key means "not available" — never zero.
 * - Counts are counts of records from a named analytical population
 *   (`segment_count_basis`). They are never sales, share or demand.
 * - Claim figures use the assessed-pack denominator (`assessed_count`).
 */

/** Model provenance. Everything may be null while the method is undecided. */
export interface ModelInfo {
  status: string; // e.g. "UNDECIDED" | "DRAFT" | "APPROVED" — free text by design
  algorithm: string | null;
  feature_set: string | null;
  approval_version: string | null;
}

/** One numeric characteristic shown as a row. */
export interface MetricDefinition {
  key: string;
  label: string;
  /** Unit including denominator, e.g. "g/100 g", "kcal/100 ml". */
  unit?: string | null | undefined;
  /** Summary statistic, e.g. "Median", "Mean", "Share of records (%)". */
  statistic?: string | null | undefined;
  /** Optional longer explanation shown when the row is expanded. */
  description?: string | null | undefined;
  /** Decimal places for display. Defaults via `format.ts`. */
  decimals?: number | null | undefined;
  /**
   * Whether the metric was an input feature of the segmentation model.
   * `undefined` = not specified (rendered as "not specified"), never assumed.
   */
  used_in_model?: boolean | null | undefined;
}

export interface MetricGroup {
  id: string;
  label: string;
  description?: string | null | undefined;
  metrics: MetricDefinition[];
}

/** A communicated proposition assessed on packaging (OCR/LLM evidence). */
export interface ClaimDefinition {
  key: string;
  label: string;
  description?: string | null | undefined;
}

/**
 * Evidence tallies for one claim within one segment.
 * Status vocabulary: detected · not detected · ambiguous · unassessable · not assessed.
 * Only `assessed_count` and `detected_count` are required by the fixture;
 * the others render only when supplied (they are never derived).
 */
export interface ClaimEvidence {
  /** Packs whose evidence was assessable — the incidence denominator. */
  assessed_count: number | null;
  detected_count: number | null;
  not_detected_count?: number | null | undefined;
  ambiguous_count?: number | null | undefined;
  /** Packs examined but evidence could not be assessed (e.g. illegible). */
  unassessable_count?: number | null | undefined;
  /** Records in the segment never selected for packaging assessment. */
  not_assessed_count?: number | null | undefined;
}

/** Optional, explicitly supplied interpretation text. Never generated. */
export interface InterpretationRow {
  key: string;
  label: string;
  description?: string | null | undefined;
}

export interface Segment {
  id: string;
  name: string;
  description?: string | null | undefined;
  /** Records from the population named in `segment_count_basis`. */
  record_count?: number | null | undefined;
  metrics: Record<string, number | null | undefined>;
  claims?: Record<string, ClaimEvidence | null | undefined> | undefined;
  /** Keyed by InterpretationRow.key. Only supplied text is shown. */
  interpretation?: Record<string, string | null | undefined> | undefined;
  notes?: string[] | undefined;
}

/** One region × category result. Views are NOT comparable with each other. */
export interface SegmentationView {
  id: string;
  region: string;
  category: string;
  /** Default nutrition denominator, e.g. "per 100 g" / "per 100 ml". */
  nutrition_basis?: string | null | undefined;
  /** Precise definition of the population that `record_count` counts. */
  segment_count_basis?: string | null | undefined;
  /** Optional description of the claims sample / selection. */
  claims_basis?: string | null | undefined;
  metric_groups: MetricGroup[];
  claim_rows?: ClaimDefinition[] | undefined;
  interpretation_rows?: InterpretationRow[] | undefined;
  segments: Segment[];
  notes?: string[] | undefined;
}

export interface SegmentationReport {
  schema_version: string;
  synthetic_demo: boolean;
  disclaimer?: string | null | undefined;
  model: ModelInfo;
  views: SegmentationView[];
  /** Free-text display rules carried with the data (informational). */
  display_rules?: Record<string, string> | undefined;
}

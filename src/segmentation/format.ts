/** Display and formatting rules. Pure functions — no React. */
import type { ClaimEvidence, MetricDefinition } from "./types";

export const LABELS = {
  notAvailable: "Not available",
  noAssessable: "No assessable evidence",
  notSpecified: "Not specified",
  notSupplied: "—",
} as const;

export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Missing values are not zero: null/undefined/NaN → "Not available". */
export function formatMetric(value: number | null | undefined, def: Pick<MetricDefinition, "decimals">): string {
  if (!isNum(value)) return LABELS.notAvailable;
  const decimals = def.decimals ?? (Math.abs(value) >= 100 ? 0 : 1);
  return value.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatCount(n: number | null | undefined): string {
  return isNum(n) ? n.toLocaleString("en-GB") : LABELS.notAvailable;
}

export type ClaimDisplay =
  | { kind: "missing" }
  | { kind: "no-assessable"; evidence: ClaimEvidence }
  | { kind: "incidence"; detected: number; assessed: number; share: number; evidence: ClaimEvidence };

/** Incidence = detected / assessed only. Zero assessed never becomes 0%. */
export function claimDisplay(e: ClaimEvidence | null | undefined): ClaimDisplay {
  if (!e) return { kind: "missing" };
  if (!isNum(e.assessed_count) || e.assessed_count <= 0 || !isNum(e.detected_count))
    return { kind: "no-assessable", evidence: e };
  return { kind: "incidence", detected: e.detected_count, assessed: e.assessed_count, share: e.detected_count / e.assessed_count, evidence: e };
}

export const formatShare = (s: number) => `${Math.round(s * 100)}%`;

/** Relative position within a row for neutral magnitude bars (0–1); null when not applicable. */
export function relativeScale(value: number | null | undefined, rowValues: (number | null | undefined)[]): number | null {
  if (!isNum(value)) return null;
  const nums = rowValues.filter(isNum);
  const max = Math.max(...nums.map(Math.abs));
  return max > 0 ? Math.abs(value) / max : null;
}

export function modelUsageLabel(v: boolean | null | undefined): string {
  if (v === true) return "Model input";
  if (v === false) return "Descriptive only";
  return "Model use not specified";
}

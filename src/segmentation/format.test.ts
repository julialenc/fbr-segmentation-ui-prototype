import { describe, expect, it } from "vitest";
import { claimDisplay, formatMetric } from "./format";
import { parseReport } from "./normalize";
import fixture from "@/data/fbr_segmentation_ui_synthetic_fixture.json";

describe("display rules", () => {
  it("shows missing numeric values as Not available, never 0", () => {
    expect(formatMetric(null, {})).toBe("Not available");
    expect(formatMetric(undefined, {})).toBe("Not available");
    expect(formatMetric(0, {})).toBe("0.0");
  });
  it("zero assessed packs is no assessable evidence, not 0%", () => {
    expect(claimDisplay({ assessed_count: 0, detected_count: null }).kind).toBe("no-assessable");
  });
  it("incidence uses detected / assessed", () => {
    const d = claimDisplay({ assessed_count: 33, detected_count: 9, unassessable_count: 4 });
    expect(d.kind === "incidence" && d.assessed).toBe(33);
    expect(d.kind === "incidence" && d.share).toBeCloseTo(9 / 33);
  });
  it("accepts the supplied fixture", () => {
    expect(parseReport(fixture).views).toHaveLength(2);
  });
});

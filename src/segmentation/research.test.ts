import { describe, expect, it } from "vitest";
import report from "@/data/accepted-presentation.json";
import { parseReport } from "./normalize";

describe("accepted presentation contract", () => {
  it("loads accepted evidence independently of legacy model views", () => {
    const r = parseReport(report);
    expect(r.synthetic_demo).toBe(false);
    expect(r.views).toEqual([]);
    expect(r.research?.families).toHaveLength(3);
  });
  it("rejects a broken population total", () => {
    const r = parseReport(structuredClone(report));
    r.research!.families[0]!.regions[0]!.population += 1;
    expect(() => parseReport(r)).toThrow(/Population counts/);
  });
  it("rejects a negative or inconsistent claim denominator", () => {
    const r = parseReport(structuredClone(report));
    r.research!.families[0]!.regions[0]!.communication!.known = -1;
    expect(() => parseReport(r)).toThrow();
  });
  it("rejects inconsistent selected comparison effects", () => {
    const r = parseReport(structuredClone(report));
    r.research!.sodaContrast.effect = 0;
    expect(() => parseReport(r)).toThrow(/comparison effect/);
  });
  it("does not bundle product-level evidence", () => {
    expect(JSON.stringify(report)).not.toMatch(
      /"(?:barcode|image_url|saved_evidence|product_name|core_claim_evidence_json)"/,
    );
  });
});

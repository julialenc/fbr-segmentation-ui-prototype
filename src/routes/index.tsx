import { createFileRoute } from "@tanstack/react-router";
import { ResearchSite } from "@/segmentation/components/ResearchSite";
export type Area = "overview" | "explore" | "insights" | "method";
export type Region = "FR" | "UK-IE" | "US-CA";
export type FamilyId = "" | "soda" | "biscuit" | "pudding";
export type ResearchSearch = { area: Area; region: Region; family: FamilyId };
export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): ResearchSearch => ({
    area: ["overview", "explore", "insights", "method"].includes(String(s["area"]))
      ? (s["area"] as Area)
      : "overview",
    region: ["FR", "UK-IE", "US-CA"].includes(String(s["region"])) ? (s["region"] as Region) : "FR",
    family: ["soda", "biscuit", "pudding"].includes(String(s["family"]))
      ? (s["family"] as FamilyId)
      : "",
  }),
  head: () => ({
    meta: [
      { title: "F&B Positioning Radar — Product positioning research" },
      {
        name: "description",
        content:
          "Accepted Wave 2 research: commercial identity, nutritional formulation and assessed packaging communication, with explicit populations and uncertainty.",
      },
    ],
  }),
  component: ResearchSite,
});

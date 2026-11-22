import { z } from "zod";
const count = z.number().int().nonnegative();
const communication = z
  .object({
    population: count,
    matched: count,
    usable: count,
    positive: count,
    nonDetection: count,
    humanNegative: count,
    uncertain: count,
    otherUnknown: count,
    unassessed: count,
    marketLimited: count,
    known: count,
  })
  .superRefine((c, ctx) => {
    if (
      c.known !== c.positive + c.nonDetection ||
      c.known > c.usable ||
      c.usable > c.matched ||
      c.matched > c.population
    )
      ctx.addIssue({ code: "custom", message: "Invalid communication denominator chain" });
  });
const population = z
  .object({
    region: z.enum(["FR", "UK-IE", "US-CA"]),
    population: count,
    measurable: count,
    unknown: count,
    profile: count.optional(),
    other: count.optional(),
    communication: communication.optional(),
    otherCommunication: communication.optional(),
    pairs: count.optional(),
    metrics: z
      .array(
        z.object({
          label: z.string(),
          unit: z.string(),
          statistic: z.string(),
          value: z.number().finite().nonnegative(),
          other: z.number().finite().nonnegative().optional(),
          decimals: count,
        }),
      )
      .optional(),
  })
  .superRefine((p, ctx) => {
    if (
      p.measurable + p.unknown !== p.population ||
      (p.profile !== undefined && p.profile + (p.other ?? 0) !== p.measurable)
    )
      ctx.addIssue({ code: "custom", message: "Population counts do not reconcile" });
  });
export const researchSchema = z
  .object({
    release: z.object({
      version: z.string(),
      status: z.literal("ACCEPTED_FROZEN"),
      cutoff: z.string(),
      retrieved: z.string(),
      unit: z.string(),
      digest: z.string().length(64),
    }),
    families: z
      .array(
        z.object({
          id: z.enum(["soda", "biscuit", "pudding"]),
          title: z.string(),
          category: z.string(),
          outcome: z.string(),
          conclusion: z.string(),
          basis: z.string(),
          rule: z.string(),
          proposition: z.string().nullable(),
          regions: z.array(population).length(3),
        }),
      )
      .length(3),
    sodaContrast: z.object({
      positiveProfile: count,
      knownProfile: count,
      populationProfile: count,
      positiveOther: count,
      knownOther: count,
      populationOther: count,
      effect: z.number(),
      lo: z.number(),
      hi: z.number(),
    }),
    catalogue: z.array(
      z.object({ branch: z.string(), decision: z.string(), scope_note: z.string() }),
    ),
    sources: z.array(z.object({ path: z.string(), sha256: z.string().length(64) })),
  })
  .superRefine((r, ctx) => {
    if (
      new Set(r.families.map((f) => f.id)).size !== 3 ||
      r.families.some((f) => new Set(f.regions.map((p) => p.region)).size !== 3)
    )
      ctx.addIssue({ code: "custom", message: "Duplicate family or region" });
    for (const f of r.families)
      for (const p of f.regions) {
        if (
          f.id === "biscuit"
            ? p.pairs === undefined || p.metrics?.length !== 3
            : p.profile === undefined ||
              p.other === undefined ||
              !p.communication ||
              p.communication.population !== p.profile ||
              !p.otherCommunication ||
              p.otherCommunication.population !== p.other
        )
          ctx.addIssue({ code: "custom", message: "Missing or inconsistent family evidence" });
      }
    const c = r.sodaContrast;
    if (
      !c.knownProfile ||
      !c.knownOther ||
      c.positiveProfile > c.knownProfile ||
      c.positiveOther > c.knownOther ||
      Math.abs(c.effect - (c.positiveProfile / c.knownProfile - c.positiveOther / c.knownOther)) >
        1e-10
    )
      ctx.addIssue({ code: "custom", message: "Invalid comparison effect" });
  });
export type ResearchPresentation = z.infer<typeof researchSchema>;
export type Family = ResearchPresentation["families"][number];
export type FamilyPopulation = Family["regions"][number];

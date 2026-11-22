import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import accepted from "@/data/accepted-presentation.json";
import { Route, type Area, type Region, type FamilyId } from "@/routes/index";
import { parseReport } from "../normalize";
import { formatCount, formatMetric } from "../format";
import type { Family, FamilyPopulation } from "../research";
const research = parseReport(accepted).research!;
const regions: Record<Region, string> = {
  FR: "France",
  "UK-IE": "UK / Ireland",
  "US-CA": "US / Canada",
};
const areas: [Area, string][] = [
  ["overview", "Overview"],
  ["explore", "Explore families"],
  ["insights", "Research insights"],
  ["method", "Method & evidence"],
];
const number = (v: number) => formatCount(v);
function Jump({
  area,
  family = "",
  region = "FR",
  children,
  className = "text-link",
}: {
  area: Area;
  family?: FamilyId;
  region?: Region;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to="/" search={{ area, family, region }} className={className}>
      {children}
    </Link>
  );
}
export function ResearchSite() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const family = research.families.find((f) => f.id === search.family);
  return (
    <div className="research-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Jump area="overview" className="brand">
            <span className="brand-mark" aria-hidden>
              F&B
            </span>
            <span>
              Positioning Radar<small>Product positioning research</small>
            </span>
          </Jump>
          <nav aria-label="Main navigation">
            {areas.map(([id, label]) => (
              <Link
                key={id}
                to="/"
                search={{ area: id, family: "", region: search.region }}
                aria-current={search.area === id ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="release-strip">
        <span>Wave 2 · Accepted analytical release</span>
        <span>
          Reporting cutoff {research.release.cutoff} · Retrieved {research.release.retrieved}
        </span>
      </div>
      <main id="main" className="page-shell" tabIndex={-1}>
        {search.area === "overview" && <Overview />}
        {search.area === "explore" &&
          (family ? (
            <>
              <div className="family-controls">
                <Jump area="explore" region={search.region}>
                  All product families
                </Jump>
                <label>
                  Geography
                  <select
                    value={search.region}
                    onChange={(e) =>
                      void navigate({ search: { ...search, region: e.target.value as Region } })
                    }
                  >
                    {Object.entries(regions).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <FamilyPage family={family} region={search.region} />
            </>
          ) : (
            <Catalogue region={search.region} />
          ))}
        {search.area === "insights" && <Insights region={search.region} />}
        {search.area === "method" && <Method />}
      </main>
      <footer className="site-footer">
        <div>
          <strong>Food & Beverage Positioning Radar</strong>
          <p>
            Research by Julia Lenc · Data from{" "}
            <a href="https://world.openfoodfacts.org/">Open Food Facts</a> (ODbL).
          </p>
        </div>
        <p>
          Observed records, not sales or market share.
          <br />
          {research.release.version} · <Jump area="method">Method & evidence</Jump>
        </p>
      </footer>
    </div>
  );
}
function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="intro-copy">{children}</div>
    </div>
  );
}
function Overview() {
  return (
    <>
      <section className="overview-hero">
        <div>
          <p className="eyebrow">Open data. Deliberate interpretation.</p>
          <h1>
            What a product is.
            <br />
            How it is formulated.
            <br />
            <em>What its pack communicates.</em>
          </h1>
          <p className="hero-copy">
            Explore food and beverage positioning through comparable commercial identities,
            nutritional evidence and assessed packaging communication.
          </p>
          <Jump area="explore" className="primary-link">
            Explore product families
          </Jump>
        </div>
        <aside className="research-note">
          <span className="eyebrow">Reading the research</span>
          <h2>
            Different families.
            <br />
            Different conclusions.
          </h2>
          <p>
            Five descriptive nutritional profiles were retained across the investigated families.
            Other findings concern continuous variation, commercial distinctions or insufficient
            evidence.
          </p>
          <p>
            A profile is a research convention. It does not establish a natural cluster, health
            judgment or market prevalence.
          </p>
        </aside>
      </section>
      <section aria-labelledby="layers">
        <div className="section-heading">
          <h2 id="layers">Three layers of evidence</h2>
          <p>Related questions, each with its own population.</p>
        </div>
        <div className="layer-grid">
          {[
            [
              "Commercial identity",
              "Start with comparable products",
              "Format, composition, base and construction come from available names and category evidence, independently of nutrition.",
            ],
            [
              "Nutritional formulation",
              "Describe meaningful differences",
              "Retain a reproducible profile where supported. Continuous variation is also a valid result.",
            ],
            [
              "Communicated positioning",
              "Read the assessed evidence",
              "Examine specific packaging propositions. Unknown or unassessed communication remains unknown.",
            ],
          ].map(([label, title, text]) => (
            <article key={label}>
              <p className="eyebrow">{label}</p>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <p className="eyebrow">Featured research cases</p>
          <h2>Three findings. Three different conclusions.</h2>
          <p>Why comparable products don't always lead to the same analytical result.</p>
          <p className="featured-scope">
            These three detailed cases illustrate different outcomes. Five descriptive nutritional
            profiles were retained across the wider research; not every investigated family has an
            interactive page.
          </p>
        </div>
        <FamilyCards region="FR" />
      </section>
      <aside className="callout">
        <h2>What this research can tell us</h2>
        <p>
          It describes observed Open Food Facts products and selected pack assessments in France,
          UK/Ireland and US/Canada. It does not estimate consumer demand, sales, market share or
          regulatory claim eligibility. US/Canada nutritional results remain exploratory because
          measurement coverage is low.
        </p>
        <Jump area="method">Understand the scope and limitations</Jump>
      </aside>
    </>
  );
}
function FamilyCards({ region, category = "All" }: { region: Region; category?: string }) {
  return (
    <div className="family-grid">
      {research.families
        .filter((f) => category === "All" || f.category === category)
        .map((f) => (
          <article className="family-card" key={f.id}>
            <span className="eyebrow">{f.category}</span>
            <h3>
              <Jump area="explore" family={f.id} region={region}>
                {f.title}
              </Jump>
            </h3>
            <span className="outcome">{f.outcome}</span>
            <p>{f.conclusion}</p>
            <Jump area="explore" family={f.id} region={region}>
              Explore the evidence
            </Jump>
          </article>
        ))}
    </div>
  );
}
function Catalogue({ region }: { region: Region }) {
  const [category, setCategory] = useState("All");
  return (
    <>
      <Intro eyebrow="Explore families" title="Start with the product.">
        <p>
          Follow commercial identity into the nutritional finding and the communication evidence.
          Soda, biscuits and dessert creams/puddings are the three featured research cases with
          detailed interactive pages. The wider research retained five descriptive nutritional
          profiles; other families appear in the broader summaries and accepted decision register
          below.
        </p>
      </Intro>
      <h2 className="featured-heading">Featured research cases</h2>
      <div className="category-tabs" role="group" aria-label="Category filter">
        {["All", "Beverages", "Snacks", "Dairy", "Cereals"].map((c) => (
          <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {category === "Cereals" ? (
        <div className="callout">
          <h2>Cereals in the accepted research</h2>
          <p>
            A granola profile is retained; flakes show commercial distinctions and nutritional
            variation. A detailed cereal page is outside this presentation scope.
          </p>
        </div>
      ) : (
        <FamilyCards region={region} category={category} />
      )}
      <section>
        <div className="section-heading">
          <h2>The wider decision register</h2>
          <p>
            Accepted outcomes beyond the three detailed pages. Uninvestigated formats retain their
            own status.
          </p>
        </div>
        <div className="decision-list">
          {research.catalogue.map((d) => (
            <details key={d.branch}>
              <summary>
                <span>{d.branch}</span>
                <span className="decision-label">{d.decision}</span>
              </summary>
              <p>{d.scope_note}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
function FamilyPage({ family, region }: { family: Family; region: Region }) {
  const p = family.regions.find((r) => r.region === region);
  if (!p)
    return <div role="status">No accepted evidence is supplied for this family and geography.</div>;
  return (
    <>
      <Intro
        eyebrow={`${family.category} / ${regions[region]} / ${family.basis}`}
        title={
          family.id === "soda"
            ? "Soda: very-low-sugars formulations"
            : family.id === "biscuit"
              ? "Biscuits: variation within a format"
              : "Creams & puddings: protein and energy"
        }
      >
        <span className="outcome">{family.outcome}</span>
        <p>{family.conclusion}</p>
      </Intro>
      {region === "US-CA" && (
        <aside className="caution" role="note">
          <strong>Exploratory measurement subset.</strong> US/Canada coverage is low and selected.
          These figures do not estimate regional profile prevalence.
          {family.id === "pudding" &&
            " Only one assignment qualifies; nutritional interpretation is withheld."}
        </aside>
      )}
      <nav className="section-links" aria-label="On this page">
        <a href="#population">Population</a>
        <a href="#nutrition">Nutrition</a>
        <a href="#communication">Communication</a>
        <a href="#evidence">Evidence details</a>
      </nav>
      <section id="population">
        <div className="section-heading">
          <h2>Which observations support this finding?</h2>
          <p>Counts are regional/category assignments, not unique worldwide products.</p>
        </div>
        <Population p={p} family={family} />
      </section>
      <section id="nutrition">
        <div className="section-heading">
          <h2>
            {family.id === "biscuit"
              ? "Similar sugars, different nutritional composition"
              : "The retained nutritional profile"}
          </h2>
          <p>{family.rule}</p>
        </div>
        {family.id === "biscuit" ? (
          <BiscuitNutrition p={p} />
        ) : family.id === "pudding" ? (
          <PuddingNutrition p={p} />
        ) : (
          <div className="finding-panel">
            <p className="large-number">
              ≤0.5 <span>g sugars / 100 ml</span>
            </p>
            <p>
              This descriptive threshold identifies {number(p.profile!)} of {number(p.measurable)}{" "}
              measurable soda assignments in {regions[region]}. It is not a legal sugar-free claim
              assessment.
            </p>
            <p>
              Other measurable sodas remain the nutritional comparator. Products without the
              required valid sugar measurement are outside both measurable arms.
            </p>
          </div>
        )}
      </section>
      <section id="communication">
        <div className="section-heading">
          <h2>What does assessed packaging communicate?</h2>
          <p>Each proposition has its own known denominator.</p>
        </div>
        <Communication family={family} p={p} />
      </section>
      <section id="evidence">
        <Evidence family={family} p={p} />
      </section>
      <div className="related">
        <h2>Continue exploring</h2>
        {research.families
          .filter((f) => f.id !== family.id)
          .map((f) => (
            <Jump key={f.id} area="explore" family={f.id} region={region}>
              {f.title}
            </Jump>
          ))}
      </div>
    </>
  );
}
function Population({ p, family }: { p: FamilyPopulation; family: Family }) {
  const counts: [string, number][] = [
    ["Relevant assignments", p.population],
    [
      family.id === "biscuit" ? "Valid fat, sugars, protein & salt" : "Required measurements valid",
      p.measurable,
    ],
    ["Required measurements unavailable", p.unknown],
  ];
  if (p.profile !== undefined)
    counts.push(["In the retained profile", p.profile], ["Other measurable products", p.other!]);
  return (
    <>
      <dl className="population-grid">
        {counts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{number(value)}</dd>
          </div>
        ))}
      </dl>
      <p className="caption">
        Measurable + unavailable = starting population.
        {p.profile !== undefined && " Profile + other measurable = measurable population."} These
        nested counts must not be added together.
      </p>
    </>
  );
}
function BiscuitNutrition({ p }: { p: FamilyPopulation }) {
  return (
    <>
      <div className="finding-panel">
        <p>
          <strong>{number(p.pairs!)} matched pairs</strong>, within construction wording and a
          maximum sugars gap of 2 g/100 g, with no product reused within the comparison.
        </p>
        <div className="table-scroll">
          <table>
            <caption>Median absolute difference between matched biscuits</caption>
            <thead>
              <tr>
                <th scope="col">Nutrient</th>
                <th scope="col">Difference, g/100 g</th>
              </tr>
            </thead>
            <tbody>
              {p.metrics!.map((m) => (
                <tr key={m.label}>
                  <th scope="row">{m.label}</th>
                  <td>{formatMetric(m.value, m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="caption">
          Separate median absolute paired differences. The values do not describe one typical pair,
          a recipe change or population nutrient medians.
        </p>
      </div>
      <details>
        <summary>Why no additional named profile?</summary>
        <p>
          Independent checks did not support a robust recurring three-nutrient boundary. Exploratory
          percentile screens were sensitive to their cutoffs and remain audit evidence, not named
          segments.
        </p>
        <p>
          Coating and filling wording explain part of the variation. “Unspecified” does not
          establish that coating or filling is absent. Wafers remain a distinct format with
          insufficient evidence for a repeatable nutritional split.
        </p>
      </details>
    </>
  );
}
function PuddingNutrition({ p }: { p: FamilyPopulation }) {
  return (
    <>
      <aside
        className="callout pudding-evidence-warning"
        role="note"
        aria-labelledby="pudding-evidence-warning"
      >
        <h3 id="pudding-evidence-warning">
          Nutritional profile retained; packaging evidence is limited.
        </h3>
        <p>
          There is too little assessed evidence to characterize protein communication for this
          profile.
        </p>
      </aside>
      <div className="finding-panel">
        {p.metrics ? (
          <div className="table-scroll">
            <table>
              <caption>Nutritional medians · per 100 g</caption>
              <thead>
                <tr>
                  <th scope="col">Measurement</th>
                  <th scope="col">Profile median</th>
                  <th scope="col">Other measurable median</th>
                </tr>
              </thead>
              <tbody>
                {p.metrics.map((m) => (
                  <tr key={m.label}>
                    <th scope="row">
                      {m.label} ({m.unit})
                    </th>
                    <td>{formatMetric(m.value, m)}</td>
                    <td>{m.other === undefined ? "Not supplied" : formatMetric(m.other, m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            No profile medians are presented for this single US/Canada qualifier: the sample is too
            small for interpretation.
          </p>
        )}
        <p>
          Comparator medians are supplied only for protein and sugars in the accepted summary. This
          is a descriptive convention, not an established natural cluster. Nutritional eligibility
          does not depend on protein wording in the name or packaging claims.
        </p>
      </div>
      <details>
        <summary>Commercial identity and regional mix</summary>
        <p>
          Only identifiable dessert creams and puddings enter this comparison. Unspecified,
          conflicting and comparability-concern dairy desserts remain in the broader population;
          nutrients do not assign their format.
        </p>
        <p>
          The captured French and UK/Irish populations have different mixes of crème dessert and
          pudding wording. Observed profile percentages do not establish market prevalence.
        </p>
        <p>
          Per-weight protein and protein per calorie answer different questions. Zero-energy density
          ratios remain undefined. Mousse and flan have separate within-format findings.
        </p>
      </details>
    </>
  );
}

function Communication({ family, p }: { family: Family; p: FamilyPopulation }) {
  if (family.id === "biscuit")
    return (
      <div className="callout">
        <h3>No communication comparison supplied for this finding</h3>
        <p>
          The biscuit result concerns matched nutritional variation. No new claim-based groups or
          claim prevalence are inferred from it.
        </p>
      </div>
    );
  if (family.id === "soda" && p.region === "UK-IE") {
    const c = research.sodaContrast;
    return (
      <>
        <div className="finding-panel">
          <span className="outcome">Supported selected-assessment comparison</span>
          <h3>Sugar-related communication</h3>
          <ComparisonBar
            label="Very-low-sugars profile"
            positive={c.positiveProfile}
            known={c.knownProfile}
            population={c.populationProfile}
          />
          <ComparisonBar
            label="Other measurable sodas"
            positive={c.positiveOther}
            known={c.knownOther}
            population={c.populationOther}
          />
          <p>
            <strong>{formatMetric(c.effect * 100, { decimals: 1 })} percentage points</strong>{" "}
            difference among selected known assessments.
          </p>
          <p className="caption">
            “Sugar-related communication” includes saved no-added-sugar and sugar-free wording.
            These selected assessments do not estimate communication prevalence across all sodas.
          </p>
        </div>
        <details>
          <summary>Statistical context and wording exception</summary>
          <p>
            Saved 95% bootstrap interval for the difference:{" "}
            {formatMetric(c.lo * 100, { decimals: 1 })}–{formatMetric(c.hi * 100, { decimals: 1 })}{" "}
            percentage points. This interval does not account for representativeness of the selected
            packaging sample.
          </p>
          <p>
            The locked sugar_free_claim field includes no-added-sugar wording. A reviewed Cloudy
            Lemonade exception has 3.3 g sugars/100 ml and saved no-added-sugar wording. The result
            is not literal sugar-free claim prevalence.
          </p>
        </details>
        <Coverage p={p} proposition={family.proposition!} />
        {p.otherCommunication && (
          <Coverage
            p={{ ...p, communication: p.otherCommunication }}
            proposition={family.proposition!}
            scope="Other measurable"
          />
        )}
      </>
    );
  }
  return (
    <>
      <div className="callout">
        <span className="outcome">Insufficient assessed evidence for comparison</span>
        <h3>{family.proposition}</h3>
        <p>
          {number(p.communication!.known)} proposition-known assessments among{" "}
          {number(p.communication!.population)} profile assignments. Sparse evidence cannot
          characterize the remaining products or erase their nutritional profile.
        </p>
        {family.id === "pudding" && p.region === "UK-IE" && (
          <p>
            The one known observation is positive; 14 profile assignments are unassessed. No
            headline percentage is presented.
          </p>
        )}
      </div>
      <Coverage p={p} proposition={family.proposition!} />
      {p.otherCommunication && (
        <Coverage
          p={{ ...p, communication: p.otherCommunication }}
          proposition={family.proposition!}
          scope="Other measurable"
        />
      )}
      <p className="caption">
        Human observations, where available, are separate qualitative evidence. They do not change
        the locked assessment denominator.
      </p>
    </>
  );
}
function ComparisonBar({
  label,
  positive,
  known,
  population,
}: {
  label: string;
  positive: number;
  known: number;
  population: number;
}) {
  return (
    <div className="comparison-bar">
      <div>
        <strong>{label}</strong>
        <span>
          {positive} / {known} proposition-known · {population} relevant assignments
        </span>
      </div>
      <div className="bar-track" aria-hidden>
        <div style={{ width: `${(100 * positive) / known}%` }} />
      </div>
    </div>
  );
}
function Coverage({
  p,
  proposition,
  scope = "Profile",
}: {
  p: FamilyPopulation;
  proposition: string;
  scope?: string;
}) {
  const c = p.communication!;
  const rows: [string, number][] = [
    ["Relevant population", c.population],
    ["Matched eligible assessments", c.matched],
    ["Usable market evidence", c.usable],
    ["Proposition-known", c.known],
    ["Positive", c.positive],
    ["Documented non-detection", c.nonDetection],
    ["Separate human negative", c.humanNegative],
    ["Uncertain", c.uncertain],
    ["Other assessed unknown", c.otherUnknown],
    ["Unassessed", c.unassessed],
    ["Market-limited", c.marketLimited],
  ];
  return (
    <details>
      <summary>
        {scope} evidence coverage: {proposition.toLowerCase()}
      </summary>
      <dl className="coverage-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{number(value)}</dd>
          </div>
        ))}
      </dl>
      <p>
        Known = positive + documented non-detection. These figures include nested populations; do
        not sum every row. A missing match or an assessment of another proposition is not a negative
        finding.
      </p>
    </details>
  );
}
function Evidence({ family, p }: { family: Family; p: FamilyPopulation }) {
  return (
    <details>
      <summary>Population and evidence</summary>
      <p>
        <strong>Counting unit:</strong> {research.release.unit}. A barcode can legitimately have
        separate assignments across regions or categories.
      </p>
      <p>
        <strong>Measurements:</strong>{" "}
        {family.id === "biscuit"
          ? "Fat, sugars, protein and salt for the accepted pair comparison."
          : family.id === "soda"
            ? "Valid sugars on the accepted comparable-liquid basis."
            : "Valid protein and energy on the accepted comparable-food basis."}{" "}
        Missing, invalid and measured-zero values remain distinct.
      </p>
      <p>
        <strong>Interpretation:</strong> commercial identity is derived from textual evidence, not
        independently verified packaging identity. Nutrition and communication use independent
        eligibility rules.{" "}
        {p.region === "US-CA"
          ? "US/Canada remains exploratory."
          : "Observed products are not a representative market census."}
      </p>
      <p>
        <strong>Source selection:</strong>{" "}
        {family.id === "biscuit"
          ? "BISCUIT_REPORT: Format and nutrient coverage; Similar-sugar pair differences, all/matched within wording."
          : `population_summary: approved profile / ${family.id === "soda" ? "soda" : "dessert cream/pudding"} / ${p.region}. Communication: accepted cohort / retained profile / exact proposition.`}
      </p>
      <Jump area="method">Release lineage and source identities</Jump>
    </details>
  );
}
function Insights({ region }: { region: Region }) {
  return (
    <>
      <Intro eyebrow="Research insights" title="Read across the evidence.">
        <p>
          Selected accepted findings connect nutritional formulation, commercial identity and
          communication. Each conclusion remains bounded by its own population.
        </p>
      </Intro>
      <div className="insight-list">
        {research.families.map((f) => (
          <article key={f.id}>
            <span className="outcome">{f.outcome}</span>
            <h2>
              {f.id === "soda"
                ? "Communication can align with formulation"
                : f.id === "biscuit"
                  ? "Similar sugars can conceal other differences"
                  : "A nutritional profile can outpace its evidence coverage"}
            </h2>
            <p>{f.conclusion}</p>
            <Jump area="explore" family={f.id} region={f.id === "soda" ? "UK-IE" : region}>
              Read the {f.title.toLowerCase()} finding
            </Jump>
          </article>
        ))}
      </div>
      <section>
        <h2>Complementary lenses</h2>
        <div className="layer-grid">
          <article>
            <h3>Nutrient density</h3>
            <p>
              Per-weight and per-calorie protein can change interpretation within dairy-dessert
              formats. Neither denominator is a universal nutritional ranking.
            </p>
          </article>
          <article>
            <h3>Organic & recorded processing</h3>
            <p>
              The accepted French muesli result is a conditional association among selected jointly
              known organic/NOVA observations. It establishes neither healthfulness nor causality.
            </p>
          </article>
          <article>
            <h3>Commercial boundaries</h3>
            <p>
              Juice composition and potato-snack construction can explain apparent differences.
              Bounded analytical interpretations preserve source categories and unresolved
              identities.
            </p>
          </article>
        </div>
        <p className="caption">
          These contextual lenses summarize accepted research. Detailed interactive pages are
          outside this three-family presentation.
        </p>
      </section>
    </>
  );
}
function Method() {
  return (
    <>
      <Intro eyebrow="Method & evidence" title="Know what supports the conclusion.">
        <p>
          We can tolerate uncertainty in observations, but not uncertainty about which observations
          support a conclusion.
        </p>
      </Intro>
      <div className="method-grid">
        <section>
          <h2>Scope and release</h2>
          <p>
            Wave 2 was retrieved on {research.release.retrieved}, with a {research.release.cutoff}{" "}
            reporting cutoff. The cutoff is not a reconstruction of every source value on that date.
            Wave 3 is excluded.
          </p>
          <p>
            The wider master contains 374,840 governed products represented by 382,527
            regional/category assignments; 376,845 assignments are product-scope eligible. This
            website presents selected findings, not every record.
          </p>
          <h2>Three independent decisions</h2>
          <p>
            <strong>Identity:</strong> names and OFF tags support commercial interpretation.
            HIGH/MEDIUM confidence describes textual support, not independently verified package
            identity.
          </p>
          <p>
            <strong>Formulation:</strong> each approved question requires its own valid
            measurements. The five retained profiles are descriptive rules; the completed pooled k=5
            control is a methodological reference.
          </p>
          <p>
            <strong>Communication:</strong> selected assessed evidence is proposition-specific.
            Nutrition, names and a missing evidence match cannot supply a claim decision.
          </p>
        </section>
        <section>
          <h2>Reading counts and uncertainty</h2>
          <p>
            Assignments, products, matched pairs and assessments are distinct units. Nested and
            overlapping cohorts must not be added as unique totals.
          </p>
          <p>
            Missing nutrition is never zero. Per-calorie ratios with zero energy are undefined. Food
            and comparable beverage bases remain per 100 g and per 100 ml respectively; preparations
            with unverified bases remain deferred.
          </p>
          <p>
            Positive and documented non-detection form the primary known claim denominator.
            Uncertain, other unknown, unassessed, market-limited and separate human observations
            remain distinct.
          </p>
          <p>
            Uninvestigated formats differ from research that found continuous variation or
            insufficient evidence for subdivision. Alcohol is outside nutritional segmentation
            scope.
          </p>
          <h2>Limits of inference</h2>
          <p>
            Open Food Facts is crowdsourced and unevenly covered. Counts do not establish sales,
            distribution, demand or market share. Selected pack assessments do not estimate regional
            communication prevalence. No result establishes legal claim compliance or a
            healthfulness ranking.
          </p>
        </section>
      </div>
      <section aria-labelledby="research-evidence">
        <h2 id="research-evidence">Research evidence</h2>
        <p>
          Detailed methodology, accepted findings and evidence limitations are available in the
          project's research audit.
        </p>
        <a
          className="text-link"
          href="https://github.com/julialenc/food-beverage-positioning-radar/blob/main/presentations/segmentation/first_run/03_lenses/AUDIT_v1.md"
        >
          Research methodology and supporting evidence on GitHub
        </a>
      </section>
    </>
  );
}

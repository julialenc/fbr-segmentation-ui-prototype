# F&B Positioning Radar - research presentation

Local React/TypeScript presentation of accepted Wave 2 research. Navigation: Overview, Explore families, Research insights, Method & evidence. Featured research cases with detailed interactive pages: soda, biscuits, dessert creams/puddings. The wider accepted research retained five descriptive nutritional profiles; not every investigated family has a detailed interactive view. Other families remain in broader research summaries and the accepted decision register. Family and geography are shareable URL parameters.

Live website: [F&B Positioning Radar](https://segmentation-food-beverage-radar.lovable.app/). Public access requires no Lovable account.

## Run and validate

Bun is the canonical package manager. Use the tracked `bun.lock` and existing `bunfig.toml` to install reproducibly; do not regenerate the lockfile during release validation. Bun 1.4.5 was used for the isolated validation recorded below. Node.js is also required for the existing toolchain.

From the website directory, use a clean checkout or isolated copy for installation validation:

```powershell
bun install --frozen-lockfile
bun run test
node ./node_modules/typescript/bin/tsc --noEmit
bun run build
```

For local development, run `bun run dev -- --host 127.0.0.1` and leave the terminal running.

The local, untracked `package-lock.json` is not part of the release. Preserve it locally, but do not stage or publish it alongside `bun.lock`. The previously installed npm dependency tree differs from the Bun-locked tree; the isolated validation below specifically verifies the Bun-locked dependencies.

No deployment is implied. The retained build wrapper uses @lovable.dev/vite-tanstack-config; the research module has no backend or AI calls.

## Accepted presentation export

src/data/accepted-presentation.json contains selected aggregates, accepted narrative and source hashes. Report data enters through parseReport and its validated research extension. No product-level Parquets, GTINs, images or raw model payloads are bundled. Legacy comparison components and synthetic fixtures remain separate development references.

Reconcile the export without writes:

```powershell
python -B scripts/export-presentation.py --analytical-root ../food-beverage-positioning-radar --check
```

Omit --check only to regenerate the UI JSON. The exporter verifies every frozen package file, reads accepted CSV/JSON/report tables and writes only the UI export. It never runs research. The analytical checkout needs its declared local inputs. Pair-summary and pudding-median tables come from explicit accepted report sections, with source hashes recorded.

Counts represent assignments or explicitly labelled pairs. Nested populations are not additive. Formulation and communication outcomes remain independent. US/Canada is exploratory. Local validation is separate from deployment compatibility.

## Local validation - 22 November 2026

### Isolated Bun-lockfile validation

- A temporary website source copy excluded the original dependency tree, generated build output and `package-lock.json`. Portable Bun 1.4.5 used a separate temporary dependency cache.
- `bun install --frozen-lockfile`: PASS; `bun.lock` remained byte-identical to the original.
- `bun run test`: PASS, 22 tests across four files.
- `node ./node_modules/typescript/bin/tsc --noEmit`: PASS.
- `bun run build`: PASS, producing the retained Cloudflare-module Worker and assets. Existing tsconfig-path and inlineDynamicImports warnings remained non-blocking.
- All 97 copied source/configuration files matched the prototype after validation. The original development server and installed dependencies were untouched; the preserved test copy stayed clean.
- The accepted presentation JSON retained SHA-256 `02fec73ce8beb78d197a3d08d1c56c9d8377b7ad515c4807ee8f87e8687d3762`. Frozen analytical integrity passed with the unchanged release digest.

This isolated check validated local reproducibility with the existing Bun lockfile and made no commit, push or deployment. Hosted verification was subsequently completed as recorded below.

### Earlier local and browser checks

- TypeScript no-emit check: PASS.
- Vitest: 22 tests across four files PASS, including legacy formatting/routing checks, population/claim validation, all four navigation areas, three families across all three regions, selected soda wording, sparse pudding treatment and comparator summaries.
- Local production build: PASS (retained Cloudflare-module template). Existing tsconfig-path and inlineDynamicImports warnings are non-blocking.
- Export --check: PASS against exact accepted aggregates and source hashes.
- Frozen analytical verifier: PASS, unchanged release digest. All 143 pre-implementation files in the analytical package and preserved test tree (excluding Git/dependency directories) remain byte-identical; test working tree stays clean.
- Browser: desktop overview, soda geography change and 28/43 versus 1/43 communication; biscuit pair table; pudding sparse evidence at 390px; category filtering; insights; methodology. No browser console errors observed. Mobile method/pudding checks showed no horizontal document overflow.

The preview server was used only for local QA. No deployment, commit, push, provider request or research rerun occurred. This validates the existing local template; another host requires its own compatibility check.

Layout refinement: hero reduced from about 581px to 446px at 1366x768; the next research section starts around 646px. Updated the overview heading/subtitle and labelled detailed pages as Featured research cases, distinct from the wider five-profile research. Existing 22 tests pass; mobile 390px layout checked with no horizontal document overflow. Build adapter and analytical data unchanged.

## Public release verification - 22 November 2026

Julia published the approved website update after source commit `67d181a99b5ded64a71c8afc53c14a1f2b8de394`. The ten-step release checklist is complete; the research-payload, asset and runtime checks deferred from the authenticated preview were completed against the public URL.

- Public access: PASS in a browser without Lovable authentication. Preview authentication is separate from public website access.
- Saved soda and pudding URLs: PASS; UK/Ireland family/geography selections survived refresh on the public site.
- Navigation: PASS for all four navigation areas, the hero CTA and all six Explore the evidence links across Overview and Explore families.
- Evidence presentation: PASS; UK/Irish soda shows 28/43 versus 1/43 as selected proposition-known assessments, with full populations and the prevalence limitation. The pudding packaging-evidence warning is prominent; sparse evidence is not presented as a headline percentage.
- Source attribution: PASS; Method & evidence identifies Open Food Facts, 17 October 2026 retrieval, 29 September 2026 reporting cutoff and evidence limitations. The single GitHub research-audit link opens publicly; the footer includes OFF attribution and ODbL.
- Responsive review: Julia's physical-phone review passed. Public-site checks at 390 x 844 found no horizontal document overflow in biscuit/pudding tables or methodological text.
- Hosted data identity: PASS; the full research object embedded in the public JavaScript deeply equals `src/data/accepted-presentation.json`. The export SHA-256 remains `02fec73ce8beb78d197a3d08d1c56c9d8377b7ad515c4807ee8f87e8687d3762`; the accepted analytical release digest remains `48212697d2d245e3cc543032d63699b7e83fb43ad5db8dce7cbb8714991f0557`.
- Build identity and assets: PASS; both public application JavaScript assets and the main stylesheet returned HTTP 200 and were byte-identical to the isolated Bun-validated production build. The research data is embedded in the build, not served as a separate JSON file; the website needs no local analytical checkout at runtime.
- Browser runtime: no application console errors observed during the tested flows.

These are checks of the published release at the time recorded, not continuous monitoring. Public verification changed no source files, analytical data or publication settings. The preserved test copy remained untouched.

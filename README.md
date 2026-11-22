# F&B Positioning Radar - research presentation

Local React/TypeScript presentation of accepted Wave 2 research. Navigation: Overview, Explore families, Research insights, Method & evidence. Featured research cases with detailed interactive pages: soda, biscuits, dessert creams/puddings. The wider accepted research retained five descriptive nutritional profiles; not every investigated family has a detailed interactive view. Other families remain in broader research summaries and the accepted decision register. Family and geography are shareable URL parameters.

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

This validates local reproducibility with the existing Bun lockfile. The actual Lovable-hosted build and deployed behavior still require verification. No commit, push or deployment occurred.

### Earlier local and browser checks

- TypeScript no-emit check: PASS.
- Vitest: 22 tests across four files PASS, including legacy formatting/routing checks, population/claim validation, all four navigation areas, three families across all three regions, selected soda wording, sparse pudding treatment and comparator summaries.
- Local production build: PASS (retained Cloudflare-module template). Existing tsconfig-path and inlineDynamicImports warnings are non-blocking.
- Export --check: PASS against exact accepted aggregates and source hashes.
- Frozen analytical verifier: PASS, unchanged release digest. All 143 pre-implementation files in the analytical package and preserved test tree (excluding Git/dependency directories) remain byte-identical; test working tree stays clean.
- Browser: desktop overview, soda geography change and 28/43 versus 1/43 communication; biscuit pair table; pudding sparse evidence at 390px; category filtering; insights; methodology. No browser console errors observed. Mobile method/pudding checks showed no horizontal document overflow.

The preview server was used only for local QA. No deployment, commit, push, provider request or research rerun occurred. This validates the existing local template; another host requires its own compatibility check.

Layout refinement: hero reduced from about 581px to 446px at 1366x768; the next research section starts around 646px. Updated the overview heading/subtitle and labelled detailed pages as Featured research cases, distinct from the wider five-profile research. Existing 22 tests pass; mobile 390px layout checked with no horizontal document overflow. Build adapter and analytical data unchanged.

# ATLAS execution checkpoint

Branch: feat/atlas-country-packs. Baseline: a4a5af7ec69fda5021acfde68ed7d55a3306c601 (latest main at start, identical to research baseline).

## M1 audit

- Read repository AGENTS.md and CLAUDE.md; the repository still duplicates these files. This change does not alter that unrelated CI contract.
- Unpacked the supplied research ZIP read-only; KR/CA/GB/JP research scope is superseded by the user's KR/CA/GB/NZ implementation scope. Original JP research remains intact.
- Existing application: src/js/app.js boot/controller; state.js single state tree; airport presets are Korean only; i18n UI locale is independent of interview language. No existing country registry.
- Queue/case/legal engines are Korean-specific; no overseas case may enter these paths. Documents and four-zone task navigation are reusable presentation foundations.
- save-engine owns legacy keys, schema-1 portable bundles, validation and rollback. New overseas state will use an additive key and strict jurisdiction validation, never reuse Korean progress/career keys.
- Build inlines source CSS/ESM/assets into dist/index.html and root index.html. Legacy remains frozen. CI runs lint, unit, integrity, dist E2E, legacy parity, and source core flows.
- npm ci: passed, 0 vulnerabilities. Initial npm run qa: lint/unit/build/integrity passed; browser tests could not launch because Playwright Chromium was missing. Installed required browser and reran baseline E2E before source changes.
- In-app browser acquisition timed out twice. Use repository Playwright for requested actual browser testing and screenshots.
- iCloud immediately offloaded checkout files in Documents, blocking reads. Active local checkout moved to /private/tmp/inad-atlas-20261028; preserve work in remote branch and output bundle before handoff.

## Plan / remaining milestones

M2 registry + isolated deterministic simulation engine; M3 additive session persistence + legacy/future/import guards; M4 country selection and setup; M5 records/tasks/activities composition; M6 one-DOM Counter/System focus; M7 nine synthetic cases; M8 official procedural references and explicitly unverified legal outcomes; M9 responsive/keyboard/contrast/focus tests; M10 regression, documentation, screenshots, branch and PR.

## Design contract

Use existing semantic tokens, system fonts, one set of four zone nodes. Preserve Korean child nodes while the overseas renderer occupies the zones. International progress belongs under state.atlas. Records-first CA, tasks-first GB, activities-first NZ are information architecture differences, not country colors. No real government UI or API claims. All overseas outcomes are SIMULATION_RULE, not legal dispositions. Design source: supplied 07/08 specifications, with NZ derived separately from INZ A16.3 and notes guidance.

## Delivery checkpoint · 2026-10-29

Source commits:
- `77b07d1`: country packs, nine fixtures, isolated engine, additive storage and legacy guards.
- `52a62d7`: selection/setup, country workstations, shared Counter/System, browser tests and size-preserving build optimization.

M2–M7 implemented: four explicit countries; overseas settings; three playable cases per foreign country; record/task/activity layouts; state-preserving transitions; recoverable drafts and import/export. KR frozen case/legal data and legacy assets unchanged.

M8: official CA/GB/NZ procedural pages retrieved and version/effective-date boundaries recorded. UK Schedule 2 retrieved through plain HTML after web-tool XHTML failure. NZ Act access returned 403. No overseas legal dispositions are enabled.

M9: desktop/tablet/mobile Chromium flows, keyboard focus, target size, overflow, contrast and accessibility settings checked; 17 screenshots. Editable desktop Figma references added on a separate page. Existing global token drift and editable tablet/mobile Figma variants are documented follow-ups.

M10: `INAD_PORT=4274 npm run qa` passed (158 unit, 10 integration, 129 browser tests). Legacy parity 19 passed / 107 skipped. Source core+ATLAS 37 passed, then expanded ATLAS source 21 passed. Korean lint: 0 findings. Detailed commands and repaired failures: TEST_REPORT.md.

No merge or production deployment performed. Branch is `feat/atlas-country-packs`; original research ZIP remains unchanged. The active checkout is `/private/tmp/inad-atlas-20261028`; final standalone HTML and a Git bundle will also be copied into the task's outputs directory.

### Exact continuation

1. Fetch/check out `feat/atlas-country-packs` from `club-paradiso/inad` (or clone the delivered Git bundle). Read AGENTS.md and docs/atlas/KNOWN_LIMITATIONS.md.
2. Run `npm ci`, `npx playwright install chromium`, then `INAD_PORT=4274 npm run qa` (choose a free port if occupied). Do not reuse an unrelated server.
3. For review preview, run `npm run dev` and open http://127.0.0.1:4175. Select Country from the start screen or the Korean menu.
4. Address review feedback. Remaining priorities are legal validation, assistive technology/cross-browser checks, richer overseas scenarios, multi-tab conflict protection and global Figma token reconciliation. Keep all unverified outcomes SIMULATION_RULE.
5. Do not merge or deploy without a new explicit instruction.

Review PR: https://github.com/club-paradiso/inad/pull/21 (draft). Delivery source head: `d3ab9a6`; the following checkpoint-only commit records this link. Rebuilding after the commit reproduced root `index.html` exactly (`git diff --exit-code -- index.html`, exit 0).

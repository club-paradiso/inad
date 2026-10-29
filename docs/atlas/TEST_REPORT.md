# ATLAS verification report

Executed on macOS / Chromium, 2026-10-29. Source baseline `a4a5af7ec69fda5021acfde68ed7d55a3306c601`; latest remote main was re-fetched and still matched before delivery.

| Command | Actual result |
|---|---|
| `npm ci` (baseline) | Passed; 0 vulnerabilities |
| `INAD_PORT=4274 npm run qa` (final) | **Passed**: lint 88 modules / 62 tooling files; 158 unit tests; build; 10 integrity tests; **129 browser tests**, 4.5 minutes |
| `INAD_TARGET=legacy INAD_PORT=4374 npm run test:e2e:legacy` | **19 passed**, 107 intentionally skipped (newer features do not exist in frozen v6.1) |
| `INAD_TARGET=src INAD_PORT=4475 npx playwright test tests/e2e/flows-primary.spec.js tests/e2e/flows-special.spec.js tests/e2e/a11y-structure.spec.js tests/e2e/atlas.spec.js` | **37 passed** (before the three final recovery/contrast tests were added) |
| `INAD_TARGET=src INAD_PORT=4476 npx playwright test tests/e2e/atlas.spec.js` | **21 passed**, including the additional export/import, quota-failure recovery, locale choice, settings and hover contrast checks |
| `INAD_PORT=4274 ATLAS_SCREENSHOTS=/private/tmp/inad-atlas-evidence npx playwright test tests/e2e/atlas.spec.js` | **21 passed** on the rebuilt artifact; captured overseas 1440/1024/768/390 screenshots |
| `node ~/dev/korean-language-quality/bin/kolint.mjs --genre ux src/data/country-packs.js src/data/atlas-scenarios.js src/js/ui/atlas-workstation.js` | 0 units with findings; 0 blocking findings |
| `npm audit --omit=dev` | 0 vulnerabilities; no new runtime dependencies |
| `git diff --exit-code -- legacy/v6.1 src/js/engines/legal-engine.js src/js/engines/case-engine.js src/data/cases.js src/styles/tokens.css` | Exit 0: protected baseline files unchanged |
| `git diff --check -- src scripts tests package.json package-lock.json` | Exit 0 |

The release is **1,729,541 bytes**, below the unchanged 15%-over-legacy size ceiling (legacy 1,514,881 bytes). All 105 original portraits remain inline and unchanged. Generated root HTML mirrors dist. There are no new browser network call sites.

## New coverage

- Strict country registry, valid airports and unknown/JP/UK rejection.
- All nine overseas cases completed through actual controls, including interview, record lookup, document selection/review, notes, prerequisite tasks, two-step simulated outcome and debrief.
- Counter/System, country confirmation/cancellation, reload, case-specific document page/zoom/search/draft preservation; Korean live-case input preserved on return.
- Legacy missing-country KR migration; foreign markers blocked in legacy slots; independent sessions; malformed/future data byte preservation; bundle validation, rollback and legacy import preservation.
- Export/import through actual file controls; storage-quota error display and recovery-copy download without changing stored original.
- Four viewport widths per overseas country: keyboard focus/dialog return, task navigation, 44px buttons, page overflow. Existing KR adaptive suite additionally covers 320, 430 and short landscape.
- Selected/hovered workspace-focus control measured at ≥4.5:1; high-contrast and reduced-motion settings exercised. Full assistive-technology/cross-browser certification is not claimed.
- Deterministic build-string optimization tested for values, closures, directive/key preservation and token boundaries.

## Failures investigated and repaired

Initial baseline browser runs could not launch because Chromium was absent. After installation, an initial full baseline run was interrupted and is not counted as a pass. A separate pristine-baseline accessibility-structure run later passed 9/9. In-app browser acquisition timed out; Playwright performed the actual browser validation.

Adding the feature initially exceeded the existing artifact-size assertion. CSS minification, unchanged-fixture deduplication and build-only string pooling fixed that without relaxing the test or changing portraits. An early pooling version joined `return` and an identifier, causing Korean result transitions to fail in the built artifact while source passed. Parenthesized token boundaries plus final esbuild serialization fixed it; a regression test was added. Full final QA includes all previously failing paths.

A selected System button had insufficient hover contrast due to inherited action styling. The explicit header hover state and computed contrast test fixed it. Tablet task-selection aria-current and Korean navigation labels on return were also corrected.

## Evidence

`docs/atlas/screenshots/` includes 16 actual country/viewport captures and the country-selection dialog. Figma desktop references are editable hierarchy documentation; exact runtime appearance comes from the screenshots. No screenshots contain real traveler records.

Not executed: Safari/iOS, Firefox, a complete screen-reader audit, independent legal certification. These are limitations, not passing results.

# QA — v9.0 (2026-10-01)

Branch `claude/gracious-bell-ev8lcm`, based on `main` at `c922399`. Every number below was produced in this
session on the commit that carries this file; nothing here is copied from an earlier report.

## Environment
- Node v22.22.0, Playwright Chromium (full browser, `INAD_CHROMIUM_PATH=/opt/pw-browsers/chromium`).
- E2E ran with `INAD_PORT=<free port>` so the suite never reused another server (the config no longer reuses one
  unless `INAD_REUSE_SERVER` is set).
- No public-data key in the environment: every run took the static-preset fallback of `/api/airport-load`,
  which is the deterministic path E2E is meant to use. Live upstream responses were exercised only through
  fixture payloads in `tests/unit/airport-load-api.test.js` (data.go.kr is not reachable from the sandbox).

## Results

| Check | Command | Result | Baseline at `c922399` |
|---|---|---|---|
| Lint | `npm run lint` | 65 modules OK · 41 tooling files parse | 64 modules (tooling not checked) |
| Unit | `npm run test:unit` | **106 / 106** | 47 / 47 |
| Build | `npm run build` | boot contract 86 ids OK · dist 1,522 KB · smoke check OK | boot contract 15 ids |
| Integrity | `npm run test:integrity` | **10 / 10** | 3 / 3 |
| E2E · release (`dist`) | `npx playwright test` | **83 / 83** | 25 / 25 under headless-shell; under full Chromium every test failed on the `/favicon.ico` 404 |
| E2E · v6.1 baseline (`legacy`) | `INAD_TARGET=legacy npx playwright test` | **19 passed · 61 skipped** (v9-only behaviour) | 19 / 19 failed under full Chromium (favicon 404) |
| E2E · dev source (`src`, native ESM) | `INAD_TARGET=src npx playwright test flows-primary flows-special a11y-structure` | **19 / 19** | not run in CI |
| Root mirror | `git diff --exit-code -- index.html` after build | clean | — |

Tests added in this release fail on the previous build and pass on this one. Checked explicitly for the
last two batches: `tests/e2e/a11y-structure.spec.js` 9/9 fail on `984f229`, `tests/e2e/design-invariants.spec.js`
fails on `984f229` (24 semantic-colour hits on non-decision values, briefing queue 49 ≠ top bar 37).

## Viewport sweep
`.dev/shots.mjs` (not committed) walks start → briefing → workspace → interview → evidence → assessment →
procedure → settings at 320×568, 390×844, 430×932, 768×1024 (touch), 1024×768, 1280×800, 1440×1000 and
844×390 (landscape, touch): **0 page errors, 0 console errors/warnings, 0 horizontal overflow** at all eight.
`tests/e2e/adaptive.spec.js` asserts the full workflow, no overflow and 44px touch targets at 320×568, 390×844, 844×390, 430×932, 768×1024, 1024×768, 1366×768 and 1440×1000; `design-invariants.spec.js` adds 1280×800.

Measured interview room (question list height) after the v9 layout changes:

| Viewport | Before | After |
|---|---|---|
| 1024×768 | 18 px (audit) → 44 px | 86 px |
| 1280×800 | 11 px (audit) → 47 px | 93 px |
| 1440×1000 | 103 px | 154 px |

## Verified by hand in the browser (screenshots reviewed)
- 1440×1000 and 1280×800 workstation, 390×844 secondary-inspection procedure screen and settings sheet.
- Text below 10.5 px: none at 320, 390, 1024 or 1440 (computed-style scan of every visible text node).

## Not verified
- Production (`https://inad-gray.vercel.app`) was not re-tested from this branch; it still serves `main`.
- Real iOS/Android devices, screen readers (VoiceOver, TalkBack, NVDA) and Windows High Contrast were not
  used. Accessibility claims rest on the DOM/ARIA assertions in the E2E suite and on computed styles.
- Figma was not edited (see `docs/figma-workspace-spec.md` §9 for the pending code → Figma sync).
- The live data.go.kr upstream; only recorded fixture shapes.

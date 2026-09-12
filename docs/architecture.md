# Architecture (v8 — adaptive workstation)

```
src/
  index.html                 dev shell (native ES modules; served by `npm run dev`)
  styles/                    Design System v3, one file per responsibility, loaded in this order:
                             tokens (variables ↔ Figma) → reset → shell (chrome rows, breakpoints, ops sheet, task nav) → workspace (four zones per breakpoint)
                             → components (zone contents + touch targets) → documents (paper surfaces) → procedures → modals (desktop dialog / phone sheet) → start → accessibility
  data/                      content only, no logic (cases, travelers, entry-basis, operations, missions, achievements, campaigns, tutorial, legal-baseline)
  assets/portraits/          105 WebP portraits (TRV-0001 … TRV-0106, TRV-0081 unused) — inlined only at build
  js/
    state.js                 the single state tree: `state` (live inspection/game), `session` (seeded roster), `preferences`
    app.js                   controller: flows, dialogs, keyboard, bus subscriptions, `window.INADTest` hook
    engines/                 DOM-free logic
      legal-engine.js        pure verdict functions (validateClear/Refusal/SjpEntry/Investigation/ArrestReview/ArrestExecution/Referral), readiness, evidence, timelines
      case-engine.js         orchestration: initCase, ask, lookup, secondary, decide*, procedureAction, finishCase, shiftComplete, persistCompletedSession
      queue-engine.js        seeded roster (24 normals + 12 core), parties, current()/screeningNo()
      companion-engine.js    party cross-check (context only)
      behavior-engine.js     stress/rapport dialogue layer (never a verdict input)
      language-engine.js     communication gate + interpreter (never a verdict input except 제48조제6항 interpreter rule)
      operation-engine.js    difficulty/scenario/field events/fatigue/workload (never a verdict input)
      clue-engine.js         clue discovery, question dependencies
      score-engine.js        scoring helpers
      achievement-engine.js  career/XP/achievements/daily missions/challenges
      campaign-engine.js     3-day campaigns + linked-case narrative
      save-engine.js         localStorage schemas, migration, portable bundle
      rng.js                 FNV-1a + PRNG + date helpers
    services/                bus (events), storage, audio (Web Audio), diagnostics, portraits,
                             airport-live (same-origin /api/airport-load client), boot-watchdog,
                             ui-enhancements → i18n, work-manual (optional, post-boot)
    ui/                      renderers (no state mutation): shell, passenger-panel, interview-panel, document-workbench, system-panel, decision-desk (touch arming),
                             task-nav (body[data-task] + ops sheet, presentation state only), procedure-screen, start-screen, modals, toast, icons, views/*
scripts/
  build-single-html.js       src → dist/index.html (+ root index.html mirror), esbuild IIFE, inline CSS/JS/WebP
  dev-server.js / static-server.js / lint.js / extract-legacy-data.js (one-off provenance)
tests/
  unit/                      node:test — legal engine, queue determinism, invariants, save/migration, meta engines
  integration/               dist integrity
  e2e/                       Playwright, target = dist | legacy | src | url; adaptive.spec.js walks the full workflow at 390·430·768·1024·1440
legacy/v6.1/                 frozen v6.1 production build (baseline for parity tests)
```

## Data flow
`data` → `engines` mutate `state`/`session` and emit bus events (`changed`, `log`, `ops`, `behavior`, `fieldEvent`, `toast`, `announce`, `sound`, `pulse`, `a11y`, `persistence`, `campaign`) → `ui` renders from state → `app.js` turns engine results (`{ok, penalty, doc, open, finish, …}`) into dialogs and screens.

Engines never touch the DOM (`npm run lint` enforces). UI never changes state directly.

## Boot order
1. `app.js` imports `services/boot-watchdog.js` first. It records early `error`/`unhandledrejection` events and, if `#sessionSeed` is still empty after 4 s, renders a reload notice inside `#startOverlay`.
2. `boot()` runs synchronously on `DOMContentLoaded` (session, UI bindings, start screen).
3. `services/ui-enhancements.js` then loads the optional UI modules (`i18n`, `work-manual`) sequentially via `import()` on a 0 ms timer. Each specifier is a string literal so esbuild inlines them into the release bundle; a failing module only logs a warning and never blocks the core simulator.

Only `app.js` may import `boot-watchdog.js` / `ui-enhancements.js`: `bus.js`, `state.js` and every engine are also loaded under node:test, where `window`/`document` do not exist.

## Adaptive layout
One DOM serves every form factor. The workspace is four zones (`.zone-person`, `.zone-interview`, `.zone-evidence`, `.zone-assessment`); CSS media queries decide how many are visible (≥1024 all, 768–1023 workspace + inspector, <768 one at a time) and `body[data-task]` — set only by `ui/task-nav.js` — selects the visible task on stacked layouts. `task-nav.js` also moves the duty KPI nodes into the operations sheet on phones (`placeWorkload`). Decision buttons arm on the first tap under coarse pointers (`decision-desk.js confirmTouch`) so a single touch never changes the legal stage. See `docs/design-system.md` and `docs/design-workflow.md`.

## Save compatibility
Keys and shapes are identical to v6.1 (`inad-meta-v54` v2, `inad-progress-v54` v1, `inad-campaign-v58` v1, bundle schema 1). `save-engine.migrateMeta/migrateProgress` is the single migration point.

## Build
`npm run build` bundles `src/js/app.js` with esbuild (IIFE, es2020, minified), swaps `services/portrait-data.js` for a generated data-URI map, inlines all stylesheets in document order, and writes `dist/index.html` + root `index.html` with a GENERATED banner. The artifact runs from `file://` with zero external requests; the only network call is the same-origin `/api/airport-load` fetch, which fails safe to the static airport preset. `scripts/check-built-page.js` and `tests/integration/dist-integrity.test.js` verify that the optional UI modules are inlined and no unresolved `import()` remains.

## Local server
`scripts/static-server.js` (used by `npm run dev` and Playwright) routes `/api/airport-load` to the same handler Vercel runs (`api/airport-load.js`). Without `DATA_GO_KR_SERVICE_KEY` the handler answers with its static-preset fallback; `playwright.config.js` blanks the key variables so E2E never reaches the public API.

## Deployment (Vercel)
The Vercel project is Git-linked to this repository; pushes to `main` deploy production (`inad-gray.vercel.app`) and pull requests get preview deployments. `vercel.json` deploys the committed root `index.html` as a static single-file site (no install, no build on Vercel); CI's `verify` job fails when that mirror is stale relative to `npm run build`, so production always equals a verified build.

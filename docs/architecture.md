# Architecture (v7.0)

```
src/
  index.html                 dev shell (native ES modules; served by `npm run dev`)
  styles/                    Design System v2 (tokens → reset → shell → workspace → components → documents → procedures → modals → start → accessibility)
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
    services/                bus (events), storage, audio (Web Audio), diagnostics, portraits
    ui/                      renderers (no state mutation): shell, passenger-panel, interview-panel, document-workbench, system-panel, decision-desk, procedure-screen, start-screen, modals, toast, icons, views/*
scripts/
  build-single-html.js       src → dist/index.html (+ root index.html mirror), esbuild IIFE, inline CSS/JS/WebP
  dev-server.js / static-server.js / lint.js / extract-legacy-data.js (one-off provenance)
tests/
  unit/                      node:test — legal engine, queue determinism, invariants, save/migration, meta engines
  integration/               dist integrity
  e2e/                       Playwright, target = dist | legacy | src
legacy/v6.1/                 frozen v6.1 production build (baseline for parity tests)
```

## Data flow
`data` → `engines` mutate `state`/`session` and emit bus events (`changed`, `log`, `ops`, `behavior`, `fieldEvent`, `toast`, `announce`, `sound`, `pulse`, `a11y`, `persistence`, `campaign`) → `ui` renders from state → `app.js` turns engine results (`{ok, penalty, doc, open, finish, …}`) into dialogs and screens.

Engines never touch the DOM (`npm run lint` enforces). UI never changes state directly.

## Save compatibility
Keys and shapes are identical to v6.1 (`inad-meta-v54` v2, `inad-progress-v54` v1, `inad-campaign-v58` v1, bundle schema 1). `save-engine.migrateMeta/migrateProgress` is the single migration point.

## Build
`npm run build` bundles `src/js/app.js` with esbuild (IIFE, es2020, minified), swaps `services/portrait-data.js` for a generated data-URI map, inlines all stylesheets in document order, and writes `dist/index.html` + root `index.html` with a GENERATED banner. The artifact runs from `file://` with zero network requests.

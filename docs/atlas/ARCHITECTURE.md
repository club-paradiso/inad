# ATLAS architecture

Baseline: `a4a5af7ec69fda5021acfde68ed7d55a3306c601`. Branch: `feat/atlas-country-packs`.
The supplied research's pinned baseline equals main inspected at implementation start.

## Contracts and ownership

`country-packs.js` provides a strict registry (KR, CA, GB, NZ), fictional duty stations, presentation layout, mode, ruleset, terminology and reference IDs. Unknown identifiers return null; `UK` and `JP` are not aliases. Existing Korean airports remain separate from country selection.

`atlas-scenarios.js` contains nine authored bilingual fixtures. Shared document/task structures are constructed once; a deep comparison verified that deduplication preserved all nine original objects. `atlas-engine.js` owns overseas actions, readiness, save validation and completion. It never calls Korean case or legal engines. Country presentation does not determine legal outcomes.

One `state` tree owns the application. `countryId`, `airportId`, UI locale (`inad-locale`), `interviewLanguage`, `sessionMode`, `scenarioId`, and `rulesetVersion` have independent meanings. Overseas session settings and case progress live in `state.atlas.sessions[countryId]`. Each case has independent question IDs, document review, page/zoom, search, selected record, tasks, notes, outcome and rationale. The shared `state.atlas.view` chooses Counter/System presentation.

The existing four zone DOM elements remain the workspace. On leaving KR, their child nodes are detached and retained, preserving listeners and input/document state. On returning, those exact nodes are restored. Foreign content replaces the children of the same zones. There is no second application or duplicate game state. `task-nav.js` remains the only writer of `body[data-task]`. Counter/System use CSS composition plus the existing task navigator.

Korean current-case continuity across countries is in-tab; reload uses the existing Korean checkpoint semantics. Foreign drafts restore on reload. Existing start, queue, interview and frozen law/case modules remain the Korean implementation.

## Persistence

Existing keys and versions are retained: `inad-meta-v54` v2, `inad-progress-v54` v1, `inad-campaign-v58` v1, `INAD_SAVE_BUNDLE` schema 1, `inad-airport`, `inad-locale`. Additive keys: `inad-country` and `inad-atlas-v1` (version 1).

Only legacy-shaped data without foreign markers defaults to KR. Explicit foreign/unknown countries, SIM-* case IDs, overseas airport IDs and ATLAS rulesets are rejected from legacy slots. Overseas sessions always require explicit country and matching scenario, airport, ruleset, documents and task IDs. Future/invalid overseas saves remain byte-for-byte untouched; practice can continue in memory with a visible warning. Existing future Korean checkpoints are protected against automatic clearing/import overwrite.

Legacy bundle imports preserve the additive overseas session slot and choose KR. New bundles include both slots. Validation precedes mutation; failed import writes attempt restoration of every original value. Permanent browser storage failure may also prevent restoration, so users can export the original before importing. No import can overwrite an existing unsupported/future slot. The international save dialog distinguishes stored-record export from a current-input recovery copy; the latter never mutates local storage.

## Build and security

Vanilla JS remains. No new runtime service, framework, government API or personal records. All overseas lookups query the active synthetic fixture locally. Strings inserted as HTML are escaped; notes and import summaries are treated as data.

The single-file build minifies CSS with existing esbuild and interns repeated JS string literals inside the release IIFE using build-only Acorn. Keys, directives and approved fetch targets are preserved. Parenthesized references preserve token boundaries. Native source builds remain unchanged; generated root `index.html` is regenerated, never hand-edited. Existing size and network integrity assertions remain intact.

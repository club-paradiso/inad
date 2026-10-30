# INAD v11 — implementation status

Branch: `claude/youthful-shannon-okcuam` (single integration branch; see "Delivery" below).
Base: `main` @ `b5f7ac8` (PR #26 merged). Audit: `docs/v11/PRODUCT_AUDIT.md`.

## Delivery

The directive proposed five stacked PRs. This session may push only to its designated branch, so
the work is one reviewable Draft PR with logically separated commits (directive §10 fallback):

| Commit theme | Directive PR |
|---|---|
| Unified gameplay core: scenario contract, engine integrity, save v2, queue, lazy libraries | #27 / #30 |
| 36-case international library | #29 |
| Hardening from independent review, docs, QA | #31 |

UX unification (#28) is partial — see "Not done".

## Done (implemented and tested)

| Area | What | Tests |
|---|---|---|
| Scenario contract | `engines/atlas-scenario-schema.js`: schema validation, cross-references, reachability solver, fairness lexicon, deep freeze | `atlas-library.test.js` schema tests; `node scripts/validate-atlas.js` |
| Library | 12 authored cases per country (CA/GB/NZ), 4 complete · 4 evidence · 4 review each; legacy ids preserved | library-wide unit playthroughs; `tests/e2e/atlas-library.spec.js` drives every case through the UI |
| Encounter | Call required for every case in every country (engine-enforced) | `atlas.test.js`, `atlas-library.test.js` |
| Evidence integrity | Record facts need a search, statements the question, request results the request; compare rechecks; no actions after completion; saved graphs must be justified by the case's own comparisons | "engine refuses actions…", "saved evidence cannot move between cases…" |
| Debrief | One data-driven evaluator; wrong outcome caps at 45 with authored explanation; unnecessary requests −10; order-independent | wrong-outcome, checklist-only and order tests |
| Queue / progression | Queue with difficulty/status/score, progress line, next case, replay with confirmation, per-country progress in the selector | "queue: next case…", E2E queue test |
| Country terms | Outcome labels per country pack (all marked simulated) | E2E |
| Persistence | `inad-atlas-v1` payload v2; explicit v1→v2 migration; no 3-case cap; future versions protected | "v1 saves migrate…", existing persistence suites |
| Performance | Case libraries are separate hashed files loaded on demand; entry JS 653 KB → 634 KB | `dist-integrity` lazy-library test |

## Not done / limitations (not claimed)

- Overseas free-text or voice interview (Korean v10 only). Buttons only.
- The three manual "task" checks remain (kept for save compatibility).
- Country-specific visual workstation variants beyond the existing layouts; Figma sync (no authorised Figma session in this environment).
- Firefox/WebKit: not installed locally; covered by the CI `atlas-cross-browser` job (green on `bfbac02` for `atlas.spec.js`; from this commit it also runs the full-library reachability, queue, boot-race and GB-02/NZ-02 journeys). Korean flows run in Chromium only.
- New official sources (eTA/ETA/NZeTA, NZ Act) could not be retrieved (network policy); cases `SIM-CA-05`, `SIM-GB-06`, `SIM-NZ-04` cite them as context and the register marks them NOT VERIFIED.
- Human playtest, screen-reader testing.
- Korean mode unchanged by design (legal logic frozen).

## Next tasks

1. Allow `www.canada.ca`, `www.gov.uk`, `www.immigration.govt.nz`, `www.legislation.govt.nz` and re-run source retrieval.
2. Deterministic per-case free-text question matcher for overseas interviews (must route through `atlasAction('ask')`).
3. Replace manual task checks with derived checks behind a save migration.
4. Extend the CI cross-browser matrix to Korean flows if needed.

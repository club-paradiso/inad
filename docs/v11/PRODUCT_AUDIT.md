# INAD v11 — Product & technical audit

Audited 2026-10-30 on `main` @ `b5f7ac8` (PR #26 merged; PR #24–#26 history reviewed).
Baseline before any v11 change: lint 90 modules · unit 180/180 · integrity 14/14 · E2E (Chromium, dist) 144/144.
Evidence: interaction traces with Playwright (1440×1000 and 390×844, all four countries) and a
code reading of `src/js/engines/atlas-*.js`, `src/js/ui/atlas-workstation.js`, `src/data/atlas-scenarios.js`,
`src/data/country-packs.js`, `save-engine.js`, the build and every ATLAS test.

## 1. What a player experiences (before v11)

| Step | Korea | Canada / UK / New Zealand |
|---|---|---|
| Launch → understand | Start screen, tutorial, live interview, campaign, daily case | Only reachable through "Country selection" button; no explanation of what the overseas mode offers beyond "3 synthetic cases" |
| Duty selection | Airport, difficulty, interview language, shift | Fictional desk, guidance, interview language |
| Queue | Shift queue with generated travellers, progression, scoring, career save | A fixed list of three cases; no queue, no "next case", no session result |
| Passenger call | Booth call, live portrait | Only `SIM-CA-01` has a call button; 8 of 9 cases are interviewed with no one at the counter |
| Interview | Deterministic answers, free-text/voice interpretation (v10), withheld lines before prerequisites | The same two generic questions in every case plus one cross-check; the generic "explain" answer reveals the case resolution immediately |
| Documents / records | Rich document workbench, systems | Two one-line "documents" per case; search returns both records |
| Evidence analysis | Clue board, statement lock | Compare dock works only for `SIM-CA-01`, `SIM-GB-02`, `SIM-NZ-02`; six cases have no comparable facts — the dock is a dead end |
| Decision | Legal decision desk with procedure screens (frozen v6.1 logic) | Three simulation outcomes, first option pre-selected |
| Debrief | Score, mistakes, report | Hardcoded for 3 case ids; others get a generic score; **choosing the wrong outcome does not change the score** |
| Next / save | Checkpoints, career, export | Must pick another case manually; per-country saves capped at three cases |

## 2. Findings register

Severity: **P0** breaks the product promise or integrity · **P1** major gameplay/UX gap · **P2** quality issue · **P3** polish.
Status column refers to this v11 branch (`claude/youthful-shannon-okcuam`).

| ID | Sev | Location / flow | Reproduction | Root cause | Impact | Corrective action | Acceptance test | Status |
|---|---|---|---|---|---|---|---|---|
| A-01 | P0 | `atlas-graph-engine.evaluateDebrief` | GB: finish `SIM-GB-03` (expected *complete*) choosing *review* → still "Thorough"/"Competent" | Outcome never entered the score | Wrong conclusions rewarded; scoring is checklist completion | Data-driven debrief: wrong outcome caps score at 45 → *incomplete*, authored `outcomeFeedback` shown | `atlas-library.test.js` "wrong outcomes…never earn a thorough debrief"; E2E "unsupported outcome gets explanatory feedback" | Fixed |
| A-02 | P0 | `atlas-engine.atlasAction('ask')`, `callAtlasPassenger`, `atlasMissing`, UI `personHTML` | Open `SIM-GB-01`; ask any question with nobody called | Encounter gating hardcoded to `c.id === 'SIM-CA-01'` | 8/9 cases skip the encounter; inconsistent game between countries | Every case requires the call; engine-enforced | "engine refuses actions whose prerequisites have not happened, in every case" | Fixed |
| A-03 | P0 | `evaluateDebrief` branches on three ids; UI request button tied to `SIM-NZ-02` | Play `SIM-CA-02`: no facts, compare dock empty, generic debrief | Scenario-ID hardcoding in engine and UI | Six of nine cases have no real investigation | Declarative scenario contract (`atlas-scenario-schema.js`), generic requests, generic debrief | `atlas-library.test.js` playthrough of every case | Fixed |
| A-04 | P0 | `validateAtlasSave` `Object.keys(s.cases).length <= 3` | Any library > 3 cases per country | Storage limit hardcoded to content size | Blocks scenario expansion; would mark larger saves "protected" | Limit = library size; save v2 with explicit v1 migration | "a country session holds its whole library…" | Fixed |
| A-05 | P0 | Saved graph accepted any id strings | Copy `discoveries` from one case to another in a save/import | Graph validated only for shape | Cross-case evidence, fabricated unlocks | Scenario-aware consistency: facts/findings/unlocks/requests/asked must be justified by the case's own comparisons | "saved evidence cannot move between cases…" | Fixed |
| A-06 | P1 | Scenario content | Play all nine cases | Content was generated from one template: 2 one-line documents, shared questions, shared reply | Shallow, repetitive; not a game library | 36 authored cases (12 per country) with multi-document evidence, records, statements, requests, gated follow-ups | Library validation + E2E reachability for every case | Fixed (see §4) |
| A-07 | P1 | Generic `clarify` question answers with the case `reply` | `SIM-NZ-01`: first question reveals the mismatched attachment | Shared question with case-wide reply | Investigation solved by the first click | Per-case authored answers; authors instructed to keep discoveries for comparisons (legacy `clarify` kept for save compatibility where the brief already shows the issue) | Author review; schema doc rule | Fixed for new cases; legacy CA-01 deliberately unchanged (interview-first route) |
| A-08 | P1 | No queue/progression | Finish a case | No next-case affordance or session summary | Dead end after every debrief | Queue panel (difficulty, status, score), progress line, "Next case", "Replay this case" with confirmation | "queue: next case skips completed work…", E2E queue test | Fixed |
| A-09 | P1 | Outcome dialog | Open "Review simulated outcome" | First option pre-selected | Accidental decisions; no country terms | Explicit placeholder choice; country-specific labels from pack (CA secondary examination, GB further examination, NZ hand over for further assessment — all marked simulated) | E2E selects explicitly | Fixed |
| A-10 | P1 | `atlasAction('selectFact')` | Call `selectFact` on a record fact before searching | Only statement facts were gated | Facts discoverable through engine calls / hidden metadata | `atlasFactVisible`: records need a search, statements the question, request results the request; re-checked at compare | "engine refuses actions…" | Fixed |
| A-11 | P1 | Bundle | Add 36 bilingual cases to `atlas-scenarios.js` | All content in the entry bundle | Initial gzip budget (300 KB) would be exceeded | Libraries built as separate hashed files and loaded on demand | `dist-integrity` "case libraries ship as on-demand hashed files" | Fixed |
| A-12 | P2 | `atlas-workstation.js` `button()` | Inspect "Call simulated passenger" (`class="act primary"`) | Helper emitted `class="act"` first; duplicate attribute ignored | Primary affordances rendered as secondary | Helper honours caller class | Visual check | Fixed |
| A-13 | P2 | Record rows rendered document fact chips | Search records in CA, then look for `#fact-…` | Same fact chip rendered twice | Duplicate DOM ids (a11y, ambiguous controls) | Record rows show only record-sourced facts | E2E reachability uses unique ids | Fixed |
| A-14 | P2 | Emoji in controls (📌 💬 🔒 💡 📄 🔍) | Any overseas screen | Decorative icons | Conflicts with design rules (no icon/badge lists, no decoration) | Text labels; locked follow-ups say "opens after a comparison" without revealing the question | Visual check | Fixed |
| A-15 | P2 | Request panel used warning colour | NZ-02 request | Semantic colour outside decision desk | Design-invariant drift | Neutral surface | Visual check | Fixed |
| A-16 | P2 | Overseas "tasks" are three manual check buttons per case | Any case | Retained checklist | Redundant clicks | Kept (save compatibility: completed v1 saves rely on the three task ids); flagged for UX iteration | — | Open (P2) |
| A-17 | P2 | Overseas interview is button-only | Any case | v10 free-text/voice path is Korean-only | Lower conversational depth than Korea | Deferred: needs a per-case deterministic matcher; must not bypass engine | — | Open |
| A-18 | P2 | Country-specific source register | `docs/v11/PROCEDURAL_SOURCES.md` | New official sources (eTA/ETA/NZeTA, NZ Act) blocked by this environment's network policy | Requirement-type cases rely on generic "travel authorisation record" wording | Recorded as NOT VERIFIED; UI wording neutral | Doc review | Open (blocked) |
| A-19 | P3 | Footer shows internal source codes | Any overseas screen | Debug-style provenance string | Jargon | Kept (provenance is required); candidate for a "Sources" disclosure | — | Open |
| A-20 | P3 | Korean start screen | First launch | Country entry is a plain secondary button | Overseas mode is easy to miss | Unchanged in this pass (Korean screens out of scope for change) | — | Open |
| A-21 | P1 | `workspace.css` ATLAS compact layout (≤1100 px) | Open any overseas country at 1024×768 | Desktop focus rules (`[data-atlas][data-focus=…]`) outrank the compact block, so the desktop grid leaks in | Main column empty, assessment panel half-height in a corner (pre-existing on `main`; found in the v11 visual audit) | Compact block raised to `body[data-atlas][data-focus]`; assessment task spans full width | `docs/v11/screenshots/*-1024.png`, `adaptive.spec.js` | Fixed |
| A-22 | P2 | Fact chips | Any statement/document chip | `.act` (`display:grid`) overrides `.fact-chip` | Marker and label on separate lines | `.act.fact-chip` inline layout | Visual audit | Fixed |
| A-23 | P2 | Task navigation at 768–1100 px | Overseas mode at 1024 | Active task button has no visible selected state in the ATLAS compact layout | Weak orientation | Not changed | — | Open |

## 3. Engineering audit summary

- **Duplication / hardcoding (fixed):** three scenario ids in the debrief, one id in encounter gating (engine and UI), one id in the request UI, a `<= 3` storage cap, `ATLAS_SCENARIOS.length === 9` assumptions.
- **Engine contracts (fixed):** UI was the only guard for record-fact visibility and request availability; compare did not recheck visibility; completed cases could still compare/request.
- **Korean engines:** untouched. `legal-engine.js`, `case-engine.js`, `src/data/cases.js`, Korean save keys and `legacy/` are unchanged by v11.
- **Persistence:** `inad-atlas-v1` key unchanged; payload version 1 → 2 by explicit migration (`migrateAtlasSave`), future versions remain protected byte-for-byte.
- **Build:** PR #26 modular architecture retained; one plugin adds on-demand hashed case libraries.

## 5. Independent review (separate reviewer context, 2026-10-30)

| ID | Sev | Finding | Fix | Test |
|---|---|---|---|---|
| R1 | P1 | v1 save with a completed legacy case that gained a 3rd document failed validation, so the whole overseas save became "protected" and imports were blocked | Migration marks such cases `legacyDocuments: 2`; validation accepts their v1 completion | unit "review R1" |
| R2 | P1 | Boot race: entering a country before the saved state was read persisted an empty session over stored progress | Country entry awaits the restore; libraries load at boot only when overseas state exists; import loads them first | E2E "review R2" |
| R3 | P1 | Repeated Compare grew history past the validator's 100-entry bound, invalidating the save | One history entry per distinct pair (latest moved last); schema caps facts at 14 | unit "review R3" |
| R4 | P2 | Crafted saves with unjustified discoveries or hidden selected facts were accepted | Discoveries need a matching comparison entry; selected facts must be visible | unit "review R4" |
| R5 | P2 | Cross-check note shown for cases without that prompt | Shown only when the case has it | — |
| R6 | P2 | `SIM-NZ-07` open question presupposed a gated fact; wording issues in NZ-07, NZ-10, GB-12 | Question gated; wording fixed | validator |
| R7 | P2 | Record facts unlocked by any search, even a non-matching one | Visible only if the record matches the search run or was opened | unit "record facts follow the search" |
| — | open | `SIM-CA-11` trap request returns relevant information yet costs 10 | Kept as authored; flagged for content review | — |

## 4. Remaining gaps (not claimed as done)

See `docs/v11/IMPLEMENTATION_STATUS.md` for the live list. Not implemented in this branch: overseas free-text interview, Figma synchronisation (no authorised session in this environment), Firefox/WebKit runs if the browsers are unavailable locally, human playtest.

## 6. Post-merge hotfix — Codex P1 on PR #27 (2026-10-30)

Thread: https://github.com/club-paradiso/inad/pull/27#discussion_r4420697921 — "Keep record-fact selections valid when the search changes".

| Item | Detail |
|---|---|
| Reproduction | `SIM-CA-02`: search with an empty query → select the record fact `SIM-CA-02-F-ADDR` without opening its record → search for something that does not list it → any further edit. Unit: `tests/unit/atlas-record-search.test.js`; browser: `tests/e2e/atlas-record-search.spec.js` (both fail on `53c0756`). |
| Root cause | Record-fact visibility depends on the current search, but a new search did not re-check facts already selected. The save validator (PR #27 R4) rejects hidden selected facts, and `persistAtlas()` wrote the snapshot without validating it, so the next write saw an invalid stored save and marked all overseas progress `protected`; reload refused to restore any country. |
| Fix | (1) `search`/`record` actions release only selections that became hidden; discoveries, history, unlocks, asked questions and requests are untouched. (2) Load-time recovery (`migrateAtlasSave` → `releaseStaleRecordSelections`) drops only well-formed, stale **record-fact selections** belonging to the case; every other check still applies and the input is not mutated; storage is rewritten only by the next normal save. (3) `persistAtlas()` refuses to write a snapshot it would itself reject (status `failed`, disk save untouched, draft kept for export). |
| Not weakened | Hidden statement/request selections, facts from another case, unjustified discoveries, duplicate or malformed selection lists, malformed search fields remain rejected (unit "repair is narrow"). |
| Regression | All 36 cases × several searches keep the save valid; another country's progress loads and saves after recovery (unit + browser). |

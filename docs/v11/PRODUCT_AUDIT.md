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
| A-16 | P2 | Overseas "tasks" are three manual check buttons per case | Any case | Retained checklist | Redundant clicks | Derived from the work done; no buttons (§10) | `tests/unit/atlas-derived-tasks.test.js`, `atlas.spec.js` "review checks" | Fixed |
| A-17 | P2 | Overseas interview is button-only | Any case | v10 free-text/voice path is Korean-only | Lower conversational depth than Korea | Per-case deterministic matcher (`engines/atlas-intent.js`) through `submitAtlasUtterance` | `atlas-free-text*.test.js`, `atlas-free-text.spec.js` | Fixed (§7) |
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

### 6.1 Follow-up UX — selection kept while typing a search

The #28 fix released a record-fact selection whenever the current query stopped listing its record. Because the search runs on every keystroke, a typo or a half-typed query dropped the selection. Records a search has listed (or that were opened) are now kept in `revealedRecords` for the case, like asked statements and issued requests, so refining or retyping a query never drops a selection. The field is optional and validated (unique, this case's record ids only); saves written before it existed fall back to the current-search rule, and the #28 load-time recovery still applies to them. Replay clears it. Tests: `tests/unit/atlas-record-search.test.js` ("typing a query keystroke by keystroke…", "revealedRecords is validated…"), `tests/e2e/atlas-record-search.spec.js` (types key by key).

## 7. Overseas free-text questions (2026-11-03)

Players can type a question in Korean or English in every overseas case. `submitAtlasUtterance()` is the single entry for typed text, clarification choices and the question list, and records only the case's canonical answer, so the input method never changes evidence or score (unit "the input method never changes the debrief"). Interpretation is deterministic (`engines/atlas-intent.js`): shared concepts that make sense overseas plus an overseas phrasing supplement (`src/data/atlas-dialogue-lexicon.js`), Korean bigrams and English topic tokens, scored only against the questions the player may ask now — a locked follow-up is never reachable or offered by typing (unit test over all 36 cases). Below 0.30 the text is not understood; below 0.50, or when only concepts match with no shared wording, the player confirms first; two close matches become a choice. Typed text is never saved.

Rules that keep a wrong question from being recorded silently: below 0.30 the text is not understood; below 0.50, when only concepts match with no shared wording, or when the utterance's own topic is not one the question carries, the player confirms first; two close matches become a choice; "show me / hand over <document>" is answered as a document request and asks nothing.

**Evaluation.** Two paraphrase sets, both written by separate authors who did not see the matcher:

| Set | Use | Reached | Direct | Silently wrong question |
|---|---|---|---|---|
| Development, CA + GB (`atlas-utterances.fixture.js`) | tuned the overseas lexicon | 96.6% | 70.7% | 0 |
| Development, NZ (same file) | meant to be held out, but its errors were viewed before the split | 88.0% | 69.0% | 0 |
| **Held-out** (`atlas-utterances-heldout2.fixture.js`, 154 questions × ko/en) | measured once, never tuned on | **90.6%** | 68.8% | **0** |
| Negatives (dev 20 + held-out 40, × 36 cases) | off-topic, greetings, generic openers | — | — | 0 (the only 6 hits are "have you been here before?" asking a real previous-visit question) |

The first version claimed the NZ items were "never tuned on"; the independent review showed seven stems matched only NZ items and the earlier 91% figure depended on them. Those stems were removed and a second held-out set was commissioned; the table above reports that set once. "Reached" counts a direct ask, a confirmation or a clarification choice that holds the right question; floors are locked in `tests/unit/atlas-free-text-eval.test.js`. The Korean dialogue evaluation is unchanged (deterministic tuned 100%, held-out 100%).

Not implemented overseas: model-assisted interpretation (voice input: §8).

## 8. Overseas voice questions (2026-11-03)

A "Speak" button beside the typed-question box (shown only when the browser has speech recognition) uses the Korean v10 voice service (`services/speech.js`) through `src/js/ui/atlas-voice.js`, under the same rules: the microphone is off until the player chooses in a consent dialog; the choice is the shared `inad-voice` preference (on-device only, or browser recognition as an explicit opt-in that may send audio to the browser vendor); INAD never records, stores or sends audio. The recognised text only fills the question box; the player reviews or corrects it and presses Ask, so it goes through the same `submitAtlasUtterance()` path and confirm rules as typed text and never changes scoring. Recognition language follows the case's interview language (`ko-KR`, or `en-CA` / `en-GB` / `en-NZ`). Listening is aborted on case change, Replay and country switch, and nothing heard is kept. **Session lifecycle (independent review, fixed).** Browsers fire `error('aborted')` and `end` *after* `abort()`, and an on-device start may still be waiting for language data when the player moves on. The first version let those late events write the transcript into the next case, show a status, move focus, or open the microphone after a case or country switch, and could orphan a live recogniser. Each session now carries a generation number: `stopVoice()` starts a new one, every callback and awaited step of an older session is ignored, and `end` clears only its own recogniser. Listening stops on case change, Replay, completion, the country/settings/data/outcome dialogs, a hidden tab and a country switch (the Korean recogniser is stopped too when an overseas desk opens, keeping the Korean draft); text heard by a session that never finished is discarded, a finished transcript stays for review. Consent can be changed or withdrawn from the overseas settings. The button keeps one accessible name ("Speak") and reports listening with `aria-pressed`.

Tests: `tests/e2e/atlas-voice.spec.js` uses a stand-in recogniser that behaves like Chrome (interim results; `abort()` fires `error` then `end` asynchronously; optional on-device support with a slow language check) and covers consent first, transcript-only, button state, abort with late events on case switch / country selector / outcome dialog, Ask while listening, switching to Korea while listening, an on-device start resolving after a case switch, withdrawing consent, no API, and 320 px. Removing the generation checks fails the late-event and on-device tests. Real recognisers were not exercised (headless browsers have none); recognition accuracy depends on the browser. Pre-existing and unchanged: the Korean recogniser's own `end` handler does not use a session token.

## 9. Overseas read-aloud (2026-11-03)

With the shared `inad-tts` preference on (off by default; switch in the overseas settings and in the Korean interview settings), the device's speech synthesis (`services/speech.js`, local voices preferred) reads the opening statement when the passenger is called and the case's canonical answer each time a question is asked, typed, chosen or picked from the list, in the interview language (`ko-KR` or `en-CA` / `en-GB` / `en-NZ`). Unclear or unanswered text is never spoken; captions and the transcript are always shown, so read-aloud is never the only channel. Speech is cancelled before the microphone starts (the passenger's voice is never recognised as the officer's question), and on case change, Replay, the country/settings/data/outcome dialogs, a hidden tab and a country switch. `ttsSupport()` now requires an actual `speechSynthesis` object (same result in real browsers). **Independent review (fixed):** choosing a listed question while listening read the answer into the open microphone — a listed question now ends listening first (its unfinished transcript is discarded), read-aloud is a no-op while the microphone is open or a start is pending, and speech is cancelled again right before recognition starts; a repeated question is no longer re-read ("Already asked"). Tests now check an ordered speak/cancel log (nothing spoken after moving on, last call a cancel) for case switch, country selector, settings, save data, outcome, hidden tab, Replay and switching to Korea. Tests: `tests/e2e/atlas-read-aloud.spec.js` (off by default, settings switch shared with Korea, exact texts and languages spoken, Korean interview language, cancel on mic/case/dialog, no synthesis); removing the cancel-before-mic fails its test. Voice quality depends on the device's installed voices.

## 10. Derived review checks (2026-11-03)

The three per-case checks (identity, evidence comparison, handover) no longer have "Mark checked" buttons. `atlas-engine.js atlasTaskState()` derives each one from what the player has done, with exactly the former button preconditions: its linked document reviewed, plus a question asked or a record comparison made for evidence, plus a review note of 10+ characters for handover. The task panel shows what each check still needs ("Linked document not reviewed yet", "Ask a question or compare a record", "Write a review note of at least 10 characters") and keeps the "Open evidence" link; the handover status and the n/3 count follow the note while typing. **Independent review (fixed):** the count is now taken from the derived checks (it read the saved list, which could disagree with the rows until the next action for a button-era save), and a change of a check while typing is announced once through the polite live region. Because the conditions are unchanged, completion and scoring are unchanged. The saved `tasks` list keeps its meaning: it is kept in step for unfinished cases (and once more on completion, so an in-progress save from the button era with no checks marked completes without an extra step), and a completed case keeps exactly what it saved. No save migration is needed; old and new builds read each other's saves. `atlasAction('task', id)` is kept for compatibility and only reports whether a check is satisfied. The outcome panel no longer lists "Task checks" as a separate missing item, since every unmet check is already listed under the documents, interview or note it depends on. Tests: `tests/unit/atlas-derived-tasks.test.js` (each prerequisite in any order, record comparison, note shortened, button-era save, completed save, read-only action, whole library); `tests/e2e/atlas.spec.js` "review checks" (no buttons, live statuses, reload), also in the cross-browser gate. Removing the sync on note input, or the sync itself, fails these tests.

## 11. Country desk visual variants (2026-11-03)

Each overseas country now has its own workstation look on the same DOM (one tree, four zones):

| | CA · records desk | GB · task desk | NZ · activity desk |
|---|---|---|---|
| Chrome / desk mark | teal-slate `#15282b` / `#22717a` | navy `#171c32` / `#45539c` | olive-charcoal `#1f231a` / `#5c6b2f` |
| System focus (≥1101 px) | person · records+documents (full height) · interview over notes | person · task list (full height) · notes over interview | person · activity board across the top · interview and notes below |
| Review checks | dense rows, check and evidence link on one line, left bar | steps on a rail with a diamond node | board columns (3 when the workspace is ≥640 px wide, container query) with a top bar |
| Extra | banded record table, desk-tinted header | history drawer marked with the desk colour | phase line "Link evidence → Verify → Hand over", derived from the checks, updated live |

- **Tokens:** `--desk` and `--desk-soft` (`tokens.css`, default = the Korean accent) and per-country `--chrome`, `--chrome-2` and `--chrome-muted`.
  - Only chrome and the desk mark change. `--accent` and the status colours keep one meaning in every country, which a test asserts.
  - The high-contrast setting and the OS "more contrast" setting keep their own chrome.
  - The colours are fictional identities, not agency branding.
  - Measured contrast: chrome text 14–15.5:1, muted chrome text ≥6.3:1, desk mark on white ≥5.6:1.
- **Text cue:** a completed check is also stated in visible text ("Complete", in the desk colour). NZ phases show "· Complete" or "· Not yet" as visible text.
  - The phases form a sequence: a later phase is done only when the earlier ones are.
  - In forced-colours mode the desk marks keep a done/open difference: a filled GB node, and double CA/NZ bars.
- **Bug fix:** system focus at 1440 previously auto-placed all four zones in one grid row, leaving the lower ~40% of the screen empty (pre-existing). It is fixed by the per-country placements.
- **Tests:** `tests/e2e/atlas-desks.spec.js`, also in the Firefox/WebKit gate. It covers:
  - distinct chrome with the same action colour;
  - high contrast;
  - per-country zone geometry, with every row used;
  - per-desk done marks and NZ live phases;
  - no overflow at 1024/768/390.

  Removing the NZ placement rule or the GB done-node rule fails it.
- **Screenshots:** `docs/v11/screenshots/{ca,gb,nz}-{1440,1024,768,390}.png`. 1440 and 1024 use system focus; 768 and 390 use the evidence task.
- **Independent review (fixed):**
  - The desktop media query started at 1101 px, so fractional widths between 1100 and 1101 px (zoom, HiDPI) fell into neither layout. It now starts at 1100.02 px.
  - NZ phase state was visible only through colour and weight. It is now stated in visible text.
  - Phases were not chained. They now are.
  - Forced-colours marks were added.
- **Figma:** the Variables collection `ATLAS / Country desk` (KR/CA/GB/NZ) is synced. Twenty-one editable country-desk frames (counter focus 1440/768/390, system focus 1440/1024/768/390 for CA/GB/NZ), plus the country selection dialog at 1440/768/390 in `[Implemented] ATLAS · country selection · 2026-11-03`, the country switch confirmation at 1440/768/390 in `[Implemented] ATLAS · country switch confirmation · 2026-11-03`, the outcome review dialog at 1440/768/390 in `[Implemented] ATLAS · outcome review · 2026-11-03`, the debrief for CA/GB/NZ at 1440/768/390 in `[Implemented] ATLAS · debrief · 2026-11-03`, and the case queue for CA/GB/NZ at 1440/768/390 in `[Implemented] ATLAS · case queue · 2026-11-03` are in `[Implemented] ATLAS · country desks · 2026-11-03`, bound to those variables. See `docs/figma-workspace-spec.md`.

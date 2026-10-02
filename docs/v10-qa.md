# INAD v10 — QA record (vertical slice, 2026-10-02)

## 1. Gate 0 — starting point
- Branch `claude/relaxed-edison-iux1mv` from `main` `0ea5265` (v9.0.0). Baseline on that commit, this environment:
  lint 65 modules OK · unit 106/106 · integration 10/10 · E2E (dist) 83/83.
- Production (`inad-gray.vercel.app`) could not be opened: the environment network policy denies the host and the
  Vercel connector has no read access to the project's deployments (403). The v9 "before" screenshots were taken from
  `main` built locally (`design/v10/review/v9-before-1440.webp`); `vercel.json` deploys exactly that build.
- Findings that shaped v10: the interview column showed ~3 transcript lines at 1440×900 and the passenger was a
  108 px thumbnail; the question list was the only way to talk; the v9 portrait set has the defects in
  `design/v10/REJECTED_ASSETS.md` (TRV-0005, the slice passenger, does not match his case).

## 2. Automated results (final run on the branch head)
| Suite | Result |
|---|---|
| `npm run lint` | 81 modules OK · 53 tooling files parse |
| `npm run test:unit` | **130/130** (106 v9 + 15 dialogue + 6 `/api/npc` + 3 daily) |
| `npm run test:integrity` | 10/10 (network invariant now: only `/api/airport-load` and `/api/npc`) |
| `npm run test:e2e` (dist) | **101/101** (83 v9 incl. the 8-viewport adaptive sweep + 9 live interview + 2 quick shift + 7 case of the day) |
| `npm run eval:dialogue` | tuned 152 lines 100 % (0 wrong routes) · held-out rounds 2 · 4 · 6: 62 lines, 75.8 % placed or offered as a candidate, 6 wrong routes |
v9 tests changed: `tests/e2e/helpers.js ask()` now also waits until the passenger's reply is shown (the record is held
for the reaction time); `tests/integration/dist-integrity.test.js` allows the second approved same-origin endpoint and
asserts every fetch targets an approved one. No test was removed or loosened otherwise.

## 3. Dialogue evaluation detail
- Fixture: `tests/dialogue/intents.fixture.js` (ko/en, informal speech, typos, meta intents, document requests,
  off-topic). Tuned sets: ICN-S2-005, ICN-S2-006, ICN-S1-001, round-1 lines, playtest lines.
- Held-out discipline: round 1 scored 13/18 (72 %) on first run, then became tuning data; round 2 was written before
  any run and has not been tuned on: 13/17. Misses: `생활비는 어떻게 쓰실 생각이세요?` (unknown), `신고서에 쓴 연락처
  분은 어떤 분이세요?` (→ host, wrong route), `혹시 한국에서 일하실 생각 있으세요?` (unknown), `그 분이랑은 어떻게
  연락하게 됐어요?` (unknown). Unknowns cost nothing and offer open candidates; this is where the optional model is used.
- Round 3 (pilot cases ICN-S1-002 / ICN-S3-010 / ICN-S3-011, written before running): 17/24 (70.8 %), 2 wrong routes;
  ICN-S3-011 scored 2/8 (no age / official / exemption / consent concepts). Tuned afterwards → training data.
- Round 4 (ICN-S3-011 / ICN-S1-001 / ICN-S2-006, written after the round-3 tuning, before running): **10/15 (66.7 %),
  4 wrong routes** (exempt→bio, pay→funds, sponsor→samples, hotel→bookingName). Untuned.
- Conclusion: on unseen phrasing the deterministic matcher places 67–77 % correctly and misroutes 6–27 %. Response:
  **low-confidence confirmation** — a first-time match scoring < 0.62 is shown as "이렇게 기록할까요?" with the
  examiner's words kept in the box; nothing is said, recorded or charged until confirmed. On the fixture this stops 4
  of 6 wrong routes and adds one click to 26 of 120 correct routes (22 %). The optional model is the intended fix for
  the remaining gap.
- Round 5 (2026-10-02, the six cases that still used the generic persona: ICN-S1-003, S1-004, S2-007, S2-008,
  S3-009, S3-012; written before running): **20/37 (54.1 %), 2 wrong routes, 15 not placed**. Case of the Day draws
  from all twelve cases (each about 1 day in 12; 2026-10-02 itself is ICN-S3-012), so half the days met this level.
  Tuned afterwards (concepts MATCH, COMPANY, MEET, PROOF, NAME, PERSON_NAME, HANDS_ON, INSPECT, DEPARTED, LIFTED,
  KNEW; stems for residence, transit, deletion, consent) → training data (36/37 exact).
- Round 6 (written after the round-5 tuning, before running; untuned): **17/30 (56.7 %) exact, 2 wrong routes —
  both below 0.62, so both stop at the confirmation step**. After the six personas' English glosses were added
  (straight translations of the question texts, which also feed the matcher): 19/30, the same 2 wrong routes, both
  still confirmed first. Rounds 2 and 4 are unchanged by this tuning (13/17 · 10/15 under the harness metric).
- Reading: on unseen phrasing for cases without tuning the matcher places a little over half exactly; most of the
  rest are offered as candidates or asked again, and every wrong route measured on rounds 4–6 scores below the
  confirmation threshold. Unknowns cost nothing. The optional model remains the intended fix.
- Model benchmark: not run (no reachable provider). Harness: `INAD_LLM_BASE_URL=… INAD_LLM_MODEL=… npm run eval:dialogue -- --provider`.

## 4. Visual QA rounds (UI constitution checklist)
| Round | Finding | Fix |
|---|---|---|
| 1 · 1440 | booth portrait collapsed to 26 px: `.stage` clashed with the case bar's stage chip | renamed `.booth-stage` |
| 1 · 390 | portrait squeezed under the name plate (grid shrank a scroll container) | `overflow: clip` |
| 1 · 844×390 | name and question list outside the viewport | landscape: booth beside identity; record beside questions |
| 1 · 1024×768 | question list 48 px (< 1.5 rows) | short compact screens drop side notes, tighter question bar |
| 2 · avatar 2× | mouth gap read as lipstick | darker, narrower gap, lower amplitude |
| 3 · debrief | dialog opened scrolled to the bottom (autofocus on the last button) | pinned action bar; opens at the decision basis |
| 3 · start | "약 5분" was not measured | removed |
Open visual notes: the evidence strip truncates long document names at 1280–1439 (scrollable, faded edge);
v9 result-dialog labels are still Korean in the English UI (pre-existing).

## 5. Performance (Chromium, release build, 1440×900; `scripts/measure-performance.js`)
| Metric | Budget | Normal CPU | 4× throttled |
|---|---|---|---|
| release page | ≤ 1,742 KB (v6.1 +15 %) | 1,670 KB | — |
| start screen ready | ≤ 1.5 s | 0.36 s | 1.24 s |
| 라이브 인터뷰 → live passenger | ≤ 1 s | 0.19 s | 0.65 s |
| idle passenger main-thread busy | ≤ 5 % (4×) | 1.1 % | 3.5 % |
| answering (3 turns) busy | — (recorded) | 10.9 % | 40 % |
| one turn, engine + render | ≤ 150 ms (4×) | ~30 ms | ~100 ms |
| JS heap | ≤ 20 MB | 4.8 MB | 6 MB |
| reduced motion idle | — | 0.7 % | 1.7 % |
Before the compositor change idle was 4.8 % / 20.7 %.

## 6. Scripted playtest personas (`scripts/playtest-personas.js`)
Personas: first-timer (suggestions only), gamer typing freely (informal Korean, off-topic, confrontation), English UI
typing English, microphone denied, keyboard only, phone 390×844. Round 1 friction and outcome:
| Friction | Fix |
|---|---|
| the interpreter suggestion appeared one turn late (suggestions rendered before the misunderstanding was known) | refresh after a misunderstanding |
| a first-timer pressing 입국 허가 early got a strike (the slice case sat at queue index 14, outside 안내 coaching) | one-passenger roster: coaching, no strike |
| informal speech / spacing missed (`왜 한국 왔어`, `집 주인`, `폰 좀 보자`, `뭐 했는데`) | space-insensitive stems + informal stems (6 → 1 unmatched) |
| "How long will you stay?" mapped to the answered purpose question → a costed re-ask | English gloss fixed; loose matches to answered questions ask first |
| "Where are you staying?" got "I don't understand" although the arrival card answers it | public-record answers (no evidence, no cost) |
| the v9 nervous framing repeated on every answer at high stress | said once per case |
| lead-ins stacked on the v9 framing ("음, 네. …") | lead-in only on unframed answers |
Round 2 (after fixes): first-timer 0 strikes, gamer 1 unmatched of 15, English typing 0 unmatched of 7, mic denied
falls back with a message, keyboard reaches the question box in 2 Tab presses, phone flow intact. No page errors.
**Not done**: a human playtest. Scripted personas find mechanical friction, not whether it *feels* like an interview.

## 7. Code review round (independent reviewer, 2026-10-02)
13 findings (3 medium, 10 low), no high. Fixed: per-case interview record could leak into the next case's suggestions
and debrief (reset on `case:init` + readers check the log array); a model-classified re-ask skipped the confirmation
(now confirmed like lexicon matches, so a configured model cannot change cost); local-only voice could fall back to
server recognition on engines without `processLocally` (now refuses and explains); held replies announced twice
(placeholder `aria-hidden`); stale model classifications and stage timers across turns/retries (turn generation +
acting sequence); double microphone start; latent career write on the fatal path in single-case mode; `/api/npc`
same-origin requirement, spoof-proof client IP, bounded rate-limit map, malformed pre-parsed body → 400; debrief label
("알아듣지 못한 질문"); 44 px question-bar targets on coarse pointers; lint rule now requires every npc-client fetch to
be the literal `/api/npc`. Kept by design: a typed "다시 말씀해 주세요" replays the last line of the record at no cost —
it reads the record back (as scrolling does) and has no button equivalent; re-asking a question still costs as in v9.

## 8. Accessibility checks
Question box labelled (`sr-only` label, `aria-describedby` status), Enter sends, single-key shortcuts never fire while
typing (E2E), reply announced once by the record's live region, state label and subtitle `aria-hidden` (the record
carries the text), mic is a toggle button with `aria-pressed`, consent and settings are standard dialogs (focus trap,
restore), reduced motion disables hold, CSS motion and canvas motion (E2E), touch targets 44 px in the question bar on
phones (adaptive sweep measures the v9 set; the new bar uses `--size-touch`).

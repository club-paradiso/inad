# INAD v10 — Live Interview specification (vertical slice)

Slice case: **ICN-S2-005 · 쩐 반 민 (TRAN VAN MINH)** — single-entry C-3-9 visa, one-way ticket, a domestic contact he
cannot explain, factory-job searching that he admits only when confronted. Resolution (unchanged since v6.1):
입국재심 → 입국 불허가 `SIM-A12-PUR` (제12조제3항제2호·제4항) → 송환지시 → 출국대기실.
Why this case: it is the corpus' clearest *investigation* case — hidden facts gated by evidence (`jobOffer` requires
`QUESTION_occupation` + `LOOKUP_contact`), contradictions, a deliberate red herring (declining to show the phone is not by
itself a refusal ground — the case note and the CLAUDE.md rule against automatic refusal on that basis), an interpreter beat, and a full
procedural tail. Known asset defect: the v9 portrait TRV-0005 does not match a 27-year-old Vietnamese man
(`design/v10/REJECTED_ASSETS.md` R-001); its regeneration is the first Higgsfield job once the host is reachable.

## 1. User journey
1. Start screen → **라이브 인터뷰** (one click, no configuration; `body.mode-case`). The 36-passenger duty stays one
   button below for experienced players.
2. The passenger is in the booth; the opening statement is captioned and recorded.
3. The examiner asks — by a suggestion, the catalogue, typing, or push-to-talk — opens documents, runs lookups,
   follows up on what changed, calls an interpreter when questions are not understood.
4. The examiner decides through the unchanged decision desk and procedure screens (touch arming, refusal reasons…).
5. **Debrief**: decisive basis, clues found / key clues missed with how to reach them, the questions that mattered,
   questions and steps not taken (with their gating condition), corrected wrong attempts, the case note, and how the
   conversation was conducted. Then *같은 승객 다시 인터뷰* or *시작 화면으로*. Nothing is saved: no checkpoint,
   no career XP, no daily-mission progress (`state.sessionMode === 'case'`).

## 2. One conversation, four input surfaces
| Surface | Path | Recorded as |
|---|---|---|
| 제안 tab (contextual suggestions) | `submitTurn({questionId, source:'suggestion'})` | canonical question |
| Category tabs (full catalogue, v9 list) | `submitTurn({questionId, source:'list'})` | canonical question |
| Question box (typed) | `submitTurn({text, source:'text'})` → intent engine | examiner's words + "기록 질문 · canonical question" |
| Push-to-talk | recogniser → editable text in the question box → examiner sends → `source:'voice'` | same as typed |
| "혹시 이 질문입니까?" chips | `submitTurn({questionId, source:'clarify'})` | canonical question |

All surfaces end in `engines/interview-engine.js submitUtterance()`; the only evidence path is `case-engine ask()`
(byte-identical to v9). Invariants (tests/unit/dialogue.test.js):
- the same questions through any surface give identical `performed`, clues, score, efficiency, work time, behaviour;
- turns that produce no evidence (not understood, ambiguous, withheld, greetings) cost no work time and no score;
- the surface used is analytics only.

## 3. Interpretation (intent engine)
`normalizeUtterance` (NFKC, control chars, 240-char cap, lower case) → concept detection over a Korean/English lexicon
(`src/data/dialogue-lexicon.js`, stems matched with particles attached) → per-question score = recall-weighted concept
overlap with **per-case IDF weights** + Korean character-bigram overlap + English token overlap with the persona's
gloss. Thresholds: match ≥ 0.34; ambiguity when the runner-up is within 0.06. Meta intents (greeting, thanks, repeat,
interpreter, language switch, wait) and document hand-over requests are recognised first when no question clearly
matches. Results: `question` · `ambiguous` (two candidates) · `unknown` · `meta` · `document` · `empty`.
Optional: when the result is `unknown`/`ambiguous` **and** `/api/npc` reports a configured model, the model is asked
for one of the case's question ids (docs/v10-ai-architecture.md); its id is then handled exactly like a click.

## 4. Deterministic disclosure
| Situation | Passenger says | Record | Cost |
|---|---|---|---|
| question open (`requires` met) | lead-in (persona, non-factual) + canonical answer from `cases.js` | evidence line, clue triggers fire | v9 work time |
| question gated | persona `withheld` line — only facts already on record (initial statement, submitted documents) | off-record line; question stays open; guided mode adds a neutral system hint | none |
| not understood / ambiguous | clarification line; open candidates offered as chips (locked question texts are never shown) | off-record | none |
| language barrier (v9 rule) | v9 misunderstanding line | not a verified statement (v9) | v9 |
| repeat (asked before) | v9 repeat behaviour (`ask(q, true)`) | v9 | v9 efficiency rule |
Grounding: every persona line is checked by `dialogue-guard.checkLine` — each content token must already appear in
the public record (+ obtained answers); leads must contain no content token at all. Tests cover every line of every
persona for every core case (the generic persona included).

## 5. Suggestions
Pure function of what the examiner can see: open questions, which follow-ups just opened (most recent first), whether
the last question failed for language. Never `required`, `resolution`, clue keys or `contradiction` (tested by running
the function on a case twin whose ground truth is inverted). Assistance level (`inad-assist`, default follows 안내 모드):
안내 4 · 표준 3 · 전문 2 · 몰입 0 (the 제안 tab explains that suggestions are off; the catalogue stays available).

## 6. Timing and acting
The engine answers synchronously. The reply line is held for the motion-grammar reaction time (plain 420 ms ·
considered 750 · hesitant 1150 · withheld 900 · confused 520) while the passenger *thinks*; then the line appears in
the record (announced once by the live region), the booth subtitle shows it, and the passenger speaks it (jaw motion
for its syllable length; optional TTS). Reduced motion: no hold, no motion, still frame.

## 7. Voice
Push-to-talk (tap to start, tap to stop). Default **off**; first use opens a consent sheet:
*기기 내 처리만* (Chrome on-device recognition, `processLocally`; disabled when the browser cannot) ·
*브라우저 음성 인식 허용* (browser vendor may process audio) · *사용 안 함*. The transcript lands in the question box
for correction and is never sent automatically. Errors (denied microphone, no speech, unsupported, insecure context)
leave a message and the text path. Spoken replies (TTS) are a separate opt-in, preferring on-device voices.

## 8. Composition
| Width | Layout |
|---|---|
| ≥1280 | booth 304 (280 below 1440) · conversation · evidence (document strip over paper) · assessment 360/330 |
| 1024–1279 | v9 three columns; compact booth (live 88 px portrait beside identity); short screens hide side notes |
| 768–1023 | v9 workspace + inspector with the compact booth |
| <768 | 승객 task = full-width booth (portrait ≈ half the screen, subtitle); 인터뷰 task = record + question bar + tabs |
| landscape phones | booth beside identity; record + question bar beside the question tabs |
Desktop chrome in single-case mode drops the operations bar, duty KPIs and daily missions.

## 9. Built after the slice (2026-10-03) and still designed only
- **Quick Shift (first run) — built**: start screen → 짧은 근무 · 6명 (`sessionMode 'quick'`, `queue-engine.rosterSession`). Roster: ICN-S1-001 · one routine-clear generated passenger · ICN-S1-002 · ICN-S2-006 · ICN-S2-005 · ICN-S3-011; 안내 coaching throughout, debrief after each, summary table at the end, nothing saved. Original design note: 6 travelers — 2 ordinary (TRV-0001-type CLEAR), 1 language barrier, 1 suspicious-but-
  explained (ICN-S2-006 hotel booked by a friend — the brief's "who paid" example), 1 contradiction (this slice), 1
  special procedure. Target 5–10 minutes; the per-case pace has to be measured in a human playtest first.
  Built on `sessionMode` + a fixed roster instead of `buildSession`.
- **Case of the Day — built**: start screen → 오늘의 사건 (`sessionMode 'daily'`, `engines/daily-engine.js`): standard rules, no coaching; result kept locally (`inad-daily-v10`, first result per day, 30 days); share text without decision, case or name. Original design note: seed = FNV-1a(`YYYY-MM-DD` KST) over the 12 core cases + generated passengers; result object =
  `{ dateKey, caseId, decision, reasonCode, evidenceFound[], keyMissed[], questionsAsked, turnsBySource, procedurePath[] }`
  — already produced by `buildDebrief` + `interviewSummary`; an aggregate endpoint can later accept it without any
  personal data.
- **Campaign continuity / recurring characters**: personas keyed by traveler id would let a traveler return in a
  later, legally independent case; the campaign engine already links reservations and dossiers.
- **Progression**: cosmetic booth themes, qualification records, case archive — never a legal advantage.
- **Camera (experimental)**: local-only head presence/nod signals for NPC pacing, default off; see
  `docs/v10-privacy.md` §4. Not implemented; nothing in v10 requests the camera.
- **Analytics sink**: events exist (`interview_turn` with source/kind/route, `live_start`, `live_retry`,
  `case_complete`); they are counted in memory only (`INADSystem.analytics()`).

## 10. Failure behaviour
| Missing | Result |
|---|---|
| model / `/api/npc` | deterministic matcher only (default state) |
| speech recognition | mic hidden or explained; text + buttons |
| microphone permission | message; text + buttons |
| TTS | subtitle + record |
| canvas / rig / reduced motion | plain portrait or still frame |
| JavaScript error in an optional module | v9 boot watchdog behaviour |
No AI subsystem can soft-lock the game: the catalogue tabs always reach every question.

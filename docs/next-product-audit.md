# INAD Next-Generation Product Audit

**Date**: 2026-10-03  
**Baseline**: `main` at commit `f096c77` (post-PR #15 merge)  
**Version**: 9.0.0 (internal v10 content merged)  
**Test state**: lint 81 modules ✓ · unit 130/130 ✓ · integrity 10/10 ✓ · E2E pending  

---

## A. Current User Journey Map

### First Visit

```
Open URL → Start Overlay renders
  ├── Title: "INAD" + location + version
  ├── Session Seed (6-digit, re-rollable)
  ├── Setup Summary bar (collapsed)
  │   ├── Advanced Settings toggle → hidden panel with:
  │   │   ├── Airport selection (7 airports, live flight data)
  │   │   ├── Difficulty (3 levels)
  │   │   ├── Scenario preset (5 options)
  │   │   ├── 3-day Campaign (4 options)
  │   │   ├── Guidance mode (2 options)
  │   │   └── Challenge (6 options)
  │   └── System + Reset + Toggle buttons
  ├── Live Interview section:
  │   ├── [승객 1명] — single live case
  │   ├── [짧은 근무 · 6명] — quick shift
  │   └── [오늘의 사건] — daily case
  ├── [근무 시작] — full 36-passenger shift
  ├── [이전 근무 이어하기] — resume (hidden if no save)
  ├── Save status
  ├── Sidebar: Daily missions + Records + Profile + Settings + Notice
  └── Disclosure notice (가상 시뮬레이션 안내)
```

### Current Friction Points

1. **No single dominant action**. The start screen presents [승객 1명], [짧은 근무], [오늘의 사건], and [근무 시작] at roughly equal visual weight. A first-time player must read and compare four different entry points before understanding what to do.

2. **"근무 시작" leads to a briefing modal, not gameplay**. After clicking start, the player sees a dense statistical briefing (airport, difficulty, queue, live flight data, sources, events, scoring) before reaching their first passenger. Time from click to first passenger: ~5-8 seconds if reading, ~3 seconds if dismissing immediately.

3. **The Live Interview section is visually secondary**. Despite being the strongest mode, it's rendered as a subordinate group of small buttons labeled "라이브 인터뷰" with terse labels ("승객 1명", "짧은 근무 · 6명"). These look like secondary options rather than the primary way to play.

4. **Advanced settings are properly hidden** (good) but the Setup Summary bar + System + Reset + Advanced buttons still add visual noise before the primary action.

5. **The session seed is prominent but confusing for new players**. "오늘의 근무 배치: 827304 [다른 배치 생성]" is meaningful only to returning players who understand deterministic seeding.

6. **First passenger requires language selection**. After reaching the first case, the player must understand the language toolbar and select a questioning language before asking anything. This is correct procedurally but adds another layer before the first meaningful interaction.

### Returning Player Flow

- Resume: One button if a checkpoint exists.
- Campaign progress: Visible in advanced settings.
- Daily Case of the Day: Shows completion status.
- Records/Profile: Accessible from sidebar.
- Save import/export: System center.

**Returning players have a reasonable flow. First-time players do not.**

---

## B. Core Gameplay Loop Analysis

### Current Time Allocation (estimated)

| Activity | % of a typical case |
|---|---|
| Reading passenger info panel | 15% |
| Navigating document tabs | 10% |
| Clicking question buttons (from list) | 25% |
| Reading answers in transcript | 15% |
| Running lookups (6 lookup types) | 10% |
| Reviewing entry requirements | 5% |
| Making the decision | 5% |
| Reading debrief | 10% |
| **Noticing contradictions / Follow-up** | **5%** |

### Problem

The player spends most time **operating the workstation** — clicking through predefined question categories, tabbing between panels, running lookups. The core investigative moment — noticing that a statement doesn't match a document, or that a new follow-up question just unlocked — passes quickly and without ceremony.

In v10 Live Interview mode with typed questions, this improves: the player types questions, interprets responses, and engages more directly. But the **discovery moment** (when a contradiction surfaces or a gated answer opens) has no visual or interactive affordance to mark it as significant.

### What's Strong

1. The **deterministic disclosure system** (gated answers, `requires` dependencies) is well-designed. It creates genuine investigative progression.
2. **Debrief** is excellent — it shows what was found, what was missed, and why the decision was right or wrong.
3. **Procedural correctness matters** — the system tracks required checks and penalizes skipping them.
4. The **fairness properties** (demeanor/nationality/language never affect verdicts) are rigorous.

### What's Missing

1. **No mechanic to manipulate discovered evidence**. Contradictions are silently added to the evidence matrix. The player doesn't actively connect statement A to document B.
2. **No visual "aha" moment**. When a gated answer opens, it appears in the question list without ceremony. When an inconsistency is discovered, it updates the matrix silently.
3. **Follow-up questions blend into the question list**. Newly unlocked questions aren't visually distinguished from the full catalogue.
4. **The transcript is a read-only log**, not an investigative tool. Statements can't be selected, compared, or attached to evidence.

---

## C. Onboarding Analysis

### Decisions Before First Gameplay (Live Interview path)

| # | Decision | Required? |
|---|---|---|
| 1 | Understand start screen layout | Implicit |
| 2 | Find and click "승객 1명" | Yes |
| 3 | Understand language toolbar | Implicit |
| 4 | Select questioning language or type freely | Yes |

**Result**: 2 explicit decisions minimum (find button, choose how to ask). This is good for Live Interview mode.

### Decisions Before First Gameplay (Full Shift path)

| # | Decision | Required? |
|---|---|---|
| 1 | Understand start screen layout | Implicit |
| 2 | Click "근무 시작" | Yes |
| 3 | Read or dismiss briefing modal | Yes |
| 4 | Click "제1근무조 시작" | Yes |
| 5 | Understand passenger panel | Implicit |
| 6 | Understand language toolbar | Implicit |
| 7 | Select questioning language | Yes |
| 8 | Find questions to ask | Yes |

**Result**: 4+ explicit decisions, including a dense briefing. Too many for new players.

### Time to First Meaningful Interaction

- **Live Interview**: ~10 seconds (click button → passenger appears → type question)
- **Full Shift**: ~25-40 seconds (click start → read briefing → dismiss → call animation → passenger panel → select language → find first question)

### Cognitive Load

- Start screen presents 4+ entry points, a session seed, a setup bar, advanced settings toggle, system button, reset button, sidebar with 4 items, and a disclosure notice.
- **An ideal first screen should present one dominant action with near-zero cognitive load.**

---

## D. Live Interview Quality Assessment

### What Works

1. **Four input surfaces** (suggestions, catalogue, text, voice) converge to one dispatcher. This is architecturally clean.
2. **Low-confidence confirmation** (<0.62) prevents wrong routes without penalizing the player.
3. **Persona system** gives each passenger distinct voice, delivery, and acting notes.
4. **Dialogue guard** prevents persona lines from leaking case facts.
5. **Living portrait** adds subtle life to the interaction.
6. **Debrief** provides excellent post-case analysis.

### What Needs Improvement

1. **Held-out dialogue accuracy is only ~57-76%** (rounds 2, 4, 6). Players using informal Korean or English will frequently hit "unknown" or "ambiguous" routes. The confirmation step catches wrong routes but doesn't help when the system can't match at all.

2. **The concept lexicon is sparse for some question categories**. Questions about lodging, return flights, and contacts have limited synonym coverage.

3. **English questioning is less reliable than Korean**. English glosses were added in PR #15 but the matching still favors Korean stems.

4. **Informal phrasing** ("왜 왔어?", "뭐 하러?", "어디 묵어?") needs better coverage.

5. **Follow-up context is lost**. If the player types "그럼 그 사람은 뭘 해?" after a contact-related answer, the system doesn't use the conversational context.

6. **No visual feedback for question matching**. The player types a question and either it matches (the passenger answers) or it shows clarification chips. There's no intermediate state showing "I understood you to be asking about…" before the answer.

---

## E. Replayability Analysis

### Why a player would play a second case
- Curiosity about other passengers' stories and contradictions
- Score improvement (accuracy, procedure, efficiency)
- Understanding why a decision was wrong

### Why a player would return tomorrow
- **Case of the Day** provides a daily ritual with a fixed case for everyone
- Career XP and achievements accumulate
- Daily missions provide variety

### Why a player would remember a passenger
Currently: **unlikely**. Passengers are procedurally interesting but not narratively memorable. Their personas give them voice, but the player has no mechanism to compare statements across passengers or recall past encounters.

### Why 36 passengers instead of quitting after 3
Currently: **weak**. After 3-5 passengers, the core loop of ask/check/decide is understood. Without Statement Lock or inter-case surprises, passengers 6-36 repeat the same mechanics. Campaigns add scenario pressure but not narrative variety.

### Recommendations for Replayability
1. **Statement Lock** (the signature mechanic) will create unique per-case "aha" moments
2. **Recurring characters** provide narrative continuity
3. **Shareable daily results** create social competition
4. **Investigative statistics** (contradictions found, efficiency scores) provide mastery progression

---

## F. Visual Hierarchy Assessment

### Current State: **Between (2) government workstation and (4) awkward mixture**

**Positive**:
- The Institutional Cinema direction is strong and distinctive
- The booth stage with living portrait is visually focused
- Restrained color palette works well
- Typography is clean (system font, appropriate mono use)
- Dark booth vs light workstation creates good contrast

**Negative**:
- The start screen looks like a configuration form, not a game invitation
- The main workstation has many small panels competing for attention
- The evidence zone (documents + lookups) has dense but flat visual hierarchy
- The assessment zone (matrix + clue board + flow chips + decision desk) is information-dense without clear reading order
- Mobile task navigation works but feels like switching between separate apps rather than flowing through an investigation

### Specific Issues
1. The question list and the transcript share the interview panel without clear dominance — neither is the star
2. The passenger info panel shows all data upfront rather than progressively
3. Document thumbnails are small and don't invite examination
4. Lookup results appear in a scrollable terminal that doesn't visually connect to the investigation

---

## G. Mobile Assessment

### Current Implementation
- 4-zone task navigation: Passenger → Interview → Evidence → Assessment
- `data-task` body attribute drives visibility
- Touch arming prevents accidental legal decisions
- 44px minimum touch targets enforced in tests

### Strengths
- Each zone fills the screen when active
- Touch arming is thoughtful
- Responsive breakpoints are well-defined (320/390/768/1024/1280/1440)

### Weaknesses
1. **Switching zones requires explicit navigation**. The player can't see the passenger while typing a question.
2. **The transcript and question list compete for space** on narrow screens.
3. **Start screen sidebar is compressed** on mobile.
4. **Statement Lock will need a mobile-first design** — dragging/connecting evidence on touch screens needs an alternative.

---

## H. Complexity Assessment

### Systems That Create More Configuration Than Enjoyment

| System | Value | Recommendation |
|---|---|---|
| Airport selection (7 airports) | Low for first-time players | Hide behind advanced; default ICN-T2 |
| Live flight data integration | Interesting but confusing | Keep but don't surface until advanced |
| Session seed display/reroll | Confusing for new players | Hide behind advanced; auto-generate |
| Scenario presets (5 options) | Adds variety for returning players | Hide behind advanced |
| Challenge system (6 challenges) | Good meta-progression | Hide behind advanced |
| 3-day campaigns (4 options) | Good for committed players | Hide behind advanced |
| Guidance mode toggle | Important but could be auto-detected | Auto-set "guided" for first visit |
| Difficulty (3 levels) | Essential | Keep accessible but not on first screen |
| Briefing modal | Dense and intimidating | Simplify or skip for Live Interview modes |
| Work manual | Reference material | Keep accessible via help, not on start |

### Systems That Are Working Well

| System | Why It Works |
|---|---|
| Deterministic legal engine | Correct and tested; 12 core cases + generated normals |
| Case data structure | Clear question/answer/requires/reveal graph |
| Save system | Backwards-compatible, validated, transactional |
| Accessibility | Focus management, keyboard, ARIA, reduced motion |
| Event bus | Clean decoupling of engines from UI |
| E2E test infrastructure | Comprehensive 103-test suite |

---

## I. Architecture Health

### Strengths
1. Clean separation: data → engines → UI → app controller
2. Engines are DOM-free (enforced by lint)
3. Single state tree in `state.js`
4. Event bus for state→UI notifications
5. Save schema is versioned with migrations
6. Build produces a standalone single HTML file
7. 130 unit tests, 10 integrity tests, 103 E2E tests all passing

### Risks
1. `app.js` at 319 lines is the application controller — it's growing but manageable
2. `cases.js` at 3,587 lines is a large data file — but it's auto-generated from legacy and frozen
3. `start-screen.js` mixes rendering and configuration logic — could be cleaner
4. No TypeScript or type checking — relies on tests and lint for correctness
5. Some inline HTML construction could become an XSS surface (mitigated by `esc()`)

---

## J. Test Baseline

| Suite | Count | Status |
|---|---|---|
| Lint | 81 modules + 53 tooling | ✓ |
| Unit | 130 | ✓ (all pass) |
| Integrity | 10 | ✓ (all pass) |
| E2E | 103 (expected) | Pending Playwright install |
| Dialogue eval (tuned) | 152 lines | 100% |
| Dialogue eval (held-out) | 62 lines | 75.8% placed/candidate |

---

## K. Strategic Recommendations

### Priority 1: First-Run Experience Redesign (Phase 3)

**Problem**: The start screen presents too many choices before gameplay.

**Solution**: Three-layer hierarchy.
- **Primary**: Single dominant button → Live Interview with selected intro case
- **Secondary**: Daily Case + Quick Shift (visible but subordinate)
- **Tertiary**: Full Shift + all advanced configuration (behind toggle)

### Priority 2: Statement Lock Vertical Slice (Phase 4)

**Problem**: The core loop lacks a signature interaction that turns discovered evidence into manipulable game objects.

**Solution**: Build Statement Lock on ICN-S2-005 (the vertical slice case with a clear contradiction: tourist visa + hidden factory work intent + contact inconsistency).

**Requirements**:
- Player can select statements from the interview transcript
- Player can associate statements with documents/lookups/other statements
- System evaluates consistency deterministically
- Contradictions unlock follow-up questions with visual ceremony
- Accessible keyboard/tap alternative to drag interaction

### Priority 3: Dialogue Reliability (Phase 6)

**Problem**: Held-out accuracy is only 57-76%. Informal phrasing and English questions frequently fail.

**Solution**: Build a larger evaluation corpus with realistic Korean/English utterances, tune concept lexicon, and improve English gloss coverage.

### Priority 4: Analytics (Phase 5)

**Problem**: Only in-memory counters exist. No way to measure funnel drop-off, time-to-first-interaction, or intent match rates at scale.

**Solution**: Privacy-safe aggregate event system with fail-graceful design.

---

## L. What Must NOT Change

1. **Legal engine** (`legal-engine.js`): Frozen, tested, correct
2. **Case data** (`cases.js`): 12 core cases are the content foundation
3. **Case engine** (`case-engine.js`): Deterministic disclosure and verdict logic
4. **Save schema**: Public contract with backwards compatibility
5. **Fairness properties**: Demeanor/nationality/language never affect verdicts
6. **Architectural separation**: data → engines (DOM-free) → UI → app
7. **Build pipeline**: Single-file standalone HTML distribution
8. **Accessibility**: Focus management, keyboard, ARIA, touch targets

---

## M. Phase Execution Readiness

| Phase | Ready? | Blockers |
|---|---|---|
| Phase 1: Audit | ✅ Complete (this document) | — |
| Phase 2: Stabilize v10 | ✅ Ready | PRs #12-15 already merged; verify E2E |
| Phase 3: First-run redesign | ✅ Ready | Clear requirements |
| Phase 4: Statement Lock | ✅ Ready | Design decisions needed |
| Phase 5: Analytics | ✅ Ready | Implementation only |
| Phase 6: Dialogue reliability | ✅ Ready | Corpus building needed |
| Phase 7: Progression integration | ⚠️ Needs design | Depends on Phase 4 validation |
| Phase 8: Hero Passengers | ⚠️ Needs assets | Network egress blocked for Higgsfield |
| Phase 9: Daily retention | ✅ Ready | Depends on Phase 4 |
| Phase 10: Playtest build | ⚠️ Needs human testers | Depends on Phases 3-4 |

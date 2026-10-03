# INAD v11 — Playtest & Evaluation Guide
**Next-Generation Procedural Investigation Simulation**

---

## 1. Overview & Positioning

INAD is an immigration inspection and procedural interview simulation game. In v11, it is positioned not merely as a workstation simulator, but as:

> **A conversation-driven procedural investigation simulator where statements become manipulable evidence.**

The central gameplay loop is:
```
ASK (Free text / Voice / Suggestion)
  → LISTEN (Voice delivery & acting mood)
  → RECORD (Official transcript)
  → COMPARE (Statement Lock · 진술 대조)
  → NOTICE (Discrepancy against records)
  → FOLLOW UP (Targeted questioning)
  → VERIFY (System lookups & forensics)
  → DECIDE (Clear / Refusal / Referral / Investigation)
  → DEBRIEF (Procedural breakdown & clues missed)
```

### Core Architecture Principles
1. **AI is an Actor/Interpreter**: AI models interpret player natural language and voice, and provide non-factual acting flavor.
2. **Deterministic Engine Authority**: All facts, statutory grounds (출입국관리법 제12조 등), evidence discovery, scoring, and verdict correctness are strictly owned by deterministic engines (`legal-engine.js`, `case-engine.js`, `statement-lock-engine.js`).
3. **Zero-Leak Privacy & Offline-First**: Zero-PII offline aggregate telemetry (`inad-analytics-v11`), zero external fonts/audio/CDNs, single standalone executable artifact (`dist/index.html`).

---

## 2. Key v11 Innovations for Evaluators

### A. Redesigned First-Run Experience (3-Tier Visual Hierarchy)
- **Primary Tier**: A dominant, high-contrast action button (**인터뷰 시작**). One click enters Live Interview directly with zero configuration friction.
- **Secondary Tier**: Prominently displays **오늘의 사건** (Case of the Day) and **짧은 근무 · 6명** (Quick Shift) as fast, low-friction entry points.
- **Tertiary Tier**: Advanced simulation settings, operational difficulty, scenarios, and 3-day campaigns are tucked into collapsible details (**근무 설정 및 고급 옵션**) so beginners are not overwhelmed by administrative forms.

### B. Statement Lock (진술 대조) Signature Mechanic
- **Evidence Dock**: When a passenger makes a statement in the interview transcript, clicking `[진술 고정]` pins the quote into the bottom evidence dock.
- **Cross-Examination**: With a statement locked, clicking `[대조]` on any submitted document field (e-Arrival card, visa, return ticket, hotel reservation) or system record (출입국기록, 국내관계, 공개정보, 사증정보) executes deterministic fact verification.
- **Contradiction Discovery**: Direct conflicts (e.g. claiming tourism while hotel booking reveals a job recruiter phone number, or claiming staying at friend's house while host name contradicts immigration records) trigger instant alerts, discover clues, and unlock critical follow-up questions.

### C. Live Interview Progression Integration
- Completing a 6-passenger **Quick Shift** persists career XP, passenger counts, clean evaluations, and advances daily missions.
- **Case of the Day** provides a spoiler-free daily summary card with visual clue indicators (`🟩🟩⬜`) and shareable text.
- Level progress (`Lv.1` ~ `Lv.8`), titles (신규 배치 ~ 수석 심사관), and achievements accumulate reliably without corrupting full 36-passenger shift records.

---

## 3. Playtest Participant Cohorts & Scenarios

### Cohort A: General Players & Casual Gamers (Usability & First Impression)
*Profile: Players who enjoy casual narrative, mystery, or puzzle games without prior legal knowledge.*

- **Scenario 1: First-Run 1-Click Live Interview**
  - **Objective**: Start the game from the landing screen, understand the task within 30 seconds, and interview passenger Tran Van Minh (ICN-S2-005).
  - **Key Observation Points**:
    - Does the player notice and click `#liveStartBtn` immediately?
    - How quickly does the player figure out how to ask questions (typing, voice, or suggestion chips)?
    - Does the player understand the role of the Vietnamese interpreter button (`#langInterp`)?
    - Does the player try `Statement Lock (진술 대조)` on the passenger's accommodation or purpose statements?
  - **Success Criteria**: Passenger is screened to a verdict within 4 minutes without feeling lost; debrief modal is read and understood.

- **Scenario 2: Case of the Day & Share Card**
  - **Objective**: Complete today's daily case and copy the shareable summary.
  - **Key Observation Points**:
    - Does the player feel motivated to share their result?
    - Are any spoilers revealed in the copied text?

---

### Cohort B: Simulation & Strategy Enthusiasts (Game Mechanics & Replayability)
*Profile: Fans of Papers, Please, Return of the Obra Dinn, Ace Attorney, or detective simulations.*

- **Scenario 1: Quick Shift (6 Passengers) with Statement Lock Mastery**
  - **Objective**: Complete all 6 passengers in Quick Shift (`#quickStartBtn`), actively locking statements and comparing them against documents and lookups.
  - **Key Test Cases in Roster**:
    - Passenger 1 (`ICN-S1-001`): Routine business clear. Verify fast throughput without unnecessary secondary inspection.
    - Passenger 4 (`ICN-S2-006`): Friend-booked hotel. Use Statement Lock on hotel booking vs passenger statement to identify legitimate explanation.
    - Passenger 5 (`ICN-S2-005`): Job seeking suspicion. Lock contact number and compare with domestic relation lookup to uncover broker conflict.
    - Passenger 6 (`ICN-S3-011`): Principled refusal of biometrics. Follow statutory refusal and repatriation procedures.
  - **Success Criteria**:
    - Player successfully uncovers contradictions via Statement Lock.
    - Summary screen displays earned XP chip, average procedure compliance, and level progress.

- **Scenario 2: Replayability & Career Progression**
  - **Objective**: Review player profile (`#profileBtn`), achievements, and records center (`#recordsBtn`).
  - **Key Observation Points**:
    - Does the player feel a sense of progression across repeated shifts?
    - Is the level orb and XP track motivating?

---

### Cohort C: Domain Experts & Legal/Compliance Reviewers (Procedural Authenticity)
*Profile: Immigration law researchers, legal designers, public policy analysts, or administrative simulation reviewers.*

- **Scenario 1: Statutory Compliance & Burden of Proof Audit**
  - **Objective**: Test edge cases under the Korean Immigration Act (출입국관리법) and Refugee Act (난민법):
    - Article 12 §3 / §4 burden of proof for entry conditions.
    - Article 11 entry prohibition grounds (prior deportation orders).
    - Refugee Act Article 6 (airport refugee application referral vs non-referral).
    - Special Judicial Police (특사경) forensic review and emergency arrest under Criminal Procedure Act Article 200-3.
  - **Key Observation Points**:
    - Does the game strictly maintain that passenger demeanour, facial expressions, nervous speech, and language barriers are *not* evidence?
    - Are legal grounds cited with exact statutory articles in the decision documents and debrief?
    - Does the system maintain fail-closed security against procedural shortcuts?
  - **Success Criteria**: Zero statutory discrepancies; legal correctness is preserved 100% independently of UI acting layers.

---

## 4. Evaluator Telemetry & Observation Scorecard

Evaluators can open the **System Center (시스템 센터)** via `#systemBtn` or `F1` to inspect local telemetry and diagnostics:

| Metric Category | Target Indicator | Observation Method |
|---|---|---|
| **First Interaction Speed** | First question asked < 25s | Time from `#liveStartBtn` click to first log entry |
| **Input Modality Distribution** | Healthy mix of Suggestion (40%), Direct Text (35%), Voice (15%), List (10%) | Check `INADTest.interview().counts` in DevTools |
| **Statement Lock Usability** | Player locks at least 1 statement per case | `INADTest.analytics.get().funnel.statement_locks` |
| **Contradiction Detection** | Correctly identifies contradictory pairs | Check clue discovery log (`state.discoveredClues`) |
| **Procedural Compliance** | Procedure score ≥ 85% on standard cases | End-of-case debrief summary card |
| **Zero-Leak Privacy** | Zero network calls outside approved endpoints (`/api/airport-load`, `/api/npc`) | Browser Network tab inspection |

---

## 5. Verification Commands for Reviewers

```bash
# 1. Run full unit test suite (138 tests)
npm run test:unit

# 2. Run standalone artifact integrity tests (10 tests)
npm run test:integrity

# 3. Run zero-warning linter (83 modules)
npm run lint

# 4. Run Korean text UX quality lint (0 blocking findings)
node ~/dev/korean-language-quality/bin/kolint.mjs --genre ux src/

# 5. Run full Playwright E2E suite
npm run test:e2e

# 6. Verify single-file standalone distribution build
npm run build
```

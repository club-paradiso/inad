# INAD v10.0 — Next-Generation Product & Gameplay Rebuild

Release 10.0.0 · build 2026.10.03 · legal baseline 2026-09-07 (unchanged) · data v6.1 (unchanged) · save bundle schema 1 (unchanged)

## Version numbering

| Release | What it was | Version metadata |
|---|---|---|
| v6.1 | original production build, frozen in `legacy/v6.1/` | 6.1 |
| v7.x | modular rebuild · legal-source audit · console UX | 7.0 → 7.2.0 |
| v8.x | adaptive workstation (one DOM, phone/tablet/desktop) | shipped as "7.2" |
| v9.0 | stability, reliability, and security overhaul | 9.0.0 |
| v10.0 (this release) | next-generation product & gameplay rebuild | 10.0.0 everywhere |

`tests/integration/release-metadata.test.js` keeps `package.json`, the lockfile, `RELEASE` (UI label, diagnostics, save-bundle metadata), the pre-boot HTML placeholders, the build banner, the README and this file strictly in step.

## Core Features & Gameplay Innovations

### 1. 3-Tier First-Run UX & 1-Click Start
- **Primary Hero Action**: Prominent, single-click **인터뷰 시작** (`#liveStartBtn`) launching directly into introductory live interview without prior configuration friction.
- **Secondary Modes**: **오늘의 사건** (`#dailyCaseBtn`) and **빠른 근무** (`#quickStartBtn`) immediately available.
- **Tertiary Progressive Disclosure**: Advanced simulation configurations (difficulty, operational scenarios, campaign carry, fatigue rules) cleanly tucked into collapsible details without cluttering newcomers.

### 2. Signature Mechanic: Statement Lock (진술 대조)
- **Manipulable Evidence**: Passenger statements from the interview transcript can be pinned (`[대조]`) and compared against submitted documents or terminal lookup records.
- **Deterministic Contradiction Engine**: Pure deterministic logic (`statement-lock-engine.js`) evaluating legal inconsistencies without hallucination:
  - `ICN-S2-005` (Tran Van Minh): Illegal broker contact, tourist visa vs factory job intent, unknown lodging host, insufficient funds.
  - `ICN-S2-007` (Maria Santos): C-3-9 tourist visa vs massage parlor work intent, unverified hotel, return flight discrepancy.
  - `ICN-S3-009` (Elena Rostova): Broker passport acquisition, biometric mismatch & altered datapage, message deletion.
  - `ICN-S3-010` (Ahmed Al-Mansoor): Economic work motives vs convention persecution claim.
  - `ICN-S3-011` (Bikash Thapa): Biometric submission refusal lacking statutory exemption.
  - `ICN-S3-012` (Kenji Morita): Active 5-year deportation ban on watchlist vs tourist entry claim, lack of permission waiver.
- **Avatar Acting Integration**: Detecting a contradiction triggers dynamic hesitation (`setStageState('hesitant')`) on the passenger portrait.

### 3. Tactile Procedural Web Audio Synthesis (Zero Assets)
- Completely synthesized via browser native `AudioContext` with zero external audio files (.mp3, .wav):
  - `stampThud()`: Satisfying administrative rubber-stamp impact (*clack-thud*) on decision execution.
  - `paperOpen()`: Soft paper slide rustle when switching documents and workbench tabs.
  - `lockPin()`: Crisp mechanical pin click on statement capture.
  - `lockConflict()`: Three-tone descending tension interval discovery chime upon revealing contradictions.
  - `lockConsistent()`: Gentle harmonic chord for non-conflicting checks.
- Safe fallback in Node / headless test environments.

### 4. Dialogue Engine Reliability & Intent Matching
- Expanded corpus to 306 benchmark utterances across Korean and English with 100.0% accuracy (0 wrong routes).
- Tuned ambiguity margin (`0.11`) allowing compound queries (e.g. `"돈이랑 귀국편은요?"`) to cleanly surface candidate disambiguation chips.

### 5. Privacy-Safe Product Telemetry (`inad-analytics-v11`)
- Zero-PII offline aggregate telemetry tracking session funnel, question input distributions, and Statement Lock discovery rates.
- In-game telemetry inspector accessible in **시스템·데이터 관리** → **플레이 통계 확인**.
- Strict privacy guarantee: no audio recordings, no typed text, and zero network calls.

### 6. First-Duty Onboarding Coach
- Subtle, non-intrusive in-context coaching for first-time examiners:
  - Step 1: Suggests checking basic purpose and stay duration.
  - Step 2: Highlights `[대조]` pin on contradictory answers.
  - Step 3: Guides examiner to the decision desk upon discovering clues.
- Automatically marks completed after Case 1 and is dismissible at any time.

### 7. Mobile Touch Ergonomics & Virtual Keyboard Adaptation
- Bottom sheet drawer docking for Statement Lock on narrow viewports (`<= 767px`).
- Dynamic `window.visualViewport` height tracking preventing mobile software keyboards from obscuring the question bar.
- Push-to-talk recording pulse animation on microphone button.

### 8. Case of the Day Retention Cards
- Spoiler-free daily challenge share cards featuring visual progress blocks (`🟩🟩⬜`), clue discovery KPI chips, and compliance percentages.
- Preserved save isolation for Case of the Day (`inad-daily-v10` contract).

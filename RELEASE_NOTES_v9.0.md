# INAD v9.0 — Stability & Product Quality Overhaul

Release 9.0.0 · build 2026.10.01 · legal baseline 2026-09-07 (unchanged) · data v6.1 (unchanged) · save bundle schema 1 (unchanged)

## Version numbering

| Release | What it was | Version metadata at the time |
|---|---|---|
| v6.1 | original production build, recovered and frozen in `legacy/v6.1/` | 6.1 |
| v7.0 · v7.1 · v7.2 | modular rebuild · legal-source audit · workstation console UX | 7.0 → 7.2.0 |
| v8 (PR #10) | adaptive workstation (one DOM, phone/tablet/desktop) | **not bumped**: shipped to production as "7.2" while `docs/*-v8.md` called it v8 |
| v9.0 (this release) | stability & product-quality overhaul on top of the v8 workstation | 9.0.0 everywhere |

v9.0 skips the never-labelled v8 number because the repository's documentation already uses "v8" for the
adaptive workstation. From v9.0 on, `tests/integration/release-metadata.test.js` keeps `package.json`, the
lockfile, `RELEASE` (UI label, diagnostics, save-bundle metadata), the pre-boot HTML placeholders, the build
banner, the README and this file in step.

## What did not change
- Verdict logic, case data, refusal reasons and procedure state machines: `legal-engine.js`, `case-engine.js`
  and `src/data/cases.js` are byte-identical to `main`. The legal baseline date stays 2026-09-07.
- Save keys and schemas (`inad-meta-v54` v2, `inad-progress-v54` v1, `inad-campaign-v58` v1, bundle schema 1).
  One preference key was added (`inad-shortcuts`), carried in the bundle like the other post-v6.1 preferences.
- The test hook (`window.INADTest`), seeded rosters and the v6.1 parity suite.

## Reliability
- **No more soft-locks.** A decision notice, case result, shift transition, game over or final evaluation
  can no longer be dropped by Escape, the backdrop, × or a double-click; after closing the repatriation or
  secondary procedure screen the decision desk offers a way back in. A shortcut can no longer replace an
  open dialog.
- **Saves.** Every stored shape is validated before use (meta, checkpoint, campaign, bundle); a corrupt key
  no longer breaks boot or resume; import is transactional and escapes stored text; a save written by a
  newer version is refused instead of overwritten; resuming is limited to the start screen (mid-shift it
  would erase penalties); a checkpoint at a shift boundary or at 36/36 resumes into the right dialog; an
  unlawful-arrest ending is recorded and survives reload.
- **`/api/airport-load`.** Bounded upstream timeout, malformed / HTML / error payloads, unknown upstream
  shapes (fail closed), missing credentials, invalid or repeated `airport` parameters, codeshare duplicates,
  pagination, the midnight window, a 2-minute cache with a 60-second failure TTL and a 20-minute stale
  fallback; the client has its own timeout and the start button no longer races resume.
- **Build.** A release-corrupting bug (regex replacement strings in the bundler) is fixed and the built page
  is compile-checked; the boot contract covers every id the UI dereferences (86, was 15).
- **Legal metadata.** The 형사소송법 amendment in force from 2026-10-02 is dated: from that day the system
  centre says it is in force and diagnostics warn instead of passing (the 긴급체포 requirements were checked
  against the in-force text, `docs/legal-review.md` item 3).

## Workflow and procedures
- Every procedure screen (입국재심, 난민 회부심사, 출입국사범 조사, 긴급체포 요건 검토, 송환지시, 출국대기실)
  shows the person, the current step, the whole sequence, what is not available yet and why, the record it
  is based on, and a way back; it covers the workstation completely while open.
- Every control that moves a legal procedure arms on the first touch and runs on the second, with a visible
  and announced "다시 눌러 확정"; disabled decisions say why.

## Accessibility
- The workstation is inert behind the start screen; focus survives dialog chains and lands on the next
  passenger, never on `<body>` or a decision button; the guided tour contains and returns focus.
- Settings are labelled switches; single-character shortcuts can be turned off (`단축키 사용`) and never act
  behind a dialog; question and document tabs follow the tab pattern; the transcript and lookup results are
  announced once per line; the strike count is text with one mark per allowed strike (6 / 4 / 3).
- Non-colour state cues (alert documents, finished steps, party status), forced-colors rules, OS
  `prefers-contrast` applies the 고대비 tokens, inset focus rings in scroll lists, `lang="ko"` on Korean case
  data in the English UI.

## Responsive and visual
- Phone task bar, phone header and landscape phones work; no page scrolls sideways from 320 to 1440 px; every
  touch target the adaptive suite measures is at least 44×44.
- The interview keeps room for its question list (93 px at 1280×800; 11 px in the audit).
- Demeanour, tension, cooperation and communication status are neutral greys (they used the admit / refuse
  colours); verdict tones are reserved for verdicts and continuations use the accent primary; monospace only
  for codes and digits; Korean words do not break mid-word; decorative English labels only in the English UI.
- Astra (Figma `[Exploration]`) was compared area by area. v9 keeps the current information architecture and
  takes Astra's restraint (neutral non-judgement values, armed-state text, disabled reasons), not its layout.
  The code → Figma sync is listed in `docs/figma-workspace-spec.md` §9.

## Verification
See `docs/qa-v9.md`: lint, 106 unit, 10 integration, 83 E2E on the release build, 19 E2E on the v6.1
baseline (64 v9-only tests skipped there), 19 E2E on the native-ESM source, and an eight-viewport sweep
with zero errors and zero overflow.

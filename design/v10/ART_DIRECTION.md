# INAD v10 — Art direction (INSTITUTIONAL CINEMA)

## Intent
Make the examiner feel a person is across the counter, while every pixel of the workstation still reads as credible
operational software. Documentary, not editorial: ordinary people, ordinary light, real places.

## Layers
| Layer | Look | Where |
|---|---|---|
| Workstation | v9 calm institutional UI, light surfaces, semantic colour for legal state only | evidence, assessment, chrome |
| Human interview | dark booth window, full-bleed portrait, subtitle, observational motion | `.zone-person` booth |
| Meta game | editorial case-file typography, debrief as a dossier page | start screen, debrief, records |

## Composition decision (2026-10-02)
Three functional prototypes, same real case and the real avatar runtime (`design/v10/prototypes/`, screenshots in
`design/v10/review/`):
- **A · Institutional Cinema** — booth column + conversation + evidence/decision. Strongest balance: the person is
  present at all times and the examiner can still investigate without opening dialogs. **Chosen.**
- **B · Documentary Terminal** — 56 % of the height is a camera feed with subtitles. Most cinematic, but large empty
  dark areas beside a 4:5 portrait, documents cramped, decision column mostly empty — fails "no dead space" and "see
  enough evidence without modal hell". **Rejected**; its subtitle-on-image is kept.
- **C · Neo-Bureaucratic** — the transcript as a typeset 문/답 record on paper. Best typography, but the passenger becomes
  a file photo — fails "sitting across the desk". **Rejected**; its official-record transcript idea is kept
  (speaker column, "기록 질문" line, off-record marking).
Implemented as A with C's record and B's subtitle, in the existing four-zone DOM (no duplicate trees).

## Higgsfield pipeline (official tooling only)
Tooling: `@higgsfield/cli` (npm, v1.1.26 checked 2026-10-02; postinstall downloads the `hf` binary from GitHub
releases and verifies SHA-256), official skills `higgsfield-ai/skills` (generate, soul-id, …; no game-generation
skill as of 2026-09-26 per the research review). Identity continuity: **Soul ID** trained from approved generated
reference frames of the same fictional person (never real photos — CLAUDE.md forbids real personal data).
Per asset: intent → constraints (this file + LIGHTING/CHARACTER bibles) → ≥ 4 candidates → inspect every candidate at
100 % → reject with a written reason (REJECTED_ASSETS.md) → regenerate from the best reference → record the winner and
why (ASSET_MANIFEST.json, GENERATION_LOG.md) → keep reference inputs under `design/v10/references/<traveler>/` →
integrate only then. Never overwrite an approved asset; new versions get new ids.
Reject a shot when: identity, age, ethnicity, wardrobe or environment drifts; hands deform; lips are unusable;
camera geography breaks; skin is plastic; the face is over-beautified; a real logo, emblem or uniform appears.

**State in this environment:** blocked. The network policy denies `higgsfield.ai` (proxy 403) and GitHub release
downloads, so neither the CLI binary nor the API is reachable, and the browser login cannot run in a headless
container. No generated asset exists yet; nothing is integrated from Higgsfield. See GENERATION_LOG.md for the exact
evidence and the commands queued for the first authorised session.

## Audit of the v9 portrait set (input to regeneration)
105 portraits (320×400 WebP, ~7–9 KB) in two incompatible batches: TRV-0001…0073 slate-blue studio sweep, smiling,
editorial; TRV-0074…0106 light-grey ID-photo style with UI-like borders baked into the image. Common problems: almost
everyone 20–35, over-beautified skin, smiles at an immigration counter, costume shorthand for nationality (keffiyeh /
thobe, flowers in hair), and several faces that do not match the case's nationality or age (REJECTED_ASSETS.md).
They stay as the production fallback until approved replacements exist.

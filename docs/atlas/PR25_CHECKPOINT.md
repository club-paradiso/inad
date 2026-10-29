# International gameplay parity checkpoint

Base: `fea1a133324ac07ac6a4552f3d5d824fa10f7904` (PR #24 merged). On 2026-10-30 PR #25 did not exist and there were no open PRs. Work on `feat/international-gameplay-parity`, never directly on main.

## Completed

- Audited KR queue/interview, international workstation, persistence and PR #24 evidence graph. The Korean interview dispatcher calls the Korean case engine, so it cannot safely be reused for foreign legal outcomes.
- Added an isolated, DOM-free encounter lifecycle (`src/js/engines/atlas-encounter.js`) and tests. It is not wired into the running app or saved state. No jurisdiction-specific decisions are asserted.
- A temporary CA-01 call/UI/save integration was prototyped and exercised in Chromium. It is deliberately **not shipped**: the single-file build grew from 1,741,923 bytes on main to 1,742,868 bytes, exceeding the existing 1,742,113-byte ceiling (15% above 1,514,881). Do not weaken that test. The exploratory patch is available in the task outputs as `pr25-checkpoint/encounter-prototype.patch`; it is not a finished or reviewed solution.
- After removing the prototype integration, `INAD_PORT=4689 npm run qa` passed: lint, 176 unit tests, build, 10 integration tests and 141 Chromium browser tests. The unchanged size limit passed. Existing saved data and Evidence Graph are untouched.
- Exploratory source-only Chromium checks for the prototype call/reload and the existing CA-01 graph flow passed (2 tests), but the prototype is not included in this commit. No shipped new call UI exists.

## Remaining

1. Recover more build-size headroom without changing portraits, weakening tests or silently changing behavior. Measure baseline, add focused tests for any build transform, run built-artifact Korean and Evidence Graph E2E flows.
2. Design additive save schema and migration for an encounter queue/call, including legacy, future, malformed, interrupted and completed cases. Integrate the lifecycle into ATLAS only after those tests. Avoid restarting a previously completed exercise or overwriting graph state.
3. Implement CA-01 face-to-face examination end to end: call passenger, question and answer in a shared transcript, review/compare documents and graph facts, record evidence and rationale, select a clearly fictional outcome, debrief and move to next passenger. Maintain Counter/System state; gate and announce unavailable actions. Do not label simulation rules as official legal dispositions.
4. Provide a shared lifecycle and country-specific configuration so GB/NZ can later use it without the KR legal engine. Preserve KR, other ATLAS cases, accessibility, responsiveness and imports/exports.
5. Run `npm run qa`, targeted browser flows, Korean copy lint and the repository Figma/screenshot workflow. Document all failures and do not claim parity until complete.

## Resume

```sh
git fetch origin
git switch feat/international-gameplay-parity
npm ci
npx playwright install chromium
INAD_PORT=4689 npm run qa
```

Check current `main` and PR list again before opening a PR. No merge or production deployment is authorized.

# INAD: 제12조 — 입국심사관 시뮬레이션 (v9.0)

Fictional immigration-inspection simulation (Korean UI with a selectable English UI, vanilla HTML/CSS/JS, single-file release). One DOM adapts from 320px phones to 1440px+ workstations (승객 · 인터뷰 · 자료 · 판단 task navigation on phones, workspace + inspector on tablets, three-zone desk on desktop).
Production: https://inad-gray.vercel.app

**v10 Live Interview (vertical slice, in review):** talk to the passenger by typing, push-to-talk or suggestions; the
deterministic engines still decide every fact and verdict. Start screen → 라이브 인터뷰. Docs: `docs/v10-product-vision.md`,
`docs/v10-live-interview-spec.md`, `docs/v10-ai-architecture.md`, `docs/v10-avatar-system.md`, `docs/v10-privacy.md`,
`docs/v10-art-direction.md` (+ `design/v10/`), `docs/v10-qa.md`. Optional model: set `INAD_LLM_BASE_URL`,
`INAD_LLM_MODEL` (and `INAD_LLM_API_KEY`) on the server; `npm run eval:dialogue` evaluates intent routing.

- Source of truth: `src/` · release artifact: `dist/index.html` (root `index.html` is the generated mirror)
- Docs: `CLAUDE.md` / `AGENTS.md` (working rules), `docs/architecture.md`, `docs/design-system.md`, `docs/design-workflow.md` (Figma ↔ code), `docs/figma-workspace-spec.md`, `docs/legal-baseline.md`, `docs/legal-review.md`, QA `docs/qa-v9.md` (current) · `docs/qa-v8.md` · `docs/qa-v7.md`, release notes `RELEASE_NOTES_v9.0.md` (current) · `RELEASE_NOTES_v7.0.md` (v7.0–v7.2)
- Figma: [INAD — Adaptive Workstation Design System](https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8)
- Recovery history: `docs/RECOVERY.md`

```
npm install && npm run build && npm test     # npm run qa = lint + unit + build + integrity + E2E
INAD_TARGET=legacy npm run test:e2e           # v6.1 parity (frozen baseline)
INAD_TARGET=src npm run test:e2e              # native ES modules, no bundle
```
E2E needs a Playwright Chromium: `npx playwright install chromium`, or point `INAD_CHROMIUM_PATH` at an
installed one. `INAD_PORT` picks the port when several checkouts test side by side.

## Live airport workload

`/api/airport-load` can use official public flight-status data to create a bounded gameplay workload snapshot for the selected airport. Configure the server-side environment variable below in Vercel:

```
DATA_GO_KR_SERVICE_KEY=<data.go.kr general authentication key>
```

The credential is read only by the Vercel server function and is never bundled into browser JavaScript. If the key or upstream API is unavailable, the game automatically falls back to its static airport preset. `npm run dev` serves the same function locally at `/api/airport-load` (set the variable in your shell to test live data; E2E always runs without it).

- KAC airports (GMP/PUS/CJU/CJJ/TAE/MWX/YNY): 한국공항공사 실시간 항공기 운항정보 조회_GW, data.go.kr `15158625`
- ICN T2: 인천국제공항공사 여객편 운항현황(다국어), data.go.kr `15095093`
- Live flight data only changes bounded queue/arrival and field-event pressure. It never changes entry requirements, traveler risk, or legal outcomes.
- Airport load targets, difficulty ratings, simulated booths and gameplay multipliers are fictional balancing values, not published staffing/capacity metrics.

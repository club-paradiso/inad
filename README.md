# INAD: 제12조 — 입국심사관 시뮬레이션

Fictional immigration-inspection simulation (Korean, vanilla HTML/CSS/JS, single-file release).
Production: https://inad-gray.vercel.app

- Source of truth: `src/` · release artifact: `dist/index.html` (root `index.html` is the generated mirror)
- Docs: `CLAUDE.md` / `AGENTS.md` (working rules), `docs/architecture.md`, `docs/design-system.md`, `docs/legal-baseline.md`, `docs/qa-v7.md`, `RELEASE_NOTES_v7.0.md`
- Recovery history: `docs/RECOVERY.md`

```
npm install && npm run build && npm test
```

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

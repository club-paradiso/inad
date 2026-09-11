# progress.md — INAD v7.0 rebuild

## 완료된 phase
- PHASE 0 baseline audit: GitHub `club-paradiso/inad`에 소스 없음 → 프로덕션 `inad-gray.vercel.app`(v6.1 단일 HTML)을 복구해 `legacy/v6.1/`에 동결. 로컬·Codex·iCloud 어디에도 원본 작업 폴더 없음(ChatGPT/Codex 클라우드에서 개발·배포된 것으로 확인).
- PHASE 1 behaviour freeze: Playwright E2E 19개, v6.1에서 전부 통과.
- PHASE 2–3 modular architecture + data/engine migration: `src/data`, `src/js/engines`, `src/js/ui`, `src/js/app.js`.
- PHASE 4 build pipeline: `scripts/build-single-html.js` (esbuild IIFE + inline CSS + inline WebP).
- PHASE 5–6 Design System v2 + UI rebuild: `src/styles/*.css`.
- PHASE 7 accessibility: focus trap, focus restoration, aria-pressed, Ctrl/Cmd 단축키 충돌 제거, 튜토리얼 포커스 이동.
- PHASE 8 regression: E2E 19개 dist 통과, unit 36개 통과.

## 완료 (v7.1 고증 감사)
- 공개 법령·공식자료 리서치 → `docs/legal-research.md` (Ground Truth Matrix 포함).
- 출처 등록부·규칙 노드·설명형 판단 모델·판단 근거 UI·용어 안내·좁은 화면 fallback.

## 현재 작업
- 릴리스 검증(E2E 전체 재실행)과 PR 준비.

## 발견된 버그 (v6.1 → v7에서 수정)
- 캠페인 연계사건 스트립이 `.app` 그리드 행을 차지해 메인 작업대가 30px로 붕괴 → auto 행으로 분리.
- 메인 3열이 `29%+36%+35%+gap`으로 16px 오버플로(클립) → fr 기반.
- `--navy/--surface/--surface2/--sans` 미정의 토큰 사용 → 토큰 정리.
- 모달 포커스 트랩 부재, 설정 토글에 `aria-pressed` 없음.
- 한 글자 단축키가 Ctrl/Cmd 조합(복사·붙여넣기·인쇄)까지 가로챔.
- `NORMAL_CASES` 정적 배열(68KB)이 정의만 되고 미사용 → 제거.

## 남은 항목
- Vercel 프로덕션 배포 검증(현재 Vercel 프로젝트가 연결된 팀에 없음 — 루트 index.html을 배포하면 됨).
- 조건부 입국허가(제13조)를 플레이 가능한 조치로 설계할지 검토(사건 데이터 필요).
- 하이코리아 단기체류 안내(2013년 갱신본) 대신 최신 사증 세부기호 공식자료 확보 시 입국 근거 분류 보강.

## 중요한 architecture decision
- 개발은 네이티브 ESM(빌드 없이 실행), 배포는 esbuild 번들 단일 HTML. 포트레이트는 파일로 관리하고 빌드 시에만 인라인.
- 저장 키/스키마는 v6.1과 동일 유지, 마이그레이션은 `save-engine.js`에 집중.
- E2E는 `window.INADTest` 훅(seed 고정·큐 점프·상태 조회)만 사용하고 나머지는 실제 UI 조작.

## 마지막 정상 QA 결과
- 2026-09-11: unit 36/36, E2E(dist) 19/19, E2E(legacy) 19/19, lint OK, dist 1,391,510 bytes (v6.1 1,514,881 대비 −8%).

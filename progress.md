# progress.md — INAD v7.0 rebuild

## 완료된 phase
- PHASE 0 baseline audit: GitHub `club-paradiso/inad`에 소스 없음 → 프로덕션 `inad-gray.vercel.app`(v6.1 단일 HTML)을 복구해 `legacy/v6.1/`에 동결. 로컬·Codex·iCloud 어디에도 원본 작업 폴더 없음(ChatGPT/Codex 클라우드에서 개발·배포된 것으로 확인).
- PHASE 1 behaviour freeze: Playwright E2E 19개, v6.1에서 전부 통과.
- PHASE 2–3 modular architecture + data/engine migration: `src/data`, `src/js/engines`, `src/js/ui`, `src/js/app.js`.
- PHASE 4 build pipeline: `scripts/build-single-html.js` (esbuild IIFE + inline CSS + inline WebP).
- PHASE 5–6 Design System v2 + UI rebuild: `src/styles/*.css`.
- PHASE 7 accessibility: focus trap, focus restoration, aria-pressed, Ctrl/Cmd 단축키 충돌 제거, 튜토리얼 포커스 이동.
- PHASE 8 regression: E2E 19개 dist 통과, unit 36개 통과.

## 현재 작업
- PHASE 9 CI/문서/릴리스 산출물, PHASE 10 dead-code 정리.

## 발견된 버그 (v6.1 → v7에서 수정)
- 캠페인 연계사건 스트립이 `.app` 그리드 행을 차지해 메인 작업대가 30px로 붕괴 → auto 행으로 분리.
- 메인 3열이 `29%+36%+35%+gap`으로 16px 오버플로(클립) → fr 기반.
- `--navy/--surface/--surface2/--sans` 미정의 토큰 사용 → 토큰 정리.
- 모달 포커스 트랩 부재, 설정 토글에 `aria-pressed` 없음.
- 한 글자 단축키가 Ctrl/Cmd 조합(복사·붙여넣기·인쇄)까지 가로챔.
- `NORMAL_CASES` 정적 배열(68KB)이 정의만 되고 미사용 → 제거.

## 남은 항목
- 두 번째 미션: 공개 법령 리서치 → Legal Ground Truth Matrix → 근거 추적형 판단 노드/근거 패널/소스 레지스트리.
- Vercel 프로덕션 배포 검증(현재 Vercel 프로젝트가 연결된 팀에 없음).

## 중요한 architecture decision
- 개발은 네이티브 ESM(빌드 없이 실행), 배포는 esbuild 번들 단일 HTML. 포트레이트는 파일로 관리하고 빌드 시에만 인라인.
- 저장 키/스키마는 v6.1과 동일 유지, 마이그레이션은 `save-engine.js`에 집중.
- E2E는 `window.INADTest` 훅(seed 고정·큐 점프·상태 조회)만 사용하고 나머지는 실제 UI 조작.

## 마지막 정상 QA 결과
- 2026-09-11: unit 36/36, E2E(dist) 19/19, E2E(legacy) 19/19, lint OK, dist 1,391,510 bytes (v6.1 1,514,881 대비 −8%).

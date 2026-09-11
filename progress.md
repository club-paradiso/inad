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

## 완료 (v7.1 이후 Codex 작업 인수 · Claude Code)
- Codex가 v7.1 릴리스(14:41) 이후 남긴 ~50개 커밋(UI 영어 모드, 작업대 콘솔 스킨, 업무지침, 부트 워치독, 실시간 공항 운항정보)을 `main` 기준으로 검증.
- 인수 시점 상태: unit 3개 파일 실패, 루트 `index.html` 미갱신(CI stale-mirror 실패), dist 무결성 실패, E2E 19/19 실패.
- 원인·수정:
  - `services/bus.js`가 `boot-watchdog.js`를 import하고 `document`를 직접 참조 → 엔진 단위테스트가 node에서 `window is not defined`로 중단. 워치독은 `app.js` 첫 import로 이동하고 브라우저 환경 가드 추가, 선택형 UI 로더는 `services/ui-enhancements.js`로 분리.
  - 선택형 UI 모듈을 `import(path)`(변수)로 로드 → esbuild가 번들하지 못해 릴리스 페이지에서 `/i18n.js` 등 404, 영어 UI·콘솔 스킨·업무지침이 프로덕션 빌드에서 전부 비활성. 문자열 리터럴 `import('./i18n.js')`로 교체하고 빌드 smoke check·dist 무결성 테스트에 "번들 포함·미해결 import() 없음" 검사 추가.
  - 정적 서버에 `/api/airport-load` 라우트가 없어 E2E에서 404 콘솔 오류 → `static-server.js`가 `api/airport-load.js` 핸들러를 그대로 사용(키 미설정 시 fallback). Playwright는 키 환경변수를 비워 결정적 실행 보장.
  - dist 무결성 테스트가 모든 `fetch(`를 금지 → CLAUDE.md의 유일 예외(same-origin `/api/airport-load`)만 허용하도록 lint와 정합.
  - E2E 8번(통역 흐름)이 고정 seed에서 조건 승객을 못 찾음(v7 생성 큐에 불허 사건이 섞이며 rng 소비 순서 변경) → 후보 seed 목록을 순차 탐색하도록 수정(legacy·dist 모두 통과).

## 완료 (v7.2 작업대 UX 재설계)
- Claude Design 캔버스로 A(심사대 콘솔)·B(사건 서류철)·C(분할 심사) 3안 시안 후 A를 채택(게임 루프상 전산 조회 결과가 항상 보여야 하므로 터미널은 탭에 넣지 않음).
- 사건 헤더 행(스테퍼·준비도·처리시간), 중앙 탭 작업대 + 문서 상태 타일, 우측 심사 판단 레일 + 고정 결정 데스크. 판정 로직·데이터·저장 스키마 변경 없음.

## 현재 작업
- main 복구 PR(#7, `fix/handover-boot-bundle-qa`) 병합 → v7.2 작업대 UX PR(#6, `feat/v7.2-workstation-ux`, 복구된 main 병합 반영) 병합 → Vercel 프로덕션 재검증(`INAD_TARGET=url INAD_BASE_URL=https://inad-gray.vercel.app npm run test:e2e`).

## 발견된 버그 (v6.1 → v7에서 수정)
- 캠페인 연계사건 스트립이 `.app` 그리드 행을 차지해 메인 작업대가 30px로 붕괴 → auto 행으로 분리.
- 메인 3열이 `29%+36%+35%+gap`으로 16px 오버플로(클립) → fr 기반.
- `--navy/--surface/--surface2/--sans` 미정의 토큰 사용 → 토큰 정리.
- 모달 포커스 트랩 부재, 설정 토글에 `aria-pressed` 없음.
- (v7.2) 숨겨진 연계사건 스트립이 grid auto-placement에서 빠지면서 새 사건 헤더 행이 밀림 → chrome 요소 `grid-row` 명시.
- (v7.2) Codex 콘솔 스킨(`border-console.css`)이 `.app` 행 템플릿을 덮어써 사건 헤더·연계사건 스트립이 5행을 공유 → 스킨 템플릿에 사건 헤더 행 추가(8행).
- 한 글자 단축키가 Ctrl/Cmd 조합(복사·붙여넣기·인쇄)까지 가로챔.
- `NORMAL_CASES` 정적 배열(68KB)이 정의만 되고 미사용 → 제거.

## 완료 (배포)
- PR #4 병합(main c1b5a24) → Vercel 프로덕션 배포 성공, 바이트 동일성·E2E 19/19·진단 PASS 확인. `vercel.json`은 정적 단일 파일 배포.

## 남은 항목
- 조건부 입국허가(제13조)를 플레이 가능한 조치로 설계할지 검토(사건 데이터 필요).
- 하이코리아 단기체류 안내(2013년 갱신본) 대신 최신 사증 세부기호 공식자료 확보 시 입국 근거 분류 보강.

## 중요한 architecture decision
- 개발은 네이티브 ESM(빌드 없이 실행), 배포는 esbuild 번들 단일 HTML. 포트레이트는 파일로 관리하고 빌드 시에만 인라인.
- 저장 키/스키마는 v6.1과 동일 유지, 마이그레이션은 `save-engine.js`에 집중.
- E2E는 `window.INADTest` 훅(seed 고정·큐 점프·상태 조회)만 사용하고 나머지는 실제 UI 조작.

## 마지막 정상 QA 결과
- 2026-09-11 (인수 후): lint OK(64 modules), unit 47/47, integrity 3/3, E2E dist 19/19 · legacy 19/19 · src 19/19, dist 1,500,602 bytes (v6.1 1,514,881 대비 0.9% 감소, 15% 한도 내). esbuild 0.27.7로 v7.1 커밋을 재빌드해 커밋된 mirror와 바이트 동일함을 확인한 뒤 같은 버전으로 mirror 재생성.
- 2026-09-11 (v7.1 릴리스): unit 36/36, E2E(dist) 19/19, E2E(legacy) 19/19, lint OK, dist 1,391,510 bytes (v6.1 1,514,881 대비 −8%).

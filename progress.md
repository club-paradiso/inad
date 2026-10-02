# progress.md — INAD

## 현재 상태 (2026-10-02 · v10 Live Interview 수직 슬라이스, 브랜치 `claude/relaxed-edison-iux1mv`)
- 범위: 사건 1건(ICN-S2-005) 라이브 인터뷰 — 부스 초상(살아 있는 초상), 자유 입력·푸시투토크·제안 질문, 결정적 공개(선행조건 전 회피 답변), 디브리핑, 단일 사건 모드. 판정 로직·사건 데이터·저장 스키마 무변경(새 선호 키 3개만 번들에 추가).
- QA: lint 80 · unit 125/125 · integration 10/10 · E2E 92/92 · 의도 평가 tuned 100% / held-out 76.5% · 성능 `docs/v10-qa.md` §5.
- 막힌 항목(환경 네트워크 정책): Higgsfield(생성 0건, `design/v10/GENERATION_LOG.md`), 오픈 웨이트 모델 벤치마크(하네스만 준비), 운영 사이트 직접 확인.
- 2026-10-02 추가: 파일럿 5건 페르소나, 저신뢰 해석 확인 단계(보류 세트 4차 10/15 실측 근거), 짧은 근무(6명), 오늘의 사건. QA: lint 81 · unit 129 · E2E 95 · legacy 19 · src 19.
- Figma 동기화(2026-10-02): 부스 변수 6개 추가 완료, `[Review]`·`[Exploration]` v10 섹션과 실제 크기 프레임 17개 생성. 이미지 채우기는 업로드 호스트 `mcp.figma.com` 차단으로 대기(원본 `design/v10/review/figma-sync/`). `docs/figma-workspace-spec.md` §10.
- 2026-10-02 PR #13 병합 후: 남은 사건 6건(ICN-S1-003·S1-004·S2-007·S2-008·S3-009·S3-012) 페르소나 추가 — 12건 전부 고유 페르소나. 의도 평가 5차 첫 실행 20/37(54.1%) → 튜닝 후 학습셋, 6차 보류셋 17/30(56.7%, 잘못된 연결 2건 모두 확인 단계에서 정지). QA: lint 81 · unit 130 · integrity 10 · E2E 101.
- 다음: Higgsfield 허용 후 파일럿 5명 생성·검수(TRV-0005 우선) → 모델 후보 실측(`docs/v10-ai-architecture.md` §5) → 사람 플레이테스트 → `mcp.figma.com` 허용 후 프레임 이미지 채우기·PR 병합 후 `[Implemented]` 승격 → 버전 10.0.0.

## 이전 상태 (2026-10-01 · v9.0)
- v9.0 안정성·제품 품질 개편: 브랜치 `claude/gracious-bell-ev8lcm`(기준 `main` `c922399`), 결과·검증은 `RELEASE_NOTES_v9.0.md`, `docs/qa-v9.md`.
- 판정 로직(`legal-engine.js`, `case-engine.js`, `src/data/cases.js`)·저장 스키마·`legacy/` 무변경.
- 열린 항목:
  - 2026-10-02 형사소송법 일괄 개정이 긴급체포(제200조의3) 외 다른 인용 조문에 영향을 주는지 검토 후 `RELEASE.legalBaseline` 이동 여부 결정(`docs/legal-review.md`).
  - 불회부 결정 순서(박해 사유 인터뷰 전 불회부)를 판정에 반영할지 — 판정 변경이므로 별도 승인 필요(`docs/legal-review.md` 5번).
  - Figma 동기화: v9 코드 변경(토큰 값·레이아웃·컴포넌트) → `[Implemented]` 반영 대기(`docs/figma-workspace-spec.md` §9).
  - 이력 태그(v7.0.0=c83244e, v7.1.0=7baa045, v7.2.0=9954adb) 미생성.

## 이력 (v7.0 재구축 이후)

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

## 완료 (v7.2 이후)
- PR #7·#6 병합(9954adb), v8 적응형 워크스테이션 PR #10(ef8fe66, 버전 표기는 7.2로 배포), Astra Figma 탐색 문서 PR #11(a3cbda7). v9.0에서 버전을 9.0.0으로 통일.

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
- PR #4 병합(main c1b5a24) → Vercel 프로덕션 배포 성공, 바이트 동일성·E2E 19/19·진단 PASS 확인. (PR #7 이후 `vercel.json`은 Vercel에서 `npm ci && npm run build`를 실행해 `dist/`를 배포한다.)

## 남은 항목
- 조건부 입국허가(제13조)를 플레이 가능한 조치로 설계할지 검토 — 조문·절차 리서치 완료(`docs/legal-research.md` §7: 3가지 적용 사유, 72(~144)시간 허가기간, 보증금·국고귀속 절차 확인). 구현 여부·범위는 게임 루프 설계 결정 및 별도 승인 대기, 코드 변경 없음.
- 하이코리아 단기체류 안내(2013년 갱신본) 대신 최신 사증 세부기호 공식자료 확보 시 입국 근거 분류 보강 — 리서치 완료(`docs/legal-research.md` §8: 하이코리아 페이지는 갱신 없음, 대신 출입국관리법 시행령 별표1(단기체류자격, Tier 1)로 B-1/B-2/C-1/C-3/C-4 정의를 대체 확인. `R-7-2-WAIVER` 근거 보강 제안, `R-ABTC`는 세부기호 미해결로 INFERRED 유지 제안). 반영 여부는 별도 승인 대기, 코드 변경 없음.

## 중요한 architecture decision
- 개발은 네이티브 ESM(빌드 없이 실행), 배포는 esbuild 번들 단일 HTML. 포트레이트는 파일로 관리하고 빌드 시에만 인라인.
- 저장 키/스키마는 v6.1과 동일 유지, 마이그레이션은 `save-engine.js`에 집중.
- E2E는 `window.INADTest` 훅(seed 고정·큐 점프·상태 조회)만 사용하고 나머지는 실제 UI 조작.

## 마지막 정상 QA 결과
- 2026-10-01 (v9.0): lint 65 modules OK, unit 106/106, integrity 10/10, E2E dist 83/83 · legacy 19 통과(64 v9 전용 생략) · src 부분집합 19/19, 8개 뷰포트 오류·가로 오버플로 0 (`docs/qa-v9.md`).
- 2026-09-11 (인수 후): lint OK(64 modules), unit 47/47, integrity 3/3, E2E dist 19/19 · legacy 19/19 · src 19/19, dist 1,500,602 bytes (v6.1 1,514,881 대비 0.9% 감소, 15% 한도 내). esbuild 0.27.7로 v7.1 커밋을 재빌드해 커밋된 mirror와 바이트 동일함을 확인한 뒤 같은 버전으로 mirror 재생성.
- 2026-09-11 (v7.1 릴리스): unit 36/36, E2E(dist) 19/19, E2E(legacy) 19/19, lint OK, dist 1,391,510 bytes (v6.1 1,514,881 대비 −8%).

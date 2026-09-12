# QA — v8 적응형 워크스테이션 (2026-09-12)

## 자동 검증 (`npm run qa`, exit 0)
| 항목 | 결과 |
|---|---|
| `npm run lint` | 64 modules OK (엔진 DOM 접근 0 · 외부 URL 0 · console.log 0) |
| `npm run test:unit` | 47/47 |
| `npm run build` | dist/index.html 1,503,956 bytes (v7.2 1,468 KB → +2.4%, 부팅 계약 15 ID 유지), 105 portraits inline, 루트 index.html 바이트 동일(SHA-256 `5aacdf67…`) |
| `npm run test:integrity` | 3/3 |
| `npm run test:e2e` (dist) | 25/25 — 기존 19 + `adaptive.spec.js` 6 (390·430·768·1024·1440 전체 흐름 + 터치 결정 안전장치) |
| `INAD_TARGET=legacy npm run test:e2e` | 19 passed · 6 skipped (v6.1 기준선에는 과업 내비게이션이 없으므로 adaptive 사양은 자동 생략) |

## 적응형 사양(`tests/e2e/adaptive.spec.js`)이 검사하는 것
- 각 뷰포트에서 시작 → 일반심사 → 인터뷰(질문) → 자료(문서 선택·전산 조회·입국 요건 탭) → 판단 → 입국재심 → 난민 회부심사 → 출입국사범 조사 → 입국불허(사유 선택) → 송환지시 → 근무기록·프로필·설정 대화상자.
- 매 단계 `document.documentElement.scrollWidth <= clientWidth + 1`(문서·body 모두). 가로 스크롤 0.
- 활성 과업의 핵심 컨트롤이 뷰포트 안에 있음(`toBeInViewport`): 초상·이름·과업 내비게이션 / 기록·질문·통역 버튼 / 문서 목록·문서·조회 버튼 / 준비도·확인 사항·결정 4종.
- 폰 폭에서 터치 대상: 과업 내비게이션·운영 토글·결정 버튼 ≥44px, 질문·문서·조회·언어·탭 ≥40px.
- 터치 결정 안전장치: `(pointer: coarse)`에서 첫 탭은 `armed`만 만들고 `state.stage`를 바꾸지 않으며, 두 번째 탭에서 SECONDARY로 전환.
- 페이지 오류·콘솔 오류 0.

## 육안 검증(스크린샷: `test-results/dist/adaptive/*.png`, 5 뷰포트 × 12 상태)
- 1440×1000 · 1280×800 · 1024×768: 3구역(승객+인터뷰 / 자료+조회 / 판단+결정) 모두 표시, 결정 데스크 우하단 고정, 문서·조회·법적 근거 동시 가시.
- 768×1024: 대상자 + (인터뷰 ⇄ 자료 세그먼트) + 인스펙터 300, 결정 1열.
- 430×932 · 390×844 · 320×568: 과업 1개 + 하단 내비게이션, 운영 시트(대기열·KPI), 대화상자는 하단 시트, 절차 화면 전체화면.
- 발견·수정한 문제: (1) 폰 헤더 운영 토글 30px → 44px, 음향 버튼 44px; (2) 터치 크기 규칙이 `(pointer: coarse)`에만 걸려 마우스 에뮬레이션 폰 폭에서 미적용 → `(max-width: 767px)` 병행; (3) 절차 화면 진입 페이드가 화면 전체에 걸려 작업대가 비쳐 보임 → 내용만 페이드하고 바탕은 불투명; (4) 질문 컴포저 트랙 붕괴, 폰 대상자 그리드 4열, 확대 버튼 줄바꿈, 태블릿 KPI 줄바꿈, 이어하기 숨김 시 시작 버튼 폭 — 모두 수정.

## v7.2 대비 구조 변화
- 삭제: `src/js/services/border-console.js`, `src/styles/border-console.css`(콘솔 스킨 · 장식 레일 · 가짜 상태 배지).
- 추가: `src/js/ui/task-nav.js`, `src/styles/*` 책임별 재작성(tokens v3), `tests/e2e/adaptive.spec.js`, `docs/ux-audit-v8.md`, `docs/design-workflow.md`, `docs/figma-workspace-spec.md`, `docs/audit/v7.2/*.png`(개편 전 캡처).
- 유지: 모든 DOM ID(부팅 계약 15개 + 테스트 훅), 저장 스키마, 판정 로직·사례 데이터·불허 사유 코드(변경 없음 — `git diff --stat src/js/engines src/data`로 확인 가능).

## 알려진 제한
- Figma Code Connect는 현재 플랜(Dev/Full seat · Organization/Enterprise 필요)에서 사용할 수 없어 매핑은 컴포넌트 description + `docs/figma-workspace-spec.md §4` + 04 페이지의 코드 매핑 표로 대신한다.
- 샌드박스에서 `figma.com`으로의 직접 업로드(`upload_assets` POST)가 프록시 정책(403)으로 차단되어 01 Audit 페이지에는 래스터 캡처 대신 측정값 기반 와이어프레임·주석을 두고, 원본 캡처는 `docs/audit/v7.2/`에 보관한다.
- 프로덕션(`inad-gray.vercel.app`) 및 Vercel 프리뷰는 샌드박스 네트워크 정책으로 직접 접근 불가. PR의 Vercel 프리뷰는 대시보드에서 확인해야 한다.

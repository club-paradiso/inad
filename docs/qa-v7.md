# QA — v7.0

## 자동 검증 (2026-09-11)
| 항목 | 결과 |
|---|---|
| `npm run lint` | 51 modules OK |
| `npm run test:unit` | 40/40 (v7.1: decision-model 4개 추가) |
| `npm run build` | dist/index.html 1,429,761 bytes (v6.1 1,514,881 대비 −5.6%), 105 portraits inline |
| `npm run test:integrity` | pass |
| `npm run test:e2e` (dist) | 19/19, pageerror 0, console.error 0 |
| `INAD_TARGET=legacy npm run test:e2e` | 19/19 (v6.1 parity, v7.1 사양 재실행 포함) |

## 대표 화면 육안 검증 (Browser pane, 1440×1000 · 1024×768)
start · primary inspection · briefing · tutorial · secondary · refugee · SJP · repatriation · refusal reasons · profile · records · settings · campaign start. 가로 오버플로 0, 결정 버튼·선택 문서 뷰포트 내 표시, 패널 내부 스크롤만 사용.

## 성능 baseline
- v6.1 source/dist: 1,514,881 bytes 단일 파일, 105 portraits (956 KB base64), 1 script scope, DOM ≈ 750 nodes.
- v7.0: dist 1,391,510 bytes, 105 portraits 파일 자산(빌드 시 인라인), DOM ≈ 750 nodes, 큐는 10명만 렌더링(105명 전체 DOM 렌더링 없음), 포트레이트 `loading=lazy` + 프리로드 캐시 유지.

## 프로덕션 배포 검증 (2026-09-11, PR #4 병합 → main c1b5a24)
- Vercel(Git 연동, `vercel.json` 정적 배포) 프로덕션 `https://inad-gray.vercel.app` 응답 200, `content-length` 1,429,761 bytes, SHA-256 `6e0baf6e…08a4` = 로컬 `dist/index.html` = `main:index.html` (바이트 동일).
- 페이지 로드 시 네트워크 요청 1건(문서 자체)뿐, 콘솔 오류 0, 내장 진단 전부 PASS, 가로 오버플로 0.
- `INAD_TARGET=url INAD_BASE_URL=https://inad-gray.vercel.app npm run test:e2e` → 19/19 통과.
- 프리뷰 배포는 Vercel SSO 보호가 켜져 있어 외부에서 검증 불가(대시보드에서 접근 필요).

## 알려진 제한
- 프리뷰 배포 검증은 Vercel Deployment Protection 해제 또는 bypass 토큰이 필요.

## v7.2 작업대 UX 재설계 검증 (2026-09-11)
- 레이아웃: 사건 헤더(심사번호·요약·단계 스테퍼·준비도·처리시간) 신설, 중앙 탭 작업대(제출 서류 | 입국 요건 자료) + 상시 전산 조회, 우측 심사 판단 레일(판단 근거 → 준비도 → 사실관계 → 단서판 → 진행기록) + 하단 고정 심사 결정.
- 1440×1000 · 1024×768: 가로 오버플로 0, `#stepper #terminal #basisBoard #clearBtn #secondaryBtn #refuseBtn #docview #pPortrait #questions` 전부 뷰포트 내, 콘솔 오류 0 (Playwright 캡처 스크립트).
- 회귀: 사건 헤더 행 추가 시 숨겨진 연계사건 스트립 때문에 그리드 행이 밀려 작업대가 52px로 붕괴 → 모든 chrome 요소에 `grid-row` 명시 배치로 수정.
- E2E 사양 갱신: visual smoke가 스테퍼 상태(일반심사 → 입국재심)와 작업대 탭 전환을 추가 검증(레거시 대상에서는 자동 생략).
- 복구된 main(콘솔 스킨 `border-console-v3`) 병합 후: 스킨이 자체 `.app` 행 템플릿(7행)을 덮어써 사건 헤더와 연계사건 스트립이 같은 행(5)을 공유 → 스킨 템플릿을 8행(레일 4 · 스트립 5 · 사건 헤더 6 · 작업대 7 · 푸터 8)으로 확장. 계산된 행: `54 32 68 48 0 52 718 28`(1440×1000), 콘솔 오류 0(http), 뷰포트 검사 통과.

## v7.1 추가 검증 (2026-09-11)
- 판단 근거 패널 8개 도메인 노드 렌더링·결과 화면 섹션(E2E 1번 사양에서 검증), 콘솔 오류 0.
- 390×800(모바일) fallback: 가로 오버플로 0, 시작 화면·근무 시작 버튼 접근 가능, 안내 배너 표시. 심사 작업대는 1024px 이상 권장(모바일 최적화 아님).
- 법령·출처 등록부 정합성: `registryIntegrity()` 위반 0 (단위 테스트).

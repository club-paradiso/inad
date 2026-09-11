# QA — v7.0

## 자동 검증 (2026-09-11)
| 항목 | 결과 |
|---|---|
| `npm run lint` | 51 modules OK |
| `npm run test:unit` | 36/36 |
| `npm run build` | dist/index.html 1,391,510 bytes (v6.1 1,514,881 · −8.1%), 105 portraits inline |
| `npm run test:integrity` | pass |
| `npm run test:e2e` (dist) | 19/19, pageerror 0, console.error 0 |
| `INAD_TARGET=legacy npm run test:e2e` | 19/19 (v6.1 parity) |

## 대표 화면 육안 검증 (Browser pane, 1440×1000 · 1024×768)
start · primary inspection · briefing · tutorial · secondary · refugee · SJP · repatriation · refusal reasons · profile · records · settings · campaign start. 가로 오버플로 0, 결정 버튼·선택 문서 뷰포트 내 표시, 패널 내부 스크롤만 사용.

## 성능 baseline
- v6.1 source/dist: 1,514,881 bytes 단일 파일, 105 portraits (956 KB base64), 1 script scope, DOM ≈ 750 nodes.
- v7.0: dist 1,391,510 bytes, 105 portraits 파일 자산(빌드 시 인라인), DOM ≈ 750 nodes, 큐는 10명만 렌더링(105명 전체 DOM 렌더링 없음), 포트레이트 `loading=lazy` + 프리로드 캐시 유지.

## 알려진 제한
- Vercel 프로덕션 검증은 이 환경에서 접근 가능한 팀에 `inad` 프로젝트가 없어 수행하지 못함. 루트 `index.html`이 릴리스 미러이므로 정적 배포에는 그대로 사용 가능.

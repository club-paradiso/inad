# 디자인 변경 워크플로 — Figma ↔ 코드

이 문서는 INAD: 제12조의 화면·컴포넌트·토큰을 바꿀 때 사람과 자동화(Claude / Codex)가 지켜야 하는 절차다.
파일 구조 사양은 `docs/figma-workspace-spec.md`, UX 진단·IA 결정은 `docs/ux-audit-v8.md`, 시각 규칙은 `docs/design-system.md`에 있다.

## 1. 소스 오브 트루스

| 대상 | 기준 | 비고 |
|---|---|---|
| 동작·법률 로직·상태·저장 스키마 | 코드 `src/` | Figma는 동작을 정의하지 않는다. 판정 로직은 동결(`CLAUDE.md`). |
| 시각 토큰(색·간격·반경·타입·레이아웃 치수) | `src/styles/tokens.css` ↔ Figma Variables(1:1, 같은 이름 체계) | 값이 다르면 코드가 기준. Figma에서 제안된 값은 `[Review]`를 거쳐 코드에 반영한 뒤 Figma를 `[Implemented]`로 올린다. |
| 화면 IA·레이아웃 | Figma `06/07/08` 페이지의 `[Approved]` 섹션 | 구현 대상은 `[Approved]` 프레임 또는 작업 지시에 명시된 프레임뿐이다. |
| 컴포넌트 외형·상태 | Figma `04 — Components` 세트 ↔ `src/js/ui/*` 렌더러 + `src/styles/*.css` | 매핑표는 `docs/figma-workspace-spec.md §4` 와 Code Connect(Javascript 라벨). |
| 카피(UI 문구) | 코드(`src/js/ui/*`, `src/js/services/i18n.js`) | Figma 텍스트는 견본. 법률 용어는 `docs/legal-baseline.md` 표기를 따른다. |

Figma 파일: **INAD — Adaptive Workstation Design System** · https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8

## 2. 상태 규약 (섹션 이름 접두어)

| 접두어 | 뜻 | 누가 올리나 | 편집 |
|---|---|---|---|
| `[Exploration]` | 대안 탐색. 여러 안이 공존해도 된다. | 누구나 | 자유 |
| `[Review]` | 검토 요청. 코멘트·수정 제안을 받는다. | 제안자 | 제안자 + 리뷰어 코멘트 |
| `[Approved]` | 구현 대상으로 확정. | 사람(디자인 오너) | 사람만. 자동화는 읽기 전용 |
| `[Implemented]` | 코드가 반영됨(PR 병합 기준). 스크린샷과 비교 완료. | 구현자(사람 또는 자동화) — 단, 이름 변경은 `[Approved]`였던 섹션에만 | 변경 시 새 `[Exploration]` 복제본에서 시작 |

필 뱃지·스티커·색 표시로 상태를 나타내지 않는다. 섹션 이름이 유일한 상태다.

## 3. 사람의 편집을 보호하는 규칙 (자동화 필수 준수)

1. 자동화는 **자신이 만든 노드만** 수정·삭제한다. 다른 사람이 만든 프레임을 바꾸려면 복제본을 새 `[Exploration]` 섹션에 만들고 원본은 그대로 둔다.
2. `[Approved]`·`[Implemented]` 섹션은 사람이 접두어를 바꾸기 전까지 **읽기 전용**이다. 자동화가 `[Implemented]`로 올릴 수 있는 것은 `[Approved]`였던 섹션뿐이다.
3. 컴포넌트 세트의 변형(variant)·프로퍼티는 **삭제하지 않는다.** 폐기할 때는 `13 — Archive`로 옮기고 description에 사유·날짜를 적는다.
4. Variables·텍스트 스타일 **이름을 바꾸지 않는다**(코드 매핑이 깨진다). 추가만 하고, 폐기는 description에 `deprecated` 표기.
5. `12 — Playground`는 자유 편집 구역이며 여기 있는 것은 구현 대상이 아니다. 자동화는 Playground를 초기화하지 않는다.
6. 다른 사람의 코멘트는 삭제·해결 처리하지 않는다(코멘트 작성자만 resolve).
7. 실패한 자동화 작업은 롤백된다. 부분 결과가 남았다면 `[Exploration] (자동화 · 미완)` 접두어로 격리한다.

## 4. 변경 절차

### A. 토큰(색·간격·반경·타입·치수) 변경
1. `src/styles/tokens.css` 값 수정 → `docs/figma-workspace-spec.md §2/§3` 표 갱신.
2. Figma Variables 같은 이름 변수 값 수정(코드 syntax `var(--…)` 유지).
3. `03 — Foundations` 스와치 확인 → `npm run build && npm run test:e2e` (visual + adaptive 스모크).
4. PR에 변경 전/후 스크린샷(1440·1024·768·390) 첨부.

### B. 컴포넌트 변경
1. `04 — Components`에서 세트를 복제해 `[Exploration]`으로 작업(원본 유지).
2. 변형은 **코드에 실제로 존재하는 상태만** 만든다(예: Decision = Default·Disabled·Armed). 장식 변형 금지.
3. `[Review]` → `[Approved]` 후 `src/js/ui/*` 렌더러와 `src/styles/*.css` 수정. 마크업 ID는 유지(`scripts/check-boot-contract.js`).
4. Code Connect 매핑 갱신(컴포넌트 세트 → 소스 경로), description에 렌더러 함수명 기록.
5. `npm run lint && npm run test:unit && npm run test:e2e` 통과 후 `[Implemented]`.

### C. 화면·IA 변경
1. `docs/ux-audit-v8.md`에 문제·근거(측정값·클릭 수·가림 여부) 추가.
2. `06/07/08`에 `[Exploration]` 안을 만들고 데스크톱·태블릿·모바일 3종을 **같은 DOM 구조**로 표현(구역: 승객·인터뷰·자료·판단).
3. `[Approved]` 확정 → 코드: `src/index.html` 구조 → `src/styles/shell.css`(크롬·브레이크포인트) / `workspace.css`(구역 배치) / `components.css`(구역 내부) → `src/js/ui/task-nav.js`(과업 전환).
4. `tests/e2e/adaptive.spec.js`가 다섯 뷰포트(390·430·768·1024·1440)에서 흐름·가로 오버플로·터치 크기를 검사한다. 새 화면 요소는 이 스펙의 `inViewport` 목록에 추가한다.
5. 스크린샷을 Figma `[Implemented]` 프레임 옆에 두고 차이를 기록(`docs/qa-v8.md`).

### D. 코드가 먼저 바뀐 경우(코드 → Figma 동기화)
1. 변경된 렌더러·CSS를 읽고 해당 컴포넌트 세트를 갱신(변형 추가만, 삭제 금지).
2. 바뀐 화면을 `[Implemented]` 섹션에 새 프레임으로 추가하고 이전 프레임은 `13 — Archive`로 이동.
3. `docs/figma-workspace-spec.md` 표 갱신.

## 5. 반응형 구현 계약

- **DOM은 하나**다. `.desktop-app`/`.mobile-app` 같은 중복 트리 금지. 구역은 `.zone-person · .zone-interview · .zone-evidence · .zone-assessment`.
- 표시 과업은 `body[data-task]`(`passenger|interview|evidence|assessment`)가 결정하고, `src/js/ui/task-nav.js`만 이 값을 바꾼다. 데스크톱(≥1024)은 이 값을 무시하고 모든 구역을 보여 준다.
- 브레이크포인트: ≥1280 3구역(320·유동·360) · 1024–1279 3구역(288·유동·320) · 768–1023 작업 영역 + 인스펙터 300(인터뷰⇄자료 세그먼트) · <768 과업 1개 + 하단 과업 내비게이션 56.
- 터치: 모든 조작 대상 44px 이상(`(pointer: coarse)` 또는 767px 이하). 결정 버튼은 첫 탭 무장 → 두 번째 탭 실행(`decision-desk.js confirmTouch`). 무장 상태는 4초 후 해제.
- iOS: `env(safe-area-inset-*)`, `100dvh`, 시트·절차 화면 내부 스크롤만 사용. 페이지 가로 스크롤 금지(`scrollWidth <= clientWidth + 1`).
- 모션 120–220ms, `prefers-reduced-motion`·`body.pref-reduce-motion`에서 0.

## 6. 금지 목록(AI slop)

카드 안의 카드 · 의미 없는 배지·아이콘 나열 · 가짜 통계/스파크라인 · 장식 마이크로카피("시스템 온라인", "AI 분석 중") · 터미널 클리셰(녹색 커서, 스캔라인) · 그라디언트/글래스/네온/글로우 · 10px 미만 텍스트 · 선택한 UI 언어와 무관한 이중언어 병기 · 판정 근거가 아닌 값을 판정처럼 보이게 하는 시각(긴장도·협조도·언어능력).

## 7. PR 체크리스트(디자인 변경 포함 시)

- [ ] `docs/ux-audit-v8.md` 또는 이 문서에 근거 기록
- [ ] Figma `[Approved]` 프레임 링크(또는 코드 선행이면 `[Implemented]` 프레임 링크)
- [ ] `tokens.css` ↔ Variables 값 일치
- [ ] `npm run qa` 통과(lint · unit · build · integrity · e2e dist+legacy · adaptive)
- [ ] 1440·1024·768·390 스크린샷 첨부, 가로 오버플로 0, 콘솔 오류 0
- [ ] `CLAUDE.md`와 `AGENTS.md` 동일하게 갱신(규칙 변경 시)

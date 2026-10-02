# INAD — 작업 규칙 (Claude / Codex 공용)

`AGENTS.md`는 이 파일의 사본입니다. 두 파일을 함께 갱신하십시오.

## 프로젝트
대한민국 인천공항 제2여객터미널을 모티브로 한 **가상** 입국심사관 시뮬레이션. 실제 법무부 내부 시스템·비공개 심사기준·규제코드를 재현하지 않습니다.
- 런타임: HTML + CSS + Vanilla JS. 프레임워크·jQuery·Tailwind·외부 CDN·외부 폰트·외부 이미지·외부 오디오 금지. 브라우저의 외부-origin 네트워크 요청 금지. 예외는 둘뿐입니다: `src/js/services/airport-live.js`가 same-origin `/api/airport-load`를 호출하여 공식 공개 운항정보의 요약값을 받는 흐름, 그리고 (v10) `src/js/services/npc-client.js`가 same-origin `/api/npc`에 자유 질문의 분류(질문 ID 하나 또는 null)를 요청하는 선택형 흐름. 공공데이터 인증키·추론 서버 설정과 외부 API 호출은 Vercel 서버 함수(`api/airport-load.js`, `api/npc.js`) 안에서만 처리합니다.
- 기본 UI 언어는 한국어이며 사용자가 선택할 수 있는 영어 UI 모드를 제공합니다. UI 로컬라이제이션은 `src/js/services/i18n.js`에서 관리하고 선택 언어는 `inad-locale`에 저장합니다. 인터뷰 언어 선택과 UI 언어 선택은 별개입니다.
- 소스 오브 트루스는 `src/`. `dist/index.html`과 루트 `index.html`은 **생성 파일**이며 직접 편집 금지 (`npm run build`).
- v6.1 원본(프로덕션에서 복구)은 `legacy/v6.1/`에 동결. 참조용이며 수정 금지.

## 아키텍처 원칙
- `src/data/*` 데이터 → `src/js/engines/*` 규칙/상태 변경 → `src/js/ui/*` 렌더링 → `src/js/app.js` 흐름 연결.
- 엔진은 DOM에 접근하지 않습니다(`npm run lint`가 검사). UI는 상태를 직접 변경하지 않고 엔진 함수를 호출합니다.
- 상태 트리는 `src/js/state.js` 하나(`state`, `session`, `preferences`). 전역 변수 추가 금지.
- 엔진 → UI 통지는 `src/js/services/bus.js` 이벤트(`changed`, `log`, `ops`, `airportLive`, `behavior`, `fieldEvent`, `persistence`, `campaign`, `procedure:close`, `toast`, `announce`, `sound`, `pulse`).
- 저장 스키마: `inad-meta-v54`(v2), `inad-progress-v54`(v1), `inad-campaign-v58`(v1), 번들 `INAD_SAVE_BUNDLE` schema 1. 변경 시 `save-engine.js`의 migrate 함수에 마이그레이션을 추가하고 키 이름은 유지.
- 실시간 공항 운항정보는 운영 시뮬레이션 보조자료입니다. 승객 유입·대기열·현장 이벤트 압박에만 제한적으로 사용하며 법적 입국요건, 위험도, 허가·불허 판정에는 사용 금지. API 실패·키 미설정 시 정적 공항 프리셋으로 fail-safe 합니다.

## v10 인터뷰 원칙 (AI = 배우, 엔진 = 규칙·사실)
- 모든 질문 경로(제안·목록·직접 입력·음성)는 `engines/interview-engine.js submitUtterance()` 하나를 거치며, 증거가 되는 답은 `case-engine ask()`의 정규 답변뿐이다. 입력 방식은 점수·작업시간·판정에 영향 없음(`tests/unit/dialogue.test.js`).
- 모델(`/api/npc`)은 사건의 질문 텍스트만 보고 질문 ID 하나 또는 null만 돌려준다. 대사 생성·사실 추가·답변 열람·상태 변경 금지. 서버·클라이언트 모두 스키마 검증, 실패 시 결정적 경로.
- 승객 대사(`src/data/personas.js`)는 공개 기록(첫 진술·제출서류·이미 얻은 답)에 있는 사실만 말한다(`dialogue-guard.checkLine` 테스트). 선행조건(`requires`) 전에는 `withheld` 대사로 비켜 가며 질문은 열린 채 남는다.
- 제안 질문은 화면에 보이는 정보만 사용(`required`·`resolution`·단서 키·`contradiction` 금지).
- 마이크·TTS 기본 꺼짐, 음성 인식은 기기 내 처리 우선·동의 후 사용, 음성·영상 저장/전송 금지. 카메라는 미구현(원칙: `docs/v10-privacy.md`).
- 아바타 동작·자막·말투는 표현일 뿐 판정 근거가 아니다.

## 법률 로직 동결 원칙
- 판정 로직(`legal-engine.js`, `case-engine.js`, `src/data/cases.js`)은 v6.1 동작에 고정. 공개 법령·정부기관 공개자료로 확인되지 않은 변경 금지. 의문점은 `docs/legal-review.md`에 기록.
- 다음 절차를 절대 하나로 합치지 않습니다: 입국심사 · 입국재심 · 입국불허 · 제11조 입국금지 · 난민 회부심사 · 불회부 · 출입국사범 조사 · 긴급체포 · 송환지시 · 출국대기실 · 강제퇴거 · 출국명령. `DEPORT` 같은 포괄 행동 금지.
- 국적은 사증·무사증·K-ETA·전자입국신고 등 입국기반 산정에만 사용. 위험점수·범죄확률로 사용 금지.
- 긴장도·협조도·언어능력·통역 사용·동행 관계는 판정 근거가 아닙니다(`tests/unit/invariants.test.js`가 검사).
- 휴대전화 제출 거부 하나만으로 자동 입국불허 처리 금지. 긴급체포 자동화 금지.

## 디자인 시스템 원칙 (v3 · 적응형 워크스테이션)
- 토큰은 `src/styles/tokens.css`의 semantic token만 사용(색상 hex 직접 사용 최소화). 토큰은 Figma Variables와 1:1이며 이름을 바꾸지 않는다.
- system font만 사용. 모노스페이스는 ID·MRZ·PNR·코드·KPI에만. 10.5px 미만 텍스트 금지.
- 간격 4/8/12/16/24/32, 반경 0/2/4/6(6은 대화상자·시트·절차 화면만), 그림자는 모달·절차화면·호출 카드·PA 배너에만.
- 모션 120~220ms, `prefers-reduced-motion`과 `body.pref-reduce-motion` 존중.
- DOM은 하나. 작업대는 네 구역(`.zone-person · .zone-interview · .zone-evidence · .zone-assessment`)이고 `body[data-task]`는 `src/js/ui/task-nav.js`만 바꾼다. `.desktop-app/.mobile-app` 같은 중복 트리, 3000줄짜리 mobile.css 금지 — CSS는 책임별 파일(shell·workspace·components·interview·documents·procedures·modals·start·accessibility)에 둔다.
- 브레이크포인트: ≥1280 v10 4열(부스 304/280·대화·자료·판단 360/330) · 1024–1279 3구역(288·유동·320, 소형 부스) · 768–1023 작업 영역 + 인스펙터 · <768 과업 1개 + 하단 과업 내비게이션. 페이지 가로 스크롤 금지(`tests/e2e/adaptive.spec.js` 불변식).
- 터치: 조작 대상 44px 이상, iOS safe-area·`dvh` 반영. 결정 버튼은 터치에서 첫 탭 무장 → 두 번째 탭 실행(`decision-desk.js`); 단일 탭으로 법적 단계를 바꾸지 않는다.
- 의미색(success·warning·danger·sjp)은 법적·절차적 상태와 결정 데스크 전용. 결정 데스크 밖 계속 버튼은 `.act.primary`, 파괴적 확인은 `.act.danger`(`tests/e2e/design-invariants.spec.js`).
- 금지: 사이버펑크/네온/글로우, 의미 없는 그라디언트, 카드 안의 카드, 배지·아이콘 나열, 가짜 통계, 장식 마이크로카피, 터미널 클리셰, 선택한 UI 언어와 무관한 이중언어를 과도하게 섞어 시각 위계를 흐리는 구성, 판정 근거가 아닌 값(긴장도·협조도·언어능력·동행)을 판정처럼 보이게 하는 시각.

## 디자인 변경 워크플로 (Figma ↔ 코드)
- Figma 파일 `INAD — Adaptive Workstation Design System`(https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8)은 시각 언어·IA의 탐색·승인 공간이고, 동작·법률 로직·카피의 소스 오브 트루스는 코드다. 절차는 `docs/design-workflow.md`, 파일 구조는 `docs/figma-workspace-spec.md`.
- 상태는 섹션 이름 접두어 `[Exploration] → [Review] → [Approved] → [Implemented]`로만 표시. 구현 대상은 `[Approved]` 프레임(또는 작업 지시에 명시된 프레임)뿐.
- 자동화는 자신이 만든 노드만 수정·삭제한다. 사람이 만든 프레임·`[Approved]`·`[Implemented]` 섹션은 읽기 전용이며, 바꾸려면 복제본을 새 `[Exploration]` 섹션에 만든다. 변형·변수·스타일은 삭제·개명하지 않고 `13 — Archive`로 옮긴다.
- 화면·컴포넌트를 바꾼 PR은 Figma 프레임 링크, `tokens.css` ↔ Variables 일치, 1440·1024·768·390 스크린샷, `npm run qa` 통과를 포함한다. 코드가 먼저 바뀌면 Figma를 `[Implemented]`로 동기화하고 `docs/figma-workspace-spec.md`를 갱신한다.

## 명령
- `npm run dev` — `src/`를 http://127.0.0.1:4175 로 서빙(네이티브 ESM).
- `npm run build` — `dist/index.html` + 루트 `index.html` 생성.
- `npm run lint` — 문법·엔진 DOM 접근·외부 URL·승인되지 않은 네트워크 호출·console.log 검사.
- `npm run test:unit` — 엔진 단위·불변식 테스트(node:test).
- `npm run test:integrity` — 빌드 산출물 정적 검사.
- `npm run test:e2e` — Playwright(dist 기준). `INAD_TARGET=legacy|src`로 대상 전환. `tests/e2e/adaptive.spec.js`는 320·390·430·844×390·768·1024·1366·1440 뷰포트 전체 흐름·가로 오버플로·터치 크기(가로·세로 44px)를 검사(legacy에서는 자동 생략). `INAD_CHROMIUM_PATH`(설치된 Chromium), `INAD_PORT`(포트) 지원.
- `npm run eval:dialogue` — 의도 해석 평가(결정적; `--provider`와 `INAD_LLM_*` 환경변수로 모델·하이브리드·주입 내성·지연 측정).
- `node scripts/measure-performance.js`, `node scripts/playtest-personas.js` — v10 성능 측정·페르소나 플레이테스트(빌드 후).
- `npm test` / `npm run qa` — 전체.

## 금지사항
- 기능 축소, 테스트 삭제·약화로 빌드 통과시키기, 생성 파일 직접 수정, `legacy/` 수정, 실제 개인정보 사용, 실제 기관 관인·로고 복제.

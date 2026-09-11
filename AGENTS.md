# INAD: 제12조 — 작업 규칙 (Claude / Codex 공용)

`AGENTS.md`는 이 파일의 사본입니다. 두 파일을 함께 갱신하십시오.

## 프로젝트
대한민국 인천공항 제2여객터미널을 모티브로 한 **가상** 입국심사관 시뮬레이션. 실제 법무부 내부 시스템·비공개 심사기준·규제코드를 재현하지 않습니다.
- 런타임: HTML + CSS + Vanilla JS. 프레임워크·jQuery·Tailwind·외부 CDN·외부 폰트·외부 이미지·외부 오디오 금지. 브라우저의 외부-origin 네트워크 요청 금지. 유일한 예외는 `src/js/services/airport-live.js`가 same-origin `/api/airport-load`를 호출하여 공식 공개 운항정보의 요약값을 받는 흐름입니다. 공공데이터 인증키와 외부 API 호출은 Vercel 서버 함수 `api/airport-load.js` 안에서만 처리합니다.
- 기본 UI 언어는 한국어이며 사용자가 선택할 수 있는 영어 UI 모드를 제공합니다. UI 로컬라이제이션은 `src/js/services/i18n.js`에서 관리하고 선택 언어는 `inad-locale`에 저장합니다. 인터뷰 언어 선택과 UI 언어 선택은 별개입니다.
- 소스 오브 트루스는 `src/`. `dist/index.html`과 루트 `index.html`은 **생성 파일**이며 직접 편집 금지 (`npm run build`).
- v6.1 원본(프로덕션에서 복구)은 `legacy/v6.1/`에 동결. 참조용이며 수정 금지.

## 아키텍처 원칙
- `src/data/*` 데이터 → `src/js/engines/*` 규칙/상태 변경 → `src/js/ui/*` 렌더링 → `src/js/app.js` 흐름 연결.
- 엔진은 DOM에 접근하지 않습니다(`npm run lint`가 검사). UI는 상태를 직접 변경하지 않고 엔진 함수를 호출합니다.
- 상태 트리는 `src/js/state.js` 하나(`state`, `session`, `preferences`). 전역 변수 추가 금지.
- 엔진 → UI 통지는 `src/js/services/bus.js` 이벤트(`changed`, `log`, `ops`, `airportLive`, `toast`, `announce`, `sound`, `pulse`).
- 저장 스키마: `inad-meta-v54`(v2), `inad-progress-v54`(v1), `inad-campaign-v58`(v1), 번들 `INAD_SAVE_BUNDLE` schema 1. 변경 시 `save-engine.js`의 migrate 함수에 마이그레이션을 추가하고 키 이름은 유지.
- 실시간 공항 운항정보는 운영 시뮬레이션 보조자료입니다. 승객 유입·대기열·현장 이벤트 압박에만 제한적으로 사용하며 법적 입국요건, 위험도, 허가·불허 판정에는 사용 금지. API 실패·키 미설정 시 정적 공항 프리셋으로 fail-safe 합니다.

## 법률 로직 동결 원칙
- 판정 로직(`legal-engine.js`, `case-engine.js`, `src/data/cases.js`)은 v6.1 동작에 고정. 공개 법령·정부기관 공개자료로 확인되지 않은 변경 금지. 의문점은 `docs/legal-review.md`에 기록.
- 다음 절차를 절대 하나로 합치지 않습니다: 입국심사 · 입국재심 · 입국불허 · 제11조 입국금지 · 난민 회부심사 · 불회부 · 출입국사범 조사 · 긴급체포 · 송환지시 · 출국대기실 · 강제퇴거 · 출국명령. `DEPORT` 같은 포괄 행동 금지.
- 국적은 사증·무사증·K-ETA·전자입국신고 등 입국기반 산정에만 사용. 위험점수·범죄확률로 사용 금지.
- 긴장도·협조도·언어능력·통역 사용·동행 관계는 판정 근거가 아닙니다(`tests/unit/invariants.test.js`가 검사).
- 휴대전화 제출 거부 하나만으로 자동 입국불허 처리 금지. 긴급체포 자동화 금지.

## 디자인 시스템 원칙 (v2)
- 토큰은 `src/styles/tokens.css`의 semantic token만 사용(색상 hex 직접 사용 최소화).
- system font만 사용. 모노스페이스는 ID·MRZ·PNR·코드에만.
- 간격 4/8/12/16/24/32, 반경 0/3/5/8, 그림자는 모달·절차화면·호출 카드에만.
- 모션 120~220ms, `prefers-reduced-motion`과 `body.pref-reduce-motion` 존중.
- 금지: 사이버펑크/네온/글로우, 의미 없는 그라디언트, 카드 안의 카드, 8px 이하 모노 텍스트 남발, 선택한 UI 언어와 무관한 이중언어를 과도하게 섞어 시각 위계를 흐리는 구성.
- 뷰포트: 1440×900 이상 기본, 1024×768에서도 핵심 플레이 가능. 페이지 가로 스크롤 금지.

## 명령
- `npm run dev` — `src/`를 http://127.0.0.1:4175 로 서빙(네이티브 ESM).
- `npm run build` — `dist/index.html` + 루트 `index.html` 생성.
- `npm run lint` — 문법·엔진 DOM 접근·외부 URL·승인되지 않은 네트워크 호출·console.log 검사.
- `npm run test:unit` — 엔진 단위·불변식 테스트(node:test).
- `npm run test:integrity` — 빌드 산출물 정적 검사.
- `npm run test:e2e` — Playwright(dist 기준). `INAD_TARGET=legacy|src`로 대상 전환.
- `npm test` / `npm run qa` — 전체.

## 금지사항
- 기능 축소, 테스트 삭제·약화로 빌드 통과시키기, 생성 파일 직접 수정, `legacy/` 수정, 실제 개인정보 사용, 실제 기관 관인·로고 복제.

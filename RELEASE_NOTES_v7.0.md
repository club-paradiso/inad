# INAD: 제12조 v7.1 — 고증 감사 (Legal Fidelity) · v7.0 — Architecture & Design Rebuild

## v7.1 (2026-09-11) — 공개 법령 기반 고증 감사
- **리서치**: 국가법령정보센터 조문 원문(출입국관리법·시행령·시행규칙 별표1·난민법·시행령·형사소송법 현행/시행예정본·사법경찰직무법), 법무부 K-ETA·전자입국신고 안내, 하이코리아, 비자 내비게이터 Ver 2022.12, 인천공항출입국·외국인청 기관소개. 전부 `docs/legal-research.md`에 확인일과 함께 기록.
- **출처 등록부 + 규칙 노드**: `src/data/legal-sources.js`(14건), `src/data/decision-rules.js`(23건, CONFIRMED/INFERRED/SIMULATED 구분).
- **설명 가능한 판단 모델**: `decision-model.js`가 제12조제3항 요건을 문서·입국근거·입국신고·생체·목적·기간·규제·추가확인(+난민·사범·송환) 도메인으로 나눠 PASS/REVIEW/FAIL/PENDING을 산출. 판정 로직은 변경하지 않음(불변식 테스트로 보장).
- **UI**: 작업대 '판단 근거' 패널, 결과 화면 '판단 근거' 섹션(조문·출처 progressive disclosure), 불허 사유 대화상자 조문 안내, 메뉴 '법령·출처 등록부', 입국 요건 자료 패널을 신원/입국 근거·사전여행허가/여행·목적·체류로 재편, 업무참고 '용어 안내'(SECONDARY·INAD는 시뮬레이션 용어, K-ETA는 사증이 아님)·'조건부 입국허가' 안내.
- **좁은 화면 fallback**: 1024px 미만에서 세로 스택·스크롤·안내 배너(모바일 최적화 아님).
- 미확인 영역(입국재심 내부 기준, 감식 절차, 규제정보 구조 등)은 시뮬레이션으로만 유지하고 문서화.

---


기능 추가 없는 재구축 릴리스. v6.1의 모든 기능·법률 상태머신을 보존하면서 소스를 모듈화하고 디자인 시스템을 새로 만들었습니다.

## 변경
- **아키텍처**: 단일 1.5MB HTML → `src/` 모듈(데이터 / DOM-free 엔진 / UI / 컨트롤러). 단일 상태 트리, 이벤트 버스, esbuild 단일 HTML 빌드.
- **디자인 시스템 v2**: semantic 토큰, system font 타입 스케일, fr 기반 3열 작업대, 종이 질감 문서 표면, 절차별 액센트. 네온·글로우·중첩 카드 제거. 캠페인 연계사건 표시 시 작업대가 붕괴하던 레이아웃 버그, 16px 가로 클리핑 수정.
- **접근성**: 모달 포커스 트랩·복원, 절차화면·튜토리얼 포커스 관리, `aria-pressed`, Ctrl/Cmd 조합 단축키 충돌 제거. 기존 단축키·스킵링크·라이브 리전·고대비·큰 글자·동작 감소·음향 자막 유지.
- **테스트/CI**: node:test 단위·불변식 36개, dist 무결성 검사, Playwright E2E 19개(dist/legacy/src 대상), GitHub Actions.
- **저장**: v6.x 저장 키·스키마 그대로 호환, 마이그레이션 단일화.
- **정리**: 미사용 `NORMAL_CASES` 정적 데이터(68KB) 제거, 미정의 CSS 토큰·죽은 선택자 제거.

## 변경하지 않은 것
- 법률 판정 로직과 12개 핵심 사건 데이터(2026-09-07 공개 기준). `docs/legal-review.md` 참조.

## 실행
```
npm install
npm run build        # dist/index.html + index.html
npm test             # unit + build + integrity + e2e
npm run dev          # http://127.0.0.1:4175
```

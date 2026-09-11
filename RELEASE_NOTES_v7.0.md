# INAD: 제12조 v7.0 — Architecture & Design Rebuild

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

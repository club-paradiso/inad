# INAD 디자인 감사 — 2026-10-20 (universal UX/UI 프롬프트 적용 4차)

## 프로젝트 정보
- 입국심사관 시뮬레이션 게임 v10 (한국어 UI + 영어 전환, vanilla HTML/CSS/JS)
- 핵심 사용자: 게임을 플레이하는 사용자 (수습 심사관 역할)
- 기존 시각 언어: INSTITUTIONAL CINEMA — 차분한 워크스테이션 + 어두운 인터뷰 부스 + 공식 기록물 질감
- 자체 UI 헌법(`design/v10/UI_CONSTITUTION.md`) + E2E 디자인 불변식 테스트 보유 — 이미 프롬프트 원칙 내재화됨

## 판정: 헌법 위반 2건 수정, 그 외 체계 정상
- 그라디언트 전수 검사: 전부 기능적(자막 스크림·스크롤 마스크·QR/바코드 패턴·잠금 해치) — 헌법 허용 범위
- 장식 영어 라벨: i18n `t()` 함수로 정상 현지화됨
- 🟩⬜ 공유 그리드: Wordle식 공유 컨벤션으로 의도적 설계 — 유지

## 적용된 수정
1. `src/js/ui/coach.js` — 수습 심사관 안내 배너의 💡 이모지를 인라인 SVG info 아이콘으로 교체
   (헌법 "Never 5. Emoji" + "Never 6. AI assistant 메타포" 위반 해소, aria-hidden 유지)
2. `src/data/achievements.js` — `daily_first` 업적 아이콘 ☀ → ◆ (다른 업적과 표기 통일)

## 검증
- `npm run lint` 통과 (84 modules OK), `npm run test:unit` 147개 통과
- AGENTS.md 규칙 준수: `src/`만 수정 (생성 파일·legacy 미접촉), 외부 CDN/폰트 없음

## 손대지 않은 것
- 디자인 토큰/브레이크포인트/의미색 체계 — Figma와 1:1 동기화 중이라 임의 변경 금지
- ✕ 닫기 버튼, ✓ 상태 표시 — 기능적 텍스트 기호로 판정

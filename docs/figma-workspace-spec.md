# Figma 작업 공간 사양 · INAD — Adaptive Workstation Design System

파일: `INAD — Adaptive Workstation Design System` (Figma Design, 팀 Drafts)
URL: https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8
소스 오브 트루스 원칙은 `docs/design-workflow.md` 참조. 이 문서는 파일 안에 무엇이 있어야 하는지(페이지·변수·스타일·컴포넌트·프레임)를 정의한다.

## 1. 페이지

| 페이지 | 내용 |
|---|---|
| 00 — Cover & Read Me | 프로젝트명·버전·저장소·프로덕션 URL·원칙·페이지 지도·편집 규칙·명명 규칙 |
| 01 — Current Product Audit | v7.2 캡처(1440×1000 · 1024×768 · 768×1024 · 390×844) + P0/P1/P2 주석 |
| 02 — UX Architecture | 승객→인터뷰→증거→조회→판단→결정→절차 흐름, 단계별 1차/2차 정보·행동·오류 상태, 폼팩터 매핑 |
| 03 — Foundations | 색·간격·반경 변수 스와치, 타입 스케일 견본, 브레이크포인트 참조 프레임 7종 |
| 04 — Components | 컴포넌트 세트(아래 §4) + 짧은 설명 |
| 05 — Patterns | Case Context · Interview Workspace · Evidence Workspace · Document Inspection · Lookup Result · Assessment Summary · Decision Area · Procedure Flow · Mobile Task Navigation · Tablet Inspector |
| 06 — Desktop | Desktop IA — A(2열+레일) · **Desktop IA — D(3구역, 구현 후보)** 1440·1280·1024 |
| 07 — Tablet | 768×1024 (작업 영역 + 인스펙터) · 1024×768 |
| 08 — Mobile | 390×844 과업 4종 + 문서 전체화면 · 430×932 · 320×568 |
| 09 — Procedures | 일반심사 · 입국재심 · 입국불허·송환 · 난민 회부심사 · 출입국사범 조사 · 긴급체포 요건 · 사건 종결 |
| 10 — States & Edge Cases | 로딩·빈 상태·비활성·불가·오류·API 폴백·긴 이름·긴 번역·큰 글자·고대비·긴 문서 필드·조회 결과 없음·복수 쟁점·절차 잠금 |
| 11 — Prototype | 시작 → 일반심사 → 인터뷰 → 자료 → 조회 → 결정 → 재심 → 최종 결정 (프로토타입 링크) |
| 12 — Playground | Component · Desktop · Tablet · Mobile · Typography · Color Sandbox + 4단계 안내 |
| 13 — Archive | 폐기 시안 보관(현재 비어 있음) |

## 2. 변수 (Variables)

컬렉션 4개, 모드 각 1개(`Default`). 모든 변수에 scope와 WEB code syntax(`var(--…)`)를 설정한다.

### Color (`tokens.css` 매핑)

| Figma 변수 | 값 | CSS |
|---|---|---|
| color/bg/canvas | #DFE5EA | `--canvas` |
| color/bg/surface | #F6F8F9 | `--surface` |
| color/bg/subtle | #EDF1F4 | `--surface-2` |
| color/bg/elevated | #FFFFFF | `--elevated` |
| color/bg/panel-head | #E7EDF1 | `--panel-head` |
| color/bg/document | #FBFAF6 | `--document` |
| color/bg/chrome | #14232F | `--chrome` |
| color/bg/chrome-2 | #203746 | `--chrome-2` |
| color/text/primary | #14232D | `--text` |
| color/text/secondary | #435560 | `--text-2` |
| color/text/muted | #66777F | `--text-3` |
| color/text/inverse | #FFFFFF | `--text-inverse` |
| color/text/chrome | #F2F6F8 | `--chrome-text` |
| color/text/chrome-muted | #A9BAC6 | `--chrome-muted` |
| color/border/subtle | #D2DBE1 | `--border-subtle` |
| color/border/default | #B8C5CD | `--border` |
| color/border/strong | #8498A5 | `--border-strong` |
| color/action/primary | #245F86 | `--accent` |
| color/action/hover | #1C5075 | `--accent-hover` |
| color/action/pressed | #174B6C | `--accent-strong` |
| color/action/soft | #E2EDF4 | `--accent-soft` |
| color/action/text | #174D70 | `--accent-text` |
| color/status/success | #286B49 | `--success` |
| color/status/success-soft | #E4F0E9 | `--success-soft` |
| color/status/success-text | #1D593B | `--success-text` |
| color/status/warning | #9A6718 | `--warning` |
| color/status/warning-soft | #F6ECD7 | `--warning-soft` |
| color/status/warning-text | #745012 | `--warning-text` |
| color/status/danger | #A33239 | `--danger` |
| color/status/danger-soft | #F5E3E4 | `--danger-soft` |
| color/status/danger-text | #81272E | `--danger-text` |
| color/status/info | #396F91 | `--info` |
| color/status/info-soft | #E5EEF4 | `--info-soft` |
| color/status/procedure | #5F4A7C | `--sjp` |
| color/status/neutral-soft | #ECEFF3 | `--neutral-soft` |

### Space

| 변수 | 값 | CSS |
|---|---|---|
| space/1 | 4 | `--s-1` |
| space/2 | 8 | `--s-2` |
| space/3 | 12 | `--s-3` |
| space/4 | 16 | `--s-4` |
| space/6 | 24 | `--s-5` |
| space/8 | 32 | `--s-6` |

### Radius

| 변수 | 값 | CSS |
|---|---|---|
| radius/none | 0 | `--r-0` |
| radius/small | 2 | `--r-1` |
| radius/medium | 4 | `--r-2` |
| radius/large | 6 | `--r-3` (모달·시트·절차 화면만) |

### Size (레이아웃 참조)

| 변수 | 값 | CSS |
|---|---|---|
| size/topbar | 48 | `--h-topbar` |
| size/casebar | 44 | `--h-casebar` |
| size/statusbar | 24 | `--h-statusbar` |
| size/tasknav | 56 | `--h-tasknav` |
| size/touch | 44 | (터치 최소 hit) |
| size/zone-left | 320 | `--w-left` |
| size/zone-right | 360 | `--w-right` |
| size/inspector | 300 | `--w-inspector` |

## 3. 텍스트 스타일

Figma에는 시스템 폰트가 없으므로 한글 본문은 `Noto Sans KR`, 코드·ID는 `Roboto Mono`를 시스템 폰트의 대체 견본으로 쓴다(코드는 `--font` / `--mono` 시스템 스택).

| 스타일 | 크기/행간/굵기 | CSS |
|---|---|---|
| type/display | 26 / 32 / Bold | `--fs-display` |
| type/title | 17 / 22 / Bold | `--fs-title` |
| type/section | 13 / 18 / Bold | `--fs-section` |
| type/body | 13 / 20 / Regular | `--fs-body` |
| type/compact | 12 / 17 / Regular | `--fs-compact` |
| type/label | 11 / 15 / Medium | `--fs-label` |
| type/meta | 10.5 / 14 / Regular | `--fs-meta` |
| type/code | 11 / 15 / Roboto Mono Regular | `--mono` |
| type/control | 12 / 16 / Medium(600 대체) | 버튼·탭 라벨 (`.act`, `.iconbtn`, `.qtab`, `.wb-tab`, `.tasknav button`) |

10.5px 미만 텍스트는 만들지 않는다(CLAUDE.md·design-system.md와 같은 하한).

## 4. 컴포넌트 (04 — Components)

| 컴포넌트 | 변형 | 코드 |
|---|---|---|
| Action/Button | Type: Primary · Secondary · Ghost · Danger / State: Default · Hover · Pressed · Disabled | `components.css` `.act.primary` · `.act` · `.act.danger`, 크롬 `.iconbtn` (전용 `.btn` 클래스 없음; Pressed는 코드에 `:active` 규칙이 없어 `--accent-strong` 미사용) |
| Action/Decision | Kind: Clear · Secondary · Refuse · SJP · Special / State: Default · Disabled · Armed | `src/js/ui/decision-desk.js` |
| Navigation/Tab | State: Default · Active / Count: on·off | `.qtab`(질문 분류) · `.wb-tab`(자료 보기), APG 탭 패턴 |
| Navigation/TaskNav | Active: Passenger · Interview · Evidence · Assessment | `src/js/ui/task-nav.js` |
| Navigation/Stepper | Stage: Primary · Secondary · Decision · Followup / Tone: default · warning · danger · info | `src/js/ui/passenger-panel.js` `renderCaseBar` |
| Case/Identity | Density: full · compact | `src/js/ui/passenger-panel.js` |
| Case/Header | Breakpoint: desktop · tablet · mobile | `src/index.html` `.casebar` |
| Case/OpsSummary | Tone: normal · warn · bad | `src/js/ui/shell.js` |
| Interview/Message | Role: officer · alien · interpreter · system · alert | `src/js/ui/interview-panel.js` `renderLog` |
| Interview/Question | State: default · asked · locked · branch | `renderQuestions` |
| Interview/LanguageBar | Mode: ko · en · interpreter · none | `renderLanguage` |
| Document/Selector | State: default · selected · alert | `src/js/ui/document-workbench.js` |
| Document/Field | Width: half · wide | `docFieldRows` |
| Document/Paper | Kind: passport · visa · earrival · pnr · hotel · idcard · biometric · watchlist · letter | `documentHTML` |
| Lookup/Action | State: default · done · alert(✓ / ! 접두) | `.lookup-tabs button` |
| Lookup/Result | Tone: 정상 · 주의 · 경고 · 치명 | `src/js/ui/system-panel.js` `renderTerminal` |
| Assessment/Readiness | Level: low · mid · ready | `renderMatrix` |
| Assessment/Fact | Status: ok · warn · bad | `renderMatrix` `.ev` |
| Assessment/Basis | Status: pass · review · fail · pending / Open: true·false | `src/js/ui/decision-basis.js` |
| Assessment/Clue | Kind: confirm · unresolved · conflict · context | `renderClueBoard` |
| Procedure/Header | Mode: secondary · refugee · sjp · repatriation | `src/js/ui/procedure-screen.js` |
| Procedure/Step | State: done · active · pending | `.proc-step` |
| Procedure/Row | State: default · done · warn | `.proc-row` |
| Procedure/Action | Kind: primary · good · danger · neutral | `.proc-action` |
| Feedback/Toast | Kind: toast · event | `src/js/ui/toast.js` |
| Feedback/Inline | Tone: info · warn · danger · legal | `.inline-note`(대화상자) · `.proc-note`(절차 화면) |
| Overlay/Dialog | Size: default · wide / Breakpoint: desktop · mobile(sheet) | `src/js/ui/modals.js` |
| Overlay/Callout | — | `src/js/ui/shell.js` `showCallout` |
| Panel/Frame | Head: on·off | `.panel` `.ph` |

## 5. 프레임 목록

06 — Desktop: `Desktop IA — D / 1440×1000 (구현 후보)`, `Desktop IA — D / 1280×800`, `Desktop IA — D / 1024×768`, `Desktop IA — A / 1440×1000 (탐색)`.
07 — Tablet: `Tablet / 768×1024 · 인터뷰`, `Tablet / 768×1024 · 자료`, `Tablet / 1024×768`.
08 — Mobile: `Mobile / 390 · 승객`, `Mobile / 390 · 인터뷰`, `Mobile / 390 · 자료`, `Mobile / 390 · 문서 전체화면`, `Mobile / 390 · 판단`, `Mobile / 430 · 판단`, `Mobile / 320 · 인터뷰`.
09 — Procedures: `Primary`, `Secondary`, `Refusal → Repatriation`, `Refugee referral`, `SJP investigation`, `Arrest review`, `End of case` (데스크톱 1440 + 모바일 390 각 1).
10 — States: 상태별 프레임 14개.
11 — Prototype: Start → Primary → Interview → Evidence → Lookup → Decision → Secondary → Final Decision.
12 — Playground: Component / Desktop / Tablet / Mobile / Typography / Color Sandbox.

## 6. 노드 ID (2026-09-12 기준)

| 페이지 | 섹션 · 프레임 | ID |
|---|---|---|
| 00 Cover | Cover · Read Me | 39:2 · 39:18 |
| 01 Audit | `[Implemented]` 섹션 · as-is 1440 · as-is 390 · 주석 · 캡처 자리 | 37:2 · 37:4 · 37:54 · 37:78 · 37:148 |
| 02 UX Architecture | `[Implemented]` 섹션 · 흐름 · 영역 표 · 폼팩터 표 · IA 후보 표 | 38:2 · 38:4 · 38:29 · 38:147 · 38:193 |
| 03 Foundations | 색 보드 · 간격 보드 · 타입 보드 · 브레이크포인트 7종 | 5:4 · 6:2 · 6:49 · 7:4~7:91 |
| 04 Components | 30세트 (예: Action/Decision 10:47 · Navigation/TaskNav 12:42 · Case/Header 21:219 · Panel/Frame 20:97) · 코드 매핑 표 | 8:4 ~ 21:219 · 39:131 |
| 05 Patterns | `[Implemented]` 섹션 · 패턴 그리드 10종 | 36:2 · 36:4 |
| 06 Desktop | `[Approved]` IA-D 1440 · 1280 · 1024 / `[Exploration]` IA-A 1440 | 25:2 · 25:4 · 26:389 · 26:963 / 26:1536 · 26:1538 |
| 07 Tablet | `[Approved]` 768 인터뷰 · 768 자료 | 27:2 · 27:4 · 27:411 |
| 08 Mobile | `[Approved]` 390 승객·인터뷰·자료·문서 전체화면·판단 · 430 판단 · 320 인터뷰 | 28:2 · 28:4 · 28:154 · 28:329 · 28:555 · 28:669 · 28:864 · 28:1059 |
| 09 Procedures | `[Approved]` 재심 · 송환 · 회부심사 · 사범조사 · 체포 요건 (1440/390) · Primary 흐름 · 사건 종결 | 29:2 · 29:4/29:213 · 29:409/29:585 · 29:748/29:913 · 29:1065/29:1244 · 29:1410/29:1576 · 30:1121/30:1166 · 30:1211/30:1266 |
| 10 States | `[Approved]` 섹션 · 상태 그리드 14종 | 31:2 · 31:4 |
| 11 Prototype | `[Approved]` 섹션 · P1~P8 (시작 지점 34:4) | 34:2 · 34:4 · 34:66 · 34:218 · 34:775 · 34:1287 · 34:1805 · 34:2319 · 34:2409 |
| 12 Playground | `[Exploration]` 섹션 · 안내 · 샌드박스 | 33:2 |
| 13 Archive | 사용법 안내(보관물 없음) | 39:57 |

## 6.1 Astra Redesign 탐색 (2026-09-15 기준)

`[Exploration] Astra Redesign — *` 섹션은 v7.2 `[Approved]` 시안을 대체하지 않는 병렬 탐색이다.
`[Approved]`·`[Implemented]` 섹션은 그대로 두고 복제·재구성한 결과만 이 섹션에 둔다.

| 페이지 | 섹션 | 프레임 · 컴포넌트 |
|---|---|---|
| 03 Foundations | 89:2 | Astra 토큰 탐색 |
| 04 Components | — | Astra/Control 90:87 · Astra/Record 92:101 · Astra/SectionHeading 93:73 · Astra/InterviewMessage 93:98 · Astra/TravelerSummary 95:73 · Astra/Decision 106:74 · Astra/LegalCondition 108:6653 · Astra/Checkbox 121:7140 |
| 06 Desktop | 98:1717 | Primary inspection 1440 98:1718 · **Primary inspection 1280 173:1920** · Compact workstation 1024 111:6642 |
| 07 Tablet | 115:7029 | 768 인터뷰 115:7030 · 768 자료 116:568 |
| 08 Mobile | 112:2495 | 인터뷰 390 112:2496 · 판단 390 114:6772 · 결정 무장 390 114:6870 · 자료 390 114:6944 · 대상자 390 115:732 · 인터뷰 430 115:6974 |
| 05 Patterns | 186:337 | 패턴 10종 그리드 186:339 |
| 11 Prototype | 189:1930 | 모바일 흐름 P1~P6 189:1932 · 189:1946 · 189:1972 · 189:2019 · 189:2045 · 189:2071 |
| 10 States & Edge Cases | 179:141 | 상태 14종 그리드 179:143 |
| 09 Procedures | 116:1476 | 1024: 입국재심 116:1477 · 난민 회부심사 119:753 · 출입국사범 조사 119:789 · 송환지시 119:825 · 긴급체포 요건 검토 121:7141 · 출국대기실 122:7148<br>390: 입국재심 124:820 · 난민 회부심사 133:838 · 출입국사범 조사 135:851 · 긴급체포 요건 검토 135:878 · 송환지시 135:912 · 출국대기실 135:938 |

절차 6종은 코드의 절차 모드와 1:1로 대응한다: `secondary` · `refugee` · `sjp` · `repatriation`
(`legal-engine.js` `procedureMeta`), 그리고 `sjp` 안의 `ARREST_REVIEW` 단계와 `repatriation`의
출국대기실 단계(`repatriationTimeline` 제76조의2). 강제퇴거·출국명령과는 계속 구분한다.

Astra 탐색의 남은 과제(페이지가 아니라 항목): Astra 전용 TaskNav·Dialog·Toast 컴포넌트 부재 · `Astra/Record` 색 전용 상태 · 변형 매트릭스 희소 · `Astra/Decision` 공유 속성 재구성(승인 대기). 01 Audit·02 UX Architecture는 현재 제품을 기록하는 페이지라 Astra 사본을 만들지 않았다.


## 6.2 Astra 컴포넌트의 구조적 제약과 확인된 결함 (2026-09-16 감사)

### 공유 TEXT 속성 — 변형 미리보기가 모두 같은 문자열로 보이는 이유

`Astra/Decision` · `Astra/Record` · `Astra/InterviewMessage` · `Astra/LegalCondition`은
각각 **하나의 공유 TEXT 컴포넌트 속성**으로 주 라벨을 노출한다.

| 세트 | 공유 속성 | 기본값 |
|---|---|---|
| Astra/Decision | `Title#10:30` | 입국 허가 |
| Astra/Record | `Kind#92:0` | 법적 조건 · 확인 전 |
| Astra/InterviewMessage | `Speaker#93:8` | 심사관 |
| Astra/LegalCondition | `Condition#108:2` | 입국금지 해당 여부 · 확인 전 |

그래서 04 페이지의 변형 그리드는 Kind/Type/Speaker/State와 무관하게 **모든 변형이 같은 기본 문자열**을 보여준다.
예: `Astra/Decision`의 Refuse·SJP·Special 변형도 제목이 "입국 허가"로 렌더링된다.

**이것은 사용 시 결함이 아니다.** 실제 인스턴스는 인스턴스별로 속성을 덮어쓴다
(확인: `124:836` Kind=Refuse → "입국 불허가", `133:850` Kind=Refuse → "난민인정심사 불회부").
라이브러리 가독성 문제이며, 변형 텍스트를 직접 편집해 고칠 수 **없다** —
공유 속성의 기본값을 바꾸면 15개 변형 전체가 함께 바뀐다(2026-09-16 실측 확인).
고치려면 공유 속성을 제거하고 Kind별 리터럴 제목으로 재구성해야 하는데,
이는 컴포넌트 계약 변경이며 기존 인스턴스의 덮어쓰기를 모두 잃는다. **작성자 승인 필요.**

### 미해결 결함

- `Astra/Record`는 상태를 **색으로만** 전달한다(아이콘·상태 라벨 레이어 없음).
  세트 description은 "label and icon as well as colour"라고 적고 있어 설명과 실제가 어긋난다.
  단, 실제 인스턴스는 상태어를 텍스트에 담아 쓴다(예: "· 충족", "· 추가 확인", "· 미확인").
- `Astra/Control`은 Kind×State 18조합 중 8개, `Astra/Record`는 24조합 중 8개만 존재한다.

### 2026-09-16 · 6차 · Prototype 추가

`189:1930` `[Exploration] Astra Redesign — Prototype · 모바일 과업 흐름` · P1~P6 · 반응 8개 ·
시작점 `입국심사 흐름 (모바일 390)`.

[Approved] 34:2가 이미 데스크톱 1440 흐름을 다루므로 **중복하지 않고 모바일 390 흐름**을 지었다.
Astra 작업이 가장 두터운 곳이고, 모바일에서만 드러나는 세 가지 동작을 한 흐름에 담을 수 있다.

P1 대상자 → P2 인터뷰 → P3 자료 → P4 판단 (하단 과업 내비게이션)
P4 → P5 (입국 허가 **첫 탭 무장**) → P1 (**두 번째 탭 실행** · 사건 종결 후 다음 승객)
P5 → P4 (`AFTER_TIMEOUT` 4초 = **무장 해제**, 코드의 4초 만료를 그대로 모델링)
P4 → P6 입국재심 절차 (**절차 인계**) → P4 (일반 심사대 보기)

즉 흐름 자체가 법률 불변식을 보여 준다: 단일 탭으로 법적 단계가 바뀌지 않고,
절차는 작업대와 분리된 화면을 가지며, 절차에서 심사대로 되돌아올 수 있다.

핫스팟은 투명 사각형이며 모두 `layoutPositioning: ABSOLUTE`라 프레임 오토레이아웃을 건드리지 않는다
(검증: 6프레임 bleed 0 · 프레임 밖 텍스트 0).

### 2026-09-16 · 5차 · Patterns 추가

`186:337` `[Exploration] Astra Redesign — Patterns` · 그리드 `186:339` · 셀 10종.
[Approved] 36:2와 같은 10개 패턴을 Astra 어휘로 다시 적었다. 각 셀은
제목 · 언제 · 구성 · **근거(실제 Astra 프레임의 노드 id)** 네 줄에 살아 있는 인스턴스 예시를 붙였다.

패턴은 "어떤 컴포넌트를 어떤 순서·크기로" 조합하는지에 대한 규칙이므로,
이번에 Astra에서 실제로 정한 결정들을 규칙으로 승격했다. 예:
- 3 Evidence Workspace — "문서 패널은 반드시 `clipsContent` + `overflowDirection`을 선언한다"
  (1024·1280·768·390에서 흘러넘침을 고치며 매번 적용한 규칙).
- 6 Assessment Summary — 미확인·추가확인을 위로, 충족을 아래로.
- 8 Procedure Flow — 4구역 고정, 절차는 서로 합치지 않고 화면을 따로 가진다.

9 Mobile Task Navigation에는 **Astra 전용 TaskNav 컴포넌트가 아직 없고 프레임에 직접
조판되어 있다**는 사실을 숨기지 않고 적었다(컴포넌트화 미해결).

검증: bleed 0 · 프레임 밖 텍스트 0 · 10.5px 미만 0.

### 2026-09-16 · 4차 · States & Edge Cases 추가

`179:141` `[Exploration] Astra Redesign — States & Edge Cases` · 그리드 `179:143` · 셀 14종.
[Approved] 31:2와 같은 14개 상태를 Astra 컴포넌트 어휘로 다시 구성했다.
CLAUDE.md 원칙대로 **각 셀은 코드에 실제로 존재하는 렌더 경로**를 근거로 적었고,
셀 설명에 해당 파일·함수를 명시했다(예: `system-panel.js` `state.queries` 빈 배열,
`start-screen.js:39` `live.status === 'fallback'`, `legal-engine.js` `validateArrestExecution`).

새 기능을 가정하지 않았다. 컴포넌트로 표현할 수 없는 두 가지는 인스턴스 대신 직접 조판했다:
09 `pref-large-text`(13→15 / 12→13.5 비교)와 10 `pref-high-contrast`(배경 틴트 없이 좌측 3px 선).

법률 불변식 확인:
- 12는 조회 결과를 사실로만 적고 "이 기록 자체가 입국불허 사유로 자동 연결되지 않는다"를 명시.
- 14는 `ARREST_REQUIREMENTS` 3개를 개별 체크로 두고, 버튼을 비활성으로 숨기는 대신
  `validateArrestExecution`이 관문임을 적었다 — 코드와 같고, 자동 체포가 아니다.
- 13은 6.2에서 고친 `Astra/LegalCondition`을 실제 조합에서 검증한다:
  Fail(적색) · Review(앰버) · Pending(흰색+파선)이 서로 구별된다.

검증: bleed 0 · 프레임 밖 텍스트 0 · 10.5px 미만 0 · 그리드가 섹션 안에 들어감.

### 2026-09-16 · 3차 · Desktop 1280 추가

`173:1920` `Astra / Primary inspection / 1280×800` — [Approved] IA-D와 같은 1280×800로 맞췄다.
1024를 늘린 것이 아니라 **밴드가 다르다**: CLAUDE.md상 1024–1279는 288·유동·320,
≥1280은 320·유동·360이다. 1440에서 복제한 뒤 폭만 줄이면 구역이 320·568·360으로
자동 정렬된다(evidence가 FILL) — 즉 1280은 좁은 1440이지 넓은 1024가 아니다.

세로 예산이 1440보다 200px 짧아(800) 세 곳이 넘쳤고, 기준을 나눠 처리했다.

- `173:1962` Evidence / source document — `clips:false`로 형제 위에 **39px 흘러넘침**(진짜 결함).
  1024가 같은 문제를 푸는 방식(문서 패널을 축소 + 스크롤 영역 선언)을 그대로 적용해
  384 → 345, `clipsContent` + `overflowDirection: VERTICAL`. 구역 합계 656 = 구역 높이 656.
- `173:1940` Interview 대화록(265/324)과 `173:1995` 법적 조건 목록(304/384)은 **건드리지 않았다.**
  둘 다 `clipsContent` + `overflowDirection: VERTICAL`로 선언된 스크롤 영역이고,
  경계에서 행이 잘리는 것은 "아래에 더 있다"는 정상적인 스크롤 어포던스다.
  (같은 판단을 1024 프레임에서 이미 내렸다.)
- 상태바 텍스트는 1440용 1408px 고정이라 1280에서 144px 넘쳤다 → `FILL`(1264px).

10.5px 미만 텍스트 0 · 프레임 밖 텍스트 0 · 잔여 bleed 0.

### 2026-09-16 · 2차 (시안 개선)

- `Astra/LegalCondition` **State=Pending과 State=Review가 완전히 동일**하던 문제를 해소했다.
  Pending은 "아직 조회하지 않음", Review는 "확인했고 추가 확인 필요" — 의미가 다른데 둘 다 앰버였다.
  Pending을 흰 배경 + **파선 테두리**(`color/border/strong`) + 보조 텍스트색(`color/text/secondary`)으로 바꿔
  색 외의 채널로도 구분되게 했다. 나머지 네 상태는 그대로 두었다.
  06 Desktop 기준 Pending 2개 · Review 4개 인스턴스가 이제 구별된다 —
  "해야 할 조회"와 "확인된 쟁점"이 한눈에 갈린다.
- `Astra/Control` **State=Loading이 State=Disabled와 시각적으로 동일**하던 문제 —
  하단에 2px 진행 표시(`color/action/primary`, absolute 배치)를 추가했다. 오토레이아웃은 건드리지 않았다.

두 변경 모두 기존 semantic token에 바인딩했고, 공유 TEXT 속성·인스턴스 덮어쓰기·레이아웃 구조는 건드리지 않았다.

### 2026-09-16에 고친 것

- 컴포넌트 세트 5개가 `clipsContent`로 모든 변형의 오른쪽 16px을 잘라내던 문제 — 프레임 폭 확장
  (Control 160→192 · Record 328→360 · InterviewMessage 296→328 · LegalCondition 360→392 · Checkbox 440→472).
- `111:6733` 1024 프레임의 상태바 텍스트가 1408px로 프레임 밖 400px까지 뻗던 문제 — `FILL`로 변경(1008px).
- `124:820` 입국재심 390 프레임의 좌우 여백이 다른 5개와 달리 12px이던 문제 — 16px로 통일.


## 7. 알려진 제한

- **MCP 페이지 목록**: `get_metadata`를 `nodeId` 없이 호출하면 문서의 전체 페이지가 아니라 **현재 로드된 페이지 1개만** 반환한다. 실제 페이지 목록은 `use_figma`에서 `figma.root.children`로 확인해야 한다. 이 차이 때문에 "페이지가 `00 — Cover & Read Me` 하나뿐"이라는 잘못된 보고가 나온 적이 있다(2026-09-15 확인: 14개 페이지 · 변수 57개 · 컴포넌트 세트 34개 모두 존재).
- **Code Connect**: 현재 Figma 플랜(Dev/Full seat · Organization/Enterprise 필요)에서 `add_code_connect_map`가 거부된다. 대체 매핑: 각 컴포넌트 세트의 description(렌더러·파일 경로), 위 §4 표, 04 페이지 "코드 매핑" 표. 플랜이 바뀌면 §4 표대로 Javascript 라벨 매핑을 추가한다.
- **래스터 업로드**: 작업 환경의 네트워크 정책이 figma.com 업로드를 차단하므로 01 Audit 페이지는 와이어프레임·주석으로 구성했고 캡처는 `docs/audit/v7.2/`에 있다. 사람이 "캡처 자리" 프레임에 끌어다 놓는다.

- **파일 이름**: 플러그인 API로는 문서 이름을 바꿀 수 없다(`Setting the document name is currently not supported`). 또한 `figma.root.name`은 원격 MCP 세션에서 실제 파일 제목 대신 `Document`를 반환하므로 **파일 이름의 근거로 쓰면 안 된다**. 실제 이름은 Figma UI 또는 공유 URL 슬러그로 확인한다(2026-09-16 기준 URL 슬러그는 `INAD — Adaptive Workstation Design System`).

## 8. 상태 표기(승인 흐름)

섹션 이름 접두어로 관리한다: `[Exploration]`, `[Review]`, `[Approved]`, `[Implemented]`. 필 뱃지를 만들지 않는다. 구현 대상은 `[Approved]` 섹션 안의 프레임 또는 작업 지시에서 명시한 프레임뿐이다.

## 9. v9.0 코드 → Figma 동기화 대기 (2026-10-01)

v9.0은 코드가 먼저 바뀌었다(작업 지시: 안정성·제품 품질 개편). Figma 파일은 **수정하지 않았다**: 변수 값을 바꾸면
`[Approved]`·`[Implemented]` 프레임의 모습도 함께 바뀌는데, 그 섹션은 자동화에 읽기 전용이기 때문이다(CLAUDE.md).
사람이 아래 표대로 반영한 뒤 해당 섹션을 `[Implemented]`로 표기한다. 이름은 하나도 바뀌지 않았다.

### 변수 값 (Color)
| Figma 변수 | Figma 값(§2) | 코드 값(v9.0) | 이유 |
|---|---|---|---|
| color/bg/canvas | #DFE5EA | #E6EAEE | 패널과의 대비를 낮춰 차분한 바닥 |
| color/bg/surface | #F6F8F9 | #FFFFFF | 패널 본문 흰색 |
| color/bg/subtle | #EDF1F4 | #F3F5F7 | 가라앉은 영역 |
| color/bg/panel-head | #E7EDF1 | #FFFFFF | 회색 제목 띠 대신 구분선 |
| color/border/subtle | #D2DBE1 | #E0E5E9 | 흰 패널 기준 |
| color/border/default | #B8C5CD | #C4CED5 | 흰 패널 기준 |
| color/text/muted | #66777F | #5B6B74 | 모든 바탕에서 10.5–11px 텍스트 ≥4.5:1 (이전 3.9–4.4:1) |

### 레이아웃·컴포넌트 (코드 기준, `src/styles/*`)
- Case/Header: 단계 칩은 스테퍼와 같은 단계를 말할 때(일반심사·입국재심) ≥1024에서 숨김, 일반심사 점은 중립색. 처리시간 옆 감찰은 "감찰 n/한도" 텍스트 + 한도 수만큼의 점(6·4·3). 판단 준비도 미터는 사건 헤더에서 제거(판단 패널에만).
- Case/Identity: 태도·긴장·협조 막대와 행동 칩, 의사소통 상태는 중립 회색만(이전: 성공·경고·위험 색).
- Interview/Message: 진술 본문 13px(body). Interview/LanguageBar: 모드+언어 버튼 한 줄, 안내 문장은 아래 한 줄(전체 문장은 title).
- 대상자 구역은 왼쪽 열 높이의 최대 42%를 쓰고 스크롤, 나머지는 인터뷰(질문 목록 1280×800에서 93px).
- Action/Decision: 무장 상태에 "다시 눌러 확정" 문구, 비활성 사유는 `#actionHint`. 결정 데스크 밖 계속 버튼은 Action/Button Primary(accent), 파괴적 확인은 Danger — 판정 색(clear/secondary/refuse/sjp)은 판정에만.
- Settings 토글 → Switch(트랙+노브, 켬일 때 트랙만 accent). Figma에 Overlay/Switch 컴포넌트가 없으므로 새로 만들 때 이 모양을 따른다.
- 한국어 UI에서 장식용 영어 라벨(절차 kicker, 초상 LIVE, 문서 유형 코드, NORMAL OPS) 숨김.
- 문서 선택기: 추가 확인 문서에 "! 추가 확인" 텍스트, 선택된 경고 문서는 accent 선택 띠 유지.
- 모노스페이스는 ID·MRZ·PNR·코드·숫자에만(법조문 표기·상태 문장·시계 라벨 제외), 시계는 HH:MM:SS.
- Procedure/*: 절차 화면은 사람·현재 단계·전체 순서·불가 사유(`is-blocked` + 이유)·근거 기록(`proc-record`)·돌아가기를 항상 표시. 긴급체포 집행은 외곽선 danger + "요건 확인 n/3" (Astra의 채움 빨강 CTA는 채택하지 않음).

### Astra 탐색안에서 채택하지 않은 것
§6.1–6.2의 Astra(`[Exploration]`)는 영역별로 비교했다. 채택: 판정 근거가 아닌 값의 중립 표기, 무장 상태 문구, 비활성 사유 문구, 한 화면 한 주요 행동. 보류(승인 필요): 결정 데스크 재배치(판정 쌍 + 절차 버튼), 판단 목록 단일화·정렬, 진술 기록의 초상 제거, 1279px 이하 문서 가로 탭, 운영 바 축소. 채택하지 않음: 초상·여권 사진 제거, 단일 질문 표시, 채움 빨강 긴급체포 버튼, 중복된 "일반 심사대 보기", KPI·운영 바 제거.


## 10. v10 Live Interview — 코드 → Figma 동기화 (2026-10-02)
코드가 먼저 바뀌었다(브랜치 `claude/relaxed-edison-iux1mv`, PR #13).
- **완료 · 변수**: `Color` 컬렉션에 `color/booth/{bg, plate, line, text, muted}` = `#111B21 · #18252C · #283840 · #E9EEF1 ·
  #A3B3BD`(WEB 코드 구문 `var(--booth)` · `var(--booth-2)` · `var(--booth-line)` · `var(--booth-text)` · `var(--booth-muted)`),
  `Size` 컬렉션에 `size/booth-width` = 304(설명: 1280–1439는 280, `var(--w-booth)`). 범위는 같은 그룹의 기존 변수와 동일
  (배경 FRAME_FILL·SHAPE_FILL, 선 STROKE_COLOR, 글자 TEXT_FILL, 너비 WIDTH_HEIGHT). 기존 변수 이름 변경·삭제 없음.
  변수 ID `VariableID:192:2`–`192:7`.
- **완료 · 섹션(06 — Desktop)**: `[Review] v10 Live Interview — 코드 구현 캡처 (PR #13 병합 대기)` (`194:2021`) — 시작 화면,
  인터뷰 1440·1280·1024, 낮은 확신 확인, 인터뷰 설정 시트, 음성 동의 시트, 디브리핑, 빠른 근무, 390 승객·인터뷰, 844×390.
  `[Exploration] v10 Live Interview — 방향 A/B/C` (`194:2061`) — A(채택)·A 390·B·C·v9 기준선.
  PR 병합 후 `[Review]` 섹션 이름을 `[Implemented]`로 바꾼다(자동화가 만든 노드).
- **미완료 · 이미지**: 각 프레임은 실제 크기의 빈 프레임과 저장소 경로 메모(`source-note`)만 있다. 이미지 업로드 경로
  `mcp.figma.com`이 작업 환경의 네트워크 정책에서 403으로 차단됐다. 원본: `design/v10/review/figma-sync/*.webp`(현재 빌드
  캡처), `design/v10/review/proto-*.webp`, `v9-before-1440.webp`. 허용 후 같은 프레임 ID에 채우기로 넣는다.
- **미완료 · 컴포넌트**: 부스(초상 + 자막 + 상태), 질문 바(입력 · 말하기 · 질문 · 상태/후보 칩), 진술 기록 행, 제안 탭 행,
  디브리핑 섹션은 아직 Figma 컴포넌트가 아니다. 코드가 소스 오브 트루스이며 캡처가 시각 기준이다.

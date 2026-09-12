# Design System v3 — Adaptive Workstation

Direction: 한국 공공기관 운영 소프트웨어(60%) · 공항 국경심사 워크스테이션(25%) · 절제된 시뮬레이션 피드백(15%). 밀도 높고 읽기 쉬우며 신뢰감 있는 화면. SaaS 대시보드·사이버펑크·게임 HUD가 아니다.
Figma: **INAD — Adaptive Workstation Design System** (https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8) — 변수·텍스트 스타일·컴포넌트가 아래 토큰과 1:1 (`docs/figma-workspace-spec.md`). 변경 절차는 `docs/design-workflow.md`.

## 토큰 (`src/styles/tokens.css`)
- Surfaces: `--canvas`(페이지 바닥) · `--chrome`/`--chrome-2`(상단 바·상태 바·과업 내비게이션·절차 헤더) · `--surface`(패널 본문) · `--surface-2`(가라앉은 영역: 기록·결과·컴포저) · `--elevated`(행·컨트롤·대화상자) · `--document`(문서 종이) · `--panel-head`(패널 제목 띠).
- Borders: `--border-subtle` / `--border` / `--border-strong`. Text: `--text` / `--text-2` / `--text-3` / `--text-inverse` / `--chrome-text` / `--chrome-muted`.
- Semantic: `--accent`(행동·선택), `--success`(허가·확인), `--warning`(재심·추가 확인), `--danger`(불허·모순·감찰), `--info`(통역·동행·회부심사), `--sjp`(출입국사범 절차). 각각 `-soft` 바탕과 `-text` 전경. `--proc`는 절차 화면 모드별 강조색.
- Type: 시스템 산세리프만. `--mono`는 ID·MRZ·PNR·코드·KPI에만. 스케일: display 26 / title 17 / section 13 / body 13 / compact 12 / label 11 / meta 10.5 — 10.5px 미만 텍스트 없음.
- Spacing 4/8/12/16/24/32 (`--s-1..6`). Radius 0/2/4/6 (`--r-0..3`; 6은 대화상자·시트·절차 화면만). Shadows는 대화상자·절차 화면·호출 카드·PA 배너만. Motion 120/180/220ms, reduced-motion에서 0.
- Layout: `--h-topbar 48 · --h-opsbar 32 · --h-casebar 44 · --h-statusbar 24 · --h-tasknav 56 · --h-mobile-header 56 · --w-left 320 · --w-right 360 · --w-inspector 300 · --size-touch 44`, `--safe-top/--safe-bottom`(iOS safe-area). 1279px 이하에서 좌 288·우 320, 820px 이하 높이에서 크롬 44/30/40.

## 구역과 브레이크포인트 (DOM은 하나)
작업대는 네 구역이다: **승객**(`.zone-person`: 대상자 카드·태도·언어) · **인터뷰**(`.zone-interview`: 진술 기록·언어 선택·질문) · **자료**(`.zone-evidence`: 제출 서류/입국 요건 작업대 + 전산 조회) · **판단**(`.zone-assessment`: 판단 준비도·확인 사항·법적 근거·단서 + 결정 데스크).

| 폭 | 배치 | 크롬 |
|---|---|---|
| ≥1280 | 3열: 승객+인터뷰(320) · 자료(유동) · 판단+결정(360) | 상단 바 48 · 운영 바 32 · 사건 헤더 44 · 상태 바 24 |
| 1024–1279 | 3열: 288 · 유동 · 320, 간격 6 | 동일(라벨 축약) |
| 768–1023 | 작업 영역(승객 + 인터뷰⇄자료 세그먼트) + 인스펙터 300(판단·결정 1열) | 동일 · 세그먼트는 `#taskNav`의 인터뷰/자료 버튼 |
| <768 | 과업 1개(`body[data-task]`) + 하단 과업 내비게이션 56(승객·인터뷰·자료·판단) | 모바일 헤더 56(+safe-area) · 사건 헤더 44 · 운영 KPI·대기열은 헤더의 [운영] 시트 |

`src/js/ui/task-nav.js`만 `body[data-task]`를 바꾼다. 단축키(`[`/`]`, 숫자)와 문서 선택은 `revealZone`으로 해당 구역을 연다. 페이지는 절대 가로 스크롤하지 않는다(E2E 불변식).

## 결정 안전장치
결정 버튼은 의미 색 외곽선(허가 success · 재심 warning · 불허 danger · 사범 절차 sjp)과 한국어 부제(법적 근거)를 갖는다. 터치 환경에서는 첫 탭에 `armed`(aria-pressed) 상태로 바뀌고 두 번째 탭에서 실행되며 4초 후 자동 해제된다. 불허·사범 절차는 그 뒤에도 사유 선택·요건 검토 대화상자를 거친다. 판정 근거가 아닌 값(긴장도·협조도·언어능력·동행)은 항상 "판정근거 아님" 라벨과 함께 회색으로만 표시한다.

## 컴포넌트
Panel(`.panel` + `.ph` 제목 띠) · 대상자 카드(초상·이름·라틴 표기·국적·여권·체류·목적·편명·입국기반) · 태도/언어 행 · 진술 기록(`.msg` officer/alien/interpreter/system/alert) · 언어 바 · 질문 탭 + 질문 행(default/asked/locked/branch) · 문서 선택기(`.docitem`) + 문서 종이(여권·사증·전자입국신고·PNR·숙박·신분증·생체·감시대상·서한) · 전산 조회 버튼(done/alert) + 결과 행(정상·주의·경고·치명) · 판단 준비도 · 확인 사항 행(ok/warn/bad) · 법적 근거 행(pass/review/fail/pending) · 단서 행 · 결정 버튼(Clear/Secondary/Refuse/SJP/Special × Default/Disabled/Armed) · 사건 헤더 + 단계 스테퍼 · 운영 요약 바 · 절차 화면(헤더·단계·행·행동) · 대화상자(데스크톱 중앙, 모바일 하단 시트) · 호출 카드 · 토스트/현장 이벤트 · 인라인 안내(info/warn/danger/legal).

## 접근성
모든 컨트롤에 보이는 포커스 링, 건너뛰기 링크, 토글에 `aria-pressed`, 과업 내비게이션에 `aria-current`, 대화상자 포커스 트랩·복원, 절차 화면·튜토리얼 포커스 이동·복원, PA 자막·토스트·기록에 `aria-live`, 사용자 설정(큰 글자·고대비·동작 감소·단축키 힌트) localStorage 보존, OS reduced-motion 존중. 단축키는 Ctrl/Cmd 조합을 무시한다. 터치 대상 44px 이상.

// UI localization for INAD. Korean remains the source language and default locale.
// This layer deliberately does not touch case/legal state: it only translates rendered UI text.
import { storeGet, storeSet } from './storage.js';

const LOCALE_KEY = 'inad-locale';
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
const originalText = new WeakMap();
const originalAttrs = new WeakMap();
let locale = normalizeLocale(storeGet(LOCALE_KEY, 'ko'));
let observer = null;
let initialized = false;

const EXACT = new Map([
  ['본문 바로가기', 'Skip to main content'],
  ['이 시뮬레이션의 심사 작업대는 가로 1024px 이상 화면에 맞춰 설계되었습니다. 좁은 화면에서는 패널이 세로로 쌓이며 일부 기능이 제한될 수 있습니다.', 'This simulation workspace is designed for screens at least 1024px wide. On narrower screens, panels stack vertically and some functions may be limited.'],
  ['INAD: 제12조', 'INAD: Article 12'],
  ['인천공항 제2여객터미널 · 입국심사 시뮬레이션', 'Incheon Airport Terminal 2 · Immigration Inspection Simulation'],
  ['근무조', 'Duty shift'],
  ['사건 진행', 'Case progress'],
  ['근무 현황', 'Duty status'],
  ['처리', 'Processed'],
  ['대기 승객', 'Waiting travelers'],
  ['평균 심사', 'Avg. inspection'],
  ['종합평가', 'Overall rating'],
  ['보조 메뉴', 'Utility menu'],
  ['도움말', 'Help'],
  ['오늘의 미션', 'Daily missions'],
  ['근무기록', 'Duty records'],
  ['음향 켬', 'Sound on'],
  ['음향 끔', 'Sound off'],
  ['메뉴', 'Menu'],
  ['업무참고', 'Reference'],
  ['프로필', 'Profile'],
  ['설정', 'Settings'],
  ['법령·출처 등록부', 'Laws & Sources'],
  ['시스템·데이터', 'System & Data'],
  ['현장 운영 상황', 'Field operations status'],
  ['운영상황 정상', 'Normal operations'],
  ['특이 현장 이벤트 없음', 'No unusual field events'],
  ['현재 적용 중인 현장 이벤트가 없습니다.', 'No field event is currently active.'],
  ['난이도', 'Difficulty'],
  ['시나리오', 'Scenario'],
  ['캠페인', 'Campaign'],
  ['피로도', 'Fatigue'],
  ['도전', 'Challenge'],
  ['운영기록', 'Operations log'],
  ['대기 승객 현황', 'Waiting traveler status'],
  ['현재 호출 및 다음 대기 승객', 'Current and next travelers'],
  ['업무압박', 'Workload pressure'],
  ['보통', 'Moderate'],
  ['낮음', 'Low'],
  ['높음', 'High'],
  ['입국허가', 'Admitted'],
  ['재심', 'Secondary'],
  ['입국불허', 'Refused'],
  ['연계사건', 'Linked case'],
  ['캠페인 연계기록', 'Campaign-linked record'],
  ['선택정보', 'Optional information'],
  ['연계기록 열기', 'Open linked record'],
  ['피심사인 및 인터뷰', 'Traveler and interview'],
  ['승객 정보', 'Traveler information'],
  ['현재 피심사인 초상', 'Current traveler portrait'],
  ['실시간 촬영', 'Live capture'],
  ['태도: 협조적', 'Demeanor: cooperative'],
  ['여권번호', 'Passport no.'],
  ['신청 체류', 'Requested stay'],
  ['입국목적', 'Purpose of entry'],
  ['입국편', 'Arrival flight'],
  ['입국기반', 'Entry basis'],
  ['심사단계', 'Inspection stage'],
  ['일반심사', 'Primary inspection'],
  ['상호작용 상태', 'Interaction status'],
  ['판정근거 아님', 'Not a decision factor'],
  ['긴장도', 'Tension'],
  ['협조도', 'Cooperation'],
  ['질문 방식과 대기시간에 따라 대화 반응만 달라집니다.', 'Questioning style and wait time only affect conversational responses.'],
  ['주언어', 'Primary language'],
  ['한국어', 'Korean'],
  ['영어', 'English'],
  ['언어능력은 판정근거가 아닙니다.', 'Language ability is not a decision factor.'],
  ['진술 기록', 'Interview record'],
  ['질문·소명 요청', 'Questions & clarification'],
  ['질문은 사건기록에 남음', 'Questions are recorded in the case file'],
  ['의사소통 확인', 'Communication check'],
  ['질문 언어 또는 통역을 선택하십시오.', 'Select a question language or an interpreter.'],
  ['통역 호출', 'Call interpreter'],
  ['질문 언어', 'Question language'],
  ['사건 작업대', 'Case workspace'],
  ['제출 서류', 'Submitted documents'],
  ['제출자료 · 진술 · 전산정보 교차검증', 'Cross-check documents · statements · system data'],
  ['제출 서류 목록', 'Submitted document list'],
  ['입국요건 검토', 'Entry requirements review'],
  ['국적은 자격 산정요소이지 위험점수가 아님', 'Nationality determines eligibility, not a risk score'],
  ['판단 준비도', 'Decision readiness'],
  ['필요한 확인 절차를 진행하십시오.', 'Complete the required verification steps.'],
  ['절차 진행기록', 'Procedure log'],
  ['0개 완료', '0 completed'],
  ['시스템 조회 및 심사 결정', 'System lookup and inspection decision'],
  ['입국 요건 자료', 'Entry requirements'],
  ['공개 기준 시뮬레이션', 'Public-criteria simulation'],
  ['전산 조회', 'System lookup'],
  ['가상 전산 · 공개/사건 데이터만 사용', 'Simulated system · public/case data only'],
  ['전산 조회 항목', 'System lookup categories'],
  ['출입국기록', 'Immigration history'],
  ['사증·자격', 'Visa/status'],
  ['항공 PNR', 'Flight PNR'],
  ['국내관계', 'Domestic contacts'],
  ['동행인', 'Companions'],
  ['공개정보', 'Public information'],
  ['심사 결정', 'Inspection decision'],
  ['결론 전 필요한 확인을 마치십시오', 'Complete required checks before deciding'],
  ['입국 허가', 'Admit'],
  ['입국재심 인계', 'Refer to secondary'],
  ['입국 불허가', 'Refuse entry'],
  ['출입국사범 절차', 'Immigration offense procedure'],
  ['특수절차', 'Special procedure'],
  ['추가 확인', 'Additional verification'],
  ['사유 선택', 'Select reason'],
  ['감식/조사/체포검토', 'Forensics / investigation / arrest review'],
  ['처분 결과보다 선행절차와 근거가 더 중요합니다. 재심은 제재처분이 아니라 입국심사의 계속입니다.', 'Procedure and legal basis matter more than the outcome. Secondary inspection continues the admission examination; it is not a sanction.'],
  ['입국재심', 'Secondary inspection'],
  ['출입국관리법 제12조 입국심사의 계속', 'Continuation of immigration inspection under Article 12 of the Immigration Act'],
  ['일반 심사대 보기', 'Return to primary desk'],
  ['가상 시스템 · 실제 법무부 내부전산 또는 비공개 심사기준을 재현한 것이 아님', 'Fictional system · does not reproduce Ministry of Justice internal systems or non-public screening criteria'],
  ['감찰 경고', 'Inspection warnings'],
  ['감찰', 'Warnings'],
  ['대한민국 공항 입국심사 · FICTIONAL SIMULATION', 'REPUBLIC OF KOREA AIRPORT IMMIGRATION · FICTIONAL SIMULATION'],
  ['입국심사관 시뮬레이션', 'Immigration Officer Simulation'],
  ['인천공항출입국·외국인청', 'Incheon Airport Immigration Office'],
  ['제2여객터미널 · 입국심사장', 'Terminal 2 · Immigration Hall'],
  ['가상 시뮬레이션', 'Fictional simulation'],
  ['오늘의 근무 배치', "Today's duty roster"],
  ['다른 배치 생성', 'Generate another roster'],
  ['현재 근무 구성', 'Current duty setup'],
  ['표준 · 기본 근무 · 단일 근무 · 처음 근무 · 일반 근무', 'Standard · Normal duty · Single shift · Guided · No challenge'],
  ['기본 설정으로 바로 시작하거나 필요한 항목만 펼쳐 조정할 수 있습니다.', 'Start with the defaults or expand only the options you want to change.'],
  ['시스템', 'System'],
  ['권장값', 'Defaults'],
  ['세부 설정', 'Advanced settings'],
  ['세부 설정 접기', 'Hide advanced settings'],
  ['근무 난이도', 'Duty difficulty'],
  ['법률상 정답은 동일하며 운영압박만 달라집니다.', 'Legal outcomes are unchanged; only operational pressure varies.'],
  ['훈련', 'Training'],
  ['표준', 'Standard'],
  ['실전', 'Realistic'],
  ['권장 모드 · 현장 이벤트 6회 · 기본 업무압박', 'Recommended · 6 field events · standard workload pressure'],
  ['완만한 유입 · 현장 이벤트 4회 · 시스템 지연 영향 축소', 'Slower arrivals · 4 field events · reduced system-delay impact'],
  ['빠른 유입 · 현장 이벤트 8회 · 혼잡·지연 영향 증가', 'Faster arrivals · 8 field events · stronger congestion/delay impact'],
  ['기본 근무', 'Normal duty'],
  ['단일 근무', 'Single shift'],
  ['처음 근무', 'Guided'],
  ['일반 근무', 'No challenge'],
  ['이전 근무 이어하기', 'Resume previous duty'],
  ['자동저장 · 승객 처리 완료 시 체크포인트 생성', 'Autosave · checkpoint created after each traveler'],
  ['금일 입국심사 브리핑', "Today's immigration briefing"],
  ['금일 예상 입국자', 'Expected arrivals today'],
  ['현재 대기', 'Currently waiting'],
  ['재심 대기', 'Awaiting secondary'],
  ['운영 심사대', 'Open inspection booths'],
  ['예정 현장 이벤트', 'Scheduled field events'],
  ['제1근무조 목표 평균', 'Shift 1 target average'],
  ['평가 방식', 'Scoring'],
  ['정확성 + 절차 + 효율 + 비례성', 'Accuracy + procedure + efficiency + proportionality'],
  ['제1근무조 시작', 'Start Shift 1'],
  ['접근성·조작 설정', 'Accessibility & controls'],
  ['화면 표시', 'Display'],
  ['설정은 게임 점수나 법률상 판단에 영향을 주지 않습니다.', 'These settings do not affect scores or legal decisions.'],
  ['글자 크기', 'Text size'],
  ['기본', 'Default'],
  ['크게', 'Large'],
  ['고대비', 'High contrast'],
  ['애니메이션 감소', 'Reduce motion'],
  ['단축키 표시', 'Show shortcuts'],
  ['키보드 단축키', 'Keyboard shortcuts'],
  ['음향·자막', 'Audio & captions'],
  ['사용 중', 'On'],
  ['사용 안 함', 'Off'],
  ['표시 중', 'Shown'],
  ['숨김', 'Hidden'],
  ['업무참고 · 공개 기준', 'Reference · Public criteria'],
  ['도움말 · 심사관 업무 안내', 'Help · Immigration officer guide'],
  ['화면 안내 다시 보기', 'Replay interface tour'],
  ['핵심 심사 원칙', 'Core inspection principles'],
  ['법령·공개기준', 'Laws & public criteria'],
  ['근무기록·리플레이', 'Duty records & replay'],
  ['심사관 프로필', 'Officer profile'],
  ['닫기', 'Close'],
  ['확인', 'Confirm'],
  ['취소', 'Cancel'],
  ['계속', 'Continue'],
  ['다음', 'Next'],
  ['이전', 'Previous'],
  ['저장', 'Save'],
  ['불러오기', 'Import'],
  ['새 근무 배치를 생성했습니다.', 'A new duty roster was generated.'],
  ['이어할 저장된 근무가 없습니다.', 'There is no saved duty to resume.'],
  ['저장된 근무를 복원했습니다.', 'Saved duty restored.'],
  ['근무 시작', 'Duty started'],
  ['제1근무조 입국심사를 시작합니다.', 'Shift 1 immigration inspection is now starting.'],
  ['자동저장 복원', 'Autosave restored'],
  ['승객 호출', 'Traveler call'],
  ['12번 심사대로 오십시오.', 'Please proceed to inspection booth 12.'],
  ['현재 호출 승객', 'Current traveler'],
  ['대기 승객', 'Waiting traveler'],
  ['음향 시스템', 'Audio system'],
  ['효과음과 안내방송 차임을 사용합니다.', 'Sound effects and announcement chimes are enabled.'],
  ['음향을 끕니다. 화면 자막은 계속 표시됩니다.', 'Audio is off. On-screen captions remain available.']
]);

const PATTERNS = [
  [/^심사번호\s+(.+)$/, 'Inspection no. $1'],
  [/^제1근무조 · 기초 심사$/, 'Shift 1 · Basic inspection'],
  [/^제2근무조 · 재심·목적 확인$/, 'Shift 2 · Secondary / purpose review'],
  [/^제3근무조 · 특수사건$/, 'Shift 3 · Special cases'],
  [/^남은\s+(\d+)건$/, '$1 cases remaining'],
  [/^(\d+)개 완료$/, '$1 completed'],
  [/^자동저장 있음 · SESSION (.+) · (\d+)\/36 처리$/, 'Autosave available · SESSION $1 · $2/36 processed'],
  [/^이전 근무 이어하기 · (\d+)\/36$/, 'Resume previous duty · $1/36'],
  [/^SESSION (.+) · (\d+)명 처리 지점부터 근무를 이어갑니다\.$/, 'SESSION $1 · resuming from $2 travelers processed.'],
  [/^연계사건 · (.+)$/, 'Linked case · $1'],
  [/^도전 (.+) · 시나리오 (.+) · 일반승객 (\d+)명 · 동행여행 (\d+)팀 · 추가확인 변형 (\d+)명 · 핵심사건 (\d+)건$/, 'Challenge $1 · Scenario $2 · $3 regular travelers · $4 parties · $5 review variants · $6 key cases'],
  [/^(.+)회$/, '$1 times'],
  [/^(.+)건$/, '$1 cases']
];

function normalizeLocale(value) { return value === 'en' ? 'en' : 'ko'; }
function hasHangul(value) { return /[가-힣]/.test(value || ''); }

export function translateString(value) {
  if (!value || !hasHangul(value)) return value;
  const trimmed = value.trim();
  const exact = EXACT.get(trimmed);
  if (exact) return value.replace(trimmed, exact);
  for (const [pattern, replacement] of PATTERNS) {
    if (pattern.test(trimmed)) return value.replace(trimmed, trimmed.replace(pattern, replacement));
  }
  return value;
}

function ignored(node) {
  const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return !!parent?.closest?.('[data-i18n-control], script, style, code, pre');
}

function applyTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE || ignored(node)) return;
  if (locale === 'ko') {
    const original = originalText.get(node);
    if (original !== undefined && node.data !== original) node.data = original;
    return;
  }
  if (!hasHangul(node.data)) return;
  originalText.set(node, node.data);
  const translated = translateString(node.data);
  if (translated !== node.data) node.data = translated;
}

function attrMapFor(el) {
  let map = originalAttrs.get(el);
  if (!map) { map = new Map(); originalAttrs.set(el, map); }
  return map;
}

function applyAttributes(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE || ignored(el)) return;
  const map = attrMapFor(el);
  for (const attr of ATTRS) {
    const value = el.getAttribute(attr);
    if (locale === 'ko') {
      if (map.has(attr) && value !== map.get(attr)) el.setAttribute(attr, map.get(attr));
      continue;
    }
    if (!value || !hasHangul(value)) continue;
    map.set(attr, value);
    const translated = translateString(value);
    if (translated !== value) el.setAttribute(attr, translated);
  }
}

function walk(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) { applyTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) applyTextNode(node);
    else applyAttributes(node);
    node = walker.nextNode();
  }
}

function languageButton(id, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = id;
  button.className = className;
  button.dataset.i18nControl = 'true';
  button.addEventListener('click', () => setLocale(locale === 'ko' ? 'en' : 'ko'));
  return button;
}

function ensureControls() {
  const topActions = document.querySelector('.top-actions');
  if (topActions && !document.getElementById('uiLanguageBtn')) {
    const button = languageButton('uiLanguageBtn', 'iconbtn');
    const more = topActions.querySelector('.more-wrap');
    topActions.insertBefore(button, more || null);
  }
  const startActions = document.querySelector('#setupBar .setup-actions');
  if (startActions && !document.getElementById('startLanguageBtn')) {
    const button = languageButton('startLanguageBtn', '');
    startActions.insertBefore(button, startActions.firstChild);
  }
}

function syncControls() {
  const english = locale === 'en';
  for (const id of ['uiLanguageBtn', 'startLanguageBtn']) {
    const button = document.getElementById(id);
    if (!button) continue;
    button.textContent = english ? '한국어' : 'English';
    button.setAttribute('aria-label', english ? '한국어 UI로 전환' : 'Switch UI to English');
    button.title = english ? '한국어 UI로 전환' : 'Switch UI to English';
  }
}

export function getLocale() { return locale; }

export function setLocale(value) {
  locale = normalizeLocale(value);
  storeSet(LOCALE_KEY, locale);
  if (typeof document === 'undefined') return locale;
  ensureControls();
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
  document.title = locale === 'en' ? 'INAD: Article 12' : 'INAD: 제12조';
  if (document.body) walk(document.body);
  syncControls();
  document.dispatchEvent(new CustomEvent('inad:localechange', { detail: { locale } }));
  return locale;
}

function mutationHandler(records) {
  for (const record of records) {
    if (record.type === 'characterData') applyTextNode(record.target);
    else if (record.type === 'attributes') applyAttributes(record.target);
    else for (const node of record.addedNodes) walk(node);
  }
  ensureControls();
  syncControls();
}

export function initI18n() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  ensureControls();
  setLocale(locale);
  if (!document.body || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver(mutationHandler);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initI18n, { once: true });
  else initI18n();
}

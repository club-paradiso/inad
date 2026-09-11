// Public-source-inspired airport border-control workstation enhancements.
// This UI layer is fictional and deliberately avoids non-public screening logic.

const STYLE_MARKER = '--border-console-loaded';
const STYLE_PATH = 'styles/border-console.css';

const PANEL_CODES = [
  ['.panel-subject', 'PAX'],
  ['.panel-log', 'INT'],
  ['.panel-questions', 'QRY'],
  ['.panel-docs', 'DOC'],
  ['.panel-matrix', 'REQ'],
  ['.panel-entry', 'BIO'],
  ['.panel-lookup', 'SYS'],
  ['.panel-decision', 'DEC'],
];

const COPY = {
  ko: {
    rail: '1차 심사 작업 상태',
    railSub: 'PRIMARY INSPECTION',
    doc: '여권·서류',
    identity: '신원',
    bio: '생체 확인',
    eligibility: '입국요건',
    system: '전산조회',
    decision: '최종 판단',
    next: 'NEXT ACTION',
    waitPassenger: '승객 호출 또는 여권 제시를 기다리는 중',
    verifyDocument: '문서·여권의 이상 항목을 먼저 확인하십시오.',
    verifyBio: '신원·생체정보 불일치를 재확인하십시오.',
    resolveRequirement: 'CHECK/HOLD 입국요건을 먼저 해소하십시오.',
    continueChecks: '질문·서류·전산정보를 교차확인하십시오.',
    readyDecision: '필요한 확인이 충분합니다. 최종 판단을 검토하십시오.',
    documentReady: '여권/제출자료',
    documentCheck: '문서 확인 필요',
    identityReady: '승객 식별됨',
    identityWait: '승객 대기',
    bioReady: '본인확인',
    bioCheck: '재확인 필요',
    reqReady: '요건 검토',
    reqCheck: '추가 확인',
    reqHold: '중대 항목',
    systemReady: '필요 시 조회',
    systemDone: '조회 기록 있음',
    systemCheck: '주의 결과 있음',
    systemAlert: '경고 결과 있음',
    decisionWait: '확인 진행 중',
    decisionReady: '판단 가능',
  },
  en: {
    rail: 'Primary inspection status',
    railSub: 'PRIMARY INSPECTION',
    doc: 'Passport & docs',
    identity: 'Identity',
    bio: 'Biometric ID',
    eligibility: 'Entry checks',
    system: 'System queries',
    decision: 'Decision',
    next: 'NEXT ACTION',
    waitPassenger: 'Waiting for traveler call or passport presentation',
    verifyDocument: 'Verify the document or passport issue first.',
    verifyBio: 'Recheck the identity or biometric mismatch.',
    resolveRequirement: 'Resolve CHECK/HOLD entry requirements first.',
    continueChecks: 'Cross-check interview, documents and system data.',
    readyDecision: 'Required checks are sufficient. Review the final decision.',
    documentReady: 'Passport/documents',
    documentCheck: 'Document review',
    identityReady: 'Traveler identified',
    identityWait: 'Awaiting traveler',
    bioReady: 'Identity verified',
    bioCheck: 'Recheck required',
    reqReady: 'Requirements reviewed',
    reqCheck: 'Additional check',
    reqHold: 'Material issue',
    systemReady: 'Query as needed',
    systemDone: 'Query recorded',
    systemCheck: 'Review result',
    systemAlert: 'Alert result',
    decisionWait: 'Checks in progress',
    decisionReady: 'Ready to decide',
  },
};

function language() {
  return document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'ko';
}

function c(key) { return COPY[language()][key] || COPY.ko[key] || key; }

function ensureStyles() {
  const loaded = getComputedStyle(document.documentElement).getPropertyValue(STYLE_MARKER).trim();
  if (loaded === '1' || document.querySelector('link[data-border-console]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_PATH;
  link.dataset.borderConsole = 'true';
  document.head.appendChild(link);
}

function enhancePanelHeaders() {
  for (const [selector, code] of PANEL_CODES) {
    const head = document.querySelector(`${selector} .ph`);
    if (!head || head.querySelector('.ops-code')) continue;
    const badge = document.createElement('span');
    badge.className = 'ops-code';
    badge.textContent = code;
    badge.setAttribute('aria-hidden', 'true');
    head.prepend(badge);
  }
}

function step(id, code, label) {
  return `<div class="ops-step" id="${id}" data-tone="idle">
    <span class="ops-step-code" aria-hidden="true">${code}</span>
    <span class="ops-step-copy"><b>${label}</b><span data-detail>—</span></span>
    <span class="ops-step-state" data-state>WAIT</span>
  </div>`;
}

function ensureRail() {
  if (document.getElementById('inspectionRail')) return;
  const anchor = document.getElementById('storyCaseStrip') || document.getElementById('mainContent');
  if (!anchor) return;
  const rail = document.createElement('section');
  rail.className = 'inspection-rail';
  rail.id = 'inspectionRail';
  rail.setAttribute('aria-live', 'polite');
  rail.innerHTML = `<div class="ops-rail-title"><strong data-rail-title></strong><small>${c('railSub')}</small></div>
    ${step('opsDoc', 'DOC', c('doc'))}
    ${step('opsIdentity', 'ID', c('identity'))}
    ${step('opsBio', 'BIO', c('bio'))}
    ${step('opsEligibility', 'REQ', c('eligibility'))}
    ${step('opsSystem', 'SYS', c('system'))}
    ${step('opsDecision', 'DEC', c('decision'))}
    <div class="ops-next" id="opsNext"><small>${c('next')}</small><b data-next-text></b></div>`;
  anchor.before(rail);
  localizeRail();
}

function localizeRail() {
  const rail = document.getElementById('inspectionRail');
  if (!rail) return;
  rail.setAttribute('aria-label', c('rail'));
  rail.querySelector('[data-rail-title]').textContent = c('rail');
  const labels = [
    ['opsDoc', 'doc'], ['opsIdentity', 'identity'], ['opsBio', 'bio'],
    ['opsEligibility', 'eligibility'], ['opsSystem', 'system'], ['opsDecision', 'decision'],
  ];
  for (const [id, key] of labels) {
    const el = document.getElementById(id);
    if (el) el.querySelector('.ops-step-copy b').textContent = c(key);
  }
  const next = document.getElementById('opsNext');
  if (next) next.querySelector('small').textContent = c('next');
}

function text(id) { return (document.getElementById(id)?.textContent || '').trim(); }

function setStep(id, tone, state, detail) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.tone = tone;
  el.querySelector('[data-state]').textContent = state;
  el.querySelector('[data-detail]').textContent = detail;
}

function setNext(tone, message) {
  const el = document.getElementById('opsNext');
  if (!el) return;
  el.className = `ops-next ${tone || ''}`.trim();
  el.querySelector('[data-next-text]').textContent = message;
}

function updateRail() {
  const rail = document.getElementById('inspectionRail');
  if (!rail) return;
  localizeRail();

  const passport = text('pPass');
  const hasTraveler = Boolean(passport && passport !== '—');
  const entryText = text('entry');
  const docAlert = Boolean(document.querySelector('.docitem.alert')) || /(?:오류|만료|INVALID|ERROR|EXPIRED)/i.test(entryText);

  setStep('opsDoc', docAlert ? 'review' : hasTraveler ? 'pass' : 'idle', docAlert ? 'CHECK' : hasTraveler ? 'OK' : 'WAIT', docAlert ? c('documentCheck') : hasTraveler ? c('documentReady') : c('identityWait'));
  setStep('opsIdentity', hasTraveler ? 'pass' : 'idle', hasTraveler ? 'OK' : 'WAIT', hasTraveler ? c('identityReady') : c('identityWait'));

  const bio = document.querySelector('.bio-score');
  const bioBad = Boolean(bio?.classList.contains('bad')) || /(?:불일치|MISMATCH)/i.test(bio?.textContent || '');
  setStep('opsBio', !bio ? 'idle' : bioBad ? 'block' : 'pass', !bio ? 'WAIT' : bioBad ? 'HOLD' : 'MATCH', !bio ? c('identityWait') : bioBad ? c('bioCheck') : c('bioReady'));

  const matrix = document.getElementById('matrix');
  const reqBad = Boolean(matrix?.querySelector('.ev.bad'));
  const reqWarn = Boolean(matrix?.querySelector('.ev.warn'));
  const hasReq = Boolean(matrix?.querySelector('.ev'));
  setStep('opsEligibility', reqBad ? 'block' : reqWarn ? 'review' : hasReq ? 'pass' : 'idle', reqBad ? 'HOLD' : reqWarn ? 'CHECK' : hasReq ? 'PASS' : 'WAIT', reqBad ? c('reqHold') : reqWarn ? c('reqCheck') : hasReq ? c('reqReady') : c('decisionWait'));

  const terminal = document.getElementById('terminal');
  const terminalText = terminal?.textContent || '';
  const initialTerminal = /사건 조회 준비 완료|Case lookup ready/i.test(terminalText);
  const systemCritical = Boolean(terminal?.querySelector('.치명,.경고'));
  const systemWarn = Boolean(terminal?.querySelector('.주의'));
  const hasQuery = Boolean(terminal?.querySelector('.정상,.주의,.경고,.치명')) && !initialTerminal;
  setStep('opsSystem', systemCritical ? 'block' : systemWarn ? 'review' : hasQuery ? 'pass' : 'idle', systemCritical ? 'ALERT' : systemWarn ? 'CHECK' : hasQuery ? 'DONE' : 'READY', systemCritical ? c('systemAlert') : systemWarn ? c('systemCheck') : hasQuery ? c('systemDone') : c('systemReady'));

  const pct = Number.parseInt(text('readyPct'), 10) || 0;
  const decisionBlocked = docAlert || bioBad || reqBad || systemCritical;
  const decisionReady = !decisionBlocked && pct >= 95;
  const decisionTone = decisionBlocked ? 'block' : decisionReady ? 'pass' : pct >= 60 ? 'review' : 'idle';
  setStep('opsDecision', decisionTone, decisionBlocked ? 'HOLD' : decisionReady ? 'READY' : 'WAIT', decisionReady ? c('decisionReady') : c('decisionWait'));

  if (!hasTraveler) setNext('', c('waitPassenger'));
  else if (docAlert) setNext('review', c('verifyDocument'));
  else if (bioBad) setNext('block', c('verifyBio'));
  else if (reqBad || reqWarn || systemCritical || systemWarn) setNext(reqBad || systemCritical ? 'block' : 'review', c('resolveRequirement'));
  else if (decisionReady) setNext('ready', c('readyDecision'));
  else setNext('', c('continueChecks'));
}

function observeWorkspace() {
  const targets = ['pPass', 'entry', 'matrix', 'terminal', 'readyPct', 'stageLabel', 'actionHint', 'doclist'];
  const observer = new MutationObserver(() => requestAnimationFrame(updateRail));
  for (const id of targets) {
    const el = document.getElementById(id);
    if (el) observer.observe(el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'style'] });
  }
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('inad:localechange', () => requestAnimationFrame(updateRail));
}

function init() {
  ensureStyles();
  document.body.classList.add('border-console-v3');
  enhancePanelHeaders();
  ensureRail();
  updateRail();
  observeWorkspace();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

// INAD: 제12조 — application controller.
// Wires engines (state + rules) to the UI layer. Flows that open dialogs/screens live here;
// engines stay DOM-free and UI modules stay logic-free.
import { state, session, resetSessionState } from './state.js';
import { bus, notify } from './services/bus.js';
import { initAudio, ensureAudio, cues } from './services/audio.js';
import { installErrorCollectors, runDiagnostics, diagnosticText } from './services/diagnostics.js';
import { RELEASE } from '../data/legal-baseline.js';
import { newSessionSeed, displayDateKo } from './engines/rng.js';
import { buildSession, current, caseForQueueItem, screeningNo } from './engines/queue-engine.js';
import { getTraveler } from './engines/traveler-engine.js';
import * as caseEngine from './engines/case-engine.js';
import * as legal from './engines/legal-engine.js';
import { generateEventSchedule, applyScenarioStart, takeScheduledBreak, difficultyCfg, eventEffectText } from './engines/operation-engine.js';
import { setInterviewLanguage, requestInterpreter, languageProfileFor } from './engines/language-engine.js';
import { applyChallengeStart } from './engines/achievement-engine.js';
import { loadProgressSave, applyProgressToState, clearProgressSave, loadMeta, makeBundle, validateBundle, applyBundle } from './engines/save-engine.js';
import { loadCampaign } from './engines/campaign-engine.js';
import { syncCampaignState, prepareCampaignForStart, applyCampaignDayCarry, currentCampaignSave, clearCampaign } from './engines/campaign-engine.js';
import { travelPartyFor } from './engines/companion-engine.js';
import { $, $$, byId } from './ui/dom.js';
import { showModal, closeModal, isModalOpen, bindModalChrome } from './ui/modals.js';
import { initNotices, toast, showAnnouncement, announceA11y, showFieldEventToast } from './ui/toast.js';
import { renderTop, renderQueue, renderWorkloadOnly, renderEventBar, renderChallengeHud, renderCampaignHud, renderStoryStrip, renderAudioButton, preloadQueueImages, startClock, showCallout } from './ui/shell.js';
import { renderPassenger, renderBehavior, renderParty } from './ui/passenger-panel.js';
import { renderLog, renderQuestions, chooseQuestionCategory } from './ui/interview-panel.js';
import { renderDocs, focusSelectedDoc } from './ui/document-workbench.js';
import { renderEntry, renderTerminal, renderMatrix } from './ui/system-panel.js';
import { renderActions } from './ui/decision-desk.js';
import { openProcedureScreen, closeProcedureScreen, renderProcedureScreen, isProcedureOpen } from './ui/procedure-screen.js';
import { bindStartScreen, hideStartOverlay, briefingHTML, syncOptionButtons, renderPersistenceStatus } from './ui/start-screen.js';
import { applyPreferences, showSettings, openRules, showHelp, showGuidedGuard, tutorial } from './ui/views/reference.js';
import { showRecordsCenter, showPlayerProfile, showDailyMissions, showChallengeBoard, showChallengeDetail, showOperationsLog, renderDailyStart } from './ui/views/records.js';
import { showCampaignDetail, showCampaignArchive, requestAbandonCampaign, showStoryDossier, showPartyDossier } from './ui/views/campaign.js';
import { showSystemCenter, ensureImportInput, showDiagnostics } from './ui/views/system-center.js';
import { showSourceRegistry } from './ui/decision-basis.js';
import { showDoc, showCaseResult, showShiftTransition, showShiftComplete, showGameOver, showFatalAbuse, showRefusalReasons } from './ui/views/reports.js';
import { uiIcon } from './ui/icons.js';

// ---- rendering --------------------------------------------------------------------------------
const procHandlers = {
  ask(id) { const q = (current().questions || []).find((x) => x.id === id); if (q) onAsk(q); renderProcedureScreen(procHandlers); },
  lookup(k) { caseEngine.lookup(k); renderProcedureScreen(procHandlers); },
  act(a, ctx) { runProcedureAction(a, ctx); }
};
function openProc(mode) { openProcedureScreen(mode, procHandlers); }
function renderAll() {
  if (!current()) return;
  renderTop(); renderQueue(); renderPassenger(); renderLog(); renderQuestions(onAsk); renderDocs({ onSelect: (i) => { showWorkbenchTab('docs'); caseEngine.selectDocument(i); notify.pulse('#docview .doc-stage', 'scan-active', 520); }, onZoom: (d, html) => { cues.paperOpen(); showModal('문서 확대 · ' + d.t, `<div class="doc-modal-wrap">${html}</div>`, { size: 'wide' }); } });
  renderMatrix(); renderEntry(); renderTerminal(); renderActions({ onRefugee: refugeeFlow, onSjp: () => openProc('sjp') }); renderStoryStrip();
}
function onAsk(q, repeat = false) { caseEngine.ask(q, repeat); }
function showWorkbenchTab(name) {
  $$('.wb-tab').forEach((b) => { const on = b.dataset.wb === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  $$('.wb-pane').forEach((p) => { p.hidden = p.dataset.pane !== name; });
}
function bindWorkbenchTabs() { $$('.wb-tab').forEach((b) => { b.onclick = () => showWorkbenchTab(b.dataset.wb); }); }

// ---- session ---------------------------------------------------------------------------------
function regenerate(seed = newSessionSeed()) {
  const keep = { campaignId: state.campaignId || 'none', campaignDay: state.campaignDay || 0, campaignApplied: state.campaignApplied || false, campaignCarryBacklog: state.campaignCarryBacklog || 0, campaignCarryFatigue: state.campaignCarryFatigue || 0 };
  const diff = state.difficulty || 'standard', challenge = state.challengeId || 'none', scenario = state.scenarioId || 'normal';
  buildSession(seed); resetSessionState(); Object.assign(state, keep, { difficulty: diff, challengeId: challenge, scenarioId: scenario });
  state.eventSchedule = generateEventSchedule(seed, diff);
  byId('sessionSeed').textContent = String(seed); renderEventBar(); renderChallengeHud(); renderCampaignHud(); renderDailyStart(showDailyMissions); syncOptionButtons(); renderQueue(); renderTop();
}
function beginCase(skipCall = false) {
  const r = caseEngine.initCase(skipCall); showWorkbenchTab('docs'); renderAll(); preloadQueueImages();
  if (r.callout) { showCallout(); cues.call(); showAnnouncement('승객 호출', `심사번호 ${screeningNo()}, 12번 심사대로 오십시오.`, 'CALL', 1850); notify.pulse('#queueStrip', 'call-pulse', 600); }
  if (r.tutorial) setTimeout(() => tutorial.start(), 1350);
}
function startShiftFlow() {
  const daySeed = prepareCampaignForStart(); if (daySeed && session.seed !== daySeed) regenerate(daySeed); syncOptionButtons();
  const preview = session.queue.slice(0, 9).map((q) => getTraveler(q.travelerId)); const reviewCount = session.normalCases.filter((c) => c.sessionVariant === 'secondary-clear').length;
  showModal('금일 입국심사 브리핑', briefingHTML({ preview, reviewCount, cfg: difficultyCfg(), seed: session.seed, parties: session.parties.length, normalCount: session.normalCases.length, eventCount: state.eventSchedule.length, dateKo: displayDateKo() }));
  byId('briefStart').onclick = () => { clearProgressSave(); state.sessionSaved = false; state.mistakes = []; closeModal(); hideStartOverlay(); state.started = true; applyChallengeStart(); applyScenarioStart(); applyCampaignDayCarry(); ensureAudio(); cues.pa(); showAnnouncement('근무 시작', '제1근무조 입국심사를 시작합니다.', 'SHIFT', 2300); beginCase(); };
}
function resumeFlow() {
  const p = loadProgressSave(); if (!p) { toast('이어할 저장된 근무가 없습니다.'); return; }
  state.difficulty = p.difficulty || 'standard'; state.challengeId = p.challengeId || 'none'; state.scenarioId = p.scenarioId || 'normal'; if (p.campaignId) { state.campaignId = p.campaignId; state.campaignDay = Number(p.campaignDay) || 0; }
  regenerate(p.seed); applyProgressToState(p); if (!state.eventSchedule) state.eventSchedule = generateEventSchedule(p.seed, state.difficulty);
  hideStartOverlay(); renderCampaignHud(); syncOptionButtons();
  if (state.caseIndex >= session.queue.length) { shiftCompleteFlow(); return; }
  beginCase(true); showAnnouncement('자동저장 복원', `SESSION ${session.seed} · ${state.stats.processed}명 처리 지점부터 근무를 이어갑니다.`, 'SAVE', 2500); toast('저장된 근무를 복원했습니다.'); renderAll();
}

// ---- decisions -----------------------------------------------------------------------------
function handleVerdict(r) { if (r.guard) { showGuidedGuard(r.guard); return false; } if (r.gameOver) { gameOverFlow(); return false; } return r.ok; }
function decideClearFlow() { closeProcedureScreen(); const r = caseEngine.decideClear(); if (!handleVerdict(r)) return; showDoc(r.doc.title, r.doc.rows, r.doc.foot, () => finishFlow(r.finish)); }
function openRefusalFlow() { showRefusalReasons(legal.refusalReasons, (code) => { closeModal(); const r = caseEngine.decideRefusal(code); if (!handleVerdict(r)) return; closeProcedureScreen(); showDoc(r.doc.title, r.doc.rows, r.doc.foot, () => { caseEngine.beginRepatriation(); openProc('repatriation'); }); }); }
function sjpFlow() { const r = caseEngine.sjpMenu(); if (!handleVerdict(r)) return; openProc('sjp'); }
function refugeeFlow() { const r = caseEngine.refugeeFlow(); if (r.ok && r.open) openProc(r.open); }
function runProcedureAction(a, ctx = {}) {
  const r = caseEngine.procedureAction(a, ctx);
  if (r.gameOver) { gameOverFlow(); return; }
  if (r.fatal) { showFatalAbuse(() => location.reload()); return; }
  if (r.close) closeProcedureScreen();
  if (r.decide === 'clear') { decideClearFlow(); return; }
  if (r.decide === 'refuse') { openRefusalFlow(); return; }
  if (r.call === 'refugee') { refugeeFlow(); return; }
  if (r.doc) { showDoc(r.doc.title, r.doc.rows, r.doc.foot, () => { if (r.finish) finishFlow(r.finish); else if (r.after) runProcedureAction(r.after); }); return; }
  if (r.finish) { finishFlow(r.finish); return; }
  if (r.open) { openProc(r.open); return; }
  if (r.rerender) renderProcedureScreen(procHandlers);
}
function finishFlow(label) {
  closeProcedureScreen(); const r = caseEngine.finishCase(label);
  showCaseResult(r, () => {
    if (r.last) { shiftCompleteFlow(); return; }
    const adv = caseEngine.advanceQueue();
    if (adv.shiftChange) { cues.pa(); const title = showShiftTransition(adv.nextShift, { onBegin: () => beginCase(), onBreak: () => { takeScheduledBreak(); beginCase(); toast('교대지원 휴식을 마치고 심사를 재개합니다.'); } }); showAnnouncement('근무조 전환', `${title}으로 전환합니다.`, 'SHIFT', 2300); }
    else beginCase();
  });
}
function shiftCompleteFlow() {
  const r = caseEngine.shiftComplete();
  showShiftComplete(r, { onProfile: showPlayerProfile, onRecords: recordsFlow, onRestart: () => { const cr = r.campaignResult; if (cr && (cr.completed || cr.failed)) clearCampaign(); location.reload(); } });
}
function gameOverFlow() { caseEngine.gameOver(); showGameOver(() => location.reload()); }
function recordsFlow() { showRecordsCenter({ onResume: resumeFlow, onProfile: showPlayerProfile, onBoard: showChallengeBoard, onDaily: showDailyMissions }); }
function helpFlow() { showHelp({ onTutorial: () => tutorial.start(true), onRecords: recordsFlow, onProfile: showPlayerProfile, onChallenge: showChallengeDetail }); }

// ---- chrome bindings ---------------------------------------------------------------------------
function bindChrome() {
  byId('helpBtn').onclick = helpFlow; byId('ruleBtn').onclick = openRules; byId('dailyBtn').onclick = showDailyMissions; byId('recordsBtn').onclick = recordsFlow; byId('profileBtn').onclick = showPlayerProfile; byId('settingsBtn').onclick = showSettings; byId('systemBtn').onclick = showSystemCenter; byId('sourcesBtn').onclick = showSourceRegistry;
  byId('audioBtn').onclick = () => { state.audio = !state.audio; if (state.audio) { ensureAudio(); cues.toggle(true); showAnnouncement('음향 시스템', '효과음과 안내방송 차임을 사용합니다.', 'AUDIO', 1600); } else showAnnouncement('음향 시스템', '음향을 끕니다. 화면 자막은 계속 표시됩니다.', 'MUTED', 1600); renderAudioButton(); };
  byId('procClose').onclick = closeProcedureScreen;
  byId('clearBtn').onclick = decideClearFlow; byId('secondaryBtn').onclick = () => { const r = caseEngine.secondary(); if (r.ok) openProc('secondary'); }; byId('refuseBtn').onclick = openRefusalFlow; byId('sjpBtn').onclick = sjpFlow;
  byId('langKo').onclick = () => setInterviewLanguage('ko'); byId('langEn').onclick = () => setInterviewLanguage('en'); byId('langInterp').onclick = () => { if (requestInterpreter() && isProcedureOpen()) renderProcedureScreen(procHandlers); };
  $$('.lookup-tabs button').forEach((b) => { b.onclick = () => caseEngine.lookup(b.dataset.lu); });
  byId('challengeHud').onclick = showChallengeDetail; byId('campaignHud').onclick = showCampaignDetail; byId('eventDetailsBtn').onclick = showOperationsLog; byId('storyDossierBtn').onclick = storyDossierFlow;
  renderParty.onOpen = showPartyDossier;
  [['#clearBtn', '입국 허가'], ['#secondaryBtn', '입국재심 인계'], ['#refuseBtn', '입국 불허가 사유 선택'], ['#sjpBtn', '출입국사범 절차'], ['#audioBtn', '음향 켜기 또는 끄기'], ['#helpBtn', '도움말 열기'], ['#recordsBtn', '근무기록 열기'], ['#dailyBtn', '오늘의 미션 열기'], ['#profileBtn', '심사관 프로필 열기'], ['#settingsBtn', '접근성 및 조작 설정 열기']].forEach(([sel, label]) => { const el = $(sel); if (el) el.setAttribute('aria-label', label); });
  // decision + lookup icons
  [['#clearBtn', 'clear'], ['#secondaryBtn', 'secondary'], ['#refuseBtn', 'refuse'], ['#sjpBtn', 'sjp']].forEach(([s, n]) => { const e = $(s)?.querySelector('strong'); if (e) e.insertAdjacentHTML('afterbegin', uiIcon(n)); });
  const lm = { history: 'history', visa: 'visa', pnr: 'plane', contact: 'contact', party: 'party', public: 'public' }; $$('.lookup-tabs button').forEach((b) => b.insertAdjacentHTML('afterbegin', uiIcon(lm[b.dataset.lu] || 'public')));
  // more menu
  const more = byId('moreBtn'), menu = byId('moreMenu'); const setOpen = (o) => { menu.hidden = !o; more.setAttribute('aria-expanded', String(o)); if (o) menu.querySelector('button')?.focus(); };
  more.onclick = (e) => { e.stopPropagation(); setOpen(menu.hidden); }; menu.addEventListener('click', () => setOpen(false)); document.addEventListener('click', (e) => { if (!more.parentElement.contains(e.target)) setOpen(false); }); menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); more.focus(); } });
  byId('footerTag').textContent = `법령 기준 ${RELEASE.legalBaseline} · DATA v${RELEASE.dataVersion}`; byId('legalBaselineTag').textContent = `${RELEASE.legalBaseline} 공개 기준 시뮬레이션`;
}
function storyDossierFlow() { showStoryDossier((id) => { const r = caseEngine.storyAction(id); if (r.ok) { renderStoryStrip(); storyDossierFlow(); } }); }

// ---- keyboard -----------------------------------------------------------------------------
function shortcutBlocked(e) { const t = e.target; return !!(t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)); }
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (tutorial.isOpen()) tutorial.end(true); else if (isModalOpen()) closeModal(); else closeProcedureScreen(); return; }
    if (shortcutBlocked(e)) return;
    const plain = !e.altKey && !e.ctrlKey && !e.metaKey;
    if (e.key === 'F1' || e.key === '?') { e.preventDefault(); helpFlow(); return; }
    const k = e.key.toLowerCase();
    if (plain && k === 's') { e.preventDefault(); showSettings(); return; }
    if (plain && k === 'l') { e.preventDefault(); recordsFlow(); return; }
    if (plain && k === 'u') { e.preventDefault(); showPlayerProfile(); return; }
    if (plain && k === 'b') { e.preventDefault(); showDailyMissions(); return; }
    if (plain && k === 'm') { e.preventDefault(); byId('audioBtn').click(); return; }
    if (isModalOpen() || tutorial.isOpen() || !byId('startOverlay').classList.contains('hide')) return;
    if (e.altKey && !e.ctrlKey && !e.metaKey) { const map = { a: '#clearBtn', r: '#secondaryBtn', x: '#refuseBtn', j: '#sjpBtn' }; if (map[k]) { e.preventDefault(); const b = $(map[k]); if (b && !b.disabled) { b.focus(); b.click(); } return; } }
    if (!plain) return;
    if (/^Digit[1-6]$/.test(e.code)) { e.preventDefault(); chooseQuestionCategory(Number(e.code.slice(-1)) - 1, announceA11y); return; }
    const direct = { k: '#langKo', e: '#langEn', i: '#langInterp', h: '[data-lu="history"]', v: '[data-lu="visa"]', p: '[data-lu="pnr"]', c: '[data-lu="contact"]', g: '[data-lu="party"]', o: '[data-lu="public"]' };
    if (direct[k]) { const b = $(direct[k]); if (b && !b.disabled) { e.preventDefault(); b.focus(); b.click(); } return; }
    if (e.key === '[') { e.preventDefault(); showWorkbenchTab('docs'); caseEngine.cycleDocument(-1); focusSelectedDoc(); return; }
    if (e.key === ']') { e.preventDefault(); showWorkbenchTab('docs'); caseEngine.cycleDocument(1); focusSelectedDoc(); return; }
  });
}

// ---- bus subscriptions ---------------------------------------------------------------------
function subscribe() {
  bus.on('changed', renderAll);
  bus.on('log', () => { if (state.logs.length && byId('log')) renderLog(); });
  bus.on('ops', () => { renderWorkloadOnly(); });
  bus.on('behavior', renderBehavior);
  bus.on('fieldEvent', (e) => { showFieldEventToast(e, eventEffectText(e)); cues.fieldEvent(e); notify.pulse('#eventBar', 'event-sonic', 520); });
  bus.on('procedure:close', closeProcedureScreen);
  bus.on('campaign', () => { renderCampaignHud(); });
}

// ---- test / debug hook (read-mostly; mirrors the v6.1 globals used by the E2E suite) --------------
function installHooks() {
  window.INADSystem = { release: RELEASE, makeBundle, validateBundle, applyBundle, runDiagnostics, diagnosticText, showSystemCenter, showDiagnostics, showSourceRegistry };
  window.INADTest = {
    seed: () => session.seed,
    regenerate: (s) => regenerate(s),
    queue: () => session.queue.map((q, i) => { const c = caseForQueueItem(q); return { index: i, shift: q.shift, travelerId: q.travelerId, caseId: q.caseId, normalId: q.normalId, id: c.id, special: c.special || null, resolution: c.resolution, required: c.required || [], sessionVariant: c.sessionVariant || null, basis: c.basis }; }),
    state: () => ({ caseIndex: state.caseIndex, stage: state.stage, strikes: state.strikes, score: state.score, started: state.started, ended: state.ended, stats: { ...state.stats }, performed: state.performed.slice(), asked: [...state.asked], looked: [...state.looked], refugeeStep: state.refugeeStep, repatriationStep: state.repatriationStep, forensic: state.forensic, investigation: state.investigation, arrestReview: state.arrestReview, reports: state.reports.map((r) => ({ label: r.label, caseId: r.caseId, procedure: r.procedure, interpreter: r.interpreter, actions: r.actions })), mistakes: state.mistakes.map((m) => m.msg), language: state.language ? { mode: state.language.mode, korean: state.language.korean, english: state.language.english, interpreterActive: state.language.interpreterActive, interpreterUsed: state.language.interpreterUsed } : null, behavior: state.behavior ? { stress: state.behavior.stress, rapport: state.behavior.rapport } : null, campaignId: state.campaignId, campaignDay: state.campaignDay, difficulty: state.difficulty, scenarioId: state.scenarioId }),
    current: () => { const c = current(); return { id: c.id, travelerId: c.travelerId, special: c.special || null, required: c.required || [], resolution: c.resolution, questions: c.questions.map((q) => ({ id: q.id, cat: q.cat, q: q.q, requires: q.requires || [] })), docs: c.docs.map((d) => d.t) }; },
    jump: (i) => { state.caseIndex = i; beginCase(true); },
    languageFor: (i) => { const l = languageProfileFor(caseForQueueItem(session.queue[i])); return { mode: l.mode, korean: l.korean, english: l.english }; },
    partyFor: (i) => { const p = session.partyByTraveler.get(session.queue[i].travelerId); return p ? { id: p.id, mode: p.mode, members: p.members.map((m) => m.queueIndex) } : null; },
    campaignSave: () => loadCampaign(), progressSave: () => loadProgressSave(), meta: () => loadMeta(), version: () => RELEASE.version
  };
}

// ---- boot ----------------------------------------------------------------------------------------
function boot() {
  installErrorCollectors(); initNotices(); initAudio(); bindModalChrome(); tutorial.bind(); ensureImportInput(); applyPreferences();
  byId('brandTag').textContent = `v${RELEASE.version}`; byId('startReleaseChip').textContent = `v${RELEASE.version} · ${RELEASE.label}`;
  buildSession(newSessionSeed()); state.eventSchedule = generateEventSchedule(session.seed, state.difficulty);
  subscribe(); bindChrome(); bindWorkbenchTabs(); bindKeyboard(); installHooks();
  const daySeed = syncCampaignState();
  bindStartScreen({ onStart: startShiftFlow, onResume: resumeFlow, onRecords: recordsFlow, onProfile: showPlayerProfile, onSettings: showSettings, onSystem: showSystemCenter, onReroll: () => { regenerate(); toast('새 근무 배치를 생성했습니다.'); }, onCampaignArchive: showCampaignArchive, onCampaignAbandon: () => requestAbandonCampaign(syncOptionButtons) });
  if (daySeed && session.seed !== daySeed) regenerate(daySeed);
  byId('sessionSeed').textContent = String(session.seed); renderQueue(); renderTop(); renderEventBar(); renderDailyStart(showDailyMissions); renderPersistenceStatus(); syncOptionButtons(); startClock();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

// INAD: 제12조 — application controller.
// Wires engines (state + rules) to the UI layer. Flows that open dialogs/screens live here;
// engines stay DOM-free and UI modules stay logic-free.
// The boot watchdog is the first module evaluated so a failure anywhere below still surfaces.
import './services/boot-watchdog.js';
import { state, session, resetSessionState, preferences } from './state.js';
import { bus, notify } from './services/bus.js';
import { initAudio, ensureAudio, cues } from './services/audio.js';
import { installErrorCollectors, runDiagnostics, diagnosticText } from './services/diagnostics.js';
import { scheduleUiEnhancements } from './services/ui-enhancements.js';
import { RELEASE } from '../data/legal-baseline.js';
import { newSessionSeed, displayDateKo } from './engines/rng.js';
import { buildSession, current, caseForQueueItem, screeningNo } from './engines/queue-engine.js';
import { getTraveler } from './engines/traveler-engine.js';
import * as caseEngine from './engines/case-engine.js';
import * as legal from './engines/legal-engine.js';
import { generateEventSchedule, applyScenarioStart, takeScheduledBreak, difficultyCfg, eventEffectText, appliedLiveLoad } from './engines/operation-engine.js';
import { setInterviewLanguage, requestInterpreter, languageProfileFor } from './engines/language-engine.js';
import { applyChallengeStart } from './engines/achievement-engine.js';
import { loadProgressSave, applyProgressToState, clearProgressSave, loadMeta, makeBundle, validateBundle, applyBundle, saveAudioPreference } from './engines/save-engine.js';
import { loadCampaign } from './engines/campaign-engine.js';
import { syncCampaignState, prepareCampaignForStart, applyCampaignDayCarry, currentCampaignSave, clearCampaign } from './engines/campaign-engine.js';
import { travelPartyFor } from './engines/companion-engine.js';
import { $, $$, byId, focusKey, restoreFocus } from './ui/dom.js';
import { showModal, closeModal, requestCloseModal, isModalOpen, bindModalChrome } from './ui/modals.js';
import { initNotices, toast, showAnnouncement, announceA11y, showFieldEventToast } from './ui/toast.js';
import { renderTop, renderQueue, renderWorkloadOnly, renderEventBar, renderChallengeHud, renderCampaignHud, renderStoryStrip, renderAudioButton, preloadQueueImages, startClock, showCallout } from './ui/shell.js';
import { renderPassenger, renderBehavior, renderParty } from './ui/passenger-panel.js';
import { renderLog, renderQuestions, chooseQuestionCategory, tabKey } from './ui/interview-panel.js';
import { renderDocs, focusSelectedDoc } from './ui/document-workbench.js';
import { renderEntry, renderTerminal, renderMatrix } from './ui/system-panel.js';
import { renderActions, guardDecision, disarm } from './ui/decision-desk.js';
import { bindTaskNav, showTask, revealZone } from './ui/task-nav.js';
import { openProcedureScreen, closeProcedureScreen, renderProcedureScreen, isProcedureOpen } from './ui/procedure-screen.js';
import { bindStartScreen, hideStartOverlay, briefingHTML, syncOptionButtons, renderPersistenceStatus } from './ui/start-screen.js';
import { applyPreferences, showSettings, openRules, showHelp, showGuidedGuard, tutorial } from './ui/views/reference.js';
import { showRecordsCenter, showPlayerProfile, showDailyMissions, showChallengeBoard, showChallengeDetail, showOperationsLog, renderDailyStart } from './ui/views/records.js';
import { showCampaignDetail, showCampaignArchive, requestAbandonCampaign, showStoryDossier, showPartyDossier } from './ui/views/campaign.js';
import { showSystemCenter, ensureImportInput, showDiagnostics } from './ui/views/system-center.js';
import { showSourceRegistry } from './ui/decision-basis.js';
import { showDoc, showCaseResult, showShiftTransition, showShiftComplete, showGameOver, showFatalAbuse, showRefusalReasons } from './ui/views/reports.js';

// ---- rendering --------------------------------------------------------------------------------
const procHandlers = {
  ask(id) { const q = (current().questions || []).find((x) => x.id === id); if (q) onAsk(q); renderProcedureScreen(procHandlers); },
  lookup(k) { caseEngine.lookup(k); renderProcedureScreen(procHandlers); },
  act(a, ctx) { runProcedureAction(a, ctx); }
};
function openProc(mode) { openProcedureScreen(mode, procHandlers); }
function renderAll() {
  if (!current()) return;
  const focus = focusKey();
  renderTop(); renderQueue(); renderPassenger(); renderLog(); renderQuestions(onAsk); renderDocs({ onSelect: (i) => { showWorkbenchTab('docs'); caseEngine.selectDocument(i); notify.pulse('#docview .doc-stage', 'scan-active', 520); }, onZoom: (d, html) => { cues.paperOpen(); showModal('문서 확대 · ' + d.t, `<div class="doc-modal-wrap">${html}</div>`, { size: 'wide' }); } });
  renderMatrix(); renderEntry(); renderTerminal(); renderActions({ onRefugee: refugeeFlow, onSjp: () => openProc('sjp'), onReopen: (mode) => openProc(mode) }); renderStoryStrip();
  restoreFocus(focus);
}
function onAsk(q, repeat = false) { caseEngine.ask(q, repeat); }
function showWorkbenchTab(name) {
  $$('.wb-tab').forEach((b) => { const on = b.dataset.wb === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  $$('.wb-pane').forEach((p) => { p.hidden = p.dataset.pane !== name; });
}
function bindWorkbenchTabs() {
  $$('.wb-tab').forEach((b) => { b.onclick = () => showWorkbenchTab(b.dataset.wb); });
  $('.wb-tabs').addEventListener('keydown', (e) => { const tabs = $$('.wb-tab'), i = tabs.indexOf(document.activeElement), next = tabKey(e.key, i, tabs.length); if (i < 0 || next === null) return; e.preventDefault(); showWorkbenchTab(tabs[next].dataset.wb); tabs[next].focus(); });
  showWorkbenchTab('docs');
}

// ---- session ---------------------------------------------------------------------------------
function regenerate(seed = newSessionSeed()) {
  const keep = { campaignId: state.campaignId || 'none', campaignDay: state.campaignDay || 0, campaignApplied: state.campaignApplied || false, campaignCarryBacklog: state.campaignCarryBacklog || 0, campaignCarryFatigue: state.campaignCarryFatigue || 0 };
  const diff = state.difficulty || 'standard', challenge = state.challengeId || 'none', scenario = state.scenarioId || 'normal';
  buildSession(seed); resetSessionState(); Object.assign(state, keep, { difficulty: diff, challengeId: challenge, scenarioId: scenario });
  state.eventSchedule = generateEventSchedule(seed, diff);
  byId('sessionSeed').textContent = String(seed); renderEventBar(); renderChallengeHud(); renderCampaignHud(); renderDailyStart(showDailyMissions); syncOptionButtons(); renderQueue(); renderTop();
}
function beginCase(skipCall = false) {
  const r = caseEngine.initCase(skipCall); showWorkbenchTab('docs'); disarm(); showTask('passenger'); renderAll(); preloadQueueImages();
  // Every case starts after a dialog (briefing, case result, shift change): put focus on the new passenger, not on
  // <body> and never back on a decision button that would act on a traveler the examiner has not seen yet.
  const head = byId('caseName'); if (!isModalOpen() && head?.getClientRects().length) head.focus({ preventScroll: true });
  if (r.callout) { showCallout(); cues.call(); showAnnouncement('승객 호출', `심사번호 ${screeningNo()}, 12번 심사대로 오십시오.`, 'CALL', 1850); notify.pulse('#queueStrip', 'call-pulse', 600); }
  if (r.tutorial) setTimeout(() => { if (!isModalOpen() && !isProcedureOpen() && !tutorial.isOpen()) tutorial.start(); }, 1350);
}
function startShiftFlow() {
  const daySeed = prepareCampaignForStart(); if (daySeed && session.seed !== daySeed) regenerate(daySeed); syncOptionButtons();
  const preview = session.queue.slice(0, 9).map((q) => getTraveler(q.travelerId)); const reviewCount = session.normalCases.filter((c) => c.sessionVariant === 'secondary-clear').length;
  const saved = loadProgressSave();
  const replaceNote = saved ? `<p class="inline-note warn" id="briefReplaceNote">저장된 근무(SESSION ${saved.seed} · ${Math.min(saved.nextIndex, 36)}/36)는 새 근무를 시작하면 삭제됩니다. 이어서 하려면 이 창을 닫고 ‘이전 근무 이어하기’를 선택하십시오.</p>` : '';
  showModal('금일 입국심사 브리핑', briefingHTML({ preview, reviewCount, cfg: difficultyCfg(), seed: session.seed, parties: session.parties.length, normalCount: session.normalCases.length, eventCount: state.eventSchedule.length, dateKo: displayDateKo() }) + replaceNote);
  byId('briefStart').onclick = () => { clearProgressSave(); state.sessionSaved = false; state.mistakes = []; closeModal(); hideStartOverlay(); state.started = true; applyChallengeStart(); applyScenarioStart(); applyCampaignDayCarry(); ensureAudio(); cues.pa(); showAnnouncement('근무 시작', '제1근무조 입국심사를 시작합니다.', 'SHIFT', 2300); beginCase(); };
}
function resumeFlow() {
  // Resuming replaces the running shift with the last checkpoint (and would erase in-case penalties): start screen only.
  if (state.started) { toast('근무 중에는 저장된 근무를 불러올 수 없습니다.'); return; }
  const p = loadProgressSave(); if (!p) { toast('이어할 저장된 근무가 없습니다.'); return; }
  if (p.campaignId && p.campaignId !== 'none' && currentCampaignSave()?.id !== p.campaignId) p.campaignId = 'none';
  state.difficulty = p.difficulty || 'standard'; state.challengeId = p.challengeId || 'none'; state.scenarioId = p.scenarioId || 'normal'; if (p.campaignId) { state.campaignId = p.campaignId; state.campaignDay = Number(p.campaignDay) || 0; }
  regenerate(p.seed); applyProgressToState(p); if (!state.eventSchedule) state.eventSchedule = generateEventSchedule(p.seed, state.difficulty);
  hideStartOverlay(); renderCampaignHud(); syncOptionButtons();
  if (state.caseIndex >= session.queue.length) { shiftCompleteFlow(); return; }
  // The checkpoint is written before the shift-transition choice (break or not); offer it again.
  const prevItem = session.queue[state.caseIndex - 1], nextItem = session.queue[state.caseIndex];
  if (prevItem && nextItem && prevItem.shift !== nextItem.shift) { showShiftTransition(nextItem.shift, { onBegin: () => beginCase(true), onBreak: () => { takeScheduledBreak(); beginCase(true); toast('교대지원 휴식을 마치고 심사를 재개합니다.'); } }); return; }
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
  if (r.fatal) { closeProcedureScreen(); caseEngine.gameOver(); showFatalAbuse(() => location.reload()); return; }
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
function gameOverFlow() { caseEngine.gameOver(); showGameOver(() => location.reload(), caseEngine.penaltyPolicy().strikeLimit); }
function recordsFlow() { showRecordsCenter({ onResume: state.started ? null : resumeFlow, onProfile: showPlayerProfile, onBoard: showChallengeBoard, onDaily: showDailyMissions }); }
function helpFlow() { showHelp({ onTutorial: () => { if (tutorial.start(true, byId('helpBtn')) === false) toast('근무를 시작한 뒤 화면 안내를 다시 볼 수 있습니다.'); }, onRecords: recordsFlow, onProfile: showPlayerProfile, onChallenge: showChallengeDetail }); }

// ---- chrome bindings ---------------------------------------------------------------------------
function bindChrome() {
  byId('helpBtn').onclick = helpFlow; byId('ruleBtn').onclick = openRules; byId('dailyBtn').onclick = showDailyMissions; byId('recordsBtn').onclick = recordsFlow; byId('profileBtn').onclick = showPlayerProfile; byId('settingsBtn').onclick = showSettings; byId('systemBtn').onclick = showSystemCenter; byId('sourcesBtn').onclick = showSourceRegistry;
  byId('audioBtn').onclick = () => { state.audio = !state.audio; saveAudioPreference(state.audio); if (state.audio) { ensureAudio(); cues.toggle(true); showAnnouncement('음향 시스템', '효과음과 안내방송 차임을 사용합니다.', 'AUDIO', 1600); } else showAnnouncement('음향 시스템', '음향을 끕니다. 화면 자막은 계속 표시됩니다.', 'MUTED', 1600); renderAudioButton(); };
  byId('procClose').onclick = closeProcedureScreen;
  // Touch devices arm a decision on the first tap and execute on the second (decision-desk.js); pointer/keyboard flows are direct.
  byId('clearBtn').onclick = guardDecision(decideClearFlow); byId('secondaryBtn').onclick = guardDecision(() => { const r = caseEngine.secondary(); if (r.ok) openProc('secondary'); }); byId('refuseBtn').onclick = guardDecision(openRefusalFlow); byId('sjpBtn').onclick = guardDecision(sjpFlow);
  byId('langKo').onclick = () => setInterviewLanguage('ko'); byId('langEn').onclick = () => setInterviewLanguage('en'); byId('langInterp').onclick = () => { if (requestInterpreter() && isProcedureOpen()) renderProcedureScreen(procHandlers); };
  $$('.lookup-tabs button').forEach((b) => { b.onclick = () => { caseEngine.lookup(b.dataset.lu); revealZone(byId('terminal')); }; });
  byId('challengeHud').onclick = showChallengeDetail; byId('campaignHud').onclick = showCampaignDetail; byId('eventDetailsBtn').onclick = showOperationsLog; byId('storyDossierBtn').onclick = storyDossierFlow;
  renderParty.onOpen = showPartyDossier;
  // more menu
  const more = byId('moreBtn'), menu = byId('moreMenu'); const setOpen = (o) => { menu.hidden = !o; more.setAttribute('aria-expanded', String(o)); if (o) menu.querySelector('button')?.focus(); };
  more.onclick = (e) => { e.stopPropagation(); setOpen(menu.hidden); }; menu.addEventListener('click', () => setOpen(false)); document.addEventListener('click', (e) => { if (!more.parentElement.contains(e.target)) setOpen(false); }); menu.addEventListener('keydown', (e) => {
    // role="menu" keyboard model: arrows/Home/End move between items, Escape returns to the button, Tab leaves and closes.
    const items = $$('#moreMenu button').filter((b) => b.offsetParent !== null), i = items.indexOf(document.activeElement), n = items.length;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); more.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n]?.focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); items[e.key === 'Home' ? 0 : n - 1]?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  });
  more.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' && menu.hidden) { e.preventDefault(); setOpen(true); } });
  byId('footerTag').textContent = `법령 기준 ${RELEASE.legalBaseline} · DATA v${RELEASE.dataVersion}`; byId('legalBaselineTag').textContent = `${RELEASE.legalBaseline} 공개 기준 시뮬레이션`;
}
function storyDossierFlow() { showStoryDossier((id) => { const r = caseEngine.storyAction(id); if (r.ok) { renderStoryStrip(); storyDossierFlow(); } }); }

// ---- keyboard -----------------------------------------------------------------------------
function shortcutBlocked(e) { const t = e.target; return !!(t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)); }
// Shortcuts are matched on the physical key (e.code), so they keep working with a Korean IME active
// (e.key === 'Process' / 'ㅗ') and with macOS Option (Option+R → '®').
const KEY = (e) => (/^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : String(e.key || '').toLowerCase());
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Menus and sheets consume their own Escape (preventDefault) so it never also closes the procedure screen.
    if (e.key === 'Escape') { if (e.defaultPrevented) return; if (tutorial.isOpen()) tutorial.end(true); else if (isModalOpen()) requestCloseModal(); else closeProcedureScreen(); return; }
    if (shortcutBlocked(e) || e.isComposing) return;
    // A dialog-opening shortcut must never replace an open dialog: that would drop a refusal-reason choice
    // or a decision notice whose action carries the case forward. Nothing else acts behind a dialog either.
    if (isModalOpen() || tutorial.isOpen()) return;
    // Unmodified single-character shortcuts follow the 단축키 사용 setting (WCAG 2.1.4); F1 and Alt combinations always work.
    const plain = !e.altKey && !e.ctrlKey && !e.metaKey && preferences.shortcuts;
    const k = KEY(e);
    if (e.key === 'F1') { e.preventDefault(); helpFlow(); return; }
    if (plain && k === 'm') { e.preventDefault(); byId('audioBtn').click(); return; }
    if (plain && e.key === '?') { e.preventDefault(); helpFlow(); return; }
    if (plain && k === 's') { e.preventDefault(); showSettings(); return; }
    if (plain && k === 'l') { e.preventDefault(); recordsFlow(); return; }
    if (plain && k === 'u') { e.preventDefault(); showPlayerProfile(); return; }
    if (plain && k === 'b') { e.preventDefault(); showDailyMissions(); return; }
    if (!byId('startOverlay').classList.contains('hide') || !current()) return;
    // Workspace shortcuts would act on controls hidden behind the procedure screen.
    if (isProcedureOpen()) return;
    if (e.altKey && !e.ctrlKey && !e.metaKey) { const map = { a: '#clearBtn', r: '#secondaryBtn', x: '#refuseBtn', j: '#sjpBtn' }; if (map[k]) { e.preventDefault(); const b = $(map[k]); if (b && !b.disabled) { b.focus(); b.click(); } return; } }
    if (!plain) return;
    if (/^Digit[1-6]$/.test(e.code)) { e.preventDefault(); showTask('interview'); chooseQuestionCategory(Number(e.code.slice(-1)) - 1, announceA11y); return; }
    const direct = { k: '#langKo', e: '#langEn', i: '#langInterp', h: '[data-lu="history"]', v: '[data-lu="visa"]', p: '[data-lu="pnr"]', c: '[data-lu="contact"]', g: '[data-lu="party"]', o: '[data-lu="public"]' };
    if (direct[k]) { const b = $(direct[k]); if (b && !b.disabled) { e.preventDefault(); b.focus(); b.click(); } return; }
    if (e.key === '[' || e.code === 'BracketLeft') { e.preventDefault(); showWorkbenchTab('docs'); showTask('evidence'); caseEngine.cycleDocument(-1); focusSelectedDoc(); return; }
    if (e.key === ']' || e.code === 'BracketRight') { e.preventDefault(); showWorkbenchTab('docs'); showTask('evidence'); caseEngine.cycleDocument(1); focusSelectedDoc(); return; }
  });
}

// ---- bus subscriptions ---------------------------------------------------------------------
function subscribe() {
  bus.on('changed', () => { renderAll(); if (isProcedureOpen()) renderProcedureScreen(procHandlers); });
  bus.on('log', () => { if (state.logs.length && byId('log')) renderLog(); });
  bus.on('ops', () => { renderWorkloadOnly(); });
  bus.on('behavior', renderBehavior);
  bus.on('fieldEvent', (e) => { showFieldEventToast(e, eventEffectText(e)); cues.fieldEvent(e); notify.pulse('#eventBar', 'event-sonic', 520); });
  bus.on('procedure:close', closeProcedureScreen);
  bus.on('campaign', () => { renderCampaignHud(); });
  // Storage failures are surfaced once per kind instead of failing silently (quota, private mode, future save).
  const warned = new Set();
  bus.on('persistence', (e) => {
    if (!e || e.ok !== false || warned.has(e.reason)) return; warned.add(e.reason);
    toast(e.reason === 'future-save' ? '더 새로운 버전에서 만든 저장 데이터가 있어 이 버전은 저장하지 않습니다.' : e.reason === 'career-write-failed' ? '근무기록을 저장하지 못해 체크포인트를 보존했습니다. 시스템·데이터에서 내보내기를 권장합니다.' : '브라우저 저장소에 쓸 수 없어 진행이 저장되지 않았습니다.');
  });
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
    campaignSave: () => loadCampaign(), progressSave: () => loadProgressSave(), meta: () => loadMeta(), version: () => RELEASE.version,
    liveOps: () => ({ ...appliedLiveLoad() })
  };
}

// ---- boot ----------------------------------------------------------------------------------------
function boot() {
  installErrorCollectors(); initNotices(); initAudio(); bindModalChrome(); tutorial.bind(); ensureImportInput(); applyPreferences();
  byId('brandTag').textContent = `v${RELEASE.version}`; byId('startReleaseChip').textContent = `v${RELEASE.version} · ${RELEASE.label}`;
  buildSession(newSessionSeed()); state.eventSchedule = generateEventSchedule(session.seed, state.difficulty);
  subscribe(); bindChrome(); bindWorkbenchTabs(); bindTaskNav(); bindKeyboard(); installHooks();
  const daySeed = syncCampaignState();
  bindStartScreen({ onStart: startShiftFlow, onResume: resumeFlow, onRecords: recordsFlow, onProfile: showPlayerProfile, onSettings: showSettings, onSystem: showSystemCenter, onReroll: () => { regenerate(); toast('새 근무 배치를 생성했습니다.'); }, onCampaignArchive: showCampaignArchive, onCampaignAbandon: () => requestAbandonCampaign(syncOptionButtons) });
  if (daySeed && session.seed !== daySeed) regenerate(daySeed);
  byId('sessionSeed').textContent = String(session.seed); renderQueue(); renderTop(); renderEventBar(); renderDailyStart(showDailyMissions); renderPersistenceStatus(); syncOptionButtons(); startClock();
  scheduleUiEnhancements();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

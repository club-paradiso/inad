// Case orchestration: applies legal-engine verdicts to state, records the interview and produces
// reports. It emits UI intents (via the bus) and returns plain result objects; dialogs, documents
// and screens are opened by the UI controllers in src/js/ui/.
import { session, state } from '../state.js';
import { current, currentQueueItem, screeningNo } from './queue-engine.js';
import { getTraveler } from './traveler-engine.js';
import * as legal from './legal-engine.js';
import { clampScore, overallScore, procedureAverage, operationalScore, gradeFor } from './score-engine.js';
import { spendWork, maybeStartFieldEvent, advanceFieldEventAfterCase, simulatedBacklog, pressureInfo, difficultyCfg, scenarioCfg } from './operation-engine.js';
import { makeBehavior, behaviorAdjust, behaviorOnQuestion, behaviorResponse } from './behavior-engine.js';
import { languageProfileFor, handleLanguageBarrier, languageModeLabel, requestInterpreter } from './language-engine.js';
import { clueStats, discoverTriggeredClues, questionUnlocked } from './clue-engine.js';
import { travelPartyFor, archivePartyStatement, partyLookupResult } from './companion-engine.js';
import { addLog } from './log.js';
import { saveProgressSnapshot, saveBestGrade, loadMeta, saveMeta, clearProgressSave } from './save-engine.js';
import { applySessionCareer, applyDailyMissions, evaluateAchievements, achievementById, challengeEvaluation, challengeCfg, gradeRank } from './achievement-engine.js';
import { advanceCampaign, finalizeStoryForCase, storyIsAnchor, storyChapterDef, recordStoryAction, campaignArc } from './campaign-engine.js';
import { bus, notify } from '../services/bus.js';

export const LOOKUP_NAMES = { history: '출입국기록', visa: '사증·입국자격', pnr: '항공 PNR', contact: '국내관계', party: '동행인 교차검증', public: '공개정보', forensic: '문서감식' };
export function lookupName(k) { return LOOKUP_NAMES[k] || k; }
export function actionMark(x) { if (!state.performed.includes(x)) state.performed.push(x); }
export function missingReq(c = current()) { return legal.missingRequirements(c, state.performed); }
export function expectedMinimumWork(c = current()) { return legal.expectedMinimumWork(c, languageProfileFor(c)); }
export function caseBenchmark(c = current()) { return legal.caseBenchmark(c, languageProfileFor(c)); }
export function caseMinimum(c = current()) { return legal.caseMinimum(c, languageProfileFor(c)); }

export function initCase(skipCall = false) {
  const c = current();
  Object.assign(state, { stage: 'PRIMARY', asked: new Set(), questionCounts: new Map(), looked: new Set(), performed: [], logs: [], queries: [], selectedDoc: 0, qcat: '기본사항', ended: false, caseStart: Date.now(), caseWorkSeconds: 18, refugeeStep: 0, forensic: false, investigation: false, arrestReview: false, repatriationStep: 0, discoveredClues: new Set(), procedureMode: null });
  state.behavior = makeBehavior(c); state.language = languageProfileFor(c); state.party = travelPartyFor(c);
  bus.emit('procedure:close');
  discoverTriggeredClues('INIT');
  addLog('system', `${screeningNo()} 심사 개시. 여권·입국요건·진술을 확인하십시오.`);
  if (state.party) addLog('system', `동행여행 연결정보: ${state.party.label} ${state.party.members.length}명 · 공동예약 ${state.party.sharedPNR}. 동행 관계 자체는 판정근거가 아닙니다.`);
  addLog('system', `의사소통 확인: 주언어 ${state.language.primary} · 초기 질문모드 ${languageModeLabel()}. 언어능력은 입국판정 근거가 아닙니다.`);
  addLog('alien', c.initial);
  maybeStartFieldEvent();
  if (storyIsAnchor(c)) { const d = storyChapterDef(); addLog('system', `캠페인 연계사건 플래그: ${d.title}. 이전 사건과의 연관성은 원자료 확인 전까지 추정하지 마십시오.`); }
  bus.emit('case:init', { c, skipCall });
  const tutorial = state.guidance === 'guided' && state.caseIndex === 0 && !state.tutorialPrimaryShown;
  if (tutorial) state.tutorialPrimaryShown = true;
  return { c, callout: !skipCall, tutorial };
}

export function ask(q, repeat = false) {
  if (!questionUnlocked(q)) return { ok: false, locked: true };
  const already = state.asked.has(q.id); repeat = repeat || already;
  if (!handleLanguageBarrier(q)) return { ok: false, language: true };
  if (state.language?.interpreterActive) state.language.assistedTurns++;
  spendWork(repeat ? 10 : (q.requires?.length ? 16 : 12), repeat ? 'repeat-question' : 'question');
  behaviorOnQuestion(q, repeat);
  state.questionCounts.set(q.id, (state.questionCounts.get(q.id) || 0) + 1);
  if (!repeat) {
    state.asked.add(q.id); const trig = 'QUESTION_' + q.id; actionMark(trig);
    addLog('officer', q.q); addLog('alien', behaviorResponse(q, false)); discoverTriggeredClues(trig);
    if (q.contradiction) addLog('alert', '진술 간 긴장 또는 모순 가능성이 포착되었습니다. 단일 진술만으로 결론 내리지 말고 다른 자료와 교차검증하십시오.');
    if (q.id === 'refugee') addLog('alert', '피심사인이 입국심사 중 난민인정 신청 의사를 명확히 표시했습니다. 난민법 제6조 절차가 우선됩니다.');
  } else { addLog('officer', `다시 확인하겠습니다. ${q.q}`); addLog('alien', behaviorResponse(q, true)); addLog('system', '동일 질문을 재질문했습니다. 새로운 증거는 생성되지 않으며 처리효율에만 영향을 줄 수 있습니다.'); }
  notify.sound('beep', { f: repeat ? 520 : 620, d: .045 }); bus.emit('changed');
  return { ok: true, repeat };
}

export function lookup(kind) {
  const c = current(); if (kind === 'forensic' && !c.lookups.forensic) return { ok: false };
  if (kind === 'party' && !travelPartyFor(c)) { notify.toast('연결된 동행여행 기록이 없습니다.'); return { ok: false }; }
  const repeat = state.looked.has(kind); spendWork(kind === 'forensic' ? 28 : 14, repeat ? 'repeat' : 'lookup');
  state.looked.add(kind); actionMark('LOOKUP_' + kind); discoverTriggeredClues('LOOKUP_' + kind);
  const [t, text] = kind === 'party' ? partyLookupResult(c) : c.lookups[kind]; state.queries.unshift({ kind, t, text });
  addLog(t === '치명' || t === '경고' ? 'alert' : 'system', `[${lookupName(kind)}] ${text}`);
  if (kind === 'forensic') { state.forensic = true; actionMark('FORENSIC_REVIEW'); }
  bus.emit('changed'); notify.sound('lookup', t); notify.pulse('#terminal', 'lookup-pulse', 430);
  return { ok: true, tone: t, text };
}

export function selectDocument(i) { const c = current(); if (!c.docs[i]) return; state.selectedDoc = i; const dd = c.docs[i], mark = 'DOC_READ_' + i; if (!state.performed.includes(mark)) { actionMark(mark); spendWork(5, 'document'); } discoverTriggeredClues('DOC_' + dd.k); bus.emit('changed'); }
export function cycleDocument(delta) { const c = current(); if (!c || !c.docs || !c.docs.length) return; state.selectedDoc = (state.selectedDoc + delta + c.docs.length) % c.docs.length; bus.emit('changed'); notify.a11y(`제출서류 ${state.selectedDoc + 1}번, ${c.docs[state.selectedDoc].t}`); }

export function recordMistake(msg, pts) { let c = null, q = null; try { c = current(); q = currentQueueItem(); } catch (e) { /* no case */ } state.mistakes.push({ caseIndex: state.caseIndex, screening: screeningNo(), caseId: q?.caseId || q?.normalId || c?.id || '-', lawRef: legal.caseLawRef(c), msg: String(msg), pts: Number(pts) || 0, at: Date.now() }); }
// Returns true when the strike limit was reached (game over).
export function penalty(msg, pts) { recordMistake(msg, pts); state.strikes++; state.score = clampScore(state.score - pts); state.proportionality = clampScore(state.proportionality - Math.ceil(pts / 4)); addLog('alert', `감찰 경고: ${msg}`); notify.sound('buzzer'); bus.emit('changed'); notify.toast(`감찰 경고 -${pts}점`); return state.strikes >= 3; }
// One-shot beginner protection on the very first case in guided mode.
export function guidedGuardApplies() { if (state.guidance !== 'guided' || state.guidedGuardUsed || state.caseIndex !== 0) return false; state.guidedGuardUsed = true; return true; }

export function secondary() {
  const c = current(); const v = legal.validateSecondary(c, state.stage); if (!v.ok) return { ok: false };
  spendWork(24, 'secondary');
  if (!v.proportionate) { state.overSecondary++; state.efficiency = clampScore(state.efficiency - 5); state.proportionality = clampScore(state.proportionality - 4); addLog('alert', '업무 비례성 주의: 현재까지 확인된 사항만으로는 재심이 필수인 사건이 아닙니다. 추가 확인 필요성과 처리부담을 함께 고려하십시오.'); }
  state.stage = 'SECONDARY'; behaviorAdjust(14 * state.behavior.profile.sensitivity, -3, '입국재심 인계'); actionMark('SECONDARY'); state.stats.secondary++;
  addLog('system', '입국재심으로 인계했습니다. 이는 별도의 제재처분이 아니라 제12조 입국심사의 계속입니다.');
  bus.emit('changed'); notify.announce('입국재심 인계', `${screeningNo()} 승객을 입국재심으로 인계합니다.`, 'SECONDARY', 2100); notify.pulse('#secondaryBtn', 'action-hit', 300);
  return { ok: true, open: 'secondary' };
}

function evaluateRushed(c) { const min = caseMinimum(c); if (state.caseWorkSeconds >= min) return false; state.rushed++; state.score = clampScore(state.score - 4); state.proportionality = clampScore(state.proportionality - 2); addLog('alert', `성급한 판단 경고: 이 사건의 확인량에 비해 결론이 매우 빠릅니다. 최소 확인권고 ${min}초 / 현재 ${state.caseWorkSeconds}초.`); return true; }

export function decideClear() {
  const c = current(); const v = legal.validateClear(c, state.performed);
  if (!v.ok) { if (v.guard && guidedGuardApplies()) return { ok: false, guard: v.penalty.msg }; return { ok: false, gameOver: penalty(v.penalty.msg, v.penalty.pts) }; }
  spendWork(7, 'decision'); evaluateRushed(c); state.stage = 'ADMITTED'; state.ended = true; actionMark('CLEAR');
  notify.sound('clear'); notify.announce('심사결정', '입국 허가 결정을 기록했습니다.', 'CLEAR', 1900); notify.pulse('#clearBtn', 'action-hit', 300); bus.emit('changed');
  return { ok: true, doc: { title: '입국심사 완료', rows: [['성명', c.name], ['국적', c.nat], ['결정', '입국 허가'], ['입국근거', c.basis], ['심사관', 'ICN-8841']], foot: '출입국관리법 제12조에 따른 입국심사를 완료했습니다.' }, finish: '입국 허가' };
}

export function decideRefusal(code) {
  const c = current(); const v = legal.validateRefusal(c, code, state.performed);
  if (!v.ok) { if (v.guard && guidedGuardApplies()) return { ok: false, guard: v.penalty.msg }; return { ok: false, gameOver: penalty(v.penalty.msg, v.penalty.pts) }; }
  spendWork(9, 'decision'); evaluateRushed(c); state.stage = 'ENTRY_REFUSED'; state.ended = true; actionMark('ENTRY_REFUSED');
  notify.sound('refuse'); notify.announce('심사결정', '입국 불허가 결정을 기록했습니다.', 'INAD', 2200); notify.pulse('#refuseBtn', 'action-hit', 300); bus.emit('changed');
  const rr = v.reason;
  return { ok: true, reason: rr, doc: { title: '입국 불허가 통지서', rows: [['성명', c.name], ['국적', c.nat], ['여권번호', c.passport], ['입국편', c.arrival], ['입국 불허가 사유', rr[1]], ['법적 근거', rr[2]], ['담당 심사관', 'ICN-8841']], foot: '입국 불허가 통지서를 교부한 뒤 운수업자에 대한 송환지시 절차로 진행합니다.' }, then: 'repatriation' };
}
export function beginRepatriation() { state.repatriationStep = 0; return { open: 'repatriation' }; }

export function sjpMenu() { const c = current(); const v = legal.validateSjpEntry(c, state.stage); if (!v.ok) return { ok: false, gameOver: penalty(v.penalty.msg, v.penalty.pts) }; return { ok: true, open: 'sjp' }; }
export function arrestReview() { const c = current(); spendWork(22, 'investigation'); const v = legal.validateArrestReview(c, state); if (!v.ok) return { ok: false, gameOver: penalty(v.penalty.msg, v.penalty.pts) }; state.stage = 'ARREST_REVIEW'; state.arrestReview = true; actionMark('ARREST_REVIEW'); bus.emit('changed'); return { ok: true, open: 'sjp' }; }
export function refugeeFlow() {
  const c = current(); if (c.special !== 'refugee') return { ok: false };
  if (state.stage === 'PRIMARY') return secondary();
  if (state.refugeeStep === 0) { spendWork(20, 'refugee'); state.refugeeStep = 1; state.stage = 'REFUGEE'; behaviorAdjust(8, -1, '난민신청 절차 개시'); actionMark('REFUGEE_CLAIM'); addLog('system', '난민인정신청 의사 확인 및 출입국항 난민신청 절차 개시.'); bus.emit('changed'); }
  return { ok: true, open: 'refugee' };
}

// Procedure-screen actions. Returns an intent for the UI controller.
export function procedureAction(a, ctx = {}) {
  const c = current();
  switch (a) {
    case 'back': return { close: true };
    case 'interpreter': requestInterpreter(); return { rerender: true };
    case 'secondary': state.stage = 'SECONDARY'; bus.emit('changed'); return { close: true };
    case 'clear': return { close: true, decide: 'clear' };
    case 'refuse': return { decide: 'refuse' };
    case 'refugee': return { call: 'refugee' };
    case 'sjp': return { open: 'sjp' };
    case 'start-referral': spendWork(30, 'refugee'); state.refugeeStep = 2; actionMark('REFERRAL_SCREENING'); addLog('system', '난민인정심사 회부 여부 심사를 개시했습니다.'); bus.emit('changed'); return { rerender: true };
    case 'refer': { const v = legal.validateReferral(); return { gameOver: penalty(v.penalty.msg, v.penalty.pts), rerender: true }; }
    case 'non-referral': spendWork(34, 'refugee'); state.refugeeStep = 3; actionMark('NON_REFERRAL'); bus.emit('changed');
      return { doc: { title: '난민인정 심사 불회부결정통지서', rows: [['신청인', c.name], ['결정', '난민인정 심사에 회부하지 아니함'], ['근거', '난민법 시행령 제5조제1항제7호'], ['게임상 사유', '오로지 경제적인 이유 등 신청이 명백히 이유 없는 경우']], foot: '불회부 자체는 입국불허와 동일한 처분이 아닙니다.' }, after: 'return-to-entry' };
    case 'return-to-entry': state.stage = 'SECONDARY'; state.refugeeStep = 4; actionMark('RETURN_TO_ENTRY'); addLog('system', '불회부결정통지서 교부 후 출입국관리법상 입국심사로 복귀했습니다.'); bus.emit('changed'); return { open: 'refugee' };
    case 'forensic': lookup('forensic'); return { open: 'sjp' };
    case 'investigate': { const v = legal.validateInvestigation(c, { forensic: state.forensic, language: state.language }); if (!v.ok) { if (v.interpreterRequired) { addLog('alert', v.msg); bus.emit('changed'); notify.toast('통역을 먼저 호출하십시오.'); return { rerender: true }; } return { gameOver: penalty(v.penalty.msg, v.penalty.pts) }; }
      spendWork(32, 'investigation'); state.investigation = true; state.stage = 'INVESTIGATION'; behaviorAdjust(18, -8, '출입국사범 조사 전환'); actionMark('INVESTIGATION'); addLog('system', '출입국사범 조사로 전환했습니다. 입국심사와 조사기록을 분리합니다.'); bus.emit('changed'); return { open: 'sjp' }; }
    case 'arrest-review': return arrestReview();
    case 'execute-arrest': { spendWork(18, 'investigation'); const v = legal.validateArrestExecution(ctx.checked || 0); if (!v.ok) { state.score -= 30; return { fatal: true }; }
      state.stage = 'ARRESTED'; state.ended = true; actionMark('ARREST'); notify.sound('alert'); bus.emit('changed');
      return { close: true, doc: { title: '출입국사범 사건 인계기록', rows: [['피의자', c.name], ['조치', '긴급체포'], ['근거', '형사소송법 제200조의3'], ['혐의', '위·변조 여권 및 출입국관리에 관한 범죄 혐의 · SIMULATION'], ['후속조치', '검사 승인 및 긴급체포서 작성 절차 / 관할 조사부서 인계']], foot: '게임상 사건 사실관계가 긴급체포 요건을 모두 충족하도록 구성된 케이스입니다.' }, finish: '특사경 긴급체포' }; }
    case 'repat-order': spendWork(20, 'repatriation');
      return { doc: { title: '송환지시서', rows: [['운수업자', c.carrier], ['송환대상자', c.name], ['국적', c.nat], ['입국편', c.arrival], ['송환사유', '출입국관리법 제12조제4항 등에 따라 입국이 허가되지 아니한 사람'], ['근거', '출입국관리법 제76조'], ['송환기한', '운항계획에 따라 지정 · SIMULATION']], foot: '운수업자는 비용과 책임으로 송환대상외국인을 대한민국 밖으로 송환합니다.' }, after: 'repat-order-done' };
    case 'repat-order-done': state.repatriationStep = 1; actionMark('REPATRIATION_ORDER'); addLog('system', '송환지시서 발급 완료.'); bus.emit('changed'); return { open: 'repatriation' };
    case 'waiting-room': spendWork(16, 'repatriation'); state.repatriationStep = 2; actionMark('DEPARTURE_WAITING_AREA'); addLog('system', '출입국관리법 제76조의2에 따른 출국대기실로 인계했습니다.'); bus.emit('changed'); return { rerender: true };
    case 'finish-refusal': return { close: true, finish: '입국 불허' };
    default: return {};
  }
}

// Campaign linked-record check (연계사건) from the story dossier.
export function storyAction(id) { const r = recordStoryAction(current(), id); if (!r.ok) { if (r.already) notify.toast('이미 확인한 연계기록입니다.'); return r; } spendWork(8, 'lookup'); actionMark('CAMPAIGN_LINK_' + id.toUpperCase()); addLog('system', `캠페인 연계검증 · ${r.action[2]}`); bus.emit('changed'); bus.emit('campaign'); return r; }

function applyEfficiencyForCase(c, seconds) { const ideal = caseBenchmark(c); let delta = 0; if (seconds > ideal * 1.75) delta = -Math.min(10, Math.ceil((seconds - ideal * 1.75) / 25) + 2); else if (seconds > ideal * 1.35) delta = -Math.min(5, Math.ceil((seconds - ideal * 1.35) / 30) + 1); else if (seconds >= ideal * .7 && seconds <= ideal * 1.25) delta = 1; state.efficiency = clampScore(state.efficiency + delta); return { ideal, delta }; }

export function finishCase(label) {
  const c = current(), t = getTraveler(c.travelerId);
  const storyResult = finalizeStoryForCase(c, label);
  archivePartyStatement(c); bus.emit('procedure:close');
  const actualReal = Math.max(1, Math.round((Date.now() - state.caseStart) / 1000)); const seconds = Math.max(15, state.caseWorkSeconds); state.totalCaseSeconds += seconds;
  const procedure = legal.procedureCompliance(c, state.performed); const effEval = applyEfficiencyForCase(c, seconds);
  state.stats.processed++; if (label === '입국 허가') state.stats.admitted++; if (label === '입국 불허') state.stats.refused++; if (state.performed.includes('REFUGEE_CLAIM')) state.stats.refugee++; if (state.performed.includes('INVESTIGATION')) state.stats.investigation++;
  const caseEff = seconds <= effEval.ideal * 1.25 ? 100 : seconds <= effEval.ideal * 1.55 ? 85 : Math.max(55, 100 - Math.round((seconds / effEval.ideal - 1) * 45));
  const qi = currentQueueItem(), caseMistakes = state.mistakes.filter((m) => m.caseIndex === state.caseIndex);
  const report = { travelerId: t.id, caseId: qi.caseId || qi.normalId || c.id, name: t.name.korean, latin: t.name.latin, nat: t.nationality.korean, purpose: c.purpose, basis: c.basis, lawRef: legal.caseLawRef(c), label, procedure, screening: screeningNo(), seconds, caseEff, shift: c.shift, realSeconds: actualReal, interpreter: state.language?.interpreterUsed ? 1 : 0, interpreterLanguage: state.language?.interpreterUsed ? state.language.primary : null, event: state.activeEvent?.title || null, actions: state.performed.slice(), mistakes: caseMistakes.map((m) => ({ ...m })) };
  if (storyResult) report.campaignStory = { ...storyResult, day: state.campaignDay + 1, arc: campaignArc()?.title };
  state.reports.push(report);
  advanceFieldEventAfterCase();
  const last = state.caseIndex === session.queue.length - 1;
  saveProgressSnapshot(state.caseIndex + 1);
  bus.emit('changed');
  return { c, t, label, seconds, procedure, effEval, caseEff, last, report, storyResult, pressure: pressureInfo(), backlog: simulatedBacklog(), clue: c.clues ? clueStats(c) : null, party: travelPartyFor(c), challenge: challengeCfg().id !== 'none' ? { cfg: challengeCfg(), eval: challengeEvaluation(false) } : null };
}

// Move to the next queue position. Returns { done } or { shiftChange, nextShift } or { started:true }.
export function advanceQueue() {
  const prevShift = currentQueueItem().shift; state.caseIndex++; const next = currentQueueItem(); if (!next) return { done: true };
  if (next.shift !== prevShift) return { shiftChange: true, nextShift: next.shift };
  return {};
}

export function persistCompletedSession(grade, extra = {}) {
  if (state.sessionSaved) return null;
  const procedure = procedureAverage(), overall = overallScore(), ops = operationalScore(), avg = Math.round(state.totalCaseSeconds / Math.max(1, state.stats.processed)), challengeEval = challengeEvaluation(true), challenge = challengeCfg();
  const sess = { id: `${Date.now()}-${session.seed}`, endedAt: Date.now(), seed: session.seed, difficulty: state.difficulty, grade, overall, score: state.score, procedure, efficiency: state.efficiency, proportionality: state.proportionality, ops, avgSeconds: avg, pressurePeak: state.pressurePeak, eventsSeen: state.eventsSeen, breaksTaken: state.breaksTaken, peakFatigue: Math.round(state.peakFatigue), overSecondary: state.overSecondary, repeatedQuestions: state.repeatedQuestions, rushed: state.rushed, challengeId: challenge.id, challengeName: challenge.name, challengeSuccess: challenge.id !== 'none' && challengeEval.success, challengeBonus: challenge.id !== 'none' && challengeEval.success ? challenge.bonus : 0, challengeDetail: challengeEval.detail, scenarioId: state.scenarioId, scenarioName: scenarioCfg().name, stats: { ...state.stats }, mistakes: state.mistakes.slice(), reports: state.reports.map((r) => ({ ...r, actions: Array.isArray(r.actions) ? r.actions : [] })), failed: !!extra.failed };
  const meta = loadMeta(); applySessionCareer(meta.career, sess); state.newDailyRewards = applyDailyMissions(meta, sess); sess.dailyRewards = state.newDailyRewards.map((x) => ({ ...x })); state.newAchievements = evaluateAchievements(meta.career);
  meta.sessions.unshift(sess); meta.sessions = meta.sessions.slice(0, 12);
  const prev = meta.best[state.difficulty]; if (!prev || gradeRank(grade) > gradeRank(prev.grade) || (grade === prev.grade && overall > prev.overall)) meta.best[state.difficulty] = { grade, overall, endedAt: sess.endedAt, seed: session.seed };
  saveMeta(meta); state.sessionSaved = true; clearProgressSave();
  state.newAchievements.forEach((id) => { const a = achievementById(id); if (a) notify.toast(`업적 해금 · ${a.name}`); });
  if (state.campaignId !== 'none') advanceCampaign(sess);
  return sess;
}

export function gameOver() { persistCompletedSession('F', { failed: true }); return { grade: 'F' }; }

export function shiftComplete() {
  const avg = Math.round(state.totalCaseSeconds / Math.max(1, state.stats.processed)); const procedure = procedureAverage(), overall = overallScore(), ops = operationalScore(); const grade = gradeFor();
  saveBestGrade(grade); const completedSession = persistCompletedSession(grade); const challengeFinal = challengeEvaluation(true), challengeNow = challengeCfg();
  const newly = state.newAchievements.map(achievementById).filter(Boolean); const featured = state.reports.filter((r, i) => i % 9 === 0 || r.label !== '입국 허가').slice(0, 4);
  return { grade, avg, procedure, overall, ops, completedSession, challengeFinal, challengeNow, newly, featured, difficulty: difficultyCfg(), scenario: scenarioCfg(), campaignResult: state.campaignResult };
}

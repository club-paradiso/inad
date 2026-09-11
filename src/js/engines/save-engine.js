// Persistence: career meta, in-shift checkpoint, campaign save, preference keys and the
// portable save bundle (INAD_SAVE_BUNDLE schema 1). Storage keys are unchanged since v6.1 so
// existing browser data keeps working; `migrate*` functions are the single place that
// back-fills older shapes.
import { RELEASE, SAVE_KEYS } from '../../data/legal-baseline.js';
import { jsonGet, jsonSet, storeGetRaw, storeRemove, storeSet, parseJSON } from '../services/storage.js';
import { fnv1a } from './rng.js';
import { careerFromSessions, careerTemplate, syncDailyMeta } from './achievement-engine.js';
import { session, state, preferences } from '../state.js';
import { bus } from '../services/bus.js';

export const META_KEY = 'inad-meta-v54';
export const PROGRESS_KEY = 'inad-progress-v54';
export const CAMPAIGN_KEY = 'inad-campaign-v58';
export const PROGRESS_VERSION = 1;
export const META_VERSION = 2;
export { SAVE_KEYS, RELEASE };

// ---- Career meta (schema v2) ---------------------------------------------------------------
export function migrateMeta(m) {
  if (!m || !Array.isArray(m.sessions)) m = { version: META_VERSION, sessions: [], best: { training: null, standard: null, realistic: null } };
  if (!m.best) m.best = { training: null, standard: null, realistic: null };
  if (!m.career) m.career = careerFromSessions(m.sessions);
  const tpl = careerTemplate();
  for (const [k, v] of Object.entries(tpl)) { if (m.career[k] === undefined || m.career[k] === null) m.career[k] = typeof v === 'object' && v !== null ? JSON.parse(JSON.stringify(v)) : v; }
  for (const k of ['challengeWins', 'challengeStreak', 'bestChallengeStreak', 'dailyMissionCompletions', 'dailyFullDays', 'dailyStreak', 'bestDailyStreak', 'campaignsCompleted', 'campaignPerfect']) if (typeof m.career[k] !== 'number') m.career[k] = 0;
  for (const k of ['challengeCompleted', 'scenarioCompleted', 'scenarioBest', 'campaignBest', 'achievements']) if (!m.career[k] || typeof m.career[k] !== 'object') m.career[k] = {};
  if (!Array.isArray(m.campaignHistory)) m.campaignHistory = [];
  m.version = META_VERSION;
  syncDailyMeta(m);
  return m;
}
export const normalizeMeta = migrateMeta;
export function emptyMeta() { return migrateMeta({ version: META_VERSION, sessions: [], best: { training: null, standard: null, realistic: null }, career: careerTemplate() }); }
export function loadMeta() { return migrateMeta(jsonGet(META_KEY, null)); }
export function saveMeta(m) { m = migrateMeta(m); m.sessions = (m.sessions || []).slice(0, 12); return jsonSet(META_KEY, m); }

// ---- In-shift checkpoint (schema v1) ----------------------------------------------------------
export function migrateProgress(p) { if (!p || typeof p !== 'object') return null; if (p.version !== PROGRESS_VERSION) return null; return p; }
export function loadProgressSave() { return migrateProgress(jsonGet(PROGRESS_KEY, null)); }
export function clearProgressSave() { storeRemove(PROGRESS_KEY); bus.emit('persistence'); }
export function progressSnapshot(nextIndex = state.caseIndex) {
  return { version: PROGRESS_VERSION, savedAt: Date.now(), seed: session.seed, difficulty: state.difficulty, challengeId: state.challengeId, challengeApplied: state.challengeApplied, scenarioId: state.scenarioId, scenarioApplied: state.scenarioApplied, guidance: state.guidance, nextIndex, score: state.score, efficiency: state.efficiency, proportionality: state.proportionality, strikes: state.strikes, totalCaseSeconds: state.totalCaseSeconds, simSeconds: state.simSeconds, overSecondary: state.overSecondary, repeatedLookups: state.repeatedLookups, repeatedQuestions: state.repeatedQuestions, rushed: state.rushed, pressurePeak: state.pressurePeak, fatigue: state.fatigue, peakFatigue: state.peakFatigue, breaksTaken: state.breaksTaken, eventsSeen: state.eventsSeen, activeEvent: state.activeEvent, eventSchedule: state.eventSchedule, eventHistory: state.eventHistory, backlogOffset: state.backlogOffset, stats: state.stats, reports: state.reports, mistakes: state.mistakes, partyArchive: [...session.partyArchive.entries()],
    campaignId: state.campaignId, campaignDay: state.campaignDay, campaignApplied: state.campaignApplied, campaignCarryBacklog: state.campaignCarryBacklog, campaignCarryFatigue: state.campaignCarryFatigue };
}
export function saveProgressSnapshot(nextIndex = state.caseIndex) { if (!state.started) return false; const ok = jsonSet(PROGRESS_KEY, progressSnapshot(nextIndex)); bus.emit('persistence'); return ok; }
// Applies a checkpoint to `state` (the caller regenerates the roster for p.seed first).
export function applyProgressToState(p) {
  state.difficulty = p.difficulty || 'standard'; state.challengeId = p.challengeId || 'none'; state.challengeApplied = !!p.challengeApplied; state.scenarioId = p.scenarioId || 'normal'; state.scenarioApplied = !!p.scenarioApplied; state.guidance = p.guidance || 'expert';
  state.caseIndex = Math.min(Number(p.nextIndex) || 0, session.queue.length);
  for (const k of ['score', 'efficiency', 'proportionality', 'strikes', 'totalCaseSeconds', 'simSeconds', 'overSecondary', 'repeatedLookups', 'repeatedQuestions', 'rushed', 'pressurePeak', 'fatigue', 'peakFatigue', 'breaksTaken', 'eventsSeen', 'backlogOffset']) if (p[k] !== undefined) state[k] = p[k];
  state.activeEvent = p.activeEvent || null; state.eventSchedule = Array.isArray(p.eventSchedule) ? p.eventSchedule : null; state.eventHistory = Array.isArray(p.eventHistory) ? p.eventHistory : [];
  state.stats = { processed: 0, admitted: 0, secondary: 0, refused: 0, refugee: 0, investigation: 0, interpreter: 0, ...(p.stats || {}) }; state.reports = Array.isArray(p.reports) ? p.reports : []; state.mistakes = Array.isArray(p.mistakes) ? p.mistakes : [];
  session.partyArchive = new Map(Array.isArray(p.partyArchive) ? p.partyArchive : []);
  if (p.campaignId) { state.campaignId = p.campaignId; state.campaignDay = Number(p.campaignDay) || 0; state.campaignApplied = !!p.campaignApplied; state.campaignCarryBacklog = Number(p.campaignCarryBacklog) || 0; state.campaignCarryFatigue = Number(p.campaignCarryFatigue) || 0; }
  state.started = true; state.tutorialPrimaryShown = true; state.sessionSaved = false;
}

// ---- Preferences ---------------------------------------------------------------------------
export function savePreferences() { storeSet('inad-font', preferences.font); storeSet('inad-contrast', preferences.contrast ? '1' : '0'); storeSet('inad-reduce-motion', preferences.reduceMotion ? '1' : '0'); storeSet('inad-shortcut-hints', preferences.shortcutHints ? '1' : '0'); }
export function saveGuidance(mode) { storeSet('inad-guidance', mode); }
export function saveBestGrade(grade) { storeSet('inadBest', grade); }
export function markTutorialSeen() { storeSet('inad-tutorial-seen', '1'); }

// ---- Portable bundle (v6.1 INAD_SAVE_BUNDLE, schema 1) ----------------------------------------
export function collectPayload() { const p = {}; for (const k of SAVE_KEYS) { const v = storeGetRaw(k); if (v !== null) p[k] = v; } return p; }
export function makeBundle(payload = collectPayload()) { return { format: 'INAD_SAVE_BUNDLE', schema: RELEASE.saveSchema, appVersion: RELEASE.version, legalBaseline: RELEASE.legalBaseline, createdAt: new Date().toISOString(), payload, checksum: fnv1a(JSON.stringify(payload)) }; }
export function validateBundle(b) {
  if (!b || b.format !== 'INAD_SAVE_BUNDLE') return { ok: false, msg: 'INAD 저장파일 형식이 아닙니다.' };
  if (b.schema !== 1) return { ok: false, msg: '지원하지 않는 저장 스키마입니다.' };
  if (!b.payload || typeof b.payload !== 'object' || Array.isArray(b.payload)) return { ok: false, msg: '저장 데이터 payload가 올바르지 않습니다.' };
  for (const [k, v] of Object.entries(b.payload)) { if (!SAVE_KEYS.includes(k)) return { ok: false, msg: `허용되지 않은 저장 키: ${k}` }; if (typeof v !== 'string' || v.length > 6_000_000) return { ok: false, msg: `저장 값 형식 또는 크기가 올바르지 않습니다: ${k}` }; }
  const sum = fnv1a(JSON.stringify(b.payload)); if (b.checksum !== sum) return { ok: false, msg: '체크섬이 일치하지 않습니다. 파일이 손상되었을 수 있습니다.' };
  for (const k of [META_KEY, PROGRESS_KEY, CAMPAIGN_KEY]) if (k in b.payload && !parseJSON(b.payload[k])) return { ok: false, msg: `JSON 저장영역을 해석할 수 없습니다: ${k}` };
  return { ok: true, msg: '정상' };
}
export function bundleSummary(b) { const meta = parseJSON(b.payload[META_KEY]), prog = parseJSON(b.payload[PROGRESS_KEY]), camp = parseJSON(b.payload[CAMPAIGN_KEY]); return { sessions: meta?.sessions?.length || 0, processed: prog?.nextIndex || 0, campaign: camp?.id ? `${camp.id} · DAY ${(camp.day || 0) + 1}` : '없음', source: b.appVersion || '-', date: b.createdAt ? new Date(b.createdAt).toLocaleString('ko-KR') : '-' }; }
export function applyBundle(b) { const v = validateBundle(b); if (!v.ok) return v; for (const k of SAVE_KEYS) storeRemove(k); for (const [k, val] of Object.entries(b.payload)) if (!storeSet(k, val)) return { ok: false, msg: '브라우저 저장소에 데이터를 쓸 수 없습니다.' }; return { ok: true, msg: '불러오기 완료' }; }
export function resetData(mode) { if (mode === 'progress') storeRemove(PROGRESS_KEY); else if (mode === 'career') [META_KEY, PROGRESS_KEY, CAMPAIGN_KEY, 'inadBest'].forEach(storeRemove); else SAVE_KEYS.forEach(storeRemove); }

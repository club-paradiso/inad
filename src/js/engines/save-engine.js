// Persistence: career meta, in-shift checkpoint, campaign save, preference keys and the
// portable save bundle (INAD_SAVE_BUNDLE schema 1). Storage keys are unchanged since v6.1 so
// existing browser data keeps working; `migrate*` functions are the single place that
// back-fills older shapes.
import { RELEASE, SAVE_KEYS } from '../../data/legal-baseline.js';
import { airportById } from '../../data/airports.js';
import { jsonGet, jsonSet, storeGetRaw, storeRemove, storeSet, parseJSON } from '../services/storage.js';
import { fnv1a } from './rng.js';
import { careerFromSessions, careerTemplate, syncDailyMeta, DAILY_MISSION_DEFS, CHALLENGES } from './achievement-engine.js';
import { DIFFICULTY_CONFIG, SCENARIOS } from '../../data/operations.js';
import { CAMPAIGNS } from '../../data/campaigns.js';
import { session, state, preferences } from '../state.js';
import { bus } from '../services/bus.js';

export const META_KEY = 'inad-meta-v54';
export const PROGRESS_KEY = 'inad-progress-v54';
export const CAMPAIGN_KEY = 'inad-campaign-v58';
export const PROGRESS_VERSION = 1;
export const META_VERSION = 2;
export const CAMPAIGN_VERSION = 1;
export const SHIFT_LENGTH = 36;         // 24 seeded normal passengers + 12 core cases (queue-engine)
// Preferences added after v6.1. SAVE_KEYS stays byte-identical for bundle compatibility; these extra
// keys travel in the bundle as well and are covered by the 'all' reset.
export const PREFERENCE_EXTRA_KEYS = ['inad-airport', 'inad-locale', 'inad-audio', 'inad-shortcuts', 'inad-assist', 'inad-voice', 'inad-tts'];
export const BUNDLE_KEYS = [...SAVE_KEYS, ...PREFERENCE_EXTRA_KEYS];
const MAX_BUNDLE_CHARS = 4_500_000;     // below the ~5M-char localStorage quota of current browsers
export { SAVE_KEYS, RELEASE };

// ---- shape helpers ---------------------------------------------------------------------------
// Every load path validates structure, not just `version`: a save written by a future build, edited
// by hand or imported from a damaged file must never throw later in boot, resume or shift completion.
export const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const finite = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const known = (registry, id, d) => (typeof id === 'string' && Object.prototype.hasOwnProperty.call(registry, id) ? id : d);
const plainList = (v) => (Array.isArray(v) ? v.filter(isPlainObject) : []);
function storedVersion(key) { const raw = parseJSON(storeGetRaw(key)); return isPlainObject(raw) ? Number(raw.version) : NaN; }
// A save written by a newer build is never overwritten by this one (read-only fallback instead).
export function isFutureSave(key, supported) { const v = storedVersion(key); return Number.isFinite(v) && v > supported; }

// ---- Career meta (schema v2) ---------------------------------------------------------------
export function migrateMeta(m) {
  if (!isPlainObject(m) || !Array.isArray(m.sessions)) m = { version: META_VERSION, sessions: [], best: { training: null, standard: null, realistic: null } };
  m.sessions = plainList(m.sessions).slice(0, 12);
  const best = isPlainObject(m.best) ? m.best : {};
  m.best = Object.fromEntries(['training', 'standard', 'realistic'].map((d) => [d, isPlainObject(best[d]) && typeof best[d].grade === 'string' ? best[d] : null]));
  if (!isPlainObject(m.career)) { try { m.career = careerFromSessions(m.sessions); } catch (e) { m.career = careerTemplate(); } }
  const tpl = careerTemplate();
  for (const [k, v] of Object.entries(tpl)) {
    if (typeof v === 'number') m.career[k] = finite(m.career[k], 0);
    else if (isPlainObject(v)) m.career[k] = isPlainObject(m.career[k]) ? m.career[k] : JSON.parse(JSON.stringify(v));
    else if (m.career[k] === undefined) m.career[k] = v;
  }
  m.campaignHistory = plainList(m.campaignHistory).slice(0, 8);
  // daily missions are rebuilt when they reference unknown missions or have the wrong shape
  const d = m.daily;
  if (d !== undefined && !(isPlainObject(d) && typeof d.date === 'string' && Array.isArray(d.ids) && d.ids.every((id) => Object.prototype.hasOwnProperty.call(DAILY_MISSION_DEFS, id)) && isPlainObject(d.progress) && isPlainObject(d.rewarded))) delete m.daily;
  m.version = META_VERSION;
  syncDailyMeta(m);
  return m;
}
export function emptyMeta() { return migrateMeta({ version: META_VERSION, sessions: [], best: { training: null, standard: null, realistic: null }, career: careerTemplate() }); }
export function loadMeta() { return migrateMeta(jsonGet(META_KEY, null)); }
export function saveMeta(m) { if (isFutureSave(META_KEY, META_VERSION)) { careerWriteFailed = true; bus.emit('persistence', { ok: false, reason: 'future-save' }); return false; } m = migrateMeta(m); m.sessions = (m.sessions || []).slice(0, 12); const ok = jsonSet(META_KEY, m); careerWriteFailed = !ok; if (!ok) bus.emit('persistence', { ok: false, reason: 'write-failed' }); return ok; }

// ---- In-shift checkpoint (schema v1) ----------------------------------------------------------
// A checkpoint must identify a roster (positive integer seed) and a queue position (integer 0..36);
// everything else is coerced to safe values so a damaged field cannot crash resume.
export function migrateProgress(p) {
  if (!isPlainObject(p) || p.version !== PROGRESS_VERSION) return null;
  const seed = Number(p.seed), next = Number(p.nextIndex);
  if (!Number.isInteger(seed) || seed <= 0 || !Number.isInteger(next) || next < 0 || next > SHIFT_LENGTH) return null;
  const out = { ...p, seed, nextIndex: next };
  out.difficulty = known(DIFFICULTY_CONFIG, p.difficulty, 'standard');
  out.scenarioId = known(SCENARIOS, p.scenarioId, 'normal');
  out.challengeId = known(CHALLENGES, p.challengeId, 'none');
  out.campaignId = p.campaignId === undefined ? undefined : (p.campaignId !== 'none' && known(CAMPAIGNS, p.campaignId, null)) || 'none';
  out.guidance = p.guidance === 'guided' ? 'guided' : 'expert';
  for (const k of ['score', 'efficiency', 'proportionality', 'strikes', 'totalCaseSeconds', 'simSeconds', 'overSecondary', 'repeatedLookups', 'repeatedQuestions', 'rushed', 'pressurePeak', 'fatigue', 'peakFatigue', 'breaksTaken', 'eventsSeen', 'backlogOffset', 'campaignDay', 'campaignCarryBacklog', 'campaignCarryFatigue']) if (p[k] !== undefined) out[k] = finite(p[k], 0);
  out.stats = Object.fromEntries(Object.entries(isPlainObject(p.stats) ? p.stats : {}).map(([k, v]) => [k, finite(v, 0)]));
  out.reports = plainList(p.reports); out.mistakes = plainList(p.mistakes);
  out.partyArchive = Array.isArray(p.partyArchive) ? p.partyArchive.filter((e) => Array.isArray(e) && e.length === 2 && typeof e[0] === 'string' && isPlainObject(e[1])) : [];
  out.eventSchedule = Array.isArray(p.eventSchedule) ? plainList(p.eventSchedule) : null;
  out.eventHistory = plainList(p.eventHistory);
  out.activeEvent = isPlainObject(p.activeEvent) ? p.activeEvent : null;
  out.liveOps = isPlainObject(p.liveOps) ? p.liveOps : null;
  return out;
}
export function loadProgressSave() { return migrateProgress(jsonGet(PROGRESS_KEY, null)); }
// Invariant: the checkpoint is the only record of an unfinished or just-finished shift until the career
// record is written. If that write failed, the checkpoint is kept (and the UI warns) instead of being deleted.
let careerWriteFailed = false;
export function careerWritePending() { return careerWriteFailed; }
export function clearProgressSave() {
  if (careerWriteFailed) { bus.emit('persistence', { ok: false, reason: 'career-write-failed' }); return false; }
  storeRemove(PROGRESS_KEY); bus.emit('persistence', { ok: true }); return true;
}
// Explicit user resets (기록 초기화 · 데이터 초기화) clear regardless.
export function discardProgressSave() { careerWriteFailed = false; storeRemove(PROGRESS_KEY); bus.emit('persistence', { ok: true }); }
export function progressSnapshot(nextIndex = state.caseIndex) {
  return { version: PROGRESS_VERSION, savedAt: Date.now(), seed: session.seed, airportId: state.airportId, liveOps: state.liveOps, difficulty: state.difficulty, challengeId: state.challengeId, challengeApplied: state.challengeApplied, scenarioId: state.scenarioId, scenarioApplied: state.scenarioApplied, guidance: state.guidance, nextIndex, score: state.score, efficiency: state.efficiency, proportionality: state.proportionality, strikes: state.strikes, totalCaseSeconds: state.totalCaseSeconds, simSeconds: state.simSeconds, overSecondary: state.overSecondary, repeatedLookups: state.repeatedLookups, repeatedQuestions: state.repeatedQuestions, rushed: state.rushed, pressurePeak: state.pressurePeak, fatigue: state.fatigue, peakFatigue: state.peakFatigue, breaksTaken: state.breaksTaken, eventsSeen: state.eventsSeen, activeEvent: state.activeEvent, eventSchedule: state.eventSchedule, eventHistory: state.eventHistory, backlogOffset: state.backlogOffset, stats: state.stats, reports: state.reports, mistakes: state.mistakes, partyArchive: [...session.partyArchive.entries()],
    campaignId: state.campaignId, campaignDay: state.campaignDay, campaignApplied: state.campaignApplied, campaignCarryBacklog: state.campaignCarryBacklog, campaignCarryFatigue: state.campaignCarryFatigue };
}
export function saveProgressSnapshot(nextIndex = state.caseIndex) { if (!state.started || state.sessionMode !== 'shift') return false; if (isFutureSave(PROGRESS_KEY, PROGRESS_VERSION)) { bus.emit('persistence', { ok: false, reason: 'future-save' }); return false; } const ok = jsonSet(PROGRESS_KEY, progressSnapshot(nextIndex)); bus.emit('persistence', ok ? { ok: true } : { ok: false, reason: 'write-failed' }); return ok; }
// Applies a checkpoint to `state` (the caller regenerates the roster for p.seed first).
export function applyProgressToState(p) {
  const savedAirport = p.airportId ? airportById(p.airportId) : null;
  if (savedAirport && savedAirport.id === p.airportId) { state.airportId = p.airportId; storeSet('inad-airport', p.airportId); }
  if (p.liveOps && typeof p.liveOps === 'object' && !Array.isArray(p.liveOps)) state.liveOps = { ...state.liveOps, ...p.liveOps };
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
export function saveAudioPreference(on) { storeSet('inad-audio', on ? '1' : '0'); }
export function savePreferences() { storeSet('inad-font', preferences.font); storeSet('inad-contrast', preferences.contrast ? '1' : '0'); storeSet('inad-reduce-motion', preferences.reduceMotion ? '1' : '0'); storeSet('inad-shortcut-hints', preferences.shortcutHints ? '1' : '0'); storeSet('inad-shortcuts', preferences.shortcuts ? '1' : '0'); }
export function saveInterviewPreferences() { storeSet('inad-assist', preferences.assist || ''); storeSet('inad-voice', preferences.voice); storeSet('inad-tts', preferences.tts ? '1' : '0'); }
export function saveGuidance(mode) { storeSet('inad-guidance', mode); }
export function saveBestGrade(grade) { storeSet('inadBest', grade); }
export function markTutorialSeen() { storeSet('inad-tutorial-seen', '1'); }

// ---- Portable bundle (v6.1 INAD_SAVE_BUNDLE, schema 1) ----------------------------------------
export function collectPayload() { const p = {}; for (const k of BUNDLE_KEYS) { const v = storeGetRaw(k); if (v !== null) p[k] = v; } return p; }
export function makeBundle(payload = collectPayload()) { return { format: 'INAD_SAVE_BUNDLE', schema: RELEASE.saveSchema, appVersion: RELEASE.version, legalBaseline: RELEASE.legalBaseline, createdAt: new Date().toISOString(), payload, checksum: fnv1a(JSON.stringify(payload)) }; }
// Structural checks shared by load paths and import: a bundle is rejected (not silently repaired) when a
// JSON save area would not survive its loader.
export function metaShapeOk(m) { return isPlainObject(m) && Array.isArray(m.sessions) && m.sessions.every(isPlainObject) && (m.career === undefined || isPlainObject(m.career)) && (m.best === undefined || isPlainObject(m.best)) && !(Number(m.version) > META_VERSION); }
export function campaignShapeOk(c) { return !!migrateCampaign(c); }
export function validateBundle(b) {
  if (!isPlainObject(b) || b.format !== 'INAD_SAVE_BUNDLE') return { ok: false, msg: 'INAD 저장파일 형식이 아닙니다.' };
  if (b.schema !== 1) return { ok: false, msg: '지원하지 않는 저장 스키마입니다.' };
  if (!isPlainObject(b.payload)) return { ok: false, msg: '저장 데이터 payload가 올바르지 않습니다.' };
  let total = 0;
  for (const [k, v] of Object.entries(b.payload)) { if (!BUNDLE_KEYS.includes(k)) return { ok: false, msg: `허용되지 않은 저장 키: ${k}` }; if (typeof v !== 'string') return { ok: false, msg: `저장 값 형식이 올바르지 않습니다: ${k}` }; total += k.length + v.length; }
  if (total > MAX_BUNDLE_CHARS) return { ok: false, msg: '저장 데이터가 브라우저 저장소 한도보다 큽니다.' };
  const sum = fnv1a(JSON.stringify(b.payload)); if (b.checksum !== sum) return { ok: false, msg: '체크섬이 일치하지 않습니다. 파일이 손상되었을 수 있습니다.' };
  for (const k of [META_KEY, PROGRESS_KEY, CAMPAIGN_KEY]) if (k in b.payload && !parseJSON(b.payload[k])) return { ok: false, msg: `JSON 저장영역을 해석할 수 없습니다: ${k}` };
  if (META_KEY in b.payload && !metaShapeOk(parseJSON(b.payload[META_KEY]))) return { ok: false, msg: '근무 경력 데이터의 구조가 올바르지 않습니다.' };
  if (PROGRESS_KEY in b.payload && !migrateProgress(parseJSON(b.payload[PROGRESS_KEY]))) return { ok: false, msg: '근무 체크포인트의 구조가 올바르지 않습니다.' };
  if (CAMPAIGN_KEY in b.payload && !campaignShapeOk(parseJSON(b.payload[CAMPAIGN_KEY]))) return { ok: false, msg: '캠페인 데이터의 구조가 올바르지 않습니다.' };
  return { ok: true, msg: '정상' };
}
// Numbers only: the summary is shown in the import preview before the user confirms anything.
export function bundleSummary(b) {
  const meta = parseJSON(b.payload[META_KEY]), prog = migrateProgress(parseJSON(b.payload[PROGRESS_KEY])), camp = migrateCampaign(parseJSON(b.payload[CAMPAIGN_KEY]));
  const created = Date.parse(b.createdAt);
  return { sessions: Array.isArray(meta?.sessions) ? meta.sessions.length : 0, processed: prog ? prog.nextIndex : 0, campaign: camp ? `${CAMPAIGNS[camp.id].name} · DAY ${camp.day + 1}` : '없음', source: typeof b.appVersion === 'string' ? b.appVersion.slice(0, 16) : '-', date: Number.isFinite(created) ? new Date(created).toLocaleString('ko-KR') : '-' };
}
// Transactional: the previous values are restored if any write fails (quota), so a failed import never
// leaves the browser with neither the old nor the new save.
export function applyBundle(b) {
  const v = validateBundle(b); if (!v.ok) return v;
  const before = Object.fromEntries(BUNDLE_KEYS.map((k) => [k, storeGetRaw(k)]));
  const restore = () => { for (const [k, val] of Object.entries(before)) { if (val === null) storeRemove(k); else storeSet(k, val); } };
  for (const k of BUNDLE_KEYS) storeRemove(k);
  for (const [k, val] of Object.entries(b.payload)) if (!storeSet(k, val)) { restore(); return { ok: false, msg: '브라우저 저장소에 데이터를 쓸 수 없습니다. 기존 데이터는 그대로 유지했습니다.' }; }
  return { ok: true, msg: '불러오기 완료' };
}
export function resetData(mode) { careerWriteFailed = false; if (mode === 'progress') storeRemove(PROGRESS_KEY); else if (mode === 'career') [META_KEY, PROGRESS_KEY, CAMPAIGN_KEY, 'inadBest'].forEach(storeRemove); else BUNDLE_KEYS.forEach(storeRemove); }

// ---- Campaign save (schema v1) ----------------------------------------------------------------
// Lives here (not in campaign-engine) so import validation and boot share one validator.
export function migrateCampaign(c) {
  if (!isPlainObject(c) || c.version !== CAMPAIGN_VERSION || c.id === 'none' || !Object.prototype.hasOwnProperty.call(CAMPAIGNS, c.id)) return null;
  const days = CAMPAIGNS[c.id].days?.length || 0, day = Number(c.day), baseSeed = Number(c.baseSeed);
  if (!Number.isInteger(day) || day < 0 || day >= days || !Number.isFinite(baseSeed)) return null;
  const out = { ...c, day, baseSeed, active: c.active !== false, failed: c.failed === true, results: Array.isArray(c.results) ? c.results.map((r) => (isPlainObject(r) ? r : null)).slice(0, days) : [], carryBacklog: finite(c.carryBacklog, 0), carryFatigue: finite(c.carryFatigue, 0) };
  if (c.story !== undefined) out.story = isPlainObject(c.story) && isPlainObject(c.story.chapters) ? { ...c.story, chapters: Object.fromEntries(Object.entries(c.story.chapters).filter(([, ch]) => isPlainObject(ch)).map(([k, ch]) => [k, { ...ch, actions: Array.isArray(ch.actions) ? ch.actions.filter((x) => typeof x === 'string') : [] }])) } : undefined;
  return out;
}

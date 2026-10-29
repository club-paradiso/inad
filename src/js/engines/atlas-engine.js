// Country isolation and deterministic procedure practice. Never calls the Korean legal engine.
import { state } from '../state.js';
import { countryPack, countryAirport, SIMULATION_RULESET } from '../../data/country-packs.js';
import { atlasScenario, atlasScenarios } from '../../data/atlas-scenarios.js';
import { storeGetRaw, storeSet, parseJSON } from '../services/storage.js';
import { bus } from '../services/bus.js';

export const ATLAS_KEY = 'inad-atlas-v1';
export const COUNTRY_KEY = 'inad-country';
export const ATLAS_VERSION = 1;
export const OUTCOMES = ['complete', 'evidence', 'review'];
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const bounded = (s, n) => typeof s === 'string' && s.length <= n;
const list = (v, ids) => Array.isArray(v) && v.length <= ids.length && new Set(v).size === v.length && v.every((x) => ids.includes(x));
const CONTEXT = ['airportId', 'sessionMode', 'scenarioId', 'rulesetVersion', 'interviewLanguage', 'started', 'difficulty'];
export function activeAtlasSession() { return state.atlas.sessions[state.countryId] || null; }
export function activeAtlasCase() { const s = activeAtlasSession(); return s?.cases[s.activeId] || null; }
export function currentAtlasScenario() { return atlasScenario(state.countryId, activeAtlasSession()?.activeId); }
export function emptyAtlasCase(c) {
  return { countryId: c.countryId, scenarioId: c.id, rulesetVersion: SIMULATION_RULESET, asked: [], reviewed: [], tasks: [], selectedDoc: c.documents[0].id, pages: Object.fromEntries(c.documents.map((d) => [d.id, 0])), zoom: 100, search: '', searched: false, selectedRecord: null, notes: '', outcome: null, completed: false, rationale: '' };
}
export function atlasCaseValid(v, c) {
  return plain(v) && !!c && v.countryId === c.countryId && v.scenarioId === c.id && v.rulesetVersion === SIMULATION_RULESET &&
    list(v.asked, c.questions.map((q) => q.id)) && list(v.reviewed, c.documents.map((d) => d.id)) && list(v.tasks, c.tasks.map((t) => t.id)) &&
    c.documents.some((d) => d.id === v.selectedDoc) && plain(v.pages) && Object.keys(v.pages).length === c.documents.length && c.documents.every((d) => Number.isInteger(v.pages[d.id]) && v.pages[d.id] >= 0 && v.pages[d.id] < d.pages.length) &&
    [100, 125, 150].includes(v.zoom) && bounded(v.search, 120) && typeof v.searched === 'boolean' && (v.selectedRecord === null || c.records.some((r) => r.id === v.selectedRecord)) && bounded(v.notes, 4000) && bounded(v.rationale, 4000) &&
    (v.outcome === null || OUTCOMES.includes(v.outcome)) && typeof v.completed === 'boolean' && (!v.completed || (v.outcome !== null && v.reviewed.length === c.documents.length && v.asked.length > 0 && v.selectedRecord !== null && v.tasks.length === c.tasks.length && v.notes.trim().length >= 10 && v.rationale.trim().length >= 10));
}
// Reject unsupported content rather than normalising it into another country or losing future fields.
export function validateAtlasSave(v) {
  if (!plain(v) || v.version !== ATLAS_VERSION || !plain(v.sessions) || !['counter', 'system'].includes(v.view)) return false;
  return Object.entries(v.sessions).every(([id, s]) => {
    const p = countryPack(id);
    return id !== 'KR' && !!p && plain(s) && s.countryId === id && s.sessionMode === 'simulation' && s.rulesetVersion === SIMULATION_RULESET && countryAirport(id, s.airportId) && ['guided', 'independent'].includes(s.difficulty) && ['ko', 'en'].includes(s.interviewLanguage) && plain(s.cases) && Object.keys(s.cases).length <= 3 && !!s.cases[s.activeId] && Object.entries(s.cases).every(([cid, v]) => atlasCaseValid(v, atlasScenario(id, cid)));
  });
}
export function atlasSnapshot() { return JSON.parse(JSON.stringify({ version: ATLAS_VERSION, view: state.atlas.view, sessions: state.atlas.sessions })); }
export function loadAtlas() {
  const raw = storeGetRaw(ATLAS_KEY);
  if (raw !== null) {
    const parsed = parseJSON(raw);
    if (!validateAtlasSave(parsed)) { state.atlas.storageBlocked = true; state.atlas.saveStatus = 'protected'; }
    else { state.atlas.sessions = parsed.sessions; state.atlas.view = parsed.view; state.atlas.saveStatus = 'saved'; }
  }
  return storeGetRaw(COUNTRY_KEY) || 'KR';
}
export function persistAtlas() {
  const raw = storeGetRaw(ATLAS_KEY);
  if (state.atlas.storageBlocked || (raw !== null && !validateAtlasSave(parseJSON(raw)))) { state.atlas.storageBlocked = true; state.atlas.saveStatus = 'protected'; return false; }
  const ok = storeSet(ATLAS_KEY, JSON.stringify(atlasSnapshot()));
  state.atlas.saveStatus = ok ? 'saved' : 'failed';
  return ok;
}
function changed() { persistAtlas(); bus.emit('atlas:changed'); }
export function selectCountry(id, options = {}) {
  const p = countryPack(id);
  if (!p) return { ok: false, reason: 'unknown-country' };
  if (id !== 'KR' && options.airportId && !countryAirport(id, options.airportId)) return { ok: false, reason: 'wrong-airport' };
  if (state.countryId === 'KR' && id !== 'KR') state.atlas.krContext = Object.fromEntries(CONTEXT.map((k) => [k, state[k]]));
  state.countryId = id;
  if (id === 'KR') {
    if (state.atlas.krContext) Object.assign(state, state.atlas.krContext);
  } else {
    let s = state.atlas.sessions[id];
    if (!s) { const c = atlasScenarios(id)[0]; s = { countryId: id, sessionMode: 'simulation', rulesetVersion: SIMULATION_RULESET, airportId: p.airports[0].id, difficulty: 'guided', interviewLanguage: 'en', activeId: c.id, cases: { [c.id]: emptyAtlasCase(c) } }; state.atlas.sessions[id] = s; }
    if (options.airportId) s.airportId = options.airportId;
    if (['guided', 'independent'].includes(options.difficulty)) s.difficulty = options.difficulty;
    if (['ko', 'en'].includes(options.interviewLanguage)) s.interviewLanguage = options.interviewLanguage;
    Object.assign(state, { airportId: s.airportId, sessionMode: s.sessionMode, scenarioId: s.activeId, rulesetVersion: s.rulesetVersion, interviewLanguage: s.interviewLanguage, started: true });
    persistAtlas();
  }
  if (!storeSet(COUNTRY_KEY, id)) state.atlas.saveStatus = 'failed';
  return { ok: true };
}
export function selectAtlasCase(id) {
  const c = atlasScenario(state.countryId, id), s = activeAtlasSession();
  if (!c || !s) return false;
  s.cases[id] ||= emptyAtlasCase(c); s.activeId = id; state.scenarioId = id; changed(); return true;
}
export function setAtlasView(view) { if (!['counter', 'system'].includes(view)) return; state.atlas.view = view; if (state.countryId !== 'KR') changed(); else bus.emit('atlas:changed'); }
export function atlasAction(action, value) {
  const v = activeAtlasCase(), c = currentAtlasScenario(); if (!v || !c) return false;
  const d = c.documents.find((x) => x.id === v.selectedDoc);
  if (action === 'document' && c.documents.some((x) => x.id === value)) v.selectedDoc = value;
  else if (action === 'page' && Number.isInteger(value) && value >= 0 && value < d.pages.length) v.pages[d.id] = value;
  else if (action === 'zoom' && [100, 125, 150].includes(value)) v.zoom = value;
  else if (action === 'search' && bounded(value, 120)) { v.search = value; v.searched = true; }
  else if (action === 'record' && c.records.some((r) => r.id === value)) { v.selectedRecord = value; v.selectedDoc = c.records.find((r) => r.id === value).documentId; }
  else if (v.completed) return false;
  else if (action === 'ask' && c.questions.some((q) => q.id === value)) { if (!v.asked.includes(value)) v.asked.push(value); }
  else if (action === 'review' && value === d.id) { if (!v.reviewed.includes(value)) v.reviewed.push(value); }
  else if (action === 'notes' && bounded(value, 4000)) { v.notes = value; persistAtlas(); return true; }
  else if (action === 'task' && c.tasks.some((t) => t.id === value)) {
    const task = c.tasks.find((t) => t.id === value);
    if (!v.reviewed.includes(task.documentId) || (value === 'evidence' && !v.asked.length) || (value === 'handover' && v.notes.trim().length < 10)) return false;
    if (!v.tasks.includes(value)) v.tasks.push(value);
  } else return false;
  changed(); return true;
}
export function atlasMissing() {
  const v = activeAtlasCase(), c = currentAtlasScenario(); if (!v || !c) return ['case'];
  return [...(v.reviewed.length < c.documents.length ? ['documents'] : []), ...(!v.asked.length ? ['interview'] : []), ...(!v.selectedRecord ? ['record'] : []), ...(v.notes.trim().length < 10 ? ['notes'] : []), ...(v.tasks.length < c.tasks.length ? ['tasks'] : [])];
}
export function completeAtlas(outcome, rationale) {
  const v = activeAtlasCase();
  if (!v || v.completed || atlasMissing().length || !OUTCOMES.includes(outcome) || !bounded(rationale, 4000) || rationale.trim().length < 10) return false;
  v.outcome = outcome; v.rationale = rationale.trim(); v.completed = true; changed(); return true;
}

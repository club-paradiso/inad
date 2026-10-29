// Country isolation and deterministic procedure practice. Never calls the Korean legal engine.
import { state } from '../state.js';
import { countryPack, countryAirport, SIMULATION_RULESET } from '../../data/country-packs.js';
import { atlasScenario, atlasScenarios } from '../../data/atlas-scenarios.js';
import { storeGetRaw, storeSet, parseJSON } from '../services/storage.js';
import { bus } from '../services/bus.js';
import { createEmptyGraph, validateGraphState, compareFacts, evaluateDebrief } from './atlas-graph-engine.js';
import { validEncounter, callEncounter, finishEncounter } from './atlas-encounter.js';

export const ATLAS_KEY = 'inad-atlas-v1';
export const COUNTRY_KEY = 'inad-country';
export const ATLAS_VERSION = 1;
export const OUTCOMES = ['complete', 'evidence', 'review'];
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const bounded = (s, n) => typeof s === 'string' && s.length <= n;
const list = (v, ids) => Array.isArray(v) && v.length <= ids.length && new Set(v).size === v.length && v.every((x) => ids.includes(x));
const CONTEXT = ['airportId', 'sessionMode', 'scenarioId', 'rulesetVersion', 'interviewLanguage', 'started', 'difficulty'];
export function activeAtlasSession() { return state.atlas.sessions[state.countryId] || null; }
export function activeAtlasCase() {
  const s = activeAtlasSession();
  const c = s?.cases[s.activeId];
  if (c && !c.graph) c.graph = createEmptyGraph();
  return c || null;
}
export function currentAtlasScenario() { return atlasScenario(state.countryId, activeAtlasSession()?.activeId); }
export function emptyAtlasCase(c) {
  return { countryId: c.countryId, scenarioId: c.id, rulesetVersion: SIMULATION_RULESET, asked: [], reviewed: [], tasks: [], selectedDoc: c.documents[0].id, pages: Object.fromEntries(c.documents.map((d) => [d.id, 0])), zoom: 100, search: '', searched: false, selectedRecord: null, notes: '', outcome: null, completed: false, rationale: '', graph: createEmptyGraph() };
}
export function atlasCaseValid(v, c) {
  const allowedQuestions = [...c.questions, ...(c.investigativeQuestions || [])].map((q) => q.id);
  return plain(v) && !!c && v.countryId === c.countryId && v.scenarioId === c.id && v.rulesetVersion === SIMULATION_RULESET &&
    list(v.asked, allowedQuestions) && list(v.reviewed, c.documents.map((d) => d.id)) && list(v.tasks, c.tasks.map((t) => t.id)) &&
    c.documents.some((d) => d.id === v.selectedDoc) && plain(v.pages) && Object.keys(v.pages).length === c.documents.length && c.documents.every((d) => Number.isInteger(v.pages[d.id]) && v.pages[d.id] >= 0 && v.pages[d.id] < d.pages.length) &&
    [100, 125, 150].includes(v.zoom) && bounded(v.search, 120) && typeof v.searched === 'boolean' && (v.selectedRecord === null || c.records.some((r) => r.id === v.selectedRecord)) && bounded(v.notes, 4000) && bounded(v.rationale, 4000) &&
    (v.outcome === null || OUTCOMES.includes(v.outcome)) && typeof v.completed === 'boolean' && (!v.completed || (v.outcome !== null && v.reviewed.length === c.documents.length && v.asked.length > 0 && v.selectedRecord !== null && v.tasks.length === c.tasks.length && v.notes.trim().length >= 10 && v.rationale.trim().length >= 10)) &&
    (v.graph === undefined || validateGraphState(v.graph)) &&
    (v.encounter === undefined || (validEncounter(v.encounter) && (v.encounter.phase === 'completed') === v.completed));
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
  // A tab may save newer evidence after this tab loads. Keep our observed bytes
  // so this tab cannot silently replace that newer save with an older snapshot.
  state.atlas.persistedRaw = raw;
  if (raw !== null) {
    const parsed = parseJSON(raw);
    if (!validateAtlasSave(parsed)) { state.atlas.storageBlocked = true; state.atlas.saveStatus = 'protected'; }
    else { state.atlas.sessions = parsed.sessions; state.atlas.view = parsed.view; state.atlas.saveStatus = 'saved'; }
  }
  return storeGetRaw(COUNTRY_KEY) || 'KR';
}
export function persistAtlas() {
  const raw = storeGetRaw(ATLAS_KEY);
  if (state.atlas.storageBlocked) return false;
  if (raw !== null && !validateAtlasSave(parseJSON(raw))) {
    state.atlas.storageBlocked = true; state.atlas.saveStatus = 'protected'; return false;
  }
  // In tests/direct engine use loadAtlas may not run; first write observes the
  // initial storage value. Normal boot always establishes the baseline in loadAtlas.
  if (!Object.hasOwn(state.atlas, 'persistedRaw')) state.atlas.persistedRaw = raw;
  if (raw !== state.atlas.persistedRaw) {
    state.atlas.storageBlocked = true; state.atlas.saveStatus = 'conflict'; return false;
  }
  const written = JSON.stringify(atlasSnapshot());
  const ok = storeSet(ATLAS_KEY, written);
  if (ok) state.atlas.persistedRaw = written;
  state.atlas.saveStatus = ok ? 'saved' : 'failed';
  return ok;
}
// Notification is best-effort; the write-time comparison is the primary guard.
// localStorage has no atomic compare-and-swap, so simultaneous writes cannot be
// completely serialized across tabs without a different storage architecture.
export function noteAtlasExternalWrite(raw) {
  if (!Object.hasOwn(state.atlas, 'persistedRaw') || raw === state.atlas.persistedRaw) return false;
  state.atlas.storageBlocked = true;
  state.atlas.saveStatus = 'conflict';
  bus.emit('atlas:changed');
  return true;
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
  else if (action === 'ask') {
    const allQuestions = [...c.questions, ...(c.investigativeQuestions || [])];
    const qObj = allQuestions.find((q) => q.id === value);
    if (!qObj) return false;
    if (c.investigativeQuestions?.some((q) => q.id === value) && !v.graph?.unlockedQuestions.includes(value)) return false;
    if (!v.asked.includes(value)) v.asked.push(value);
    if (!v.graph) v.graph = createEmptyGraph();
    if (v.graph.investigationPath === null && v.graph.discoveries.length === 0) {
      v.graph.investigationPath = 'interview_first';
    }
  }
  else if (action === 'review' && value === d.id) { if (!v.reviewed.includes(value)) v.reviewed.push(value); }
  else if (action === 'notes' && bounded(value, 4000)) { v.notes = value; persistAtlas(); return true; }
  else if (action === 'selectFact' && typeof value === 'string') {
    if (!v.graph) v.graph = createEmptyGraph();
    const factObj = (c.facts || []).find((f) => f.id === value);
    if (!factObj) return false;
    if (factObj.sourceType === 'statement' && factObj.questionIds && !factObj.questionIds.some((qid) => v.asked.includes(qid))) return false;
    const idx = v.graph.selectedFacts.indexOf(value);
    if (idx >= 0) v.graph.selectedFacts.splice(idx, 1);
    else {
      if (v.graph.selectedFacts.length >= 2) v.graph.selectedFacts.shift();
      v.graph.selectedFacts.push(value);
    }
  }
  else if (action === 'clearFacts') {
    if (!v.graph) v.graph = createEmptyGraph();
    v.graph.selectedFacts = [];
  }
  else if (action === 'compare') {
    const res = atlasCompare();
    return res.ok;
  }
  else if (action === 'requestEvidence' && typeof value === 'string') {
    return atlasRequestEvidence(value);
  }
  else if (action === 'task' && c.tasks.some((t) => t.id === value)) {
    const task = c.tasks.find((t) => t.id === value);
    if (!v.reviewed.includes(task.documentId) || (value === 'evidence' && !v.asked.length && !v.graph?.discoveries.length) || (value === 'handover' && v.notes.trim().length < 10)) return false;
    if (!v.tasks.includes(value)) v.tasks.push(value);
  } else return false;
  changed(); return true;
}
export function atlasCompare() {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || !v.graph || v.graph.selectedFacts.length !== 2) return { ok: false, reason: 'need-two-facts' };
  const res = compareFacts(c, v.graph.selectedFacts[0], v.graph.selectedFacts[1]);
  if (!res.ok) return res;
  if (v.graph.investigationPath === null) {
    v.graph.investigationPath = v.asked.length === 0 ? 'records_first' : 'interview_first';
  }
  if (res.comparison.findingId && !v.graph.discoveries.includes(res.comparison.findingId)) {
    v.graph.discoveries.push(res.comparison.findingId);
  }
  if (res.comparison.unlocks?.questions) {
    for (const qid of res.comparison.unlocks.questions) {
      if (!v.graph.unlockedQuestions.includes(qid)) v.graph.unlockedQuestions.push(qid);
    }
  }
  v.graph.history.push({
    time: Date.now(),
    factA: v.graph.selectedFacts[0],
    factB: v.graph.selectedFacts[1],
    type: res.comparison.type,
    findingId: res.comparison.findingId
  });
  changed();
  return res;
}
export function atlasRequestEvidence(requestId) {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || typeof requestId !== 'string' || !requestId) return false;
  const cmp = (c.comparisons || []).find((x) => x.unlocks?.evidenceRequests?.includes(requestId));
  if (!cmp || !v.graph?.discoveries?.includes(cmp.findingId)) return false;
  if (!v.graph.evidenceRequests.includes(requestId)) {
    v.graph.evidenceRequests.push(requestId);
    changed();
  }
  return true;
}
export function atlasDebrief() {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  return evaluateDebrief(c, v);
}
// An encounter is opt-in for existing exercises; old saves are never rewritten on load.
export function callAtlasPassenger() {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || c.countryId !== 'CA' || c.id !== 'SIM-CA-01' || v.completed) return false;
  const encounter = callEncounter(v.encounter);
  if (!encounter) return false;
  v.encounter = encounter; changed(); return true;
}
export function atlasMissing() {
  const v = activeAtlasCase(), c = currentAtlasScenario(); if (!v || !c) return ['case'];
  return [...(v.reviewed.length < c.documents.length ? ['documents'] : []), ...(!v.asked.length ? ['interview'] : []), ...(!v.selectedRecord ? ['record'] : []), ...(v.notes.trim().length < 10 ? ['notes'] : []), ...(v.tasks.length < c.tasks.length ? ['tasks'] : [])];
}
export function completeAtlas(outcome, rationale) {
  const v = activeAtlasCase();
  if (!v || v.completed || atlasMissing().length || !OUTCOMES.includes(outcome) || !bounded(rationale, 4000) || rationale.trim().length < 10) return false;
  if (v.encounter) { const next = finishEncounter(v.encounter); if (!next) return false; v.encounter = next; }
  v.outcome = outcome; v.rationale = rationale.trim(); v.completed = true; changed(); return true;
}

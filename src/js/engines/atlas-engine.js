// Country isolation and deterministic procedure practice. Never calls the Korean legal engine.
import { state } from '../state.js';
import { countryPack, countryAirport, SIMULATION_RULESET } from '../../data/country-packs.js';
import { atlasScenario, atlasScenarios } from './atlas-library.js';
import { storeGetRaw, storeSet, parseJSON } from '../services/storage.js';
import { bus } from '../services/bus.js';
import { createEmptyGraph, validateGraphState, compareFacts, evaluateDebrief } from './atlas-graph-engine.js';
import { validEncounter, callEncounter, finishEncounter } from './atlas-encounter.js';

export const ATLAS_KEY = 'inad-atlas-v1';
export const COUNTRY_KEY = 'inad-country';
// v2 (v11): case libraries grew past three per country and cases may gain documents.
// v1 saves are migrated explicitly and non-destructively (see migrateAtlasSave).
export const ATLAS_VERSION = 2;
export const OUTCOMES = ['complete', 'evidence', 'review'];
const facts = (c) => c.facts || [];
const allQuestions = (c) => [...c.questions, ...(c.investigativeQuestions || [])];
const subset = (list, ids) => list.every((x) => ids.includes(x));
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
    (v.outcome === null || OUTCOMES.includes(v.outcome)) && typeof v.completed === 'boolean' && (v.legacyDocuments === undefined || (v.legacyDocuments === 2 && v.completed)) &&
    (!v.completed || (v.outcome !== null && (v.reviewed.length === c.documents.length || (v.legacyDocuments === 2 && c.documents.slice(0, 2).every((d) => v.reviewed.includes(d.id)))) && v.asked.length > 0 && v.selectedRecord !== null && v.tasks.length === c.tasks.length && v.notes.trim().length >= 10 && v.rationale.trim().length >= 10)) &&
    (v.graph === undefined || (validateGraphState(v.graph) && graphConsistent(v, c))) &&
    (v.encounter === undefined || (validEncounter(v.encounter) && (v.encounter.phase === 'completed') === v.completed));
}
// Saved discoveries must belong to this case and be justified by its own comparisons, so
// evidence cannot move between cases or appear without the action that produces it.
function graphConsistent(v, c) {
  const g = v.graph, found = (c.comparisons || []).filter((x) => g.discoveries.includes(x.findingId));
  const unlockedQ = found.flatMap((x) => x.unlocks?.questions || []), unlockedR = found.flatMap((x) => x.unlocks?.evidenceRequests || []);
  const factIds = facts(c).map((f) => f.id), findingIds = (c.comparisons || []).map((x) => x.findingId);
  const pair = (h, x) => [h.factA, h.factB].sort().join('|') === [...x.facts].sort().join('|');
  const justified = g.history === undefined || found.every((x) => g.history.some((h) => h.findingId === x.findingId && pair(h, x)));
  return justified && g.selectedFacts.every((id) => atlasFactVisible(c, v, facts(c).find((f) => f.id === id))) && subset(g.discoveries, findingIds) && subset(g.unlockedQuestions, unlockedQ) && subset(g.evidenceRequests, unlockedR) &&
    v.asked.every((q) => !(c.investigativeQuestions || []).some((x) => x.id === q) || g.unlockedQuestions.includes(q)) &&
    (g.history || []).every((h) => factIds.includes(h.factA) && factIds.includes(h.factB) && (h.findingId === null || findingIds.includes(h.findingId)));
}
// Reject unsupported content rather than normalising it into another country or losing future fields.
// v1 → v2: documents added to an existing case start on page 1. Nothing else changes;
// unknown versions are never migrated (they stay protected).
export function migrateAtlasSave(raw) {
  return releaseStaleRecordSelections(upgradeV1(raw));
}
// Recovery for saves written by the PR #27 build: a record fact could stay selected after a
// search that no longer lists it, which made the whole overseas save "protected". Only that
// transient selection is released, and only for record facts of the case's own library;
// evidence (discoveries, history, unlocks, requests) is never changed, and every other
// check in validateAtlasSave still applies to the result. Input is never mutated.
function releaseStaleRecordSelections(v) {
  if (!plain(v) || v.version !== ATLAS_VERSION || !plain(v.sessions)) return v;
  let next = v;
  for (const [id, s] of Object.entries(v.sessions)) {
    if (!plain(s) || !plain(s.cases)) continue;
    for (const [cid, cs] of Object.entries(s.cases)) {
      const c = atlasScenario(id, cid);
      const sel = plain(cs) && plain(cs.graph) ? cs.graph.selectedFacts : null;
      // Only a well-formed selection is eligible; malformed data stays for validation to reject.
      if (!c || !Array.isArray(sel) || sel.length > 2 || new Set(sel).size !== sel.length || !sel.every((x) => typeof x === 'string') || typeof cs.search !== 'string' || typeof cs.searched !== 'boolean' || !(cs.selectedRecord === null || typeof cs.selectedRecord === 'string')) continue;
      const stale = cs.graph.selectedFacts.filter((fid) => { const f = facts(c).find((x) => x.id === fid); return f?.sourceType === 'record' && !atlasFactVisible(c, cs, f); });
      if (!stale.length) continue;
      if (next === v) next = structuredClone(v);
      const g = next.sessions[id].cases[cid].graph;
      g.selectedFacts = g.selectedFacts.filter((fid) => !stale.includes(fid));
    }
  }
  return next;
}
function upgradeV1(v) {
  if (!plain(v) || v.version !== 1 || !plain(v.sessions)) return v;
  const next = structuredClone(v); next.version = 2;
  for (const [id, s] of Object.entries(next.sessions)) {
    if (!plain(s) || !plain(s.cases)) continue;
    for (const [cid, cs] of Object.entries(s.cases)) {
      const c = atlasScenario(id, cid);
      if (c && plain(cs) && plain(cs.pages)) for (const d of c.documents) if (!Object.hasOwn(cs.pages, d.id)) cs.pages[d.id] = 0;
      // A case completed under v1 had two documents; v11 may add more. Its completion stays
      // as saved (marked, never re-opened or re-scored as new work).
      if (c && plain(cs) && cs.completed === true && c.documents.length > 2) cs.legacyDocuments = 2;
    }
  }
  return next;
}
export function validateAtlasSave(raw) {
  const v = migrateAtlasSave(raw);
  if (!plain(v) || v.version !== ATLAS_VERSION || !plain(v.sessions) || !['counter', 'system'].includes(v.view)) return false;
  return Object.entries(v.sessions).every(([id, s]) => {
    const p = countryPack(id);
    return id !== 'KR' && !!p && plain(s) && s.countryId === id && s.sessionMode === 'simulation' && s.rulesetVersion === SIMULATION_RULESET && countryAirport(id, s.airportId) && ['guided', 'independent'].includes(s.difficulty) && ['ko', 'en'].includes(s.interviewLanguage) && plain(s.cases) && Object.keys(s.cases).length <= atlasScenarios(id).length && !!s.cases[s.activeId] && Object.entries(s.cases).every(([cid, v]) => atlasCaseValid(v, atlasScenario(id, cid)));
  });
}
export function atlasSnapshot() { return JSON.parse(JSON.stringify({ version: ATLAS_VERSION, view: state.atlas.view, sessions: state.atlas.sessions })); }
export function loadAtlas() {
  const raw = storeGetRaw(ATLAS_KEY);
  // A tab may save newer evidence after this tab loads. Keep our observed bytes
  // so this tab cannot silently replace that newer save with an older snapshot.
  state.atlas.persistedRaw = raw;
  if (raw !== null) {
    const parsed = migrateAtlasSave(parseJSON(raw));
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
  // Never write what the next load would reject: that would lock every country's progress.
  // The in-memory draft is kept and can still be exported; the valid save on disk is untouched.
  const snapshot = atlasSnapshot();
  if (!validateAtlasSave(snapshot)) { state.atlas.saveStatus = 'failed'; return false; }
  const written = JSON.stringify(snapshot);
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
  if (id !== 'KR' && !state.atlas.sessions[id] && !atlasScenarios(id).length) return { ok: false, reason: 'library-unavailable' };
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
// A fact is usable only once the player has done what reveals it: documents are on the
// desk, records need a search, statements need the question, request results need the request.
export function atlasFactVisible(c, v, f) {
  if (!f) return false;
  if (f.sourceType === 'record') { const r = c.records.find((x) => x.id === f.sourceId); return !!r && (v.selectedRecord === r.id || (v.searched && atlasRecordMatches(c, r, v.search))); }
  if (f.sourceType === 'statement') return !f.questionIds || f.questionIds.some((q) => v.asked.includes(q));
  if (f.sourceType === 'request') return !!v.graph?.evidenceRequests.includes(f.requestId);
  return true;
}
// The record search (shared by the engine and the UI) matches id, person, title and detail.
export function atlasRecordMatches(c, r, query) {
  const q = String(query || '').toLowerCase();
  return `${r.id} ${c.name} ${r.title.ko} ${r.title.en} ${r.detail.ko} ${r.detail.en}`.toLowerCase().includes(q);
}
function releaseHiddenSelections(c, v) {
  v.graph.selectedFacts = v.graph.selectedFacts.filter((id) => atlasFactVisible(c, v, facts(c).find((f) => f.id === id)));
}
export function atlasQuestionAvailable(c, v, id) {
  if (!allQuestions(c).some((q) => q.id === id)) return false;
  return !(c.investigativeQuestions || []).some((q) => q.id === id) || !!v.graph?.unlockedQuestions.includes(id);
}
export function atlasAction(action, value) {
  const v = activeAtlasCase(), c = currentAtlasScenario(); if (!v || !c) return false;
  const d = c.documents.find((x) => x.id === v.selectedDoc);
  if (action === 'document' && c.documents.some((x) => x.id === value)) v.selectedDoc = value;
  else if (action === 'page' && Number.isInteger(value) && value >= 0 && value < d.pages.length) v.pages[d.id] = value;
  else if (action === 'zoom' && [100, 125, 150].includes(value)) v.zoom = value;
  // A new search (or another opened record) can hide record facts; release only those
  // selections. Discoveries and comparison history are never touched.
  else if (action === 'search' && bounded(value, 120)) { v.search = value; v.searched = true; releaseHiddenSelections(c, v); }
  else if (action === 'record' && c.records.some((r) => r.id === value)) { v.selectedRecord = value; v.selectedDoc = c.records.find((r) => r.id === value).documentId; releaseHiddenSelections(c, v); }
  else if (v.completed) return false;
  else if (action === 'ask') {
    // Every case: the person must be at the counter before any question is put.
    if (v.encounter?.phase !== 'called' || !atlasQuestionAvailable(c, v, value)) return false;
    if (!v.asked.includes(value)) v.asked.push(value);
    if (v.graph.investigationPath === null && v.graph.discoveries.length === 0) v.graph.investigationPath = 'interview_first';
  }
  else if (action === 'review' && value === d.id) { if (!v.reviewed.includes(value)) v.reviewed.push(value); }
  else if (action === 'notes' && bounded(value, 4000)) { v.notes = value; persistAtlas(); return true; }
  else if (action === 'selectFact' && typeof value === 'string') {
    const factObj = facts(c).find((f) => f.id === value);
    if (!atlasFactVisible(c, v, factObj)) return false;
    const idx = v.graph.selectedFacts.indexOf(value);
    if (idx >= 0) v.graph.selectedFacts.splice(idx, 1);
    else {
      if (v.graph.selectedFacts.length >= 2) v.graph.selectedFacts.shift();
      v.graph.selectedFacts.push(value);
    }
  }
  else if (action === 'clearFacts') v.graph.selectedFacts = [];
  else if (action === 'compare') return atlasCompare().ok;
  else if (action === 'requestEvidence' && typeof value === 'string') return atlasRequestEvidence(value);
  else if (action === 'task' && c.tasks.some((t) => t.id === value)) {
    const task = c.tasks.find((t) => t.id === value);
    if (!v.reviewed.includes(task.documentId) || (value === 'evidence' && !v.asked.length && !v.graph.discoveries.length) || (value === 'handover' && v.notes.trim().length < 10)) return false;
    if (!v.tasks.includes(value)) v.tasks.push(value);
  } else return false;
  changed(); return true;
}
export function atlasCompare() {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || v.completed || !v.graph || v.graph.selectedFacts.length !== 2) return { ok: false, reason: 'need-two-facts' };
  if (!v.graph.selectedFacts.every((id) => atlasFactVisible(c, v, facts(c).find((f) => f.id === id)))) return { ok: false, reason: 'not-visible' };
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
  // One entry per distinct pair (moved to the end when repeated): bounded by the case's
  // pair count, and every discovery keeps the entry that justifies it.
  const key = [...v.graph.selectedFacts].sort().join('|');
  const repeat = v.graph.history.findIndex((h) => [h.factA, h.factB].sort().join('|') === key);
  if (repeat >= 0) v.graph.history.splice(repeat, 1);
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
  if (!v || !c || v.completed || typeof requestId !== 'string' || !requestId) return false;
  const cmp = (c.comparisons || []).find((x) => x.unlocks?.evidenceRequests?.includes(requestId) && v.graph.discoveries.includes(x.findingId));
  if (!cmp) return false;
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
// Every case starts with the call. Legacy saves without an encounter are not rewritten on
// load; the player calls the person before continuing (completed legacy cases stay as saved).
export function callAtlasPassenger() {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || v.completed) return false;
  const encounter = callEncounter(v.encounter);
  if (!encounter) return false;
  v.encounter = encounter; changed(); return true;
}
export function atlasMissing() {
  const v = activeAtlasCase(), c = currentAtlasScenario(); if (!v || !c) return ['case'];
  return [
    ...(v.encounter?.phase !== 'called' && !v.completed ? ['encounter'] : []),
    ...(v.reviewed.length < c.documents.length ? ['documents'] : []),
    ...(!v.asked.length ? ['interview'] : []),
    ...(!v.selectedRecord ? ['record'] : []),
    ...(v.notes.trim().length < 10 ? ['notes'] : []),
    ...(v.tasks.length < c.tasks.length ? ['tasks'] : [])
  ];
}
export function completeAtlas(outcome, rationale) {
  const v = activeAtlasCase(), c = currentAtlasScenario();
  if (!v || !c || v.completed || atlasMissing().length || !OUTCOMES.includes(outcome) || !bounded(rationale, 4000) || rationale.trim().length < 10) return false;
  const next = finishEncounter(v.encounter); if (!next) return false;
  v.encounter = next; v.outcome = outcome; v.rationale = rationale.trim(); v.completed = true; changed(); return true;
}
// Queue and progression are derived from saved cases; nothing is stored twice.
export function atlasCaseResult(countryId, id) {
  const c = atlasScenario(countryId, id), v = state.atlas.sessions[countryId]?.cases[id];
  if (!c || !v) return { status: 'new' };
  if (!v.completed) return { status: 'active' };
  const d = evaluateDebrief(c, v);
  return { status: 'completed', score: d.score, rating: d.rating, outcomeCorrect: d.outcomeCorrect };
}
export function atlasProgress(countryId = state.countryId) {
  const cases = atlasScenarios(countryId), results = cases.map((c) => atlasCaseResult(countryId, c.id));
  const done = results.filter((r) => r.status === 'completed');
  return {
    total: cases.length, completed: done.length, started: results.filter((r) => r.status === 'active').length,
    correct: done.filter((r) => r.outcomeCorrect).length,
    averageScore: done.length ? Math.round(done.reduce((n, r) => n + r.score, 0) / done.length) : null
  };
}
export function nextAtlasCaseId(countryId = state.countryId) {
  const cases = atlasScenarios(countryId), active = state.atlas.sessions[countryId]?.activeId;
  const from = Math.max(0, cases.findIndex((c) => c.id === active));
  const ordered = [...cases.slice(from + 1), ...cases.slice(0, from + 1)];
  return ordered.find((c) => atlasCaseResult(countryId, c.id).status !== 'completed')?.id || null;
}
export function startNextAtlasCase() { const id = nextAtlasCaseId(); return id ? selectAtlasCase(id) : false; }
// Replay discards only this case's attempt; other cases and countries are untouched.
export function restartAtlasCase(id) {
  const c = atlasScenario(state.countryId, id), s = activeAtlasSession();
  if (!c || !s || !s.cases[id]) return false;
  s.cases[id] = emptyAtlasCase(c); s.activeId = id; state.scenarioId = id; changed(); return true;
}

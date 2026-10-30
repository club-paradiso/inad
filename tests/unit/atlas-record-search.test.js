// Hotfix (PR #27 Codex P1): a record fact selected from one search must not make the
// save invalid when the player runs another search that no longer lists that record.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { atlasScenarios } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';

const CASE = 'SIM-CA-02', FACT = 'SIM-CA-02-F-ADDR';
beforeEach(() => { resetStorage(); Object.assign(state, { countryId: 'KR', airportId: 'icn-t2', sessionMode: 'shift', scenarioId: 'normal', rulesetVersion: 'kr-v6.1', started: false, atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' } }); });

// The exact Codex path: search '', select the record fact without opening its record,
// then search for something that does not list that record.
function codexPath() {
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', '');
  assert.equal(atlas.atlasAction('selectFact', FACT), true);
  assert.equal(atlas.activeAtlasCase().selectedRecord, null, 'fixture: record itself not opened');
  atlas.atlasAction('search', 'zzz-no-such-record');
}
// Checks the raw state, not validateAtlasSave (which repairs stale record selections on load).
function assertSelectionsVisible(save, label) {
  for (const [cc, sess] of Object.entries(save.sessions)) for (const [cid, v] of Object.entries(sess.cases)) {
    const c = atlasScenarios(cc).find((x) => x.id === cid);
    for (const id of v.graph?.selectedFacts || []) assert.equal(atlas.atlasFactVisible(c, v, c.facts.find((f) => f.id === id)), true, `${label}: ${cid} keeps hidden ${id}`);
  }
}
function reload() { const keep = state.atlas.sessions; state.atlas.sessions = {}; state.atlas.storageBlocked = false; delete state.atlas.persistedRaw; atlas.loadAtlas(); return keep; }

test('codex P1: changing the search never writes an invalid save', () => {
  codexPath();
  // Since revealedRecords: a record once listed stays revealed, so the selection is kept.
  assert.ok(atlas.activeAtlasCase().graph.selectedFacts.includes(FACT), 'selection kept after a later search');
  assertSelectionsVisible(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY)), 'stored');
  assert.equal(atlas.validateAtlasSave(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY))), true, 'stored save stays valid');
  atlas.atlasAction('notes', 'The next action must still be able to save.');
  assert.equal(state.atlas.saveStatus, 'saved');
  assert.equal(state.atlas.storageBlocked, false);
  reload();
  assert.notEqual(state.atlas.saveStatus, 'protected');
  assert.ok(state.atlas.sessions.CA.cases[CASE], 'case restored after refresh');
});

test('a later search keeps the selection; discoveries, history and searches already done are kept', () => {
  const c = atlasScenarios('CA').find((x) => x.id === CASE);
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', '');
  const cmp = c.comparisons.find((x) => x.facts.includes(FACT));
  for (const id of cmp.facts) { const f = c.facts.find((x) => x.id === id); if (f.sourceType === 'statement') for (const q of f.questionIds) atlas.atlasAction('ask', q); }
  for (const id of cmp.facts) atlas.atlasAction('selectFact', id);
  assert.equal(atlas.atlasCompare().ok, true);
  const before = structuredClone(atlas.activeAtlasCase().graph);
  atlas.atlasAction('search', 'zzz-no-such-record');
  const g = atlas.activeAtlasCase().graph;
  assert.deepEqual(g.selectedFacts, before.selectedFacts, 'selection unchanged by a non-matching search');
  assert.deepEqual(g.discoveries, before.discoveries, 'discoveries kept');
  assert.deepEqual(g.history, before.history, 'comparison history kept');
  assert.deepEqual(g.unlockedQuestions, before.unlockedQuestions);
  // The revealed record's fact can be deselected and re-selected whatever the current search.
  atlas.atlasAction('clearFacts');
  assert.equal(atlas.atlasAction('selectFact', FACT), true);
  assert.deepEqual(atlas.activeAtlasCase().graph.selectedFacts, [FACT]);
});

test('an opened record keeps its fact selectable whatever the search', () => {
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', ''); atlas.atlasAction('record', 'SIM-CA-02-REC3');
  atlas.atlasAction('selectFact', FACT);
  atlas.atlasAction('search', 'zzz-no-such-record');
  assert.ok(atlas.activeAtlasCase().graph.selectedFacts.includes(FACT));
  assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true);
});

test('recovery: a save already written in the broken state loads, keeps all evidence and other countries', () => {
  // Build the exact on-disk state the PR #27 build produced: a valid save plus a selected
  // record fact that the stored search no longer lists.
  atlas.selectCountry('GB'); atlas.atlasAction('notes', 'United Kingdom progress that must not be blocked.');
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', ''); atlas.atlasAction('selectFact', FACT);
  const broken = atlas.atlasSnapshot();
  broken.sessions.CA.cases[CASE].search = 'zzz-no-such-record';
  delete broken.sessions.CA.cases[CASE].revealedRecords; // the #27/#28 builds never wrote this field
  const raw = JSON.stringify(broken);
  localStorage.setItem(atlas.ATLAS_KEY, raw);
  assert.equal(atlas.validateAtlasSave(broken), true, 'repairable: only a transient selection is out of date');
  reload();
  assert.equal(state.atlas.saveStatus, 'saved');
  assert.deepEqual(state.atlas.sessions.CA.cases[CASE].graph.selectedFacts, [], 'stale selection released');
  assert.match(state.atlas.sessions.GB.cases[state.atlas.sessions.GB.activeId].notes, /must not be blocked/);
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), raw, 'loading alone never rewrites storage');
  atlas.selectCountry('GB'); atlas.atlasAction('notes', 'Saving works again after recovery.');
  assert.equal(state.atlas.saveStatus, 'saved');
  assert.equal(atlas.validateAtlasSave(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY))), true);
});

test('repair is narrow: tampered evidence and hidden statement/request selections stay rejected', () => {
  const c = atlasScenarios('CA').find((x) => x.id === CASE);
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE);
  const base = atlas.atlasSnapshot();
  const reject = (fn, why) => { const s = structuredClone(base); fn(s.sessions.CA.cases[CASE]); assert.equal(atlas.validateAtlasSave(s), false, why); };
  reject((v) => { v.graph.selectedFacts = [c.facts.find((f) => f.sourceType === 'statement').id]; }, 'unasked statement');
  const req = c.facts.find((f) => f.sourceType === 'request');
  if (req) reject((v) => { v.graph.selectedFacts = [req.id]; }, 'request not issued');
  reject((v) => { v.graph.selectedFacts = ['SIM-CA-03-F-CUR']; }, 'fact from another case');
  reject((v) => { v.graph.discoveries = [...c.findings]; v.graph.history = []; }, 'unjustified discoveries');
  reject((v) => { v.graph.selectedFacts = [FACT, FACT]; }, 'duplicate selection');
  reject((v) => { v.search = 42; }, 'malformed search');
});

test('defence in depth: the engine refuses to persist a snapshot it would itself reject', () => {
  atlas.selectCountry('NZ'); atlas.atlasAction('notes', 'Valid New Zealand draft on disk.');
  const good = localStorage.getItem(atlas.ATLAS_KEY);
  // Force an invalid in-memory state that no public action can produce.
  atlas.activeAtlasCase().graph.discoveries = ['NOT_A_FINDING'];
  assert.equal(atlas.persistAtlas(), false);
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), good, 'valid save on disk untouched');
  assert.equal(state.atlas.saveStatus, 'failed');
  assert.equal(state.atlas.storageBlocked, false, 'not marked protected: storage itself is fine');
  // A stale record selection (repairable on load) is also never written as-is.
  atlas.activeAtlasCase().graph.discoveries = [];
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', ''); atlas.atlasAction('selectFact', FACT);
  const saved = localStorage.getItem(atlas.ATLAS_KEY);
  delete atlas.activeAtlasCase().revealedRecords; // a case loaded from a #27/#28 save
  atlas.activeAtlasCase().search = 'zzz-no-such-record'; // the pre-fix search action
  assert.equal(atlas.persistAtlas(), false);
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), saved);
});

test('every case: any search sequence keeps the save valid (36-case regression)', () => {
  for (const c of atlasScenarios('CA').concat(atlasScenarios('GB'), atlasScenarios('NZ'))) {
    atlas.selectCountry(c.countryId); atlas.selectAtlasCase(c.id); atlas.callAtlasPassenger();
    atlas.atlasAction('search', '');
    for (const f of c.facts.filter((x) => x.sourceType === 'record')) atlas.atlasAction('selectFact', f.id);
    for (const q of ['zzz', c.records[0].id, '', c.name.slice(0, 3)]) {
      atlas.atlasAction('search', q);
      assertSelectionsVisible(atlas.atlasSnapshot(), `${c.id} after search "${q}"`);
      assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true, `${c.id} after search "${q}"`);
    }
  }
  assert.notEqual(state.atlas.saveStatus, 'protected');
});

test('typing a query keystroke by keystroke never drops a selected record fact', () => {
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', '');
  atlas.atlasAction('selectFact', FACT);
  for (const q of ['P', 'Pr', 'Pri', 'Prx', 'Pr', 'Priya', 'zzz', '']) {
    atlas.atlasAction('search', q);
    assert.ok(atlas.activeAtlasCase().graph.selectedFacts.includes(FACT), `kept after "${q}"`);
  }
  assertSelectionsVisible(atlas.atlasSnapshot(), 'typing');
  assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true);
});

test('revealedRecords is validated and only ever lists this case\'s records', () => {
  const c = atlasScenarios('CA').find((x) => x.id === CASE);
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', 'SIM-CA-02-REC3');
  assert.deepEqual(atlas.activeAtlasCase().revealedRecords, ['SIM-CA-02-REC3'], 'only matching records are revealed');
  atlas.atlasAction('search', '');
  assert.deepEqual([...atlas.activeAtlasCase().revealedRecords].sort(), c.records.map((r) => r.id).sort());
  const base = atlas.atlasSnapshot();
  for (const bad of [['SIM-CA-03-REC1'], ['SIM-CA-02-REC1', 'SIM-CA-02-REC1'], 'SIM-CA-02-REC1', [1]]) {
    const s = structuredClone(base); s.sessions.CA.cases[CASE].revealedRecords = bad;
    assert.equal(atlas.validateAtlasSave(s), false, JSON.stringify(bad));
  }
  // Older saves without the field remain valid and gain it on the next search.
  const old = structuredClone(base); delete old.sessions.CA.cases[CASE].revealedRecords;
  assert.equal(atlas.validateAtlasSave(old), true);
  // Replay starts with nothing revealed.
  atlas.restartAtlasCase(CASE);
  assert.deepEqual(atlas.activeAtlasCase().revealedRecords, []);
});

test('a save from before revealedRecords keeps its selection on the first non-matching keystroke', () => {
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', ''); atlas.atlasAction('selectFact', FACT);
  const old = atlas.atlasSnapshot(); delete old.sessions.CA.cases[CASE].revealedRecords;
  localStorage.setItem(atlas.ATLAS_KEY, JSON.stringify(old)); reload(); atlas.selectCountry('CA');
  assert.equal(atlas.activeAtlasCase().revealedRecords, undefined, 'fixture: field absent after load');
  atlas.atlasAction('search', 'Qx');
  assert.deepEqual(atlas.activeAtlasCase().graph.selectedFacts, [FACT], 'selection kept');
  assert.ok(atlas.activeAtlasCase().revealedRecords.includes('SIM-CA-02-REC3'), 'seeded from the saved search');
  assertSelectionsVisible(atlas.atlasSnapshot(), 'after first keystroke');
});

test('opening a record reveals it even when the current search does not list it', () => {
  atlas.selectCountry('CA'); atlas.selectAtlasCase(CASE); atlas.callAtlasPassenger();
  atlas.atlasAction('search', 'zzz-no-such-record');
  assert.deepEqual(atlas.activeAtlasCase().revealedRecords, []);
  atlas.atlasAction('record', 'SIM-CA-02-REC3');
  assert.deepEqual(atlas.activeAtlasCase().revealedRecords, ['SIM-CA-02-REC3']);
  atlas.atlasAction('record', 'SIM-CA-02-REC1');
  assert.equal(atlas.atlasAction('selectFact', FACT), true, 'REC3 stays revealed after opening another record');
});

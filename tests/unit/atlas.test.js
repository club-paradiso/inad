import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { COUNTRY_IDS, countryPack, countryAirport } from '../../src/data/country-packs.js';
import { atlasScenarios, ATLAS_SCENARIOS } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';
import * as save from '../../src/js/engines/save-engine.js';

beforeEach(() => { resetStorage(); Object.assign(state, { countryId: 'KR', airportId: 'icn-t2', sessionMode: 'shift', scenarioId: 'normal', rulesetVersion: 'kr-v6.1', started: false, atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' } }); });
function ready(c) {
  atlas.atlasAction('ask', c.questions[0].id);
  atlas.atlasAction('record', c.records[0].id);
  for (const d of c.documents) { atlas.atlasAction('document', d.id); atlas.atlasAction('review', d.id); }
  atlas.atlasAction('notes', 'Compare the two sources and record the unresolved facts.');
  for (const t of c.tasks) assert.equal(atlas.atlasAction('task', t.id), true);
}
test('exactly four explicit packs: unknown/JP/UK cannot fall back to KR; airports are isolated', () => {
  assert.deepEqual(COUNTRY_IDS, ['KR', 'CA', 'GB', 'NZ']);
  for (const id of ['JP', 'UK', 'XX', '__proto__', 'constructor', '']) { assert.equal(countryPack(id), null); assert.equal(atlas.selectCountry(id).ok, false); }
  assert.equal(countryAirport('CA', 'icn-t2'), null);
  assert.equal(atlas.selectCountry('CA', { airportId: 'nz-akl' }).ok, false);
  assert.equal(state.countryId, 'KR');
  assert.equal(ATLAS_SCENARIOS.length, 9);
  assert.equal(new Set(ATLAS_SCENARIOS.map((c) => c.id)).size, 9);
});
test('all nine exercises require evidence and complete exactly once, without writing Korean keys', () => {
  const legacy = { version: 1, seed: 14, nextIndex: 2 };
  localStorage.setItem(save.PROGRESS_KEY, JSON.stringify(legacy));
  for (const id of ['CA', 'GB', 'NZ']) {
    atlas.selectCountry(id);
    for (const c of atlasScenarios(id)) {
      assert.equal(c.ruleClass, 'SIMULATION_RULE'); atlas.selectAtlasCase(c.id);
      assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Premature disposition'), false);
      ready(c); assert.deepEqual(atlas.atlasMissing(), []);
      assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Sources compared; unresolved points documented.'), true);
      assert.equal(atlas.completeAtlas('complete', 'Duplicate disposition attempt'), false);
      assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true);
    }
  }
  assert.equal(localStorage.getItem(save.PROGRESS_KEY), JSON.stringify(legacy));
  assert.equal(localStorage.getItem(save.META_KEY), null);
});
test('country and view switches preserve case, interview, page, zoom, search, notes and KR context', () => {
  state.started = true; state.asked = new Set(['kr-question']);
  atlas.selectCountry('CA'); const c = atlas.currentAtlasScenario();
  atlas.atlasAction('ask', 'clarify'); atlas.atlasAction('page', 1); atlas.atlasAction('zoom', 150); atlas.atlasAction('search', 'SIM'); atlas.atlasAction('notes', 'Unsaved-looking draft retained.');
  const before = structuredClone(atlas.activeAtlasCase());
  atlas.setAtlasView('system'); atlas.setAtlasView('counter'); atlas.selectCountry('NZ'); atlas.selectCountry('CA');
  assert.deepEqual(atlas.activeAtlasCase(), before);
  assert.equal(atlas.selectAtlasCase('SIM-NZ-01'), false);
  assert.equal(atlas.atlasAction('document', 'SIM-NZ-01-DOC1'), false);
  atlas.selectCountry('KR'); assert.equal(state.airportId, 'icn-t2'); assert.equal(state.sessionMode, 'shift'); assert.equal(state.started, true); assert.deepEqual([...state.asked], ['kr-question']);
  atlas.selectCountry('CA'); assert.equal(state.scenarioId, c.id);
});
test('legacy checkpoints migrate to KR; foreign and ambiguous foreign payloads are rejected', () => {
  assert.equal(save.migrateProgress({ version: 1, seed: 1, nextIndex: 0 }).countryId, 'KR');
  for (const value of [{ countryId: 'CA' }, { countryId: 'XX' }, { scenarioId: 'SIM-NZ-01' }, { airportId: 'gb-lhr' }, { reports: [{ caseId: 'SIM-CA-01' }] }, { rulesetVersion: 'atlas-procedure-1' }]) {
    const raw = JSON.stringify({ version: 1, seed: 1, nextIndex: 0, ...value });
    assert.equal(save.migrateProgress(JSON.parse(raw)), null);
    assert.equal(save.validateBundle(save.makeBundle({ [save.PROGRESS_KEY]: raw })).ok, false);
  }
});
test('damaged/future overseas storage is read-only and preserved byte for byte', () => {
  for (const raw of ['{broken', JSON.stringify({ version: 99, sessions: {} }), JSON.stringify({ version: 1, sessions: { CA: {} }, view: 'system' })]) {
    localStorage.setItem(atlas.ATLAS_KEY, raw); state.atlas.storageBlocked = false;
    atlas.loadAtlas(); atlas.selectCountry('CA'); atlas.atlasAction('notes', 'New practice in memory only.');
    assert.equal(atlas.persistAtlas(), false); assert.equal(localStorage.getItem(atlas.ATLAS_KEY), raw);
    assert.equal(save.applyBundle(save.makeBundle({})).ok, false);
  }
});
test('country metadata, scenarios, pages and completion state are validated on import', () => {
  atlas.selectCountry('GB'); const original = atlas.atlasSnapshot();
  const mutations = [v => delete v.sessions.GB.countryId, v => v.sessions.GB.countryId = 'NZ', v => v.sessions.GB.airportId = 'icn-t2', v => v.sessions.GB.rulesetVersion = 'future', v => v.sessions.GB.cases['SIM-GB-01'].pages['SIM-GB-01-DOC1'] = 99, v => v.sessions.GB.cases['SIM-GB-01'].completed = true, v => delete v.sessions.GB.cases['SIM-GB-01'].countryId];
  for (const change of mutations) { const v = structuredClone(original); change(v); assert.equal(atlas.validateAtlasSave(v), false); assert.equal(save.validateBundle(save.makeBundle({ [atlas.ATLAS_KEY]: JSON.stringify(v) })).ok, false); }
});
test('bundle round trip includes foreign progress; importing an old bundle preserves foreign slots', () => {
  atlas.selectCountry('NZ'); atlas.atlasAction('notes', 'Preserve this New Zealand draft.');
  const snapshot = localStorage.getItem(atlas.ATLAS_KEY), b = save.makeBundle();
  assert.equal(save.validateBundle(b).ok, true); resetStorage(); assert.equal(save.applyBundle(b).ok, true);
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), snapshot);
  const old = save.makeBundle({ [save.PROGRESS_KEY]: JSON.stringify({ version: 1, seed: 3, nextIndex: 2 }) });
  assert.equal(save.applyBundle(old).ok, true); assert.equal(localStorage.getItem(atlas.ATLAS_KEY), snapshot); assert.equal(localStorage.getItem(atlas.COUNTRY_KEY), 'KR');
});
test('failed writes retain in-memory draft and bundle import rolls back all prior values', () => {
  atlas.selectCountry('CA'); const before = save.collectPayload(), real = localStorage.setItem.bind(localStorage);
  localStorage.setItem = () => { throw Error('quota'); };
  try { atlas.atlasAction('notes', 'The current draft is retained even if storage is full.'); assert.equal(state.atlas.saveStatus, 'failed'); assert.match(atlas.activeAtlasCase().notes, /retained/); }
  finally { localStorage.setItem = real; }
  let failed = false; localStorage.setItem = (k,v) => { if (k === 'inad-font' && !failed) { failed = true; throw Error('quota'); } return real(k,v); };
  try { assert.equal(save.applyBundle(save.makeBundle({ 'inad-font': 'large' })).ok, false); assert.deepEqual(save.collectPayload(), before); }
  finally { localStorage.setItem = real; }
});
test('future Korean checkpoints cannot be deleted by starting a new duty or replaced by import', () => {
  const raw = JSON.stringify({ version: 99, seed: 3, nextIndex: 1 }); localStorage.setItem(save.PROGRESS_KEY, raw);
  assert.equal(save.clearProgressSave(), false); assert.equal(save.applyBundle(save.makeBundle({})).ok, false); assert.equal(localStorage.getItem(save.PROGRESS_KEY), raw);
});

test('a stale international tab cannot overwrite a newer valid save', () => {
  atlas.selectCountry('CA');
  atlas.atlasAction('notes', 'Initial note saved before the second tab made changes.');
  const external = JSON.parse(localStorage.getItem(atlas.ATLAS_KEY));
  external.sessions.CA.cases['SIM-CA-01'].notes = 'Evidence changed in the other tab.';
  const newerRaw = JSON.stringify(external);
  localStorage.setItem(atlas.ATLAS_KEY, newerRaw);
  assert.equal(atlas.noteAtlasExternalWrite(newerRaw), true);
  assert.equal(state.atlas.saveStatus, 'conflict');
  // The local unsaved draft is retained for the user's explicit recovery export.
  assert.equal(atlas.atlasAction('notes', 'This old tab should not overwrite the newer record.'), true);
  assert.match(atlas.activeAtlasCase().notes, /should not overwrite/);
  assert.equal(atlas.persistAtlas(), false);
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), newerRaw);
});

test('write-time stale detection still protects data when storage event is missed', () => {
  atlas.selectCountry('NZ');
  const external = JSON.parse(localStorage.getItem(atlas.ATLAS_KEY));
  external.sessions.NZ.cases['SIM-NZ-01'].notes = 'Latest document review from a different window.';
  const newerRaw = JSON.stringify(external);
  localStorage.setItem(atlas.ATLAS_KEY, newerRaw);
  assert.equal(atlas.atlasAction('notes', 'Outdated local edits must remain in memory.'), true);
  assert.equal(state.atlas.saveStatus, 'conflict');
  assert.equal(localStorage.getItem(atlas.ATLAS_KEY), newerRaw);
});

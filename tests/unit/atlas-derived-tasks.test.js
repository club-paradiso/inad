// v11: the overseas review checks complete themselves from what the player has done. They require
// exactly what the former "Mark checked" buttons required, so scores and completion are unchanged,
// and the saved `tasks` list keeps its meaning (no save migration).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';

await loadAtlasLibraries();
beforeEach(() => { resetStorage(); Object.assign(state, { countryId: 'KR', airportId: 'icn-t2', sessionMode: 'shift', scenarioId: 'normal', rulesetVersion: 'kr-v6.1', started: false, atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' } }); });

const NOTE = 'Compared the sources; unresolved facts recorded.';
const checks = () => Object.fromEntries(atlas.atlasTaskState(atlas.currentAtlasScenario(), atlas.activeAtlasCase()).map((t) => [t.id, t.done ? 'done' : t.missing]));
function open(country, id) {
  atlas.selectCountry(country); if (id) atlas.selectAtlasCase(id);
  if (!atlas.activeAtlasCase().encounter) assert.equal(atlas.callAtlasPassenger(), true);
  return atlas.currentAtlasScenario();
}
function prepare(c) {
  atlas.atlasAction('ask', c.questions[0].id); atlas.atlasAction('record', c.records[0].id);
  for (const d of c.documents) { atlas.atlasAction('document', d.id); atlas.atlasAction('review', d.id); }
  atlas.atlasAction('notes', NOTE);
}

test('each check follows its own prerequisites, in any order, and the saved list stays in step', () => {
  const c = open('CA');
  const doc = (id) => c.tasks.find((t) => t.id === id).documentId;
  assert.deepEqual(checks(), { identity: 'document', evidence: 'document', handover: 'document' });
  atlas.atlasAction('notes', NOTE);                        // a note before any document: nothing completes
  assert.deepEqual(checks(), { identity: 'document', evidence: 'document', handover: 'document' });
  atlas.atlasAction('document', doc('identity')); atlas.atlasAction('review', doc('identity'));
  assert.equal(checks().identity, 'done');
  if (doc('evidence') !== doc('identity')) { atlas.atlasAction('document', doc('evidence')); atlas.atlasAction('review', doc('evidence')); }
  assert.deepEqual(checks(), { identity: 'done', evidence: 'interview', handover: 'done' });
  assert.deepEqual(atlas.activeAtlasCase().tasks, ['identity', 'handover']);
  atlas.atlasAction('ask', c.questions[0].id);
  assert.deepEqual(checks(), { identity: 'done', evidence: 'done', handover: 'done' });
  assert.deepEqual(atlas.activeAtlasCase().tasks, c.tasks.map((t) => t.id));
  assert.equal(atlas.validateAtlasSave(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY))), true);
  assert.deepEqual(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY)).sessions.CA.cases[c.id].tasks, c.tasks.map((t) => t.id));
});

test('a record comparison satisfies the evidence check without a question, as the button did', () => {
  const c = open('CA', 'SIM-CA-01');
  for (const d of c.documents) { atlas.atlasAction('document', d.id); atlas.atlasAction('review', d.id); }
  assert.equal(checks().evidence, 'interview');
  atlas.activeAtlasCase().graph.discoveries.push('stand-in-discovery'); atlas.atlasAction('notes', NOTE);
  assert.equal(checks().evidence, 'done');
});

test('clearing or shortening the note undoes the handover check and blocks completion again', () => {
  const c = open('GB'); prepare(c);
  assert.deepEqual(atlas.atlasMissing(), []);
  assert.deepEqual(atlas.activeAtlasCase().tasks, c.tasks.map((t) => t.id)); // the note itself completed handover
  atlas.atlasAction('notes', 'too short');
  assert.equal(checks().handover, 'notes');
  assert.ok(!atlas.activeAtlasCase().tasks.includes('handover'));
  assert.ok(atlas.atlasMissing().includes('tasks'));
  assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Sources compared; unresolved points documented.'), false);
  atlas.atlasAction('notes', NOTE);
  assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Sources compared; unresolved points documented.'), true);
});

test('an in-progress save from the button era (no checks marked) completes without any extra step', () => {
  const c = open('NZ'); prepare(c);
  const saved = JSON.parse(localStorage.getItem(atlas.ATLAS_KEY));
  saved.sessions.NZ.cases[c.id].tasks = [];               // the player never pressed "Mark checked"
  localStorage.setItem(atlas.ATLAS_KEY, JSON.stringify(saved));
  state.atlas.sessions = {}; atlas.loadAtlas(); state.countryId = 'NZ';
  assert.deepEqual(atlas.activeAtlasCase().tasks, []);
  assert.deepEqual(atlas.atlasMissing(), []);
  assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Sources compared; unresolved points documented.'), true);
  const v = JSON.parse(localStorage.getItem(atlas.ATLAS_KEY)).sessions.NZ.cases[c.id];
  assert.equal(v.completed, true); assert.deepEqual(v.tasks, c.tasks.map((t) => t.id));
  assert.equal(atlas.validateAtlasSave(JSON.parse(localStorage.getItem(atlas.ATLAS_KEY))), true);
});

test('a completed case keeps exactly what it saved: later edits cannot change its checks', () => {
  const c = open('CA'); prepare(c);
  assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Sources compared; unresolved points documented.'), true);
  const before = structuredClone(atlas.activeAtlasCase().tasks);
  atlas.atlasAction('notes', '');                            // refused or ignored on a completed case
  atlas.selectAtlasCase(c.id);
  assert.deepEqual(atlas.activeAtlasCase().tasks, before);
  assert.ok(checks().handover === 'done');
});

test('atlasAction("task") only reports a check; it cannot mark one', () => {
  const c = open('GB');
  for (const t of c.tasks) assert.equal(atlas.atlasAction('task', t.id), false);
  assert.deepEqual(atlas.activeAtlasCase().tasks, []);
  assert.equal(atlas.atlasAction('task', 'not-a-task'), false);
  prepare(c);
  for (const t of c.tasks) assert.equal(atlas.atlasAction('task', t.id), true);
});

test('every case in the library completes through the derived checks alone', () => {
  for (const country of ['CA', 'GB', 'NZ']) {
    for (const c of atlasScenarios(country)) {
      open(country, c.id); prepare(c);
      assert.deepEqual(checks(), Object.fromEntries(c.tasks.map((t) => [t.id, 'done'])), c.id);
    }
  }
});

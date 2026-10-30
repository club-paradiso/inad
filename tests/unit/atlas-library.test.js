// v11 international scenario library: every authored case must validate, be reachable and
// playable through the engine alone, survive save/load, and resist invalid transitions.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { atlasScenarios, ATLAS_SCENARIOS } from '../../src/data/atlas-scenarios.js';
import { libraryErrors } from '../../src/js/engines/atlas-library.js';
import { validateScenarioDefinition } from '../../src/js/engines/atlas-scenario-schema.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';
import { evaluateDebrief } from '../../src/js/engines/atlas-graph-engine.js';

const COUNTRIES = ['CA', 'GB', 'NZ'];
beforeEach(() => { resetStorage(); Object.assign(state, { countryId: 'KR', airportId: 'icn-t2', sessionMode: 'shift', scenarioId: 'normal', rulesetVersion: 'kr-v6.1', started: false, atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' } }); });

function open(c) { atlas.selectCountry(c.countryId); assert.equal(atlas.selectAtlasCase(c.id), true); }
function checklist(c) {
  atlas.atlasAction('search', ''); atlas.atlasAction('record', c.records[0].id);
  for (const d of c.documents) { atlas.atlasAction('document', d.id); atlas.atlasAction('review', d.id); }
  atlas.atlasAction('notes', 'Sources compared; unresolved points and next step recorded.');
  for (const t of c.tasks) assert.equal(atlas.atlasAction('task', t.id), true, `${c.id} task ${t.id}`);
}
// Plays the case through public engine actions only, in whatever order prerequisites allow.
function investigate(c) {
  const v = atlas.activeAtlasCase();
  for (const q of c.questions) assert.equal(atlas.atlasAction('ask', q.id), true, `${c.id} open question ${q.id}`);
  atlas.atlasAction('search', '');
  for (let progress = true; progress;) {
    progress = false;
    for (const cmp of c.comparisons) {
      if (v.graph.discoveries.includes(cmp.findingId)) continue;
      const visible = cmp.facts.every((id) => atlas.atlasFactVisible(c, v, c.facts.find((f) => f.id === id)));
      if (!visible) continue;
      atlas.atlasAction('clearFacts');
      for (const id of cmp.facts) assert.equal(atlas.atlasAction('selectFact', id), true, `${c.id} select ${id}`);
      const res = atlas.atlasCompare();
      assert.equal(res.ok && res.found, true, `${c.id} compare ${cmp.id}`);
      progress = true;
      for (const q of cmp.unlocks?.questions || []) assert.equal(atlas.atlasAction('ask', q), true, `${c.id} gated ${q}`);
      for (const r of cmp.unlocks?.evidenceRequests || []) if (c.assessment.resolve.requests.includes(r)) assert.equal(atlas.atlasRequestEvidence(r), true);
    }
  }
}

test('library: at least 12 valid, distinct cases per overseas country with no load errors', () => {
  assert.deepEqual(libraryErrors, []);
  assert.equal(new Set(ATLAS_SCENARIOS.map((c) => c.id)).size, ATLAS_SCENARIOS.length);
  for (const cc of COUNTRIES) {
    const cases = atlasScenarios(cc);
    assert.ok(cases.length >= 12, `${cc} has ${cases.length} cases`);
    for (const o of ['complete', 'evidence', 'review']) assert.ok(cases.some((c) => c.expectedOutcome === o), `${cc} lacks a ${o} case`);
    assert.ok(cases.filter((c) => c.expectedOutcome === 'complete').length >= 3, `${cc} needs travellers who did nothing wrong`);
    assert.ok(new Set(cases.map((c) => c.category)).size >= 6, `${cc} category diversity`);
    assert.ok(new Set(cases.map((c) => c.difficulty)).size === 3, `${cc} difficulty spread`);
    // No two cases share a brief or a title: content is authored, not duplicated.
    for (const k of ['title', 'brief']) assert.equal(new Set(cases.map((c) => c[k].en)).size, cases.length, `${cc} duplicate ${k}`);
    for (const c of cases) {
      assert.ok(Object.isFrozen(c) && Object.isFrozen(c.facts), `${c.id} is frozen`);
      assert.equal(c.ruleClass, 'SIMULATION_RULE');
      for (const f of c.facts.filter((x) => x.sourceType === 'statement')) {
        const answers = [...c.questions, ...c.investigativeQuestions].filter((q) => f.questionIds.includes(q.id));
        assert.ok(answers.length, `${f.id} has a source question`);
      }
    }
  }
});

for (const cc of COUNTRIES) test(`${cc}: every case is playable end to end, scores thoroughly only with a supported outcome`, () => {
  for (const c of atlasScenarios(cc)) {
    open(c);
    assert.equal(atlas.callAtlasPassenger(), true, `${c.id} call`);
    investigate(c); checklist(c);
    assert.deepEqual(atlas.atlasMissing(), [], `${c.id} readiness`);
    assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Evidence compared and verified; outcome follows the sources.'), true, `${c.id} complete`);
    const d = atlas.atlasDebrief();
    assert.equal(d.outcomeCorrect, true, c.id);
    assert.equal(d.rating, 'thorough', `${c.id} rating ${d.score}`);
    assert.ok(d.feedback.length >= 2, c.id);
    assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true, `${c.id} save`);
    // Replay keeps other cases and starts this one fresh.
    const others = Object.keys(atlas.activeAtlasSession().cases).filter((id) => id !== c.id);
    assert.equal(atlas.restartAtlasCase(c.id), true);
    assert.equal(atlas.activeAtlasCase().completed, false);
    assert.deepEqual(Object.keys(atlas.activeAtlasSession().cases).filter((id) => id !== c.id), others);
  }
});

for (const cc of COUNTRIES) test(`${cc}: wrong outcomes and checklist-only reviews never earn a thorough debrief`, () => {
  for (const c of atlasScenarios(cc)) {
    const wrong = ['complete', 'evidence', 'review'].find((o) => o !== c.expectedOutcome && !(c.acceptableOutcomes || []).includes(o));
    open(c); atlas.callAtlasPassenger(); investigate(c); checklist(c);
    atlas.completeAtlas(wrong, 'A thorough investigation followed by an unsupported conclusion.');
    const d = atlas.atlasDebrief();
    assert.equal(d.outcomeCorrect, false, c.id); assert.ok(d.score <= 45, c.id); assert.equal(d.rating, 'incomplete', c.id);
    assert.ok(d.outcomeFeedback?.en, `${c.id} explains the wrong outcome`);
    // Superficial: correct label, but no comparison or follow-up at all.
    atlas.restartAtlasCase(c.id); atlas.callAtlasPassenger();
    atlas.atlasAction('ask', c.questions[0].id); checklist(c);
    atlas.completeAtlas(c.expectedOutcome, 'Checked every box without comparing evidence.');
    assert.notEqual(atlas.atlasDebrief().rating, 'thorough', `${c.id} checklist-only`);
  }
});

test('engine refuses actions whose prerequisites have not happened, in every case', () => {
  for (const c of ATLAS_SCENARIOS) {
    open(c);
    const v = atlas.activeAtlasCase();
    assert.equal(atlas.atlasAction('ask', c.questions[0].id), false, `${c.id} ask before call`);
    assert.equal(atlas.completeAtlas(c.expectedOutcome, 'Completion attempted before any encounter.'), false);
    atlas.callAtlasPassenger();
    for (const q of c.investigativeQuestions) assert.equal(atlas.atlasAction('ask', q.id), false, `${c.id} gated ${q.id}`);
    for (const r of c.requests) assert.equal(atlas.atlasRequestEvidence(r.id), false, `${c.id} request ${r.id}`);
    for (const f of c.facts.filter((x) => x.sourceType !== 'document')) assert.equal(atlas.atlasAction('selectFact', f.id), false, `${c.id} hidden fact ${f.id}`);
    assert.equal(atlas.atlasAction('ask', 'not-a-question'), false);
    assert.equal(atlas.atlasRequestEvidence('SIM-XX-REQ'), false);
    assert.deepEqual(v.graph.discoveries, []);
  }
});

test('saved evidence cannot move between cases, and fabricated unlocks are rejected', () => {
  const [a, b] = atlasScenarios('CA');
  open(a); atlas.callAtlasPassenger(); investigate(a);
  open(b);
  const snap = atlas.atlasSnapshot();
  const tamper = (fn) => { const s = structuredClone(snap); fn(s.sessions.CA.cases); return atlas.validateAtlasSave(s); };
  assert.equal(atlas.validateAtlasSave(snap), true);
  assert.equal(tamper((cs) => { cs[b.id].graph.discoveries = [...cs[a.id].graph.discoveries]; }), false);
  assert.equal(tamper((cs) => { cs[b.id].graph.selectedFacts = [a.facts[0].id]; }), false);
  assert.equal(tamper((cs) => { cs[a.id].graph.discoveries = []; }), cs0Ok(a));
  if (b.investigativeQuestions.length) assert.equal(tamper((cs) => { cs[b.id].graph.unlockedQuestions = [b.investigativeQuestions[0].id]; }), false);
});
// Clearing discoveries invalidates any unlock that relied on them.
function cs0Ok(c) { return !c.comparisons.some((x) => x.unlocks?.questions?.length || x.unlocks?.evidenceRequests?.length); }

test('a country session holds its whole library (no three-case limit) and survives reload', () => {
  atlas.selectCountry('GB');
  for (const c of atlasScenarios('GB')) atlas.selectAtlasCase(c.id);
  assert.equal(Object.keys(atlas.activeAtlasSession().cases).length, atlasScenarios('GB').length);
  const raw = JSON.stringify(atlas.atlasSnapshot());
  assert.equal(atlas.validateAtlasSave(JSON.parse(raw)), true);
  localStorage.setItem(atlas.ATLAS_KEY, raw); state.atlas.sessions = {};
  atlas.loadAtlas(); assert.equal(Object.keys(state.atlas.sessions.GB.cases).length, atlasScenarios('GB').length);
});

test('v1 saves migrate explicitly to v2; future versions stay protected', () => {
  atlas.selectCountry('NZ'); atlas.atlasAction('notes', 'Version one note to keep.');
  const v1 = atlas.atlasSnapshot(); v1.version = 1;
  const legacyCase = v1.sessions.NZ.cases[v1.sessions.NZ.activeId];
  const extraDoc = atlasScenarios('NZ').find((c) => c.id === v1.sessions.NZ.activeId).documents.slice(2);
  for (const d of extraDoc) delete legacyCase.pages[d.id];
  assert.equal(atlas.validateAtlasSave(v1), true);
  const migrated = atlas.migrateAtlasSave(v1);
  assert.equal(migrated.version, 2); assert.equal(v1.version, 1, 'input is not mutated');
  for (const d of extraDoc) assert.equal(migrated.sessions.NZ.cases[v1.sessions.NZ.activeId].pages[d.id], 0);
  assert.equal(migrated.sessions.NZ.cases[v1.sessions.NZ.activeId].notes, 'Version one note to keep.');
  assert.equal(atlas.validateAtlasSave({ ...migrated, version: 3 }), false);
});

test('queue: next case skips completed work; progress is derived from saved results', () => {
  atlas.selectCountry('CA');
  const [first, second] = atlasScenarios('CA');
  assert.equal(atlas.nextAtlasCaseId(), second.id);
  open(first); atlas.callAtlasPassenger(); investigate(first); checklist(first);
  atlas.completeAtlas(first.expectedOutcome, 'Evidence compared and verified; outcome follows the sources.');
  const p = atlas.atlasProgress('CA');
  assert.equal(p.completed, 1); assert.equal(p.correct, 1); assert.ok(p.averageScore >= 80); assert.equal(p.total, atlasScenarios('CA').length);
  assert.equal(atlas.startNextAtlasCase(), true); assert.equal(atlas.activeAtlasSession().activeId, second.id);
  // Other countries are untouched by Canadian progress.
  assert.equal(atlas.atlasProgress('GB').completed, 0);
});

test('debrief scoring does not depend on the order of investigation', () => {
  const c = atlasScenarios('GB').find((x) => x.comparisons.length >= 3) || atlasScenarios('GB')[0];
  const run = (reverse) => {
    resetStorage(); state.atlas.sessions = {};
    open(c); atlas.callAtlasPassenger();
    if (reverse) { atlas.atlasAction('ask', c.questions[0].id); checklist(c); investigate(c); } else { investigate(c); checklist(c); }
    atlas.completeAtlas(c.expectedOutcome, 'Same evidence, different order of work.');
    return evaluateDebrief(c, atlas.activeAtlasCase()).score;
  };
  assert.equal(run(false), run(true));
});

test('schema validator rejects broken definitions', () => {
  const base = structuredClone(atlasScenarios('CA')[0]);
  const def = { ...base, questions: [...base.questions, ...base.investigativeQuestions] };
  delete def.investigativeQuestions; delete def.tasks; delete def.findings; delete def.ruleClass; delete def.rulesetVersion;
  def.comparisons = def.comparisons.map((x) => ({ ...x, unlocks: Object.fromEntries(Object.entries(x.unlocks || {}).filter(([k]) => k !== 'evidenceRequests')) }));
  assert.deepEqual(validateScenarioDefinition(def), []);
  const broken = [
    (d) => { d.comparisons[0].facts = [d.facts[0].id, 'missing']; },
    (d) => { d.assessment.issue = ['NOPE']; },
    (d) => { d.expectedOutcome = 'refuse'; },
    (d) => { d.comparisons[0].explanation = { ko: '긴장한 모습', en: 'The traveller looked nervous.' }; },
    (d) => { d.facts.push({ id: `${d.id}-F-X`, sourceType: 'statement', sourceId: 'x', label: { ko: 'x', en: 'x' }, questionIds: ['missing'] }); },
    (d) => { d.title = { ko: '', en: 'x' }; }
  ];
  for (const fn of broken) { const d = structuredClone(def); fn(d); assert.ok(validateScenarioDefinition(d).length > 0); }
});

// Regressions from the independent v11 review.
test('review R1: a v1 save whose legacy case was completed with its two v1 documents stays valid', () => {
  const c = atlasScenarios('CA').find((x) => x.id === 'SIM-CA-02');
  assert.ok(c.documents.length > 2, 'fixture: legacy case gained documents in v11');
  open(c); atlas.callAtlasPassenger(); atlas.atlasAction('ask', 'clarify'); checklist(c);
  atlas.completeAtlas(c.expectedOutcome, 'Completed under the v1 two-document case.');
  const v1 = atlas.atlasSnapshot(); v1.version = 1;
  const cs = v1.sessions.CA.cases[c.id];
  cs.reviewed = c.documents.slice(0, 2).map((d) => d.id);
  for (const d of c.documents.slice(2)) delete cs.pages[d.id];
  assert.equal(atlas.validateAtlasSave(v1), true);
  localStorage.setItem(atlas.ATLAS_KEY, JSON.stringify(v1)); state.atlas.sessions = {};
  atlas.loadAtlas();
  assert.notEqual(state.atlas.saveStatus, 'protected');
  assert.equal(state.atlas.sessions.CA.cases[c.id].completed, true);
  // The marker is only accepted on completed cases.
  const bad = atlas.migrateAtlasSave(v1); bad.sessions.CA.cases[c.id].completed = false;
  assert.equal(atlas.validateAtlasSave(bad), false);
});

test('review R3: repeated comparisons keep the history bounded and the save valid', () => {
  const c = atlasScenarios('GB')[0];
  open(c); atlas.callAtlasPassenger(); investigate(c);
  const [cmp] = c.comparisons;
  for (let i = 0; i < 150; i++) { atlas.atlasAction('clearFacts'); for (const id of cmp.facts) atlas.atlasAction('selectFact', id); atlas.atlasCompare(); }
  const g = atlas.activeAtlasCase().graph;
  assert.ok(g.history.length <= c.comparisons.length);
  assert.equal(g.history.at(-1).findingId, cmp.findingId, 'latest comparison is last');
  assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true);
});

test('review R4: crafted saves with unjustified discoveries or hidden selected facts are rejected', () => {
  const c = atlasScenarios('CA').find((x) => x.id === 'SIM-CA-02');
  open(c);
  const snap = atlas.atlasSnapshot();
  const cs = snap.sessions.CA.cases[c.id];
  cs.graph.discoveries = [...c.findings];
  cs.graph.history = [];
  assert.equal(atlas.validateAtlasSave(snap), false, 'discoveries without comparisons');
  const hidden = c.facts.find((f) => f.sourceType === 'statement');
  const snap2 = atlas.atlasSnapshot(); snap2.sessions.CA.cases[c.id].graph.selectedFacts = [hidden.id];
  assert.equal(atlas.validateAtlasSave(snap2), false, 'hidden statement fact selected');
});

test('review: record facts follow the search the player actually ran', () => {
  const c = ATLAS_SCENARIOS.find((x) => x.facts.some((f) => f.sourceType === 'record'));
  const f = c.facts.find((x) => x.sourceType === 'record');
  open(c); atlas.callAtlasPassenger();
  atlas.atlasAction('search', 'zzz-no-such-record');
  assert.equal(atlas.atlasAction('selectFact', f.id), false);
  atlas.atlasAction('search', '');
  assert.equal(atlas.atlasAction('selectFact', f.id), true);
});

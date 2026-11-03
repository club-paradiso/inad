// Overseas free-text questions: every way of asking goes through submitAtlasUtterance, only canonical
// answers become evidence, locked follow-ups cannot be guessed, and the input method never changes a score.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { ATLAS_SCENARIOS } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';

beforeEach(() => { resetStorage(); Object.assign(state, { countryId: 'KR', airportId: 'icn-t2', sessionMode: 'shift', scenarioId: 'normal', rulesetVersion: 'kr-v6.1', started: false, atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' } }); });
const open = (c) => { atlas.selectCountry(c.countryId); atlas.selectAtlasCase(c.id); };
const snapshot = () => JSON.stringify(atlas.activeAtlasCase());

test('typing before the passenger is called is refused and changes nothing', () => {
  const c = ATLAS_SCENARIOS[0]; open(c);
  const before = snapshot();
  assert.equal(atlas.submitAtlasUtterance({ text: c.questions[0].q.en }).kind, 'not-called');
  assert.equal(atlas.submitAtlasUtterance({ questionId: c.questions[0].id }).kind, 'not-called');
  assert.equal(snapshot(), before);
});

test('every open question of every case can be asked by typing its Korean or English wording', () => {
  for (const c of ATLAS_SCENARIOS) for (const lang of ['ko', 'en']) {
    resetStorage(); state.atlas.sessions = {}; open(c); atlas.callAtlasPassenger();
    for (const q of c.questions) {
      const r = atlas.submitAtlasUtterance({ text: q.q[lang] });
      assert.equal(r.kind, 'question', `${c.id} ${q.id} ${lang}`);
      assert.equal(r.questionId, q.id, `${c.id} ${q.id} ${lang}`);
      assert.ok(atlas.activeAtlasCase().asked.includes(q.id));
    }
  }
});

test('a locked follow-up can never be reached by typing, even word for word', () => {
  for (const c of ATLAS_SCENARIOS) {
    resetStorage(); state.atlas.sessions = {}; open(c); atlas.callAtlasPassenger();
    for (const q of c.investigativeQuestions) for (const lang of ['ko', 'en']) {
      const r = atlas.submitAtlasUtterance({ text: q.q[lang] });
      assert.notEqual(r.questionId, q.id, `${c.id} locked ${q.id} leaked (${lang})`);
      assert.ok(!(r.candidates || []).includes(q.id), `${c.id} locked ${q.id} offered as a choice`);
      assert.ok(!atlas.activeAtlasCase().asked.includes(q.id));
    }
    assert.deepEqual(atlas.activeAtlasCase().graph.unlockedQuestions, []);
  }
});

test('once a comparison unlocks a follow-up, typing it asks it', () => {
  const c = ATLAS_SCENARIOS.find((x) => x.investigativeQuestions.length && x.comparisons.some((y) => y.unlocks?.questions?.length && y.facts.every((id) => x.facts.find((f) => f.id === id).sourceType === 'document')));
  open(c); atlas.callAtlasPassenger();
  const cmp = c.comparisons.find((y) => y.unlocks?.questions?.length && y.facts.every((id) => c.facts.find((f) => f.id === id).sourceType === 'document'));
  for (const id of cmp.facts) atlas.atlasAction('selectFact', id);
  assert.equal(atlas.atlasCompare().ok, true);
  const q = c.investigativeQuestions.find((x) => cmp.unlocks.questions.includes(x.id));
  const r = atlas.submitAtlasUtterance({ text: q.q.en });
  assert.equal(r.questionId, q.id);
  assert.ok(atlas.activeAtlasCase().asked.includes(q.id));
});

test('off-topic text, empty text and oversized text never ask anything', () => {
  const c = ATLAS_SCENARIOS[0]; open(c); atlas.callAtlasPassenger();
  const before = snapshot();
  for (const t of ['', '   ', 'what is the weather like today', '오늘 점심 뭐 먹지', 'asdf qwer zxcv', 'x'.repeat(5000)]) {
    const r = atlas.submitAtlasUtterance({ text: t });
    assert.ok(['empty', 'unknown'].includes(r.kind), `${JSON.stringify(t.slice(0, 20))} → ${r.kind}`);
  }
  assert.equal(atlas.submitAtlasUtterance({ text: 42 }).kind, 'unknown');
  assert.equal(snapshot(), before);
});

test('asking twice is reported as repeated and never duplicates the record', () => {
  const c = ATLAS_SCENARIOS[0]; open(c); atlas.callAtlasPassenger();
  const q = c.questions[0];
  assert.equal(atlas.submitAtlasUtterance({ text: q.q.en }).repeated, false);
  const r = atlas.submitAtlasUtterance({ text: q.q.ko });
  assert.equal(r.repeated, true);
  assert.equal(atlas.activeAtlasCase().asked.filter((x) => x === q.id).length, 1);
});

test('a completed case accepts no more questions; free text is never stored', () => {
  const c = ATLAS_SCENARIOS[0]; open(c); atlas.callAtlasPassenger();
  atlas.submitAtlasUtterance({ text: 'Typed text that must not be saved anywhere ' + c.questions[0].q.en });
  assert.ok(!localStorage.getItem(atlas.ATLAS_KEY).includes('must not be saved'));
  atlas.activeAtlasCase().completed = true;
  assert.equal(atlas.submitAtlasUtterance({ text: c.questions[1].q.en }).kind, 'closed');
});

test('the input method never changes the debrief (typed vs list)', () => {
  const play = (typed) => {
    resetStorage(); state.atlas.sessions = {};
    const c = ATLAS_SCENARIOS.find((x) => x.id === 'SIM-GB-02'); open(c); atlas.callAtlasPassenger();
    for (const q of c.questions) atlas.submitAtlasUtterance(typed ? { text: q.q.en } : { questionId: q.id });
    for (const id of ['SIM-GB-02-F-EVENT', 'SIM-GB-02-F-STAY']) atlas.atlasAction('selectFact', id);
    atlas.atlasCompare();
    atlas.submitAtlasUtterance(typed ? { text: c.investigativeQuestions[0].q.ko } : { questionId: c.investigativeQuestions[0].id });
    return structuredClone({ asked: atlas.activeAtlasCase().asked, d: atlas.atlasDebrief() });
  };
  const a = play(true), b = play(false);
  assert.deepEqual(a.asked, b.asked);
  assert.equal(a.d.score, b.d.score);
  assert.equal(a.d.rating, b.d.rating);
});

// Review regressions: courtesies and generic openers never ask a case question silently; a request to
// hand over a document is not a question; "before" in "days before the conference" is not a previous visit.
test('greetings, generic openers and document requests never silently ask a case question', () => {
  for (const c of ATLAS_SCENARIOS) {
    open(c); atlas.callAtlasPassenger();
    for (const t of ['Good afternoon', 'good evening', '처음 오셨어요?', 'thank you very much', '수고하셨습니다', 'who won the football last night', 'anything to declare?', 'Can I see your passport?', '여권 주세요', 'show me your ticket please']) {
      const r = atlas.submitAtlasUtterance({ text: t });
      assert.notEqual(r.kind, 'question', `${c.id}: ${t} → ${r.questionId}`);
    }
    assert.deepEqual(atlas.activeAtlasCase().asked, [], c.id);
  }
  const gb06 = ATLAS_SCENARIOS.find((x) => x.id === 'SIM-GB-06'); open(gb06); atlas.callAtlasPassenger();
  assert.equal(atlas.submitAtlasUtterance({ text: 'Can I see your passport?' }).kind, 'document');
  assert.equal(atlas.submitAtlasUtterance({ text: '여권 보여 주세요' }).kind, 'document');
  const nz11 = ATLAS_SCENARIOS.find((x) => x.id === 'SIM-NZ-11'); open(nz11); atlas.callAtlasPassenger();
  assert.notEqual(atlas.submitAtlasUtterance({ text: 'Have you been here before?' }).kind, 'question');
});

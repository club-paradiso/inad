// UX Radical Simplification (P0) — the non-blocking contract.
// Questions are freely askable in any order; disclosure stays gated. Decisions are always
// available; thin review is scored and explained afterwards instead of blocking the decision.
// Statutory elements (arrest, investigation, interpreter, SJP entry) are NOT relaxed here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { state, session } from '../../src/js/state.js';
import { buildSession, current } from '../../src/js/engines/queue-engine.js';
import * as caseEngine from '../../src/js/engines/case-engine.js';
import { checkLine, hiddenTerms } from '../../src/js/engines/dialogue-guard.js';

buildSession(271828);
const indexOf = (id) => session.queue.findIndex((q) => q.caseId === id);
function open(id) {
  Object.assign(state, { caseIndex: indexOf(id), strikes: 0, score: 100, efficiency: 100, proportionality: 100, mistakes: [], guidance: 'expert', difficulty: 'standard' });
  caseEngine.initCase(true);
  state.language = { ...state.language, interpreterActive: true };
  return current();
}
const q = (c, id) => c.questions.find((x) => x.id === id);

test('ask() never locks: an early deep question gets an on-record answer and creates no evidence', () => {
  const c = open('ICN-S2-005');
  const jobOffer = q(c, 'jobOffer'); // requires QUESTION_occupation + LOOKUP_contact
  assert.ok((jobOffer.requires || []).length > 0);
  const workBefore = state.caseWorkSeconds;
  const r = caseEngine.ask(jobOffer);
  assert.equal(r.ok, true);
  assert.equal(r.withheld, true);
  assert.ok(!state.asked.has('jobOffer'), 'not marked asked');
  assert.ok(!state.performed.includes('QUESTION_jobOffer'), 'not marked performed');
  assert.equal(state.caseWorkSeconds, workBefore, 'an evidence-free turn costs nothing');
  const said = state.logs.filter((x) => x.type === 'alien').pop();
  assert.ok(checkLine(said.text, c).ok, 'withheld line carries only public facts');
  for (const tok of hiddenTerms(c)) assert.ok(!said.text.includes(tok) || c.initial.includes(tok), `no hidden term "${tok}"`);
  // After the real conditions are performed, the same question produces the canonical answer.
  caseEngine.ask(q(c, 'purpose')); caseEngine.ask(q(c, 'occupation')); caseEngine.lookup('contact');
  const r2 = caseEngine.ask(jobOffer);
  assert.equal(r2.ok, true); assert.equal(r2.withheld, undefined);
  assert.ok(state.asked.has('jobOffer'));
});

test('the same case completes via different question orders', () => {
  const c = open('ICN-S2-005');
  // Reverse-ish order: lookups and deep questions first (withheld where not yet disclosable).
  caseEngine.lookup('contact');
  caseEngine.ask(q(c, 'jobOffer')); // still withheld: occupation not asked yet
  assert.ok(!state.asked.has('jobOffer'));
  caseEngine.ask(q(c, 'occupation')); // withheld until purpose is asked
  assert.ok(!state.asked.has('occupation'));
  caseEngine.ask(q(c, 'purpose'));
  caseEngine.ask(q(c, 'occupation'));
  caseEngine.ask(q(c, 'jobOffer'));
  assert.ok(state.asked.has('jobOffer'));
  const r = caseEngine.decideRefusal(c.resolution.reason);
  assert.equal(r.ok, true);
  assert.equal(state.ended, true);
  assert.equal(state.stage, 'ENTRY_REFUSED');
});

test('a thin CLEAR decision commits, is scored as a mistake, and never strikes or blocks', () => {
  const c = open('ICN-S1-001');
  assert.equal(c.resolution.type, 'CLEAR');
  assert.ok(c.required.length > 0);
  const strikesBefore = state.strikes, scoreBefore = state.score;
  const r = caseEngine.decideClear(); // nothing performed at all
  assert.equal(r.ok, true, 'decision is not blocked by missing review steps');
  assert.equal(r.finish, '입국 허가');
  assert.equal(state.ended, true);
  assert.equal(state.stage, 'ADMITTED');
  assert.equal(state.strikes, strikesBefore, 'thin review is feedback, not a strike');
  assert.ok(state.score < scoreBefore, 'thin review is scored');
  assert.ok(state.mistakes.some((m) => /확인이 부족한 상태/.test(m.msg)), 'shortfall is recorded for the debrief');
});

test('a fully reviewed CLEAR decision carries no thin-review mistake', () => {
  const c = open('ICN-S1-001');
  for (const a of c.required) {
    if (a.startsWith('QUESTION_')) caseEngine.ask(q(c, a.slice(9)));
    else if (a.startsWith('LOOKUP_')) caseEngine.lookup(a.slice(7));
    else if (a === 'SECONDARY') caseEngine.secondary();
  }
  const mistakesBefore = state.mistakes.length;
  const r = caseEngine.decideClear();
  assert.equal(r.ok, true);
  assert.equal(state.mistakes.length, mistakesBefore);
});

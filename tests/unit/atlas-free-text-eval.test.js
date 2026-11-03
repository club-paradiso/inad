// Regression floors for overseas free-text interpretation.
// Development set (tests/dialogue/atlas-utterances.fixture.js): written without seeing the matcher, then
// used to tune data/atlas-dialogue-lexicon.js. Its NZ items were meant to be held out but were looked at
// before the split (independent review), so all of it now counts as development data.
// Held-out set (tests/dialogue/atlas-utterances-heldout2.fixture.js): written later by a separate author
// who saw neither the matcher, its lexicon nor the first set; measured once. Never tune against it.
// "Reached" = the right question is asked, confirmed, or offered as one of the clarification choices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { ATLAS_SCENARIOS } from '../../src/data/atlas-scenarios.js';
import { resolveAtlasUtterance } from '../../src/js/engines/atlas-intent.js';
import { ATLAS_UTTERANCES, ATLAS_NEGATIVES } from '../dialogue/atlas-utterances.fixture.js';

const questionsOf = (id) => { const c = ATLAS_SCENARIOS.find((x) => x.id === id); return [...c.questions, ...c.investigativeQuestions]; };
function measure(items) {
  const r = { n: 0, reached: 0, silentWrong: [] };
  for (const u of items) for (const lang of ['ko', 'en']) {
    r.n++; const x = resolveAtlasUtterance(u[lang], questionsOf(u.caseId));
    if (x.questionId === u.questionId || (x.candidates || []).includes(u.questionId)) r.reached++;
    else if (x.kind === 'question') r.silentWrong.push(`${u.caseId} ${u.questionId} ${lang}: ${u[lang]}`);
  }
  return r;
}

test('fixture covers every question of every case', () => {
  const keys = new Set(ATLAS_UTTERANCES.map((u) => `${u.caseId}/${u.questionId}`));
  for (const c of ATLAS_SCENARIOS) for (const q of [...c.questions, ...c.investigativeQuestions]) assert.ok(keys.has(`${c.id}/${q.id}`), `${c.id}/${q.id}`);
});

test('development set (CA + GB): ≥96% reached, never a silently wrong question', () => {
  const r = measure(ATLAS_UTTERANCES.filter((u) => !u.caseId.startsWith('SIM-NZ')));
  assert.deepEqual(r.silentWrong, []);
  assert.ok(r.reached / r.n >= 0.96, `${r.reached}/${r.n}`);
});

test('development set (NZ, seen before the split): ≥87% reached, never a silently wrong question', () => {
  const r = measure(ATLAS_UTTERANCES.filter((u) => u.caseId.startsWith('SIM-NZ')));
  assert.deepEqual(r.silentWrong, []);
  assert.ok(r.reached / r.n >= 0.87, `${r.reached}/${r.n}`);
});

test('off-topic utterances never ask a question in any case', () => {
  for (const n of ATLAS_NEGATIVES) for (const c of ATLAS_SCENARIOS) assert.notEqual(resolveAtlasUtterance(n, questionsOf(c.id)).kind, 'question', `${c.id}: ${n}`);
});

// Held-out set, measured once on 2026-11-03: 90.6% reached (68.8% direct), 0 silently wrong.
import { ATLAS_HELDOUT, ATLAS_HELDOUT_NEGATIVES } from '../dialogue/atlas-utterances-heldout2.fixture.js';
test('held-out set (separate author, never tuned on): ≥88% reached, never a silently wrong question', () => {
  const r = measure(ATLAS_HELDOUT);
  assert.equal(r.n, ATLAS_SCENARIOS.reduce((n, c) => n + c.questions.length + c.investigativeQuestions.length, 0) * 2, 'covers every question in both languages');
  assert.deepEqual(r.silentWrong, []);
  assert.ok(r.reached / r.n >= 0.88, `${r.reached}/${r.n}`);
});
test('held-out negatives never ask a question, except "been here before" asking a real previous-visit question', () => {
  for (const n of ATLAS_HELDOUT_NEGATIVES) for (const c of ATLAS_SCENARIOS) {
    const r = resolveAtlasUtterance(n, questionsOf(c.id));
    if (r.kind !== 'question') continue;
    const q = questionsOf(c.id).find((x) => x.id === r.questionId);
    assert.ok(/been here before/i.test(n) && /visited .*before|been to .* before/i.test(q.q.en), `${c.id}: "${n}" → ${r.questionId}`);
  }
});

// Regression floor for overseas free-text interpretation, measured on held-out paraphrases written
// without seeing the matcher (tests/dialogue/atlas-utterances.fixture.js). The Canada + UK items were
// used to tune data/atlas-dialogue-lexicon.js; the New Zealand items were never tuned on and stay the
// held-out check. Do not tune the lexicon or thresholds against the NZ items.
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

test('tuning set (CA + GB): ≥97% reached, never a silently wrong question', () => {
  const r = measure(ATLAS_UTTERANCES.filter((u) => !u.caseId.startsWith('SIM-NZ')));
  assert.deepEqual(r.silentWrong, []);
  assert.ok(r.reached / r.n >= 0.97, `${r.reached}/${r.n}`);
});

test('held-out set (NZ, never tuned on): ≥90% reached, never a silently wrong question', () => {
  const r = measure(ATLAS_UTTERANCES.filter((u) => u.caseId.startsWith('SIM-NZ')));
  assert.deepEqual(r.silentWrong, []);
  assert.ok(r.reached / r.n >= 0.9, `${r.reached}/${r.n}`);
});

test('off-topic utterances never ask a question in any case', () => {
  for (const n of ATLAS_NEGATIVES) for (const c of ATLAS_SCENARIOS) assert.notEqual(resolveAtlasUtterance(n, questionsOf(c.id)).kind, 'question', `${c.id}: ${n}`);
});

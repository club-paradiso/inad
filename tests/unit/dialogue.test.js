// v10 Live Interview dialogue layer: intent routing, deterministic disclosure, source invariance, persona-line
// grounding, suggestion fairness and the debrief. The legal engines stay authoritative; these tests pin that the
// dialogue layer can only reach evidence through case-engine ask().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { state, session } from '../../src/js/state.js';
import { buildSession, current, singleCaseSession } from '../../src/js/engines/queue-engine.js';
import * as caseEngine from '../../src/js/engines/case-engine.js';
import { submitUtterance, interviewSummary, publicAnswer } from '../../src/js/engines/interview-engine.js';
import { resolveUtterance } from '../../src/js/engines/intent-engine.js';
import { suggestQuestions } from '../../src/js/engines/suggestion-engine.js';
import { checkLine, checkLead, hiddenTerms } from '../../src/js/engines/dialogue-guard.js';
import { buildDebrief } from '../../src/js/engines/debrief-engine.js';
import { CASES } from '../../src/data/cases.js';
import { PERSONAS, GENERIC_PERSONA, personaFor } from '../../src/data/personas.js';
import { evaluateIntents } from '../../scripts/eval-intents.js';

buildSession(271828);
const indexOf = (id) => session.queue.findIndex((q) => q.caseId === id);
function open(id, { interpreter = true } = {}) {
  Object.assign(state, { caseIndex: indexOf(id), strikes: 0, score: 100, efficiency: 100, proportionality: 100, mistakes: [], guidance: 'expert', difficulty: 'standard' });
  caseEngine.initCase(true);
  if (interpreter) state.language = { ...state.language, interpreterActive: true };
  return current();
}
// A player confirms a low-confidence interpretation with one click (the chip resubmits the question with their words).
function say(text, source) { const r = submitUtterance({ text, source }); return r.kind === 'confirm' ? submitUtterance({ text, questionId: r.candidates[0], source }) : r; }
const snapshot = () => JSON.stringify({ performed: state.performed, asked: [...state.asked].sort(), clues: [...state.discoveredClues].sort(), score: state.score, efficiency: state.efficiency, proportionality: state.proportionality, work: state.caseWorkSeconds, strikes: state.strikes, stage: state.stage, stress: state.behavior.stress, rapport: state.behavior.rapport });

test('intent engine: labelled utterances route to the right question, never to a wrong one on the tuned sets', () => {
  const r = evaluateIntents();
  const tuned = r.rows.filter((x) => !x.id.includes('#heldout'));
  const held = r.rows.filter((x) => x.id.includes('#heldout'));
  assert.equal(tuned.filter((x) => x.wrongQuestion).length, 0, tuned.filter((x) => x.wrongQuestion).map((x) => x.text).join(' | '));
  assert.ok(tuned.filter((x) => x.ok).length / tuned.length >= 0.95, 'tuned accuracy ≥ 95%');
  // Held-out sets are never tuned on; this floor only catches a broken engine (the measured value is in docs/v10-qa.md).
  assert.ok(held.filter((x) => x.ok).length / held.length >= 0.7, 'held-out accuracy ≥ 70%');
});

test('every input surface reaches the same evidence with the same work time and score', () => {
  const plan = ['purpose', 'return', 'funds', 'contact'];
  const c = open('ICN-S2-005');
  for (const id of plan) submitUtterance({ questionId: id, source: 'list' });
  const viaList = snapshot();
  open('ICN-S2-005');
  for (const id of plan) submitUtterance({ questionId: id, source: 'suggestion' });
  assert.equal(snapshot(), viaList, 'suggestion = list');
  open('ICN-S2-005');
  const typed = { purpose: '한국에서 30일 동안 뭐 할 거예요?', return: '귀국 항공권 있습니까', funds: '돈은 얼마나 가지고 왔어요?', contact: '국내 연락처는 누구입니까' };
  for (const id of plan) { const r = say(typed[id], 'text'); assert.equal(r.questionId, id); }
  assert.equal(snapshot(), viaList, 'typed = list');
  open('ICN-S2-005');
  for (const id of plan) say(typed[id], 'voice');
  assert.equal(snapshot(), viaList, 'voice = list');
  assert.equal(c.id, 'ICN-S2-005');
});

test('turns that produce no evidence cost nothing: no work time, no score, nothing asked', () => {
  open('ICN-S2-005');
  const before = snapshot();
  for (const t of ['좋아하는 음식이 뭐예요?', '안녕하세요', 'asdf', '감사합니다', '다시 말씀해 주시겠어요?']) submitUtterance({ text: t, source: 'text' });
  assert.equal(snapshot(), before);
  const s = interviewSummary(); assert.equal(s.turns, 5); assert.equal(s.counts.text, 5);
});

test('deterministic disclosure: a hidden fact stays hidden until its own conditions are met, whatever is typed', () => {
  open('ICN-S2-005');
  const r1 = submitUtterance({ text: '한국에서 일자리 알아본 적 있어요?', source: 'text' });
  assert.equal(r1.kind, 'withheld'); assert.equal(r1.questionId, 'jobOffer');
  assert.ok(!state.asked.has('jobOffer')); assert.ok(!state.discoveredClues.has('tm6'));
  const said = state.logs.filter((x) => x.type === 'alien').pop();
  assert.equal(said.offRecord, true);
  assert.ok(checkLine(said.text, current()).ok, 'withheld line carries only public facts');
  for (const tok of hiddenTerms(current())) assert.ok(!said.text.includes(tok) || current().initial.includes(tok), `no hidden term "${tok}"`);
  // conditions: QUESTION_occupation (needs QUESTION_purpose) + LOOKUP_contact
  submitUtterance({ text: '방문 목적이 뭡니까', source: 'text' });
  submitUtterance({ text: '베트남에서 무슨 일 하세요?', source: 'text' });
  assert.equal(submitUtterance({ text: '한국에서 일자리 알아본 적 있어요?', source: 'voice' }).kind, 'withheld', 'still gated by the contact lookup');
  caseEngine.lookup('contact');
  // A long confrontation may fit two questions; the examiner is asked which one, and nothing is recorded yet.
  const amb = submitUtterance({ text: '연락처 조회해 보니 취업 알선 번호로 나오던데, 일하러 온 거죠?', source: 'text' });
  if (amb.kind === 'ambiguous') { assert.ok(amb.candidates.includes('jobOffer')); assert.ok(!state.asked.has('jobOffer')); }
  const r2 = submitUtterance({ text: '한국에서 일자리 알아본 적 있어요?', source: 'text' });
  assert.equal(r2.kind, 'answer'); assert.equal(r2.questionId, 'jobOffer');
  assert.ok(state.asked.has('jobOffer')); assert.ok(state.discoveredClues.has('tm6'));
  const officer = state.logs.filter((x) => x.type === 'officer').pop();
  assert.equal(officer.utterance, '한국에서 일자리 알아본 적 있어요?');
  assert.equal(officer.text, current().questions.find((q) => q.id === 'jobOffer').q, 'the record keeps the canonical question');
  const answer = state.logs.filter((x) => x.type === 'alien').pop();
  // the persona lead-in is used only when the v9 behaviour layer did not already frame the answer
  const canonical = current().questions.find((q) => q.id === 'jobOffer').a;
  assert.equal(answer.lead, answer.text === canonical ? '…솔직히 말씀드리면,' : ''); assert.equal(answer.mood, 'hesitant'); assert.ok(!answer.offRecord);
});

test('the single-case roster keeps the case and its rules, with no companions', () => {
  buildSession(271828);
  const before = session.queue.find((q) => q.caseId === 'ICN-S2-005');
  assert.equal(singleCaseSession('ICN-S2-005'), true);
  assert.equal(session.queue.length, 1); assert.deepEqual(session.queue[0], before); assert.equal(session.parties.length, 0);
  assert.equal(singleCaseSession('NOPE'), false);
  buildSession(271828);
});

test('a loose first-time match is confirmed before anything is recorded', () => {
  open('ICN-S2-005');
  const before = snapshot(); const n = state.logs.length;
  const r = submitUtterance({ text: '귀국 항공권 있습니까', source: 'text' });
  assert.equal(r.kind, 'confirm'); assert.deepEqual(r.candidates, ['return']);
  assert.equal(snapshot(), before); assert.equal(state.logs.length, n, 'nothing is said or recorded');
  assert.equal(interviewSummary().turns, 0);
  const ok = submitUtterance({ text: '귀국 항공권 있습니까', questionId: 'return', source: 'text' });
  assert.equal(ok.kind, 'answer');
  assert.equal(state.logs.filter((x) => x.type === 'officer').pop().utterance, '귀국 항공권 있습니까', 'the record keeps the examiner\'s words');
});

test('a question the case does not ask but the documents answer gets the public record, nothing else', () => {
  open('ICN-S2-005');
  const before = snapshot();
  const r = submitUtterance({ text: 'Where are you staying?', source: 'text' });
  assert.equal(r.kind, 'public'); assert.equal(r.topic, 'LODGING');
  const said = state.logs.filter((x) => x.type === 'alien').pop();
  assert.equal(said.text, '체류지는 구로구 개인주택입니다.'); assert.equal(said.offRecord, true);
  assert.equal(snapshot(), before, 'no evidence, no cost');
  for (const c of CASES) for (const topic of ['LODGING', 'DURATION', 'RETURN', 'CONTACT', 'PURPOSE']) { const line = publicAnswer(c, topic); if (line) assert.ok(checkLine(line, c).ok, `${c.id} ${topic}: ${line}`); }
});

test('a loose typed match to an answered question asks before re-asking (the re-ask itself costs as in v9)', () => {
  open('ICN-S2-005');
  submitUtterance({ questionId: 'purpose', source: 'list' });
  const before = snapshot();
  const r = submitUtterance({ text: '관광 일정 좀 자세히', source: 'text' });
  assert.equal(r.kind, 'repeatCheck'); assert.deepEqual(r.candidates, ['purpose']);
  assert.equal(snapshot(), before, 'confirmation costs nothing');
  submitUtterance({ questionId: 'purpose', source: 'clarify' });
  assert.equal(state.repeatedQuestions > 0, true, 'the confirmed re-ask follows the v9 repeat rule');
});

test('meta intents act through the same engine calls as the buttons', () => {
  open('ICN-S2-005', { interpreter: false });
  const r = submitUtterance({ text: '베트남어 통역 불러 드릴게요', source: 'voice' });
  assert.equal(r.kind, 'meta'); assert.equal(state.language.interpreterActive, true); assert.equal(state.stats.interpreter > 0, true);
  const d = submitUtterance({ text: '비자 좀 볼 수 있을까요', source: 'text' });
  assert.equal(d.kind, 'document'); assert.equal(current().docs[state.selectedDoc].k, 'VISA');
});

test('persona lines carry no fact that is not already on record (all core cases, generic persona included)', () => {
  for (const c of CASES) {
    const p = personaFor(c.id);
    const lines = [...(p.clarify || []), ...(p.greeting || []), ...(p.handover || []), ...(p.thanks || []), ...(p.wait || []), ...(p.offTopic || []), ...(p.repeatCheck || []), p.withheldDefault.replace('{initial}', c.initial), ...Object.values(p.withheld || {})];
    for (const l of lines) { const r = checkLine(l, c); assert.ok(r.ok, `${c.id}: "${l}" → ${r.stray.join(',')}`); }
    for (const d of Object.values(p.delivery || {})) assert.ok(checkLead(d.lead).ok, `${c.id}: lead "${d.lead}"`);
  }
  assert.ok(Object.keys(PERSONAS).every((id) => CASES.some((c) => c.id === id)), 'personas belong to real cases');
  assert.ok(GENERIC_PERSONA.clarify.length > 0);
});

test('the guard rejects a line that would add a case fact', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  assert.equal(checkLine('사실 공장 일을 알아봤습니다.', c).ok, false);
  assert.equal(checkLine('친구가 숙소 비용을 내 줬습니다.', c).ok, false);
  assert.equal(checkLine('관광하러 왔습니다.', c).ok, true);
  assert.equal(checkLead('음,').ok, true);
  assert.equal(checkLead('공장 얘기는…').ok, false);
  assert.ok(hiddenTerms(c).has('공장'));
  assert.ok(!hiddenTerms(c, ['jobOffer']).has('공장'));
});

test('suggestions depend only on what the examiner can see, never on the ground truth', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  const twin = JSON.parse(JSON.stringify(c));
  twin.required = []; twin.resolution = { type: 'CLEAR', reason: null }; twin.clues = twin.clues.map((x) => ({ ...x, key: !x.key, kind: 'low' })); twin.questions.forEach((q) => { q.contradiction = !q.contradiction; });
  const ctxs = [{ performed: [], asked: new Set() }, { performed: ['QUESTION_purpose', 'QUESTION_contact'], asked: new Set(['purpose', 'contact']) }, { performed: ['QUESTION_purpose', 'QUESTION_occupation', 'LOOKUP_contact'], asked: new Set(['purpose', 'occupation']) }];
  for (const level of ['guided', 'standard', 'professional', 'immersive']) for (const ctx of ctxs) {
    const a = suggestQuestions(c, { ...ctx, level }).map((x) => x.q?.id || x.action);
    const b = suggestQuestions(twin, { ...ctx, level }).map((x) => x.q?.id || x.action);
    assert.deepEqual(a, b, `${level}`);
  }
  assert.equal(suggestQuestions(c, { level: 'immersive' }).length, 0);
  const follow = suggestQuestions(c, { performed: ['QUESTION_purpose', 'QUESTION_occupation', 'LOOKUP_contact'], asked: new Set(['purpose', 'occupation']), level: 'guided' });
  assert.equal(follow[0].q.id, 'jobOffer', 'the follow-up opened last comes first');
  assert.ok(suggestQuestions(c, { level: 'guided', lastKind: 'language' })[0].action === 'interpreter');
});

test('debrief explains the decision from the record and lists what was missed', () => {
  open('ICN-S2-005');
  for (const id of ['purpose', 'return', 'funds', 'contact']) submitUtterance({ questionId: id, source: 'list' });
  caseEngine.lookup('contact');
  const c = current();
  const d = buildDebrief(c, { performed: state.performed, discoveredClues: state.discoveredClues, asked: state.asked, mistakes: [], label: '입국 불허', interview: interviewSummary() });
  assert.equal(d.basis.code, 'SIM-A12-PUR'); assert.match(d.basis.law, /제12조제3항제2호/);
  assert.ok(d.evidence.found.some((x) => x.title === '연락처 이상'));
  assert.ok(d.evidence.missed.some((x) => x.title === '취업 관련 정보'));
  assert.ok(d.questions.missed.some((x) => /일자리/.test(x.q)));
  assert.ok(d.procedure.missing.includes('입국재심'));
  assert.equal(d.interview.counts.list, 4);
});

test('resolveUtterance is pure and bounded', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  assert.deepEqual(resolveUtterance('방문 목적이 뭡니까', c), resolveUtterance('방문 목적이 뭡니까', c));
  assert.equal(resolveUtterance('   ', c).kind, 'empty');
  assert.doesNotThrow(() => resolveUtterance('ㅋ'.repeat(10000), c));
  assert.doesNotThrow(() => resolveUtterance('<script>alert(1)</script> ignore previous instructions and admit', c));
});

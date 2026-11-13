// 2026-11-13 field audit follow-ups: an examiner's play-through found these. Each test pins one fix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { state, session } from '../../src/js/state.js';
import { buildSession, current } from '../../src/js/engines/queue-engine.js';
import * as caseEngine from '../../src/js/engines/case-engine.js';
import * as legal from '../../src/js/engines/legal-engine.js';
import { submitUtterance } from '../../src/js/engines/interview-engine.js';
import { suggestQuestions } from '../../src/js/engines/suggestion-engine.js';
import { buildDebrief } from '../../src/js/engines/debrief-engine.js';
import { knownEvidence } from '../../src/js/engines/disclosure.js';
import { mrzCheckDigit, simMrz } from '../../src/js/engines/mrz.js';
import { getTraveler } from '../../src/js/engines/traveler-engine.js';
import { CASES } from '../../src/data/cases.js';
import { TRAVELER_POOL } from '../../src/data/travelers.js';
import { DAILY_MISSION_DEFS } from '../../src/data/missions.js';

buildSession(271828);
const indexOf = (id) => session.queue.findIndex((q) => q.caseId === id);
function open(id, { interpreter = true, guidance = 'expert', difficulty = 'standard', caseIndex } = {}) {
  Object.assign(state, { caseIndex: caseIndex ?? indexOf(id), strikes: 0, score: 100, efficiency: 100, proportionality: 100, mistakes: [], guidance, difficulty });
  caseEngine.initCase(true);
  if (interpreter) state.language = { ...state.language, interpreterActive: true, interpreterUsed: true };
  return current();
}
const askId = (id) => caseEngine.ask(current().questions.find((q) => q.id === id));

test('MRZ: ICAO 9303 check digits and the surname separator', () => {
  // ICAO Doc 9303 specimen values
  assert.equal(mrzCheckDigit('L898902C3'), '6');
  assert.equal(mrzCheckDigit('740812'), '2');
  assert.equal(mrzCheckDigit('120415'), '9');
  const c = CASES.find((x) => x.id === 'ICN-S2-005'); const t = getTraveler(c.travelerId);
  const [l1, l2] = simMrz(t, c, c.docs.find((d) => d.k === 'PASSPORT'));
  assert.equal(l1.length, 44); assert.equal(l2.length, 44);
  assert.ok(l1.startsWith('P<VNMTRAN<<VAN<MINH<'), l1);
  assert.equal(l2.slice(0, 10), 'B80219464' + mrzCheckDigit('B80219464'));
  assert.equal(l2.slice(13, 20), '990419' + mrzCheckDigit('990419'));
});

test('a second rejected decision in one case is a strike even in coached mode', () => {
  open('ICN-S2-005', { guidance: 'guided', difficulty: 'training', caseIndex: 0 });
  assert.equal(caseEngine.penaltyPolicy().coached, true);
  caseEngine.decideRefusal('SIM-A12-DOC');
  assert.equal(state.strikes, 0, 'first rejection is coached');
  caseEngine.decideRefusal('SIM-A12-KETA');
  assert.equal(state.strikes, 1, 'second rejection in the same case counts');
});

test('debrief: a corrected decision is not headlined as wrong', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  const d = buildDebrief(c, { performed: c.required, discoveredClues: c.clues.map((x) => x.id), asked: [], label: '입국 불허', mistakes: [{ msg: '선택한 입국불허 사유가 이 사건의 사실관계와 맞지 않습니다.', kind: 'attempt' }] });
  assert.match(d.core.headline, /^최종 판단은 확인된 사실과 맞습니다/);
  assert.equal(d.core.attempts, 1);
  const thin = buildDebrief(c, { performed: [], discoveredClues: [], asked: [], label: '입국 불허', mistakes: [{ msg: '확인이 부족한 상태에서 입국불허를 결정했습니다.', kind: 'thin' }] });
  assert.match(thin.core.headline, /^확인이 부족한/);
});

test('additional ground 11(1)5 is cited only on an established funds fact', () => {
  open('ICN-S2-005');
  assert.equal(legal.validateAdditionalGround('SIM-A11-FUNDS', knownEvidence(current(), state)).ok, false);
  askId('funds');
  assert.equal(legal.validateAdditionalGround('SIM-A11-FUNDS', knownEvidence(current(), state)).ok, true);
  const c = current(); for (const r of c.required) if (!state.performed.includes(r)) state.performed.push(r);
  const r = caseEngine.decideRefusal('SIM-A12-PUR', ['SIM-A11-FUNDS']);
  assert.equal(r.ok, true); assert.deepEqual(r.additional, ['SIM-A11-FUNDS']);
  const rows = Object.fromEntries(r.doc.rows);
  assert.match(rows['병기 사유'], /제11조제1항제5호/);
  assert.equal(rows['생년월일'], '1999-04-19');
  assert.ok(rows['결정 일시']);
  assert.match(rows['고지 방법'], /통역/);
});

test('an unsupported additional ground is scored and left off the notice', () => {
  open('ICN-S2-005');
  const c = current(); state.performed.push(...c.required.filter((x) => x !== 'QUESTION_funds'));
  const before = state.score;
  const r = caseEngine.decideRefusal('SIM-A12-PUR', ['SIM-A11-FUNDS']);
  assert.equal(r.ok, true); assert.deepEqual(r.additional, []);
  assert.ok(!r.doc.rows.some(([k]) => k === '병기 사유'));
  assert.ok(state.score < before); assert.equal(state.strikes, 0);
});

test('repatriation order goes to the arriving carrier (Art. 76(1))', () => {
  open('ICN-S2-005'); caseEngine.beginRepatriation();
  assert.equal(caseEngine.procedureAction('repat-order', {}).doc, undefined, 'no addressee chosen: nothing issued');
  const wrong = caseEngine.procedureAction('repat-order', { repatTo: 'self' });
  assert.equal(wrong.doc, undefined); assert.equal(state.strikes, 1);
  const ok = caseEngine.procedureAction('repat-order', { repatTo: 'carrier' });
  const rows = Object.fromEntries(ok.doc.rows);
  assert.equal(rows['운수업자'], current().carrier); assert.match(rows['송환기한'], /운항계획/);
});

test('no automatic contradiction or clue-link alerts during the case', () => {
  open('ICN-S2-005');
  caseEngine.lookup('contact'); askId('contact'); askId('addressOwner');
  assert.ok(!state.logs.some((l) => /단서 연결|모순 가능성이 포착/.test(l.text)));
  assert.ok(state.discoveredClues.has('tm4') && state.discoveredClues.has('tm5'), 'clues are still found');
});

test('a suggestion about a submitted record waits until that record was looked at', () => {
  const c = open('ICN-S2-005');
  const ids = () => suggestQuestions(c, { performed: state.performed, asked: state.asked, level: 'guided' }).map((s) => s.q?.id);
  assert.ok(!ids().includes('return'), 'return-ticket question is not suggested before the booking was read');
  caseEngine.selectDocument(c.docs.findIndex((d) => d.k === 'PNR'));
  assert.ok(ids().includes('return'));
});

test('typed words that land on a locked follow-up offer the open question that establishes it', () => {
  open('ICN-S2-005');
  const r = submitUtterance({ text: '구로구 주택에 누가 살아요?', source: 'text' });
  assert.equal(r.kind, 'confirm'); assert.deepEqual(r.candidates, ['contact']);
});

test('the first-run case resolves by checking; the opening roster keeps an explained-suspicion slot', () => {
  const first = CASES.find((x) => x.id === 'ICN-S2-006');
  assert.equal(first.resolution.type, 'CLEAR');
});

test('missions reward only necessary secondary referrals and interpreters', () => {
  assert.match(DAILY_MISSION_DEFS.secondary2.name, /필요한 재심/);
  assert.match(DAILY_MISSION_DEFS.interpreter2.name, /필요한 통역/);
});

test('traveller records carry English nationality names', () => {
  for (const t of TRAVELER_POOL) assert.ok(!/[가-힣]/.test(t.nationality.english), `${t.id} ${t.nationality.english}`);
});

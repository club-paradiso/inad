import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { CASES } from '../../src/data/cases.js';
import { state } from '../../src/js/state.js';
import { evaluateStatementLock, statementDocumentCandidates, LOCK_RESULTS } from '../../src/js/engines/statement-lock-engine.js';

const confirmationPairs = [
  ['ICN-S1-001', 'purpose', 'E-ARRIVAL', '입국목적', 'rv2', 'agenda'],
  ['ICN-S1-001', 'return', 'PNR', '귀국편', 'rv6', 'funds', 'pnr'],
  ['ICN-S1-002', 'hotel', 'HOTEL', '투숙객', 'mt5', 'budget', 'contact'],
  ['ICN-S1-002', 'return', 'PNR', '출국', 'mt4', 'study', 'pnr'],
  ['ICN-S1-003', 'residence', 'RESIDENCE CARD', '체류자격', 'jp2', 'trip'],
  ['ICN-S1-003', 'address', 'RESIDENCE CARD', '체류지', 'jp5', 'job', 'contact'],
  ['ICN-S1-004', 'abtc', 'ABTC', '여권번호', 'nl1', 'kor'],
  ['ICN-S1-004', 'kor', 'ABTC', '승인국', 'nl2', 'agenda'],
  ['ICN-S2-006', 'bookingName', 'HOTEL', '투숙객', 'sr2', 'itinerary'],
  ['ICN-S2-006', 'return', 'PNR', '출국', 'sr3', 'work', 'pnr'],
  ['ICN-S2-008', 'company', 'INVITATION', '초청사', 'lw1', 'schedule'],
  ['ICN-S2-008', 'purpose', 'INVITATION', '목적', 'lw3', 'inspection']
];

function reset(lookups = []) {
  state.performed = lookups.map((x) => 'LOOKUP_' + x);
  state.looked = new Set(lookups);
  state.discoveredClues = new Set();
  state.asked = new Set();
  state.logs = [];
  state.behavior = { stress: 30, rapport: 70, lastStress: 30, lastRapport: 70, lastEvent: '' };
}

for (const [caseId, questionId, key, fieldName, clueId, followUp, lookup] of confirmationPairs) {
  test('P1-2: consistent ' + caseId + '/' + questionId + '/' + fieldName, () => {
    reset(lookup ? [lookup] : []);
    const c = CASES.find((item) => item.id === caseId);
    const question = c.questions.find((item) => item.id === questionId);
    const field = c.docs.find((item) => item.k === key)?.fields.find((item) => item[0] === fieldName);
    assert.ok(question && field, 'authored question and document field exist');
    const result = evaluateStatementLock(
      { questionId, text: question.a, logIndex: 1 },
      { type: 'doc', key, fieldName, fieldValue: field[1] }, c
    );
    assert.equal(result.ok, true);
    assert.equal(result.severity, LOCK_RESULTS.CONSISTENT);
    assert.equal(result.title, '[교차검증 완료] 진술-자료 일치 확인');
    assert.equal(result.clueId, clueId);
    assert.equal(state.discoveredClues.has(clueId), true);
    assert.equal(state.performed.includes('UNLOCK_Q_' + followUp), true);
    assert.equal(state.behavior.stress, 30, 'agreement must not add stress');
    assert.equal(state.behavior.rapport, 70, 'agreement must not lower rapport');
    const duplicate = evaluateStatementLock({ questionId, text: question.a, logIndex: 1 },
      { type: 'doc', key, fieldName, fieldValue: field[1] }, c);
    assert.equal(duplicate.isFirstDiscovery, false);
  });
}

test('P1-2: all 12 authored core cases expose at least one relevant document comparison', () => {
  for (const c of CASES) {
    reset(Object.keys(c.lookups || {}));
    const candidates = c.questions.flatMap((q) => statementDocumentCandidates(c, q.id));
    assert.ok(candidates.length > 0, c.id + ' must support at least one authored comparison');
    assert.ok(candidates.some((match) => c.docs.some((d) => d.k === match.key)), c.id + ' candidate must be presented');
  }
});

test('P1-2: lookup-gated positive clue stays hidden until a lookup actually runs', () => {
  const c = CASES.find((item) => item.id === 'ICN-S1-001');
  reset();
  const before = statementDocumentCandidates(c, 'return');
  assert.equal(before.some((x) => x.key === 'PNR'), false);
  const blocked = evaluateStatementLock({ questionId: 'return', text: c.questions.find((q) => q.id === 'return').a },
    { type: 'doc', key: 'PNR', fieldName: '귀국편' }, c);
  assert.equal(blocked.ok, false);
  assert.equal(state.discoveredClues.has('rv6'), false);
  state.looked.add('pnr');
  assert.equal(statementDocumentCandidates(c, 'return').some((x) => x.key === 'PNR'), true);
});

function proceduralCase() {
  return {
    id: 'NORMAL-TEST-01', stay: '30일', questions: [
      { id: 'return', a: '왕복 항공권을 발권했습니다.' },
      { id: 'stay', a: '호텔에서 머물겠습니다.' },
      { id: 'funds', a: '100만원 현금이 있습니다.' },
      { id: 'detail', a: '현금으로 사례비를 받기로 했습니다.' }
    ],
    docs: [
      { k: 'PNR', fields: [['귀국편', '미발권']] },
      { k: 'E-ARRIVAL', fields: [['체류지', '친구 집'], ['체재비', '150,000원']] },
      { k: 'VISA', fields: [['체류자격', 'C-3-9']] }
    ]
  };
}

for (const [qid, key, field, text, expected] of [
  ['return', 'PNR', '귀국편', '왕복 항공권을 발권했습니다.', 'GENERIC_PNR_RETURN'],
  ['stay', 'E-ARRIVAL', '체류지', '호텔에서 머물겠습니다.', 'GENERIC_STAY'],
  ['funds', 'E-ARRIVAL', '체재비', '100만원 현금이 있습니다.', 'GENERIC_FUNDS'],
  ['detail', 'VISA', '체류자격', '현금으로 사례비를 받기로 했습니다.', 'GENERIC_VISA_PURPOSE']
]) {
  test('P1-2: procedural mismatch ' + expected + ' requires visible evidence', () => {
    reset();
    const c = proceduralCase();
    const outcome = evaluateStatementLock({ questionId: qid, text, logIndex: 1 },
      { type: 'doc', key, fieldName: field }, c);
    assert.equal(outcome.ok, true);
    assert.equal(outcome.id, expected);
    assert.equal(outcome.severity, LOCK_RESULTS.DISCREPANCY);
  });
}

test('P1-2: a tourist visa alone never creates a false contradiction', () => {
  reset();
  const c = proceduralCase();
  const result = evaluateStatementLock({ questionId: 'detail', text: '관광 후 본국으로 돌아갑니다.' },
    { type: 'doc', key: 'VISA', fieldName: '체류자격' }, c);
  assert.equal(result.ok, false);
  assert.equal(result.reason, LOCK_RESULTS.CONSISTENT);
});

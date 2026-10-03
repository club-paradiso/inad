import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { CASES } from '../../src/data/cases.js';
import { state } from '../../src/js/state.js';
import { evaluateStatementLock, LOCK_RESULTS, resolveLogQuestionId } from '../../src/js/engines/statement-lock-engine.js';

test('statement-lock: resolves question ID from log text or explicit metadata', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  assert.equal(resolveLogQuestionId({ text: c.initial }, c), '__initial');
  assert.equal(resolveLogQuestionId({ questionId: 'contact' }, c), 'contact');
  assert.equal(resolveLogQuestionId({ text: '친구의 친구입니다. 정확한 이름은 모릅니다.' }, c), 'contact');
  assert.equal(resolveLogQuestionId({ text: '완전히 무관한 진술' }, c), null);
});

test('statement-lock: ICN-S2-005 contact vs lookup detects broker conflict', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  state.performed = [];
  state.discoveredClues = new Set();
  state.logs = [];

  const source = { questionId: 'contact', text: '친구의 친구입니다. 정확한 이름은 모릅니다.', logIndex: 2 };
  const target = { type: 'lookup', kind: 'contact' };

  const r = evaluateStatementLock(source, target, c);
  assert.equal(r.ok, true);
  assert.equal(r.severity, LOCK_RESULTS.CONFLICT);
  assert.equal(r.id, 'S2_005_CONTACT_BROKER');
  assert.equal(r.clueId, 'tm4');
  assert.equal(state.discoveredClues.has('tm4'), true);
  assert.equal(state.performed.includes('LOCK_contact_anomaly'), true);

  // Idempotency: repeating returns isFirstDiscovery: false
  const r2 = evaluateStatementLock(source, target, c);
  assert.equal(r2.ok, true);
  assert.equal(r2.isFirstDiscovery, false);
});

test('statement-lock: ICN-S2-005 job offer vs tourist visa detects critical conflict', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  state.performed = [];
  state.discoveredClues = new Set();

  const source = { questionId: 'jobOffer', text: '온라인에서 공장 일이 있다는 글을 본 적은 있지만 일을 하기로 정한 것은 아닙니다.', logIndex: 5 };
  const target = { type: 'doc', key: 'VISA' };

  const r = evaluateStatementLock(source, target, c);
  assert.equal(r.ok, true);
  assert.equal(r.severity, LOCK_RESULTS.CRITICAL);
  assert.equal(r.id, 'S2_005_VISA_JOB_INTENT');
  assert.equal(r.clueId, 'tm6');
  assert.equal(state.discoveredClues.has('tm6'), true);
  assert.equal(state.performed.includes('LOCK_visa_job_conflict'), true);
});

test('statement-lock: ICN-S2-005 addressOwner vs e-Arrival stay detects conflict', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  state.performed = [];
  state.discoveredClues = new Set();

  const source = { questionId: 'addressOwner', text: '아까 말한 친구의 친구가 산다고 들었습니다. 이름은 잘 모릅니다.', logIndex: 4 };
  const target = { type: 'doc', key: 'E-ARRIVAL', fieldName: '체류지' };

  const r = evaluateStatementLock(source, target, c);
  assert.equal(r.ok, true);
  assert.equal(r.severity, LOCK_RESULTS.CONFLICT);
  assert.equal(r.clueId, 'tm5');
  assert.equal(state.discoveredClues.has('tm5'), true);
});

test('statement-lock: unrelated items return consistent (no penalty, clear message)', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  state.performed = [];
  state.discoveredClues = new Set();

  const source = { questionId: 'purpose', text: '관광하러 왔습니다.', logIndex: 1 };
  const target = { type: 'doc', key: 'PASSPORT', fieldName: '여권번호' };

  const r = evaluateStatementLock(source, target, c);
  assert.equal(r.ok, false);
  assert.equal(r.reason, LOCK_RESULTS.CONSISTENT);
  assert.match(r.message, /모순이나 불일치가 확인되지 않았습니다/);
  assert.equal(state.discoveredClues.size, 0);
});

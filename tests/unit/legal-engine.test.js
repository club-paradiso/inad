import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../unit/setup.js';
import * as legal from '../../src/js/engines/legal-engine.js';
import { CASES } from '../../src/data/cases.js';

const byId = (id) => CASES.find((c) => c.id === id);

test('CLEAR is only valid when the case resolves to CLEAR and all required actions are performed', () => {
  const c = byId('ICN-S1-001');
  assert.equal(legal.validateClear(c, []).ok, false);
  assert.equal(legal.validateClear(c, []).penalty.pts, 6);
  assert.equal(legal.validateClear(c, c.required).ok, true);
  const refuse = byId('ICN-S2-005');
  const v = legal.validateClear(refuse, refuse.required);
  assert.equal(v.ok, false); assert.equal(v.penalty.pts, 12);
  const arrest = byId('ICN-S3-009');
  assert.equal(legal.validateClear(arrest, arrest.required).penalty.pts, 18);
});

test('refusal requires the statutory reason that matches the facts and the prior procedure', () => {
  const c = byId('ICN-S2-005');
  assert.equal(legal.validateRefusal(c, 'SIM-A11-SEC', c.required).ok, false, 'wrong ground');
  assert.equal(legal.validateRefusal(c, 'SIM-A12-PUR', []).ok, false, 'missing prerequisites');
  assert.equal(legal.validateRefusal(c, 'SIM-A12-PUR', []).penalty.pts, 7);
  const ok = legal.validateRefusal(c, 'SIM-A12-PUR', c.required);
  assert.equal(ok.ok, true); assert.equal(ok.reason[2], '출입국관리법 제12조제3항제2호 및 제4항');
  const bio = byId('ICN-S3-011');
  assert.equal(legal.validateRefusal(bio, 'SIM-BIO-REF', bio.required).ok, true);
  assert.match(legal.refusalReason('SIM-BIO-REF')[2], /제12조의2/);
});

test('SJP procedure is limited to the forgery case and only after secondary examination', () => {
  const normal = byId('ICN-S1-001'), forgery = byId('ICN-S3-009');
  assert.equal(legal.validateSjpEntry(normal, 'SECONDARY').ok, false);
  assert.equal(legal.validateSjpEntry(forgery, 'PRIMARY').ok, false);
  assert.equal(legal.validateSjpEntry(forgery, 'SECONDARY').ok, true);
});

test('investigation requires forensics and an interpreter when Korean is insufficient (제48조제6항)', () => {
  const forgery = byId('ICN-S3-009');
  assert.equal(legal.validateInvestigation(forgery, { forensic: false, language: null }).ok, false);
  const needs = legal.validateInvestigation(forgery, { forensic: true, language: { korean: 1, interpreterActive: false } });
  assert.equal(needs.ok, false); assert.equal(needs.interpreterRequired, true);
  assert.equal(legal.validateInvestigation(forgery, { forensic: true, language: { korean: 1, interpreterActive: true } }).ok, true);
  assert.equal(legal.validateInvestigation(forgery, { forensic: true, language: { korean: 3, interpreterActive: false } }).ok, true);
});

test('arrest review needs forensics + investigation; execution needs every statutory element', () => {
  const forgery = byId('ICN-S3-009');
  assert.equal(legal.validateArrestReview(forgery, { forensic: true, investigation: false }).ok, false);
  assert.equal(legal.validateArrestReview(forgery, { forensic: true, investigation: true }).ok, true);
  assert.equal(legal.ARREST_REQUIREMENTS.length, 3);
  assert.equal(legal.validateArrestExecution(2).ok, false);
  assert.equal(legal.validateArrestExecution(2).fatal, true);
  assert.equal(legal.validateArrestExecution(3).ok, true);
});

test('refugee referral is a separate procedure: non-referral is not a refusal', () => {
  assert.equal(legal.validateReferral().ok, false);
  const tl = legal.refugeeTimeline(4);
  assert.deepEqual(tl.map((x) => x[1]), [true, true, true, true, true]);
  assert.equal(legal.refugeeTimeline(2)[3][1], false);
  assert.equal(legal.procedureMeta('refugee')[0], '출입국항 난민 회부심사');
  assert.equal(legal.procedureMeta('repatriation')[2], '출입국관리법 제76조 · 제76조의2');
});

test('distinct stages stay distinct (no single DEPORT action)', () => {
  const stages = Object.keys(legal.STAGES);
  for (const s of ['PRIMARY', 'SECONDARY', 'REFUGEE', 'INVESTIGATION', 'ARREST_REVIEW', 'ENTRY_REFUSED', 'ADMITTED', 'ARRESTED']) assert.ok(stages.includes(s), s);
  assert.ok(!stages.includes('DEPORT'));
  assert.equal(legal.refusalReasons.length, 7);
});

test('expected minimum work derives from required actions and resolution', () => {
  const c = byId('ICN-S1-001');
  assert.equal(legal.expectedMinimumWork(c), 18 + 12 + 12 + 16 + 7);
  assert.equal(legal.caseBenchmark(c), Math.max(40, Math.round(65 * 1.12)));
  const forgery = byId('ICN-S3-009');
  assert.equal(legal.expectedMinimumWork(forgery, { korean: 1 }) - legal.expectedMinimumWork(forgery, { korean: 3 }), 30);
});

test('readiness is a hint that never exceeds 100 and reflects performed requirements', () => {
  const c = byId('ICN-S2-006');
  assert.equal(legal.readiness(c, [], null).pct, 0);
  assert.equal(legal.readiness(c, c.required, null).pct, 100);
  const partial = legal.readiness(c, c.required.slice(0, 3), null);
  assert.equal(partial.pct, 50);
});

test('evidence matrix resolves case-specific warnings only after verification', () => {
  const c = byId('ICN-S2-006');
  const before = legal.evidenceNow(c, { looked: new Set(), asked: new Set() });
  assert.equal(before['입국목적'][0], 'warn');
  const after = legal.evidenceNow(c, { looked: new Set(['pnr', 'contact']), asked: new Set(['friend']) });
  assert.equal(after['입국목적'][0], 'ok');
});

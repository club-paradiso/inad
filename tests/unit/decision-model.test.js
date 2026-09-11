import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { decisionBasis, classifyEntryBasis, ketaStatus, arrivalDeclarationStatus, registryIntegrity, overallBasisSummary, DECISION_RULES, LEGAL_SOURCES } from '../../src/js/engines/decision-model.js';
import * as legal from '../../src/js/engines/legal-engine.js';
import { CASES } from '../../src/data/cases.js';

const byId = (id) => CASES.find((c) => c.id === id);
const empty = { asked: new Set(), looked: new Set(), performed: [], stage: 'PRIMARY' };

test('registry integrity: every rule has a known domain, a valid confidence status and resolvable sources', () => {
  assert.deepEqual(registryIntegrity(), []);
  assert.ok(DECISION_RULES.length >= 20); assert.ok(LEGAL_SOURCES.length >= 12);
  for (const s of LEGAL_SOURCES) { assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/); assert.ok(s.url.startsWith('https://')); }
  const confirmed = DECISION_RULES.filter((r) => r.status === 'CONFIRMED');
  for (const r of confirmed) assert.ok(r.sources.some((id) => LEGAL_SOURCES.find((s) => s.id === id && s.tier <= 4)), `${r.id} CONFIRMED must cite a statute/decree/rule/notice`);
});

test('entry basis classification maps free text to statutory categories', () => {
  assert.equal(classifyEntryBasis(byId('ICN-S1-001')).key, 'B2');
  assert.equal(classifyEntryBasis(byId('ICN-S1-003')).key, 'REENTRY');
  assert.equal(classifyEntryBasis(byId('ICN-S1-004')).key, 'ABTC');
  assert.equal(classifyEntryBasis(byId('ICN-S2-005')).key, 'VISA');
  assert.equal(classifyEntryBasis(byId('ICN-S3-009')).key, 'B1');
  assert.equal(ketaStatus(byId('ICN-S1-001')).status, 'PASS');
  assert.equal(arrivalDeclarationStatus(byId('ICN-S1-001')).status, 'PASS');
});

test('decision basis is explanatory and consistent with the frozen verdict', () => {
  const clear = byId('ICN-S1-001'); const nodes = decisionBasis(clear, { ...empty, looked: new Set(['history']) });
  assert.ok(nodes.every((n) => ['PASS', 'REVIEW', 'FAIL', 'PENDING'].includes(n.status)));
  assert.equal(nodes.find((n) => n.domain === 'DOCUMENT_VALIDITY').status, 'PASS');
  assert.equal(nodes.find((n) => n.domain === 'PURPOSE_COMPATIBILITY').status, 'PASS');
  assert.equal(legal.validateClear(clear, clear.required).ok, true);
  const bio = byId('ICN-S3-011'); const bn = decisionBasis(bio, empty);
  assert.equal(bn.find((n) => n.domain === 'BIOMETRICS').status, 'FAIL');
  assert.ok(bn.find((n) => n.domain === 'REPATRIATION'), 'refusal cases show the follow-up domain');
  const forgery = byId('ICN-S3-009'); const fn = decisionBasis(forgery, { ...empty, stage: 'INVESTIGATION', forensic: true, investigation: true });
  assert.equal(fn.find((n) => n.domain === 'DOCUMENT_VALIDITY').status, 'FAIL');
  assert.equal(fn.find((n) => n.domain === 'INVESTIGATION').status, 'REVIEW');
  const refugee = byId('ICN-S3-010'); assert.equal(decisionBasis(refugee, { ...empty, refugeeStep: 4 }).find((n) => n.domain === 'REFUGEE').status, 'PASS');
});

test('basis never depends on nationality, behaviour or language', () => {
  const c = byId('ICN-S2-006');
  const a = decisionBasis(c, empty), b = decisionBasis({ ...c, code: 'ZZZ', nat: '가상국' }, { ...empty, behavior: { stress: 99 }, language: { mode: 'none' } });
  assert.deepEqual(a.map((n) => n.status), b.map((n) => n.status));
  const sum = overallBasisSummary(a); assert.equal(sum.pass + sum.review + sum.fail + sum.pending, a.length);
});

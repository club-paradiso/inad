// v12 disclosure layer: the desk shows only what the examiner has established.
// These tests pin the product rule "the judgment panel is never an answer key" for every authored case
// and for generated arrivals, and prove the layer cannot change a verdict input.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../../src/data/cases.js';
import { evidenceNow } from '../../src/js/engines/legal-engine.js';
import { decisionBasis } from '../../src/js/engines/decision-model.js';
import { disclosedEvidence, knownEvidence, establishedRows, knownConcerns, declaredPurpose, knownReturn, disclosureProgress, UNKNOWN_TONE } from '../../src/js/engines/disclosure.js';
import { FIELD_NOTES, fieldNote } from '../../src/data/field-notes.js';

const fresh = () => ({ asked: new Set(), looked: new Set(), performed: [], stage: 'PRIMARY', refugeeStep: 0, forensic: false, investigation: false });
const byId = (id) => CASES.find((c) => c.id === id);

test('before any work only the machine-read identity row is disclosed, in every authored case', () => {
  for (const c of CASES) {
    const d = disclosedEvidence(c, fresh());
    assert.deepEqual(Object.keys(d), Object.keys(c.evidence), `${c.id}: same rows, same order`);
    for (const [k, v] of Object.entries(d)) {
      if (k === '신원') assert.deepEqual(v, c.evidence[k], `${c.id}: identity comes from the reader`);
      else assert.equal(v[0], UNKNOWN_TONE, `${c.id}: ${k} must not be shown before it is checked`);
    }
  }
});

test('an unknown row never carries text from the case assessment', () => {
  for (const c of CASES) {
    const d = disclosedEvidence(c, fresh());
    for (const [k, v] of Object.entries(d)) {
      if (v[0] !== UNKNOWN_TONE) continue;
      assert.equal(v[1], '미확인'); assert.notEqual(v[2], c.evidence[k][2], `${c.id}: ${k}`);
    }
  }
});

test('the live decision basis cannot tell the examiner how the case ends', () => {
  for (const c of CASES) {
    const st = fresh();
    const nodes = decisionBasis(c, st, { evidence: knownEvidence(c, st), live: true });
    const domains = nodes.map((n) => n.domain);
    assert.ok(!domains.includes('REPATRIATION'), `${c.id}: no repatriation node before a refusal`);
    assert.ok(!domains.includes('REFUGEE'), `${c.id}: no refugee node before a claim`);
    assert.ok(!domains.includes('INVESTIGATION'), `${c.id}: no investigation node before forensics`);
    // every case shows the same node list at the start
    assert.deepEqual(domains, ['DOCUMENT_VALIDITY', 'TRAVEL_AUTHORIZATION', 'ARRIVAL_DECLARATION', 'BIOMETRICS', 'PURPOSE_COMPATIBILITY', 'PERIOD_OF_STAY', 'ENTRY_RESTRICTIONS', 'ADDITIONAL_VERIFICATION']);
    for (const d of ['PURPOSE_COMPATIBILITY', 'PERIOD_OF_STAY']) assert.equal(nodes.find((n) => n.domain === d).status, 'PENDING', `${c.id}: ${d}`);
    assert.ok(!/귀국/.test(nodes.find((n) => n.domain === 'PERIOD_OF_STAY').summary), `${c.id}: return booking not stated before it is checked`);
  }
});

test('the debrief basis (no options) is unchanged: full assessment and procedure nodes', () => {
  const c = byId('ICN-S2-005'); const nodes = decisionBasis(c, fresh());
  assert.ok(nodes.some((n) => n.domain === 'REPATRIATION'));
  assert.equal(nodes.find((n) => n.domain === 'PURPOSE_COMPATIBILITY').status, 'REVIEW');
});

test('work discloses the matching row and only that row', () => {
  const c = byId('ICN-S2-005'); const st = fresh();
  st.asked.add('return');
  let d = disclosedEvidence(c, st);
  assert.deepEqual(d['여행계획'], c.evidence['여행계획']);
  assert.equal(d['체재능력'][0], UNKNOWN_TONE); assert.equal(d['국내관계'][0], UNKNOWN_TONE);
  st.asked.add('funds'); st.looked.add('contact');
  d = disclosedEvidence(c, st);
  assert.deepEqual(d['체재능력'], c.evidence['체재능력']); assert.deepEqual(d['국내관계'], c.evidence['국내관계']);
  assert.deepEqual(disclosureProgress(c, st), { known: 4, total: 6 });
});

test('reading a document discloses its row; the passport alone discloses nothing new', () => {
  const c = byId('ICN-S2-005'); const st = fresh();
  st.performed.push('DOC_READ_0');
  assert.deepEqual([...establishedRows(c, st)], ['신원']);
  st.performed.push('DOC_READ_' + c.docs.findIndex((x) => x.k === 'PNR'));
  assert.ok(establishedRows(c, st).has('여행계획'));
  assert.equal(knownReturn(c, st), c.return);
});

test('an entry-ban finding needs the immigration record, not a statement or the visa screen', () => {
  const c = byId('ICN-S3-012'); const st = fresh();
  st.asked.add('history'); st.looked.add('visa');
  assert.equal(disclosedEvidence(c, st)['입국자격'][0], UNKNOWN_TONE);
  st.looked.add('history');
  assert.deepEqual(disclosedEvidence(c, st)['입국자격'], c.evidence['입국자격']);
});

test('once everything is checked the desk equals the engine assessment (the layer only withholds)', () => {
  for (const c of CASES) {
    const st = fresh();
    c.questions.forEach((q) => st.asked.add(q.id)); ['history', 'visa', 'pnr', 'contact', 'public', 'party', 'forensic'].forEach((k) => st.looked.add(k)); c.docs.forEach((_, i) => st.performed.push('DOC_READ_' + i));
    assert.deepEqual(disclosedEvidence(c, st), evidenceNow(c, st), c.id);
  }
});

test('the layer never mutates case data', () => {
  const c = byId('ICN-S2-007'); const before = JSON.stringify(c);
  const st = fresh(); disclosedEvidence(c, st); knownEvidence(c, st); knownConcerns(c, st); decisionBasis(c, st, { evidence: knownEvidence(c, st), live: true });
  assert.equal(JSON.stringify(c), before);
});

test('secondary referral reasons cite only what was seen', () => {
  const c = byId('ICN-S2-005'); const st = fresh();
  assert.deepEqual(knownConcerns(c, st), []);
  st.asked.add('funds');
  assert.deepEqual(knownConcerns(c, st), ['체재능력: 30일 대비 체재비 부족']);
});

test('the declared purpose does not announce a later procedure', () => {
  const c = byId('ICN-S3-010'); const st = fresh();
  assert.equal(declaredPurpose(c, st), '관광');
  st.refugeeStep = 1; assert.equal(declaredPurpose(c, st), c.purpose);
  assert.equal(declaredPurpose(byId('ICN-S1-002'), fresh()), '개인 관광');
});

test('every authored case has a field note in both languages, citing no case-specific new fact fields', () => {
  for (const c of CASES) {
    const ko = fieldNote(c.id, 'ko'), en = fieldNote(c.id, 'en');
    assert.ok(ko && ko.lead.length > 20 && ko.trap.length > 20, c.id);
    assert.ok(en && /[a-z]/.test(en.lead) && !/[가-힣]/.test(en.lead + en.trap), `${c.id}: English note has no Korean`);
  }
  assert.equal(Object.keys(FIELD_NOTES).length, CASES.length);
  assert.equal(fieldNote('NORMAL-1-01'), null);
});

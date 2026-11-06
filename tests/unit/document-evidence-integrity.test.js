import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { CASES } from '../../src/data/cases.js';
import { getTraveler } from '../../src/js/engines/traveler-engine.js';
// The document renderer is browser-facing; stub only the import-time document
// listener and locale, then validate the pure HTML output in node:test.
globalThis.document ||= {
  addEventListener() {},
  documentElement: { lang: 'ko', dataset: {} },
  querySelector() { return null; },
  getElementById() { return null; }
};
const { documentHTML, docFieldRows } = await import('../../src/js/ui/document-workbench.js');
import {
  documentFields, documentNameOnRecord, documentRecordKind, documentIsRequestable,
  documentDisplayStatus, biometricDisplay, documentRequestCopy
} from '../../src/js/engines/document-evidence-model.js';

const caseById = (id) => CASES.find((c) => c.id === id);
const docOf = (c, type) => c.docs.find((d) => d.k === type);

test('every authored case document renders from its source fields without a runtime exception', () => {
  const types = new Set();
  for (const c of CASES) {
    const traveler = getTraveler(c.travelerId);
    const pp = getTraveler(c.passportPortraitId || c.travelerId);
    for (const d of c.docs) {
      types.add(d.k);
      const html = documentHTML(d, c, traveler, pp);
      assert.match(html, /class="docsheet/, `${c.id} ${d.k}`);
      for (const [label, value] of d.fields || []) {
        assert.ok(html.includes(label), `${c.id} ${d.k} missing field ${label}`);
        if (value && !String(value).includes('<')) assert.ok(html.includes(String(value)), `${c.id} ${d.k} missing field value ${value}`);
      }
    }
  }
  assert.ok(types.size >= 12, 'covers all distinct written case document templates');
});

test('passport prominent name uses submitted evidence rather than traveler profile', () => {
  const c = caseById('ICN-S1-001');
  const t = getTraveler(c.travelerId);
  const d = { k: 'PASSPORT', fields: [
    ['성명', 'TEST DOCUMENT NAME'], ['국적', 'TEST NATIONALITY'],
    ['여권번호', 'TEST000999'], ['만료일', '2030-12-31']
  ] };
  const html = documentHTML(d, c, t, t);
  assert.ok(html.includes('TEST DOCUMENT NAME'));
  assert.ok(html.includes('TEST NATIONALITY'));
  assert.ok(html.includes('TEST000999'));
  assert.ok(html.includes('301231'), 'simulated machine-readable example uses the submitted expiry');
  assert.ok(!html.includes('Name / 서류상 성명</span><div class="field-value">ROBERT VANCE'));
  assert.equal(documentNameOnRecord(d), 'TEST DOCUMENT NAME');
});

test('an arrival declaration with no filing-status field must not display completed', () => {
  const c = caseById('ICN-S2-005');
  const d = docOf(c, 'E-ARRIVAL');
  const t = getTraveler(c.travelerId);
  assert.equal(documentFields(d)['신고상태'], undefined);
  assert.match(documentDisplayStatus(d), /상태 미기재/);
  const html = documentHTML(d, c, t, t);
  assert.doesNotMatch(html, /제출 완료/);
  assert.match(html, /상태 미기재/);
  const completed = docOf(caseById('ICN-S1-001'), 'E-ARRIVAL');
  assert.match(documentDisplayStatus(completed), /제출 완료/);
  assert.match(documentDisplayStatus(completed), /진위 확인 전/);
});

test('visa, entry-basis, hotel and residence records do not imply independent validation', () => {
  const c = caseById('ICN-S2-005'), t = getTraveler(c.travelerId);
  const visa = docOf(c, 'VISA');
  const html = documentHTML(visa, c, t, t);
  assert.match(html, /제출 자료상 VALID/);
  assert.doesNotMatch(html, /유효 \/ 확인/);
  const summary = { k: 'ENTRY BASIS', t: '입국자격 자료', fields: [['입국기반', '모의 사례']] };
  assert.equal(documentRecordKind(summary), 'summary');
  assert.equal(documentIsRequestable(summary), false);
  assert.match(documentDisplayStatus(summary), /공식 허가증 아님/);
  const hotelCase = caseById('ICN-S1-002'), person = getTraveler(hotelCase.travelerId);
  const lodging = documentHTML(docOf(hotelCase, 'HOTEL'), hotelCase, person, person);
  assert.match(lodging, /숙박시설 명칭 미기재/);
  assert.doesNotMatch(lodging, /예약·체류자료 확인/);
  const residence = { k: 'STAY', t: '국내 거소자료', fields: [['체류목적', '국내 체류지로 복귀'], ['거소', '등록정보와 일치']] };
  const residenceHTML = documentHTML(residence, c, t, t);
  assert.match(residenceHTML, /국내 거소자료/);
  assert.doesNotMatch(residenceHTML, /숙박 예약확인/);
});

test('biometric page renders the result in the document, not a profile-derived score', () => {
  const mismatchCase = caseById('ICN-S3-009');
  const bad = docOf(mismatchCase, 'BIOMETRIC');
  const result = biometricDisplay(bad);
  assert.equal(result.face, '71.8%');
  assert.equal(result.mismatch, true);
  const traveler = getTraveler(mismatchCase.travelerId);
  const pp = getTraveler(mismatchCase.passportPortraitId || mismatchCase.travelerId);
  const html = documentHTML(bad, mismatchCase, traveler, pp);
  assert.match(html, /71.8%/);
  assert.match(html, /서류에 불일치 기록/);
  const refused = docOf(caseById('ICN-S3-011'), 'BIOMETRIC');
  assert.equal(biometricDisplay(refused).refused, true);
  assert.equal(biometricDisplay(refused).face, '');
  assert.match(documentHTML(refused, caseById('ICN-S3-011'), getTraveler(caseById('ICN-S3-011').travelerId), getTraveler(caseById('ICN-S3-011').travelerId)), /생체정보 제공 거부 기록/);
});

test('only actual passenger-side records can be requested; no generated fake evidence', () => {
  for (const c of CASES) for (const d of c.docs) {
    if (['BIOMETRIC', 'WATCHLIST'].includes(d.k)) {
      assert.equal(documentIsRequestable(d), false, `${c.id} ${d.k}`);
      assert.equal(documentRequestCopy(d), null);
    } else {
      assert.equal(documentIsRequestable(d), true, `${c.id} ${d.k}`);
      const copy = documentRequestCopy(d);
      assert.ok(copy.question);
      assert.match(copy.response, /제시하겠습니다/);
    }
  }
  assert.equal(documentRequestCopy({ k: 'ENTRY BASIS', t: '입국기반 요약' }), null);
});

test('large document records never silently lose fields or compare controls', () => {
  const d = { k: 'SUPPORTING', fields: Array.from({ length: 12 }, (_, i) => [`증빙 항목 ${i + 1}`, `내용 ${i + 1}`]) };
  const html = docFieldRows(d);
  assert.equal((html.match(/class="doc-compare-btn"/g) || []).length, 12);
  assert.match(html, /증빙 항목 12/);
  assert.match(html, /내용 12/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectionStep, inspectionDestination, lookupPresentation, LOOKUP_TOOLS } from '../../src/js/engines/inspection-workflow.js';

test('wayfinding does not hunt for clues or depend on a hidden resolution', () => {
  const st = { stage: 'PRIMARY', asked: new Set(['purpose']), looked: new Set(['visa']) };
  for (const hidden of [{ discoveredClues: new Set(), resolution: 'CLEAR' }, { discoveredClues: new Set(['secret']), resolution: 'REFUSE' }]) {
    assert.equal(inspectionStep({ ...st, ...hidden }), 'assessment');
  }
  // Catch accidental future reads of privileged fields, including case-wide readiness.
  const guarded = new Proxy(st, { get(object, key) {
    if (['resolution', 'required', 'evidence', 'discoveredClues', 'nationality'].includes(key)) throw new Error('Hidden field read');
    return object[key];
  } });
  assert.equal(inspectionStep(guarded), 'assessment');
  assert.equal(st.asked.size, 1);
  assert.equal(st.looked.size, 1);
});

test('an unrecorded answer stays on communication; active procedures take priority', () => {
  const st = { stage: 'PRIMARY', asked: new Set(), looked: new Set(['visa']) };
  assert.equal(inspectionStep(st), 'question');
  st.asked.add('purpose'); st.looked.clear();
  assert.equal(inspectionStep(st), 'evidence');
  assert.equal(inspectionStep({ ...st, stage: 'REFUGEE' }), 'procedure');
  assert.equal(inspectionStep({ ...st, ended: true }), 'complete');
});

test('pending-fact links are navigation only and use the public tool catalogue', () => {
  for (const row of ['입국자격', '여행계획', '국내관계', '동행일정']) {
    const target = inspectionDestination(row);
    assert.equal(target.task, 'evidence');
    assert.ok(LOOKUP_TOOLS.some((tool) => tool.id === target.lookup));
  }
  assert.equal(inspectionDestination('체재능력').control, 'askInput');
  assert.equal(inspectionDestination('unknown'), null);
});

test('record findings use neutral language without turning a query into a verdict', () => {
  assert.equal(lookupPresentation('치명'), '중요 확인');
  assert.equal(lookupPresentation('정상'), '조회 결과');
  assert.equal(lookupPresentation('치명', true), 'Important finding');
  for (const tool of LOOKUP_TOOLS) assert.ok(tool.ko && tool.en && tool.help && tool.helpEn);
});

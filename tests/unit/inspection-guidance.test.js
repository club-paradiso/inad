import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unmetQuestionPrerequisites, documentReviewPlan } from '../../src/js/engines/review-guidance.js';
import { WORK_GUIDES } from '../../src/data/work-guides.js';

const caseSample = {
  questions: [
    { id: 'purpose', q: '방문 목적은 무엇입니까?', cat: '기본사항' },
    { id: 'occupation', q: '직업이 무엇입니까?', cat: '직업', requires: ['QUESTION_purpose'] },
    { id: 'jobOffer', q: '취업할 예정입니까?', cat: '추가소명', requires: ['QUESTION_occupation', 'LOOKUP_contact'] }
  ]
};

test('locked question exposes only accessible prerequisite prompts, not hidden follow-up wording', () => {
  const items = unmetQuestionPrerequisites(caseSample.questions[2], caseSample, []);
  assert.equal(items.length, 2);
  assert.equal(items[0].kind, 'question');
  assert.equal(items[0].target, null);
  assert.doesNotMatch(items[0].ko, /직업이 무엇/);
  assert.equal(items[1].target, 'contact');
  assert.match(items[1].ko, /국내관계/);
  const afterPurpose = unmetQuestionPrerequisites(caseSample.questions[2], caseSample, ['QUESTION_purpose']);
  assert.equal(afterPurpose[0].target, 'occupation');
  assert.match(afterPurpose[0].ko, /직업이 무엇/);
  const afterBoth = unmetQuestionPrerequisites(caseSample.questions[2], caseSample, ['QUESTION_occupation', 'LOOKUP_contact']);
  assert.deepEqual(afterBoth, []);
});

test('document checklists are public-type guidance, not hidden case truth', () => {
  for (const kind of ['PASSPORT', 'VISA', 'E-ARRIVAL', 'PNR', 'HOTEL', 'BIOMETRIC', 'ABTC', 'WATCHLIST']) {
    const doc = { k: kind, alert: true, fields: [['번호', 'SECRET']] };
    const plan = documentReviewPlan(doc);
    assert.ok(WORK_GUIDES.some((g) => g.id === plan.guideId));
    assert.ok(plan.checks.length >= 3);
    assert.ok(plan.checks.every((x) => x.ko && x.en));
    assert.doesNotMatch(JSON.stringify(plan), /SECRET/);
    assert.deepEqual(documentReviewPlan({ k: kind, alert: false, fields: [['번호', 'OTHER']] }), plan);
  }
});

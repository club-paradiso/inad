import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableCompareSources, comparisonSummary, safeComparisonNote } from '../../src/js/engines/comparison-ledger.js';

test('only already observed traveler lines and executed lookup results enter the comparison catalog', () => {
  const fake = {
    logs: [
      { type: 'system', text: 'Private rule notice' },
      { type: 'alien', text: 'I will stay for seven days.' },
      { type: 'officer', text: 'What is your purpose?' },
      { type: 'alien', text: 'Tourism.' },
      { type: 'alert', text: 'Hidden suspicion' }
    ],
    queries: [
      { kind: 'pnr', t: '주의', text: 'No return booking.' },
      { kind: 'pnr', t: '정상', text: 'Old repeated query.' }
    ]
  };
  const sources = availableCompareSources(fake);
  assert.deepEqual(sources.map((x) => x.id), ['statement:1', 'statement:3', 'lookup:pnr']);
  assert.deepEqual(sources.map((x) => x.text), ['I will stay for seven days.', 'Tourism.', 'No return booking.']);
  assert.equal(sources.some((x) => /Private|Hidden|Old repeated/.test(x.text)), false);
  assert.deepEqual(availableCompareSources({ logs: [], queries: [] }), []);
});

test('manual comparison notes are bounded, case-local and classified independently of legal readiness', () => {
  assert.deepEqual(comparisonSummary({}), { total: 0, checked: 0, followup: 0 });
  const records = { '0|statement:1': { status: 'followup' }, '1|lookup:pnr': { status: 'checked' }, bad: { status: 'unknown' } };
  assert.deepEqual(comparisonSummary({ comparisonNotes: records }), { total: 2, checked: 1, followup: 1 });
  assert.equal(safeComparisonNote('  Test\nreference  '), 'Test reference');
  assert.equal(safeComparisonNote('a'.repeat(500)).length, 240);
});

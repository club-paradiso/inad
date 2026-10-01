// Amendments after the legal baseline are dated: before the effective date they are 'scheduled', from it on
// they are reported as in force (diagnostics warn) instead of a scheduled notice that silently goes stale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASE } from '../../src/data/legal-baseline.js';
import { amendmentStatus } from '../../src/js/engines/legal-baseline-status.js';

test('scheduled amendments carry a law, an ISO effective date after the baseline, and a note', () => {
  assert.ok(RELEASE.scheduled.length >= 1);
  for (const s of RELEASE.scheduled) {
    assert.ok(s.law && s.note, JSON.stringify(s));
    assert.match(s.effective, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(s.effective > RELEASE.legalBaseline, 'listed amendments postdate the baseline');
  }
});

test('in force from the effective date (Korea date), scheduled before it', () => {
  const s = RELEASE.scheduled.find((x) => x.law === '형사소송법');
  assert.equal(amendmentStatus('2026-10-01').find((x) => x.law === s.law).inForce, false);
  assert.equal(amendmentStatus(s.effective).find((x) => x.law === s.law).inForce, true);
  assert.equal(amendmentStatus('2027-01-01').every((x) => x.inForce), true);
});

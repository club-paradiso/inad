// Case of the Day: one deterministic case + seed per Korean calendar day; the result keeps no personal data and the
// share text never spoils the decision; only the first result of a day is kept, 30 days at most.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { dailyCase, dailyResult, saveDailyResult, loadDailyResults, shareText, DAILY_KEY } from '../../src/js/engines/daily-engine.js';
import { CASES } from '../../src/data/cases.js';
import { localDateKey } from '../../src/js/engines/rng.js';

beforeEach(() => resetStorage());
const day = (i) => new Date(Date.UTC(2026, 9, 1) + i * 86400000).toISOString().slice(0, 10);

test('same day → same case and seed; days spread over the whole core corpus', () => {
  assert.deepEqual(dailyCase('2026-10-03'), dailyCase('2026-10-03'));
  const seen = new Set(); for (let i = 0; i < 120; i++) { const d = dailyCase(day(i)); seen.add(d.caseId); assert.ok(d.seed >= 100000 && d.seed < 1000000); }
  assert.equal(seen.size, CASES.length);
  assert.match(dailyCase().dateKey, /^\d{4}-\d{2}-\d{2}$/); assert.equal(dailyCase().dateKey, localDateKey());
});

test('result shape is aggregation-ready and the share text spoils nothing', () => {
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  const r = dailyResult('2026-10-03', c, { label: '입국 불허', procedure: 100, seconds: 300, mistakes: [{ msg: 'x' }], actions: ['QUESTION_purpose', 'SECONDARY', 'ENTRY_REFUSED', 'REPATRIATION_ORDER'] }, { basis: { code: 'SIM-A12-PUR' }, evidence: { missed: [{ title: '귀국비용 진술' }] }, questions: { total: 9 } }, { counts: { text: 7, voice: 0, suggestion: 2, list: 0, clarify: 0 } });
  assert.deepEqual(r.procedurePath, ['SECONDARY', 'ENTRY_REFUSED', 'REPATRIATION_ORDER']);
  assert.equal(r.keyClues.total, c.clues.filter((x) => x.key).length); assert.equal(r.keyClues.found, r.keyClues.total - 1);
  const s = shareText(r);
  for (const spoiler of ['불허', '허가', 'SIM-A12', c.id, c.name, c.displayNameKo, '귀국비용']) assert.ok(!s.includes(spoiler), spoiler);
  assert.ok(!JSON.stringify(r).match(/[가-힣]{2,} [가-힣]{2,}입니다/), 'no dialogue text in the result');
});

test('first result of a day wins; 30 days kept; corrupt storage is ignored', () => {
  const c = CASES[0]; const mk = (k, p) => dailyResult(k, c, { label: '입국 허가', procedure: p, seconds: 60, mistakes: [], actions: [] }, null, null);
  assert.equal(saveDailyResult(mk('2026-10-03', 80)), true);
  assert.equal(saveDailyResult(mk('2026-10-03', 100)), false);
  assert.equal(loadDailyResults()['2026-10-03'].procedure, 80);
  for (let i = 0; i < 40; i++) saveDailyResult(mk(day(i), 90));
  assert.equal(Object.keys(loadDailyResults()).length, 30);
  localStorage.setItem(DAILY_KEY, '{"2026-10-03":{"v":2},"x":5}');
  assert.deepEqual(loadDailyResults(), {});
  localStorage.setItem(DAILY_KEY, 'not json');
  assert.deepEqual(loadDailyResults(), {});
});

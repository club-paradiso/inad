// Save/restore hardening: every load path validates shape, not just `version`. Damaged, hand-edited,
// future-version or hostile data must load as "nothing saved" (or a repaired copy) — never throw later
// in boot, resume or shift completion — and imports must be all-or-nothing.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import * as save from '../../src/js/engines/save-engine.js';
import { loadCampaign, saveCampaign, syncCampaignState, abandonCampaign, storyIsAnchor } from '../../src/js/engines/campaign-engine.js';
import { careerTemplate, levelInfo } from '../../src/js/engines/achievement-engine.js';
import { fnv1a } from '../../src/js/engines/rng.js';
import { state } from '../../src/js/state.js';

beforeEach(() => { resetStorage(); save.resetData('all'); state.campaignId = 'none'; state.campaignDay = 0; state.started = false; });
const put = (k, v) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
const bundleOf = (payload) => ({ format: 'INAD_SAVE_BUNDLE', schema: 1, appVersion: 'x', createdAt: '2026-10-01T00:00:00Z', payload, checksum: fnv1a(JSON.stringify(payload)) });

test('meta: damaged sessions, career, best and daily are repaired instead of throwing', () => {
  put(save.META_KEY, { version: 2, sessions: [null, 3, 'x', { id: 'ok', stats: { processed: 2 } }], career: 'x', best: 5, daily: { date: 'z', ids: ['futureMission'], progress: {}, rewarded: {} } });
  const m = save.loadMeta();
  assert.deepEqual(m.sessions.map((s) => s.id), ['ok']);
  assert.equal(typeof m.career, 'object');
  assert.equal(m.career.completedShifts, 1, 'career rebuilt from the surviving sessions');
  assert.deepEqual(m.best, { training: null, standard: null, realistic: null });
  assert.equal(m.daily.ids.length, 3);
  assert.ok(m.daily.ids.every((id) => id !== 'futureMission'));
});

test('meta: numeric career fields are coerced (string XP no longer concatenates)', () => {
  put(save.META_KEY, { version: 2, sessions: [], career: { ...careerTemplate(), xp: '100', totalPassengers: '5', achievements: 'x', challengeCompleted: [] } });
  const m = save.loadMeta();
  assert.equal(m.career.xp, 100);
  assert.equal(m.career.totalPassengers, 5);
  assert.deepEqual(m.career.achievements, {});
  assert.deepEqual(m.career.challengeCompleted, {});
  assert.ok(levelInfo(m.career.xp + 300).level < 3);
});

test('progress: a checkpoint needs a positive integer seed and an integer position 0..36', () => {
  for (const bad of [{ version: 1, nextIndex: 3 }, { version: 1, seed: 0, nextIndex: 1 }, { version: 1, seed: '12a', nextIndex: 1 }, { version: 1, seed: 141421, nextIndex: -5 }, { version: 1, seed: 141421, nextIndex: 3.5 }, { version: 1, seed: 141421, nextIndex: 'abc' }, { version: 1, seed: 141421, nextIndex: 999 }, { version: 99, seed: 1, nextIndex: 0 }, [1, 2], 'x']) {
    put(save.PROGRESS_KEY, bad);
    assert.equal(save.loadProgressSave(), null, JSON.stringify(bad));
  }
  put(save.PROGRESS_KEY, { version: 1, seed: '141421', nextIndex: '36', difficulty: 'impossible', scenarioId: 'toString', challengeId: 42, campaignId: 'constructor', guidance: 'robot', score: 'NaN', stats: { processed: '3', admitted: 'x' }, reports: [null, { a: 1 }], mistakes: 'no', partyArchive: [['T1', { s: 1 }], ['T2'], 5], eventSchedule: 'x', activeEvent: [], liveOps: 'live' });
  const p = save.loadProgressSave();
  assert.equal(p.seed, 141421); assert.equal(p.nextIndex, 36);
  assert.equal(p.difficulty, 'standard'); assert.equal(p.scenarioId, 'normal'); assert.equal(p.challengeId, 'none'); assert.equal(p.campaignId, 'none'); assert.equal(p.guidance, 'expert');
  assert.equal(p.score, 0); assert.deepEqual(p.stats, { processed: 3, admitted: 0 });
  assert.deepEqual(p.reports, [{ a: 1 }]); assert.deepEqual(p.mistakes, []);
  assert.deepEqual(p.partyArchive, [['T1', { s: 1 }]]);
  assert.equal(p.eventSchedule, null); assert.equal(p.activeEvent, null); assert.equal(p.liveOps, null);
});

test('campaign: out-of-range day, unknown/none/prototype ids and damaged stories are rejected or repaired', () => {
  for (const bad of [{ version: 1, id: 'holiday', active: true, day: 3, baseSeed: 1, results: [] }, { version: 1, id: 'none', day: 0, baseSeed: 1 }, { version: 1, id: 'constructor', day: 0, baseSeed: 1 }, { version: 1, id: 'toString', day: 0, baseSeed: 1 }, { version: 1, id: 'holiday', day: -1, baseSeed: 1 }, { version: 1, id: 'holiday', day: 1 }, { version: 2, id: 'holiday', day: 0, baseSeed: 1 }]) {
    put(save.CAMPAIGN_KEY, bad);
    assert.equal(loadCampaign(), null, JSON.stringify(bad));
    assert.doesNotThrow(() => syncCampaignState(), 'boot-time sync cannot throw');
  }
  put(save.CAMPAIGN_KEY, { version: 1, id: 'holiday', active: true, day: 1, baseSeed: 5, results: 'x', carryBacklog: '4', story: { chapters: { 0: { actions: 'x' }, 1: null } } });
  const c = loadCampaign();
  assert.deepEqual(c.results, []); assert.equal(c.carryBacklog, 4);
  assert.deepEqual(c.story.chapters, { 0: { actions: [] } });
});

test('abandoning a campaign also discards a checkpoint taken inside it; the story anchor needs the save', () => {
  put(save.CAMPAIGN_KEY, { version: 1, id: 'holiday', active: true, day: 0, baseSeed: 5, results: [] });
  put(save.PROGRESS_KEY, { version: 1, seed: 141421, nextIndex: 1, campaignId: 'holiday' });
  state.campaignId = 'holiday';
  assert.equal(abandonCampaign(), true);
  assert.equal(save.loadProgressSave(), null, 'resuming would dead-end at the anchor case of a campaign that no longer exists');
  state.campaignId = 'holiday';
  assert.equal(storyIsAnchor({ id: 'ICN-S1-002' }), false);
});

test('future-version saves are never overwritten by this build', () => {
  put(save.META_KEY, { version: 99, sessions: [] });
  assert.equal(save.saveMeta(save.emptyMeta()), false);
  assert.equal(JSON.parse(localStorage.getItem(save.META_KEY)).version, 99);
  put(save.CAMPAIGN_KEY, { version: 2, id: 'holiday' });
  assert.equal(saveCampaign({ version: 1, id: 'holiday', day: 0, baseSeed: 1 }), false);
  assert.equal(JSON.parse(localStorage.getItem(save.CAMPAIGN_KEY)).version, 2);
  put(save.PROGRESS_KEY, { version: 5 });
  state.started = true;
  assert.equal(save.saveProgressSnapshot(1), false);
  assert.equal(JSON.parse(localStorage.getItem(save.PROGRESS_KEY)).version, 5);
});

test('a failed career write keeps the checkpoint (it is then the only record of the shift)', () => {
  put(save.PROGRESS_KEY, { version: 1, seed: 141421, nextIndex: 36 });
  const realSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (k, v) => { if (k === save.META_KEY) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return realSet(k, v); };
  try {
    assert.equal(save.saveMeta(save.emptyMeta()), false);
    assert.equal(save.clearProgressSave(), false);
    assert.ok(save.loadProgressSave(), 'checkpoint kept');
  } finally { localStorage.setItem = realSet; }
  assert.equal(save.saveMeta(save.emptyMeta()), true);
  assert.equal(save.clearProgressSave(), true);
  assert.equal(save.loadProgressSave(), null);
});

test('import validation runs the same shape checks as the loaders', () => {
  const cases = [
    [{ [save.META_KEY]: JSON.stringify({ version: 2, sessions: [null] }) }, '근무 경력'],
    [{ [save.META_KEY]: JSON.stringify({ version: 2, sessions: [], career: 'x' }) }, '근무 경력'],
    [{ [save.META_KEY]: JSON.stringify({ version: 9, sessions: [] }) }, '근무 경력'],
    [{ [save.PROGRESS_KEY]: JSON.stringify({ version: 1, seed: 123456, nextIndex: -4 }) }, '체크포인트'],
    [{ [save.CAMPAIGN_KEY]: JSON.stringify({ version: 1, id: 'holiday', day: 7, baseSeed: 1 }) }, '캠페인'],
    [{ 'inad-font': 'x'.repeat(4_600_000) }, '한도']
  ];
  for (const [payload, msg] of cases) { const r = save.validateBundle(bundleOf(payload)); assert.equal(r.ok, false, msg); assert.match(r.msg, new RegExp(msg)); }
  assert.equal(save.validateBundle(bundleOf({ 'inad-airport': 'gmp', 'inad-locale': 'en', 'inad-audio': '0' })).ok, true, 'newer preference keys travel in the bundle');
  assert.equal(save.validateBundle(null).ok, false);
  assert.equal(save.validateBundle([]).ok, false);
});

test('bundle summary returns numbers and known names only (it is shown before confirmation)', () => {
  const payload = { [save.META_KEY]: JSON.stringify({ version: 2, sessions: { length: '<img src=x onerror=alert(1)>' } }), [save.PROGRESS_KEY]: JSON.stringify({ version: 1, seed: '<b>', nextIndex: '<i>' }), [save.CAMPAIGN_KEY]: JSON.stringify({ version: 1, id: 'holiday', day: 0, baseSeed: 1 }) };
  const sm = save.bundleSummary(bundleOf(payload));
  assert.equal(sm.sessions, 0); assert.equal(sm.processed, 0);
  assert.match(sm.campaign, /DAY 1$/);
  assert.ok(!/[<>]/.test(JSON.stringify(sm)));
});

test('import is transactional: a write failure restores the previous data', () => {
  put(save.META_KEY, { version: 2, sessions: [{ id: 'mine' }] }); localStorage.setItem('inad-font', 'large'); localStorage.setItem('inadBest', 'S');
  const before = { meta: localStorage.getItem(save.META_KEY), font: localStorage.getItem('inad-font'), best: localStorage.getItem('inadBest') };
  const payload = { 'inad-font': 'standard', [save.META_KEY]: JSON.stringify({ version: 2, sessions: [] }) };
  const realSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (k, v) => { if (k === save.META_KEY && v.includes('"sessions":[]')) throw new Error('quota'); return realSet(k, v); };
  try {
    const r = save.applyBundle(bundleOf(payload));
    assert.equal(r.ok, false);
    assert.match(r.msg, /기존 데이터는 그대로/);
  } finally { localStorage.setItem = realSet; }
  assert.equal(localStorage.getItem(save.META_KEY), before.meta);
  assert.equal(localStorage.getItem('inad-font'), before.font);
  assert.equal(localStorage.getItem('inadBest'), before.best);
});

test("'all' reset and the bundle cover the preference keys added after v6.1", () => {
  for (const k of save.PREFERENCE_EXTRA_KEYS) localStorage.setItem(k, '1');
  assert.deepEqual(Object.keys(save.collectPayload()).sort(), [...save.PREFERENCE_EXTRA_KEYS].sort());
  save.resetData('all');
  for (const k of save.PREFERENCE_EXTRA_KEYS) assert.equal(localStorage.getItem(k), null, k);
  assert.deepEqual(save.SAVE_KEYS.slice(0, 3), ['inad-meta-v54', 'inad-progress-v54', 'inad-campaign-v58'], 'v6.1 key list untouched');
});

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import * as save from '../../src/js/engines/save-engine.js';
import { fnv1a } from '../../src/js/engines/rng.js';
import { careerTemplate } from '../../src/js/engines/achievement-engine.js';

beforeEach(() => resetStorage());

test('storage keys are unchanged since v6.1 for backwards compatibility', () => {
  assert.equal(save.META_KEY, 'inad-meta-v54'); assert.equal(save.PROGRESS_KEY, 'inad-progress-v54'); assert.equal(save.CAMPAIGN_KEY, 'inad-campaign-v58');
  assert.deepEqual(save.SAVE_KEYS, ['inad-meta-v54', 'inad-progress-v54', 'inad-campaign-v58', 'inad-contrast', 'inad-font', 'inad-guidance', 'inad-reduce-motion', 'inad-shortcut-hints', 'inad-tutorial-seen', 'inadBest']);
  assert.equal(save.RELEASE.saveSchema, 1);
});

test('v6.1 career meta (schema 2) migrates in place and back-fills newer fields', () => {
  const legacyMeta = { version: 2, sessions: [{ id: 'a', grade: 'A', overall: 88, difficulty: 'standard', stats: { processed: 36 }, reports: [], mistakes: [] }], best: { training: null, standard: null, realistic: null } };
  localStorage.setItem(save.META_KEY, JSON.stringify(legacyMeta));
  const m = save.loadMeta();
  assert.equal(m.version, 2); assert.equal(m.sessions.length, 1);
  assert.equal(typeof m.career.campaignsCompleted, 'number'); assert.ok(m.career.campaignBest); assert.ok(Array.isArray(m.campaignHistory));
  assert.ok(m.daily && m.daily.ids.length === 3);
  assert.equal(m.career.completedShifts, 1, 'career is rebuilt from sessions when missing');
  for (const k of Object.keys(careerTemplate())) assert.ok(k in m.career, k);
});

test('malformed meta falls back to an empty structure without throwing', () => {
  localStorage.setItem(save.META_KEY, '{not json');
  const m = save.loadMeta(); assert.deepEqual(m.sessions, []);
  assert.equal(save.migrateMeta(null).version, 2);
  assert.equal(save.migrateMeta({ version: 1, sessions: 'x' }).sessions.length, 0);
});

test('progress checkpoints of an unknown schema are ignored, v1 is accepted', () => {
  localStorage.setItem(save.PROGRESS_KEY, JSON.stringify({ version: 2, seed: 1 }));
  assert.equal(save.loadProgressSave(), null);
  localStorage.setItem(save.PROGRESS_KEY, JSON.stringify({ version: 1, seed: 123, nextIndex: 4 }));
  assert.equal(save.loadProgressSave().nextIndex, 4);
});

test('save bundle: checksum, key allow-list, schema and JSON validation', () => {
  localStorage.setItem(save.META_KEY, JSON.stringify(save.emptyMeta())); localStorage.setItem('inad-font', 'large');
  const b = save.makeBundle();
  assert.equal(b.format, 'INAD_SAVE_BUNDLE'); assert.equal(b.schema, 1); assert.equal(b.checksum, fnv1a(JSON.stringify(b.payload)));
  assert.equal(save.validateBundle(b).ok, true);
  assert.equal(save.validateBundle({ ...b, schema: 2 }).ok, false);
  assert.equal(save.validateBundle({ ...b, checksum: '00000000' }).ok, false);
  assert.equal(save.validateBundle({ ...b, payload: { ...b.payload, evil: '1' }, checksum: fnv1a(JSON.stringify({ ...b.payload, evil: '1' })) }).ok, false);
  const badJson = { ...b, payload: { ...b.payload, [save.META_KEY]: '{broken' } }; badJson.checksum = fnv1a(JSON.stringify(badJson.payload));
  assert.equal(save.validateBundle(badJson).ok, false);
  resetStorage(); assert.equal(save.applyBundle(b).ok, true); assert.equal(localStorage.getItem('inad-font'), 'large');
});

test('fnv1a matches the v6.1 checksum implementation', () => { assert.equal(fnv1a(''), '811c9dc5'); assert.equal(fnv1a('a'), 'e40c292c'); });

test('resetData scopes', () => {
  for (const k of save.SAVE_KEYS) localStorage.setItem(k, '1');
  save.resetData('progress'); assert.equal(localStorage.getItem(save.PROGRESS_KEY), null); assert.equal(localStorage.getItem(save.META_KEY), '1');
  save.resetData('career'); assert.equal(localStorage.getItem(save.META_KEY), null); assert.equal(localStorage.getItem('inad-font'), '1');
  save.resetData('all'); assert.equal(localStorage.getItem('inad-font'), null);
});

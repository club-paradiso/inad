import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { buildSession, generateNormalCases, buildSessionQueue, coreCaseMap } from '../../src/js/engines/queue-engine.js';
import { session } from '../../src/js/state.js';
import { TRAVELER_POOL } from '../../src/data/travelers.js';
import { CASES } from '../../src/data/cases.js';
import { travelerMap } from '../../src/js/engines/traveler-engine.js';
import { generateEventSchedule } from '../../src/js/engines/operation-engine.js';

const sig = (q) => q.map((x) => x.travelerId + ':' + (x.caseId || x.normalId)).join(',');

test('same seed → same queue, parties and event schedule', () => {
  buildSession(123456); const a = sig(session.queue), pa = JSON.stringify(session.parties.map((p) => p.members.map((m) => m.travelerId)));
  buildSession(999); buildSession(123456);
  assert.equal(sig(session.queue), a); assert.equal(JSON.stringify(session.parties.map((p) => p.members.map((m) => m.travelerId))), pa);
  assert.deepEqual(generateEventSchedule(123456, 'standard'), generateEventSchedule(123456, 'standard'));
});

test('different seeds → reasonably different queues', () => {
  buildSession(100001); const a = session.queue.map((x) => x.travelerId);
  buildSession(100002); const b = session.queue.map((x) => x.travelerId);
  const same = a.filter((id, i) => b[i] === id).length;
  assert.ok(same < 12, `only ${same} positions may coincide`);
});

test('a duty roster has 36 passengers: 24 seeded normals + 12 core cases across 3 shifts', () => {
  buildSession(314159);
  assert.equal(session.queue.length, 36);
  assert.equal(session.normalCases.length, 24);
  assert.equal(session.queue.filter((q) => q.caseId).length, 12);
  for (const sh of [1, 2, 3]) { const items = session.queue.filter((q) => q.shift === sh); assert.equal(items.length, 12); assert.equal(items.filter((q) => q.caseId).length, 4); }
  assert.ok(!session.queue[0].caseId, 'the first passenger of a shift is a normal passenger');
  assert.equal(new Set(session.queue.map((q) => q.travelerId)).size, 36, 'no traveller appears twice');
});

test('every queue item resolves to a case and a traveller with a portrait', () => {
  buildSession(271828);
  for (const q of session.queue) {
    const t = travelerMap.get(q.travelerId); assert.ok(t, q.travelerId); assert.match(t.portrait, /TRV-\d{4}\.webp$|^data:image\/webp/);
    const c = q.caseId ? coreCaseMap.get(q.caseId) : session.normalCaseMap.get(q.normalId); assert.ok(c);
    assert.equal(c.travelerId, q.travelerId);
  }
});

test('normal cases are always CLEAR cases and their required actions reference existing questions/lookups', () => {
  const cases = generateNormalCases(161803);
  for (const c of cases) {
    assert.equal(c.resolution.type, 'CLEAR');
    for (const r of c.required) {
      if (r.startsWith('QUESTION_')) assert.ok(c.questions.some((q) => q.id === r.slice(9)), `${c.id} ${r}`);
      if (r.startsWith('LOOKUP_')) assert.ok(c.lookups[r.slice(7)], `${c.id} ${r}`);
    }
  }
  const variants = new Set(cases.map((c) => c.sessionVariant));
  assert.ok(variants.has('routine-clear'));
});

test('travel parties link 2–4 normal passengers of one shift and never a core case', () => {
  buildSession(141421);
  assert.ok(session.parties.length >= 3);
  for (const p of session.parties) {
    assert.ok(p.members.length >= 2 && p.members.length <= 4);
    assert.ok(p.members.every((m) => m.caseId === null));
    assert.ok(p.members.every((m) => session.queue[m.queueIndex].shift === p.shift));
    assert.ok(['consistent', 'minor-resolved'].includes(p.mode));
  }
  const minor = session.parties.filter((p) => p.mode === 'minor-resolved');
  for (const p of minor) { const last = session.normalCaseMap.get(session.queue[p.members[p.members.length - 1].queueIndex].normalId); assert.equal(last.sessionVariant, 'party-secondary-clear'); assert.equal(last.resolution.type, 'CLEAR', 'party cross-check never changes the legal outcome'); }
});

test('data invariants: unique traveller ids, core case travellers exist, portraits exist', async () => {
  const ids = TRAVELER_POOL.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, 105);
  const fs = await import('node:fs');
  for (const t of TRAVELER_POOL) assert.ok(fs.existsSync(new URL(`../../src/assets/portraits/${t.id}.webp`, import.meta.url)), t.id);
  assert.equal(CASES.length, 12);
  for (const c of CASES) { assert.ok(travelerMap.has(c.travelerId), c.id); if (c.passportPortraitId) assert.ok(travelerMap.has(c.passportPortraitId)); for (const r of c.required) { if (r.startsWith('QUESTION_')) assert.ok(c.questions.some((q) => q.id === r.slice(9)), `${c.id} ${r}`); if (r.startsWith('LOOKUP_')) assert.ok(c.lookups[r.slice(7)], `${c.id} ${r}`); } for (const q of c.questions) for (const dep of q.requires || []) { if (dep.startsWith('QUESTION_')) assert.ok(c.questions.some((x) => x.id === dep.slice(9)), `${c.id} ${q.id} ← ${dep}`); } }
});

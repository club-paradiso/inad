// v13 generated-passenger stories: every generated passenger has a trip of their own, anomalies live in the
// submitted documents, and none of it moves a verdict, a requirement or the roster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { buildSession, buildSessionQueue, generateNormalCases } from '../../src/js/engines/queue-engine.js';
import { fnv1a } from '../../src/js/engines/rng.js';
import { session } from '../../src/js/state.js';
import { applyPassengerStory, storyFor, storyKind, resolveAnomaly, STORY_QUESTION_IDS } from '../../src/js/engines/passenger-story.js';
import { REVIEW_ANOMALIES, TRIP_THEMES, VOICES, PAID_ACTIVITY, misspelt } from '../../src/data/passenger-stories.js';
import { returnItineraryFor } from '../../src/js/engines/return-itinerary-engine.js';
import { establishedRows } from '../../src/js/engines/disclosure.js';

const SEEDS = [100001, 141421, 161803, 271828, 314159, 577215, 662607, 918273];
const field = (c, k, name) => (c.docs.find((d) => d.k === k)?.fields || []).find((f) => f[0] === name)?.[1];
// The wording statement-lock rule 4 reads as an explicit plan for paid work (statement-lock-engine.js).
const PAID_WORK = /(?:일을|근무|취업|알바|월급|급여|사례비|시급|돈을 받아|현금으로).{0,28}(?:받|하|일|벌|지급)/;

// Fingerprints taken from main @ 7a63609 (before v13) with the same projection: who is generated, in which shift,
// how each case resolves, entry basis, stay, flights, biometric line, document order and question order.
// 2026-11-13: case fingerprints re-taken after the traveller pool re-pairing (20 generated travellers renamed so
// name, nationality and portrait match; nationality feeds the entry basis). Taken with the v13 story layer
// reverted to the old traveller file the values were unchanged, so the story invariant itself still holds;
// queue orders and the outcome counts below are untouched.
const ROSTER_FINGERPRINT = { 161803: ['d6d3e522', '4d56db33'], 271828: ['3c2ffe2d', 'fe76f048'], 314159: ['c914b69b', '7a15801d'] };
const rosterSig = (cs) => fnv1a(cs.map((c) => [c.travelerId, c.shift, c.resolution.type, c.resolution.reason, c.sessionVariant, c.basis, c.stay, c.arrival, c.return, c.bio, c.docs.map((d) => d.k).join('/'), c.questions.filter((q) => ['purpose', 'stay', 'return', 'detail', 'residence'].includes(q.id)).map((q) => q.id).join('/')].join('|')).join('\n'));

test('the roster is what it was before stories: same travellers, same outcomes, same requirements shape', () => {
  for (const [seed, [cases, queue]] of Object.entries(ROSTER_FINGERPRINT)) {
    const cs = generateNormalCases(Number(seed));
    assert.equal(rosterSig(cs), cases, `seed ${seed}: generated passengers unchanged`);
    assert.equal(fnv1a(buildSessionQueue(Number(seed), cs).map((x) => x.travelerId + ':' + (x.caseId || x.normalId)).join(',')), queue, `seed ${seed}: queue order unchanged`);
  }
  const cases = generateNormalCases(161803);
  assert.equal(cases.filter((c) => c.resolution.type === 'REFUSE').length, 3);
  assert.equal(cases.filter((c) => c.sessionVariant === 'secondary-clear').length, 6);
  for (const c of cases) {
    if (c.sessionVariant === 'routine-clear') assert.deepEqual(c.required, ['QUESTION_purpose'], `${c.id} routine passengers still need one question`);
    for (const id of STORY_QUESTION_IDS) assert.ok(!c.required.includes('QUESTION_' + id), `${c.id}: story question ${id} is never required`);
    for (const q of c.questions) assert.ok(q.q && q.a, `${c.id} ${q.id} has text`);
  }
});

test('no generated passenger opens with the templated line, and the opening never names the outcome', () => {
  for (const seed of SEEDS) {
    buildSession(seed);
    for (const c of session.normalCases) {
      assert.ok(c.initial.length > 5, c.id);
      assert.doesNotMatch(c.initial, /목적으로 입국합니다|추가 확인이 필요|조회가 필요|이상 표시|협조하지 않고/, `${c.id}: ${c.initial}`);
      assert.doesNotMatch(c.initial, /강제퇴거|입국금지|불허|취업|사례비/, `${c.id}: ${c.initial}`);
    }
  }
});

test('a duty roster has varied passengers: several trips and manners, not one line with different names', () => {
  buildSession(314159);
  const routine = session.normalCases.filter((c) => c.sessionVariant === 'routine-clear');
  assert.ok(new Set(routine.map((c) => c.initial)).size >= routine.length - 3, 'openings are mostly distinct');
  assert.ok(new Set(session.normalCases.map((c) => c.story.theme)).size >= 8);
  assert.ok(new Set(session.normalCases.map((c) => c.story.voice)).size >= 4);
  assert.ok(new Set(routine.map((c) => c.questions.find((q) => q.id === 'purpose').a)).size >= 6);
});

test('stories are deterministic and idempotent', () => {
  buildSession(577215); const a = JSON.stringify(session.normalCases);
  for (const c of session.normalCases) applyPassengerStory(c, 577215, session.partyByTraveler.get(c.travelerId)?.id || null);
  assert.equal(JSON.stringify(session.normalCases), a, 're-applying changes nothing');
  buildSession(1); buildSession(577215);
  assert.equal(JSON.stringify(session.normalCases), a, 'same seed, same stories');
});

test('story choices never depend on nationality, sex or portrait', () => {
  const [c] = generateNormalCases(271828).filter((x) => x.sessionVariant === 'routine-clear');
  const base = storyFor(c, 271828);
  const other = storyFor({ ...c, nat: '다른 국적', code: 'ZZZ', sex: c.sex === 'F' ? 'M' : 'F', name: 'SOMEONE ELSE' }, 271828);
  assert.deepEqual({ ...other, theme: other.theme.id }, { ...base, theme: base.theme.id });
  for (const pool of Object.values(TRIP_THEMES)) for (const t of pool) for (const line of [t.open, t.brief, t.purpose, t.plan]) assert.doesNotMatch(line, /국적|나라 사람/);
});

test('statements agree with the record: stay, lodging and nights follow the final documents', () => {
  for (const seed of SEEDS) {
    buildSession(seed);
    for (const c of session.normalCases) {
      const kind = storyKind(c); const stay = c.questions.find((q) => q.id === 'stay');
      if (kind !== 'resident') {
        assert.ok(stay.a.startsWith(c.stay), `${c.id}: stay answer "${stay.a}" follows the record "${c.stay}"`);
        const lodging = c.questions.find((q) => q.id === 'lodging'); assert.ok(lodging, c.id);
        assert.ok(lodging.a.includes(field(c, 'HOTEL', '숙박')), `${c.id}: lodging answer names the booked hotel`);
        const nights = Number(c.stay.match(/\d+/)[0]) - 1;
        if (c.anomaly !== 'staySpan') assert.equal(field(c, 'HOTEL', '숙박기간'), `${nights}박`, c.id);
      }
    }
  }
});

test('travel parties are made of people on the same kind of trip, tell the same trip, and share one itinerary', () => {
  let parties = 0;
  for (const seed of SEEDS) {
    buildSession(seed);
    for (const p of session.parties) {
      parties++;
      const cs = p.members.map((m) => session.normalCaseMap.get(m.normalId));
      assert.equal(new Set(cs.map(storyKind)).size, 1, `${seed} ${p.id}: one kind of trip`);
      assert.equal(storyKind(cs[0]), p.type === 'business' ? 'business' : 'tourist', `${seed} ${p.id}: ${p.type}`);
      assert.equal(new Set(cs.map((c) => c.story.theme)).size, 1, `${seed} ${p.id}: one shared plan`);
      assert.equal(new Set(cs.map((c) => field(c, 'PNR', '여정'))).size, 1, `${seed} ${p.id}: one inbound route on every booking`);
      assert.equal(new Set(cs.map((c) => c.stay)).size, 1);
    }
  }
  assert.ok(parties >= SEEDS.length * 2, `parties still form (${parties})`);
});

test('a review anomaly is written into the document it concerns and found by reading that document', () => {
  const seen = new Set();
  for (const seed of [...SEEDS, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    for (const c of generateNormalCases(seed).filter((x) => x.sessionVariant === 'secondary-clear')) {
      const spec = REVIEW_ANOMALIES[c.anomaly]; assert.ok(spec, c.id); seen.add(c.anomaly);
      assert.ok(spec.kinds.includes(storyKind(c)), `${c.id}: ${c.anomaly} fits a ${storyKind(c)}`);
      const doc = c.docs.find((d) => d.k === spec.doc); assert.ok(doc, `${c.id}: has the ${spec.doc} document`);
      for (const [k, v] of spec.fields(c)) assert.equal(field(c, spec.doc, k), v, `${c.id}: ${k}`);
      assert.equal(c.clues.filter((x) => x.trigger === 'INIT').length, 0, `${c.id}: nothing is handed over at the start`);
      assert.equal(c.clues[0].trigger, 'DOC_' + spec.doc);
      assert.equal(c.resolution.type, 'CLEAR');
      assert.deepEqual(c.required, ['SECONDARY', 'QUESTION_detail', 'LOOKUP_' + spec.lookup[0]]);
      assert.ok(c.lookups[spec.lookup[0]][1] === spec.lookup[2]);
      if (c.anomaly === 'pnrAgency') assert.equal(returnItineraryFor(c).presentable, false, 'agency ticket needs the PNR lookup first');
    }
  }
  assert.deepEqual([...seen].sort(), Object.keys(REVIEW_ANOMALIES).sort(), 'every anomaly occurs');
  assert.equal(resolveAnomaly('companionHotel', 'resident', 'x'), 'stayExpiry', 'a resident never gets a hotel anomaly');
  assert.equal(misspelt('GIULIA CONTI'), 'GIUIA CONTI'); assert.notEqual(misspelt('LI NA'), 'LI NA');
});

test('a routine tourist never says anything the statement-lock rule reads as paid work; a purpose refusal always does', () => {
  for (const seed of SEEDS) {
    for (const c of generateNormalCases(seed)) {
      const refusal = c.sessionVariant === 'generated-refuse-purposeMismatch';
      for (const q of c.questions.filter((x) => ['purpose', 'detail'].includes(x.id))) {
        if (refusal && q.id === 'detail') assert.match(q.a, PAID_WORK, `${c.id}: the paid activity is stated`);
        else if (storyKind(c) === 'tourist') assert.doesNotMatch(q.a, PAID_WORK, `${c.id} ${q.id}: ${q.a}`);
      }
      if (c.resolution.type === 'CLEAR') assert.doesNotMatch(c.initial, PAID_WORK, c.id);
    }
  }
  for (const pool of Object.values(PAID_ACTIVITY)) for (const v of pool) assert.match(v.a, PAID_WORK);
  for (const v of VOICES) for (const line of [...v.lead, ...v.tail]) assert.doesNotMatch(line, PAID_WORK);
});

test('story questions open the matching desk rows through the generic disclosure rules', () => {
  const c = generateNormalCases(271828).find((x) => x.sessionVariant === 'routine-clear' && storyKind(x) === 'tourist');
  const rows = (asked) => establishedRows(c, { asked: new Set(asked), looked: new Set(), performed: [] });
  assert.ok(!rows([]).has('체재능력'));
  assert.ok(rows(['funds']).has('체재능력'));
  assert.ok(rows(['plan']).has('입국목적'));
  assert.ok(rows(['lodging']).has('여행계획'));
});

test('rotating short duty: six passengers, three generated and three authored, never all one outcome', async () => {
  const { quickRosterFor, rosterSession, caseForQueueItem, coreCaseMap } = await import('../../src/js/engines/queue-engine.js');
  const rosters = new Set();
  for (const seed of [...SEEDS, 11, 22, 33, 44, 55, 66, 77, 88]) {
    const plan = quickRosterFor(seed); assert.deepEqual(quickRosterFor(seed), plan, 'deterministic');
    rosters.add(plan.join(','));
    assert.equal(plan.length, 6);
    const authored = plan.filter((e) => coreCaseMap.has(e));
    assert.equal(authored.length, 3); assert.equal(new Set(authored).size, 3, 'no authored case twice');
    assert.ok(authored.some((id) => coreCaseMap.get(id).resolution.type === 'CLEAR'));
    assert.ok(authored.some((id) => coreCaseMap.get(id).resolution.type !== 'CLEAR'));
    assert.ok(authored.filter((id) => coreCaseMap.get(id).special).length <= 1, 'at most one special-procedure case');
    buildSession(seed); assert.equal(rosterSession(plan), true, `seed ${seed}: roster can be built`);
    assert.equal(session.queue.length, 6); assert.equal(new Set(session.queue.map((q) => q.travelerId)).size, 6);
    const cases = session.queue.map(caseForQueueItem);
    assert.equal(cases[2].sessionVariant, 'secondary-clear');
    for (const c of cases.filter((x) => String(x.id).startsWith('NORMAL-'))) assert.ok(!c.questions.some((q) => /^party/.test(q.id)), `${c.id}: no party record in a roster without parties`);
    assert.equal(session.parties.length, 0);
  }
  assert.ok(rosters.size >= 12, `rosters differ between seeds (${rosters.size})`);
});

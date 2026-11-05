import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { CASES } from '../../src/data/cases.js';
import { generateNormalCases, buildSession } from '../../src/js/engines/queue-engine.js';
import { session } from '../../src/js/state.js';
import { returnItineraryFor } from '../../src/js/engines/return-itinerary-engine.js';

const coreExpected = {
  'ICN-S1-001': ['ticketed', 'KE081'],
  'ICN-S1-002': ['ticketed', 'OZ102'],
  'ICN-S1-003': ['not-applicable', ''],
  'ICN-S1-004': ['ticketed', 'VN415'],
  'ICN-S2-005': ['missing', ''],
  'ICN-S2-006': ['reserved', 'GA879'],
  'ICN-S2-007': ['ticketed', 'PR469'],
  'ICN-S2-008': ['reserved', 'KE893'],
  'ICN-S3-009': ['reserved', 'LH713'],
  'ICN-S3-010': ['held', 'QR859'],
  'ICN-S3-011': ['unsubmitted', 'KE695'],
  'ICN-S3-012': ['ticketed', 'NH864']
};

test('all 12 legal baseline cases distinguish actual booking, issuance, absence, and residence', () => {
  for (const c of CASES) {
    const result = returnItineraryFor(c);
    const [status, flight] = coreExpected[c.id];
    assert.equal(result.status, status, c.id);
    assert.equal(result.flight, flight, c.id);
    assert.equal(result.presentable, ['ticketed', 'reserved', 'held'].includes(status), c.id);
    if (status === 'held') assert.match(result.statusLabel, /미발권/);
    if (status === 'not-applicable') assert.match(result.response, /기존 체류자격/);
    if (status === 'missing') assert.match(result.response, /없습니다/);
  }
});

test('all generated temporary visitors have a named outbound flight and independently identifiable ticket record', () => {
  const cases = generateNormalCases(314159);
  assert.equal(cases.length, 24);
  const flights = new Set();
  for (const c of cases) {
    const result = returnItineraryFor(c);
    const pnr = c.docs.find((d) => d.k === 'PNR');
    assert.ok(pnr, c.id);
    if (result.status === 'not-applicable') {
      assert.equal(result.flight, '', 'resident does not need an invented return flight');
      assert.equal(c.return, '—');
      continue;
    }
    assert.equal(result.status, 'ticketed', c.id);
    assert.match(result.flight, /^SIM6\d{2}$/, c.id);
    assert.match(c.return, new RegExp(result.flight));
    assert.ok(result.destination, c.id);
    assert.ok(result.ticketNo.startsWith('SIMT'), c.id);
    assert.ok(result.bookingRef.startsWith('SIM-'), c.id);
    assert.ok(pnr.fields.some(([k, v]) => k === '귀국편' && v === result.flight), c.id);
    flights.add(result.flight);
  }
  assert.ok(flights.size >= 15);
  assert.deepEqual(generateNormalCases(314159).map((c) => c.return), cases.map((c) => c.return));
});

test('group booking never auto-produces a passenger-app e-ticket before PNR lookup', () => {
  const seeds = [314159, 271828, 161803, 141421];
  const agency = seeds.flatMap((seed) => generateNormalCases(seed)).find((c) => c.returnDelivery === 'agency');
  assert.ok(agency, 'at least one deterministic agency-booked passenger exists');
  const before = returnItineraryFor(agency, { looked: new Set() });
  assert.equal(before.status, 'ticketed');
  assert.equal(before.presentable, false);
  assert.match(before.response, /단체예약/);
  const after = returnItineraryFor(agency, { looked: new Set(['pnr']) });
  assert.equal(after.presentable, true);
});

test('shared travel party uses the same outbound flight and booking reference for its members', () => {
  buildSession(141421);
  for (const party of session.parties) {
    const entries = party.members.map((member) => session.normalCaseMap.get(member.normalId));
    if (entries.every((c) => returnItineraryFor(c).status === 'not-applicable')) continue;
    const returns = entries.map((c) => returnItineraryFor(c).flight);
    assert.equal(new Set(returns).size, 1, party.id);
    for (const c of entries) {
      const pnr = c.docs.find((d) => d.k === 'PNR');
      assert.ok(pnr.fields.some(([k, v]) => k === '공동 PNR' && v === party.sharedPNR), party.id);
      assert.equal(c.return, entries[0].return);
    }
  }
});

test('unverifiable or missing onward evidence does not invent issuance or a blanket legal consequence', () => {
  const missing = returnItineraryFor({ id: 'NORMAL-DEMO', name: 'SIM TEST', stay: '5일', return: '없음', docs: [{ k: 'PNR', fields: [['귀국편', 'NONE'], ['예약형태', 'ONE-WAY']] }] });
  assert.equal(missing.presentable, false);
  assert.equal(missing.status, 'missing');
  const unknown = returnItineraryFor({ id: 'NORMAL-DEMO', name: 'SIM TEST', stay: '5일', return: 'KE600 · ICN → JFK', docs: [] });
  assert.equal(unknown.status, 'unsubmitted');
  assert.equal(unknown.presentable, false);
  const pending = returnItineraryFor({ id: 'NORMAL-DEMO', name: 'SIM TEST', stay: '5일', return: 'KE600 · ICN → JFK', docs: [{ k: 'PNR', fields: [['귀국편', 'KE600'], ['상태', 'RESERVATION HOLD']] }] });
  assert.equal(pending.status, 'held');
  assert.equal(pending.ticketNo, '');
});

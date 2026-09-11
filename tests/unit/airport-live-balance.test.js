import test from 'node:test';
import assert from 'node:assert/strict';
import { AIRPORTS } from '../../src/data/airports.js';
import { calculateLiveLoadFactor, capLiveLoadFactor, classifyLiveLoad } from '../../src/js/engines/airport-load-balance.js';

test('airport presets have unique identities, valid ratings and live normalization targets', () => {
  assert.equal(new Set(AIRPORTS.map((a) => a.id)).size, AIRPORTS.length);
  assert.equal(new Set(AIRPORTS.map((a) => a.code)).size, AIRPORTS.length);
  for (const airport of AIRPORTS) {
    assert.ok(airport.rating >= 1 && airport.rating <= 5, `${airport.code} rating`);
    assert.ok(airport.liveTargetArrivals > 0, `${airport.code} liveTargetArrivals`);
  }
  assert.equal(AIRPORTS.find((a) => a.code === 'ICN').rating, 5);
  assert.equal(AIRPORTS.find((a) => a.code === 'YNY').rating, 1);
});

test('live load is normalized relative to each airport gameplay target', () => {
  assert.equal(calculateLiveLoadFactor({ arrivals: 0, delayed: 0 }, 8), .82);
  assert.equal(calculateLiveLoadFactor({ arrivals: 8, delayed: 0 }, 8), 1);
  assert.ok(calculateLiveLoadFactor({ arrivals: 16, delayed: 4 }, 8) > 1.18);
  assert.ok(calculateLiveLoadFactor({ arrivals: 100, delayed: 100 }, 8) <= 1.28);
});

test('user-selected difficulty caps real-time pressure so training cannot become hard mode', () => {
  assert.equal(capLiveLoadFactor(1.28, 'training'), 1.06);
  assert.equal(capLiveLoadFactor(.80, 'training'), .94);
  assert.equal(capLiveLoadFactor(1.28, 'standard'), 1.15);
  assert.equal(capLiveLoadFactor(.80, 'standard'), .88);
  assert.equal(capLiveLoadFactor(1.28, 'realistic'), 1.24);
  assert.equal(capLiveLoadFactor(.80, 'realistic'), .82);
});

test('live pressure labels are stable around the gameplay thresholds', () => {
  assert.equal(classifyLiveLoad(.90), 'quiet');
  assert.equal(classifyLiveLoad(1), 'normal');
  assert.equal(classifyLiveLoad(1.12), 'busy');
  assert.equal(classifyLiveLoad(1.22), 'surge');
});

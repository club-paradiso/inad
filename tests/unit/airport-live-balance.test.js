import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { AIRPORTS } from '../../src/data/airports.js';
import { state } from '../../src/js/state.js';
import { rawLiveLoadFactor, boundedLiveLoadFactor, liveLoadFactor } from '../../src/js/engines/operation-engine.js';

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
  assert.equal(rawLiveLoadFactor({ arrivals: 0, delayed: 0 }, 8), .82);
  assert.equal(rawLiveLoadFactor({ arrivals: 8, delayed: 0 }, 8), 1);
  assert.ok(rawLiveLoadFactor({ arrivals: 16, delayed: 4 }, 8) > 1.18);
  assert.ok(rawLiveLoadFactor({ arrivals: 100, delayed: 100 }, 8) <= 1.28);
});

test('user-selected difficulty caps real-time pressure so training cannot become hard mode', () => {
  assert.equal(boundedLiveLoadFactor(1.28, 'training'), 1.06);
  assert.equal(boundedLiveLoadFactor(.80, 'training'), .94);
  assert.equal(boundedLiveLoadFactor(1.28, 'standard'), 1.15);
  assert.equal(boundedLiveLoadFactor(.80, 'standard'), .88);
  assert.equal(boundedLiveLoadFactor(1.28, 'realistic'), 1.24);
  assert.equal(boundedLiveLoadFactor(.80, 'realistic'), .82);
});

test('missing live API data has no gameplay effect', () => {
  const before = { difficulty: state.difficulty, liveOps: state.liveOps };
  state.difficulty = 'realistic';
  state.liveOps = { live: false, factor: 1.28 };
  assert.equal(liveLoadFactor(), 1);
  state.difficulty = before.difficulty;
  state.liveOps = before.liveOps;
});

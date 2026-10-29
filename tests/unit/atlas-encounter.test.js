import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validEncounter, callEncounter, finishEncounter } from '../../src/js/engines/atlas-encounter.js';

test('a simulated encounter can be called and completed once', () => {
  const called = callEncounter(undefined);
  assert.deepEqual(called, { version: 1, phase: 'called' });
  assert.equal(validEncounter(called), true);
  assert.equal(callEncounter(called), null);
  const completed = finishEncounter(called);
  assert.deepEqual(completed, { version: 1, phase: 'completed' });
  assert.equal(finishEncounter(completed), null);
  assert.equal(finishEncounter(undefined), null);
});

test('unsupported and malformed encounter states are rejected', () => {
  for (const state of [null, [], {}, { version: 2, phase: 'called' }, { version: 1, phase: 'unknown' }]) {
    assert.equal(validEncounter(state), false);
    assert.equal(finishEncounter(state), null);
  }
});

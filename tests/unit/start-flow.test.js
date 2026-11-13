// Start-screen flow: exactly one step is "next", derived only from finished work; nothing is ever locked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { startFlow, FLOW_STEPS } from '../../src/js/engines/start-flow.js';

const states = (f) => Object.fromEntries(f.steps.map((s) => [s.id, s.state]));

test('a newcomer is pointed at the first interview', () => {
  const f = startFlow();
  assert.equal(f.next, 'first'); assert.equal(f.newcomer, true); assert.equal(f.resume, false);
  assert.deepEqual(states(f), { first: 'next', quick: 'later', shift: 'later' });
});

test('each finished rung moves the next step up the path', () => {
  assert.deepEqual(states(startFlow({ firstCaseDone: true })), { first: 'done', quick: 'next', shift: 'later' });
  assert.deepEqual(states(startFlow({ sessions: [{ mode: 'quick' }] })), { first: 'done', quick: 'done', shift: 'next' });
  assert.deepEqual(states(startFlow({ completedShifts: 2 })), { first: 'done', quick: 'done', shift: 'next' });
  assert.deepEqual(states(startFlow({ sessions: [{ mode: 'shift' }] })), { first: 'done', quick: 'done', shift: 'next' });
  assert.equal(startFlow({ firstCaseDone: true }).newcomer, false);
});

test('an unfinished regular duty is the next step whatever else is open', () => {
  const f = startFlow({ hasCheckpoint: true });
  assert.equal(f.next, 'shift'); assert.equal(f.resume, true); assert.equal(f.newcomer, false);
  assert.deepEqual(states(f), { first: 'later', quick: 'later', shift: 'next' });
});

test('there is always exactly one next step and malformed saves do not throw', () => {
  for (const input of [undefined, {}, { sessions: null }, { sessions: [null, {}, 'x'] }, { completedShifts: NaN }, { firstCaseDone: 1, sessions: [{ mode: 'quick' }], completedShifts: 9, hasCheckpoint: true }]) {
    const f = startFlow(input);
    assert.equal(f.steps.filter((s) => s.state === 'next').length, 1);
    assert.deepEqual(f.steps.map((s) => s.id), FLOW_STEPS);
  }
});

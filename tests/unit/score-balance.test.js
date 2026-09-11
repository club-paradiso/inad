import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { state } from '../../src/js/state.js';
import { DIFFICULTY_CONFIG, SHIFT_TARGETS } from '../../src/data/operations.js';
import { scoringWeights, operationalScore } from '../../src/js/engines/score-engine.js';

test('processing efficiency has lower scoring weight in learning modes', () => {
  state.difficulty = 'training';
  assert.equal(scoringWeights().efficiency, .10);
  assert.equal(scoringWeights().accuracy + scoringWeights().procedure, .80);

  state.difficulty = 'standard';
  assert.equal(scoringWeights().efficiency, .14);

  state.difficulty = 'realistic';
  assert.equal(scoringWeights().efficiency, .20);
});

test('learning modes have more time and less arrival pressure', () => {
  assert.ok(DIFFICULTY_CONFIG.training.workFactor < DIFFICULTY_CONFIG.standard.workFactor);
  assert.ok(DIFFICULTY_CONFIG.standard.workFactor < DIFFICULTY_CONFIG.realistic.workFactor);
  assert.ok(DIFFICULTY_CONFIG.training.arrivalEvery > DIFFICULTY_CONFIG.standard.arrivalEvery);
  assert.ok(DIFFICULTY_CONFIG.standard.arrivalEvery > DIFFICULTY_CONFIG.realistic.arrivalEvery);
  assert.deepEqual([SHIFT_TARGETS[1].avg, SHIFT_TARGETS[2].avg, SHIFT_TARGETS[3].avg], [80, 135, 200]);
});

test('operational mistakes are progressively more forgiving by difficulty', () => {
  Object.assign(state, {
    fatigue: 96,
    overSecondary: 2,
    rushed: 2,
    repeatedQuestions: 4,
    repeatedLookups: 4
  });

  state.difficulty = 'training';
  const training = operationalScore();
  state.difficulty = 'standard';
  const standard = operationalScore();
  state.difficulty = 'realistic';
  const realistic = operationalScore();

  assert.ok(training > standard, `${training} should be greater than ${standard}`);
  assert.ok(standard > realistic, `${standard} should be greater than ${realistic}`);
});

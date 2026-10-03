import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { CASES } from '../../src/data/cases.js';
import { state } from '../../src/js/state.js';
import { isCoachActive, currentCoachStep, dismissCoach } from '../../src/js/ui/coach.js';

test('coach: active by default in guided mode', () => {
  localStorage.clear();
  state.guidance = 'guided';
  assert.equal(isCoachActive(), true);

  dismissCoach();
  assert.equal(isCoachActive(), false);
});

test('coach: returns step 1 when no questions asked', () => {
  localStorage.clear();
  state.guidance = 'guided';
  state.caseIndex = 0;
  state.ended = false;
  state.logs = [];
  state.discoveredClues = new Set();

  const hint = currentCoachStep();
  assert.ok(hint);
  assert.equal(hint.step, 1);
  assert.equal(hint.target, 'first_question');
});

test('coach: returns step 2 when alien has answered but no clues discovered', () => {
  localStorage.clear();
  state.guidance = 'guided';
  state.caseIndex = 0;
  state.ended = false;
  state.logs = [
    { type: 'officer', text: '방문 목적이 무엇입니까?' },
    { type: 'alien', text: '친구를 만나러 왔습니다.' }
  ];
  state.discoveredClues = new Set();

  const hint = currentCoachStep();
  assert.ok(hint);
  assert.equal(hint.step, 2);
  assert.equal(hint.target, 'statement_lock');
});

test('coach: returns step 3 when clue is discovered', () => {
  localStorage.clear();
  state.guidance = 'guided';
  state.caseIndex = 0;
  state.ended = false;
  state.logs = [
    { type: 'officer', text: '방문 목적이 무엇입니까?' },
    { type: 'alien', text: '친구를 만나러 왔습니다.' }
  ];
  state.discoveredClues = new Set(['tm4']);

  const hint = currentCoachStep();
  assert.ok(hint);
  assert.equal(hint.step, 3);
  assert.equal(hint.target, 'decision');
});

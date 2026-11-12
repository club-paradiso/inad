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
  state.looked = new Set();
  state.stage = 'PRIMARY';

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
  state.looked = new Set();
  state.stage = 'PRIMARY';
  // v13: nothing recorded yet (not understood / no specific answer) keeps the coach on a first recorded answer
  state.asked = new Set();
  assert.equal(currentCoachStep().step, 1);
  assert.match(currentCoachStep().text, /통역/);
  state.asked = new Set(['purpose']);

  const hint = currentCoachStep();
  assert.ok(hint);
  assert.equal(hint.step, 2);
  assert.equal(hint.target, 'statement_lock');
  assert.match(hint.text, /일치하는 내용도/);
  assert.doesNotMatch(hint.text, /밝혀내/);
});

test('coach: offers assessment after a record check without requiring a clue', () => {
  localStorage.clear();
  state.guidance = 'guided';
  state.caseIndex = 0;
  state.ended = false;
  state.logs = [
    { type: 'officer', text: '방문 목적이 무엇입니까?' },
    { type: 'alien', text: '친구를 만나러 왔습니다.' }
  ];
  state.discoveredClues = new Set();
  state.looked = new Set(['visa']);
  state.asked = new Set(['purpose']);
  state.stage = 'PRIMARY';

  const hint = currentCoachStep();
  assert.ok(hint);
  assert.equal(hint.step, 3);
  assert.equal(hint.target, 'decision');
});

// Fairness invariant through the real decision path (case-engine → legal-engine), not just the legal-engine
// signatures: for every core case and a sample of generated cases, the verdict of 입국 허가, every 입국 불허가
// reason and 입국재심 is identical whatever the traveler's demeanour (stress / cooperation / style), language
// mode and levels, interpreter use and travel-party membership. The statutory interpreter rule for an
// investigation (출입국관리법 제48조제6항) is a procedural requirement and is not part of this property.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { state } from '../../src/js/state.js';
import { buildSession, current } from '../../src/js/engines/queue-engine.js';
import * as caseEngine from '../../src/js/engines/case-engine.js';
import * as legal from '../../src/js/engines/legal-engine.js';

buildSession(271828);
const { session } = await import('../../src/js/state.js');
const core = session.queue.map((q, i) => ({ q, i })).filter((x) => x.q.caseId);
const normal = session.queue.map((q, i) => ({ q, i })).filter((x) => !x.q.caseId).slice(0, 8);
const fakeParty = { label: '가족 동행(가상)', members: [], sharedPNR: 'SIMPNR', hotel: '가상 숙소' };

const VARIANTS = {
  baseline: () => {},
  agitated: () => { state.behavior = { ...state.behavior, stress: 100, rapport: 0, profile: { ...state.behavior.profile, style: 'upset' } }; },
  composed: () => { state.behavior = { ...state.behavior, stress: 0, rapport: 100, profile: { ...state.behavior.profile, style: 'calm' } }; },
  noCommonLanguage: () => { state.language = { ...state.language, mode: 'none', korean: 0, english: 0, interpreterActive: false }; },
  interpreter: () => { state.language = { ...state.language, interpreterActive: true }; },
  fluent: () => { state.language = { ...state.language, mode: 'ko', korean: 4, english: 4, interpreterActive: false }; },
  inParty: () => { state.party = fakeParty; },
  alone: () => { state.party = null; }
};

function verdict(index, variant, act, performed) {
  Object.assign(state, { caseIndex: index, strikes: 0, score: 100, mistakes: [], guidance: 'expert', difficulty: 'standard' });
  caseEngine.initCase(true);
  const c = current();
  state.performed = performed === 'all' ? [...(c.required || [])] : [];
  VARIANTS[variant]();
  const r = act === 'clear' ? caseEngine.decideClear() : act === 'secondary' ? caseEngine.secondary() : caseEngine.decideRefusal(act);
  return JSON.stringify({ ok: !!r.ok, guard: !!r.guard, gameOver: !!r.gameOver, finish: r.finish || null, reason: r.reason?.[0] || null, stage: state.stage, strikes: state.strikes });
}

const ACTS = ['clear', 'secondary', ...legal.refusalReasons.map((r) => r[0])];

test('the sample covers every core case and generated cases', () => {
  assert.equal(core.length, 12);
  assert.ok(normal.length >= 8);
});

for (const { q, i } of [...core, ...normal]) {
  test(`verdicts do not depend on demeanour, language, interpreter or party · ${q.caseId || q.normalId}`, () => {
    for (const performed of ['all', 'none']) for (const act of ACTS) {
      const base = verdict(i, 'baseline', act, performed);
      for (const v of Object.keys(VARIANTS)) assert.equal(verdict(i, v, act, performed), base, `${act} · ${performed} · ${v}`);
    }
  });
}

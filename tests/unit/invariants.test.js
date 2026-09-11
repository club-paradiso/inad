// Fairness invariants: nationality, behaviour, language and operational modifiers never alter a legal verdict.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import * as legal from '../../src/js/engines/legal-engine.js';
import { CASES } from '../../src/data/cases.js';
import { BEHAVIOR_PROFILES } from '../../src/data/behavior-profiles.js';
import { SCENARIOS, DIFFICULTY_CONFIG } from '../../src/data/operations.js';
import { CAMPAIGNS } from '../../src/data/campaigns.js';
import { LANGUAGE_META } from '../../src/data/language.js';
import { TRAVELER_POOL } from '../../src/data/travelers.js';
import fs from 'node:fs';

test('legal verdict functions take no nationality, behaviour or language arguments except the statutory interpreter rule', () => {
  const c = CASES[0];
  const v1 = legal.validateClear(c, c.required), v2 = legal.validateClear({ ...c, code: 'ZZZ', nat: '가상국' }, c.required);
  assert.deepEqual(v1, v2);
  const r = CASES.find((x) => x.id === 'ICN-S2-005');
  assert.deepEqual(legal.validateRefusal(r, 'SIM-A12-PUR', r.required), legal.validateRefusal({ ...r, code: 'ZZZ' }, 'SIM-A12-PUR', r.required));
});

test('no risk score is derived from nationality anywhere in the engines', () => {
  const dir = new URL('../../src/js/engines/', import.meta.url);
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/nationality[^\n]{0,60}(risk|score|threat)/i.test(src), `${f} must not map nationality to risk`);
    assert.ok(!/risk\s*(score|Score)\s*[:=]/.test(src), `${f} must not compute a risk score`);
  }
});

test('behaviour profiles only shape dialogue and are never inputs to legal-engine', () => {
  const src = fs.readFileSync(new URL('../../src/js/engines/legal-engine.js', import.meta.url), 'utf8');
  assert.ok(!/behavior|stress|rapport/i.test(src));
  for (const p of BEHAVIOR_PROFILES) assert.ok(p.style && typeof p.stress === 'number');
});

test('operational modifiers (difficulty, scenario, campaign carry) do not touch requirements or resolutions', () => {
  for (const d of Object.values(DIFFICULTY_CONFIG)) assert.deepEqual(Object.keys(d).sort(), ['arrivalEvery', 'desc', 'eventCount', 'impact', 'label', 'workFactor']);
  for (const s of Object.values(SCENARIOS)) assert.ok(!('required' in s) && !('resolution' in s));
  for (const c of Object.values(CAMPAIGNS)) for (const day of c.days) assert.deepEqual(Object.keys(day).sort(), ['note', 'scenario', 'title']);
});

test('language metadata is descriptive only (no admissibility fields)', () => {
  for (const [code, meta] of Object.entries(LANGUAGE_META)) { assert.equal(meta.length, 2, code); }
  assert.ok(!TRAVELER_POOL.some((t) => 'risk' in t || 'threat' in t));
});

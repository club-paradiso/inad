// Scoring helpers shared by the legal, operation and career engines.
import { state } from '../state.js';

export function clampScore(v) { return Math.max(0, Math.min(100, Math.round(v))); }
export function procedureAverage() { if (!state.reports.length) return 100; return Math.round(state.reports.reduce((a, r) => a + r.procedure, 0) / state.reports.length); }

// Processing efficiency is intentionally a secondary score in Training/Standard.
// Accuracy and procedure should dominate while players are still learning the workflow.
export function scoringWeights() {
  if (state.difficulty === 'training') return { accuracy: .50, procedure: .30, efficiency: .10, proportionality: .10 };
  if (state.difficulty === 'standard') return { accuracy: .48, procedure: .28, efficiency: .14, proportionality: .10 };
  return { accuracy: .45, procedure: .25, efficiency: .20, proportionality: .10 };
}
export function overallScore() {
  const w = scoringWeights();
  return clampScore(state.score * w.accuracy + procedureAverage() * w.procedure + state.efficiency * w.efficiency + state.proportionality * w.proportionality);
}

// Operational score no longer charges full price for the same inefficiency twice in easier modes.
// Repeated actions still consume simulated time, so they remain costly without feeling punitive.
export function operationalScore() {
  const difficulty = state.difficulty || 'standard';
  const p = difficulty === 'training'
    ? { fatigueFloor: 94, fatigue: .55, secondary: .75, rushed: 0, question: .25, lookup: .10 }
    : difficulty === 'standard'
      ? { fatigueFloor: 90, fatigue: .9, secondary: 1.25, rushed: 1.5, question: .5, lookup: .20 }
      : { fatigueFloor: 85, fatigue: 1.5, secondary: 2, rushed: 3, question: 1, lookup: .5 };
  return clampScore(
    100
    - Math.max(0, (state.fatigue || 0) - p.fatigueFloor) * p.fatigue
    - state.overSecondary * p.secondary
    - state.rushed * p.rushed
    - Math.min(8, state.repeatedQuestions * p.question)
    - Math.min(6, state.repeatedLookups * p.lookup)
  );
}
export function workloadClass(v) { return v >= 90 ? 'good' : v >= 75 ? 'warn' : 'bad'; }
export function gradeFor() { const overall = overallScore(); return state.strikes === 0 && overall >= 92 ? 'S' : overall >= 82 ? 'A' : overall >= 70 ? 'B' : 'C'; }

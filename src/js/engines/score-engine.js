// Scoring helpers shared by the legal, operation and career engines.
import { state } from '../state.js';

export function clampScore(v) { return Math.max(0, Math.min(100, Math.round(v))); }
export function procedureAverage() { if (!state.reports.length) return 100; return Math.round(state.reports.reduce((a, r) => a + r.procedure, 0) / state.reports.length); }
export function overallScore() { return clampScore(state.score * .45 + procedureAverage() * .25 + state.efficiency * .20 + state.proportionality * .10); }
export function operationalScore() { return clampScore(100 - Math.max(0, (state.fatigue || 0) - 85) * 1.5 - state.overSecondary * 2 - state.rushed * 3 - Math.min(8, state.repeatedQuestions)); }
export function workloadClass(v) { return v >= 90 ? 'good' : v >= 75 ? 'warn' : 'bad'; }
export function gradeFor() { const overall = overallScore(); return state.strikes === 0 && overall >= 92 ? 'S' : overall >= 82 ? 'A' : overall >= 70 ? 'B' : 'C'; }

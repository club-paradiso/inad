// Case of the Day (v10, DOM-free). Everyone gets the same case and the same seed on the same Korean calendar day,
// so results are comparable. The result object below is the aggregation-ready shape (docs/v10-live-interview-spec.md
// §9): it holds no personal data and no free text, so an opt-in aggregate endpoint could accept it unchanged later.
// Today it is only kept locally (key `inad-daily-v10`, last 30 days) and offered as share text.
import { CASES } from '../../data/cases.js';
import { hashSeed, localDateKey } from './rng.js';
import { jsonGet, jsonSet } from '../services/storage.js';

export const DAILY_KEY = 'inad-daily-v10';
const PROCEDURE_STEPS = ['SECONDARY', 'REFUGEE_CLAIM', 'REFERRAL_SCREENING', 'NON_REFERRAL', 'FORENSIC_REVIEW', 'INVESTIGATION', 'ARREST_REVIEW', 'ARRESTED', 'CLEAR', 'ENTRY_REFUSED', 'REPATRIATION_ORDER', 'DEPARTURE_WAITING_AREA'];

export function dailyCase(dateKey = localDateKey()) {
  const h = hashSeed(`INAD|DAILY|${dateKey}`);
  const c = CASES[h % CASES.length];
  return { dateKey, caseId: c.id, seed: 100000 + (hashSeed(`INAD|DAILY-SEED|${dateKey}`) % 900000) };
}

// report: case-engine finishCase report · debrief: debrief-engine output · interview: interviewSummary()
export function dailyResult(dateKey, c, report, debrief, interview) {
  const keys = (c.clues || []).filter((x) => x.key).length;
  return {
    v: 1, dateKey, caseId: c.id, decision: report.label, reasonCode: debrief?.basis?.code || null,
    procedure: report.procedure, seconds: report.seconds, correctedAttempts: (report.mistakes || []).length,
    keyClues: { found: keys - (debrief?.evidence?.missed?.length || 0), total: keys },
    keyMissed: (debrief?.evidence?.missed || []).map((x) => x.title),
    questionsAsked: debrief?.questions?.total || 0,
    turnsBySource: interview ? { ...interview.counts } : null,
    procedurePath: (report.actions || []).filter((a) => PROCEDURE_STEPS.includes(a))
  };
}

const valid = (r) => r && typeof r === 'object' && r.v === 1 && /^\d{4}-\d{2}-\d{2}$/.test(r.dateKey) && typeof r.caseId === 'string';
export function loadDailyResults() { const all = jsonGet(DAILY_KEY, {}); return all && typeof all === 'object' && !Array.isArray(all) ? Object.fromEntries(Object.entries(all).filter(([k, v]) => valid(v) && v.dateKey === k)) : {}; }
// The first finished attempt of a day is the day's result; replays never overwrite it.
export function saveDailyResult(result) {
  if (!valid(result)) return false; const all = loadDailyResults(); if (all[result.dateKey]) return false;
  all[result.dateKey] = result; const keep = Object.keys(all).sort().slice(-30);
  return jsonSet(DAILY_KEY, Object.fromEntries(keep.map((k) => [k, all[k]])));
}

// Share text never names the decision or the case: it must not spoil the day for anyone who has not played.
export function shareText(r) {
  return [`INAD: 제12조 · 오늘의 사건 ${r.dateKey}`, `핵심 단서 ${r.keyClues.found}/${r.keyClues.total} · 절차 준수 ${r.procedure}%`, `질문 ${r.questionsAsked} · 바로잡힌 시도 ${r.correctedAttempts}`].join('\n');
}

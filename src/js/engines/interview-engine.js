// Interview engine (v10 Live Interview): one entry point for every way the examiner can address the passenger —
// a suggested question, the full question list, typed text or recognised speech. All of them end in the same
// deterministic disclosure path:
//
//   utterance → intent (engines/intent-engine.js) → existing case question → case-engine ask()  ← only evidence path
//                                                  ↘ not unlocked yet → `withheld` line (public facts only)
//                                                  ↘ not understood   → clarification line (no facts)
//
// The case data, ask(), the clue triggers and every verdict stay exactly as in v9. Which surface was used is kept
// for analytics only and must never change score, work time or outcome (tests/unit/dialogue.test.js).
import { state } from '../state.js';
import { current } from './queue-engine.js';
import { ask, selectDocument } from './case-engine.js';
import { questionUnlocked } from './clue-engine.js';
import { requestInterpreter, setInterviewLanguage, communicationReady } from './language-engine.js';
import { resolveUtterance, normalizeUtterance, MAX_UTTERANCE } from './intent-engine.js';
import { personaFor } from '../../data/personas.js';
import { addLog } from './log.js';
import { bus } from '../services/bus.js';

export const SOURCES = ['suggestion', 'list', 'text', 'voice', 'clarify'];

// Per-case record. A new case gets a new state.logs array, which resets it.
export function interviewRecord() {
  const c = current();
  if (!state.interview || state.interview.logs !== state.logs) {
    state.interview = { logs: state.logs, caseId: c?.id || null, turns: [], counts: { suggestion: 0, list: 0, text: 0, voice: 0, clarify: 0 }, unmatched: 0, withheld: 0, lastAnswer: null, pending: null, lastKind: null, languageMiss: 0 };
  }
  return state.interview;
}

const pick = (list, n) => (Array.isArray(list) && list.length ? list[Math.abs(n) % list.length] : '');
function fill(line, c) { return String(line || '').replace('{initial}', c.initial || ''); }
function sayOffRecord(text, mood, c, rec) {
  rec.pending = { alien: { offRecord: true, mood } }; addLog('alien', fill(text, c)); rec.pending = null;
}
function heard(raw, source, rec, extra = {}) {
  rec.pending = { officer: { utterance: raw, source, ...extra } };
}

// The single dispatcher. `questionId` is given by buttons; `text` by typing or speech. Returns a plain result the
// UI turns into avatar acting and focus; every visible line is already in state.logs.
export function submitUtterance({ text = '', questionId = null, source = 'text' } = {}) {
  const c = current(); if (!c) return { kind: 'none' };
  const rec = interviewRecord();
  if (state.ended) return { kind: 'ended' };
  const src = SOURCES.includes(source) ? source : 'text';
  const raw = String(text || '').slice(0, MAX_UTTERANCE).trim();
  const persona = personaFor(c.id);
  let route;
  if (questionId) route = (c.questions || []).some((q) => q.id === questionId) ? { kind: 'question', questionId } : { kind: 'unknown', candidates: [] };
  else route = resolveUtterance(raw, c);
  if (route.kind === 'empty') return { kind: 'empty' };
  rec.counts[src]++;
  const turn = { at: state.caseWorkSeconds, source: src, kind: route.kind, questionId: route.questionId || null };
  rec.turns.push(turn);
  const n = rec.turns.length;
  let result;

  if (route.kind === 'question') {
    const q = c.questions.find((x) => x.id === route.questionId);
    const typed = !questionId && normalizeUtterance(raw) !== normalizeUtterance(q.q);
    if (!questionUnlocked(q)) {
      // Disclosure condition not met: the passenger stays with what is on record. Nothing is marked asked.
      rec.withheld++; heard(raw || q.q, src, rec, { matched: q.id, offRecord: true }); addLog('officer', raw || q.q); rec.pending = null;
      sayOffRecord(persona.withheld?.[q.id] || persona.withheldDefault, 'withheld', c, rec);
      if (state.guidance === 'guided') addLog('system', '구체적인 답을 듣지 못했습니다. 관련 자료를 더 확인한 뒤 같은 내용을 다시 물어볼 수 있습니다.');
      bus.emit('changed');
      result = { kind: 'withheld', questionId: q.id, mood: 'withheld' };
    } else {
      const repeat = state.asked.has(q.id); const d = persona.delivery?.[q.id] || {};
      const mood = d.mood || (q.contradiction ? 'hesitant' : 'plain'); const understood = communicationReady(q).ok;
      rec.pending = { officer: typed ? { utterance: raw, source: src, matched: q.id } : { source: src }, alien: understood ? { mood: repeat ? 'plain' : mood, lead: repeat ? '' : (d.lead || '') } : { mood: 'confused' } };
      const r = ask(q, repeat); rec.pending = null;
      if (r.language) { rec.languageMiss++; result = { kind: 'language', questionId: q.id, mood: 'confused' }; }
      else if (!r.ok) result = { kind: 'locked', questionId: q.id, mood: 'withheld' };
      else { const answer = [...state.logs].reverse().find((x) => x.type === 'alien'); rec.lastAnswer = answer?.text || null; result = { kind: 'answer', questionId: q.id, repeat, mood: repeat ? 'plain' : mood, evidence: true }; }
    }
  } else if (route.kind === 'meta') {
    heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
    if (route.intent === 'INTERPRETER') { if (!requestInterpreter()) sayOffRecord(pick(persona.wait, n), 'plain', c, rec); }
    else if (route.intent === 'LANG_KO') setInterviewLanguage('ko');
    else if (route.intent === 'LANG_EN') setInterviewLanguage('en');
    else if (route.intent === 'REPEAT') sayOffRecord(rec.lastAnswer || c.initial, 'plain', c, rec);
    else if (route.intent === 'GREETING') sayOffRecord(pick(persona.greeting, n), 'plain', c, rec);
    else if (route.intent === 'THANKS') sayOffRecord(pick(persona.thanks, n), 'relieved', c, rec);
    else sayOffRecord(pick(persona.wait, n), 'plain', c, rec);
    bus.emit('changed');
    result = { kind: 'meta', intent: route.intent, mood: route.intent === 'THANKS' ? 'relieved' : 'plain' };
  } else if (route.kind === 'document') {
    heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
    sayOffRecord(pick(persona.handover, n), 'document', c, rec);
    selectDocument(route.index);
    result = { kind: 'document', index: route.index, mood: 'document' };
  } else {
    // Not understood, or two questions fit equally: no fact is produced; the examiner rephrases or picks.
    rec.unmatched++; heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
    sayOffRecord(pick(persona.clarify, n), 'confused', c, rec);
    bus.emit('changed');
    result = { kind: route.kind, candidates: route.candidates || [], mood: 'confused' };
  }
  turn.kind = result.kind;
  rec.lastKind = result.kind;
  bus.emit('interview', { ...result, source: src });
  bus.emit('analytics', { name: 'interview_turn', source: src, kind: result.kind });
  return result;
}

export function interviewSummary(rec = state.interview) {
  if (!rec) return { turns: 0, counts: { suggestion: 0, list: 0, text: 0, voice: 0, clarify: 0 }, unmatched: 0, withheld: 0 };
  return { turns: rec.turns.length, counts: { ...rec.counts }, unmatched: rec.unmatched, withheld: rec.withheld };
}

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
import { resolveUtterance, normalizeUtterance, publicTopic, MAX_UTTERANCE } from './intent-engine.js';
import { checkLine } from './dialogue-guard.js';
import { personaFor } from '../../data/personas.js';
import { addLog } from './log.js';
import { bus } from '../services/bus.js';

export const SOURCES = ['suggestion', 'list', 'text', 'voice', 'clarify'];
// Below this confidence a typed/spoken match to an already-answered question is confirmed first (a re-ask costs
// efficiency under the v9 rule, and the examiner may have meant something else).
export const REPEAT_CONFIRM_BELOW = 0.62;

const docField = (c, keys, names) => { for (const d of c.docs || []) if (keys.includes(d.k)) for (const [k, v] of d.fields || []) if (names.includes(k)) return v; return null; };
// A line answering a common question from the submitted documents only, or null when the case has nothing public.
export function publicAnswer(c, topic) {
  let line = null;
  if (topic === 'PURPOSE') line = c.initial;
  else if (topic === 'LODGING') { const v = docField(c, ['E-ARRIVAL', 'HOTEL', 'STAY'], ['체류지', '숙소', '호텔', '숙박지']); if (v) line = `체류지는 ${v}입니다.`; }
  else if (topic === 'DURATION' && c.stay) line = `${c.stay}입니다.`;
  else if (topic === 'RETURN' && c.return) line = /없음|NONE/i.test(c.return) ? '귀국편은 없습니다.' : `귀국편은 ${c.return.split(' · ')[0]}입니다.`;
  else if (topic === 'CONTACT') { const v = docField(c, ['E-ARRIVAL'], ['연락처', '국내연락처']); if (v) line = `연락처는 ${v}입니다.`; }
  return line && checkLine(line, c).ok ? line : null;
}

// Per-case record. A new case gets a new state.logs array, which resets it.
// A new case starts a new record (case-engine emits 'case:init' from initCase); readers also check the log array.
bus.on('case:init', () => { state.interview = null; });
export function liveRecord() { return state.interview && state.interview.logs === state.logs ? state.interview : null; }

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
export function submitUtterance({ text = '', questionId = null, source = 'text', via = null } = {}) {
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
  const turn = { at: state.caseWorkSeconds, source: src, kind: route.kind, questionId: route.questionId || null, via: via === 'model' ? 'model' : questionId ? 'button' : 'lexicon' };
  rec.turns.push(turn);
  const n = rec.turns.length;
  let result;

  if (route.kind === 'question') {
    const q = c.questions.find((x) => x.id === route.questionId);
    const typed = !!raw && normalizeUtterance(raw) !== normalizeUtterance(q.q);
    // a model-classified question is treated like a lexicon match: an already-answered one is confirmed first
    const loose = via === 'model' || (!questionId && (route.score ?? 1) < REPEAT_CONFIRM_BELOW);
    if (loose && state.asked.has(q.id)) {
      heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
      sayOffRecord(pick(persona.repeatCheck, n), 'confused', c, rec); bus.emit('changed');
      result = { kind: 'repeatCheck', candidates: [q.id], mood: 'confused' };
    } else if (!questionUnlocked(q)) {
      // Disclosure condition not met: the passenger stays with what is on record. Nothing is marked asked.
      rec.withheld++; heard(raw || q.q, src, rec, { matched: q.id, offRecord: true }); addLog('officer', raw || q.q); rec.pending = null;
      sayOffRecord(persona.withheld?.[q.id] || persona.withheldDefault, 'withheld', c, rec);
      if (state.guidance === 'guided') addLog('system', '구체적인 답을 듣지 못했습니다. 관련 자료를 더 확인한 뒤 같은 내용을 다시 물어볼 수 있습니다.');
      bus.emit('changed');
      result = { kind: 'withheld', questionId: q.id, mood: 'withheld' };
    } else {
      const repeat = state.asked.has(q.id); const d = persona.delivery?.[q.id] || {};
      // acting comes from the persona only (never from case ground-truth fields such as `contradiction`)
      const mood = d.mood || 'plain'; const understood = communicationReady(q).ok;
      rec.pending = { officer: typed ? { utterance: raw, source: src, matched: q.id } : { source: src }, alien: understood ? { mood: repeat ? 'plain' : mood, lead: repeat ? '' : (d.lead || ''), canonical: q.a } : { mood: 'confused' } };
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
  } else if (route.kind === 'unknown' && publicAnswer(c, publicTopic(raw))) {
    // Not a question of this case, but the submitted documents answer it: say what is already on record.
    heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
    sayOffRecord(publicAnswer(c, publicTopic(raw)), 'plain', c, rec); bus.emit('changed');
    result = { kind: 'public', topic: publicTopic(raw), mood: 'plain' };
  } else {
    // Not understood, or two questions fit equally: no fact is produced; the examiner rephrases or picks.
    rec.unmatched++; heard(raw, src, rec, { offRecord: true }); addLog('officer', raw); rec.pending = null;
    sayOffRecord(pick(persona.clarify, n), 'confused', c, rec);
    bus.emit('changed');
    result = { kind: route.kind, candidates: route.candidates || [], mood: 'confused' };
  }
  turn.kind = result.kind;
  rec.lastKind = result.kind;
  // suggestions read lastKind (interpreter after a misunderstanding): refresh once it is known
  if (result.kind === 'language') bus.emit('changed');
  bus.emit('interview', { ...result, source: src });
  bus.emit('analytics', { name: 'interview_turn', source: src, kind: result.kind, mode: turn.via });
  return result;
}

export function interviewSummary(rec = liveRecord()) {
  if (!rec) return { turns: 0, counts: { suggestion: 0, list: 0, text: 0, voice: 0, clarify: 0 }, unmatched: 0, withheld: 0 };
  return { turns: rec.turns.length, counts: { ...rec.counts }, unmatched: rec.unmatched, withheld: rec.withheld };
}

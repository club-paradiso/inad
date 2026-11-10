// NPC Intelligence Layer — bounded conversation memory (pure).
//
// One memory per case, held in the per-case interview record (interview-engine), so it is discarded with that
// record on a new case, a retry, a reset or the end of the session; it is never saved. It keeps question ids and
// turn kinds only — what was discussed and disclosed — never raw player text (the visible interview log already
// shows what was said, under the existing per-case log rules) and never an answer that was not given.
import { LIMITS } from './npc-contract.js';

export function createMemory() {
  return { asked: [], disclosed: [], repeats: {}, withheld: {}, lastTopic: null, lastAnswered: null, turns: [] };
}

// Record the outcome of one dispatched turn. `result` is the interview-engine result object.
export function noteTurn(mem, result) {
  if (!mem || !result) return mem;
  const id = typeof result.questionId === 'string' ? result.questionId : (result.candidates?.[0] || null);
  const kind = result.kind === 'answer' && result.repeat ? 'repeat' : result.kind;
  if (result.kind === 'answer') {
    if (!result.repeat) { if (!mem.asked.includes(id)) mem.asked.push(id); const f = `q:${id}`; if (!mem.disclosed.includes(f)) mem.disclosed.push(f); }
    else mem.repeats[id] = (mem.repeats[id] || 0) + 1;
    mem.lastTopic = id; mem.lastAnswered = id;
  } else if (result.kind === 'withheld') { mem.withheld[id] = (mem.withheld[id] || 0) + 1; mem.lastTopic = id; }
  else if (result.kind === 'repeatCheck') mem.lastTopic = id;
  else if (result.kind === 'document' && result.key) { const f = `doc:${result.key}`; if (!mem.disclosed.includes(f)) mem.disclosed.push(f); }
  mem.turns.push({ kind, questionId: ['answer', 'withheld', 'repeatCheck'].includes(result.kind) ? id : null });
  if (mem.turns.length > LIMITS.memoryTurns) mem.turns.splice(0, mem.turns.length - LIMITS.memoryTurns);
  return mem;
}

// How many times the passenger has already been asked this (answered) question again.
export function repeatCount(mem, id) { return mem?.repeats?.[id] || 0; }
export function withheldCount(mem, id) { return mem?.withheld?.[id] || 0; }

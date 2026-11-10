// Drives the real interview engine (node, no DOM) through scripted turns — used by tests/unit/npc-layer.test.js and
// scripts/eval-dialogue.js. It applies the same hybrid policy as ui/live-interview.js: the deterministic engine
// first (with the interview's id-only memory); an optional classifier only when that could not place the utterance;
// a classifier's id is offered for confirmation and recorded only once "the examiner" accepts it.
import '../unit/setup.js';
import { state, session } from '../../src/js/state.js';
import { buildSession, current } from '../../src/js/engines/queue-engine.js';
import * as caseEngine from '../../src/js/engines/case-engine.js';
import { submitUtterance, interviewMemory } from '../../src/js/engines/interview-engine.js';
import { resolveUtterance } from '../../src/js/engines/intent-engine.js';
import { questionMenu } from '../../src/js/engines/npc-context.js';
import { validateClassification } from '../../src/js/engines/npc-contract.js';

let built = false;
export function openCase(id, { interpreter = true } = {}) {
  if (!built) { buildSession(271828); built = true; }
  const idx = session.queue.findIndex((q) => q.caseId === id); if (idx < 0) throw new Error(`no case ${id}`);
  Object.assign(state, { caseIndex: idx, strikes: 0, score: 100, efficiency: 100, proportionality: 100, mistakes: [], guidance: 'expert', difficulty: 'standard' });
  caseEngine.initCase(true);
  if (interpreter) state.language = { ...state.language, interpreterActive: true };
  return current();
}

export const evidenceSnapshot = () => JSON.stringify({ performed: state.performed, asked: [...state.asked].sort(), clues: [...state.discoveredClues].sort(), score: state.score, efficiency: state.efficiency, proportionality: state.proportionality, work: state.caseWorkSeconds, strikes: state.strikes, stage: state.stage });

// One examiner turn. `classifier(menu, text)` (optional, may be async) returns raw provider content.
// Returns { routed, result, via } where `routed` is the question the turn was read as (or null).
export async function playTurn(text, { classifier = null, accept = true, source = 'text' } = {}) {
  const c = current(); const mem = interviewMemory();
  const local = resolveUtterance(text, c, { lastTopic: mem?.lastTopic || null });
  let via = 'lexicon';
  if (classifier && (local.kind === 'unknown' || local.kind === 'ambiguous')) {
    const menu = questionMenu(c, { performed: state.performed });
    let content; try { content = await classifier(menu, text); } catch (e) { content = undefined; }
    const v = validateClassification(content, menu.map((q) => q.id));
    if (v.ok && v.questionId) {
      via = 'model';
      if (!accept) return { routed: v.questionId, result: { kind: 'confirm', candidates: [v.questionId] }, via };
      const result = submitUtterance({ text, questionId: v.questionId, source, via: 'model' });
      return { routed: v.questionId, result, via };
    }
  }
  let result = submitUtterance({ text, source });
  let routed = result.kind === 'confirm' || result.kind === 'repeatCheck' ? result.candidates[0] : ['answer', 'withheld', 'locked', 'language'].includes(result.kind) ? result.questionId : null;
  if (result.kind === 'confirm' && accept) result = submitUtterance({ text, questionId: result.candidates[0], source });
  return { routed, result, via };
}

export function routeMatches(expect, out) {
  if (expect.startsWith('multi:')) return out.result.kind === 'multi' && expect.slice(6).split('+').every((x) => out.result.candidates.includes(x));
  if (expect === 'unknown') return out.routed === null && !['meta', 'document'].includes(out.result.kind);
  if (expect.startsWith('meta:')) return out.result.kind === 'meta' && out.result.intent === expect.slice(5);
  if (expect.startsWith('doc:')) return out.result.kind === 'document';
  return out.routed === expect;
}
export const wrongRoute = (expect, out) => !!out.routed && !expect.startsWith('multi:') && out.routed !== expect && !expect.startsWith('meta:') && !expect.startsWith('doc:');

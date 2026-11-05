// Contextual question suggestions (v10). Pure and deterministic. Suggestions are conversation assistance: optional,
// never required, and they must not reveal the case's ground truth — so ranking uses only what the examiner can
// already see (which questions are open, which follow-ups just became possible, what failed in the conversation),
// never `required`, `resolution`, clue keys or the `contradiction` flag.
import { questionUnlocked } from './clue-engine.js';

export const ASSIST_LEVELS = ['guided', 'standard', 'professional', 'immersive'];
export const ASSIST_LIMIT = { guided: 4, standard: 3, professional: 2, immersive: 0 };

// performed: state.performed · asked: Set of asked ids · ctx: { level, lastKind, interpreterActive, languageMiss }
export function suggestQuestions(c, { performed = [], asked = new Set(), level = 'standard', lastKind = null, interpreterActive = false, languageMiss = 0, ended = false } = {}) {
  if (!c || ended) return [];
  const limit = ASSIST_LIMIT[level] ?? 3; const out = [];
  // Communication first: when a question was not understood, the next useful step is the interpreter.
  if (level !== 'immersive' && level !== 'professional' && !interpreterActive && (lastKind === 'language' || languageMiss >= 2)) out.push({ action: 'interpreter', reason: 'communication' });
  const unasked = (c.questions || []).map((q, i) => ({ q, i })).filter(({ q }) => !asked.has(q.id));
  const open = unasked.filter(({ q }) => questionUnlocked(q, performed));
  // Follow-ups whose condition is met (including Statement Lock `UNLOCK_Q_<id>`) come first, most recently opened first.
  const isFollowUp = (q) => (q.requires || []).length > 0 || performed.includes(`UNLOCK_Q_${q.id}`);
  const openedAt = (q) => Math.max(
    performed.lastIndexOf(`UNLOCK_Q_${q.id}`),
    ...(q.requires || []).map((r) => performed.lastIndexOf(r))
  );
  const follow = open.filter(({ q }) => isFollowUp(q)).sort((a, b) => openedAt(b.q) - openedAt(a.q) || a.i - b.i);
  const basic = open.filter(({ q }) => !isFollowUp(q));
  for (const { q } of follow) out.push({ q, reason: 'followup' });
  for (const { q } of basic) out.push({ q, reason: 'open' });
  // Questions whose answers are not disclosable yet are still askable (the passenger will stay with
  // what is on record), so they may fill leftover suggestion slots — ranked last, never displacing
  // a question that would actually produce an answer. Ranking still uses only visible state.
  const later = unasked.filter(({ q }) => !questionUnlocked(q, performed));
  for (const { q } of later) out.push({ q, reason: 'later' });
  return out.slice(0, Math.max(0, limit));
}

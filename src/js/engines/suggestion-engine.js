// Contextual question suggestions (v10). Pure and deterministic. Suggestions are conversation assistance: optional,
// never required, and they must not reveal the case's ground truth — so ranking uses only what the examiner can
// already see (which questions are open, which follow-ups just became possible, what failed in the conversation),
// never `required`, `resolution`, clue keys or the `contradiction` flag.
import { questionUnlocked } from './clue-engine.js';

// Question categories whose suggestions presuppose a submitted record, and the records that ground them.
const GROUNDING = {
  '여행·체류': { docs: ['PNR', 'BOARDING', 'HOTEL', 'STAY'], lookups: ['pnr'], said: /호텔|숙소|숙박|항공|비행기|귀국|돌아가|일정|여행/ },
  '국내관계': { docs: ['E-ARRIVAL', 'INVITATION', 'HOTEL', 'STAY'], lookups: ['contact'], said: /친구|가족|지인|초청|연락|아는 사람/ }
};
export const ASSIST_LEVELS = ['guided', 'standard', 'professional', 'immersive'];
export const ASSIST_LIMIT = { guided: 4, standard: 3, professional: 2, immersive: 0 };

// performed: state.performed · asked: Set of asked ids · ctx: { level, lastKind, interpreterActive, languageMiss }
export function suggestQuestions(c, { performed = [], asked = new Set(), level = 'standard', lastKind = null, interpreterActive = false, languageMiss = 0, ended = false } = {}) {
  if (!c || ended) return [];
  const limit = ASSIST_LIMIT[level] ?? 3; const out = [];
  // Communication first: when a question was not understood, the next useful step is the interpreter.
  if (level !== 'immersive' && level !== 'professional' && !interpreterActive && (lastKind === 'language' || languageMiss >= 2)) out.push({ action: 'interpreter', reason: 'communication' });
  const unasked = (c.questions || []).map((q, i) => ({ q, i })).filter(({ q }) => !asked.has(q.id));
  // A question about a submitted record is suggested once the examiner has looked at that record
  // (opened the document or ran the matching lookup), or once the passenger raised the topic themselves. Before that, the suggestion would hand over
  // what the record says before the examiner read it; such questions stay in the question list but are not suggested yet.
  const grounded = (q) => {
    const g = GROUNDING[q.cat]; if (!g) return true;
    if (g.said.test(c.initial || '')) return true; // the passenger already raised the topic in the opening statement
    const idx = (c.docs || []).map((d, i) => (g.docs.includes(d.k) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) return true;
    return idx.some((i) => performed.includes(`DOC_READ_${i}`)) || g.lookups.some((k) => performed.includes(`LOOKUP_${k}`));
  };
  const open = unasked.filter(({ q }) => questionUnlocked(q, performed) && grounded(q));
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
  const later = unasked.filter(({ q }) => !questionUnlocked(q, performed) && grounded(q));
  for (const { q } of later) out.push({ q, reason: 'later' });
  return out.slice(0, Math.max(0, limit));
}

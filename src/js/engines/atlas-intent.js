// Overseas free-text questions (DOM-free, deterministic): which question of the current international
// case did the officer ask? Typed Korean or English is compared with each question's own ko/en wording
// by shared interview concepts (data/dialogue-lexicon.js), Korean character bigrams and English tokens.
// Only questions the player can ask right now are candidates, so a locked follow-up is never revealed
// by guessing its wording. It never answers, creates facts or changes state: atlas-engine does that.
import { normalizeUtterance, conceptsOf as sharedConcepts, koBigrams, enTokens, overlap, MAX_UTTERANCE } from './intent-engine.js';
import { SHARED_CONCEPTS, ATLAS_CONCEPTS, DOC_NOUNS } from '../../data/atlas-dialogue-lexicon.js';
import { DOC_REQUEST_VERBS } from '../../data/dialogue-lexicon.js';

export const ATLAS_MATCH_THRESHOLD = 0.3;   // below: not understood
export const ATLAS_CONFIRM_BELOW = 0.5;     // between threshold and this: ask before treating it as asked
export const ATLAS_AMBIGUITY_MARGIN = 0.08; // best − second below this: ask which question was meant
export const ATLAS_DOC_REQUEST_BELOW = 0.75; // a document request wins unless a question matches this well
export { MAX_UTTERANCE };

// Shared concepts that make sense overseas, plus the overseas phrasing supplement.
const hits = (t, entry) => {
  const padded = ' ' + t.replace(/[?!.,;:()]/g, ' ') + ' ', squeezed = t.replace(/\s+/g, '');
  return entry.ko.some((stem) => squeezed.includes(stem.replace(/\s+/g, ''))) || entry.en.some((stem) => padded.includes(' ' + stem + ' '));
};
export function atlasConceptsOf(text) {
  const t = normalizeUtterance(text);
  const out = new Set([...sharedConcepts(t)].filter((k) => SHARED_CONCEPTS.includes(k)));
  for (const [k, v] of Object.entries(ATLAS_CONCEPTS)) if (hits(t, v)) out.add(k);
  return out;
}
// Question words and courtesies carry no topic on their own (concepts already capture "where" = lodging,
// "after" = what happens next). Tokens are 5-character stems, so "afternoon" and "after" share one.
const QUESTION_WORDS = new Set(['who', 'what', 'when', 'where', 'why', 'how', 'which', 'whose', 'whom', 'good', 'morni', 'after', 'eveni', 'hello', 'thank', 'thanks', 'pleas', 'sorry', 'excus', 'okay']);
const topicTokens = (text) => new Set([...enTokens(text)].filter((w) => !QUESTION_WORDS.has(w)));
const profiles = new WeakMap();
function profile(q) {
  let p = profiles.get(q); if (p) return p;
  p = { views: [atlasConceptsOf(q.q.ko), atlasConceptsOf(q.q.en)].filter((x) => x.size), bigrams: koBigrams(q.q.ko), tokens: topicTokens(q.q.en) };
  profiles.set(q, p); return p;
}

export function scoreAtlasQuestion(text, q) {
  const p = profile(q), uc = atlasConceptsOf(text);
  let concept = 0, shared = 0;
  for (const view of p.views) {
    let hit = 0; for (const k of uc) if (view.has(k)) hit++;
    shared = Math.max(shared, hit);
    if (hit) concept = Math.max(concept, hit / Math.sqrt(view.size * Math.max(uc.size, 1)));
  }
  // An utterance is in one language; take whichever wording it matches, plus concepts shared by both.
  const surface = Math.max(overlap(koBigrams(text), p.bigrams), overlap(topicTokens(text), p.tokens));
  return { score: 0.45 * concept + 0.65 * surface, surface, conflict: uc.size > 0 && shared === 0 };
}

// `available` is the list of questions the player may ask now (open + unlocked follow-ups).
export function resolveAtlasUtterance(text, available) {
  if (typeof text !== 'string') return { kind: 'unknown' };
  const t = normalizeUtterance(text);
  if (!t) return { kind: 'empty' };
  const scored = available.map((q) => ({ id: q.id, ...scoreAtlasQuestion(t, q) })).sort((a, b) => b.score - a.score);
  const [best, second] = scored;
  const verbs = { ko: DOC_REQUEST_VERBS.ko, en: DOC_REQUEST_VERBS.en };
  if (hits(t, verbs) && hits(t, DOC_NOUNS) && (!best || best.score < ATLAS_DOC_REQUEST_BELOW)) return { kind: 'document' };
  if (!best || best.score < ATLAS_MATCH_THRESHOLD) return { kind: 'unknown' };
  if (second && second.score >= ATLAS_MATCH_THRESHOLD && best.score - second.score < ATLAS_AMBIGUITY_MARGIN) return { kind: 'ambiguous', candidates: [best.id, second.id] };
  const score = Math.round(best.score * 1000) / 1000;
  // Never asked silently: a match on concepts alone (no shared wording), or wording that matches while the
  // utterance's own topic (e.g. a previous visit) is not what the question is about. The player confirms.
  const unsure = best.score < ATLAS_CONFIRM_BELOW || best.surface === 0 || best.conflict;
  return { kind: unsure ? 'confirm' : 'question', questionId: best.id, score };
}

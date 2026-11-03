// Overseas free-text questions (DOM-free, deterministic): which question of the current international
// case did the officer ask? Typed Korean or English is compared with each question's own ko/en wording
// by shared interview concepts (data/dialogue-lexicon.js), Korean character bigrams and English tokens.
// Only questions the player can ask right now are candidates, so a locked follow-up is never revealed
// by guessing its wording. It never answers, creates facts or changes state: atlas-engine does that.
import { normalizeUtterance, conceptsOf as sharedConcepts, koBigrams, enTokens, overlap, MAX_UTTERANCE } from './intent-engine.js';
import { SHARED_CONCEPTS, ATLAS_CONCEPTS } from '../../data/atlas-dialogue-lexicon.js';

export const ATLAS_MATCH_THRESHOLD = 0.3;   // below: not understood
export const ATLAS_CONFIRM_BELOW = 0.5;     // between threshold and this: ask before treating it as asked
export const ATLAS_AMBIGUITY_MARGIN = 0.08; // best − second below this: ask which question was meant
export { MAX_UTTERANCE };

// Shared concepts that make sense overseas, plus the overseas phrasing supplement.
export function atlasConceptsOf(text) {
  const t = normalizeUtterance(text), padded = ' ' + t.replace(/[?!.,;:()]/g, ' ') + ' ', squeezed = t.replace(/\s+/g, '');
  const out = new Set([...sharedConcepts(t)].filter((k) => SHARED_CONCEPTS.includes(k)));
  for (const [k, v] of Object.entries(ATLAS_CONCEPTS)) {
    if (v.ko.some((stem) => squeezed.includes(stem.replace(/\s+/g, ''))) || v.en.some((stem) => padded.includes(' ' + stem))) out.add(k);
  }
  return out;
}
// Question words carry no topic on their own (concepts already capture "where" = lodging etc.).
const QUESTION_WORDS = new Set(['who', 'what', 'when', 'where', 'why', 'how', 'which', 'whose', 'whom']);
const topicTokens = (text) => new Set([...enTokens(text)].filter((w) => !QUESTION_WORDS.has(w)));
const profiles = new WeakMap();
function profile(q) {
  let p = profiles.get(q); if (p) return p;
  p = { views: [atlasConceptsOf(q.q.ko), atlasConceptsOf(q.q.en)].filter((x) => x.size), bigrams: koBigrams(q.q.ko), tokens: topicTokens(q.q.en) };
  profiles.set(q, p); return p;
}

export function scoreAtlasQuestion(text, q) {
  const p = profile(q), uc = atlasConceptsOf(text);
  let concept = 0;
  for (const view of p.views) {
    let hit = 0; for (const k of uc) if (view.has(k)) hit++;
    if (hit) concept = Math.max(concept, hit / Math.sqrt(view.size * Math.max(uc.size, 1)));
  }
  // An utterance is in one language; take whichever wording it matches, plus concepts shared by both.
  const surface = Math.max(overlap(koBigrams(text), p.bigrams), overlap(topicTokens(text), p.tokens));
  return { score: 0.45 * concept + 0.65 * surface, surface };
}

// `available` is the list of questions the player may ask now (open + unlocked follow-ups).
export function resolveAtlasUtterance(text, available) {
  const t = normalizeUtterance(text);
  if (!t) return { kind: 'empty' };
  const scored = available.map((q) => ({ id: q.id, ...scoreAtlasQuestion(t, q) })).sort((a, b) => b.score - a.score);
  const [best, second] = scored;
  if (!best || best.score < ATLAS_MATCH_THRESHOLD) return { kind: 'unknown' };
  if (second && second.score >= ATLAS_MATCH_THRESHOLD && best.score - second.score < ATLAS_AMBIGUITY_MARGIN) return { kind: 'ambiguous', candidates: [best.id, second.id] };
  const score = Math.round(best.score * 1000) / 1000;
  // A match on concepts alone (no shared wording) is never asked silently: the player confirms it.
  return { kind: best.score < ATLAS_CONFIRM_BELOW || best.surface === 0 ? 'confirm' : 'question', questionId: best.id, score };
}

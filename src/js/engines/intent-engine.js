// Intent engine (DOM-free, deterministic): which existing question of the current case did the examiner ask?
// Free text and recognised speech are compared with each question by shared interview *concepts*
// (data/dialogue-lexicon.js, applied to the question text itself) plus Korean character-bigram and English
// token overlap. The result is one of: a question id, an ambiguity between two questions, a meta intent
// (greeting, interpreter, language, repeat, document hand-over) or "unknown". It never decides what is true.
import { CONCEPTS, META_INTENTS, DOC_REQUESTS, DOC_REQUEST_VERBS, STOPWORDS_KO, STOPWORDS_EN } from '../../data/dialogue-lexicon.js';
import { PERSONAS } from '../../data/personas.js';

export const MATCH_THRESHOLD = 0.34;   // below: not understood
export const AMBIGUITY_MARGIN = 0.11;  // best − second below this: ask which one was meant
export const MAX_UTTERANCE = 240;

export function normalizeUtterance(text) {
  return String(text ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, MAX_UTTERANCE)
    .toLowerCase().replace(/[“”"‘’`]/g, "'").replace(/\s+/g, ' ').trim();
}

// Korean stems also match with the spaces removed ("집 주인" = "집주인", "왜 한국 왔어" ⊃ "왜왔" is NOT implied:
// only the stem's own spacing is ignored, word order still matters).
const hasStem = (text, padded, stem, squeezed) => {
  if (/^[\x20-\x7e]+$/.test(stem)) { const s = stem.trim(); if (!s) return false; const i = padded.indexOf(' ' + s); return i >= 0; }
  return text.includes(stem) || squeezed.includes(stem.replace(/\s+/g, ''));
};
function stemsHit(text, entry) {
  const padded = ' ' + text.replace(/[?!.,;:()]/g, ' ') + ' '; const squeezed = text.replace(/\s+/g, '');
  return (entry.ko || []).some((s) => hasStem(text, padded, s, squeezed)) || (entry.en || []).some((s) => hasStem(text, padded, s, squeezed));
}

export function conceptsOf(text) {
  const t = normalizeUtterance(text); const out = new Set();
  for (const [k, v] of Object.entries(CONCEPTS)) if (stemsHit(t, v)) out.add(k);
  return out;
}

function koBigrams(text) {
  let t = normalizeUtterance(text); for (const w of STOPWORDS_KO) t = t.split(w).join(' ');
  const out = new Set(); for (const word of t.split(/[^가-힣]+/)) for (let i = 0; i + 1 < word.length; i++) out.add(word.slice(i, i + 2));
  return out;
}
function enTokens(text) {
  return new Set(normalizeUtterance(text).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOPWORDS_EN.includes(w)).map((w) => w.slice(0, 5)));
}
const overlap = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.sqrt(a.size * b.size); };

// Per-question profile, cached by question object (case data is immutable at runtime).
const profiles = new WeakMap();
function profile(q, caseId) {
  let p = profiles.get(q); if (p) return p;
  const en = PERSONAS[caseId]?.en?.[q.id] || '';
  // Korean question text and the persona's English gloss are separate views of the same question.
  p = { views: [conceptsOf(q.q), en ? conceptsOf(en) : null].filter((x) => x && x.size), bigrams: koBigrams(q.q), tokens: enTokens(en) }; profiles.set(q, p); return p;
}

// Concept weights per case (inverse document frequency over the case's questions): a concept that only one
// question carries (PHONE, HOUSE_OWNER) identifies it; one that many carry (RELATION, EXPLAIN) barely does.
const idfCache = new WeakMap();
function conceptWeights(c) {
  let w = idfCache.get(c); if (w) return w;
  const qs = c?.questions || [], df = new Map();
  for (const q of qs) { const seen = new Set(); for (const v of profile(q, c.id).views) for (const k of v) seen.add(k); for (const k of seen) df.set(k, (df.get(k) || 0) + 1); }
  w = new Map([...df].map(([k, n]) => [k, Math.log(1 + qs.length / n)])); idfCache.set(c, w); return w;
}

export function scoreQuestion(utterance, q, caseId, c = null) {
  const p = profile(q, caseId), uc = conceptsOf(utterance), w = c ? conceptWeights(c) : new Map();
  const wt = (k) => w.get(k) || 1;
  // Recall-weighted: an utterance may carry context ("연락처 조회해 보니 …") on top of what it asks.
  let conceptScore = 0, shared = 0; let uw = 0; for (const k of uc) uw += wt(k);
  for (const view of p.views) {
    let n = 0, hit = 0, total = 0; for (const k of view) total += wt(k); for (const k of uc) if (view.has(k)) { n++; hit += wt(k); }
    if (n) { const v = hit / Math.sqrt(total * (uw || total)); if (v > conceptScore) { conceptScore = v; shared = n; } }
  }
  const bi = overlap(koBigrams(utterance), p.bigrams), tok = overlap(enTokens(utterance), p.tokens);
  return 0.62 * conceptScore + 0.28 * bi + 0.22 * tok + (shared >= 2 ? 0.06 : 0);
}

function metaIntent(t) { for (const [k, v] of Object.entries(META_INTENTS)) if (stemsHit(t, v)) return k; return null; }
function docRequest(t, c) {
  if (!stemsHit(t, DOC_REQUEST_VERBS) || conceptsOf(t).has('PHONE')) return null;
  for (const [k, v] of Object.entries(DOC_REQUESTS)) if (stemsHit(t, v)) { const i = (c.docs || []).findIndex((d) => d.k === k); if (i >= 0) return { key: k, index: i }; }
  return null;
}

// Resolve an utterance against the current case. `c` is a case object (questions, docs).
export function resolveUtterance(text, c) {
  const t = normalizeUtterance(text);
  if (!t) return { kind: 'empty' };
  const scored = (c.questions || []).map((q) => ({ q, score: scoreQuestion(t, q, c.id, c) })).sort((a, b) => b.score - a.score);
  const best = scored[0], second = scored[1];
  // A short meta utterance ("통역 불러 주세요", "hello") wins unless a question clearly matched as well.
  const meta = metaIntent(t);
  if (meta && (!best || best.score < MATCH_THRESHOLD + 0.1 || ['INTERPRETER', 'LANG_KO', 'LANG_EN'].includes(meta))) return { kind: 'meta', intent: meta };
  const doc = docRequest(t, c);
  if (doc && (!best || best.score < MATCH_THRESHOLD + 0.15)) return { kind: 'document', ...doc };
  if (!best || best.score < MATCH_THRESHOLD) return { kind: 'unknown', candidates: scored.slice(0, 2).filter((x) => x.score > 0.15).map((x) => x.q.id) };
  if (second && best.score - second.score < AMBIGUITY_MARGIN && second.score >= MATCH_THRESHOLD) return { kind: 'ambiguous', candidates: [best.q.id, second.q.id], score: best.score };
  return { kind: 'question', questionId: best.q.id, score: Math.round(best.score * 1000) / 1000 };
}

// Common questions the case catalogue does not ask but the submitted documents already answer. The passenger
// answers from the public record only (dialogue-guard re-checks the line), and no evidence is created.
export const PUBLIC_TOPICS = ['LODGING', 'DURATION', 'RETURN', 'CONTACT', 'PURPOSE'];
export function publicTopic(text) { const cs = conceptsOf(text); return PUBLIC_TOPICS.find((k) => cs.has(k)) || null; }

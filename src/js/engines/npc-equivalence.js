// NPC Intelligence Layer — Stage 3 research gate (pure). NOT wired into any game path.
//
// Question studied: could a model paraphrase an already-disclosed canonical answer without changing what it says?
// A token-overlap guard (dialogue-guard.checkLine) only proves that no NEW content word appears; it cannot see a
// dropped negation ("없습니다" → "있습니다"), a changed quantity, a lost qualifier ("정도"), or an omitted part.
// This checker is deliberately conservative: a candidate passes only when every independent check finds nothing.
// Passing is necessary, not sufficient — docs/npc-intelligence/ADR-004.md keeps generation disabled in every build;
// canonical authored dialogue is always what the record shows.
import { contentTokens } from './dialogue-guard.js';

const NEGATION = [/않/, /없/, /못/, /안 /, /아닙/, /아니/, /모르/, /모릅/, /\bnot\b/i, /n't\b/i, /\bnever\b/i, /\bno\b/i];
const QUALIFIERS = [/정도/, /약 /, /아마/, /쯤/, /잘 모르/, /정확한/, /아직/, /직접/, /\babout\b/i, /\bmaybe\b/i, /\broughly\b/i, /\byet\b/i];
const numbers = (s) => [...String(s).matchAll(/\d[\d,.]*/g)].map((m) => m[0].replace(/[,.]+$/, '')).sort();
const KO_NUM = /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|스무|백|천|만)\s?(명|번|달|개|살|시간|일|주|원|만원)/g;
const koNumbers = (s) => [...String(s).matchAll(KO_NUM)].map((m) => m[0].replace(/\s/g, '')).sort();
const flags = (s, list) => list.map((re) => re.test(s));

export function realizationCheck(canonical, candidate, { publicRecord = '' } = {}) {
  const reasons = [];
  const a = String(canonical || ''), b = String(candidate || '');
  if (!b.trim()) return { ok: false, reasons: ['empty'] };
  if (JSON.stringify(numbers(a)) !== JSON.stringify(numbers(b)) || JSON.stringify(koNumbers(a)) !== JSON.stringify(koNumbers(b))) reasons.push('quantity');
  if (JSON.stringify(flags(a, NEGATION)) !== JSON.stringify(flags(b, NEGATION))) reasons.push('negation');
  if (JSON.stringify(flags(a, QUALIFIERS)) !== JSON.stringify(flags(b, QUALIFIERS))) reasons.push('qualifier');
  const ta = contentTokens(a), tb = contentTokens(b); const pub = String(publicRecord).toLowerCase();
  const added = [...tb].filter((t) => !ta.has(t) && !pub.includes(t)); if (added.length) reasons.push('added-content');
  const dropped = [...ta].filter((t) => !tb.has(t) && ![...tb].some((x) => x.startsWith(t.slice(0, 2)))); if (dropped.length) reasons.push('omitted-content');
  const names = (s) => [...String(s).matchAll(/\b[A-Z][A-Za-z]{2,}\b|\b\d{2,3}-\d{3,4}-\d{4}\b/g)].map((m) => m[0]).sort();
  if (JSON.stringify(names(a)) !== JSON.stringify(names(b))) reasons.push('entity');
  return { ok: reasons.length === 0, reasons };
}

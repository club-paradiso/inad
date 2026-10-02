// Intent-engine accuracy over the labelled fixture (deterministic, no network): node scripts/eval-intents.js [--verbose]
import { CASES } from '../src/data/cases.js';
import { resolveUtterance } from '../src/js/engines/intent-engine.js';
import { INTENT_CASES } from '../tests/dialogue/intents.fixture.js';

export function evaluateIntents() {
  const rows = [];
  for (const [id, list] of Object.entries(INTENT_CASES)) {
    const c = CASES.find((x) => x.id === id.split('#')[0]);
    for (const [text, expect] of list) {
      const r = resolveUtterance(text, c);
      const got = r.kind === 'question' ? r.questionId : r.kind === 'meta' ? 'meta:' + r.intent : r.kind === 'document' ? 'doc:' + r.key : r.kind === 'ambiguous' ? 'ambiguous:' + r.candidates.join('|') : 'unknown';
      // An ambiguity that offers the right question is acceptable (the examiner picks); a wrong question is not.
      const ok = got === expect || (r.kind === 'ambiguous' && r.candidates.includes(expect));
      const wrongQuestion = r.kind === 'question' && got !== expect;
      rows.push({ id, text, expect, got, ok, wrongQuestion, score: r.score });
    }
  }
  const ok = rows.filter((r) => r.ok).length, wrong = rows.filter((r) => r.wrongQuestion).length;
  return { rows, total: rows.length, ok, wrong, accuracy: ok / rows.length };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = evaluateIntents();
  for (const x of r.rows) if (!x.ok || process.argv.includes('--verbose')) console.log(`${x.ok ? 'ok  ' : 'MISS'} ${x.id} ${JSON.stringify(x.text)} expect=${x.expect} got=${x.got} ${x.score ?? ''}`);
  console.log(`intent accuracy ${r.ok}/${r.total} (${(r.accuracy * 100).toFixed(1)}%) · wrong-question routes ${r.wrong}`);
}

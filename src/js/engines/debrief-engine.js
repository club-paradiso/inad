// Case debrief (v10, pure). Built only after a case has ended (finishCase), from the deterministic record:
// the case data, what the examiner performed, which clues were found, and the decision. It explains why the
// decision followed from the evidence and what an examiner could have looked at; it never changes a score.
import { refusalReason, caseLawRef, ACTION_NAMES } from './legal-engine.js';

const LOOKUPS = { history: '출입국기록', visa: '사증·입국자격', pnr: '항공 PNR', contact: '국내관계', party: '동행인 교차검증', public: '공개정보', forensic: '문서감식' };

// Plain-language description of how an action / clue trigger is reached.
export function describeAction(token, c) {
  if (!token) return '';
  if (token === 'INIT') return '심사 시작 시 확인';
  if (token.startsWith('QUESTION_')) { const q = (c.questions || []).find((x) => x.id === token.slice(9)); return q ? `질문 · ${q.q}` : token; }
  if (token.startsWith('LOOKUP_')) return `전산 조회 · ${LOOKUPS[token.slice(7)] || token.slice(7)}`;
  if (token.startsWith('DOC_')) { const d = (c.docs || []).find((x) => x.k === token.slice(4)); return `서류 확인 · ${d?.t || token.slice(4)}`; }
  return ACTION_NAMES[token] || token;
}

export function decisiveBasis(c) {
  const r = c.resolution || {};
  if (r.type === 'REFUSE' && r.reason) { const rr = refusalReason(r.reason); if (rr) return { code: rr[0], label: rr[1], law: rr[2] }; }
  if (r.type === 'CLEAR') return { code: null, label: `입국요건 확인 · ${c.basis || ''}`.trim(), law: '출입국관리법 제12조제3항' };
  return { code: null, label: r.type || '-', law: caseLawRef(c) };
}

// record: { performed, discoveredClues:Set|Array, asked:Set|Array, mistakes:[{msg}], label, interview }
export function buildDebrief(c, record) {
  const performed = record.performed || []; const done = new Set(performed);
  const found = new Set(record.discoveredClues || []); const asked = new Set(record.asked || []);
  const clues = c.clues || [];
  const evidenceFound = clues.filter((x) => found.has(x.id)).map((x) => ({ title: x.title, text: x.text, kind: x.kind, key: !!x.key, via: describeAction(x.trigger, c) }));
  const evidenceMissed = clues.filter((x) => x.key && !found.has(x.id)).map((x) => ({ title: x.title, text: x.text, kind: x.kind, via: describeAction(x.trigger, c) }));
  const required = c.required || [];
  const keyTriggers = new Set(clues.filter((x) => x.key).map((x) => x.trigger));
  const meaningful = (c.questions || []).filter((q) => asked.has(q.id) && (required.includes('QUESTION_' + q.id) || keyTriggers.has('QUESTION_' + q.id))).map((q) => q.q);
  const missedQuestions = (c.questions || []).filter((q) => !asked.has(q.id) && (required.includes('QUESTION_' + q.id) || keyTriggers.has('QUESTION_' + q.id))).map((q) => ({ q: q.q, gated: (q.requires || []).filter((r) => !done.has(r)).map((r) => describeAction(r, c)) }));
  const steps = required.filter((x) => !x.startsWith('QUESTION_'));
  const procedure = { done: steps.filter((x) => done.has(x)).map((x) => describeAction(x, c)), missing: steps.filter((x) => !done.has(x)).map((x) => describeAction(x, c)) };
  const offTrack = (record.mistakes || []).map((m) => m.msg || String(m));
  const basis = decisiveBasis(c);
  const keyTotal = clues.filter((x) => x.key).length, keyFound = clues.filter((x) => x.key && found.has(x.id)).length;
  // Core summary (P2-2): the few lines a player reads first — the decision, its basis, the key
  // evidence balance and the single most important miss. Everything else stays in the detail
  // sections below; the core never introduces facts the detail does not contain.
  const core = {
    decision: record.label || '-', basisLabel: basis.label, basisLaw: basis.law,
    keyFound, keyTotal,
    missedKey: evidenceMissed.slice(0, 2).map((x) => x.title),
    procedureMissing: procedure.missing.length,
    mistakes: offTrack.length,
    headline: offTrack.length ? offTrack[0]
      : evidenceMissed.length ? `핵심 단서 ${evidenceMissed.length}건을 확인하지 못했습니다: ${evidenceMissed[0].title}`
      : procedure.missing.length ? `판단은 근거와 맞지만 확인 절차 ${procedure.missing.length}건이 남았습니다.`
      : '확인된 사실과 법적 근거에 맞는 판단입니다.'
  };
  return {
    core,
    decision: record.label || '-', basis,
    evidence: { found: evidenceFound, missed: evidenceMissed },
    questions: { meaningful, missed: missedQuestions, total: asked.size },
    procedure, offTrack,
    lesson: c.note || '',
    interview: record.interview || null
  };
}

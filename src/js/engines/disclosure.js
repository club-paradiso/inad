// Disclosure layer (v12, pure). What the examiner has actually established so far.
//
// The case data carries the full "evidence" assessment (legal-engine evidenceNow) because the debrief
// and the frozen verdict logic need it. Showing that assessment on the desk before any work was done
// turned it into an answer key: the panel read "귀국편 없음 · 체재비 부족" before the first question and
// listed a repatriation node only for cases that end in refusal. This module decides, row by row, whether
// the examiner has done something that would let them know the row. It never changes the assessment,
// a verdict or a score — it only withholds text until the matching work has happened.
//
// Rules are generic (question category / reveal tag, lookup kind, document kind). No case-id branches.
import { evidenceNow } from './legal-engine.js';

export const UNKNOWN_TONE = 'unknown';
export const UNKNOWN_LABEL = '미확인';

// How each row can be established, shown as the hint of an unknown row.
const ROW_HINT = {
  '신원': '여권 판독·생체정보 대조',
  '입국자격': '사증·자격 조회 또는 입국 근거 서류',
  '입국목적': '방문 목적 질문 또는 목적 증빙',
  '여행계획': '귀국·체류 일정 질문, 항공·숙박 자료',
  '체재능력': '체재비·결제수단 질문',
  '국내관계': '국내 연락처·숙소 질문 또는 조회',
  '동행일정': '동행인 진술 교차확인'
};
const Q_REVEAL = { purpose: ['입국목적'], stay: ['여행계획'], travel: ['여행계획'], funds: ['체재능력'], contact: ['국내관계'], phone: ['국내관계'], basis: ['입국자격'], exempt: ['입국자격'], identity: ['신원'], bio: ['신원'], docs: ['입국자격'], history: ['입국자격'], refugee: ['입국목적'], party: ['동행일정'] };
const Q_CAT = { '기본사항': ['입국목적'], '직업': ['입국목적', '체재능력'], '여행·체류': ['여행계획'], '재정': ['체재능력'], '국내관계': ['국내관계'], '난민': ['입국목적'], '과거입국': ['입국자격'], '생체정보': ['신원'], '본인확인': ['신원'] };
const LOOKUP_ROWS = { visa: ['입국자격'], history: ['입국자격'], pnr: ['여행계획'], contact: ['국내관계'], public: ['국내관계', '입국목적'], party: ['동행일정', '국내관계'], forensic: ['신원', '입국자격'] };
const DOC_ROWS = { VISA: ['입국자격'], ABTC: ['입국자격'], 'RESIDENCE CARD': ['입국자격'], WATCHLIST: ['입국자격'], PNR: ['여행계획'], BOARDING: ['여행계획'], HOTEL: ['여행계획', '국내관계'], 'E-ARRIVAL': ['국내관계'], INVITATION: ['국내관계', '입국목적'], BUSINESS: ['입국목적'], SUPPORTING: ['입국목적'] };

const RECORD_FALLBACK = { '체재능력': ['pnr', 'contact'], '입국목적': ['public', 'contact', 'pnr'], '여행계획': ['pnr'], '국내관계': ['contact', 'public'] };
const setOf = (v) => (v instanceof Set ? v : new Set(v || []));
function rowsForQuestion(q) {
  if (/^party/.test(q.id || '')) return ['동행일정', ...(Q_CAT[q.cat] || [])];
  return Q_REVEAL[q.reveal] || Q_CAT[q.cat] || [];
}

// Rows the examiner's own work has touched. `st` needs { asked, looked, performed }.
export function establishedRows(c, st) {
  const rows = new Set(['신원']); // the passport reader and the biometric capture run at the counter for every arrival
  const asked = setOf(st?.asked), looked = setOf(st?.looked), performed = st?.performed || [];
  for (const q of c.questions || []) if (asked.has(q.id)) rowsForQuestion(q).forEach((r) => rows.add(r));
  for (const k of looked) (LOOKUP_ROWS[k] || []).forEach((r) => rows.add(r));
  (c.docs || []).forEach((d, i) => { if (performed.includes('DOC_READ_' + i)) (DOC_ROWS[d.k] || []).forEach((r) => rows.add(r)); });
  // A row the case offers no question for (e.g. funds in a case about biometrics) is settled by the records instead,
  // so every row stays reachable in every case.
  const askable = new Set(); for (const q of c.questions || []) rowsForQuestion(q).forEach((r) => askable.add(r));
  for (const [row, kinds] of Object.entries(RECORD_FALLBACK)) if (!askable.has(row) && kinds.some((k) => looked.has(k))) rows.add(row);
  // An entry-ban finding lives in the immigration record: a document or a statement cannot establish it.
  if (rows.has('입국자격') && /입국금지|강제퇴거/.test((c.evidence?.['입국자격'] || [])[2] || '') && !looked.has('history')) rows.delete('입국자격');
  return rows;
}

// The evidence matrix as the desk may show it: established rows carry the assessment, the rest read 미확인.
export function disclosedEvidence(c, st) {
  const full = evidenceNow(c, { looked: setOf(st?.looked), asked: setOf(st?.asked) });
  const rows = establishedRows(c, st); const out = {};
  for (const [k, v] of Object.entries(full)) out[k] = rows.has(k) ? v : [UNKNOWN_TONE, UNKNOWN_LABEL, ROW_HINT[k] || '진술·서류·조회로 확인'];
  return out;
}

// Only the established rows (keys of unknown rows are absent) — the shape decision-model treats as PENDING.
export function knownEvidence(c, st) {
  const d = disclosedEvidence(c, st); const out = {};
  for (const [k, v] of Object.entries(d)) if (v[0] !== UNKNOWN_TONE) out[k] = v;
  return out;
}

export function disclosureProgress(c, st) {
  const d = disclosedEvidence(c, st); const keys = Object.keys(d);
  return { known: keys.filter((k) => d[k][0] !== UNKNOWN_TONE).length, total: keys.length };
}

// Reasons a secondary referral can cite: only what the examiner has seen. Never the unseen assessment.
export function knownConcerns(c, st) {
  const d = knownEvidence(c, st); const arr = [];
  for (const [k, v] of Object.entries(d)) if (v[0] !== 'ok') arr.push(`${k}: ${v[2] || v[1]}`);
  return arr;
}

// The purpose as declared on arrival. Case data may append what the case later becomes ("관광 → 난민신청");
// the desk shows only the declared part until that procedure has actually begun.
export function declaredPurpose(c, st) {
  const p = String(c?.purpose || '');
  return (st?.refugeeStep || 0) > 0 ? p : p.split('→')[0].trim();
}
// Return/onward booking is known once the itinerary row has been established (PNR, travel document or question).
export function knownReturn(c, st) { return establishedRows(c, st).has('여행계획') ? c.return : null; }

// Legal state machine (frozen at the v6.1 behaviour, public-law baseline 2026-09-07).
// Pure functions: no DOM, no timers, no storage. Every decision returns a verdict object
// { ok, penalty?: { msg, pts } } and the case engine applies it.
//
// Distinct procedures are kept distinct on purpose: 입국심사 · 입국재심 · 입국불허 · 제11조 입국금지 ·
// 난민 회부심사 · 불회부 · 출입국사범 조사 · 긴급체포 · 송환지시 · 출국대기실. There is no single "DEPORT".
// Nationality only feeds entry-basis calculation; demeanour, language and party membership never feed a verdict.
import { REFUSAL_REASONS } from '../../data/legal-baseline.js';

export const STAGES = { PRIMARY: '일반심사', SECONDARY: '입국재심', REFUGEE: '난민 회부심사', INVESTIGATION: '출입국사범 조사', ARREST_REVIEW: '긴급체포 요건 검토', ENTRY_REFUSED: '입국 불허', ADMITTED: '입국 허가', ARRESTED: '긴급체포' };
export const ACTION_NAMES = { SECONDARY: '입국재심', INVESTIGATION: '사범조사', ARREST_REVIEW: '체포요건검토', REFUGEE_CLAIM: '난민신청접수', REFERRAL_SCREENING: '회부심사', NON_REFERRAL: '불회부', RETURN_TO_ENTRY: '입국심사복귀' };
export const LOOKUP_NAMES = { history: '출입국기록', visa: '사증·입국자격', pnr: '항공 PNR', contact: '국내관계', party: '동행인 교차검증', public: '공개정보', forensic: '문서감식' };
export const refusalReasons = REFUSAL_REASONS;
export const refusalReason = (code) => REFUSAL_REASONS.find((r) => r[0] === code) || null;

// Plain-language description of how an action / clue trigger is reached (shared across legal & debrief engines).
export function describeAction(token, c) {
  if (!token) return '';
  if (token === 'INIT') return '심사 시작 시 확인';
  if (token.startsWith('LOCK_')) return '진술·증거 모순 대조';
  if (token.startsWith('UNLOCK_Q_')) { const q = (c?.questions || []).find((x) => x.id === token.slice(9)); return q ? `추궁 질문 해금 · ${q.q}` : token; }
  if (token.startsWith('QUESTION_')) { const q = (c?.questions || []).find((x) => x.id === token.slice(9)); return q ? `질문 · ${q.q}` : token; }
  if (token.startsWith('LOOKUP_')) return `전산 조회 · ${LOOKUP_NAMES[token.slice(7)] || token.slice(7)}`;
  if (token.startsWith('DOC_')) { const d = (c?.docs || []).find((x) => x.k === token.slice(4)); return `서류 확인 · ${d?.t || token.slice(4)}`; }
  return ACTION_NAMES[token] || token;
}

export function stageText(stage) { return STAGES[stage] || stage; }
export function caseLawRef(c) { if (!c) return '출입국관리법 제12조'; if (c.special === 'refugee') return '난민법 제6조 · 난민법 시행령 제5조'; if (c.special === 'forgery') return '출입국관리법 제47·48조 · 형사소송법 제200조의3'; if (c.resolution?.type === 'REFUSE') { const rr = refusalReason(c.resolution.reason); if (rr) return rr[2]; } return '출입국관리법 제12조'; }
export function missingRequirements(c, performed) {
  const hasLock = Array.isArray(performed) && performed.some((x) => x.startsWith('LOCK_'));
  const unlockedAsked = hasLock && performed.some((u) => u.startsWith('UNLOCK_Q_') && performed.includes('QUESTION_' + u.slice(9)));
  return (c.required || []).filter((x) => {
    if (performed.includes(x)) return false;
    // P1-1: When the examiner has established a contradiction via Statement Lock (`LOCK_*`) and completed
    // either the unlocked follow-up interrogation (`UNLOCK_Q_<id>` + `QUESTION_<id>`) or the case's required
    // system lookups, routine background question/lookup items no longer penalize the verdict as `thin`.
    if (hasLock && (x.startsWith('QUESTION_') || (unlockedAsked && x.startsWith('LOOKUP_') && x !== 'LOOKUP_forensic'))) {
      const reqLookups = (c.required || []).filter((r) => r.startsWith('LOOKUP_'));
      const lookupsDone = reqLookups.length > 0 && reqLookups.every((r) => performed.includes(r));
      if (unlockedAsked || lookupsDone) return false;
    }
    return true;
  });
}
export function procedureCompliance(c, performed) { const required = c.required || []; const miss = missingRequirements(c, performed).length; const hit = Math.max(0, required.length - miss); return required.length ? Math.round(hit / required.length * 100) : 100; }

// Minimum expected work (seconds) for a case, derived from its required actions and resolution.
export function expectedMinimumWork(c, languageProfile) {
  const seen = new Set(); let total = 18;
  const costAction = (a) => { if (seen.has(a)) return; seen.add(a); if (a === 'SECONDARY') { total += 24; return; } if (a === 'REFUGEE_CLAIM') { total += 20; return; } if (a === 'REFERRAL_SCREENING') { total += 30; return; } if (a === 'NON_REFERRAL') { total += 34; return; } if (a === 'RETURN_TO_ENTRY') return; if (a === 'INVESTIGATION') { total += 32; return; } if (a === 'ARREST_REVIEW') { total += 22; return; } if (a.startsWith('LOOKUP_')) { total += a === 'LOOKUP_forensic' ? 28 : 14; return; } if (a.startsWith('QUESTION_')) { const id = a.slice(9), q = (c.questions || []).find((x) => x.id === id); if (q) { for (const dep of (q.requires || [])) costAction(dep); total += (q.requires || []).length ? 16 : 12; } return; } };
  for (const a of (c.required || [])) costAction(a);
  if (c.special === 'forgery') { const lp = languageProfile; if (lp && lp.korean < 3) total += 30; }
  if (c.resolution?.type === 'CLEAR') total += 7; else if (c.resolution?.type === 'REFUSE') total += 45; else if (c.resolution?.type === 'ARREST') total += 18;
  return total;
}
export function caseBenchmark(c, lp) { return Math.max(40, Math.round(expectedMinimumWork(c, lp) * 1.12)); }
export function caseMinimum(c, lp) { return Math.max(24, Math.round(expectedMinimumWork(c, lp) * .62)); }

// Evidence matrix as it should currently read (case-specific resolutions after verification).
export function evidenceNow(c, { looked, asked }) {
  const e = JSON.parse(JSON.stringify(c.evidence));
  if (c.id === 'ICN-S2-006' && looked.has('pnr') && looked.has('contact') && asked.has('friend')) { e['입국목적'] = ['ok', '소명', '동행 관광 확인']; e['여행계획'] = ['ok', '확정', '동행 왕복예약 확인']; e['국내관계'] = ['ok', '확인', '호텔 투숙객 명단 확인']; }
  if (c.id === 'ICN-S2-008' && looked.has('contact') && looked.has('public') && asked.has('purpose')) { e['입국목적'] = ['ok', '소명', '단기상용 활동 범위 확인']; e['국내관계'] = ['ok', '확인', '초청사·담당자 확인']; }
  return e;
}
// Readiness hint (0–100). A hint only — never an automatic verdict.
export function readiness(c, performed, clueStat) {
  const needed = (c.required || []).length || 1;
  const miss = missingRequirements(c, performed).length;
  const hit = Math.max(0, (c.required || []).length - miss);
  let pct = Math.round(Math.min(100, (hit / needed) * 100));
  if (c.clues && clueStat && clueStat.keys.length) { const kp = clueStat.keyGot.length / clueStat.keys.length * 100; pct = Math.round(pct * .75 + kp * .25); }
  if (c.resolution.type === 'CLEAR' && (c.required || []).length === 0) pct = 100;
  return { pct, hit, needed };
}

// ---- Decisions -------------------------------------------------------------------------------
export function validateSecondary(c, stage) { if (stage !== 'PRIMARY') return { ok: false }; return { ok: true, proportionate: (c.required || []).includes('SECONDARY') }; }

// Decision validation. A verdict that contradicts the established facts (wrong outcome, or a refusal
// ground that does not match) stays an error. Missing review steps no longer BLOCK a decision the
// examiner chooses to make: the decision is recorded, the shortfall is returned as `thin` so the
// case engine can score it and the debrief can explain it. Statutory elements are untouched —
// investigation, arrest review/execution, interpreter and SJP entry keep their hard requirements.
export function validateClear(c, performed) {
  if (c.resolution.type !== 'CLEAR') return { ok: false, penalty: { msg: '사실관계를 충분히 확인하지 않고 입국허가를 결정했습니다.', pts: c.resolution.type === 'ARREST' ? 18 : 12 } };
  const m = missingRequirements(c, performed);
  if (m.length) return { ok: true, thin: true, missing: m, advisory: { msg: `확인이 부족한 상태에서 입국허가를 결정했습니다. 남은 확인: ${m.map((t) => describeAction(t, c)).join(', ')}`, pts: 6 } };
  return { ok: true };
}
export function validateRefusal(c, code, performed) {
  if (c.resolution.type !== 'REFUSE' || c.resolution.reason !== code) return { ok: false, penalty: { msg: '선택한 입국불허 사유가 이 사건의 사실관계와 맞지 않습니다.', pts: 10 } };
  const m = missingRequirements(c, performed);
  if (m.length) return { ok: true, thin: true, missing: m, reason: refusalReason(code), advisory: { msg: `확인이 부족한 상태에서 입국불허를 결정했습니다. 남은 확인: ${m.map((t) => describeAction(t, c)).join(', ')}`, pts: 7 } };
  return { ok: true, reason: refusalReason(code) };
}
export function validateSjpEntry(c, stage) {
  if (c.special !== 'forgery') return { ok: false, penalty: { msg: '이 사건에서 출입국사범 절차를 개시할 구체적 범죄혐의가 확인되지 않았습니다.', pts: 8 } };
  if (stage === 'PRIMARY') return { ok: false, penalty: { msg: '출입국사범 절차 전에 입국재심에서 문서·신원 이상을 구체화해야 합니다.', pts: 5 } };
  return { ok: true };
}
export function validateInvestigation(c, { forensic, language }) {
  if (!forensic) return { ok: false, penalty: { msg: '감식 등으로 구체적 범죄혐의를 먼저 확인해야 합니다.', pts: 5 } };
  // 출입국관리법 제48조제6항: 국어가 통하지 않는 용의자의 진술은 통역인에게 통역하게 한다.
  if (language && language.korean < 3 && !language.interpreterActive) return { ok: false, interpreterRequired: true, msg: '출입국사범 신문 전 통역 확보가 필요합니다. 출입국관리법 제48조제6항상 국어가 통하지 않는 사람의 진술은 통역인에게 통역하게 해야 합니다.' };
  return { ok: true };
}
export function validateArrestReview(c, { forensic, investigation }) {
  if (c.special !== 'forgery' || !forensic || !investigation) return { ok: false, penalty: { msg: '긴급체포 검토에 앞서 범죄혐의와 조사단계가 확립되어야 합니다.', pts: 9 } };
  return { ok: true };
}
// 형사소송법 제200조의3: every statutory element must be confirmed; nothing is automatic.
export const ARREST_REQUIREMENTS = ['장기 3년 이상 징역·금고 해당 범죄 및 범죄혐의의 상당한 이유', '증거인멸 또는 도망·도망 우려', '체포영장을 받을 시간적 여유가 없는 긴급성'];
export function validateArrestExecution(checkedCount) { return checkedCount === ARREST_REQUIREMENTS.length ? { ok: true } : { ok: false, fatal: true }; }
export function validateReferral() { return { ok: false, penalty: { msg: '이 사건의 확인된 사실만으로 난민인정심사 회부를 선택하기에는 근거가 부족합니다.', pts: 5 } }; }

export function refugeeTimeline(step) { return [['난민신청 의사 확인', step >= 1], ['난민인정신청 접수', step >= 1], ['회부 여부 심사', step >= 2], ['회부/불회부 결정', step >= 3], ['출입국관리법상 입국심사', step >= 4]]; }
export function repatriationTimeline(step) { return [['입국 불허가 결정·통지', true, '제12조제4항'], ['운수업자 송환지시', step >= 1, '제76조'], ['출국대기실 인계', step >= 2, '제76조의2'], ['대한민국 밖으로 송환', false, '운항계획에 따라 진행']]; }
export function procedureMeta(mode) { return mode === 'secondary' ? ['입국재심', 'SECONDARY EXAMINATION', '출입국관리법 제12조 · 추가 소명 및 사실확인'] : mode === 'refugee' ? ['출입국항 난민 회부심사', 'REFUGEE REFERRAL SCREENING', '난민법 제6조 · 난민법 시행령 제5조'] : mode === 'sjp' ? ['출입국사범 조사', 'SPECIAL JUDICIAL POLICE WORKSPACE', '출입국관리법 제47·48조 · 형사소송법 제200조의3'] : ['입국불허 후 송환', 'REPATRIATION PROCESS', '출입국관리법 제76조 · 제76조의2']; }
export function secondaryReasonList(c) { const arr = []; Object.entries(c.evidence || {}).forEach(([k, v]) => { if (v[0] !== 'ok') arr.push(`${k}: ${v[2] || v[1]}`); }); if (!arr.length) arr.push('추가 확인을 위해 재심으로 인계됨'); return arr; }

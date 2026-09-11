// Traceable decision model (v7.1). Derives an explainable "decision basis" — one node per verification
// domain, each linked to rule ids, statutory basis and sources — from the case data and the current
// inspection state. It is purely explanatory: verdicts still come from legal-engine.js and this module
// never changes an outcome. Statuses: PASS · REVIEW · FAIL · PENDING (not yet verified in this session).
import { DECISION_RULES, DOMAINS, ruleById } from '../../data/decision-rules.js';
import { LEGAL_SOURCES, sourceById } from '../../data/legal-sources.js';
import { evidenceNow } from './legal-engine.js';

export const STATUS_LABEL = { PASS: '충족', REVIEW: '추가 확인', FAIL: '미충족', PENDING: '미확인' };
export const CONFIDENCE_LABEL = { CONFIRMED: '공개 법령·공식자료 확인', INFERRED: '공개자료로부터 추론', SIMULATED: '시뮬레이션 요소', NOT_PUBLICLY_VERIFIED: '공개 근거 미확인' };

const toneOf = (v) => (v === 'ok' ? 'PASS' : v === 'warn' ? 'REVIEW' : 'FAIL');
const bioParse = (bio) => { const raw = parseFloat((String(bio || '').match(/[0-9]+(?:\.[0-9]+)?/) || ['99'])[0]); return { raw, refused: /거부|불응/.test(bio || ''), bad: raw < 85 || /불일치|오류/.test(bio || '') }; };

// Classify the free-text entry basis of a case into a statutory category (labels only; no legal effect).
export function classifyEntryBasis(c) {
  const b = `${c.basis || ''} ${c.basisDetail || ''} ${c.visa || ''}`;
  if (/재입국|체류카드|등록외국인/.test(b)) return { key: 'REENTRY', label: '재입국허가 면제(등록외국인)', basis: '제7조제2항제1호', rule: 'R-7-2-WAIVER' };
  if (/ABTC|기업인여행카드/.test(b)) return { key: 'ABTC', label: 'APEC 기업인여행카드(ABTC)', basis: '공개 안내(ABTC)', rule: 'R-ABTC' };
  if (/사증면제협정/.test(b)) return { key: 'B1', label: '사증면제협정(B-1)', basis: '제7조제2항제2호', rule: 'R-7-2-WAIVER' };
  if (/무사증/.test(b)) return { key: 'B2', label: '관광·통과 무사증 입국허가(B-2)', basis: '제7조제2항제3호 · 시행령 제8조', rule: 'R-7-2-WAIVER' };
  if (/사증/.test(b)) return { key: 'VISA', label: '사증 소지(C-3 등)', basis: '제7조제1항', rule: 'R-7-VISA' };
  return { key: 'UNKNOWN', label: '입국 근거 확인 필요', basis: '제7조', rule: 'R-7-VISA' };
}

export function ketaStatus(c) {
  const e = c.eta || '';
  if (/유효/.test(e)) return { status: 'PASS', text: 'K-ETA 유효 · 입국신고서 작성 생략 대상' };
  if (/면제/.test(e)) return { status: 'PASS', text: '한시 면제 대상국(2026-12-31까지) · 전자입국신고 대상' };
  if (/해당 없음|불요/.test(e)) return { status: 'PASS', text: '사전여행허가 요구 대상 아님(사증·재입국 등)' };
  if (/주장|미확인|없음/.test(e)) return { status: 'REVIEW', text: e };
  return { status: 'PENDING', text: e || '미기재' };
}

export function arrivalDeclarationStatus(c) {
  const a = c.arrivalCard || '';
  if (/제외|생략/.test(a)) return { status: 'PASS', text: `${a} — 시행령 제15조제1항 단서(등록외국인·유효 K-ETA 등)` };
  if (/제출/.test(a)) return { status: 'PASS', text: `${a} — 도착 3일 전부터 제출, 72시간 유효` };
  if (/미제출|없음/.test(a)) return { status: 'REVIEW', text: a };
  return { status: 'PENDING', text: a || '미기재' };
}

// Build the decision basis for the current case/state. `st` needs { asked, looked, performed, stage, forensic, investigation, refugeeStep }.
export function decisionBasis(c, st) {
  const e = evidenceNow(c, { looked: st.looked || new Set(), asked: st.asked || new Set() });
  const bio = bioParse(c.bio);
  const basisCls = classifyEntryBasis(c);
  const keta = ketaStatus(c), decl = arrivalDeclarationStatus(c);
  const looked = (k) => (st.looked || new Set()).has(k);
  const nodes = [];
  const push = (domain, status, summary, rules, extra = {}) => nodes.push({ domain, label: DOMAINS[domain].label, short: DOMAINS[domain].short, status, summary, rules: rules.map(ruleById).filter(Boolean), ...extra });

  // 1 documents
  push('DOCUMENT_VALIDITY', e['신원'] ? toneOf(e['신원'][0]) : 'PENDING', e['신원'] ? `${e['신원'][1]} · ${e['신원'][2]} · 전자칩 ${c.chip}` : '여권 확인 필요', ['R-12-1-DOC', 'R-12-4-BURDEN']);
  // 2 entry authorization
  const auth = e['입국자격'] ? toneOf(e['입국자격'][0]) : 'PENDING';
  push('TRAVEL_AUTHORIZATION', auth === 'PASS' && keta.status !== 'PASS' ? keta.status : auth, `${basisCls.label} (${basisCls.basis}) · 사증 ${c.visa} · K-ETA ${keta.text}${looked('visa') ? ' · 사증·자격 조회 완료' : ''}`, ['R-7-VISA', 'R-7-2-WAIVER', 'R-7-3-KETA', ...(basisCls.key === 'ABTC' ? ['R-ABTC'] : [])], { basisClass: basisCls.key });
  // 3 arrival declaration
  push('ARRIVAL_DECLARATION', decl.status, decl.text, ['R-DEC-15-DECL', 'R-DECL-EXEMPT']);
  // 4 biometrics
  push('BIOMETRICS', bio.refused ? 'FAIL' : bio.bad ? 'FAIL' : 'PASS', bio.refused ? '생체정보 제공 거부 · 제12조의2제2항 불허가 사유 검토 대상' : `${c.bio}${bio.bad ? ' · 여권 명의와 중대한 불일치' : ''}`, ['R-12-2-BIO']);
  // 5 purpose
  push('PURPOSE_COMPATIBILITY', e['입국목적'] ? toneOf(e['입국목적'][0]) : 'PENDING', e['입국목적'] ? `${e['입국목적'][1]} · ${e['입국목적'][2]} · 신고 목적 "${c.purpose}"` : '목적 확인 필요', ['R-12-3-2-PURPOSE']);
  // 6 period of stay / plan
  const plan = e['여행계획'] ? toneOf(e['여행계획'][0]) : 'PENDING'; const funds = e['체재능력'] ? toneOf(e['체재능력'][0]) : 'PENDING';
  const periodStatus = plan === 'FAIL' || funds === 'FAIL' ? 'FAIL' : plan === 'REVIEW' || funds === 'REVIEW' ? 'REVIEW' : plan === 'PENDING' ? 'PENDING' : 'PASS';
  push('PERIOD_OF_STAY', periodStatus, `신청 체류 ${c.stay} · 귀국 ${c.return}${e['여행계획'] ? ` · 계획 ${e['여행계획'][1]}` : ''}${e['체재능력'] ? ` · 체재능력 ${e['체재능력'][1]}` : ''}`, ['R-12-3-3-PERIOD']);
  // 7 restrictions
  const watch = /확인 필요|규제|주의/.test(c.watch || '') ? 'REVIEW' : /없음/.test(c.watch || '') ? (looked('history') ? 'PASS' : 'PENDING') : 'PENDING';
  const restriction = c.resolution?.reason?.startsWith('SIM-A11') && looked('history') ? 'FAIL' : watch;
  push('ENTRY_RESTRICTIONS', restriction, `규제정보 ${c.watch}${looked('history') ? ' · 출입국기록 조회 완료' : ' · 출입국기록 미조회'}${funds === 'REVIEW' ? ' · 체류비용 부담능력은 제11조제1항제5호 검토 요소' : ''}`, ['R-11-BAN']);
  // 8 additional verification
  const secondary = st.stage && st.stage !== 'PRIMARY';
  const contact = e['국내관계'] ? toneOf(e['국내관계'][0]) : 'PENDING'; const party = e['동행일정'] ? toneOf(e['동행일정'][0]) : null;
  push('ADDITIONAL_VERIFICATION', party === 'REVIEW' || contact === 'REVIEW' ? 'REVIEW' : contact === 'PENDING' ? 'PENDING' : 'PASS', `${secondary ? '입국재심 진행' : '일반심사'}${e['국내관계'] ? ` · 국내관계 ${e['국내관계'][1]}` : ''}${party ? ' · 동행인 진술 교차확인' : ''}`, ['R-SECONDARY', 'R-13-COND', ...(party ? ['R-PARTY'] : []), 'R-BEHAVIOR']);
  // 9-11 only when relevant
  if (c.special === 'refugee') push('REFUGEE', (st.refugeeStep || 0) >= 4 ? 'PASS' : (st.refugeeStep || 0) > 0 ? 'REVIEW' : 'PENDING', (st.refugeeStep || 0) >= 4 ? '불회부 결정 · 출입국관리법상 입국심사로 복귀' : (st.refugeeStep || 0) > 0 ? '회부심사 진행 중' : '난민신청 의사 확인 시 난민법 제6조 절차 우선', ['R-REF-6', 'R-REF-NONREF']);
  if (c.special === 'forgery') push('INVESTIGATION', st.investigation ? 'REVIEW' : st.forensic ? 'REVIEW' : 'PENDING', st.investigation ? '출입국사범 조사 전환 · 통역 확보 · 긴급체포 요건은 개별 확인' : st.forensic ? '감식 결과 확보 · 조사 전환 검토' : '문서 감식 전 단계', ['R-SJP-47', 'R-CPA-200-3']);
  if (st.stage === 'ENTRY_REFUSED' || c.resolution?.type === 'REFUSE') push('REPATRIATION', st.stage === 'ENTRY_REFUSED' ? 'REVIEW' : 'PENDING', st.stage === 'ENTRY_REFUSED' ? '입국 불허가 → 송환지시 → 출국대기실' : '불허가 결정 시 제76조 송환 절차로 연결', ['R-76-REPAT', 'R-REPORT-MOJ', 'R-INAD-TERM']);
  return nodes;
}

export function overallBasisSummary(nodes) { const fail = nodes.filter((n) => n.status === 'FAIL').length, review = nodes.filter((n) => n.status === 'REVIEW').length, pending = nodes.filter((n) => n.status === 'PENDING').length; return { fail, review, pending, pass: nodes.length - fail - review - pending, headline: fail ? '요건 미충족 항목 있음' : review ? '추가 확인 필요' : pending ? '확인이 남은 항목 있음' : '법정 요건 확인 완료' }; }
export function registryIntegrity() { const problems = []; for (const r of DECISION_RULES) { if (!DOMAINS[r.domain]) problems.push(`${r.id}: unknown domain`); if (!['CONFIRMED', 'INFERRED', 'SIMULATED', 'NOT_PUBLICLY_VERIFIED'].includes(r.status)) problems.push(`${r.id}: bad status`); if (r.status === 'CONFIRMED' && !r.sources.length) problems.push(`${r.id}: CONFIRMED without source`); for (const s of r.sources) if (!sourceById(s)) problems.push(`${r.id}: missing source ${s}`); } for (const s of LEGAL_SOURCES) if (!s.checked) problems.push(`${s.id}: no checked date`); return problems; }
export { DECISION_RULES, DOMAINS, LEGAL_SOURCES, ruleById, sourceById };

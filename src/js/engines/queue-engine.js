// Duty roster generation: 24 seeded normal passengers + 12 scripted core cases = 36 per shift-day,
// split across three shifts, plus seeded travel parties. Pure functions of the seed.
import { CASES } from '../../data/cases.js';
import { AIRPORT_BY_CODE, FICTIONAL_CARRIERS, FICTIONAL_HOTELS, PARTY_TYPES, VISA_FREE_RANDOM_CODES } from '../../data/entry-basis.js';
import { hashSeed, makeRng, pick, shuffled } from './rng.js';
import { getTraveler, travelerMap } from './traveler-engine.js';
import { session, state } from '../state.js';
import { applyPassengerStory, applyReviewAnomaly, resolveAnomaly, storyKind } from './passenger-story.js';

export const coreCaseMap = new Map(CASES.map((c) => [c.id, c]));
export const CORE_TRAVELER_IDS = new Set(CASES.map((c) => c.travelerId));

// Order matters: the roster stream indexes into this list. New anomalies are appended.
const CLEAR_REVIEW_ANOMALIES = ['companionHotel', 'pnrAgency', 'friendContact', 'ticketName', 'staySpan'];
const REFUSAL_VARIANTS = ['purposeMismatch', 'entryBan', 'documentInvalid', 'bioRefusal'];

export function originAirport(code) { return AIRPORT_BY_CODE[code] || 'HUB'; }

export function normalProfile(t, rng) {
  const code = t.nationality.code, role = t.visualRole || '';
  const student = /학생/.test(role), business = /출장/.test(role);
  if (student && rng() < .48) return { kind: 'resident', purpose: '국내 체류지로 복귀', stay: '장기체류', basis: '등록외국인 재입국', basisDetail: '유효한 체류카드와 체류기간을 확인한 재입국', visa: 'D-2 체류자격 · 유효 체류카드', eta: '해당 없음', arrivalCard: '신고 제외' };
  if (!business && VISA_FREE_RANDOM_CODES.has(code)) {
    const hasKeta = rng() < .26;
    return { kind: 'visaFree', purpose: '개인 관광', stay: (3 + Math.floor(rng() * 7)) + '일', basis: '지정 무사증 · 단기방문', basisDetail: hasKeta ? '유효 K-ETA 보유 · 단기 관광' : '일반여권 · 90일 이내 · K-ETA 한시면제(2026.12.31까지)', visa: '사증 불요', eta: hasKeta ? 'K-ETA 유효' : '한시면제', arrivalCard: hasKeta ? '신고 제외' : '전자입국신고 제출' };
  }
  if (business) return { kind: 'business', purpose: '업무 회의 참석', stay: (2 + Math.floor(rng() * 4)) + '일', basis: '유효 사증 소지 · 단기상용', basisDetail: 'C-3-4 단기상용 사증 유효 · 국내 보수수령 없는 회의/출장', visa: 'C-3-4 유효', eta: '해당 없음', arrivalCard: '전자입국신고 제출' };
  return { kind: 'touristVisa', purpose: '개인 관광', stay: (3 + Math.floor(rng() * 8)) + '일', basis: '유효 사증 소지 · 단기방문', basisDetail: 'C-3-9 일반관광 사증 유효 · 입국목적 별도 심사', visa: 'C-3-9 유효', eta: '해당 없음', arrivalCard: '전자입국신고 제출' };
}

// Each shift gets five straightforward admissions, two cases that need secondary examination,
// and one genuine refusal. The specific anomaly/refusal is seeded, so a roster stays reproducible.
export function generatedOutcome(index, profile, rng) {
  const slot = index % 8;
  if (slot < 5) return { kind: 'routine-clear' };
  if (slot < 7) return { kind: 'secondary-clear', anomaly: pick(CLEAR_REVIEW_ANOMALIES, rng) };
  const pool = profile.kind === 'resident' ? REFUSAL_VARIANTS.filter((x) => x !== 'purposeMismatch') : REFUSAL_VARIANTS;
  return { kind: 'refuse', variant: pick(pool, rng) };
}

function setDocField(doc, key, value) {
  if (!doc) return;
  const row = (doc.fields || []).find((x) => x[0] === key);
  if (row) row[1] = value;
  else (doc.fields ||= []).push([key, value]);
}

function applyGeneratedRefusal(c, variant) {
  c.risk = 'HIGH';
  c.difficulty = '일반 · 불허판단';
  c.sessionVariant = `generated-refuse-${variant}`;

  if (variant === 'purposeMismatch') {
    c.questions.push({ id: 'detail', cat: '추가소명', q: '한국에서 실제로 어떤 활동을 할 예정인지 구체적으로 설명해 주십시오.', a: '지인이 운영하는 매장에서 약 2주 동안 일을 도와주고 현금으로 사례비를 받기로 했습니다.', reveal: 'depth', requires: ['QUESTION_purpose'] });
    c.lookups.contact = ['불일치', '국내 연락처가 영업장 운영자로 확인되며 피심사인의 단기 근로 제공 정황과 진술이 일치합니다.'];
    c.evidence['입국목적'] = ['bad', '불일치', '신고한 단기방문 목적과 국내 유상활동 계획이 양립하지 않음'];
    c.required = ['SECONDARY', 'QUESTION_detail', 'LOOKUP_contact'];
    c.resolution = { type: 'REFUSE', reason: 'SIM-A12-PUR' };
    c.note = '입국재심에서 실제 활동 계획을 확인하면 신고 목적과 체류자격의 불일치가 드러나는 사건.';
    c.clues.push({ id: 'r1', trigger: 'DOC_ENTRY BASIS', title: '국내 연락처', text: '숙박업소나 초청기관이 아닌 개인 연락처를 신고함.', kind: 'unresolved', key: true }, { id: 'r2', trigger: 'QUESTION_detail', title: '유상활동 진술', text: '국내 사업장에서 일하고 대가를 받을 계획을 진술함.', kind: 'risk', key: true }, { id: 'r3', trigger: 'LOOKUP_contact', title: '국내관계 확인', text: '연락처가 진술한 사업장의 운영자와 일치함.', kind: 'confirm', key: true });
    return;
  }

  if (variant === 'entryBan') {
    c.watch = '규제정보 확인 필요';
    c.lookups.history = ['규제', '과거 강제퇴거 기록이 있으며 강제퇴거 후 5년이 지나지 않은 것으로 확인됩니다.'];
    c.required = ['SECONDARY', 'LOOKUP_history'];
    c.resolution = { type: 'REFUSE', reason: 'SIM-A11-DEPORT' };
    c.note = '일반적인 입국요건과 별개로 개인별 입국금지 사유를 확인해야 하는 사건.';
    c.clues.push({ id: 'r1', trigger: 'INIT', title: '규제정보', text: '신원 조회 화면에 규제정보 확인 필요 표시가 있음.', kind: 'unresolved', key: true }, { id: 'r2', trigger: 'LOOKUP_history', title: '입국금지 사유', text: '강제퇴거 후 5년 미경과 사실이 확인됨.', kind: 'risk', key: true });
    return;
  }

  if (variant === 'documentInvalid') {
    c.chip = '검증 오류';
    const passportDoc = c.docs.find((d) => d.k === 'PASSPORT');
    setDocField(passportDoc, '만료일', '2025-12-31');
    setDocField(passportDoc, '전자칩', 'ERROR');
    c.lookups.visa = ['불일치', '사증 또는 입국기반과 별개로 제시된 여권의 유효성 요건을 충족하지 못합니다.'];
    c.evidence['신원'] = ['bad', '미충족', '여권 유효기간 경과 및 전자칩 검증 오류'];
    c.required = ['SECONDARY', 'LOOKUP_visa'];
    c.resolution = { type: 'REFUSE', reason: 'SIM-A12-DOC' };
    c.note = '여권 유효성 자체가 충족되지 않아 입국허가할 수 없는 사건.';
    c.clues.push({ id: 'r1', trigger: 'INIT', title: '문서 이상', text: '여권 만료일과 전자칩 검증 상태를 직접 확인해야 함.', kind: 'unresolved', key: true }, { id: 'r2', trigger: 'LOOKUP_visa', title: '유효성 미충족', text: '입국자격 조회와 별개로 여권 유효성 요건 미충족 확인.', kind: 'risk', key: true });
    return;
  }

  c.bio = '생체정보 제공 거부';
  c.questions.push({ id: 'detail', cat: '본인확인', q: '지문과 얼굴정보 제공 절차에 협조하시겠습니까?', a: '제공하지 않겠습니다. 이유는 설명하지 않겠습니다.', reveal: 'depth' });
  c.evidence['신원'] = ['warn', '본인확인 미완료', '생체정보 제공 거부로 본인확인 절차가 완료되지 않음'];
  c.required = ['SECONDARY', 'QUESTION_detail'];
  c.resolution = { type: 'REFUSE', reason: 'SIM-BIO-REF' };
  c.note = '생체정보 제공·본인확인 절차 불응을 별도로 판단해야 하는 사건.';
  c.clues.push({ id: 'r1', trigger: 'INIT', title: '본인확인 미완료', text: '생체정보 제공 단계가 완료되지 않음.', kind: 'unresolved', key: true }, { id: 'r2', trigger: 'QUESTION_detail', title: '제공 거부 확인', text: '생체정보 제공을 명시적으로 거부함.', kind: 'risk', key: true });
}

export function makeNormalCase(t, index, shift, rng, seed) {
  const p = normalProfile(t, rng), origin = originAirport(t.nationality.code), flight = 'SIM' + String(300 + index), carrier = pick(FICTIONAL_CARRIERS, rng), hotel = pick(FICTIONAL_HOTELS, rng);
  // Seeded simulation-only outbound flight: an actual itinerary, not an uncheckable 'round trip confirmed' label.
  const returnFlight = p.kind === 'resident' ? '' : 'SIM' + String(600 + index);
  const returnRoute = returnFlight ? `${returnFlight} · ICN → ${origin}` : '—';
  const bookingRef = `SIM-${String(seed).replace(/[^\dA-Za-z]/g, '').slice(-5)}-${String(index + 1).padStart(2, '0')}`;
  const outcome = generatedOutcome(index, p, rng);
  const review = outcome.kind === 'secondary-clear';
  const passport = t.passport || {}; const dob = passport.birthDate || '1995-01-01'; const sex = passport.sex || 'X'; const passNo = passport.number || ('SIM' + String(index).padStart(7, '0')); const expiry = passport.expiry || '2033-12-31';
  const questions = [{ id: 'purpose', cat: '기본사항', q: '이번 방문 목적을 말씀해 주십시오.', a: p.purpose + ' 목적입니다.', reveal: 'purpose' }, { id: 'stay', cat: '여행·체류', q: '한국에는 얼마나 머무를 예정입니까?', a: p.stay + ' 예정입니다.', reveal: 'stay' }, { id: 'return', cat: '여행·체류', q: '귀국 또는 다음 이동 일정이 있습니까?', a: p.kind === 'resident' ? '현재 체류자격에 따라 국내 체류지로 복귀합니다.' : `${returnFlight}편으로 ${origin}행 전자항공권을 발권했습니다.`, reveal: 'travel' }];
  const lookups = { history: ['정상', '과거 출입국 기록상 현재 심사에 영향을 줄 특이사항 없음.'], visa: ['정상', p.basis + ' 요건과 제출자료가 일치합니다.'], pnr: ['정상', '예약자료와 진술한 일정이 일치합니다.'], contact: ['정상', '국내 체류지 또는 연락처 자료가 확인됩니다.'], public: ['정상', '제출자료와 공개 확인정보 사이 특이한 모순이 없습니다.'] };
  const clues = [];
  let required = ['QUESTION_purpose'];
  // Placeholder keeps the question shuffle (and so the roster stream) exactly as long as it always was;
  // applyReviewAnomaly fills it in once the documents exist.
  if (review) questions.push({ id: 'detail', cat: '추가소명', q: '', a: '', reveal: 'depth' });
  if (p.kind === 'resident') questions.push({ id: 'residence', cat: '추가소명', q: '체류카드와 국내 거소 정보를 확인하겠습니다.', a: '유효한 체류카드와 현재 거소 자료를 제시하겠습니다.', reveal: 'depth' });
  const doc2 = p.kind === 'resident' ? { t: '외국인등록증', k: 'RESIDENCE CARD', fields: [['성명', t.name.latin], ['체류자격', 'D-2'], ['상태', 'VALID'], ['재입국', '체류기간 내']] } : { t: '입국자격 자료', k: 'ENTRY BASIS', fields: [['입국기반', p.basis], ['사증', p.visa], ['K-ETA', p.eta], ['전자입국신고', p.arrivalCard]] };
  let docs = [{ t: '여권', k: 'PASSPORT', fields: [['성명', t.name.latin], ['국적', t.nationality.english || t.nationality.korean], ['여권번호', passNo], ['만료일', expiry], ['전자칩', 'VALID'], ['MRZ', 'VALID']] }, doc2, { t: '항공예약', k: 'PNR', fields: p.kind === 'resident'
    ? [['입국편', flight], ['여정', origin + ' → ICN'], ['귀국편', '해당 없음 · 국내 기존 체류지 복귀'], ['예약상태', 'CONFIRMED']]
    : [['입국편', flight], ['여정', origin + ' → ICN'], ['귀국편', returnFlight], ['출국여정', 'ICN → ' + origin], ['예약상태', 'TICKETED'], ['예약번호', bookingRef], ['전자항공권번호', 'SIMT' + String(seed).replace(/[^0-9]/g, '').slice(-6) + String(index + 1).padStart(3, '0')]] }, { t: p.kind === 'resident' ? '국내 거소자료' : '숙박예약', k: p.kind === 'resident' ? 'STAY' : 'HOTEL', fields: p.kind === 'resident' ? [['체류목적', '국내 체류지로 복귀'], ['거소', '등록정보와 일치'], ['체류기간', '유효']] : [['숙박', hotel], ['투숙객', t.name.latin], ['상태', 'CONFIRMED']] }];
  docs = [docs[0], ...shuffled(docs.slice(1), rng)];
  const evidence = { '신원': ['ok', '확인', '여권·생체정보 일치'], '입국자격': ['ok', '충족', p.basis], '입국목적': [review ? 'warn' : 'ok', review ? '추가확인' : '일치', p.purpose], '여행계획': ['ok', '확정', '예약자료 확인'], '체재능력': ['ok', '충분', '통상적인 체류자료 확인'], '국내관계': [review ? 'warn' : 'ok', review ? '추가확인' : '확인', '신고·예약자료 검증 가능'] };
  const c = { id: `NORMAL-${seed}-${String(index + 1).padStart(2, '0')}`, shift, travelerId: t.id, name: t.name.latin, nat: t.nationality.korean, code: t.nationality.code, sex, dob, passport: passNo, purpose: p.purpose, stay: p.stay, arrival: `${flight} · ${origin} → ICN`, return: returnRoute, returnDelivery: 'direct', carrier, basis: p.basis, basisDetail: p.basisDetail, eta: p.eta, arrivalCard: p.arrivalCard, visa: p.visa, watch: '이상 없음', bio: '일치 ' + (98.7 + rng() * 1.1).toFixed(1) + '%', chip: '정상', risk: review ? 'MEDIUM' : 'LOW', initial: '', questions: [questions[0], ...shuffled(questions.slice(1), rng)], docs, lookups, evidence, required, resolution: { type: 'CLEAR', reason: null }, difficulty: review ? '일반 · 추가확인' : '일반', note: review ? '초기 의심사항이 재심의 추가 확인으로 해소되는 정상승객.' : '일반 정상승객. 필요한 최소 확인 후 신속하게 입국허가하는 것이 목표.', clues: clues.length ? clues : [], sessionVariant: review ? 'secondary-clear' : 'routine-clear' };
  if (review) c.required = applyReviewAnomaly(c, resolveAnomaly(outcome.anomaly, storyKind(c), c.id));
  if (outcome.kind === 'refuse') applyGeneratedRefusal(c, outcome.variant);
  if (!c.clues.length) delete c.clues;
  // Trip story (own seeded stream): opening statement, plan, lodging, funds, occupation.
  return applyPassengerStory(c, seed);
}

export function generateNormalCases(seed, pool = [...travelerMap.values()]) {
  const rng = makeRng(seed);
  const candidates = shuffled(pool.filter((t) => !CORE_TRAVELER_IDS.has(t.id)), rng).slice(0, 24);
  return candidates.map((t, i) => makeNormalCase(t, i, 1 + Math.floor(i / 8), rng, seed));
}

export function buildSessionQueue(seed, normalCases) {
  const rng = makeRng(seed ^ 0x9e3779b9); const out = [];
  for (let sh = 1; sh <= 3; sh++) {
    let rows = shuffled(normalCases.filter((c) => c.shift === sh).map((c) => ({ shift: sh, travelerId: c.travelerId, caseId: null, normalId: c.id })), rng);
    const core = shuffled(CASES.filter((c) => c.shift === sh).map((c) => ({ shift: sh, travelerId: c.travelerId, caseId: c.id, normalId: null })), rng);
    for (const q of core) { const pos = 1 + Math.floor(rng() * Math.max(1, rows.length)); rows.splice(pos, 0, q); }
    if (rows[0]?.caseId) { const j = rows.findIndex((x) => !x.caseId); if (j > 0)[rows[0], rows[j]] = [rows[j], rows[0]]; }
    out.push(...rows);
  }
  return out;
}

// v10 single-case live interview: a one-passenger roster (no companions, no queue) built from the seeded session,
// so the case, the traveler's language profile and every rule are exactly those of the full duty.
export function singleCaseSession(caseId) { return rosterSession([caseId]); }
// Fixed short roster (v10 Quick Shift): core case ids, or 'normal' for the next ordinary generated passenger
// (variant 'routine-clear'). One duty shift, no companions; every case keeps its own rules.
export function rosterSession(entries) {
  const used = new Set(); const out = [];
  // 'normal' · 'review' · 'refusal' name the kind of generated passenger wanted (v13 rotating short duty).
  const wanted = { normal: (v) => v === 'routine-clear', review: (v) => v === 'secondary-clear', refusal: (v) => /^generated-refuse-/.test(v || '') };
  for (const e of entries) {
    let item;
    if (wanted[e]) {
      const fits = session.queue.filter((q, i) => !q.caseId && !used.has(i) && wanted[e](session.normalCaseMap.get(q.normalId)?.sessionVariant));
      // A short roster has no travel parties, so prefer a passenger whose record does not refer to one.
      item = fits.find((q) => !session.partyByTraveler.has(q.travelerId)) || fits[0];
    } else item = session.queue.find((q) => q.caseId === e);
    if (!item) return false; used.add(session.queue.indexOf(item)); out.push({ ...item, shift: 1 });
  }
  session.queue = out; session.parties = []; session.partyByTraveler = new Map(); return true;
}
// Rotating short duty (v13): three generated passengers around three authored cases, drawn from the seed.
// Always one authored admission and one authored non-admission, so a roster is never six of the same call;
// a special-procedure case (refugee claim, document forgery) appears in roughly one roster out of three.
export function quickRosterFor(seed) {
  const rng = makeRng(hashSeed(seed + '|QUICK'));
  const clear = shuffled(CASES.filter((c) => c.resolution.type === 'CLEAR'), rng);
  const other = shuffled(CASES.filter((c) => c.resolution.type !== 'CLEAR' && !c.special), rng);
  const special = shuffled(CASES.filter((c) => c.special), rng);
  const third = special.length && rng() < 0.35 ? special[0] : other[1];
  return ['normal', clear[0].id, 'review', other[0].id, rng() < 0.5 ? 'refusal' : 'normal', third.id];
}
export function caseForQueueItem(q) { return q.caseId ? coreCaseMap.get(q.caseId) : session.normalCaseMap.get(q.normalId); }
export function currentQueueItem() { return session.queue[state.caseIndex]; }
export function current() { const q = currentQueueItem(); return q ? caseForQueueItem(q) : null; }
export function screeningNo(i = state.caseIndex) { return 'A' + String(i + 1).padStart(3, '0'); }
export function hotelFromCase(c) { const d = (c.docs || []).find((x) => x.k === 'HOTEL' || x.k === 'STAY'); if (!d) return '공동 예약 숙소'; const row = (d.fields || []).find((x) => /숙소|숙박|호텔|체류지|시설|예약/.test(x[0])); return row?.[1] || '공동 예약 숙소'; }

// Seeded travel parties (family / couple / business team / friends / small tour group).
// Party membership only links statements for cross-checking; it never changes a legal outcome.
export function buildTravelParties(seed, queue) {
  const partyByTraveler = new Map(); const parties = [];
  const rng = makeRng(hashSeed(seed + '|PARTIES'));
  const byShift = new Map([[1, []], [2, []], [3, []]]);
  // Generated refusal cases are deliberately excluded. Party flavour must never erase a legal outcome.
  queue.forEach((q, idx) => { const c = caseForQueueItem(q); if (c && !q.caseId && c.resolution?.type === 'CLEAR') byShift.get(c.shift).push({ q, idx, c }); });
  const specs = [[1, PARTY_TYPES[0]], [1, PARTY_TYPES[1]], [2, PARTY_TYPES[2]], [2, PARTY_TYPES[3]], [3, PARTY_TYPES[4]]];
  let seq = 1;
  for (const [sh, tpl] of specs) {
    // People who travel together entered for the same kind of reason: a family trip is not made of one tourist
    // and two people on business visas. A business team may be two people when the shift has no third.
    const want = tpl.type === 'business' ? 'business' : 'tourist';
    const pool = shuffled(byShift.get(sh).filter((x) => !partyByTraveler.has(x.q.travelerId) && storyKind(x.c) === want), rng);
    const size = tpl.type === 'business' ? Math.min(tpl.size, pool.length) : tpl.size;
    if (size < 2 || pool.length < size) continue;
    const chosen = pool.slice(0, size).sort((a, b) => a.idx - b.idx);
    const lead = chosen[0].c, hotel = hotelFromCase(lead), stay = lead.stay;
    const allBusiness = chosen.every((x) => /업무|상용|회의|출장/.test((x.c.purpose || '') + ' ' + (x.c.basis || ''))); const allTourist = chosen.every((x) => /관광/.test(x.c.purpose || '')); const partyLabel = (tpl.type === 'business' && !allBusiness) || (tpl.type === 'tour' && !allTourist) ? '동행여행' : tpl.label; const partyPurpose = allBusiness ? '공동 출장 일정' : allTourist ? '공동 관광 일정' : '동행여행'; const party = { id: 'PTY-' + String(seq++).padStart(3, '0'), type: tpl.type, label: partyLabel, shift: sh, sharedPNR: 'G' + String(seed).slice(-3) + String(seq).padStart(2, '0'), hotel, stay, purpose: partyPurpose, mode: tpl.type === 'friends' ? 'minor-resolved' : tpl.type === 'business' && rng() < .65 ? 'minor-resolved' : 'consistent', members: [] };
    chosen.forEach((x, i) => {
      const t = getTraveler(x.q.travelerId), rel = tpl.relation[i] || '동행인';
      const member = { travelerId: t.id, queueIndex: x.idx, relation: rel, caseId: x.q.caseId || null, normalId: x.q.normalId || null }; party.members.push(member); partyByTraveler.set(t.id, party);
      const c = x.c;
      c.lookups = c.lookups || {}; c.lookups.party = ['정상', '동행인 교차검증은 연결된 동행여행 기록에서 동적으로 계산됩니다.'];
      c.arrival = lead.arrival; c.carrier = lead.carrier; c.stay = stay;
      // Shared booking also means one consistent onward flight across the party.
      c.return = lead.return;
      const returnAnswer = c.questions.find((q) => q.id === 'return');
      if (returnAnswer && lead.return !== '—') returnAnswer.a = `공동 예약된 ${lead.return} 항공편으로 돌아갑니다.`;
      for (const d of (c.docs || [])) { if (d.k === 'PNR') { const r = (d.fields || []).find((y) => y[0] === '입국편'); if (r) r[1] = lead.arrival.split(' · ')[0]; const route = (d.fields || []).find((y) => y[0] === '여정'); if (route) route[1] = lead.arrival.split(' · ')[1] || route[1]; const back = (d.fields || []).find((y) => y[0] === '귀국편'); if (back && lead.return !== '—') back[1] = lead.return.split(' · ')[0]; const onward = (d.fields || []).find((y) => y[0] === '출국여정'); if (onward) onward[1] = lead.return.split(' · ')[1] || onward[1]; d.fields.push(['공동 PNR', party.sharedPNR]); } if (d.k === 'HOTEL' || d.k === 'STAY') { const r = (d.fields || []).find((y) => /숙박|숙소|체류지/.test(y[0])); if (r) r[1] = party.hotel; } }
      if (!c.questions.some((q) => q.id === 'partyRelation')) c.questions.push({ id: 'partyRelation', cat: '국내관계', q: '함께 입국한 동행인이 있습니까? 관계를 설명해 주십시오.', a: `${party.label}으로 함께 왔습니다. 저는 ${rel} 관계입니다.`, reveal: 'party' });
      if (!c.questions.some((q) => q.id === 'partyPlan')) c.questions.push({ id: 'partyPlan', cat: '여행·체류', q: '동행인들과 체류 일정과 숙소가 모두 같습니까?', a: party.mode === 'minor-resolved' && i === chosen.length - 1 ? `기본 숙소와 귀국편은 같지만 하루는 개인 일정으로 따로 움직입니다.` : `네. 기본 숙소와 귀국 일정은 같습니다. 일부 자유시간만 다를 수 있습니다.`, reveal: 'party', requires: ['QUESTION_partyRelation'] });
      if (!c.questions.some((q) => q.id === 'partyBooking')) c.questions.push({ id: 'partyBooking', cat: '추가소명', q: '공동 예약의 대표자와 예약번호를 확인할 수 있습니까?', a: `대표 예약자는 ${getTraveler(chosen[0].q.travelerId).name.korean}이고 공동 예약번호는 ${party.sharedPNR}입니다.`, reveal: 'party', requires: ['QUESTION_partyRelation'] });
      c.docs.push({ t: '동행여행 확인자료', k: 'SUPPORTING', fields: [['여행형태', party.label], ['공동 예약번호', party.sharedPNR], ['기본 숙소', party.hotel], ['동행인원', chosen.length + '명']] });
    });
    if (party.mode === 'minor-resolved') {
      const target = chosen[chosen.length - 1].c;
      target.sessionVariant = 'party-secondary-clear';
      target.evidence = target.evidence || {}; target.evidence['동행일정'] = ['warn', '교차확인', '동행인과 일부 일정 진술 차이 · 단순 차이만으로 결론 불가'];
      target.required = [...new Set([...(target.required || []), 'SECONDARY', 'QUESTION_partyRelation', 'QUESTION_partyPlan', 'LOOKUP_party'])];
      // target is guaranteed CLEAR by candidate filtering above; do not rewrite resolution here.
    }
    parties.push(party);
  }
  return { parties, partyByTraveler };
}

// Build a complete roster for a seed into `session` (pure w.r.t. UI).
export function buildSession(seed) {
  session.seed = seed;
  session.normalCases = generateNormalCases(seed);
  session.normalCaseMap = new Map(session.normalCases.map((c) => [c.id, c]));
  session.queue = buildSessionQueue(seed, session.normalCases);
  const { parties, partyByTraveler } = buildTravelParties(seed, session.queue);
  session.parties = parties; session.partyByTraveler = partyByTraveler; session.partyArchive = new Map();
  // A travel party shares the lead's stay and hotel; re-apply the stories so statements follow the final record.
  for (const c of session.normalCases) { const party = partyByTraveler.get(c.travelerId); applyPassengerStory(c, seed, party ? party.id : null); }
  return session;
}

// Duty roster generation: 24 seeded normal passengers + 12 scripted core cases = 36 per shift-day,
// split across three shifts, plus seeded travel parties. Pure functions of the seed.
import { CASES } from '../../data/cases.js';
import { AIRPORT_BY_CODE, FICTIONAL_CARRIERS, FICTIONAL_HOTELS, PARTY_TYPES, VISA_FREE_RANDOM_CODES } from '../../data/entry-basis.js';
import { hashSeed, makeRng, pick, shuffled } from './rng.js';
import { getTraveler, travelerMap } from './traveler-engine.js';
import { session, state } from '../state.js';

export const coreCaseMap = new Map(CASES.map((c) => [c.id, c]));
export const CORE_TRAVELER_IDS = new Set(CASES.map((c) => c.travelerId));

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

export function makeNormalCase(t, index, shift, rng, seed) {
  const p = normalProfile(t, rng), origin = originAirport(t.nationality.code), flight = 'SIM' + String(300 + index), carrier = pick(FICTIONAL_CARRIERS, rng), hotel = pick(FICTIONAL_HOTELS, rng), review = rng() < .28;
  const passport = t.passport || {}; const dob = passport.birthDate || '1995-01-01'; const sex = passport.sex || 'X'; const passNo = passport.number || ('SIM' + String(index).padStart(7, '0')); const expiry = passport.expiry || '2033-12-31';
  let anomaly = null; if (review) anomaly = pick(['companionHotel', 'pnrAgency', 'friendContact'], rng);
  const questions = [{ id: 'purpose', cat: '기본사항', q: '이번 방문 목적을 말씀해 주십시오.', a: p.purpose + ' 목적입니다.', reveal: 'purpose' }, { id: 'stay', cat: '여행·체류', q: '한국에는 얼마나 머무를 예정입니까?', a: p.stay + ' 예정입니다.', reveal: 'stay' }, { id: 'return', cat: '여행·체류', q: '귀국 또는 다음 이동 일정이 있습니까?', a: p.kind === 'resident' ? '현재 체류자격에 따라 국내 체류지로 복귀합니다.' : '왕복 또는 후속 이동 예약이 확정되어 있습니다.', reveal: 'travel' }];
  const lookups = { history: ['정상', '과거 출입국 기록상 현재 심사에 영향을 줄 특이사항 없음.'], visa: ['정상', p.basis + ' 요건과 제출자료가 일치합니다.'], pnr: ['정상', '예약자료와 진술한 일정이 일치합니다.'], contact: ['정상', '국내 체류지 또는 연락처 자료가 확인됩니다.'], public: ['정상', '제출자료와 공개 확인정보 사이 특이한 모순이 없습니다.'] };
  const clues = []; let required = ['QUESTION_purpose'];
  if (review) {
    if (anomaly === 'companionHotel') {
      questions.push({ id: 'detail', cat: '추가소명', q: '숙박예약 명의가 본인이 아닌 이유를 설명해 주십시오.', a: '동행인이 두 사람 객실을 함께 예약했습니다. 제 이름도 투숙객 명단에 등록되어 있습니다.', reveal: 'depth', requires: ['QUESTION_purpose'] });
      lookups.contact = ['주의', '예약 대표명의는 동행인이지만 투숙객 명단에서 피심사인 성명과 동일 숙박기간이 확인됩니다.'];
      clues.push({ id: 'n1', trigger: 'INIT', title: '숙박 명의', text: '숙박예약 대표명의가 피심사인과 다름.', kind: 'unresolved', key: true }, { id: 'n2', trigger: 'LOOKUP_contact', title: '의심 해소', text: '동행예약 투숙객 명단에서 피심사인 성명이 확인됨.', kind: 'confirm', key: true }); required = ['SECONDARY', 'QUESTION_detail', 'LOOKUP_contact'];
    } else if (anomaly === 'pnrAgency') {
      questions.push({ id: 'detail', cat: '추가소명', q: '귀국편 예약내역을 본인 휴대전화에서 바로 제시하지 못하는 이유가 있습니까?', a: '여행사가 단체 예약으로 발권해 제 앱에는 안 보이지만 예약번호와 전자티켓이 있습니다.', reveal: 'depth', requires: ['QUESTION_return'] });
      lookups.pnr = ['주의', '여행사 단체예약 PNR에서 피심사인의 귀국편 전자티켓과 좌석상태가 확인됩니다.'];
      clues.push({ id: 'n1', trigger: 'INIT', title: '귀국편 표시', text: '개인 앱에서 귀국편이 즉시 조회되지 않음.', kind: 'unresolved', key: true }, { id: 'n2', trigger: 'LOOKUP_pnr', title: '의심 해소', text: '단체 PNR에서 유효 전자티켓과 귀국편이 확인됨.', kind: 'confirm', key: true }); required = ['SECONDARY', 'QUESTION_detail', 'LOOKUP_pnr'];
    } else {
      questions.push({ id: 'detail', cat: '국내관계', q: '전자입국신고의 국내 연락처와 어떤 관계입니까?', a: '예전에 알게 된 지인입니다. 숙박이나 취업을 제공받는 관계는 아니고 하루 만날 예정입니다.', reveal: 'depth', requires: ['QUESTION_purpose'] });
      lookups.contact = ['주의', '국내 연락처는 개인 지인이나 숙박·고용주·초청자로 등록된 이력은 확인되지 않습니다.'];
      clues.push({ id: 'n1', trigger: 'INIT', title: '국내 지인', text: '관광객이 개인 국내 연락처를 신고함.', kind: 'unresolved', key: true }, { id: 'n2', trigger: 'LOOKUP_contact', title: '의심 해소', text: '고용·숙박 제공 등 목적불일치를 뒷받침할 관계는 확인되지 않음.', kind: 'confirm', key: true }); required = ['SECONDARY', 'QUESTION_detail', 'LOOKUP_contact'];
    }
  }
  if (p.kind === 'resident') questions.push({ id: 'residence', cat: '추가소명', q: '체류카드와 국내 거소 정보를 확인하겠습니다.', a: '유효한 체류카드와 현재 거소 자료를 제시하겠습니다.', reveal: 'depth' });
  const doc2 = p.kind === 'resident' ? { t: '외국인등록증', k: 'RESIDENCE CARD', fields: [['성명', t.name.latin], ['체류자격', 'D-2'], ['상태', 'VALID'], ['재입국', '체류기간 내']] } : { t: '입국자격 자료', k: 'ENTRY BASIS', fields: [['입국기반', p.basis], ['사증', p.visa], ['K-ETA', p.eta], ['전자입국신고', p.arrivalCard]] };
  let docs = [{ t: '여권', k: 'PASSPORT', fields: [['성명', t.name.latin], ['국적', t.nationality.english || t.nationality.korean], ['여권번호', passNo], ['만료일', expiry], ['전자칩', 'VALID'], ['MRZ', 'VALID']] }, doc2, { t: '항공예약', k: 'PNR', fields: [['입국편', flight], ['여정', origin + ' → ICN'], ['귀국/이동', p.kind === 'resident' ? '—' : '왕복 발권 확인'], ['예약상태', 'CONFIRMED']] }, { t: p.kind === 'resident' ? '국내 거소자료' : '숙박예약', k: p.kind === 'resident' ? 'STAY' : 'HOTEL', fields: p.kind === 'resident' ? [['체류목적', '국내 체류지로 복귀'], ['거소', '등록정보와 일치'], ['체류기간', '유효']] : [['숙박', hotel], ['투숙객', t.name.latin], ['상태', 'CONFIRMED']] }];
  docs = [docs[0], ...shuffled(docs.slice(1), rng)];
  const evidence = { '신원': ['ok', '확인', '여권·생체정보 일치'], '입국자격': ['ok', '충족', p.basis], '입국목적': [review ? 'warn' : 'ok', review ? '추가확인' : '일치', p.purpose], '여행계획': ['ok', '확정', '예약자료 확인'], '체재능력': ['ok', '충분', '통상적인 체류자료 확인'], '국내관계': [review ? 'warn' : 'ok', review ? '추가확인' : '확인', '신고·예약자료 검증 가능'] };
  return { id: `NORMAL-${seed}-${String(index + 1).padStart(2, '0')}`, shift, travelerId: t.id, name: t.name.latin, nat: t.nationality.korean, code: t.nationality.code, sex, dob, passport: passNo, purpose: p.purpose, stay: p.stay, arrival: `${flight} · ${origin} → ICN`, return: p.kind === 'resident' ? '—' : '왕복 발권 확인', carrier, basis: p.basis, basisDetail: p.basisDetail, eta: p.eta, arrivalCard: p.arrivalCard, visa: p.visa, watch: '이상 없음', bio: '일치 ' + (98.7 + rng() * 1.1).toFixed(1) + '%', chip: '정상', risk: 'LOW', initial: review ? '제출자료 일부는 추가 확인이 필요하지만 방문 목적에 맞게 입국하려고 합니다.' : p.purpose + ' 목적으로 입국합니다. 필요한 예약과 증빙은 준비했습니다.', questions: [questions[0], ...shuffled(questions.slice(1), rng)], docs, lookups, evidence, required, resolution: { type: 'CLEAR', reason: null }, difficulty: review ? '일반 · 추가확인' : '일반', note: review ? '초기 의심사항이 재심의 추가 확인으로 해소되는 정상승객.' : '일반 정상승객. 필요한 최소 확인 후 신속하게 입국허가하는 것이 목표.', clues: clues.length ? clues : undefined, sessionVariant: review ? 'secondary-clear' : 'routine-clear' };
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
  queue.forEach((q, idx) => { const c = caseForQueueItem(q); if (c && !q.caseId) byShift.get(c.shift).push({ q, idx, c }); });
  const specs = [[1, PARTY_TYPES[0]], [1, PARTY_TYPES[1]], [2, PARTY_TYPES[2]], [2, PARTY_TYPES[3]], [3, PARTY_TYPES[4]]];
  let seq = 1;
  for (const [sh, tpl] of specs) {
    const rawPool = byShift.get(sh).filter((x) => !partyByTraveler.has(x.q.travelerId)); const nonResident = rawPool.filter((x) => !/재입국/.test(x.c.basis || '')); const pool = shuffled(nonResident.length >= tpl.size ? nonResident : rawPool, rng);
    if (pool.length < tpl.size) continue;
    const chosen = pool.slice(0, tpl.size).sort((a, b) => a.idx - b.idx);
    const lead = chosen[0].c, hotel = hotelFromCase(lead), stay = lead.stay;
    const allBusiness = chosen.every((x) => /업무|상용|회의|출장/.test((x.c.purpose || '') + ' ' + (x.c.basis || ''))); const allTourist = chosen.every((x) => /관광/.test(x.c.purpose || '')); const partyLabel = (tpl.type === 'business' && !allBusiness) || (tpl.type === 'tour' && !allTourist) ? '동행여행' : tpl.label; const partyPurpose = allBusiness ? '공동 출장 일정' : allTourist ? '공동 관광 일정' : '동행여행'; const party = { id: 'PTY-' + String(seq++).padStart(3, '0'), type: tpl.type, label: partyLabel, shift: sh, sharedPNR: 'G' + String(seed).slice(-3) + String(seq).padStart(2, '0'), hotel, stay, purpose: partyPurpose, mode: tpl.type === 'friends' ? 'minor-resolved' : tpl.type === 'business' && rng() < .65 ? 'minor-resolved' : 'consistent', members: [] };
    chosen.forEach((x, i) => {
      const t = getTraveler(x.q.travelerId), rel = tpl.relation[i] || '동행인';
      const member = { travelerId: t.id, queueIndex: x.idx, relation: rel, caseId: x.q.caseId || null, normalId: x.q.normalId || null }; party.members.push(member); partyByTraveler.set(t.id, party);
      const c = x.c;
      c.lookups = c.lookups || {}; c.lookups.party = ['정상', '동행인 교차검증은 연결된 동행여행 기록에서 동적으로 계산됩니다.'];
      c.arrival = lead.arrival; c.carrier = lead.carrier; c.stay = stay;
      for (const d of (c.docs || [])) { if (d.k === 'PNR') { const r = (d.fields || []).find((y) => y[0] === '입국편'); if (r) r[1] = lead.arrival.split(' · ')[0]; d.fields.push(['공동 PNR', party.sharedPNR]); } if (d.k === 'HOTEL' || d.k === 'STAY') { const r = (d.fields || []).find((y) => /숙박|숙소|체류지/.test(y[0])); if (r) r[1] = party.hotel; } }
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
      target.resolution = { type: 'CLEAR' };
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
  return session;
}

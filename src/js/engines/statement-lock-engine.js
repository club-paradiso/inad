// Statement Lock Engine (DOM-free, deterministic):
// Turns passenger dialogue statements into manipulable evidence by comparing statements against
// submitted documents, system lookup records, or other statements to detect factual contradictions.
//
// Invariant: The engine is purely deterministic. AI never decides whether a contradiction exists.
// Canonical contradiction pairs are verified against case facts, documents, and lookups.

import { state } from '../state.js';
import { current } from './queue-engine.js';
import { discoverTriggeredClues, questionUnlocked } from './clue-engine.js';
import { addLog } from './log.js';
import { behaviorAdjust } from './behavior-engine.js';
import { bus } from '../services/bus.js';

export const LOCK_RESULTS = {
  CRITICAL: 'critical',   // Decisive legal contradiction (smoking gun)
  CONFLICT: 'conflict',   // Meaningful factual inconsistency
  DISCREPANCY: 'discrepancy', // Unexplained difference requiring follow-up
  CONSISTENT: 'consistent', // Statements/documents agree or no conflict
  UNRELATED: 'unrelated'  // No logical connection between the items
};

// Canonical contradiction rules per case
const CASE_CONTRADICTIONS = {
  // Positive cross-checks on lawful admissions are evidence confirmations, not accusations.
  'ICN-S1-001': [
    { id: 'S1_001_PURPOSE', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '컨퍼런스 방문 목적이 전자입국신고의 회의·상용방문 목적과 일치합니다.',
      statementQuestions: ['purpose'], matchTargets: [{ type: 'doc', key: 'E-ARRIVAL', fieldPattern: /^입국목적$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'rv2', actionToken: 'LOCK_s1_001_purpose',
      stressDelta: 0, unlockQuestions: ['agenda'] },
    { id: 'S1_001_RETURN', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '귀국편 진술과 항공예약 기록의 KE081편이 일치합니다.',
      statementQuestions: ['return'], matchTargets: [{ type: 'doc', key: 'PNR', fieldPattern: /^귀국편$/, requiresLooked: 'pnr' }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'rv6', actionToken: 'LOCK_s1_001_return',
      stressDelta: 0, unlockQuestions: ['funds'] }
  ],
  'ICN-S1-002': [
    { id: 'S1_002_HOTEL', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '호텔 예약확인서에 여행객 본인 명의의 투숙 정보가 기재되어 있습니다.',
      statementQuestions: ['hotel'], matchTargets: [{ type: 'doc', key: 'HOTEL', fieldPattern: /^투숙객$/, requiresLooked: 'contact' }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'mt5', actionToken: 'LOCK_s1_002_hotel',
      stressDelta: 0, unlockQuestions: ['budget'] },
    { id: 'S1_002_RETURN', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '4일 후 귀국한다는 진술과 OZ102편 예약 기록이 일치합니다.',
      statementQuestions: ['return'], matchTargets: [{ type: 'doc', key: 'PNR', fieldPattern: /^출국$/, requiresLooked: 'pnr' }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'mt4', actionToken: 'LOCK_s1_002_return',
      stressDelta: 0, unlockQuestions: ['study'] }
  ],
  'ICN-S1-003': [
    { id: 'S1_003_RESIDENCE', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '유효 F-2 체류카드 소지 진술과 제시된 등록증의 체류자격이 일치합니다.',
      statementQuestions: ['residence'], matchTargets: [{ type: 'doc', key: 'RESIDENCE CARD', fieldPattern: /^체류자격$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'jp2', actionToken: 'LOCK_s1_003_residence',
      stressDelta: 0, unlockQuestions: ['trip'] },
    { id: 'S1_003_ADDRESS', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '서울 마포구 체류지 진술과 등록증에 기재된 체류지가 일치합니다.',
      statementQuestions: ['address'], matchTargets: [{ type: 'doc', key: 'RESIDENCE CARD', fieldPattern: /^체류지$/, requiresLooked: 'contact' }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'jp5', actionToken: 'LOCK_s1_003_address',
      stressDelta: 0, unlockQuestions: ['job'] }
  ],
  'ICN-S1-004': [
    { id: 'S1_004_ABTC', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: 'ABTC와 여권의 기재번호가 일치한다는 진술을 제출된 ABTC 자료로 확인했습니다.',
      statementQuestions: ['abtc'], matchTargets: [{ type: 'doc', key: 'ABTC', fieldPattern: /^여권번호$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'nl1', actionToken: 'LOCK_s1_004_abtc',
      stressDelta: 0, unlockQuestions: ['kor'] },
    { id: 'S1_004_KOR', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '한국(KOR) 승인 진술과 ABTC 승인국 표기가 일치합니다.',
      statementQuestions: ['kor'], matchTargets: [{ type: 'doc', key: 'ABTC', fieldPattern: /^승인국$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'nl2', actionToken: 'LOCK_s1_004_kor',
      stressDelta: 0, unlockQuestions: ['agenda'] }
  ],
  'ICN-S2-006': [
    { id: 'S2_006_BOOKING', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '친구가 예약한 호텔 바우처의 동반 투숙객 명단에 피심사인 성명이 기재되어 있습니다.',
      statementQuestions: ['bookingName'], matchTargets: [{ type: 'doc', key: 'HOTEL', fieldPattern: /^투숙객$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'sr2', actionToken: 'LOCK_s2_006_booking',
      stressDelta: 0, unlockQuestions: ['itinerary'] },
    { id: 'S2_006_RETURN', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: 'GA879편으로 돌아간다는 진술과 동반 예약 항공권의 출국편이 일치합니다.',
      statementQuestions: ['return'], matchTargets: [{ type: 'doc', key: 'PNR', fieldPattern: /^출국$/, requiresLooked: 'pnr' }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'sr3', actionToken: 'LOCK_s2_006_return',
      stressDelta: 0, unlockQuestions: ['work'] }
  ],
  'ICN-S2-008': [
    { id: 'S2_008_COMPANY', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '방문 거래처로 진술한 Hanseong Robotics가 초청장에 기재되어 있습니다.',
      statementQuestions: ['company'], matchTargets: [{ type: 'doc', key: 'INVITATION', fieldPattern: /^초청사$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'lw1', actionToken: 'LOCK_s2_008_company',
      stressDelta: 0, unlockQuestions: ['schedule'] },
    { id: 'S2_008_PURPOSE', title: '[교차검증 완료] 진술-자료 일치 확인',
      desc: '제품 검수·회의 목적에 관한 진술과 초청장에 적힌 활동 목적이 일치합니다.',
      statementQuestions: ['purpose'], matchTargets: [{ type: 'doc', key: 'INVITATION', fieldPattern: /^목적$/ }],
      severity: LOCK_RESULTS.CONSISTENT, clueId: 'lw3', actionToken: 'LOCK_s2_008_purpose',
      stressDelta: 0, unlockQuestions: ['inspection'] }
  ],
  'ICN-S2-005': [
    // 1. Contact number linked to illegal employment broker vs "friend's friend"
    {
      id: 'S2_005_CONTACT_BROKER',
      title: '연락처 불법알선 의혹 대조',
      desc: '신고된 연락처가 전산망상 불법취업 알선 번호로 확인되었으나, 피심사인은 구체적 신원을 모르는 친구의 친구라고 진술했습니다.',
      statementQuestions: ['contact', 'addressOwner'],
      matchTargets: [
        { type: 'lookup', kind: 'contact' },
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /연락처/, requiresLooked: 'contact' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'tm4',
      actionToken: 'LOCK_contact_anomaly',
      stressDelta: 20,
      unlockQuestions: ['addressOwner', 'jobOffer']
    },
    // 2. Tourist visa C-3-9 vs Seeking factory work
    {
      id: 'S2_005_VISA_JOB_INTENT',
      title: '관광 사증과 취업 의도 불일치 (결정적 모순)',
      desc: 'C-3-9 단기방문(관광) 사증으로 입국하면서 국내 공장 일자리를 알아본 사실을 인정하여 사증 목적과 입국 의도가 정면으로 상충합니다.',
      statementQuestions: ['jobOffer', 'occupation'],
      matchTargets: [
        { type: 'doc', key: 'VISA' },
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /목적/ },
        { type: 'statement', questionId: 'purpose' }
      ],
      severity: LOCK_RESULTS.CRITICAL,
      clueId: 'tm6',
      actionToken: 'LOCK_visa_job_conflict',
      stressDelta: 30,
      unlockQuestions: ['jobOffer', 'returnMoney']
    },
    // 3. Staying at private house in Guro-gu vs Host identity unknown
    {
      id: 'S2_005_LODGING_HOST_UNKNOWN',
      title: '체류지 제공자 불명 대조',
      desc: '신고 체류지는 구로구 개인주택이나 거주자 신원·관계를 소명하지 못해 숙소 제공 관계가 불투명합니다.',
      statementQuestions: ['addressOwner', 'host'],
      matchTargets: [
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /체류지/ },
        { type: 'lookup', kind: 'public' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'tm5',
      actionToken: 'LOCK_address_conflict',
      stressDelta: 15,
      unlockQuestions: ['host']
    },
    // 4. Return flight absent vs 150,000 KRW funds for 30-day stay
    {
      id: 'S2_005_FUNDS_RETURN_DISCREPANCY',
      title: '체재비 대비 귀국대책 부재 대조',
      desc: '30일 체류 예정이나 소지 현금은 15만원에 불과하며 귀국 항공권이 발권되지 않았습니다.',
      statementQuestions: ['return', 'funds', 'returnMoney'],
      matchTargets: [
        { type: 'doc', key: 'PNR' },
        { type: 'lookup', kind: 'pnr' },
        { type: 'statement', questionId: 'funds' },
        { type: 'statement', questionId: 'return' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'tm2',
      actionToken: 'LOCK_funds_return_conflict',
      stressDelta: 15,
      unlockQuestions: ['returnMoney']
    }
  ],
  'ICN-S2-007': [
    // 1. Tourist visa C-3-9 vs Massage parlor work intent
    {
      id: 'S2_007_MASSAGE_WORK_INTENT',
      title: '관광 사증과 마사지샵 취업 의도 불일치 (결정적 모순)',
      desc: 'C-3-9 관광 사증으로 입국하면서 강남 마사지샵에서 일할 수 있다는 진술을 하여 사증 목적과 실제 입국 목적이 정면으로 상충합니다.',
      statementQuestions: ['massage', 'work'],
      matchTargets: [
        { type: 'doc', key: 'VISA' },
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /목적/ },
        { type: 'statement', questionId: 'purpose' }
      ],
      severity: LOCK_RESULTS.CRITICAL,
      clueId: 'ms5',
      actionToken: 'LOCK_s2_007_massage_conflict',
      stressDelta: 30,
      unlockQuestions: ['massage', 'alex']
    },
    // 2. Hotel unverified and unknown host Alex
    {
      id: 'S2_007_HOTEL_UNVERIFIED',
      title: '숙소 예약 미확인 및 체류지 소명 불일치',
      desc: '강남 호텔에 체류한다고 주장하나 정확한 상호와 주소를 제시하지 못하며 예약 내역이 확인되지 않습니다.',
      statementQuestions: ['hotel', 'hotelName'],
      matchTargets: [
        { type: 'lookup', kind: 'contact' },
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /체류지|호텔/ }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'ms2',
      actionToken: 'LOCK_s2_007_hotel_conflict',
      stressDelta: 20,
      unlockQuestions: ['hotelName', 'alex']
    },
    // 3. Return ticket vs Undefined extension
    {
      id: 'S2_007_RETURN_EXTENSION',
      title: '왕복 여정과 체류 연장 의사 상충 대조',
      desc: 'PNR상 7일 단기 일정으로 발권되었으나 일자리가 생기면 체류를 연장하겠다는 진술로 귀국의사가 불확실합니다.',
      statementQuestions: ['returnPlan'],
      matchTargets: [
        { type: 'doc', key: 'PNR' },
        { type: 'lookup', kind: 'pnr' }
      ],
      severity: LOCK_RESULTS.DISCREPANCY,
      clueId: 'ms6',
      actionToken: 'LOCK_s2_007_return_discrepancy',
      stressDelta: 15,
      unlockQuestions: ['returnPlan']
    }
  ],
  'ICN-S3-009': [
    // 1. Passport obtained via broker vs genuine travel document
    {
      id: 'S3_009_PASSPORT_BROKER',
      title: '여권 비정상 중개 취득 대조 (위변조 여권)',
      desc: '여권을 공식 발급기관이 아닌 중개인을 통해 대가를 주고 취득했다고 진술하여 유효한 여권 요건을 흠결하였습니다.',
      statementQuestions: ['purchase'],
      matchTargets: [
        { type: 'doc', key: 'PASSPORT' },
        { type: 'lookup', kind: 'bio' }
      ],
      severity: LOCK_RESULTS.CRITICAL,
      clueId: 'er4',
      actionToken: 'LOCK_s3_009_broker_passport',
      stressDelta: 35,
      unlockQuestions: ['purchase', 'trueName']
    },
    // 2. Biometric and altered datapage vs claimed identity
    {
      id: 'S3_009_BIOMETRIC_IDENTITY_MISMATCH',
      title: '생체정보 불일치 감식과 신원 주장 대조',
      desc: '데이터페이지 변조 및 생체정보 불일치 감식 결과에도 불구하고 여권상 인적사항이 본인이라고 진술하여 신원 도용 사실이 확인됩니다.',
      statementQuestions: ['identity', 'trueName'],
      matchTargets: [
        { type: 'doc', key: 'BIOMETRIC' },
        { type: 'doc', key: 'PASSPORT' },
        { type: 'lookup', kind: 'bio' }
      ],
      severity: LOCK_RESULTS.CRITICAL,
      clueId: 'er3',
      actionToken: 'LOCK_s3_009_bio_mismatch',
      stressDelta: 30,
      unlockQuestions: ['trueName']
    },
    // 3. Message deletion and covert identity instruction
    {
      id: 'S3_009_MESSAGE_DESTRUCTION',
      title: '증거인멸 시도 및 위장 신원 정황 대조',
      desc: '휴대전화 메시지 삭제 시도와 새 이름 통과 지시 정황이 확인되어 단순 관광 진술과 정면으로 상충합니다.',
      statementQuestions: ['destroy', 'messages'],
      matchTargets: [
        { type: 'doc', key: 'PNR' },
        { type: 'statement', questionId: 'phone' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'er7',
      actionToken: 'LOCK_s3_009_destroy_conflict',
      stressDelta: 20,
      unlockQuestions: ['destroy']
    }
  ],
  'ICN-S3-010': [
    // 1. Economic employment motive vs convention refugee persecution
    {
      id: 'S3_010_ECONOMIC_MOTIVE_CONFLICT',
      title: '경제적 취업 목적과 난민 박해사유 불일치 대조',
      desc: '박해에 대한 개별적 소명 없이 한국 내 취업과 본국 송금이 주된 목적임을 진술하여 난민사유와 불일치합니다.',
      statementQuestions: ['workPlan', 'claimTiming'],
      matchTargets: [
        { type: 'doc', key: 'VISA' },
        { type: 'statement', questionId: 'refugee' },
        { type: 'statement', questionId: 'persecution' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'aa4',
      actionToken: 'LOCK_s3_010_economic_refugee',
      stressDelta: 20,
      unlockQuestions: ['workPlan', 'claimTiming']
    }
  ],
  'ICN-S3-011': [
    // 1. Biometric refusal vs lack of statutory exemption
    {
      id: 'S3_011_BIO_REFUSAL_STATUTORY',
      title: '법정 생체정보 제공의무 불응 대조',
      desc: '출입국관리법상 면제 요건(17세 미만, 공무 수행 등)에 해당하지 않음을 인정하면서도 지문 및 얼굴 정보 제공을 불응하고 있습니다.',
      statementQuestions: ['exempt', 'bio', 'otherDocs'],
      matchTargets: [
        { type: 'doc', key: 'PASSPORT' },
        { type: 'doc', key: 'BIOMETRIC' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'bt4',
      actionToken: 'LOCK_s3_011_bio_refusal',
      stressDelta: 25,
      unlockQuestions: ['exempt', 'explain']
    }
  ],
  'ICN-S3-012': [
    // 1. Prior deportation 5-year entry ban vs Tourist claim
    {
      id: 'S3_012_WATCHLIST_DEPORTATION',
      title: '과거 강제퇴거 처분 및 입국금지 기록 대조',
      desc: '전산망상 2023-08-14 강제퇴거명령에 따른 5년 입국금지 규제 기간이 경과하지 않았음에도 단순 관광 입국을 시도하고 있습니다.',
      statementQuestions: ['history', 'order', 'date'],
      matchTargets: [
        { type: 'doc', key: 'WATCHLIST' },
        { type: 'lookup', kind: 'watchlist' }
      ],
      severity: LOCK_RESULTS.CRITICAL,
      clueId: 'km4',
      actionToken: 'LOCK_s3_012_watchlist_deportation',
      stressDelta: 30,
      unlockQuestions: ['order', 'permission']
    },
    // 2. Lack of special permission waiver
    {
      id: 'S3_012_NO_PERMISSION_WAIVER',
      title: '입국규제 해제·특별허가 부존재 대조',
      desc: '입국금지 처분에 대해 법무부장관의 별도 규제해제 또는 입국허가를 받은 사실이 공식 기록상 존재하지 않습니다.',
      statementQuestions: ['permission'],
      matchTargets: [
        { type: 'doc', key: 'WATCHLIST' },
        { type: 'lookup', kind: 'watchlist' }
      ],
      severity: LOCK_RESULTS.CONFLICT,
      clueId: 'km6',
      actionToken: 'LOCK_s3_012_no_permission',
      stressDelta: 20,
      unlockQuestions: ['permission']
    }
  ]
};

// Procedural cases use only contradictions supported by the displayed record.
// A mismatch is a reason to ask again, NOT a finding of fraud or a statutory refusal.
function shownField(c, key, pattern) {
  const doc = (c.docs || []).find((d) => d.k === key);
  return (doc?.fields || []).filter(([label]) => pattern.test(String(label)))
    .map(([, value]) => String(value)).join(' ');
}

function isFieldTarget(target, key, pattern) {
  return target.type === 'doc' && target.key === key &&
    (!target.fieldName || pattern.test(target.fieldName));
}

function normalMismatch(id, title, desc) {
  return { matched: true, id, title, desc, severity: LOCK_RESULTS.DISCREPANCY,
    actionToken: `LOCK_${id.toLowerCase()}`, stressDelta: 6 };
}

// For evidence still under review, do not infer an applicant's intent from nationality,
// risk labels, or facts the player has not inspected.
function evaluateGenericContradiction(sourceStatement, targetItem, c) {
  if (!String(c?.id || '').startsWith('NORMAL-')) return { matched: false };
  const text = String(sourceStatement.text || '').toLowerCase();
  const qid = sourceStatement.questionId || resolveLogQuestionId(sourceStatement, c);

  // 1. Statement asserts a booked return, but the displayed PNR explicitly denies it.
  if (qid === 'return' && isFieldTarget(targetItem, 'PNR', /귀국|출국|이동|예약상태|상태/)) {
    const claim = /귀국|돌아|왕복|발권|예약|출국|return|ticket|flight/.test(text);
    const pnr = shownField(c, 'PNR', /귀국|출국|이동|예약상태|상태/);
    if (claim && /미발권|취소|없음|no return|not ticketed|cancelled|unconfirmed/i.test(pnr)) {
      return normalMismatch('GENERIC_PNR_RETURN', '귀국 예약 진술·기록 불일치',
        '귀국편 발권 진술과 화면에 표시된 실제 예약 상태가 다릅니다. 추가 확인이 필요합니다.');
    }
  }

  // 2. Hotel vs private home is a concrete lodging-type difference. A different
  // spelling or language for the same address is not sufficient for a mismatch.
  if (['hotel', 'stay', 'address'].includes(qid) &&
      isFieldTarget(targetItem, 'E-ARRIVAL', /체류지|숙소|숙박/)) {
    const lodging = shownField(c, 'E-ARRIVAL', /체류지|숙소|숙박/).toLowerCase();
    const saidHotel = /호텔|hotel/.test(text);
    const filedHotel = /호텔|hotel/.test(lodging);
    const saidHome = /자택|개인주택|친구 집|지인 집|private home|friend.s home/.test(text);
    const filedHome = /자택|개인주택|친구 집|지인 집|private home|friend.s home/.test(lodging);
    if (lodging && ((saidHotel && filedHome) || (saidHome && filedHotel))) {
      return normalMismatch('GENERIC_STAY', '신고 숙소 유형과 진술 불일치',
        '신고된 체류지의 숙소 유형과 인터뷰 진술이 달라 추가 확인이 필요합니다.');
    }
  }

  // 3. Flag an explicit mismatch between a stated cash amount and the displayed
  // funds record, contextualized by the stated number of days. No universal
  // "minimum KRW/day" is fabricated for immigration eligibility.
  if (qid === 'funds' && targetItem.type === 'doc' &&
      /FUNDS|BANK|E-ARRIVAL|FINANCIAL/i.test(targetItem.key || '') &&
      (!targetItem.fieldName || /현금|잔액|금액|체재비|자금|funds|balance|cash/i.test(targetItem.fieldName))) {
    const amountFrom = (s) => {
      const v = String(s).replaceAll(',', '');
      const m = v.match(/(\d+(?:\.\d+)?)\s*(억원|천만원|백만원|만원|원|krw)/i);
      if (!m) return null;
      return Number(m[1]) * ({ 억원: 100000000, 천만원: 10000000, 백만원: 1000000, 만원: 10000, 원: 1, krw: 1 }[m[2].toLowerCase()] || 1);
    };
    const recorded = shownField(c, targetItem.key, /현금|잔액|금액|체재비|자금|funds|balance|cash/i);
    const spoken = amountFrom(text), documented = amountFrom(recorded);
    const stayDays = Number(String(c.stay || '').match(/\d+/)?.[0] || 0);
    if (spoken !== null && documented !== null && stayDays > 0 && documented < spoken) {
      return normalMismatch('GENERIC_FUNDS', '체재비 진술과 증빙 금액 불일치',
        `${stayDays}일 체류 예정이며 진술한 금액과 제시된 자금 증빙 금액이 다릅니다. 확인이 필요합니다.`);
    }
  }

  // 4. Tourist admission basis vs an explicit plan for paid domestic work.
  if (['purpose', 'detail', 'work', 'jobOffer', 'occupation'].includes(qid) &&
      targetItem.type === 'doc' && ['VISA', 'ENTRY BASIS'].includes(targetItem.key)) {
    const basis = shownField(c, targetItem.key, /체류자격|사증|입국기반|종류|목적|구분/);
    const tourist = /C-3-9|TOURIST|TOURISM|관광/i.test(basis);
    const paidWork = /(?:일을|근무|취업|알바|월급|급여|사례비|시급|돈을 받아|현금으로).{0,28}(?:받|하|일|벌|지급)|(?:paid work|salary|wage|employment)/i.test(text);
    if (tourist && paidWork) {
      return normalMismatch('GENERIC_VISA_PURPOSE', '관광 목적과 유상활동 진술 불일치',
        '제시된 관광 입국기반과 국내 유상활동 계획에 관한 진술이 달라 추가 확인이 필요합니다.');
    }
  }

  return { matched: false };
}

// Only suggest visible document fields for the already-selected passenger statement,
// and only when a guide is enabled. A required lookup must precede any hint.
export function statementDocumentCandidates(c, questionId) {
  if (!c || !questionId) return [];
  const out = [];
  for (const rule of CASE_CONTRADICTIONS[c.id] || []) {
    if (!rule.statementQuestions.includes(questionId)) continue;
    for (const target of rule.matchTargets) {
      if (target.type === 'doc' && (!target.requiresLooked || hasPerformedLookup(target.requiresLooked))) {
        out.push({ key: target.key, fieldPattern: target.fieldPattern || null });
      }
    }
  }
  // A generic case has no authored hidden-answer catalogue.
  if (String(c.id).startsWith('NORMAL-')) {
    const map = { return: ['PNR'], stay: ['E-ARRIVAL'], hotel: ['E-ARRIVAL'],
      address: ['E-ARRIVAL'], funds: ['FUNDS', 'BANK', 'E-ARRIVAL', 'FINANCIAL'],
      purpose: ['VISA', 'ENTRY BASIS'], detail: ['VISA', 'ENTRY BASIS'] };
    for (const key of map[questionId] || []) out.push({ key, fieldPattern: null });
  }
  return out;
}

// Find question ID associated with an alien statement log
export function resolveLogQuestionId(logItem, c = current()) {
  if (!logItem || !c) return null;
  if (logItem.questionId) return logItem.questionId;
  if (logItem.matched) return logItem.matched;
  if (logItem.text === c.initial) return '__initial';
  const found = (c.questions || []).find((q) => q.a === logItem.text || logItem.text.includes(q.a) || (q.a && q.a.includes(logItem.text)));
  return found ? found.id : null;
}

function hasPerformedLookup(kind) {
  if (!kind) return true;
  if (state.looked instanceof Set && state.looked.has(kind)) return true;
  if (Array.isArray(state.performed) && state.performed.includes(`LOOKUP_${kind}`)) return true;
  return false;
}

// Compare a selected statement with a target item (document, lookup, or statement)
export function evaluateStatementLock(sourceStatement, targetItem, c = current()) {
  if (!sourceStatement || !targetItem || !c) {
    return { ok: false, reason: LOCK_RESULTS.UNRELATED, message: '대조 대상이 올바르게 지정되지 않았습니다.' };
  }

  const qid = sourceStatement.questionId || resolveLogQuestionId(sourceStatement, c);
  const rules = CASE_CONTRADICTIONS[c.id] || [];

  for (const rule of rules) {
    // Check if statement matches rule's candidate questions
    const statementMatches = rule.statementQuestions.includes(qid) || 
      (rule.statementQuestions.includes('__initial') && sourceStatement.text === c.initial);
    if (!statementMatches) continue;

    // Check if target matches rule's target criteria
    for (const mt of rule.matchTargets) {
      if (mt.type === targetItem.type) {
        if (mt.type === 'doc' && mt.key === targetItem.key) {
          if (!mt.fieldPattern || (targetItem.fieldName && mt.fieldPattern.test(targetItem.fieldName))) {
            if (mt.requiresLooked && !hasPerformedLookup(mt.requiresLooked)) {
              return {
                ok: false,
                reason: LOCK_RESULTS.UNRELATED,
                title: '전산 조회 선행 필요',
                message: '전산망 조회를 먼저 수행하여 사실 관계를 확인하십시오.'
              };
            }
            return applySuccessfulLock(rule, c);
          }
        } else if (mt.type === 'lookup' && mt.kind === targetItem.kind) {
          return applySuccessfulLock(rule, c);
        } else if (mt.type === 'statement' && targetItem.questionId === mt.questionId && targetItem.logIndex !== sourceStatement.logIndex) {
          return applySuccessfulLock(rule, c);
        }
      }
    }
  }

  // Fallback to generic evaluation
  const generic = evaluateGenericContradiction(sourceStatement, targetItem, c);
  if (generic.matched) {
    return applySuccessfulLock(generic, c);
  }

  return {
    ok: false,
    reason: LOCK_RESULTS.CONSISTENT,
    title: '모순 없음',
    message: '두 항목 사이에 법적으로 유의미한 모순이나 불일치가 확인되지 않았습니다.'
  };
}

function applySuccessfulLock(rule, c) {
  const token = rule.actionToken || `LOCK_${rule.id}`;
  const alreadyDone = state.performed.includes(token);
  const unlockedQuestions = Array.isArray(rule.unlockQuestions) ? rule.unlockQuestions.slice() : [];

  if (!alreadyDone) {
    state.performed.push(token);
    if (rule.clueId && !state.discoveredClues.has(rule.clueId)) {
      state.discoveredClues.add(rule.clueId);
    }
    const newlyUnlocked = [];
    for (const qid of unlockedQuestions) {
      const uToken = `UNLOCK_Q_${qid}`;
      if (!state.performed.includes(uToken)) {
        state.performed.push(uToken);
        if (!state.asked?.has?.(qid)) newlyUnlocked.push(qid);
      }
    }
    if (rule.stressDelta && state.behavior) {
      behaviorAdjust(rule.stressDelta, -Math.floor(rule.stressDelta * 0.6), 'statement-lock');
    }
    const confirmation = rule.severity === LOCK_RESULTS.CONSISTENT;
    addLog(confirmation ? 'system' : 'alert', `${confirmation ? '[교차검증 완료]' : '[진술 대조 확인]'} ${rule.title} — ${rule.desc}`);
    if (newlyUnlocked.length && c?.questions) {
      const qLabels = newlyUnlocked.map((id) => c.questions.find((x) => x.id === id)?.q || id).join(' · ');
      addLog('system', `[추궁 질문 해금] 모순 포착으로 추가 추궁 질문이 개방되었습니다: ${qLabels}`);
    }
    bus.emit('analytics', { name: 'statement_lock_success', ruleId: rule.id, caseId: c.id });
    bus.emit('changed');
  }

  return {
    ok: true,
    severity: rule.severity,
    id: rule.id,
    title: rule.title,
    description: rule.desc,
    clueId: rule.clueId || null,
    unlockedQuestions,
    isFirstDiscovery: !alreadyDone
  };
}

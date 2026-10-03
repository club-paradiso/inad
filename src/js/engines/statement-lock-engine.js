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
  'ICN-S2-005': [
    // 1. Contact number linked to illegal employment broker vs "friend's friend"
    {
      id: 'S2_005_CONTACT_BROKER',
      title: '연락처 불법알선 의혹 대조',
      desc: '신고된 연락처가 전산망상 불법취업 알선 번호로 확인되었으나, 피심사인은 구체적 신원을 모르는 친구의 친구라고 진술했습니다.',
      statementQuestions: ['contact', 'addressOwner'],
      matchTargets: [
        { type: 'lookup', kind: 'contact' },
        { type: 'doc', key: 'E-ARRIVAL', fieldPattern: /연락처/ }
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

// Generic matching rules for cases without bespoke scripts
function evaluateGenericContradiction(sourceStatement, targetItem, c) {
  const text = String(sourceStatement.text || '').toLowerCase();
  
  // Checking PNR one-way vs return ticket claim
  if (targetItem.type === 'doc' && targetItem.key === 'PNR') {
    if ((text.includes('귀국') || text.includes('돌아갈')) && /none|없음/i.test(c.return || '')) {
      return {
        matched: true,
        id: 'GENERIC_PNR_RETURN_CONFLICT',
        title: '귀국편 예약 상태 불일치',
        desc: '진술 내용과 실제 항공 예약 기록상 귀국편 상태가 일치하지 않습니다.',
        severity: LOCK_RESULTS.CONFLICT,
        actionToken: 'LOCK_pnr_conflict',
        stressDelta: 10
      };
    }
  }

  // Checking e-Arrival purpose vs statement
  if (targetItem.type === 'doc' && targetItem.key === 'E-ARRIVAL') {
    const earr = (c.docs || []).find((d) => d.k === 'E-ARRIVAL');
    const fields = earr?.fields || [];
    const declaredStay = fields.find((f) => f[0] === '체류지')?.[1] || '';
    if (declaredStay && text.includes('호텔') && !declaredStay.includes('호텔') && !declaredStay.includes('HOTEL')) {
      return {
        matched: true,
        id: 'GENERIC_STAY_CONFLICT',
        title: '신고 체류지와 진술 불일치',
        desc: '전자입국신고서에 신고된 체류지와 인터뷰 진술상의 숙박 형태가 일치하지 않습니다.',
        severity: LOCK_RESULTS.DISCREPANCY,
        actionToken: 'LOCK_stay_discrepancy',
        stressDelta: 10
      };
    }
  }

  return { matched: false };
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

  if (!alreadyDone) {
    state.performed.push(token);
    if (rule.clueId && !state.discoveredClues.has(rule.clueId)) {
      state.discoveredClues.add(rule.clueId);
    }
    if (rule.stressDelta && state.behavior) {
      behaviorAdjust({ stress: rule.stressDelta, rapport: -Math.floor(rule.stressDelta * 0.6) });
    }
    addLog('alert', `[진술 대조 확인] ${rule.title} — ${rule.desc}`);
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
    isFirstDiscovery: !alreadyDone
  };
}

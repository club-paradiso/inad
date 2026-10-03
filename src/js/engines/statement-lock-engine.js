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

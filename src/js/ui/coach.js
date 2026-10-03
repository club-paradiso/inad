// First-Duty Coach (수습 심사관 현장 코치):
// Non-intrusive in-context coaching for new players on their first case.
// Provides gentle guidance on asking the first question, using Statement Lock on discrepancies,
// and making procedural decisions. Automatically marks completed after case 1 and is dismissible anytime.

import { byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { storeGet, storeSet } from '../services/storage.js';

const COACH_KEY = 'inad-coach-v10-done';

export function isCoachActive() {
  if (storeGet(COACH_KEY) === '1') return false;
  if (state.guidance === 'expert') return false;
  return true;
}

export function dismissCoach() {
  storeSet(COACH_KEY, '1');
  if (typeof document !== 'undefined') {
    const el = byId('coachBanner');
    if (el) el.hidden = true;
  }
}

export function currentCoachStep(c = current()) {
  if (!isCoachActive()) return null;
  if (state.caseIndex > 0 || state.ended) {
    if (state.ended && state.caseIndex === 0) storeSet(COACH_KEY, '1');
    return null;
  }

  // Step 1: No questions asked yet
  const officerAsked = (state.logs || []).filter((l) => l.type === 'officer').length;
  if (officerAsked === 0) {
    return {
      step: 1,
      target: 'first_question',
      text: '기본 질문: 제안 질문이나 질문란을 통해 입국 목적과 체류 일정을 먼저 확인하십시오.'
    };
  }

  // Step 2: Passenger answered, but no clues discovered yet
  if (state.discoveredClues.size === 0) {
    const hasAlienReply = (state.logs || []).some((l) => l.type === 'alien' && l.text);
    if (hasAlienReply) {
      return {
        step: 2,
        target: 'statement_lock',
        text: '진술 대조: 피심사인 답변 옆 [대조] 버튼을 누른 뒤, 전산망 조회나 서류를 선택해 모순을 밝혀내십시오.'
      };
    }
  }

  // Step 3: Clue discovered, guide to verdict / decision
  if (state.discoveredClues.size > 0 && !state.ended) {
    return {
      step: 3,
      target: 'decision',
      text: '단서 확보: 불일치 또는 결격 사유가 확인되었습니다. 심사대 우측 하단 결정 패널에서 적법한 처분을 검토하십시오.'
    };
  }

  return null;
}

export function renderCoachBanner() {
  const container = byId('coachBanner');
  if (!container) return;

  const hint = currentCoachStep();
  if (!hint) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = `coach-banner coach-step-${hint.step}`;
  container.innerHTML = `
    <span class="coach-icon" aria-hidden="true">💡</span>
    <span class="coach-text">${esc(hint.text)}</span>
    <button type="button" class="coach-dismiss-btn" id="coachDismissBtn" title="안내 닫기" aria-label="수습 심사관 안내 닫기">✕</button>
  `;

  byId('coachDismissBtn').onclick = dismissCoach;
}

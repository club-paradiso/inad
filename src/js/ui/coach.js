// First-Duty Coach (수습 심사관 현장 코치):
// Non-intrusive in-context coaching for new players on their first case.
// Provides gentle guidance on asking the first question, using Statement Lock on discrepancies,
// and making procedural decisions. Automatically marks completed after case 1 and is dismissible anytime.

import { byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { inspectionStep } from '../engines/inspection-workflow.js';
import { getLocale } from '../services/i18n.js';
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

  const en = getLocale() === 'en';
  const step = inspectionStep(state);
  if (step === 'question') {
    const attempted = (state.logs || []).some((l) => l.type === 'officer');
    return { step: 1, target: 'first_question', text: attempted
      ? (en ? 'No answer is on record yet. Connect an interpreter if needed, then ask a suggested question.' : '아직 기록된 답이 없습니다. 질문이 통하지 않으면 통역을 연결하고, 제안 질문으로 방문 목적부터 확인하세요.')
      : (en ? 'Start by asking about the visit. Reading and thinking do not advance the work clock.' : '방문 목적부터 물어보세요. 글을 읽거나 생각하는 동안에는 처리시간이 늘지 않아요.') };
  }
  if (step === 'evidence') return { step: 2, target: 'statement_lock', text: en
    ? 'Compare the answer with a document or relevant record. Agreement is useful too; a contradiction is not a goal.'
    : '답변을 서류나 관련 전산자료와 대조하세요. 일치하는 내용도 확인 결과예요. 반드시 모순을 찾을 필요는 없어요.' };
  if (step === 'assessment') return { step: 3, target: 'decision', text: en
    ? 'Review the facts you have checked. Ask more if needed, or make your own decision. This guidance does not certify readiness.'
    : '확인한 사실을 판단 화면에서 검토하세요. 필요한 질문을 더 하거나 직접 결정할 수 있어요. 안내 단계는 정답·심사 완료를 뜻하지 않아요.' };

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
    <span class="coach-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
    <span class="coach-text">${esc(hint.text)}</span>
    <button type="button" class="coach-dismiss-btn" id="coachDismissBtn" title="안내 닫기" aria-label="수습 심사관 안내 닫기">✕</button>
  `;

  byId('coachDismissBtn').onclick = dismissCoach;
}

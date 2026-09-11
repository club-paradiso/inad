// RIGHT column · final decision controls. Buttons are enabled/disabled by stage only.
import { byId } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { stageText } from '../engines/legal-engine.js';

export function renderActions({ onRefugee, onSjp }) {
  const c = current();
  byId('clearBtn').disabled = state.ended; byId('refuseBtn').disabled = state.ended || state.stage === 'REFUGEE'; byId('secondaryBtn').disabled = state.ended || state.stage !== 'PRIMARY'; byId('sjpBtn').disabled = state.ended;
  const sp = byId('specialBtn'); sp.hidden = true; sp.onclick = null;
  if (c.special === 'refugee' && state.asked.has('refugee') && !state.ended && state.refugeeStep < 4) { sp.hidden = false; byId('specialTitle').textContent = state.refugeeStep === 0 ? '난민신청·회부심사 전용화면' : '난민 회부심사 계속'; byId('specialSub').textContent = '난민법 제6조 · 시행령 제5조'; sp.onclick = onRefugee; }
  else if (c.special === 'forgery' && !state.ended && ['SECONDARY', 'INVESTIGATION', 'ARREST_REVIEW'].includes(state.stage)) { sp.hidden = false; byId('specialTitle').textContent = '출입국사범 조사 전용화면'; byId('specialSub').textContent = '감식 · 조사 · 긴급체포 요건'; sp.onclick = onSjp; }
  byId('actionHint').textContent = state.stage === 'PRIMARY' ? '일반심사 중' : stageText(state.stage) + ' 진행 중';
}

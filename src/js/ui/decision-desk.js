// 결정 desk · final decision controls. Buttons are enabled/disabled by stage only.
// Touch safety: on coarse-pointer devices the first tap arms a legally meaningful control and the second
// tap executes it, so a stray tap on a phone never commits a verdict or moves a procedure forward.
// The same guard covers the decision desk, the special-procedure button, procedure-screen actions and the
// refusal-reason dialog. Mouse/keyboard flows are unchanged (one activation = one action).
import { byId } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { stageText } from '../engines/legal-engine.js';
import { notify } from '../services/bus.js';

export const ARM_MS = 4000;
const ARM_HINT = '다시 눌러 확정';
let armed = null, armTimer = 0;
const coarse = () => !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

export function isArmed(btn) { return !!btn && armed === btn; }
export function disarm() {
  clearTimeout(armTimer); armTimer = 0;
  const b = armed; armed = null;
  if (!b) return;
  b.classList.remove('armed'); b.setAttribute('aria-pressed', 'false');
  b.querySelector(':scope > .arm-hint')?.remove();
}
// Returns true when the activation may proceed; false when it only armed the control.
// A control that was re-rendered in between (new element) has to be armed again — the safe direction.
export function confirmTouch(btn) {
  if (!coarse() || !btn) return true;
  if (armed === btn && btn.isConnected) { disarm(); return true; }
  disarm(); armed = btn; btn.classList.add('armed'); btn.setAttribute('aria-pressed', 'true');
  const hint = document.createElement('span'); hint.className = 'arm-hint'; hint.textContent = ARM_HINT; btn.appendChild(hint);
  const label = (btn.querySelector('strong, b')?.textContent || '').trim();
  notify.a11y(label ? `${label} · ${ARM_HINT}` : ARM_HINT);
  armTimer = setTimeout(disarm, ARM_MS);
  return false;
}
export function guardDecision(fn) { return function (e) { if (!confirmTouch(e?.currentTarget)) return; fn(e); }; }

// The special button is the way back into a procedure screen. Only the refugee path changes legal state
// (PRIMARY → 입국재심, 난민신청 접수) and is touch-armed; the others reopen a screen and are navigation.
export function specialAction(c, st = state) {
  if (c.special === 'refugee' && st.asked.has('refugee') && !st.ended && st.refugeeStep < 4) return { kind: 'refugee', legal: true, title: st.refugeeStep === 0 ? '난민신청·회부심사 전용화면' : '난민 회부심사 계속', sub: '난민법 제6조 · 시행령 제5조' };
  if (c.special === 'forgery' && !st.ended && ['SECONDARY', 'INVESTIGATION', 'ARREST_REVIEW'].includes(st.stage)) return { kind: 'sjp', legal: false, title: '출입국사범 조사 전용화면', sub: '감식 · 조사 · 긴급체포 요건' };
  // a refusal is recorded but its repatriation steps are not: closing the screen must never strand the case
  if (st.stage === 'ENTRY_REFUSED' && st.ended) return { kind: 'repatriation', legal: false, title: '송환 절차 계속', sub: '송환지시 · 출국대기실 · 사건 종결' };
  if (st.stage === 'SECONDARY' && !st.ended) return { kind: 'secondary', legal: false, title: '입국재심 화면 다시 열기', sub: '재심 인계 사유 · 진술 비교 · 추가 확인' };
  return null;
}
export function renderActions({ onRefugee, onSjp, onReopen }) {
  const c = current();
  byId('clearBtn').disabled = state.ended; byId('refuseBtn').disabled = state.ended || state.stage === 'REFUGEE'; byId('secondaryBtn').disabled = state.ended || state.stage !== 'PRIMARY'; byId('sjpBtn').disabled = state.ended;
  const sp = byId('specialBtn'), a = specialAction(c);
  const run = !a ? null : a.kind === 'refugee' ? onRefugee : a.kind === 'sjp' ? onSjp : () => onReopen && onReopen(a.kind);
  if (a) { byId('specialTitle').textContent = a.title; byId('specialSub').textContent = a.sub; }
  sp.hidden = !a; sp.dataset.kind = a?.kind || ''; sp.onclick = !run ? null : a.legal ? guardDecision(run) : run;
  byId('actionHint').textContent = state.stage === 'PRIMARY' ? '일반심사 중' : stageText(state.stage) + ' 진행 중';
  if (armed && (armed.disabled || armed.hidden || !armed.isConnected)) disarm();
}

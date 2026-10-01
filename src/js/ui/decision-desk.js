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

export function renderActions({ onRefugee, onSjp }) {
  const c = current();
  byId('clearBtn').disabled = state.ended; byId('refuseBtn').disabled = state.ended || state.stage === 'REFUGEE'; byId('secondaryBtn').disabled = state.ended || state.stage !== 'PRIMARY'; byId('sjpBtn').disabled = state.ended;
  const sp = byId('specialBtn'); let special = null;
  if (c.special === 'refugee' && state.asked.has('refugee') && !state.ended && state.refugeeStep < 4) { special = onRefugee; byId('specialTitle').textContent = state.refugeeStep === 0 ? '난민신청·회부심사 전용화면' : '난민 회부심사 계속'; byId('specialSub').textContent = '난민법 제6조 · 시행령 제5조'; }
  else if (c.special === 'forgery' && !state.ended && ['SECONDARY', 'INVESTIGATION', 'ARREST_REVIEW'].includes(state.stage)) { special = onSjp; byId('specialTitle').textContent = '출입국사범 조사 전용화면'; byId('specialSub').textContent = '감식 · 조사 · 긴급체포 요건'; }
  // Opening the refugee screen can itself move the legal stage (PRIMARY → SECONDARY, or 난민신청 접수), so it is guarded too.
  sp.hidden = !special; sp.onclick = special ? guardDecision(special) : null;
  byId('actionHint').textContent = state.stage === 'PRIMARY' ? '일반심사 중' : stageText(state.stage) + ' 진행 중';
  if (armed && (armed.disabled || armed.hidden || !armed.isConnected)) disarm();
}

// Single modal dialog (#modal) with focus trap, inert background, Escape handling and focus restoration.
// A dialog that carries the continuation of a flow (decision notice, case result, shift transition, game
// over) is opened with `dismissible: false`: Escape, the backdrop and the 닫기 button cannot drop it,
// because closing it without its action would leave a decided case with every control disabled.
import { $, $$, byId } from './dom.js';
import { disarm } from './decision-desk.js';

let returnFocus = null;
// A required dialog that opens a sub-dialog (e.g. 근무 종료 → 프로필) is parked here with its live nodes,
// so its bound handlers survive and dismissing the sub-dialog brings it back instead of losing the flow.
const parked = [];
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
// Everything behind the dialog: the workstation (incl. procedure screen), the start overlay, the tutorial and call card.
const BACKGROUND = ['app', 'startOverlay', 'tutorialLayer', 'callout'];

export function isModalOpen() { return !!byId('modal')?.classList.contains('on'); }
export function isModalDismissible() { return byId('modal')?.dataset.dismissible !== 'false'; }
function setBackgroundInert(on) { BACKGROUND.forEach((id) => { const el = byId(id); if (el) el.inert = on; }); }
function initialFocus(m) {
  const target = m.querySelector('[data-autofocus]') || (isModalDismissible() ? byId('modalClose') : null) || $$(FOCUSABLE, byId('modalBody')).find((el) => el.offsetParent !== null) || byId('modalClose');
  target?.focus();
}
export function showModal(title, html, { size = '', dismissible = true } = {}) {
  const m = byId('modal'); if (!m) return; disarm();
  if (!m.classList.contains('on')) returnFocus = document.activeElement;
  else if (!isModalDismissible()) parked.push({ title: byId('modalTitle').textContent, nodes: [...byId('modalBody').childNodes], size: m.querySelector('.modal').dataset.size || '' });
  byId('modalTitle').textContent = title; byId('modalBody').innerHTML = html; byId('modalBody').scrollTop = 0;
  m.querySelector('.modal').dataset.size = size;
  m.dataset.dismissible = String(dismissible); byId('modalClose').hidden = !dismissible;
  m.classList.add('on'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('has-modal'); setBackgroundInert(true); m.dataset.openedAt = String(performance.now()); m.dataset.clicks = '0';
  setTimeout(() => { if (isModalOpen()) initialFocus(m); }, 0);
}
// Programmatic close (a dialog's own action buttons). User dismissal goes through requestCloseModal().
export function closeModal() {
  const m = byId('modal'); if (!m || !m.classList.contains('on')) return; disarm(); parked.length = 0;
  m.classList.remove('on'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('has-modal'); setBackgroundInert(false);
  m.dataset.dismissible = 'true'; byId('modalClose').hidden = false;
  let rf = returnFocus; returnFocus = null;
  // A trigger inside a menu that has since closed cannot take focus; return it to the menu button instead.
  const menu = rf?.closest?.('[role="menu"]'); if (menu?.id) rf = document.querySelector(`[aria-controls="${menu.id}"]`) || rf;
  if (rf && typeof rf.focus === 'function' && document.contains(rf)) setTimeout(() => rf.focus(), 0);
}
// Escape / backdrop / 닫기. A required dialog stays open and moves focus back to its action instead.
export function requestCloseModal() {
  if (!isModalOpen()) return false;
  if (!isModalDismissible()) { initialFocus(byId('modal')); return false; }
  const prev = parked.pop();
  if (prev) {
    const m = byId('modal'); disarm();
    byId('modalTitle').textContent = prev.title; byId('modalBody').replaceChildren(...prev.nodes); byId('modalBody').scrollTop = 0;
    m.querySelector('.modal').dataset.size = prev.size; m.dataset.dismissible = 'false'; byId('modalClose').hidden = true;
    initialFocus(m); return false;
  }
  closeModal(); return true;
}
export function bindModalChrome() {
  // The second click of a double-click that opened this dialog must not land on the dialog's own button
  // (e.g. confirm a decision notice unseen). Only multi-click events (detail > 1) right after opening are dropped.
  // Only the very first click after opening can be that continuation; later quick taps are deliberate.
  byId('modal').addEventListener('click', (e) => {
    const m = byId('modal'), n = Number(m.dataset.clicks || 0); m.dataset.clicks = String(n + 1);
    if (n === 0 && e.detail > 1 && performance.now() - Number(m.dataset.openedAt || 0) < 600) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  byId('modalClose').onclick = requestCloseModal;
  byId('modal').onclick = (e) => { if (e.target === byId('modal')) requestCloseModal(); };
  // focus trap
  byId('modal').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, byId('modal')).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
// Convenience: modal with a primary action button; returns the button element.
export function bind(id, fn) { const el = byId(id); if (el) el.onclick = fn; return el; }
export { $ };

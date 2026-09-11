// Single modal dialog (#modal) with focus trap, Escape handling and focus restoration.
import { $, $$, byId } from './dom.js';

let returnFocus = null;
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function isModalOpen() { return byId('modal')?.classList.contains('on'); }
export function showModal(title, html, { size = '' } = {}) {
  const m = byId('modal'); if (!m) return;
  if (!m.classList.contains('on')) returnFocus = document.activeElement;
  byId('modalTitle').textContent = title; byId('modalBody').innerHTML = html;
  m.querySelector('.modal').dataset.size = size;
  m.classList.add('on'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('has-modal');
  setTimeout(() => byId('modalClose')?.focus(), 0);
}
export function closeModal() {
  const m = byId('modal'); if (!m || !m.classList.contains('on')) return;
  m.classList.remove('on'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('has-modal');
  const rf = returnFocus; returnFocus = null;
  if (rf && typeof rf.focus === 'function' && document.contains(rf)) setTimeout(() => rf.focus(), 0);
}
export function bindModalChrome() {
  byId('modalClose').onclick = closeModal;
  byId('modal').onclick = (e) => { if (e.target === byId('modal')) closeModal(); };
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

// Viewport task navigation. One DOM for every form factor: the workspace zones (승객 · 인터뷰 · 자료 · 판단)
// are always rendered; `body[data-task]` only decides which zone tablet/phone layouts show (CSS owns the
// breakpoints). Desktop ignores the attribute. This is presentation state, so it lives on the DOM, not in state.js.
import { $$, byId } from './dom.js';

export const TASKS = ['passenger', 'interview', 'evidence', 'assessment'];
const LABEL = { passenger: '승객', interview: '인터뷰', evidence: '자료', assessment: '판단' };

export function currentTask() { return document.body.dataset.task || 'passenger'; }
export function isStacked() { return window.matchMedia('(max-width: 1023px)').matches; }
export function isPhone() { return window.matchMedia('(max-width: 767px)').matches; }

export function showTask(name, { focus = false } = {}) {
  if (!TASKS.includes(name)) return;
  document.body.dataset.task = name;
  $$('#taskNav button').forEach((b) => { b.setAttribute('aria-current', b.dataset.task === name ? 'true' : 'false'); });
  const zone = document.querySelector(`.zone[data-zone="${name}"]`);
  if (zone && isStacked()) { zone.scrollTop = 0; if (focus) zone.querySelector('button:not([disabled]), [tabindex]')?.focus?.(); }
}

// Reveal the zone that contains an element (used by keyboard shortcuts and document selection on narrow layouts).
export function revealZone(el) {
  const zone = el?.closest?.('.zone'); if (!zone) return;
  const name = zone.dataset.zone; if (name && currentTask() !== name && isStacked()) showTask(name);
}

// Phones have no room for the duty KPIs in the header: the same nodes move into the operations sheet.
function placeWorkload() {
  const kpis = document.querySelector('.workload'), ops = byId('eventBar'), top = document.querySelector('.topbar');
  if (!kpis || !ops || !top) return;
  if (isPhone()) { if (kpis.parentElement !== ops) ops.insertBefore(kpis, ops.firstChild); }
  else if (kpis.parentElement !== top) top.insertBefore(kpis, top.querySelector('.top-actions'));
}

export function bindTaskNav({ onChange } = {}) {
  placeWorkload(); window.matchMedia('(max-width: 767px)').addEventListener('change', placeWorkload);
  $$('#taskNav button').forEach((b) => { b.onclick = () => { showTask(b.dataset.task); onChange && onChange(b.dataset.task); }; });
  const toggle = byId('opsToggle'), app = byId('app');
  if (toggle && app) {
    const set = (open) => { app.classList.toggle('ops-open', open); toggle.setAttribute('aria-expanded', String(open)); };
    toggle.onclick = (e) => { e.stopPropagation(); set(!app.classList.contains('ops-open')); };
    document.addEventListener('click', (e) => { if (app.classList.contains('ops-open') && !e.target.closest('#eventBar') && e.target !== toggle) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && app.classList.contains('ops-open')) set(false); });
  }
  showTask(currentTask());
}

export function taskLabel(name) { return LABEL[name] || name; }

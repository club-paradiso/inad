// Viewport task navigation. One DOM for every form factor: the workspace zones (승객 · 인터뷰 · 자료 · 판단)
// are always rendered; `body[data-task]` only decides which zone tablet/phone layouts show (CSS owns the
// breakpoints). Desktop ignores the attribute. This is presentation state, so it lives on the DOM, not in state.js.
import { $$, byId } from './dom.js';

export const TASKS = ['passenger', 'interview', 'evidence', 'assessment'];
// Keep in sync with the phone/stacked media queries in src/styles/*.css. Short landscape phones (≤500px tall)
// use the phone layout: the tablet layout's chrome would leave them no room to work.
export const PHONE_QUERY = '(max-width: 767px), (max-height: 500px) and (max-width: 1023px)';
export const STACKED_QUERY = '(max-width: 1023px)';

export function currentTask() { return document.body.dataset.task || 'passenger'; }
export function isStacked() { return window.matchMedia(STACKED_QUERY).matches; }
export function isPhone() { return window.matchMedia(PHONE_QUERY).matches; }

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

// Phones have no room for the duty KPIs or every header button. The same nodes (same ids and handlers) move:
// KPIs into the operations sheet, 도움말 · 오늘의 미션 · 근무기록 · UI 언어 into the 메뉴. Nothing is hidden
// without a second way to reach it.
const MENU_ON_PHONE = ['helpBtn', 'dailyBtn', 'recordsBtn', 'uiLanguageBtn'];
export function placeForViewport() {
  const kpis = document.querySelector('.workload'), ops = byId('eventBar'), top = document.querySelector('.topbar');
  const actions = document.querySelector('.top-actions'), menu = byId('moreMenu'), audio = byId('audioBtn'), more = actions?.querySelector('.more-wrap');
  const phone = isPhone();
  if (kpis && ops && top) {
    if (phone) { if (kpis.parentElement !== ops) ops.insertBefore(kpis, ops.firstChild); }
    else if (kpis.parentElement !== top) top.insertBefore(kpis, actions);
  }
  if (!actions || !menu) return;
  for (const id of [...MENU_ON_PHONE].reverse()) {
    const b = byId(id); if (!b) continue;
    if (phone) { if (b.parentElement !== menu) { menu.insertBefore(b, menu.firstChild); b.setAttribute('role', 'menuitem'); } }
    else if (b.parentElement !== actions) { actions.insertBefore(b, id === 'uiLanguageBtn' ? more : audio); b.removeAttribute('role'); }
  }
}

export function bindTaskNav({ onChange } = {}) {
  placeForViewport();
  window.matchMedia(PHONE_QUERY).addEventListener('change', placeForViewport);
  // the UI-language button is created later by the optional i18n module
  document.addEventListener('inad:localechange', placeForViewport);
  $$('#taskNav button').forEach((b) => { b.onclick = () => { showTask(b.dataset.task); onChange && onChange(b.dataset.task); }; });
  const toggle = byId('opsToggle'), app = byId('app');
  if (toggle && app) {
    const set = (open) => { app.classList.toggle('ops-open', open); toggle.setAttribute('aria-expanded', String(open)); };
    toggle.onclick = (e) => { e.stopPropagation(); set(!app.classList.contains('ops-open')); };
    document.addEventListener('click', (e) => { if (app.classList.contains('ops-open') && !e.target.closest('#eventBar') && e.target !== toggle) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && app.classList.contains('ops-open')) { e.preventDefault(); set(false); toggle.focus(); } });
    // leaving the phone layout with the sheet open must not leave a stale fixed overlay behind
    window.matchMedia(PHONE_QUERY).addEventListener('change', (m) => { if (!m.matches) set(false); });
  }
  showTask(currentTask());
}


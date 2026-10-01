// Transient notices: toast, PA banner (audio caption), field-event toast, SR-only live region.
import { byId } from './dom.js';
import { state } from '../state.js';
import { bus } from '../services/bus.js';

export function toast(t) { const e = byId('toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2400); }
// PA captions are queued: two announcements in the same tick (근무 시작 → 승객 호출) used to overwrite each
// other, so the first was never shown or announced. A short queue keeps order; older extras are dropped.
const paQueue = [];
let paBusy = false;
export function showAnnouncement(title, text, tag = 'PA', duration = 2100) {
  if (!byId('paBanner')) return;
  paQueue.push({ title, text, tag, duration }); if (paQueue.length > 3) paQueue.splice(0, paQueue.length - 3);
  if (!paBusy) nextAnnouncement();
}
function nextAnnouncement() {
  const box = byId('paBanner'), item = paQueue.shift();
  if (!item) { paBusy = false; box.classList.remove('on'); return; }
  paBusy = true;
  byId('paTitle').textContent = item.title; byId('paText').textContent = item.text; byId('paTag').textContent = item.tag + ' · SIM'; box.classList.add('on'); state.announcements = (state.announcements || 0) + 1;
  // a queued caption gets at least 1.2 s so it can be read, then yields to the next one
  clearTimeout(nextAnnouncement.t); nextAnnouncement.t = setTimeout(nextAnnouncement, paQueue.length ? Math.min(item.duration, 1200) : item.duration);
}
export function announceA11y(text) { const live = byId('a11yLive'); if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = text; }, 20); }
export function showFieldEventToast(e, effectText) { const box = byId('eventToast'); if (!box) return; byId('eventToastTitle').textContent = e.title; byId('eventToastText').textContent = e.desc + ' · ' + effectText; box.classList.add('on'); clearTimeout(showFieldEventToast.t); showFieldEventToast.t = setTimeout(() => box.classList.remove('on'), 3200); }
export function initNotices() {
  bus.on('toast', toast);
  bus.on('announce', ({ title, text, tag, duration }) => showAnnouncement(title, text, tag, duration));
  bus.on('a11y', announceA11y);
  bus.on('pulse', ({ target, cls, dur }) => { const el = document.querySelector(target); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dur); });
}

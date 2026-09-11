// Transient notices: toast, PA banner (audio caption), field-event toast, SR-only live region.
import { byId } from './dom.js';
import { state } from '../state.js';
import { bus } from '../services/bus.js';

export function toast(t) { const e = byId('toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2400); }
export function showAnnouncement(title, text, tag = 'PA', duration = 2100) { const box = byId('paBanner'); if (!box) return; byId('paTitle').textContent = title; byId('paText').textContent = text; byId('paTag').textContent = tag + ' · SIM'; box.classList.add('on'); state.announcements = (state.announcements || 0) + 1; clearTimeout(showAnnouncement.t); showAnnouncement.t = setTimeout(() => box.classList.remove('on'), duration); }
export function announceA11y(text) { const live = byId('a11yLive'); if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = text; }, 20); }
export function showFieldEventToast(e, effectText) { const box = byId('eventToast'); if (!box) return; byId('eventToastTitle').textContent = e.title; byId('eventToastText').textContent = e.desc + ' · ' + effectText; box.classList.add('on'); clearTimeout(showFieldEventToast.t); showFieldEventToast.t = setTimeout(() => box.classList.remove('on'), 3200); }
export function initNotices() {
  bus.on('toast', toast);
  bus.on('announce', ({ title, text, tag, duration }) => showAnnouncement(title, text, tag, duration));
  bus.on('a11y', announceA11y);
  bus.on('pulse', ({ target, cls, dur }) => { const el = document.querySelector(target); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dur); });
}

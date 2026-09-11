// Small DOM helpers shared by UI modules.
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const byId = (id) => document.getElementById(id);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export function setText(id, text) { const el = byId(id); if (el) el.textContent = text; }
export function setHTML(id, html) { const el = byId(id); if (el) el.innerHTML = html; }
export function microPulse(sel, cls, dur = 400) { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dur); }
export function fmtClock(sec) { return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }
export function fmtDate(ts) { try { return new Date(ts).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { return '-'; } }

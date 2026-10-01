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

// Keyboard focus across innerHTML re-renders: renderers rebuild whole lists, which destroys the control the
// user just activated and drops focus to <body>. Capture a stable key before rendering, restore after.
const FOCUS_KEYS = ['id', 'data-qid', 'data-cat', 'data-i', 'data-airport', 'data-proc-act', 'data-proc-q', 'data-proc-lu', 'data-lu', 'data-task', 'data-code'];
export function focusKey(el = document.activeElement) {
  if (!el || el === document.body || el === document.documentElement) return null;
  for (const a of FOCUS_KEYS) { const v = el.getAttribute?.(a); if (v) return [a, v]; }
  return null;
}
export function restoreFocus(key) {
  if (!key) return;
  const active = document.activeElement;
  if (active && active !== document.body && active.isConnected) return; // focus survived the render
  const sel = `[${key[0]}="${String(key[1]).replace(/["\\]/g, '\\$&')}"]`;
  const el = [...document.querySelectorAll(sel)].find((x) => x.offsetParent !== null && !x.disabled);
  el?.focus({ preventScroll: true });
}
export function withFocus(render) { const key = focusKey(); const out = render(); restoreFocus(key); return out; }

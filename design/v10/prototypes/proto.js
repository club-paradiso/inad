// Shared driver for the three v10 composition prototypes (design exploration only — not shipped).
// Real case data (ICN-S2-005), the real living-portrait runtime, a naive word-overlap matcher.
import { CASES } from '../../../src/data/cases.js';
import { PORTRAIT_RIGS } from '../../../src/data/portrait-rigs.js';
import { createLivingPortrait } from '../../../src/js/ui/avatar/living-portrait.js';

const c = CASES.find((x) => x.id === 'ICN-S2-005');
const done = new Set(); const asked = new Set();
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const unlocked = (q) => (q.requires || []).every((r) => done.has(r));
let lp = null;
if ($('#stage')) { lp = createLivingPortrait($('#stage')); lp.setSource('../../../src/assets/portraits/' + c.travelerId + '.webp', PORTRAIT_RIGS[c.travelerId], c.displayNameKo); }
const line = (who, text, cls = '') => { const t = $('#transcript'); if (!t) return; t.insertAdjacentHTML('beforeend', `<div class="ln ${who} ${cls}"><span class="who">${who === 'officer' ? '심사관' : who === 'alien' ? c.displayNameKo : '기록'}</span><p>${esc(text)}</p></div>`); t.scrollTop = t.scrollHeight; };
async function answer(q) {
  line('officer', q.q); lp?.setState('thinking');
  await new Promise((r) => setTimeout(r, q.contradiction ? 1100 : 450));
  lp?.setState(q.contradiction ? 'hesitant' : 'speaking'); if ($('#caption')) $('#caption').textContent = q.a;
  line('alien', q.a, q.contradiction ? 'tension' : ''); asked.add(q.id); done.add('QUESTION_' + q.id);
  await lp?.speak(q.a); lp?.setState('idle'); render();
}
function suggestions() { return c.questions.filter((q) => unlocked(q) && !asked.has(q.id)).sort((a, b) => (b.requires ? 1 : 0) - (a.requires ? 1 : 0)).slice(0, 4); }
function render() {
  const s = $('#suggest'); if (s) s.innerHTML = suggestions().map((q) => `<button type="button" data-q="${q.id}">${esc(q.q)}</button>`).join('');
  s?.querySelectorAll('button').forEach((b) => { b.onclick = () => answer(c.questions.find((q) => q.id === b.dataset.q)); });
  const d = $('#docs'); if (d && !d.dataset.done) { d.dataset.done = '1'; d.innerHTML = c.docs.map((x) => `<section class="doc"><h4>${esc(x.t)}</h4><dl>${x.fields.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`).join(''); }
  const l = $('#lookups'); if (l && !l.dataset.done) { l.dataset.done = '1'; l.innerHTML = Object.entries(c.lookups).map(([k, [tone, text]]) => `<button type="button" data-lu="${k}">${{ history: '출입국기록', visa: '사증', pnr: 'PNR', contact: '국내관계', public: '공개정보' }[k]}</button>`).join(''); l.querySelectorAll('button').forEach((b) => { b.onclick = () => { done.add('LOOKUP_' + b.dataset.lu); const [tone, text] = c.lookups[b.dataset.lu]; line('system', `[${b.textContent}] ${tone} · ${text}`); b.classList.add('on'); render(); }; }); }
}
$('#composer')?.addEventListener('submit', (e) => {
  e.preventDefault(); const v = $('#ask').value.trim(); if (!v) return; $('#ask').value = '';
  const words = v.replace(/[?.!,]/g, '').split(/\s+/);
  const best = c.questions.map((q) => ({ q, s: words.filter((w) => w.length > 1 && q.q.includes(w.slice(0, 2))).length })).sort((a, b) => b.s - a.s)[0];
  if (best && best.s > 0 && unlocked(best.q)) answer(best.q); else { line('officer', v); lp?.setState('confused'); line('alien', '죄송합니다. 질문을 다시 말씀해 주시겠습니까?'); setTimeout(() => lp?.setState('idle'), 1400); }
});
$('#ask')?.addEventListener('input', () => lp?.setState($('#ask').value ? 'listening' : 'idle'));
line('alien', c.initial); if ($('#caption')) $('#caption').textContent = c.initial;
render();
window.PROTO = { answer: (id) => answer(c.questions.find((q) => q.id === id)), lookup: (k) => document.querySelector(`[data-lu="${k}"]`)?.click() };
document.body.dataset.ready = '1';

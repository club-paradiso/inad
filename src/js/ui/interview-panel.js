// LEFT column · statement log and question categories.
import { $, $$, byId, esc, withFocus, markOverflow } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { questionUnlocked } from '../engines/clue-engine.js';

// #log is a live region: only statements that were not rendered yet are appended, so a screen reader hears
// each new line once instead of the whole transcript on every render. A new case (new array) starts over.
const shownLog = { list: null, n: 0 };
const msgHTML = (x, t) => {
  const who = { officer: '심사관', alien: '피심사인', interpreter: '통역 지원', alert: '경고', system: '시스템' };
  return `<div class="msg ${x.type} ${x.type === 'alien' ? (x.behaviorClass || '') : ''}">${x.type === 'alien' ? `<img class="msgavatar" src="${t?.portrait || ''}" alt="">` : `<span class="msgavatar" aria-hidden="true">${x.type === 'officer' ? '심' : x.type === 'interpreter' ? '통' : 'SYS'}</span>`}<b>${who[x.type] || '시스템'}${x.type === 'alien' && x.behaviorLabel ? `<span class="behavior-event">${esc(x.behaviorLabel)}</span>` : ''}${x.type === 'interpreter' && x.languageLabel ? `<span class="language-event">${esc(x.languageLabel)}</span>` : ''}</b><div class="msgtext">${esc(x.text)}</div></div>`;
};
export function renderLog() {
  const e = byId('log'), c = current(), t = c ? getTraveler(c.travelerId) : null, logs = state.logs;
  const keep = e.scrollTop, atBottom = e.scrollHeight - e.scrollTop - e.clientHeight < 24;
  const same = shownLog.list === logs && shownLog.n <= logs.length && e.childElementCount === shownLog.n;
  if (same) { if (logs.length > shownLog.n) e.insertAdjacentHTML('beforeend', logs.slice(shownLog.n).map((x) => msgHTML(x, t)).join('')); }
  else e.innerHTML = logs.map((x) => msgHTML(x, t)).join('');
  // Follow new statements, but do not yank the reader back to the bottom when nothing was added.
  const grew = !same || logs.length !== shownLog.n; shownLog.list = logs; shownLog.n = logs.length;
  byId('logCount').textContent = `${logs.length}건`; if (grew || atBottom) e.scrollTop = e.scrollHeight; else e.scrollTop = keep;
}
export function renderQuestions(onAsk) {
  const c = current(); const cats = [...new Set(c.questions.map((q) => q.cat))]; if (!cats.includes(state.qcat)) state.qcat = cats[0];
  // APG tabs: one Tab stop (the selected tab), arrows/Home/End move and select, #questions is the tab panel.
  byId('qtabs').innerHTML = cats.map((x, i) => { const list = c.questions.filter((q) => q.cat === x), done = list.filter((q) => state.asked.has(q.id)).length, open = list.filter((q) => questionUnlocked(q) && !state.asked.has(q.id)).length, on = x === state.qcat; return `<button type="button" class="qtab ${on ? 'on' : ''}" role="tab" id="qtab-${i}" aria-controls="questions" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-cat="${esc(x)}" data-hotkey="${Math.min(6, i + 1)}">${esc(x)} <span class="qtab-count">${done}/${list.length}${open ? ' · ' + open + ' 가능' : ''}</span></button>`; }).join('');
  $$('#qtabs .qtab').forEach((b) => { b.onclick = () => { state.qcat = b.dataset.cat; withFocus(() => renderQuestions(onAsk)); }; });
  if (!renderQuestions.keys) { renderQuestions.keys = true; byId('qtabs').addEventListener('keydown', (e) => { const tabs = $$('#qtabs .qtab'), i = tabs.indexOf(document.activeElement), next = tabKey(e.key, i, tabs.length); if (i < 0 || next === null) return; e.preventDefault(); chooseQuestionCategory(next); }); }
  markOverflow(byId('qtabs'));
  const qs = c.questions.filter((q) => q.cat === state.qcat); const box = byId('questions'); box.innerHTML = '';
  box.setAttribute('role', 'tabpanel'); box.setAttribute('aria-labelledby', `qtab-${Math.max(0, cats.indexOf(state.qcat))}`);
  qs.forEach((q) => {
    const unlocked = questionUnlocked(q); const b = document.createElement('button'); const wasAsked = state.asked.has(q.id);
    b.type = 'button'; b.dataset.qid = q.id; b.className = 'qbtn ' + ((q.requires || []).length ? 'branch ' : '') + (unlocked ? '' : 'locked') + (wasAsked ? ' asked' : ''); b.disabled = state.ended || !unlocked;
    b.innerHTML = !unlocked ? `선행 확인 후 추가 질문 가능<em>${esc(q.cat)} · 관련 단서를 먼저 확인하십시오</em>` : wasAsked ? `${esc(q.q)}<em>${esc(q.cat)} · 재질문 · 반복 질문은 효율에 반영</em>` : `${esc(q.q)}<em>${esc(q.cat)}${q.requires ? ' · 추가 질문' : ''}</em>`;
    b.onclick = () => onAsk(q, wasAsked); box.appendChild(b);
  });
}
// The click re-renders the tab list, so the tab is looked up again before focusing it.
export function chooseQuestionCategory(index, announce) { const tabs = $$('#qtabs .qtab'); if (index < 0 || index >= tabs.length) return; const cat = tabs[index].dataset.cat; tabs[index].click(); const tab = $$('#qtabs .qtab').find((x) => x.dataset.cat === cat); tab?.focus(); announce?.(`질문 카테고리 ${(tab || tabs[index]).textContent.trim()}`); }
// Arrow/Home/End target for a horizontal tab list (wraps around); null for any other key.
export function tabKey(key, i, n) { return key === 'ArrowRight' ? (i + 1) % n : key === 'ArrowLeft' ? (i - 1 + n) % n : key === 'Home' ? 0 : key === 'End' ? n - 1 : null; }

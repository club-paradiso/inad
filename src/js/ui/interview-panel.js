// LEFT column · statement log and question categories.
import { $, $$, byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { questionUnlocked } from '../engines/clue-engine.js';

export function renderLog() {
  const e = byId('log'), c = current(), t = c ? getTraveler(c.travelerId) : null;
  const who = { officer: '심사관', alien: '피심사인', interpreter: '통역 지원', alert: '경고', system: '시스템' };
  e.innerHTML = state.logs.map((x) => `<div class="msg ${x.type} ${x.type === 'alien' ? (x.behaviorClass || '') : ''}">${x.type === 'alien' ? `<img class="msgavatar" src="${t.portrait}" alt="">` : `<span class="msgavatar" aria-hidden="true">${x.type === 'officer' ? '심' : x.type === 'interpreter' ? '통' : 'SYS'}</span>`}<b>${who[x.type] || '시스템'}${x.type === 'alien' && x.behaviorLabel ? `<span class="behavior-event">${esc(x.behaviorLabel)}</span>` : ''}${x.type === 'interpreter' && x.languageLabel ? `<span class="language-event">${esc(x.languageLabel)}</span>` : ''}</b><div class="msgtext">${esc(x.text)}</div></div>`).join('');
  byId('logCount').textContent = `${state.logs.length}건`; e.scrollTop = e.scrollHeight;
}
export function renderQuestions(onAsk) {
  const c = current(); const cats = [...new Set(c.questions.map((q) => q.cat))]; if (!cats.includes(state.qcat)) state.qcat = cats[0];
  byId('qtabs').innerHTML = cats.map((x) => { const list = c.questions.filter((q) => q.cat === x), done = list.filter((q) => state.asked.has(q.id)).length, open = list.filter((q) => questionUnlocked(q) && !state.asked.has(q.id)).length; return `<button class="qtab ${x === state.qcat ? 'on' : ''}" role="tab" aria-selected="${x === state.qcat}" data-cat="${esc(x)}" data-hotkey="${Math.min(6, cats.indexOf(x) + 1)}">${esc(x)} <span class="qtab-count">${done}/${list.length}${open ? ' · ' + open + ' 가능' : ''}</span></button>`; }).join('');
  $$('#qtabs .qtab').forEach((b) => { b.onclick = () => { state.qcat = b.dataset.cat; renderQuestions(onAsk); }; });
  const qs = c.questions.filter((q) => q.cat === state.qcat); const box = byId('questions'); box.innerHTML = '';
  qs.forEach((q) => {
    const unlocked = questionUnlocked(q); const b = document.createElement('button'); const wasAsked = state.asked.has(q.id);
    b.type = 'button'; b.className = 'qbtn ' + ((q.requires || []).length ? 'branch ' : '') + (unlocked ? '' : 'locked') + (wasAsked ? ' asked' : ''); b.disabled = state.ended || !unlocked;
    b.innerHTML = !unlocked ? `선행 확인 후 추가 질문 가능<em>${esc(q.cat)} · 관련 단서를 먼저 확인하십시오</em>` : wasAsked ? `${esc(q.q)}<em>${esc(q.cat)} · 재질문 · 반복 질문은 효율에 반영</em>` : `${esc(q.q)}<em>${esc(q.cat)}${q.requires ? ' · 추가 질문' : ''}</em>`;
    b.onclick = () => onAsk(q, wasAsked); box.appendChild(b);
  });
}
export function chooseQuestionCategory(index, announce) { const tabs = $$('#qtabs .qtab'); if (index < 0 || index >= tabs.length) return; tabs[index].click(); tabs[index].focus(); announce(`질문 카테고리 ${tabs[index].textContent.trim()}`); }

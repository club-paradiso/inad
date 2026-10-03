// Interview column · the official interview record, the suggestion tab and the full question catalogue.
// v10: lines carry how they were asked (the examiner's own words → "기록 질문" = the canonical question that was
// recorded) and how they were delivered (lead-in, off-record). A passenger reply can be held back for the
// reaction time the stage is acting out; the record itself is already complete in state.logs.
import { $, $$, byId, esc, withFocus, markOverflow } from './dom.js';
import { state, assistLevel } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { questionUnlocked } from '../engines/clue-engine.js';
import { suggestQuestions } from '../engines/suggestion-engine.js';
import { liveRecord } from '../engines/interview-engine.js';
import { currentLockedStatement } from './statement-lock.js';

const SUGGEST = '__suggest';
const WHO = { officer: '심사관', alien: '피심사인', interpreter: '통역 지원', alert: '경고', system: '시스템' };
// #log is a live region: only statements that were not rendered yet are appended, so a screen reader hears
// each new line once instead of the whole transcript on every render. A new case (new array) starts over.
const shownLog = { list: null, n: 0, pending: new Set() };
const hold = { from: Infinity, until: 0 };
const isHeld = (i, x) => x.type === 'alien' && i >= hold.from && performance.now() < hold.until;

// Hold passenger replies from `fromIndex` on for `ms` (reaction time); releaseReplies() shows them.
export function holdReplies(fromIndex, ms) { hold.from = fromIndex; hold.until = performance.now() + Math.max(0, ms); }
export function releaseReplies() { hold.until = 0; hold.from = Infinity; renderLog(); }

const msgHTML = (x, t, i, pending = false) => {
  const off = x.offRecord ? ' off-record' : '';
  const avatar = x.type === 'alien' ? `<img class="msgavatar" src="${t?.portrait || ''}" alt="">` : `<span class="msgavatar" aria-hidden="true">${x.type === 'officer' ? '심' : x.type === 'interpreter' ? '통' : 'SYS'}</span>`;
  const label = `<b>${WHO[x.type] || '시스템'}${x.type === 'alien' && x.behaviorLabel ? `<span class="behavior-event">${esc(x.behaviorLabel)}</span>` : ''}${x.type === 'interpreter' && x.languageLabel ? `<span class="language-event">${esc(x.languageLabel)}</span>` : ''}</b>`;
  const isAlien = x.type === 'alien' && !pending;
  const locked = currentLockedStatement()?.logIndex === i;
  const lockBtn = isAlien ? `<button type="button" class="msg-lock-btn ${locked ? 'active' : ''}" data-lock-i="${i}" title="진술 대조" aria-label="진술 대조: 증거자료와 대조">대조</button>` : '';
  let body;
  if (pending) body = '답변을 준비하고 있습니다';
  else if (x.type === 'officer' && x.utterance && x.utterance !== x.text && !x.offRecord) body = `${esc(x.utterance)}<span class="heard">기록 질문 · ${esc(x.text)}</span>`;
  else body = `${x.lead ? `<span class="lead">${esc(x.lead)}</span> ` : ''}${esc(x.type === 'officer' && x.offRecord && x.utterance ? x.utterance : x.text)}`;
  return `<div class="msg ${x.type} ${x.type === 'alien' ? (x.behaviorClass || '') : ''}${off}${pending ? ' pending' : ''}${locked ? ' lock-selected' : ''}" data-i="${i}"${pending ? ' aria-hidden="true"' : ''}>${avatar}${label}${lockBtn}<div class="msgtext">${body}</div></div>`;
};
export function renderLog() {
  const e = byId('log'), c = current(), t = c ? getTraveler(c.travelerId) : null, logs = state.logs;
  const keep = e.scrollTop, atBottom = e.scrollHeight - e.scrollTop - e.clientHeight < 24;
  const same = shownLog.list === logs && shownLog.n <= logs.length && e.childElementCount === shownLog.n;
  if (same) {
    // replies that were held back are swapped in place (a text change the live region announces once)
    for (const i of [...shownLog.pending]) if (!isHeld(i, logs[i])) { const el = e.children[i]; if (el) el.outerHTML = msgHTML(logs[i], t, i); shownLog.pending.delete(i); }
    if (logs.length > shownLog.n) e.insertAdjacentHTML('beforeend', logs.slice(shownLog.n).map((x, k) => { const i = shownLog.n + k, p = isHeld(i, x); if (p) shownLog.pending.add(i); return msgHTML(x, t, i, p); }).join(''));
  } else {
    shownLog.pending = new Set();
    e.innerHTML = logs.map((x, i) => { const p = isHeld(i, x); if (p) shownLog.pending.add(i); return msgHTML(x, t, i, p); }).join('');
  }
  // Follow new statements, but do not yank the reader back to the bottom when nothing was added.
  const grew = !same || logs.length !== shownLog.n; shownLog.list = logs; shownLog.n = logs.length;
  byId('logCount').textContent = `${logs.length}건`; if (grew || atBottom) e.scrollTop = e.scrollHeight; else e.scrollTop = keep;
}

// ---- questions: 제안 (contextual) + one tab per category ----------------------------------------------
let view = SUGGEST, viewCase = null;
export function currentSuggestions() {
  const c = current(); if (!c) return [];
  return suggestQuestions(c, { performed: state.performed, asked: state.asked, level: assistLevel(), lastKind: liveRecord()?.lastKind || null, interpreterActive: !!state.language?.interpreterActive, languageMiss: liveRecord()?.languageMiss || 0, ended: state.ended });
}
const REASON = { followup: '이어서 확인', open: '' };
export function renderQuestions(onAsk, { onSuggest = onAsk, onAction = () => {} } = {}) {
  const c = current(); const cats = [...new Set(c.questions.map((q) => q.cat))];
  if (viewCase !== c.id) { viewCase = c.id; view = SUGGEST; }
  if (!cats.includes(state.qcat)) state.qcat = cats[0];
  const level = assistLevel(); const sugg = currentSuggestions();
  const tabs = [{ key: SUGGEST, label: '제안', extra: level === 'immersive' ? '꺼짐' : String(sugg.filter((x) => x.q).length) }, ...cats.map((x) => { const list = c.questions.filter((q) => q.cat === x), done = list.filter((q) => state.asked.has(q.id)).length, open = list.filter((q) => questionUnlocked(q) && !state.asked.has(q.id)).length; return { key: x, label: x, extra: `${done}/${list.length}${open ? ' · ' + open + ' 가능' : ''}` }; })];
  // APG tabs: one Tab stop (the selected tab), arrows/Home/End move and select, #questions is the tab panel.
  byId('qtabs').innerHTML = tabs.map((x, i) => { const on = x.key === SUGGEST ? view === SUGGEST : view !== SUGGEST && x.key === state.qcat; const ci = i - 1; return `<button type="button" class="qtab ${x.key === SUGGEST ? 'qtab-suggest ' : ''}${on ? 'on' : ''}" role="tab" id="qtab-${i}" aria-controls="questions" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-cat="${esc(x.key)}"${x.key === SUGGEST ? '' : ` data-hotkey="${Math.min(6, ci + 1)}"`}>${esc(x.label)} <span class="qtab-count">${esc(x.extra)}</span></button>`; }).join('');
  $$('#qtabs .qtab').forEach((b) => { b.onclick = () => { if (b.dataset.cat === SUGGEST) view = SUGGEST; else { view = 'cat'; state.qcat = b.dataset.cat; } withFocus(() => renderQuestions(onAsk, { onSuggest, onAction })); }; });
  if (!renderQuestions.keys) { renderQuestions.keys = true; byId('qtabs').addEventListener('keydown', (e) => { const all = $$('#qtabs .qtab'), i = all.indexOf(document.activeElement), next = tabKey(e.key, i, all.length); if (i < 0 || next === null) return; e.preventDefault(); all[next].click(); $$('#qtabs .qtab')[next]?.focus(); }); }
  markOverflow(byId('qtabs'));
  const box = byId('questions'); box.innerHTML = '';
  const selIndex = view === SUGGEST ? 0 : cats.indexOf(state.qcat) + 1;
  box.setAttribute('role', 'tabpanel'); box.setAttribute('aria-labelledby', `qtab-${Math.max(0, selIndex)}`);
  if (view === SUGGEST) {
    if (level === 'immersive') { box.innerHTML = '<p class="qs-empty">몰입 모드: 질문 제안을 표시하지 않습니다. 직접 질문하거나 카테고리 탭의 전체 질문 목록을 사용하십시오.</p>'; return; }
    if (!sugg.length) { box.innerHTML = `<p class="qs-empty">${state.ended ? '심사가 끝났습니다.' : '지금 제안할 질문이 없습니다. 자료를 확인하거나 직접 질문하십시오.'}</p>`; return; }
    for (const s of sugg) {
      const b = document.createElement('button'); b.type = 'button'; b.disabled = state.ended;
      if (s.action === 'interpreter') { b.className = 'qbtn suggest action'; b.dataset.action = 'interpreter'; b.innerHTML = `${esc(state.language?.primary || '')} 통역 연결<em>의사소통 · 질문이 충분히 전달되지 않았습니다</em>`; b.onclick = () => onAction('interpreter'); }
      else { const q = s.q; b.className = `qbtn suggest ${s.reason}`; b.dataset.qid = q.id; b.innerHTML = `${esc(q.q)}<em>${esc(q.cat)}${REASON[s.reason] ? ' · ' + REASON[s.reason] : ''}</em>`; b.onclick = () => onSuggest(q, false); }
      box.appendChild(b);
    }
    return;
  }
  const qs = c.questions.filter((q) => q.cat === state.qcat);
  qs.forEach((q) => {
    const unlocked = questionUnlocked(q); const b = document.createElement('button'); const wasAsked = state.asked.has(q.id);
    b.type = 'button'; b.dataset.qid = q.id; b.className = 'qbtn ' + ((q.requires || []).length ? 'branch ' : '') + (unlocked ? '' : 'locked') + (wasAsked ? ' asked' : ''); b.disabled = state.ended || !unlocked;
    b.innerHTML = !unlocked ? `선행 확인 후 추가 질문 가능<em>${esc(q.cat)} · 관련 단서를 먼저 확인하십시오</em>` : wasAsked ? `${esc(q.q)}<em>${esc(q.cat)} · 재질문 · 반복 질문은 효율에 반영</em>` : `${esc(q.q)}<em>${esc(q.cat)}${q.requires ? ' · 추가 질문' : ''}</em>`;
    b.onclick = () => onAsk(q, wasAsked); box.appendChild(b);
  });
}
// Number shortcuts pick a *category* (1 = first category); the 제안 tab is reached with the arrows or a click.
export function chooseQuestionCategory(index, announce) { const tabs = $$('#qtabs .qtab:not(.qtab-suggest)'); if (index < 0 || index >= tabs.length) return; const cat = tabs[index].dataset.cat; tabs[index].click(); const tab = $$('#qtabs .qtab').find((x) => x.dataset.cat === cat); tab?.focus(); announce?.(`질문 카테고리 ${(tab || tabs[index]).textContent.trim()}`); }
// Arrow/Home/End target for a horizontal tab list (wraps around); null for any other key.
export function tabKey(key, i, n) { return key === 'ArrowRight' ? (i + 1) % n : key === 'ArrowLeft' ? (i - 1 + n) % n : key === 'Home' ? 0 : key === 'End' ? n - 1 : null; }

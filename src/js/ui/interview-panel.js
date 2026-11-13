// Interview column · the official interview record, the suggestion tab and the full question catalogue.
// v10: lines carry how they were asked (the examiner's own words → "기록 질문" = the canonical question that was
// recorded) and how they were delivered (lead-in, off-record). A passenger reply can be held back for the
// reaction time the stage is acting out; the record itself is already complete in state.logs.
import { $, $$, byId, esc, withFocus, markOverflow } from './dom.js';
import { state, assistLevel } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { suggestQuestions } from '../engines/suggestion-engine.js';
import { communicationReady } from '../engines/language-engine.js';
import { liveRecord } from '../engines/interview-engine.js';
import { currentLockedStatement } from './statement-lock.js';
import { showTask } from './task-nav.js';
import { inspectionStep } from '../engines/inspection-workflow.js';
import { getLocale } from '../services/i18n.js';
import { currentCoachStep } from './coach.js';

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

// Beginner wayfinding is presentation only: it never submits a verdict or reveals hidden facts.
// Only already-unlocked suggested questions are offered, and experienced players keep the full desk.
function renderNextStep(suggestions, onSuggest) {
  const el = byId('liveNextStep');
  const scope = byId('liveInputScope');
  const isLive = state.sessionMode === 'case' || state.sessionMode === 'quick';
  if (scope) scope.hidden = !isLive;
  if (!el) return;
  const guided = state.started && !state.ended && state.guidance === 'guided' && assistLevel() !== 'immersive';
  el.hidden = !guided;
  // One voice of guidance at a time. While the guided step is on screen it already says that other phrasings work,
  // so the scope note stays available to screen readers (it describes #askInput) without taking a visible row.
  if (scope) scope.classList.toggle('sr-only', guided);
  if (!guided) { el.replaceChildren(); return; }

  const t = (ko, en) => getLocale() === 'en' ? en : ko;
  // P1-3: Prefer a question that can be understood at the current language level for the guided next-step CTA
  const communicableNext = suggestions.find((s) => s.q && communicationReady(s.q).ok)?.q;
  const next = communicableNext || suggestions.find((s) => s.q)?.q;
  let step, detail, label, action;
  const phase = inspectionStep(state);
  const hasQuestion = state.asked.size > 0;
  // An unanswered question caused by a language barrier must not be proposed over
  // and over. The existing suggestion engine already exposes the safe next action.
  const needsInterpreter = suggestions.some((entry) => entry.action === 'interpreter');
  if (phase === 'procedure') {
    step = t('진행 중인 절차', 'Current procedure');
    detail = t('인계한 절차에서 추가 확인을 이어가세요.', 'Continue the procedure you opened.');
    label = t('판단 화면으로', 'Open assessment');
    action = () => showTask('assessment', { focus: true });
  } else if (needsInterpreter) {
    step = t('2 · 통역 연결', '2 · Connect interpreter');
    detail = t('질문이 전달되지 않았습니다. 먼저 통역을 연결하고 다시 질문하세요.', 'The traveler did not understand. Connect an interpreter before asking again.');
    label = t('통역 연결', 'Call interpreter');
    action = () => { showTask('interview'); byId('langInterp')?.click(); };
  } else if (!hasQuestion && next) {
    step = t('1 · 첫 질문', '1 · First question'); detail = t('준비된 질문으로 대화를 시작하세요. 다른 표현으로 직접 물어도 됩니다.', 'Start with an available question, or try your own phrasing.');
    label = t('이 질문하기 · ', 'Ask · ') + next.q;
    action = () => {
      if (!communicationReady(next).ok && state.language && !state.language.interpreterActive) byId('langInterp')?.click();
      onSuggest(next, false);
    };
  } else if (!state.looked.size) {
    step = t('2 · 자료 확인', '2 · Review evidence'); detail = t('승객의 답변과 제출서류를 함께 확인하세요. 전산 조회도 자료 화면에서 할 수 있어요.', 'Compare the reply with documents; records are available in Evidence.');
    label = t('자료 화면으로', 'Open evidence');
    action = () => { showTask('evidence', { focus: true }); document.querySelector('#wbTabDocs')?.focus(); };
  } else {
    step = t('3 · 판단 검토', '3 · Review assessment');
    detail = t('확인한 사실과 미확인 내용을 살펴보세요. 질문·서류 확인은 더 할 수 있고, 결정은 직접 내립니다.', 'Review established and unconfirmed facts. You can ask more or check documents before deciding.');
    label = t('판단 화면으로', 'Open assessment');
    action = () => showTask('assessment', { focus: true });
  }

  // The first-duty coach banner already explains this step in a sentence; repeating it here pushed the questions
  // below the fold on compact screens. Keep the step name and the action, drop the duplicate paragraph.
  const coachSays = !!currentCoachStep();
  el.innerHTML = `<div class="live-next-copy"><small>${esc(t('쉬운 진행', 'Guided steps'))}</small><strong>${esc(step)}</strong>${coachSays ? '' : `<p>${esc(detail)}</p>`}</div><button class="live-next-button" type="button" id="liveNextButton">${esc(label)}</button>`;
  byId('liveNextButton').onclick = action;
}

// ---- questions: 제안 (contextual) + one tab per category ----------------------------------------------
let view = SUGGEST, viewCase = null;
export function currentSuggestions() {
  const c = current(); if (!c) return [];
  return suggestQuestions(c, { performed: state.performed, asked: state.asked, level: assistLevel(), lastKind: liveRecord()?.lastKind || null, interpreterActive: !!state.language?.interpreterActive, languageMiss: liveRecord()?.languageMiss || 0, ended: state.ended });
}
const REASON = { followup: '이어서 확인', open: '', later: '지금 물어볼 수 있음' };
// Keep the interpreter action outside the question button: nested controls can accidentally
// intercept ordinary clicks and bypass the language barrier in desktop and mobile E2E flows.
function appendInterviewQuestion(box, questionButton, q, needsInterp, ask) {
  if (!needsInterp) { box.appendChild(questionButton); return; }
  const group = document.createElement('div');
  group.className = 'qbtn-with-interp';
  group.appendChild(questionButton);
  const interpret = document.createElement('button');
  interpret.type = 'button';
  interpret.className = 'qbtn-interp-link';
  interpret.dataset.interpAsk = q.id;
  interpret.textContent = '통역 연결 후 질문';
  interpret.setAttribute('aria-label', `통역 연결 후 질문: ${q.q}`);
  interpret.disabled = state.ended;
  interpret.onclick = () => {
    if (!state.language?.interpreterActive) byId('langInterp')?.click();
    ask();
  };
  group.appendChild(interpret);
  box.appendChild(group);
}

export function renderQuestions(onAsk, { onSuggest = onAsk, onAction = () => {} } = {}) {
  const c = current(); const cats = [...new Set(c.questions.map((q) => q.cat))];
  if (viewCase !== c.id) { viewCase = c.id; view = SUGGEST; }
  if (!cats.includes(state.qcat)) state.qcat = cats[0];
  const level = assistLevel(); const sugg = currentSuggestions();
  renderNextStep(sugg, onSuggest);
  const tabs = [{ key: SUGGEST, label: '제안', extra: level === 'immersive' ? '꺼짐' : String(sugg.filter((x) => x.q).length) }, ...cats.map((x) => { const done = c.questions.filter((q) => q.cat === x && state.asked.has(q.id)).length;
    // Asked count only. A "0/3 · 3 남음" total counted follow-ups that are still gated, so the tab told the
    // examiner how many hidden questions a category holds and when there was nothing left to find.
    return { key: x, label: x, extra: done ? `${done}건` : '' }; })];
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
      else {
        const q = s.q; const comm = communicationReady(q);
        const needsInterp = !comm.ok && state.language && !state.language.interpreterActive;
        const langBadge = needsInterp ? ` · <span class="qbtn-lang-badge" title="이 답변을 사실확인으로 기록하려면 정확한 이해가 필요합니다">답변 확인에 통역 필요</span>` : '';
        b.className = `qbtn suggest ${s.reason}${needsInterp ? ' needs-interp' : ''}`; b.dataset.qid = q.id;
        b.innerHTML = `${esc(q.q)}<em>${esc(q.cat)}${REASON[s.reason] ? ' · ' + REASON[s.reason] : ''}${langBadge}</em>`;
        b.onclick = () => onSuggest(q, false);
        appendInterviewQuestion(box, b, q, needsInterp, () => onSuggest(q, false));
      }
      if (s.action === 'interpreter') box.appendChild(b);
    }
    return;
  }
  // Every question is askable at any time, in any order. A question whose answer is not yet
  // disclosable simply gets the passenger's on-record response (interview-engine `withheld`);
  // there is no lock, no prerequisite list and no disabled button to work around.
  const qs = c.questions.filter((q) => q.cat === state.qcat);
  qs.forEach((q) => {
    const b = document.createElement('button'), wasAsked = state.asked.has(q.id);
    const comm = communicationReady(q);
    const needsInterp = !comm.ok && state.language && !state.language.interpreterActive;
    const langBadge = needsInterp ? ` · <span class="qbtn-lang-badge" title="이 답변을 사실확인으로 기록하려면 정확한 이해가 필요합니다">답변 확인에 통역 필요</span>` : '';
    const unlockedByLock = state.performed.includes(`UNLOCK_Q_${q.id}`);
    b.type = 'button'; b.dataset.qid = q.id; b.className = 'qbtn ' + ((q.requires || []).length ? 'branch ' : '') + (wasAsked ? ' asked' : '') + (needsInterp ? ' needs-interp' : '') + (unlockedByLock ? ' lock-unlocked' : ''); b.disabled = state.ended;
    b.innerHTML = wasAsked
      ? `${esc(q.q)}<em>${esc(q.cat)} · 재질문 · 반복 질문은 효율에 반영${langBadge}</em>`
      : `${esc(q.q)}<em>${esc(q.cat)}${unlockedByLock ? ' · 모순 추궁 해금' : (q.requires ? ' · 추가 질문' : '')}${langBadge}</em>`;
    b.onclick = () => onAsk(q, wasAsked);
    appendInterviewQuestion(box, b, q, needsInterp, () => onAsk(q, wasAsked));
  });
}
// Number shortcuts pick a *category* (1 = first category); the 제안 tab is reached with the arrows or a click.
export function chooseQuestionCategory(index, announce) { const tabs = $$('#qtabs .qtab:not(.qtab-suggest)'); if (index < 0 || index >= tabs.length) return; const cat = tabs[index].dataset.cat; tabs[index].click(); const tab = $$('#qtabs .qtab').find((x) => x.dataset.cat === cat); tab?.focus(); announce?.(`질문 카테고리 ${(tab || tabs[index]).textContent.trim()}`); }
// Arrow/Home/End target for a horizontal tab list (wraps around); null for any other key.
export function tabKey(key, i, n) { return key === 'ArrowRight' ? (i + 1) % n : key === 'ArrowLeft' ? (i - 1 + n) % n : key === 'Home' ? 0 : key === 'End' ? n - 1 : null; }

// Statement Lock UI controller:
// Manages the statement comparison state, docks, interactive targets across panels,
// and visual feedback animations when contradictions are detected.

import { $, $$, byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { evaluateStatementLock, resolveLogQuestionId, LOCK_RESULTS } from '../engines/statement-lock-engine.js';
import { cues } from '../services/audio.js';
import { bus } from '../services/bus.js';

let activeLock = null; // { logIndex, text, questionId }
let lastResult = null; // { ok, title, description, message, severity, timestamp }
let resultTimer = null;

export function isStatementLockActive() {
  return activeLock !== null;
}

export function currentLockedStatement() {
  return activeLock;
}

export function selectStatementForLock(logIndex) {
  const c = current();
  const logItem = state.logs[logIndex];
  if (!logItem || logItem.type !== 'alien') return;

  const qid = resolveLogQuestionId(logItem, c);
  activeLock = {
    logIndex,
    text: logItem.text,
    questionId: qid
  };
  lastResult = null;
  clearTimeout(resultTimer);

  renderStatementLockDock();
  highlightLockTargets(true);
  cues.toggle(true);
  bus.emit('changed');
}

export function clearStatementLock() {
  activeLock = null;
  highlightLockTargets(false);
  renderStatementLockDock();
  bus.emit('changed');
}

export function compareWithTarget(target) {
  if (!activeLock) return;
  const c = current();
  if (!c) return;

  const result = evaluateStatementLock(activeLock, target, c);
  lastResult = {
    ...result,
    timestamp: Date.now()
  };

  if (result.ok) {
    cues.alert();
    // Brief pulse on the affected message
    const msgEl = $(`#log .msg[data-i="${activeLock.logIndex}"]`);
    if (msgEl) {
      msgEl.classList.remove('lock-pulse');
      void msgEl.offsetWidth; // retrigger animation
      msgEl.classList.add('lock-pulse');
    }
  } else {
    cues.click();
  }

  renderStatementLockDock();

  // Auto-dismiss feedback after 4.5 seconds if unmatched, or 7 seconds if matched
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => {
    if (lastResult && Date.now() - lastResult.timestamp >= 4000) {
      lastResult = null;
      renderStatementLockDock();
    }
  }, result.ok ? 7000 : 4500);

  bus.emit('changed');
}

export function renderStatementLockDock() {
  const dock = byId('statementLockDock');
  if (!dock) return;

  if (!activeLock && !lastResult) {
    dock.hidden = true;
    dock.innerHTML = '';
    return;
  }

  dock.hidden = false;

  if (lastResult) {
    const isSuccess = lastResult.ok;
    const severityBadge = lastResult.severity === LOCK_RESULTS.CRITICAL
      ? '<span class="lock-tag critical">결정적 모순</span>'
      : lastResult.severity === LOCK_RESULTS.CONFLICT
      ? '<span class="lock-tag conflict">모순 확인</span>'
      : isSuccess
      ? '<span class="lock-tag success">불일치 확인</span>'
      : '<span class="lock-tag neutral">모순 없음</span>';

    dock.className = `statement-lock-dock ${isSuccess ? 'lock-matched' : 'lock-unmatched'}`;
    dock.innerHTML = `
      <div class="lock-result-card">
        <div class="lock-result-head">
          ${severityBadge}
          <b class="lock-result-title">${esc(lastResult.title || (isSuccess ? '진술 대조 성공' : '대조 결과'))}</b>
          <button type="button" class="lock-close-btn" id="lockDismissBtn" aria-label="결과 닫기">✕</button>
        </div>
        <p class="lock-result-body">${esc(lastResult.description || lastResult.message)}</p>
      </div>
    `;

    const dismissBtn = byId('lockDismissBtn');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        lastResult = null;
        if (!activeLock) dock.hidden = true;
        else renderStatementLockDock();
      };
    }
    return;
  }

  // Active statement waiting for target
  dock.className = 'statement-lock-dock lock-active';
  dock.innerHTML = `
    <div class="lock-active-card">
      <div class="lock-active-source">
        <span class="lock-badge">대조 선택 진술</span>
        <blockquote class="lock-quote">“${esc(activeLock.text)}”</blockquote>
      </div>
      <div class="lock-active-guide">
        <span>대조할 <b>서류 항목</b>, <b>전산조회 결과</b>, 또는 <b>다른 진술</b>을 클릭하십시오.</span>
        <button type="button" class="lock-cancel-btn" id="lockCancelBtn">취소 (ESC)</button>
      </div>
    </div>
  `;

  const cancelBtn = byId('lockCancelBtn');
  if (cancelBtn) cancelBtn.onclick = clearStatementLock;
}

function highlightLockTargets(active) {
  document.body.classList.toggle('statement-lock-mode', active);
}

// Binds global document and terminal click handlers for Statement Lock
export function bindStatementLockListeners() {
  document.addEventListener('click', (e) => {
    // Check if clicked a statement lock button
    const msgLockBtn = e.target.closest('.msg-lock-btn');
    if (msgLockBtn) {
      const idx = parseInt(msgLockBtn.dataset.lockI, 10);
      if (!isNaN(idx)) {
        e.preventDefault();
        e.stopPropagation();
        if (activeLock && activeLock.logIndex !== idx) {
          const targetLog = state.logs[idx];
          compareWithTarget({
            type: 'statement',
            logIndex: idx,
            text: targetLog.text,
            questionId: resolveLogQuestionId(targetLog, current())
          });
        } else {
          selectStatementForLock(idx);
        }
      }
      return;
    }

    if (!activeLock) return;

    // Check if clicked a doc-field
    const fieldEl = e.target.closest('.doc-field[data-doc-key]');
    if (fieldEl) {
      e.preventDefault();
      e.stopPropagation();
      compareWithTarget({
        type: 'doc',
        key: fieldEl.dataset.docKey,
        fieldName: fieldEl.dataset.fieldName,
        fieldValue: fieldEl.dataset.fieldVal
      });
      return;
    }

    // Check if clicked a terminal lookup line
    const lineEl = e.target.closest('#terminal .line[data-lookup-kind]');
    if (lineEl) {
      e.preventDefault();
      e.stopPropagation();
      compareWithTarget({
        type: 'lookup',
        kind: lineEl.dataset.lookupKind
      });
      return;
    }
  });

  // ESC key cancels active lock
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeLock) {
      e.preventDefault();
      e.stopPropagation();
      clearStatementLock();
    }
  });

  // Clear lock on case initialization
  bus.on('case:init', () => {
    activeLock = null;
    lastResult = null;
    clearTimeout(resultTimer);
    highlightLockTargets(false);
  });
}

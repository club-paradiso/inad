// Statement Lock UI controller:
// Manages the statement comparison state, docks, interactive targets across panels,
// and visual feedback animations when contradictions are detected.

import { $, $$, byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { evaluateStatementLock, resolveLogQuestionId, statementDocumentCandidates, LOCK_RESULTS } from '../engines/statement-lock-engine.js';
import { cues } from '../services/audio.js';
import { bus } from '../services/bus.js';
import { setStageState } from './passenger-stage.js';

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
  if (cues.lockPin) cues.lockPin();
  else cues.toggle(true);
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
    const corroborated = result.severity === LOCK_RESULTS.CONSISTENT;
    if (corroborated) {
      if (cues.lockConsistent) cues.lockConsistent();
      else cues.toggle(true);
      // A comparison in the officer's UI does not establish the passenger's feelings.
      setStageState('idle');
    } else {
      if (cues.lockConflict) cues.lockConflict();
      else cues.alert();
      setStageState('idle');
    }
    // Brief pulse on the affected message
    const msgEl = $(`#log .msg[data-i="${activeLock.logIndex}"]`);
    if (msgEl) {
      msgEl.classList.remove('lock-pulse');
      void msgEl.offsetWidth; // retrigger animation
      msgEl.classList.add('lock-pulse');
    }
  } else {
    if (result.reason === LOCK_RESULTS.CONSISTENT && cues.lockConsistent) {
      cues.lockConsistent();
    } else {
      cues.click();
    }
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
  return result;
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
      : isSuccess && lastResult.severity === LOCK_RESULTS.CONSISTENT
      ? '<span class="lock-tag success">일치 확인</span>'
      : isSuccess
      ? '<span class="lock-tag conflict">추가 확인</span>'
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

// Subtle hints are intentionally limited to guided mode and to submitted documents.
// Never highlight a lookup-dependent field until that lookup was actually performed.
export function refreshStatementLockCandidates() {
  const c = current(), qid = activeLock?.questionId;
  const guided = Boolean(activeLock && c && state.guidance === 'guided');
  const candidates = guided ? statementDocumentCandidates(c, qid) : [];
  const matches = (key, fieldName) => candidates.some((item) =>
    item.key === key && (!item.fieldPattern || item.fieldPattern.test(fieldName || '')));
  document.querySelectorAll('.doc-field[data-doc-key]').forEach((field) => {
    field.classList.toggle('lock-candidate', guided && matches(field.dataset.docKey, field.dataset.fieldName));
  });
  document.querySelectorAll('#doclist .docitem, #docTabs .tab').forEach((tab) => {
    const idx = Number(tab.dataset.i);
    const key = Number.isInteger(idx) && idx >= 0 ? c?.docs?.[idx]?.k : tab.dataset.docKey;
    tab.classList.toggle('lock-candidate', guided && candidates.some((item) => item.key === key));
  });
}

function highlightLockTargets(active) {
  document.body.classList.toggle('statement-lock-mode', active);
  refreshStatementLockCandidates();
}

function showDocumentCompareResult(result, field = null) {
  // Enlarged-document modals contain their own live compare controls. Keep
  // feedback with the active document instead of writing behind the modal.
  const view = field?.closest('.doc-modal-wrap') || byId('docview');
  if (!view || !result) return;
  view.querySelector('.doc-lock-feedback')?.remove();
  const notice = document.createElement('div');
  notice.className = 'doc-lock-feedback';
  notice.setAttribute('role', 'status');
  const heading = document.createElement('strong');
  heading.textContent = result.title || (result.ok ? '대조 완료' : '대조 결과');
  const detail = document.createElement('span');
  detail.textContent = result.description || result.message || '';
  notice.append(heading, detail);
  view.prepend(notice);
}

function beginDocumentComparison(field, target) {
  document.querySelector('#docStatementPicker')?.remove();
  const finish = (index) => {
    if (!activeLock) selectStatementForLock(index);
    const result = compareWithTarget(target);
    showDocumentCompareResult(result, field);
  };
  if (activeLock) { finish(activeLock.logIndex); return; }
  const statements = (state.logs || []).map((log, i) => ({ log, i }))
    .filter(({ log }) => log?.type === 'alien' && log.text && !log.pending)
    .slice(-8).reverse();

  // One available statement is unambiguous; otherwise let the player choose,
  // rather than secretly using an unrelated utterance.
  if (statements.length === 1) { finish(statements[0].i); return; }

  const picker = document.createElement('div');
  picker.id = 'docStatementPicker';
  picker.className = 'doc-statement-picker';
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', '대조할 진술 선택');
  const title = document.createElement('strong');
  title.textContent = statements.length ? '대조할 피심사인 진술 선택' : '먼저 인터뷰에서 진술을 받아 주세요';
  picker.appendChild(title);
  for (const { log, i } of statements) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'doc-compare-statement';
    b.dataset.compareLog = String(i);
    b.textContent = log.text.slice(0, 105);
    b.onclick = () => finish(i);
    picker.appendChild(b);
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'doc-compare-cancel';
  close.textContent = '닫기';
  close.onclick = () => picker.remove();
  picker.appendChild(close);
  field.insertAdjacentElement('afterend', picker);
  picker.querySelector('button')?.focus();
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

    // The document action works in either direction; it does not require a pinned
    // statement first. The comparison picker only offers utterances already heard.
    const docCompare = e.target.closest('.doc-compare-btn');
    if (docCompare) {
      const field = docCompare.closest('.doc-field[data-doc-key]');
      if (field) {
        e.preventDefault();
        e.stopPropagation();
        beginDocumentComparison(field, {
          type: 'doc', key: field.dataset.docKey,
          fieldName: field.dataset.fieldName, fieldValue: field.dataset.fieldVal
        });
      }
      return;
    }

    if (!activeLock) return;

    // Check if clicked a doc-field
    const fieldEl = e.target.closest('.doc-field[data-doc-key]');
    if (fieldEl) {
      e.preventDefault();
      e.stopPropagation();
      const result = compareWithTarget({
        type: 'doc',
        key: fieldEl.dataset.docKey,
        fieldName: fieldEl.dataset.fieldName,
        fieldValue: fieldEl.dataset.fieldVal
      });
      showDocumentCompareResult(result, fieldEl);
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
    document.querySelector('#docStatementPicker')?.remove();
    activeLock = null;
    lastResult = null;
    clearTimeout(resultTimer);
    highlightLockTargets(false);
  });
}

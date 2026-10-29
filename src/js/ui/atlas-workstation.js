// Reuses the existing four zones. Only one country's content is mounted at a time;
// parked Korean DOM nodes retain their listeners, drafts and document view state.
import { state } from '../state.js';
import { countryPack, COUNTRY_IDS } from '../../data/country-packs.js';
import { atlasScenarios } from '../../data/atlas-scenarios.js';
import * as atlas from '../engines/atlas-engine.js';
import { atlasText as text, getLocale, setLocale } from '../services/i18n.js';
import { bus } from '../services/bus.js';
import { $, $$, byId, esc, focusKey, restoreFocus } from './dom.js';
import { showModal, closeModal, syncBackgroundInert } from './modals.js';
import { showTask } from './task-nav.js';
import { hideStartOverlay } from './start-screen.js';
import { announceA11y } from './toast.js';
import { makeBundle, collectPayload } from '../engines/save-engine.js';
import { downloadBlob } from '../services/diagnostics.js';
import { exportSave, ensureImportInput } from './views/system-center.js';

const l = (ko, en) => text({ ko, en });
const h = (value) => esc(text(value));
const parkedZones = new Map();
let koreanTask = 'passenger';
let callbacks;
const outcomes = () => ({ complete: l('검토 완료', 'Review complete'), evidence: l('자료 요청', 'Request evidence'), review: l('추가 검토', 'Additional review') });
const button = (id, label, attr = '') => `<button type="button" class="act" id="${id}" ${attr}>${esc(label)}</button>`;
const box = (title, content) => `<div class="atlas-section"><h2>${esc(title)}</h2>${content}</div>`;
const factChip = (f, sel, icon = '📌') => `<button type="button" class="act fact-chip ${sel ? 'selected' : ''}" data-fact="${f.id}" aria-pressed="${String(sel)}" id="fact-${f.id}"><span class="chip-icon">${sel ? '✓' : icon}</span><span>${h(f.label)}</span></button>`;
const SAVE_LABELS = {
  saved: ['이 기기에 저장됨', 'Saved on this device'],
  failed: ['저장 실패 · 입력 유지', 'Save failed · input preserved'],
  protected: ['기존 저장 보호 중', 'Existing save protected'],
  conflict: ['다른 탭 최신 저장 감지 · 덮어쓰기 방지', 'Another tab saved newer changes · cannot overwrite'],
  idle: ['시작 전', 'Not started']
};
function saveLabel() { const e = SAVE_LABELS[state.atlas.saveStatus]; return e ? l(e[0], e[1]) : ''; }
const TYPE_MAP = { MATCH: ['일치', 'Match'], CONFLICT: ['상충', 'Conflict'], MISSING: ['누락', 'Missing'], UNVERIFIED: ['미확인', 'Unverified'] };
const relText = (t) => { const e = TYPE_MAP[t]; return e ? l(e[0], e[1]) : t; };
function focusView() {
  document.body.dataset.focus = state.atlas.view;
  $$('[data-atlas-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.atlasView === state.atlas.view)));
}
function mountCountry() {
  const foreign = state.countryId !== 'KR';
  document.body.dataset.country = state.countryId;
  if (foreign && !parkedZones.size) {
    koreanTask = document.body.dataset.task;
    $$('#mainContent > .zone').forEach((zone) => { parkedZones.set(zone, [...zone.childNodes]); zone.replaceChildren(); zone.setAttribute('data-i18n-control', ''); });
  } else if (!foreign && parkedZones.size) {
    for (const [zone, nodes] of parkedZones) { zone.replaceChildren(...nodes); zone.removeAttribute('data-i18n-control'); }
    parkedZones.clear();
    $$('#taskNav button').forEach((b) => { b.textContent = ({ passenger: l('승객', 'Passenger'), interview: l('인터뷰', 'Interview'), evidence: l('자료', 'Evidence'), assessment: l('판단', 'Assessment') })[b.dataset.task]; });
    showTask(koreanTask);
  }
  byId('atlasHeader').hidden = !foreign;
  byId('atlasFooter').hidden = !foreign;
  if (foreign || state.started) hideStartOverlay();
  else { byId('startOverlay').classList.remove('hide'); byId('startOverlay').setAttribute('aria-hidden', 'false'); syncBackgroundInert(); }
  focusView();
}
export function openCountrySelector(error = '', selected = state.countryId) {
  if (!countryPack(selected)) selected = 'KR';
  showModal(l('국가와 업무 선택', 'Choose country and duty'), `<div class="atlas-setup" data-i18n-control><p>${l('국가별 업무 연습 (합성 자료 · 법률 판정 미제공)', 'Practice duty stations (synthetic cases · no legal determinations)')}</p>${error ? `<p role="alert">${esc(error)}</p>` : ''}<fieldset><legend>${l('국가', 'Country')}</legend><div class="atlas-country-list">${COUNTRY_IDS.map((id) => { const p = countryPack(id); return `<label><input type="radio" name="atlas-country" value="${id}" ${id === selected ? 'checked' : ''}><span><strong>${h(p.name)}</strong><span>${h(p.title)}</span><small>${h(p.status)}</small></span></label>`; }).join('')}</div></fieldset><div id="atlasPackDetail"></div><div class="atlas-settings"><label>${l('화면 언어', 'UI language')}<select id="atlasLocale"><option value="ko" ${getLocale() === 'ko' ? 'selected' : ''}>한국어</option><option value="en" ${getLocale() === 'en' ? 'selected' : ''}>English</option></select></label>${button('atlasAccessibility', l('접근성 설정', 'Accessibility settings'))}</div><p>${l('사건은 국가별로 보관됩니다.', 'Cases are kept separately by country.')}</p><div class="modal-actions">${error ? '' : button('atlasCancel', l('취소', 'Cancel'))}<button type="button" class="act primary" id="atlasEnter">${l('선택한 업무로 이동', 'Open selected duty')}</button></div></div>`, { size: 'wide', dismissible: !error });
  const details = (id) => {
    const p = countryPack(id), s = state.atlas.sessions[id];
    byId('atlasPackDetail').innerHTML = `<h3>${h(p.name)} · ${h(p.title)}</h3><p>${h(p.description)}</p><p>${l('디자인 근거', 'Design evidence')}: ${esc(p.authenticity)} · ${p.sources.join(', ')}</p><p>${({ CA: l('IRCC 패턴 참고', 'IRCC patterns'), GB: l('UKVI 과업 패턴 참고', 'UKVI patterns'), NZ: l('INZ 지침 참고', 'INZ patterns'), KR: l('한국 심사 기준 유지', 'Korean baseline') })[id] || ''}</p>${id === 'KR' ? `<p>${l('공항·난이도·인터뷰 언어는 기존 한국 모드에서 설정합니다.', 'Configure airport, difficulty and interview language in the existing Korean mode.')}</p>` : `<div class="atlas-settings"><label>${l('가상 근무지', 'Fictional duty station')}<select id="atlasAirport">${p.airports.map((a) => `<option value="${a.id}" ${a.id === s?.airportId ? 'selected' : ''}>${h(a.name)}</option>`).join('')}</select></label><label>${l('업무 모드', 'Duty mode')}<select id="atlasMode"><option value="simulation">${l('절차·증거 검토 연습', 'Procedure and evidence practice')}</option></select></label><label>${l('안내 수준', 'Guidance')}<select id="atlasDifficulty"><option value="guided">${l('안내 제공', 'Guided')}</option><option value="independent" ${s?.difficulty === 'independent' ? 'selected' : ''}>${l('자율 검토', 'Independent')}</option></select></label><label>${l('인터뷰 언어', 'Interview language')}<select id="atlasInterviewLanguage"><option value="en">English</option><option value="ko" ${s?.interviewLanguage === 'ko' ? 'selected' : ''}>한국어</option></select></label></div><p class="atlas-muted">${l('가상 근무 맥락입니다.', 'Fictional station context.')}</p>`}`;
  };
  details(selected);
  $$('[name="atlas-country"]').forEach((r) => { r.onchange = () => details(r.value); });
  byId('atlasLocale').onchange = (e) => { const selectedCountry = $('[name="atlas-country"]:checked').value; setLocale(e.target.value); closeModal(); openCountrySelector(error, selectedCountry); };
  byId('atlasAccessibility').onclick = callbacks.settings;
  if (byId('atlasCancel')) byId('atlasCancel').onclick = closeModal;
  byId('atlasEnter').onclick = () => {
    const id = $('[name="atlas-country"]:checked').value;
    const options = { airportId: byId('atlasAirport')?.value, difficulty: byId('atlasDifficulty')?.value, interviewLanguage: byId('atlasInterviewLanguage')?.value };
    const go = () => { const r = atlas.selectCountry(id, options); if (!r.ok) return; closeModal(); mountCountry(); if (id !== 'KR') { renderAtlas(); showTask(state.atlas.view === 'counter' ? 'interview' : 'evidence'); byId('atlasCaseHeading')?.focus(); } else { callbacks.renderKorean(); if (state.started) byId('caseName')?.focus(); } };
    if (state.started && id !== state.countryId) {
      showModal(l('국가 변경 확인', 'Confirm country change'), `<div data-i18n-control><p>${l('현재 사건을 보관하고 선택한 국가로 이동합니다. 돌아오면 검토를 이어갈 수 있습니다.', 'Keep the current case and switch countries. Return here to continue the review.')}</p><p>${state.countryId === 'KR' ? l('한국 사건의 현재 화면은 이 탭에서 유지됩니다. 새로고침 시에는 마지막 체크포인트부터 복원됩니다.', 'The current Korean screen stays in this tab. Reloading restores the last checkpoint.') : esc(saveLabel())}</p><div class="modal-actions">${button('atlasStay', l('현재 국가 유지', 'Stay here'), 'data-autofocus')}<button type="button" class="act primary" id="atlasSwitch">${l('국가 변경', 'Switch country')}</button></div></div>`);
      byId('atlasStay').onclick = closeModal; byId('atlasSwitch').onclick = go;
    } else go();
  };
}
function personHTML(c, v, p) {
  return box(l('사람과 사건', 'Person and case'), `<p class="atlas-person">${esc(c.name)}</p><dl><dt>${l('대상 식별자', 'Person ID')}</dt><dd class="mono">${c.personId}</dd><dt>${l('현재 사건', 'Current case')}</dt><dd class="mono">${c.id}</dd><dt>${l('가상 근무지', 'Fictional station')}</dt><dd>${h(p.airports.find((a) => a.id === state.airportId)?.name)}</dd></dl><p>${h(c.brief)}</p><p class="atlas-muted">${l('합성 자료 · 법률 판정 아님', 'Synthetic data · no legal decisions')}</p>`) + box(l('연습 사건', 'Practice cases'), `<div class="atlas-case-list">${atlasScenarios(p.id).map((item) => button(`case-${item.id}`, `${item.id} · ${text(item.title)}${activeCompleted(item.id) ? ' · ' + l('완료', 'Complete') : ''}`, `data-case="${item.id}" aria-current="${item.id === c.id}"`)).join('')}</div>`) + (p.id === 'NZ' ? box(l('신청 맥락', 'Application context'), `<p>${l('배정 활동 검토 · 활동 완료가 비자 발급 아님', 'Review assigned activity · completion is not a visa grant')}</p>`) : '');
}
const activeCompleted = (id) => atlas.activeAtlasSession()?.cases[id]?.completed;
function interviewHTML(c, v) {
  const language = atlas.activeAtlasSession().interviewLanguage;
  const stmtFacts = (c.facts || []).filter((f) => f.sourceType === 'statement');
  const visibleStmtFacts = stmtFacts.filter((f) => !f.questionIds || f.questionIds.some((qid) => v.asked.includes(qid)));
  const unlockedQIds = v.graph?.unlockedQuestions || [];
  const investigative = c.investigativeQuestions || [];
  const stmtFactsHTML = visibleStmtFacts.length ? `
    <div class="atlas-fact-group"><small><strong>${l('진술 대조 항목', 'Facts from statements')}:</strong></small><div class="atlas-fact-chips">
      ${visibleStmtFacts.map((f) => factChip(f, v.graph?.selectedFacts?.includes(f.id), '💬')).join('')}
    </div></div>` : '';

  const questionsHTML = `
    <div class="atlas-questions">
      ${c.questions.map((q) => button(`ask-${q.id}`, text(q.q), `data-ask="${q.id}" ${v.completed || v.asked.includes(q.id) ? 'disabled' : ''}`)).join('')}
      ${investigative.map((q) => {
        const isUnlocked = unlockedQIds.includes(q.id);
        const isAsked = v.asked.includes(q.id);
        if (!isUnlocked && !isAsked) {
          return `<button type="button" class="act locked-q" disabled aria-disabled="true" id="ask-${q.id}" title="${l('서류를 대조하여 상충 또는 누락을 발견하면 해제됩니다.', 'Unlocked by discovering discrepancies in evidence.')}">🔒 ${h(q.q)} <small>(${l('대조 후 해제', 'Locked')})</small></button>`;
        }
        return button(`ask-${q.id}`, `💡 ${text(q.q)}`, `data-ask="${q.id}" ${v.completed || isAsked ? 'disabled' : ''}`);
      }).join('')}
    </div>
  `;

  return box(l('인터뷰 기록', 'Interview record'), `<p class="atlas-muted">${l('합성 대화 연습', 'Synthetic dialogue')}</p><div class="atlas-transcript" aria-label="${l('질문 기록', 'Transcript')}">${v.asked.length ? v.asked.map((id) => { const q = [...c.questions, ...investigative].find((x) => x.id === id); return q ? `<div><b>${esc(q.q[language])}</b><p lang="${language}">${esc(q.answer[language])}</p></div>` : ''; }).join('') : `<p>${l('질문 대기', 'No questions yet')}</p>`}</div>${stmtFactsHTML}${questionsHTML}`);
}
function taskHTML(c, v, title) {
  return box(title, ` ${atlas.activeAtlasSession().difficulty === 'guided' ? `<p class="atlas-muted">${l('연결 문서를 검토한 뒤 과업을 확인하세요. 자료 대조에는 진술이, 인계에는 메모가 필요합니다.', 'Review the linked document before checking a task. Evidence comparison needs a statement; handover needs a note.')}</p>` : ''}<p id="atlasTaskError" role="status"></p><ol class="atlas-tasks">${c.tasks.map((t, i) => `<li><div><b>${i + 1}. ${h(t.title)}</b><span>${v.tasks.includes(t.id) ? l('완료', 'Complete') : l('검토 필요', 'Review needed')}</span></div>${button(`task-link-${t.id}`, l('자료 열기', 'Open evidence'), `data-doc="${t.documentId}"`)}${button(`task-${t.id}`, l('확인 완료', 'Mark checked'), `data-check="${t.id}" ${v.completed || v.tasks.includes(t.id) ? 'disabled' : ''}`)}</li>`).join('')}</ol>`);
}
function recordsHTML(c, v) {
  const query = v.search.toLowerCase(), records = v.searched ? c.records.filter((r) => `${r.id} ${c.name} ${text(r.title)} ${text(r.detail)}`.toLowerCase().includes(query)) : [];
  return box(l('기록 조회', 'Record search'), `<form id="atlasSearchForm"><label for="atlasSearch">${l('검색어', 'Search')}</label><div class="atlas-search"><input id="atlasSearch" maxlength="120" value="${esc(v.search)}" autocomplete="off"><button class="act" type="submit">${l('조회', 'Search')}</button>${button('atlasResetSearch', l('초기화', 'Reset'))}</div></form><p role="status">${v.searched ? records.length ? `${records.length} ${l('건 조회', 'results')}` : l('일치하는 기록이 없습니다.', 'No synthetic records match.') : l('조회 대기', 'Not searched')}</p>${records.length ? `<table><caption class="sr-only">${l('합성 기록', 'Records')}</caption><thead><tr><th>${l('기록', 'Record')}</th><th>${l('내용', 'Content')}</th><th>${l('상태', 'State')}</th></tr></thead><tbody>${records.map((r) => {
    const recFact = (c.facts || []).find((f) => f.sourceId === r.id || f.sourceId === r.documentId);
    const factBtn = recFact ? factChip(recFact, v.graph?.selectedFacts?.includes(recFact.id)) : '';
    return `<tr class="${v.selectedRecord === r.id ? 'selected' : ''}"><th scope="row">${button(`record-${r.id}`, text(r.title), `data-record="${r.id}"`)}<small class="mono">${r.id}</small>${factBtn}</th><td>${h(r.detail)}</td><td>${v.selectedRecord === r.id ? l('선택됨', 'Selected') : l('미선택', 'Not selected')}</td></tr>`;
  }).join('')}</tbody></table>` : ''}`);
}
function documentsHTML(c, v) {
  const d = c.documents.find((d) => d.id === v.selectedDoc), page = v.pages[d.id];
  const docFacts = (c.facts || []).filter((f) => f.sourceId === d.id && (f.page === undefined || f.page === page));
  const factsHTML = docFacts.length ? `
    <div class="atlas-fact-group"><small><strong>${l('이 서류의 대조 항목', 'Facts in this document')}:</strong></small><div class="atlas-fact-chips">
      ${docFacts.map((f) => factChip(f, v.graph?.selectedFacts?.includes(f.id), '📌')).join('')}
    </div></div>` : '';
  return box(l('문서 검토', 'Document review'), `<div class="atlas-doc-tabs">${c.documents.map((doc) => button(`doc-${doc.id}`, text(doc.title), `data-doc="${doc.id}" aria-pressed="${doc.id === d.id}"`)).join('')}</div><div class="atlas-doc-tools">${button('atlasPrevPage', l('이전 쪽', 'Previous page'), page === 0 ? 'disabled' : '')}<span>${page + 1} / ${d.pages.length}</span>${button('atlasNextPage', l('다음 쪽', 'Next page'), page === d.pages.length - 1 ? 'disabled' : '')}<label>${l('확대', 'Zoom')}<select id="atlasZoom">${[100, 125, 150].map((z) => `<option ${z === v.zoom ? 'selected' : ''} value="${z}">${z}%</option>`).join('')}</select></label></div><article class="atlas-document" style="font-size:${v.zoom}%" aria-label="${h(d.title)}"><small>${l('가상 문서 대조', 'Synthetic document')}</small><h3>${h(d.title)}</h3><p class="mono">${d.id}</p><p>${h(d.pages[page])}</p></article>${factsHTML}<div class="atlas-row"><span>${v.reviewed.includes(d.id) ? l('검토 완료', 'Reviewed') : l('미검토', 'Not reviewed')}</span>${button('atlasReviewDoc', l('검토 자료로 기록', 'Record reviewed'), v.completed || v.reviewed.includes(d.id) ? 'disabled' : '')}</div>`);
}
function compareDockHTML(c, v) {
  const g = v.graph || { selectedFacts: [], discoveries: [], evidenceRequests: [], unlockedQuestions: [] };
  const allFacts = c.facts || [];
  const selected = [allFacts.find((f) => f.id === g.selectedFacts[0]), allFacts.find((f) => f.id === g.selectedFacts[1])];
  const lastHistory = g.history?.[g.history.length - 1];

  let resultBanner = '';
  if (lastHistory) {
    const matchedCmp = (c.comparisons || []).find((cmp) => cmp.findingId === lastHistory.findingId);
    const title = matchedCmp ? text(matchedCmp.title) : l('대조 결과', 'Comparison result');
    const explanation = matchedCmp ? text(matchedCmp.explanation) : l('직접 연결 미확인', 'No direct link');
    resultBanner = `<div class="atlas-result-box type-${lastHistory.type.toLowerCase()}" role="status"><div class="result-badge-row"><span class="rel-badge badge-${lastHistory.type.toLowerCase()}">${esc(relText(lastHistory.type))}</span><strong>${esc(title)}</strong></div><p>${esc(explanation)}</p></div>`;
  }

  const discoveriesHTML = g.discoveries.length ? `
    <div class="atlas-discoveries-summary"><small><strong>${l('확인된 증거 관계', 'Discovered relationships')} (${g.discoveries.length}):</strong></small><ul class="atlas-discovery-tags">
      ${g.discoveries.map((fid) => {
        const found = (c.comparisons || []).find((cmp) => cmp.findingId === fid);
        return found ? `<li><span class="rel-badge badge-${found.type.toLowerCase()}">${esc(relText(found.type))}</span> ${esc(text(found.title))}</li>` : '';
      }).join('')}
    </ul></div>` : '';

  const reqActionHTML = (c.id === 'SIM-NZ-02' && g.discoveries.includes('NZ02_PAGE2_MISSING')) ? `
    <div class="atlas-req-panel"><p><strong>${l('보완 요구 가능', 'Evidence Request Available')}:</strong> ${l('체류 계획 2쪽 미접수 확인됨', 'Absence of stay plan page 2 confirmed')}</p>${button('atlasRequestPage2', g.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2') ? l('✓ 체류 계획 2쪽 보완 요청 완료', '✓ Page 2 evidence request lodged') : l('📄 체류 계획 2쪽 보완 요청 발령', '📄 Issue request for stay plan page 2'), g.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2') ? 'disabled' : 'class="act primary"')}</div>` : '';

  return `<section class="atlas-compare-dock" id="atlasCompareDock" aria-label="${l('증거 대조 작업대', 'Evidence comparison dock')}">
    <div class="dock-header"><h3>🔍 ${l('증거 대조', 'Compare Evidence')}</h3><p class="atlas-muted">${l('대조할 두 항목을 선택하세요.', 'Select two facts to compare.')}</p></div>
    <div class="dock-slots">${selected.map((f, i) => `<div class="dock-slot ${f ? 'has-fact' : 'empty'}" id="compareSlot${i + 1}"><span class="slot-tag">${l(`항목 ${i + 1}`, `Fact ${i + 1}`)}</span><span class="slot-label">${f ? esc(text(f.label)) : l('선택 대기', 'Waiting for fact')}</span>${f ? `<button type="button" class="act-slot-clear" data-fact="${f.id}" aria-label="${l('선택 취소', 'Deselect')}">✕</button>` : ''}</div>`).join('')}</div>
    <div class="dock-controls"><button type="button" class="act primary" id="atlasDoCompare" ${g.selectedFacts.length === 2 ? '' : 'disabled'}>${l('대조하기', 'Compare Facts')}</button><button type="button" class="act" id="atlasClearFacts" ${g.selectedFacts.length ? '' : 'disabled'}>${l('선택 초기화', 'Clear Selection')}</button></div>
    ${resultBanner}${discoveriesHTML}${reqActionHTML}
  </section>`;
}
function assessmentHTML(c, v) {
  const crossCheckNote = v.asked.includes('crosscheck')
    ? l('추가 원문 교차 질문 확인됨', 'Case-specific source cross-check completed')
    : l('선택 과제: 추가 교차 질문 가능', 'Optional task: cross-check question available');
  const missing = atlas.atlasMissing(), names = { documents: l('문서 검토', 'Document review'), interview: l('인터뷰', 'Interview'), record: l('기록 선택', 'Record selection'), notes: l('검토 메모 10자 이상', 'Review note of at least 10 characters'), tasks: l('과업 확인', 'Task checks') };

  let debriefHTML = '';
  if (v.completed) {
    const d = atlas.atlasDebrief();
    const route = v.graph?.investigationPath === 'records_first' ? l('기록 우선', 'Records-first') : l('인터뷰 우선', 'Interview-first');
    const rating = { thorough: l('철저한 검토', 'Thorough'), competent: l('적절한 검토', 'Competent'), incomplete: l('추가 대조 권장', 'Incomplete') }[d?.rating] || l('검토 완료', 'Complete');
    const fbs = d?.feedback?.length ? `<ul class="atlas-debrief-points">${d.feedback.map((fb) => `<li>${esc(text(fb))}</li>`).join('')}</ul>` : '';
    debriefHTML = `<div class="atlas-debrief" tabindex="-1"><div class="debrief-head"><h3>${l('연습 결과', 'Debrief')}: ${outcomes()[v.outcome]}</h3><span class="debrief-rating rating-${d?.rating || 'competent'}">${esc(rating)}</span></div><p class="debrief-route"><strong>${l('경로', 'Route')}:</strong> ${esc(route)}</p><p>${v.outcome === c.expectedOutcome ? l('근거 일치', 'Matches evidence') : l('근거 재확인 필요', 'Check evidence')}</p><p>${h(c.debrief)}</p>${fbs}<div class="debrief-rationale"><strong>${l('판단 근거', 'Rationale')}:</strong><p>${esc(v.rationale)}</p></div></div>`;
  }

  return box(l('검토 메모', 'Review notes'), `<label for="atlasNotes">${l('확인 사실 · 근거 · 다음 행동', 'Facts · evidence · next action')}</label><textarea id="atlasNotes" maxlength="4000" rows="7" ${v.completed ? 'readonly' : ''}>${esc(v.notes)}</textarea><p id="atlasSaveStatus" role="status">${esc(saveLabel())}</p>${button('atlasSaveRetry', l('저장 재시도', 'Retry save'))}`) + box(l('결과 준비', 'Outcome preparation'), `<p>${v.reviewed.length}/${c.documents.length} ${l('자료 검토', 'documents reviewed')} · ${v.tasks.length}/${c.tasks.length} ${l('과업 완료', 'tasks checked')}</p><p class="atlas-muted">${esc(crossCheckNote)}</p>${missing.length ? `<p>${l('남은 검토', 'Still to review')}</p><ul>${missing.map((k) => `<li>${names[k]}</li>`).join('')}</ul>` : `<p>${l('가상 결과를 검토할 수 있습니다.', 'Ready to review a simulated outcome.')}</p>`}${v.completed ? debriefHTML : `<button type="button" class="act primary" id="atlasPrepare">${l('가상 결과 검토', 'Review simulated outcome')}</button>`}<p class="atlas-muted">${l('가상 규칙 · 실제 처분이 아닙니다.', 'Simulation rule · not an actual disposition.')}</p>`);
}
export function renderAtlas() {
  if (state.countryId === 'KR') { focusView(); return; }
  const c = atlas.currentAtlasScenario(), v = atlas.activeAtlasCase(), p = countryPack(state.countryId); if (!c || !v || !p) return;
  const historyOpen = $('.atlas-history')?.open || false;
  const key = focusKey(), scroll = $$('#mainContent > .zone').map((z) => z.scrollTop);
  byId('atlasHeader').innerHTML = `<div><strong>INAD · ${h(p.name)}</strong><span id="atlasCaseHeading" tabindex="-1">${h(p.title)} · ${c.id} · ${h(c.title)}</span></div><nav aria-label="${l('국가별 작업대 메뉴', 'Country workstation menu')}">${button('atlasCountry', l('국가 선택', 'Country selection'))}${button('atlasSettings', l('설정', 'Settings'))}${button('atlasData', l('저장·내보내기', 'Save and export'))}${button('atlasLanguage', getLocale() === 'ko' ? 'English UI' : '한국어 UI')}</nav><div class="atlas-view-switch" role="group" aria-label="${l('작업 초점', 'Workspace focus')}">${button('atlasCounter', l('대면', 'Counter'), 'data-atlas-view="counter"')}${button('atlasSystem', l('전산', 'System'), 'data-atlas-view="system"')}<span>${l('합성 사건 · 법률 판정 미제공', 'Synthetic cases · legal decisions unavailable')}</span></div>`;
  $('.zone-person').innerHTML = personHTML(c, v, p);
  $('.zone-interview').innerHTML = interviewHTML(c, v);
  const tasks = taskHTML(c, v, p.id === 'NZ' ? l('배정 활동', 'Assigned activities') : l('담당 과업', 'Assigned tasks'));
  const dock = compareDockHTML(c, v);
  $('.zone-evidence').innerHTML = dock + (p.id === 'CA' ? recordsHTML(c, v) + documentsHTML(c, v) + tasks : p.id === 'GB' ? tasks + documentsHTML(c, v) + `<details class="atlas-history"><summary>${l('사건 이력과 기록', 'Case history and records')}</summary>${recordsHTML(c, v)}</details>` : `<div class="atlas-activity-context"><b>${l('현재 신청의 배정 활동', 'Assigned activities in this application')}</b><p>${l('자료 연결 → 확인 → 미확인 사항 인계', 'Link evidence → verify → hand over unresolved points')}</p></div>` + tasks + recordsHTML(c, v) + documentsHTML(c, v));
  $('.zone-assessment').innerHTML = assessmentHTML(c, v);
  byId('atlasFooter').textContent = `${p.authenticity} · ${p.sources.join(' / ')} · ${l('가상 규칙', 'SIMULATION_RULE')} · ${esc(saveLabel())}`;
  $$('#taskNav button').forEach((b) => { b.textContent = ({ passenger: l('대상', 'Person'), interview: l('인터뷰', 'Interview'), evidence: p.id === 'CA' ? l('기록', 'Records') : p.id === 'GB' ? l('과업', 'Tasks') : l('활동', 'Activities'), assessment: l('검토', 'Review') })[b.dataset.task]; });
  byId('atlasCountry').onclick = () => openCountrySelector(); byId('atlasSettings').onclick = showAtlasSettings; byId('atlasData').onclick = showAtlasData;
  byId('atlasLanguage').onclick = () => setLocale(getLocale() === 'ko' ? 'en' : 'ko');
  $$('[data-atlas-view]').forEach((b) => { b.onclick = () => { atlas.setAtlasView(b.dataset.atlasView); showTask(b.dataset.atlasView === 'counter' ? 'interview' : 'evidence'); }; });
  $$('[data-case]').forEach((b) => { b.onclick = () => { atlas.selectAtlasCase(b.dataset.case); byId('atlasCaseHeading').focus(); }; });
  $$('[data-ask]').forEach((b) => { b.onclick = () => { atlas.atlasAction('ask', b.dataset.ask); announceA11y(l('답변을 기록했습니다.', 'Answer recorded.')); }; });
  $$('[data-doc]').forEach((b) => { b.onclick = () => { atlas.atlasAction('document', b.dataset.doc); showTask('evidence'); }; });
  $$('[data-record]').forEach((b) => { b.onclick = () => atlas.atlasAction('record', b.dataset.record); });
  $$('[data-check]').forEach((b) => { b.onclick = () => { if (!atlas.atlasAction('task', b.dataset.check)) { const message = l('연결 문서를 검토하고, 진술과 메모를 먼저 기록하세요.', 'Review the linked document and record the statement and note first.'); byId('atlasTaskError').textContent = message; announceA11y(message); } }; });
  $$('[data-fact]').forEach((b) => { b.onclick = () => { atlas.atlasAction('selectFact', b.dataset.fact); announceA11y(l('대조 항목 선택', 'Fact selected')); }; });
  if (byId('atlasDoCompare')) byId('atlasDoCompare').onclick = () => { const res = atlas.atlasCompare(); if (res.ok) announceA11y(l('대조 완료', 'Comparison complete')); };
  if (byId('atlasClearFacts')) byId('atlasClearFacts').onclick = () => { atlas.atlasAction('clearFacts'); announceA11y(l('초기화', 'Cleared')); };
  if (byId('atlasRequestPage2')) byId('atlasRequestPage2').onclick = () => { atlas.atlasAction('requestEvidence', 'SIM-NZ-02-REQ-PAGE2'); announceA11y(l('보완 요청 발령', 'Request issued')); };
  byId('atlasSearchForm').onsubmit = (e) => { e.preventDefault(); atlas.atlasAction('search', byId('atlasSearch').value); };
  byId('atlasSearch').oninput = (e) => { const value = e.target.value; atlas.atlasAction('search', value); byId('atlasSearch').focus(); byId('atlasSearch').setSelectionRange(value.length, value.length); };
  byId('atlasResetSearch').onclick = () => atlas.atlasAction('search', '');
  const d = c.documents.find((x) => x.id === v.selectedDoc);
  byId('atlasPrevPage').onclick = () => atlas.atlasAction('page', v.pages[d.id] - 1); byId('atlasNextPage').onclick = () => atlas.atlasAction('page', v.pages[d.id] + 1);
  byId('atlasZoom').onchange = (e) => atlas.atlasAction('zoom', Number(e.target.value));
  byId('atlasReviewDoc').onclick = () => atlas.atlasAction('review', d.id);
  byId('atlasNotes').oninput = (e) => { atlas.atlasAction('notes', e.target.value); byId('atlasSaveStatus').textContent = saveLabel(); };
  byId('atlasSaveRetry').onclick = () => { atlas.persistAtlas(); renderAtlas(); };
  if (byId('atlasPrepare')) byId('atlasPrepare').onclick = prepareOutcome;
  if ($('.atlas-history')) $('.atlas-history').open = historyOpen;
  focusView(); $$('#mainContent > .zone').forEach((z, i) => { z.scrollTop = scroll[i]; }); restoreFocus(key);
}
function showAtlasSettings() {
  callbacks.settings();
  $$('.settings-section').slice(1).forEach((section) => section.remove());
  $('[data-pref-toggle="shortcutHints"]')?.closest('.setting-row')?.remove();
}
function showAtlasData() {
  const p = countryPack(state.countryId);
  showModal(l('저장 데이터', 'Save data'), `<div data-i18n-control><h3>${h(p.name)} · ${l('절차 연습', 'Procedural practice')}</h3><p>${esc(saveLabel())}</p><p>${l('한국 기록과 국가별 연습을 함께 보관합니다. 해외 결과는 가상 규칙입니다.', 'Korean records and country exercises are stored together. Overseas outcomes are simulation rules.')}</p><div class="modal-actions">${button('atlasExportStored', l('저장된 기록 내보내기', 'Export stored'))}${button('atlasExportDraft', l('현재 입력 사본 내보내기', 'Export draft'))}${button('atlasImport', l('저장 파일 가져오기', 'Import save'))}</div></div>`);
  byId('atlasExportStored').onclick = exportSave;
  byId('atlasExportDraft').onclick = () => {
    const payload = collectPayload(); payload[atlas.ATLAS_KEY] = JSON.stringify(atlas.atlasSnapshot()); payload[atlas.COUNTRY_KEY] = state.countryId;
    downloadBlob('INAD_atlas_current_input.json', JSON.stringify(makeBundle(payload), null, 2));
  };
  byId('atlasImport').onclick = () => { ensureImportInput(); byId('sysImportFile').click(); };
}
function prepareOutcome() {
  const missing = atlas.atlasMissing();
  if (missing.length) { renderAtlas(); announceA11y(l('남은 문서·인터뷰·기록·메모·과업을 확인하세요.', 'Complete the outstanding document, interview, record, note and task checks.')); return; }
  const c = atlas.currentAtlasScenario(), v = atlas.activeAtlasCase();
  showModal(l('가상 결과 확인', 'Confirm simulated outcome'), `<div data-i18n-control><p>${esc(c.name)} · ${c.id}</p><p>${l('연습 기록을 완료합니다. 실제 법적 처분은 발생하지 않습니다.', 'Complete the exercise record. No legal disposition is made.')}</p><label for="atlasOutcome">${l('가상 결과', 'Simulated outcome')}</label><select id="atlasOutcome">${Object.entries(outcomes()).map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join('')}</select><label for="atlasRationale">${l('판단 근거와 남은 사항', 'Rationale and unresolved points')}</label><textarea id="atlasRationale" rows="5" maxlength="4000">${esc(v.notes)}</textarea><p id="atlasOutcomeError" role="alert"></p><div class="modal-actions">${button('atlasOutcomeCancel', l('취소', 'Cancel'), 'data-autofocus')}<button type="button" class="act primary" id="atlasConfirmOutcome">${l('연습 기록 완료', 'Complete exercise record')}</button></div></div>`);
  byId('atlasOutcomeCancel').onclick = closeModal;
  byId('atlasConfirmOutcome').onclick = () => { if (atlas.completeAtlas(byId('atlasOutcome').value, byId('atlasRationale').value)) { closeModal(); showTask('assessment'); $('.atlas-debrief')?.setAttribute('tabindex', '-1'); $('.atlas-debrief')?.focus(); } else byId('atlasOutcomeError').textContent = l('근거를 10자 이상 입력하고 필수 검토를 완료하세요.', 'Enter at least 10 characters of rationale and complete the required review.'); };
}
export function initAtlas(handlers) {
  callbacks = handlers;
  const header = document.createElement('header'); header.id = 'atlasHeader'; header.className = 'atlas-header'; header.hidden = true; header.setAttribute('data-i18n-control', ''); byId('app').prepend(header);
  const foot = document.createElement('footer'); foot.id = 'atlasFooter'; foot.className = 'atlas-footer'; foot.hidden = true; foot.setAttribute('data-i18n-control', ''); byId('app').append(foot);
  const start = document.createElement('button'); start.type = 'button'; start.id = 'atlasStartCountry'; start.className = 'start-settings atlas-country-entry'; start.textContent = l('국가 선택 · 한국 / 캐나다 / 영국 / 뉴질랜드', 'Choose country · South Korea / Canada / UK / New Zealand'); start.onclick = () => openCountrySelector(); $('.start-main').prepend(start);
  const menu = document.createElement('button'); menu.type = 'button'; menu.id = 'atlasMenuCountry'; menu.className = 'iconbtn'; menu.setAttribute('role', 'menuitem'); menu.textContent = l('국가 선택 · 대한민국', 'Country selection · South Korea'); menu.onclick = () => openCountrySelector(); byId('moreMenu').append(menu);
  for (const [view, label] of [['counter', l('대면 초점', 'Counter focus')], ['system', l('전산 초점', 'System focus')]]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'iconbtn'; b.setAttribute('role', 'menuitem'); b.dataset.atlasView = view; b.textContent = label; b.onclick = () => { atlas.setAtlasView(view); showTask(view === 'counter' ? 'interview' : 'evidence'); }; byId('moreMenu').append(b); }
  bus.on('atlas:changed', renderAtlas);
  // The storage event fires in other same-origin tabs, not in the writing tab.
  // Warn before a stale tab attempts to save; the engine also compares bytes on write.
  window.addEventListener('storage', (event) => {
    if (event.key !== atlas.ATLAS_KEY && event.key !== null) return;
    const changed = atlas.noteAtlasExternalWrite(event.key === null ? null : event.newValue);
    if (changed && state.countryId !== 'KR') announceA11y(l('다른 탭의 최신 저장이 감지되었습니다. 현재 입력을 별도 사본으로 내보내세요.', 'A newer save was detected in another tab. Export your current input separately.'));
  });
  document.addEventListener('inad:localechange', () => { if (state.countryId !== 'KR') renderAtlas(); });
  const selected = atlas.loadAtlas();
  if (!countryPack(selected)) { openCountrySelector(l('저장된 국가를 지원하지 않습니다. 기존 데이터를 보존했습니다. 국가를 직접 선택하세요.', 'The saved country is unsupported. Existing data is preserved. Choose a country explicitly.')); return; }
  if (selected !== 'KR') { atlas.selectCountry(selected); mountCountry(); renderAtlas(); showTask('evidence'); }
  else document.body.dataset.country = 'KR';
}

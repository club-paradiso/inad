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
function saveLabel() { return ({ saved: l('이 기기에 저장됨', 'Saved on this device'), failed: l('저장 실패 · 입력은 현재 화면에 유지됩니다', 'Save failed · input remains in this session'), protected: l('기존 저장 보호 중 · 현재 연습은 저장되지 않습니다', 'Existing save protected · this practice is not saved'), conflict: l('다른 탭에서 저장된 변경이 있어 덮어쓰기를 막았습니다 · 현재 입력 사본을 내보내세요', 'Another tab saved newer changes · this tab cannot overwrite them. Export a copy of your current input.'), idle: l('시작 전', 'Not started') })[state.atlas.saveStatus]; }
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
  showModal(l('국가와 업무 선택', 'Choose country and duty'), `<div class="atlas-setup" data-i18n-control><p>${l('국가별 업무 구조를 연습합니다. 해외 사건은 모두 합성 자료이며 실제 법률 판정 기능은 제공하지 않습니다.', 'Explore different work patterns. All overseas cases are synthetic; legal decision functionality is unavailable.')}</p>${error ? `<p role="alert">${esc(error)}</p>` : ''}<fieldset><legend>${l('국가', 'Country')}</legend><div class="atlas-country-list">${COUNTRY_IDS.map((id) => { const p = countryPack(id); return `<label><input type="radio" name="atlas-country" value="${id}" ${id === selected ? 'checked' : ''}><span><strong>${h(p.name)}</strong><span>${h(p.title)}</span><small>${h(p.status)}</small></span></label>`; }).join('')}</div></fieldset><div id="atlasPackDetail"></div><div class="atlas-settings"><label>${l('화면 언어', 'UI language')}<select id="atlasLocale"><option value="ko" ${getLocale() === 'ko' ? 'selected' : ''}>한국어</option><option value="en" ${getLocale() === 'en' ? 'selected' : ''}>English</option></select></label>${button('atlasAccessibility', l('접근성 설정', 'Accessibility settings'))}</div><p>${l('진행 중 사건은 국가별로 보관합니다. 한국의 현재 사건은 이 탭에서 복귀할 수 있으며, 새로고침하면 기존 체크포인트 규칙을 따릅니다.', 'Cases are kept separately by country. The current Korean case remains available in this tab; after reload, the existing checkpoint rules apply.')}</p><div class="modal-actions">${error ? '' : button('atlasCancel', l('취소', 'Cancel'))}<button type="button" class="act primary" id="atlasEnter">${l('선택한 업무로 이동', 'Open selected duty')}</button></div></div>`, { size: 'wide', dismissible: !error });
  const details = (id) => {
    const p = countryPack(id), s = state.atlas.sessions[id];
    byId('atlasPackDetail').innerHTML = `<h3>${h(p.name)} · ${h(p.title)}</h3><p>${h(p.description)}</p><p>${l('디자인 근거', 'Design evidence')}: ${esc(p.authenticity)} · ${p.sources.join(', ')}</p><p>${id === 'CA' ? l('IRCC의 기록 패턴 참고 · CBSA 공항 화면 복원 아님', 'IRCC record patterns inform the design; this is not a CBSA airport screen.') : id === 'GB' ? l('UKVI·HODS의 과업 패턴 참고 · Border Force 화면 복원 아님', 'UKVI and HODS inform task patterns; this is not a Border Force screen.') : id === 'NZ' ? l('INZ의 활동·기록 지침 참고 · ADEPT 직원 화면은 미확인', 'INZ activity and note guidance inform this design; ADEPT staff screens remain unverified.') : l('기존 한국 심사 흐름과 저장 데이터 유지', 'Existing Korean gameplay and save data are preserved.')}</p>${id === 'KR' ? `<p>${l('공항·난이도·인터뷰 언어는 기존 한국 모드에서 설정합니다.', 'Configure airport, difficulty and interview language in the existing Korean mode.')}</p>` : `<div class="atlas-settings"><label>${l('가상 근무지', 'Fictional duty station')}<select id="atlasAirport">${p.airports.map((a) => `<option value="${a.id}" ${a.id === s?.airportId ? 'selected' : ''}>${h(a.name)}</option>`).join('')}</select></label><label>${l('업무 모드', 'Duty mode')}<select id="atlasMode"><option value="simulation">${l('절차·증거 검토 연습', 'Procedure and evidence practice')}</option></select></label><label>${l('안내 수준', 'Guidance')}<select id="atlasDifficulty"><option value="guided">${l('안내 제공', 'Guided')}</option><option value="independent" ${s?.difficulty === 'independent' ? 'selected' : ''}>${l('자율 검토', 'Independent')}</option></select></label><label>${l('인터뷰 언어', 'Interview language')}<select id="atlasInterviewLanguage"><option value="en">English</option><option value="ko" ${s?.interviewLanguage === 'ko' ? 'selected' : ''}>한국어</option></select></label></div><p>${l('공항명은 가상 근무 맥락입니다. 실제 인력·업무량 수치는 사용하지 않습니다.', 'Airport names provide fictional context. No real staffing or workload figures are used.')}</p>`}`;
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
  return box(l('사람과 사건', 'Person and case'), `<p class="atlas-person">${esc(c.name)}</p><dl><dt>${l('대상 식별자', 'Person ID')}</dt><dd class="mono">${c.personId}</dd><dt>${l('현재 사건', 'Current case')}</dt><dd class="mono">${c.id}</dd><dt>${l('가상 근무지', 'Fictional station')}</dt><dd>${h(p.airports.find((a) => a.id === state.airportId)?.name)}</dd></dl><p>${h(c.brief)}</p><p class="atlas-muted">${l('모든 이름·식별자·서류는 합성 자료입니다.', 'All names, identifiers and documents are synthetic.')}</p>`) + box(l('연습 사건', 'Practice cases'), `<div class="atlas-case-list">${atlasScenarios(p.id).map((item) => button(`case-${item.id}`, `${item.id} · ${text(item.title)}${activeCompleted(item.id) ? ' · ' + l('완료', 'Complete') : ''}`, `data-case="${item.id}" aria-current="${item.id === c.id}"`)).join('')}</div>`) + (p.id === 'NZ' ? box(l('신청 맥락', 'Application context'), `<p>${l('배정된 활동의 근거를 검토합니다. 활동 완료가 신청 전체의 허가를 뜻하지 않습니다.', 'Review evidence for the assigned activity. Activity completion does not grant the whole application.')}</p>`) : '');
}
const activeCompleted = (id) => atlas.activeAtlasSession()?.cases[id]?.completed;
function interviewHTML(c, v) {
  const language = atlas.activeAtlasSession().interviewLanguage;
  return box(l('인터뷰 기록', 'Interview record'), `<p class="atlas-muted">${l('질문과 답변은 사전에 작성된 합성 대화입니다.', 'Questions and replies are authored synthetic dialogue.')}</p><div class="atlas-transcript" aria-label="${l('질문 기록', 'Transcript')}">${v.asked.length ? v.asked.map((id) => { const q = c.questions.find((q) => q.id === id); return `<div><b>${esc(q.q[language])}</b><p lang="${language}">${esc(q.answer[language])}</p></div>`; }).join('') : `<p>${l('아직 질문하지 않았습니다.', 'No questions asked yet.')}</p>`}</div><div class="atlas-questions">${c.questions.map((q) => button(`ask-${q.id}`, text(q.q), `data-ask="${q.id}" ${v.completed || v.asked.includes(q.id) ? 'disabled' : ''}`)).join('')}</div>`);
}
function taskHTML(c, v, title) {
  return box(title, ` ${atlas.activeAtlasSession().difficulty === 'guided' ? `<p class="atlas-muted">${l('연결 문서를 검토한 뒤 과업을 확인하세요. 자료 대조에는 진술이, 인계에는 메모가 필요합니다.', 'Review the linked document before checking a task. Evidence comparison needs a statement; handover needs a note.')}</p>` : ''}<p id="atlasTaskError" role="status"></p><ol class="atlas-tasks">${c.tasks.map((t, i) => `<li><div><b>${i + 1}. ${h(t.title)}</b><span>${v.tasks.includes(t.id) ? l('완료', 'Complete') : l('검토 필요', 'Review needed')}</span></div>${button(`task-link-${t.id}`, l('자료 열기', 'Open evidence'), `data-doc="${t.documentId}"`)}${button(`task-${t.id}`, l('확인 완료', 'Mark checked'), `data-check="${t.id}" ${v.completed || v.tasks.includes(t.id) ? 'disabled' : ''}`)}</li>`).join('')}</ol>`);
}
function recordsHTML(c, v) {
  const query = v.search.toLowerCase(), records = v.searched ? c.records.filter((r) => `${r.id} ${c.name} ${text(r.title)} ${text(r.detail)}`.toLowerCase().includes(query)) : [];
  return box(l('기록 조회', 'Record search'), `<form id="atlasSearchForm"><label for="atlasSearch">${l('이름·기록 번호·내용', 'Name, record ID or content')}</label><div class="atlas-search"><input id="atlasSearch" maxlength="120" value="${esc(v.search)}" autocomplete="off"><button class="act" type="submit">${l('조회', 'Search')}</button>${button('atlasResetSearch', l('초기화', 'Reset'))}</div></form><p role="status">${v.searched ? records.length ? `${records.length} ${l('건 · 합성 자료 조회', 'results · synthetic lookup')}` : l('일치하는 합성 기록이 없습니다. 조건을 지우고 다시 조회하세요.', 'No synthetic records match. Clear the search and try again.') : l('아직 조회하지 않았습니다. 빈 검색어로 현재 사건의 모든 기록을 볼 수 있습니다.', 'Not searched. An empty query returns all records for this case.')}</p>${records.length ? `<table><caption class="sr-only">${l('현재 사건의 합성 기록', 'Synthetic records for the current case')}</caption><thead><tr><th>${l('기록', 'Record')}</th><th>${l('내용', 'Content')}</th><th>${l('상태', 'State')}</th></tr></thead><tbody>${records.map((r) => `<tr class="${v.selectedRecord === r.id ? 'selected' : ''}"><th scope="row">${button(`record-${r.id}`, text(r.title), `data-record="${r.id}"`)}<small class="mono">${r.id}</small></th><td>${h(r.detail)}</td><td>${v.selectedRecord === r.id ? l('선택됨', 'Selected') : l('미선택', 'Not selected')}</td></tr>`).join('')}</tbody></table>` : ''}`);
}
function documentsHTML(c, v) {
  const d = c.documents.find((d) => d.id === v.selectedDoc), page = v.pages[d.id];
  return box(l('문서 검토', 'Document review'), `<div class="atlas-doc-tabs">${c.documents.map((doc) => button(`doc-${doc.id}`, text(doc.title), `data-doc="${doc.id}" aria-pressed="${doc.id === d.id}"`)).join('')}</div><div class="atlas-doc-tools">${button('atlasPrevPage', l('이전 쪽', 'Previous page'), page === 0 ? 'disabled' : '')}<span>${page + 1} / ${d.pages.length}</span>${button('atlasNextPage', l('다음 쪽', 'Next page'), page === d.pages.length - 1 ? 'disabled' : '')}<label>${l('확대', 'Zoom')}<select id="atlasZoom">${[100, 125, 150].map((z) => `<option ${z === v.zoom ? 'selected' : ''} value="${z}">${z}%</option>`).join('')}</select></label></div><article class="atlas-document" style="font-size:${v.zoom}%" aria-label="${h(d.title)}"><small>${l('가상 문서 · 원문 대조 연습', 'Synthetic document · source comparison exercise')}</small><h3>${h(d.title)}</h3><p class="mono">${d.id}</p><p>${h(d.pages[page])}</p></article><div class="atlas-row"><span>${v.reviewed.includes(d.id) ? l('검토 기록됨', 'Review recorded') : l('미검토', 'Not reviewed')}</span>${button('atlasReviewDoc', l('검토한 자료로 기록', 'Record as reviewed'), v.completed || v.reviewed.includes(d.id) ? 'disabled' : '')}</div>`);
}
function assessmentHTML(c, v) {
  const crossCheckNote = v.asked.includes('crosscheck')
    ? l('추가 원문 교차 질문 확인됨', 'Case-specific source cross-check completed')
    : l('선택 심화 과제: 인터뷰의 추가 교차 질문으로 원문 식별자와 날짜를 다시 확인할 수 있습니다.', 'Optional deeper task: ask the additional cross-check question to compare source identifiers and dates.');
  const missing = atlas.atlasMissing(), names = { documents: l('문서 검토', 'Document review'), interview: l('인터뷰', 'Interview'), record: l('기록 선택', 'Record selection'), notes: l('검토 메모 10자 이상', 'Review note of at least 10 characters'), tasks: l('과업 확인', 'Task checks') };
  return box(l('검토 메모', 'Review notes'), `<label for="atlasNotes">${l('확인한 사실 · 근거 · 미확인 사항 · 다음 행동', 'Facts · evidence · unresolved points · next action')}</label><textarea id="atlasNotes" maxlength="4000" rows="7" ${v.completed ? 'readonly' : ''}>${esc(v.notes)}</textarea><p id="atlasSaveStatus" role="status">${esc(saveLabel())}</p>${button('atlasSaveRetry', l('저장 다시 시도', 'Retry save'))}`) + box(l('결과 준비', 'Outcome preparation'), `<p>${v.reviewed.length}/${c.documents.length} ${l('자료 검토', 'documents reviewed')} · ${v.tasks.length}/${c.tasks.length} ${l('과업 완료', 'tasks checked')}</p><p class="atlas-muted">${esc(crossCheckNote)}</p>${missing.length ? `<p>${l('남은 검토', 'Still to review')}</p><ul>${missing.map((k) => `<li>${names[k]}</li>`).join('')}</ul>` : `<p>${l('가상 결과를 검토할 수 있습니다.', 'Ready to review a simulated outcome.')}</p>`}${v.completed ? `<div class="atlas-debrief"><h3>${l('연습 결과', 'Debrief')}: ${outcomes()[v.outcome]}</h3><p>${v.outcome === c.expectedOutcome ? l('이 연습의 근거와 일치합니다.', 'Matches the evidence in this exercise.') : l('선택한 결과와 아래 근거를 다시 비교하세요.', 'Compare your selected outcome with the evidence below.')}</p><p>${h(c.debrief)}</p><p>${esc(v.rationale)}</p><p>${l('기록한 근거와 문서는 계속 열람할 수 있습니다.', 'Your rationale and evidence remain available for review.')}</p></div>` : `<button type="button" class="act primary" id="atlasPrepare">${l('가상 결과 검토', 'Review simulated outcome')}</button>`}<p class="atlas-muted">${l('가상 규칙 · 실제 입국허가·비자 발급·불허 처분이 아닙니다.', 'Simulation rules · not permission to enter, a visa grant or a refusal.')}</p>`);
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
  $('.zone-evidence').innerHTML = p.id === 'CA' ? recordsHTML(c, v) + documentsHTML(c, v) + tasks : p.id === 'GB' ? tasks + documentsHTML(c, v) + `<details class="atlas-history"><summary>${l('사건 이력과 기록', 'Case history and records')}</summary>${recordsHTML(c, v)}</details>` : `<div class="atlas-activity-context"><b>${l('현재 신청의 배정 활동', 'Assigned activities in this application')}</b><p>${l('자료 연결 → 확인 → 미확인 사항 인계', 'Link evidence → verify → hand over unresolved points')}</p></div>` + tasks + recordsHTML(c, v) + documentsHTML(c, v);
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
  showModal(l('저장 데이터', 'Save data'), `<div data-i18n-control><h3>${h(p.name)} · ${l('절차 연습', 'Procedural practice')}</h3><p>${esc(saveLabel())}</p><p>${l('기존 한국 기록과 국가별 연습 기록을 같은 파일로 옮길 수 있습니다. 해외 결과는 가상 규칙이며 한국 법률 기준을 적용하지 않습니다.', 'The same file carries Korean records and separate country exercises. Overseas outcomes use simulation rules; the Korean legal baseline does not apply.')}</p><div class="modal-actions">${button('atlasExportStored', l('기기에 저장된 기록 내보내기', 'Export stored records'))}${button('atlasExportDraft', l('현재 입력 포함 사본 내보내기', 'Export copy including current input'))}${button('atlasImport', l('저장 파일 가져오기', 'Import save file'))}</div><p>${l('현재 입력 사본은 이 탭의 해외 연습을 포함합니다. 기기의 원본은 변경하지 않습니다. 보호 중인 미래 버전 원본은 저장된 기록 내보내기로 별도 보관하세요.', 'The current-input copy includes overseas practice in this tab without changing storage. Export stored records separately to retain any protected future-version original.')}</p></div>`);
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

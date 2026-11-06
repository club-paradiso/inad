// CENTER column · document stack and paper-like document renderers.
import { $, $$, byId, esc, markOverflow } from './dom.js';
import { state } from '../state.js';
import { current, screeningNo } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { docIcon, uiIcon } from './icons.js';
import { documentReviewPlan } from '../engines/review-guidance.js';
import { availableCompareSources, comparisonSummary } from '../engines/comparison-ledger.js';
import { openWorkGuide } from '../services/work-manual.js';
import { refreshStatementLockCandidates } from './statement-lock.js';
import { returnItineraryFor } from '../engines/return-itinerary-engine.js';
import { documentFields, documentNameOnRecord, documentRecordKind, documentIsRequestable, documentDisplayStatus, biometricDisplay } from '../engines/document-evidence-model.js';

export function docFieldMap(d) { const m = {}; (d.fields || []).forEach((r) => { m[r[0]] = r[1]; }); return m; }
export function docFieldRows(d, limit = Infinity) {
  return (d.fields || []).slice(0, limit).map((r, i) =>
    `<div class="doc-field ${i === 0 ? 'wide' : ''}" data-doc-key="${esc(d.k)}" data-field-name="${esc(r[0])}" data-field-val="${esc(r[1])}">
      <span class="field-label">${esc(r[0])}</span><span class="field-value" title="${esc(r[1])}">${esc(r[1])}</span>
      <button type="button" class="doc-compare-btn" aria-label="${esc(r[0])} 항목을 진술과 대조" title="진술과 대조" ${state.ended ? 'disabled' : ''}>⇄</button>
    </div>`).join('');
}
export function simMrz(t, c, d = null) { const fields = documentFields(d); const code = (t.nationality.code || c.code || 'XXX').slice(0, 3).padEnd(3, 'X'); const nm = (documentNameOnRecord(d) || 'UNRECORDED').toUpperCase().replace(/[^A-Z ]/g, '').replace(/ +/g, '<').replace(' ', '<<'); const l1 = ('P<' + code + nm).padEnd(44, '<').slice(0, 44); const sex = (t.passport.sex || c.sex || 'X').slice(0, 1); const dob = (t.passport.birthDate || c.dob || '1990-01-01').replaceAll('-', '').slice(2); const exp = (fields['만료일'] || '0000-00-00').replaceAll('-', '').slice(2); const l2 = ((fields['여권번호'] || 'UNRECORDED').replace(/\s/g, '') + '<' + code + dob + sex + exp).padEnd(44, '<').slice(0, 44); return [l1, l2]; }
export function flightRoute(c, d) { const fm = docFieldMap(d); const raw = fm['입국편'] || fm['입국'] || fm['편명'] || c.arrival || ''; const source = (c.arrival || '').match(/([A-Z]{3})\s*→\s*([A-Z]{3})/); return { flight: (raw.match(/[A-Z]{1,3}\d{2,4}/) || [raw.split(' · ')[0] || 'FLIGHT'])[0], from: source ? source[1] : 'ORG', to: source ? source[2] : 'ICN' }; }

function renderBookingDocument(d, c, t) {
  const fr = flightRoute(c, d);
  const e = returnItineraryFor(c);
  const onward = d.k === 'PNR' ? `<div class="ticket-return-overview" data-return-status="${esc(e.status)}">
    <div class="ticket-return-head"><b>귀국·후속 이동 예약</b><span>${esc(e.statusLabel)}</span></div>
    ${e.flight ? `<div class="ticket-return-route"><span>ICN</span><span class="ticket-return-arrow" aria-hidden="true">→</span><span>${esc(e.destination || '목적지 확인 필요')}</span><strong>${esc(e.flight)}</strong></div>` : `<p>${esc(e.statusLabel)} · 승객에게 증빙을 요청할 수 있습니다.</p>`}
    <small>PNR 예약정보와 발권된 전자항공권은 서로 다른 증빙입니다.</small>
  </div>` : '';
  return `<div class="docsheet doc-ticket${d.alert ? ' alert' : ''}">
    <div class="ticket-main"><div class="ticket-airline"><div><span class="micro">ARRIVAL ITINERARY / RESERVATION</span><br><b>${esc(c.carrier || 'AIRLINE')}</b></div><span class="micro">${esc(d.k)}</span></div>
    <div class="ticket-route"><div class="airport">${esc(fr.from)}</div><div class="route-line"></div><div class="airport">${esc(fr.to)}</div></div>
    <div class="ticket-meta">${(d.fields || []).map(([label, value]) =>
      `<div class="doc-field" data-doc-key="${esc(d.k)}" data-field-name="${esc(label)}" data-field-val="${esc(value)}"><span class="field-label">${esc(label)}</span><div class="field-value">${esc(value)}</div><button type="button" class="doc-compare-btn" aria-label="${esc(label)} 항목을 진술과 대조" title="진술과 대조" ${state.ended ? 'disabled' : ''}>⇄</button></div>`).join('')}</div>
    ${onward}</div><div class="ticket-stub"><div><small>ARRIVAL FLIGHT</small><br><b>${esc(fr.flight)}</b></div><div class="barcode" aria-hidden="true"></div><small>${esc(t.name.latin)}<br>${screeningNo()}</small></div>
  </div>`;
}

function renderReturnEvidencePanel(c) {
  const proof = returnItineraryFor(c, { looked: state.looked });
  const requested = state.performed.includes('DOC_REQUEST_RETURN');
  const disabled = (requested || state.ended) ? ' disabled' : '';
  const status = requested ? proof.statusLabel : tUI('승객에게 요청 전', 'Not yet requested');
  let result = '';
  if (requested) {
    if (proof.presentable) {
      result = `<div class="return-proof-paper" aria-label="${esc(proof.title)}" data-return-proof="${esc(proof.status)}">
        <div class="return-proof-top"><span>${esc(proof.title)}</span><span class="return-proof-stamp">${esc(proof.statusLabel)}</span></div>
        <div class="return-proof-flight"><span>ICN</span><span class="return-proof-arrow" aria-hidden="true">→</span><span>${esc(proof.destination || tUI('도착지 확인 필요', 'Destination unconfirmed'))}</span>
          <strong>${esc(proof.flight || tUI('편명 미확인', 'Flight unknown'))}</strong></div>
        <dl class="return-proof-fields">${proof.rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
        <p class="return-proof-disclaimer">${tUI('승객 제출본 · 진위 및 발권 상태는 별도의 전산 대조로 확인하세요. 항공권 소지 여부만으로 처분하지 마세요.', 'Passenger-provided record. Verify issuance with the system. Ticket possession alone does not determine admission.')}</p>
      </div>`;
    } else {
      result = `<div class="return-proof-unavailable" data-return-proof="${esc(proof.status)}" role="status">
        ${esc(proof.response)}
        ${proof.agency ? `<p>${tUI('항공 PNR을 조회하면 단체예약자료를 추가 확인할 수 있습니다.', 'Check the airline PNR to verify the group booking.')}</p>` : ''}
      </div>`;
    }
  }
  return `<section class="return-evidence-panel" aria-label="${tUI('귀국·후속 이동 증빙 제출', 'Return or onward travel document request')}">
    <div class="return-evidence-copy"><b>${tUI('귀국·후속 이동 서류', 'Return / onward travel evidence')}</b>
      <small>${esc(status)}</small>
      <p>${tUI('필요하면 승객에게 전자항공권 또는 예약확인서를 직접 요청하세요. 예약확정과 발권완료는 다릅니다.', 'Ask for an e-ticket or booking confirmation. A reservation is not an issued ticket.')}</p>
    </div>
    <button type="button" id="requestReturnDocument" class="return-request-btn"${disabled}>${requested ? tUI('서류 요청 기록됨', 'Request recorded') : tUI('귀국편 서류 요청', 'Request travel document')}</button>
    ${result}
  </section>`;
}

export function documentHTML(d, c, t, pp) {
  const k = d.k, fm = docFieldMap(d), cls = d.alert ? ' alert' : '';
  if (k === 'PASSPORT') { const mrz = simMrz(pp, c, d); return `<div class="docsheet doc-passport${cls}"><div class="passport-head"><div><div class="micro">TRAVEL DOCUMENT · SIMULATION</div><div class="passport-country">${esc(fm['국적'] || '국적 미기재')}</div></div><div class="passport-kind"><b>PASSPORT</b><span class="micro">${esc(t.nationality.code)} · ${esc(t.passport.type || '일반여권')}</span></div></div><div class="passport-main"><div class="passport-photo-wrap"><img class="passport-photo" src="${pp.portrait}" alt="여권 사진"></div><div class="passport-fields"><div class="passport-name"><span class="field-label">Name / 서류상 성명</span><div class="field-value">${esc(documentNameOnRecord(d) || '성명 미기재')}</div></div><div class="doc-grid-fields">${docFieldRows(d)}</div></div></div><div class="mrz" aria-label="게임용 재구성 MRZ, 유효성 판정 불가">${esc(mrz[0])}<br>${esc(mrz[1])}</div><p class="doc-footnote">게임용 MRZ 재구성 · 원본 진위·체크디지트 검증과 무관</p></div>`; }
  if (k === 'E-ARRIVAL') return `<div class="docsheet doc-earrival${cls}"><div class="ea-head"><div><b>전자입국신고</b><div class="ea-sub">e-Arrival Card · Republic of Korea</div></div><span>${screeningNo()}</span></div><div class="ea-body"><div><div class="ea-status">${esc(documentDisplayStatus(d))}</div><div class="doc-grid-fields">${docFieldRows(d)}</div></div><div><div class="fake-qr" aria-hidden="true"></div><div class="ea-ref">SIMULATION · ${screeningNo()}</div></div></div></div>`;
  if (k === 'PNR' || k === 'BOARDING') return renderBookingDocument(d, c, t);
  if (k === 'HOTEL' || k === 'STAY') {
    const isStay = k === 'STAY';
    const place = fm['호텔'] || fm['숙소'] || fm['체류지'] || fm['주소'] ||
      (isStay ? '거소 주소 미기재' : '숙박시설 명칭 미기재');
    return `<div class="docsheet doc-hotel${cls}"><div class="hotel-visual"><b>${isStay ? '국내 거소자료' : '숙박 예약자료'}</b></div><div class="hotel-body"><span class="micro">${isStay ? 'RESIDENCE / STAY RECORD · SIMULATION' : 'ACCOMMODATION RECORD · SIMULATION'}</span><h3>${esc(place)}</h3><div class="hotel-status">${esc(documentDisplayStatus(d))}</div><div class="doc-grid-fields">${docFieldRows(d)}</div></div></div>`;
  }
  if (k === 'VISA' || k === 'ENTRY BASIS') return `<div class="docsheet doc-visa${cls}"><div class="visa-frame"><div class="visa-side"><div class="vmark">KOR</div><span class="micro">${k === 'VISA' ? 'VISA RECORD · SIMULATION' : 'ENTRY BASIS SUMMARY · NOT A VISA'}</span><br><b>${esc(k === 'VISA' ? '사증' : '입국자격')}</b></div><div class="visa-body"><div class="visa-valid">${esc(documentDisplayStatus(d))}</div><span class="micro">REPUBLIC OF KOREA · SIMULATION</span><div class="visa-title">${esc(fm['체류자격'] || fm['사증'] || fm['구분'] || c.basis || d.t)}</div><div class="doc-grid-fields">${docFieldRows(d)}</div></div></div></div>`;
  if (k === 'RESIDENCE CARD' || k === 'ABTC') return `<div class="docsheet doc-idcard${cls}"><div><img class="id-photo" src="${pp.portrait}" alt="신분증 사진"><div class="id-chip" aria-hidden="true"></div><span class="micro">SIMULATION ID</span></div><div><div class="id-head">${esc(d.t)}</div><div class="passport-name"><span class="field-label">서류상 성명</span><div class="field-value">${esc(documentNameOnRecord(d) || '성명란 미기재 · 별도 대조 필요')}</div></div><div class="doc-grid-fields">${docFieldRows(d)}</div></div></div>`;
  if (k === 'BIOMETRIC') {
    const result = biometricDisplay(d);
    return `<div class="docsheet doc-biometric${cls}"><span class="micro">BIOMETRIC RECORD · SIMULATION</span><h3>생체정보 본인확인 기록</h3><div class="biometric-doc-pair"><img src="${pp.portrait}" alt="게임용 여권 이미지 참고"><div class="biometric-doc-score ${result.mismatch || result.refused ? 'bad' : ''}">${esc(result.label)}<br>${esc(result.face || '수치 미기재')}</div><img src="${t.portrait}" alt="게임용 승객 이미지 참고"></div><div class="doc-grid-fields">${docFieldRows(d)}</div><p class="doc-footnote">${esc(result.note)}</p></div>`;
  }
  if (k === 'WATCHLIST') return `<div class="docsheet doc-watch${cls}"><div class="watch-banner"><div class="watch-symbol"><span>${d.alert ? '!' : '✓'}</span></div>${d.alert ? '규제정보 추가 확인 필요' : '규제정보 조회 완료'}</div><div class="doc-grid-fields">${docFieldRows(d)}</div><p class="doc-footnote">본 화면은 게임용 가상 조회 결과이며 실제 비공개 규제코드를 재현하지 않습니다.</p></div>`;
  return `<div class="docsheet doc-letter${cls}"><div class="letter-head"><div><span class="micro">SUPPORTING DOCUMENT · ${esc(k)}</span><br><b>${esc(d.t)}</b></div><div class="letter-seal" aria-hidden="true">SIM</div></div><div class="letter-body"><p>입국심사를 위해 제출된 보조자료입니다. 진술 및 전산조회 결과와 교차검증하십시오.</p><div class="doc-grid-fields">${docFieldRows(d)}</div></div></div>`;
}

const isEn = () => document.documentElement.lang === 'en' || document.documentElement.dataset.locale === 'en';
const tUI = (ko, en) => isEn() ? en : ko;

// Review marks are user annotations, not automatic authenticity checks, statutory findings or verdict inputs.
// Transient input only; the actual comparison ledger is stored case-locally by the engine.
let comparisonDraft = { owner: null, docIndex: -1, sourceId: '', note: '' };
// Existing case-file documents stay inspectable; this is a real, optional passenger
// re-presentation action. Internal lookups and synthetic summaries are never handed
// over by the traveler.
function renderDocumentRequestPanel(doc, index) {
  if (!documentIsRequestable(doc)) {
    return `<div class="doc-origin-note">${documentRecordKind(doc) === 'internal' ?
      '기관 내부 조회 결과입니다. 승객에게 제출을 요청하는 서류가 아닙니다.' :
      '게임 내 입국근거 요약입니다. 별도의 공식 발급 문서로 간주하지 마세요.'}</div>`;
  }
  const asked = state.performed.includes('DOC_REQUEST_' + index);
  return `<section class="doc-request-panel" aria-label="서류 재제시 요청"><div><b>${asked ? '재제시 요청 기록됨' : '제시 서류 확인'}</b><p id="docRequestStatus" role="status" tabindex="-1">${asked ? '승객에게 다시 제시하도록 요청했습니다. 대화 기록과 서류 내용을 대조하세요.' :
    '서류가 사건자료에 표시되어 있어도 승객에게 직접 다시 제시하도록 요청할 수 있습니다.'}</p></div><button type="button" id="docRequestOriginal" ${asked || state.ended ? 'disabled' : ''}>${asked ? '요청 완료' : '승객에게 서류 제시 요청'}</button></section>`;
}

export function renderDocs({ onSelect, onZoom, onReview, onCompare, onRequestReturn, onRequestDocument }) {
  const c = current(), traveler = getTraveler(c.travelerId);
  const reviews = state.documentReviews || {};
  const tally = Object.values(reviews).filter((s) => s === 'reviewed' || s === 'followup').length;
  byId('doclist').innerHTML = c.docs.map((d, i) => {
    const status = reviews[i];
    // Review state is recorded automatically (P1): opening a document logs the viewing, opening
    // the enlarged view logs an enlarged review, not evidence corroboration.
    const opened = state.performed.includes('DOC_READ_' + i);
    const statusLabel = status === 'reviewed' ? tUI('확대 검토', 'Enlarged review') : status === 'followup' ? tUI('후속 확인', 'Follow-up') : opened ? tUI('열람됨', 'Opened') : tUI('미열람', 'Not opened');
    return `<button type="button" class="docitem ${i === state.selectedDoc ? 'on' : ''} ${d.alert ? 'alert' : ''} ${status ? 'doc-review-' + status : ''}" data-i="${i}" aria-pressed="${i === state.selectedDoc}"><span class="docico" aria-hidden="true">${docIcon(d.k)}</span><span class="doctext"><strong>${esc(d.t)}</strong><small><span class="doc-code">${esc(d.k)}</span>${d.alert ? '<em class="doc-flag">추가 확인</em>' : ''}<span class="doc-review-tag">${esc(statusLabel)}</span></small></span></button>`;
  }).join('');
  $$('.docitem').forEach((b) => { b.onclick = () => onSelect(+b.dataset.i); });
  markOverflow(byId('doclist'));

  const d = c.docs[state.selectedDoc]; if (!d) return;
  const pp = getTraveler(c.passportPortraitId || c.travelerId);
  const plan = documentReviewPlan(d);
  const status = reviews[state.selectedDoc] || 'unreviewed';
  const openedSel = state.performed.includes('DOC_READ_' + state.selectedDoc);
  const statusLabel = status === 'reviewed' ? tUI('확대 검토 기록됨 · 진위 확정 아님', 'Enlarged review recorded · not authenticated') : status === 'followup' ? tUI('추가 확인 필요로 표시됨', 'Flagged for follow-up') : openedSel ? tUI('열람 기록됨 · 확대 검토는 별도 기록', 'Opened · enlarge to record a review') : tUI('아직 열람하지 않음', 'Not opened yet');
  const sources = availableCompareSources(state), summary = comparisonSummary(state);
  if (comparisonDraft.owner !== state.comparisonNotes || comparisonDraft.docIndex !== state.selectedDoc) {
    comparisonDraft = { owner: state.comparisonNotes, docIndex: state.selectedDoc, sourceId: sources[0]?.id || '', note: '' };
  }
  if (!sources.some((source) => source.id === comparisonDraft.sourceId)) comparisonDraft.sourceId = sources[0]?.id || '';
  const selectedSource = sources.find((source) => source.id === comparisonDraft.sourceId);
  const selectedKey = state.selectedDoc + '|' + comparisonDraft.sourceId;
  const savedComparison = (state.comparisonNotes || {})[selectedKey];
  const openComparison = byId('crossPanel')?.open || false;
  const docComparisons = Object.values(state.comparisonNotes || {}).filter((row) => row.docIndex === state.selectedDoc);
  const disabled = state.ended ? ' disabled' : '';
  const active = (key) => status === key ? ' aria-pressed="true"' : ' aria-pressed="false"';
  byId('docview').innerHTML = `<div class="doc-review-overview"><b>${esc(tUI('서류 검토 기록', 'Document review log'))} ${tally}/${c.docs.length}</b><span>${esc(tUI('열람·확대 검토 기록 · 진위 미확정', 'Opening and enlarged review logged · not authenticated'))}${summary.followup ? ' · ' + esc(tUI('미확인 대조 ' + summary.followup + '건', summary.followup + ' cross-check(s) need follow-up')) : ''}</span></div>
  <div class="doc-stage"><div class="doc-toolbar"><div class="doc-toolbar-left"><span class="doc-type-badge">${esc(d.k)}</span><span class="doc-validity review-pending ${d.alert ? 'alert' : ''}" data-record-kind="${esc(documentRecordKind(d))}">${esc(documentRecordKind(d) === 'internal' ? '기관 내부 기록 · 검토 필요' : documentRecordKind(d) === 'summary' ? '입국근거 요약 · 공식 증명서 아님' : '제출 자료 · 진위 미확인')}</span></div><div class="doc-toolbar-actions"><button type="button" class="doc-zoom" id="docGuideQuickBtn">${tUI('업무지침', 'Work guide')}</button><button type="button" class="doc-zoom" id="docZoom">${uiIcon('zoom')} ${tUI('확대', 'Enlarge')}</button></div></div>${documentHTML(d, c, traveler, pp)}</div>
  ${renderReturnEvidencePanel(c)}
  ${renderDocumentRequestPanel(d, state.selectedDoc)}
  <section class="doc-review-panel" aria-label="${tUI('서류 검토 체크리스트', 'Document review checklist')}">
    <div class="doc-review-heading"><div><h3>${tUI('무엇을 확인해야 하나요?', 'What should I check?')}</h3><span>${esc(statusLabel)}</span></div><button type="button" id="docGuideBtn">${tUI('관련 업무지침', 'Relevant work guide')}</button></div>
    <ol class="doc-review-checks">${plan.checks.map((step) => `<li>${esc(isEn() ? step.en : step.ko)}</li>`).join('')}</ol>
    <p class="doc-review-note">${tUI('서류 열람·확대 검토만 기록됩니다. 진술·전산 대조 결과는 아래에서 별도 기록하며, 진위가 자동 판정되지는 않습니다.', 'Opening and enlarged review are logged. Cross-checks require separate records below; authenticity is never auto-judged.')}</p>
    <div class="doc-review-actions" role="group" aria-label="${tUI('서류 후속 확인 표시', 'Flag document for follow-up')}">
      <button type="button" id="docReviewFollowup" data-review="${status === 'followup' ? 'unreviewed' : 'followup'}"${active('followup')}${disabled}>${status === 'followup' ? tUI('추가 확인 표시 취소', 'Clear follow-up flag') : tUI('추가 확인 필요로 표시', 'Flag for follow-up')}</button>
    </div>
  </section>
  <details class="cross-panel" id="crossPanel"${openComparison ? ' open' : ''}>
    <summary>${tUI('진술·서류·조회 결과 대조', 'Compare statements, documents and records')} <small>${summary.total ? esc(tUI('기록 ' + summary.total + '건 · 미확인 ' + summary.followup + '건', summary.total + ' notes · ' + summary.followup + ' need follow-up')) : tUI('직접 비교하고 기록하기', 'Review and annotate')}</small></summary>
    <div class="cross-panel-body">
      <p class="doc-review-note">${tUI('승객이 실제로 말한 내용과 이미 실행한 조회 결과만 표시합니다. 자료 간 차이를 자동으로 범죄·위조 또는 입국불허 사유로 판정하지 않습니다.', 'Only actual passenger statements and completed lookups appear here. Differences are not automatically treated as fraud, an offense or grounds for refusal.')}</p>
      <label class="cross-source-label" for="crossSource">${tUI('현재 서류와 비교할 자료', 'Source to compare with this document')}
        <select id="crossSource"${sources.length ? '' : ' disabled'}>${sources.map((item) => `<option value="${esc(item.id)}"${item.id === comparisonDraft.sourceId ? ' selected' : ''}>${esc(isEn() ? item.en : item.ko)}</option>`).join('')}</select>
      </label>
      <div class="cross-pair">
        <div class="cross-column"><strong>${esc(tUI('제출서류', 'Submitted document'))} · ${esc(d.t)}</strong><dl>${(d.fields || []).slice(0, 7).map((item) => `<div><dt>${esc(item[0])}</dt><dd>${esc(item[1])}</dd></div>`).join('')}</dl></div>
        <div class="cross-column"><strong id="crossSourceName">${selectedSource ? esc(isEn() ? selectedSource.en : selectedSource.ko) : tUI('아직 확인된 진술·조회가 없습니다', 'No recorded statement or lookup yet')}</strong><p id="crossSourceText">${esc(selectedSource?.text || tUI('먼저 인터뷰 또는 전산 조회를 진행하세요.', 'Ask a question or perform a lookup first.'))}</p></div>
      </div>
      <label class="cross-note-label" for="crossNote">${tUI('대조 메모 (선택)', 'Comparison note (optional)')}
        <textarea id="crossNote" maxlength="240" rows="2" placeholder="${tUI('어떤 정보가 일치하거나 추가 확인이 필요한지 기록', 'Record the point to check or reconcile')}">${esc(comparisonDraft.note || savedComparison?.note || '')}</textarea>
      </label>
      <div class="doc-review-actions cross-actions" role="group" aria-label="${tUI('대조 결과 메모', 'Record comparison result')}">
        <button type="button" data-compare="checked"${savedComparison?.status === 'checked' ? ' aria-pressed="true"' : ' aria-pressed="false"'}${disabled || (!selectedSource ? ' disabled' : '')}>${tUI('대조 확인 기록', 'Record review')}</button>
        <button type="button" data-compare="followup"${savedComparison?.status === 'followup' ? ' aria-pressed="true"' : ' aria-pressed="false"'}${disabled || (!selectedSource ? ' disabled' : '')}>${tUI('미확인으로 기록', 'Mark unresolved')}</button>
        <button type="button" data-compare="clear"${disabled || (!savedComparison ? ' disabled' : '')}>${tUI('대조 기록 삭제', 'Delete comparison note')}</button>
      </div>
      <div class="cross-existing" aria-live="polite"><strong>${tUI('이 서류의 대조 기록', 'Comparison notes for this document')} · ${docComparisons.length}</strong>
        ${docComparisons.length ? `<ul>${docComparisons.map((item) => {
          const ref = sources.find((source) => source.id === item.sourceId);
          return `<li><b>${item.status === 'followup' ? tUI('미확인', 'Unresolved') : tUI('대조 기록', 'Reviewed')}</b><span>${esc(ref ? isEn() ? ref.en : ref.ko : item.sourceId)}</span>${item.note ? `<p>${esc(item.note)}</p>` : ''}</li>`;
        }).join('')}</ul>` : `<p>${tUI('기록된 비교가 없습니다.', 'No comparisons recorded.')}</p>`}
      </div>
    </div>
  </details>`;
  byId('docZoom').onclick = () => onZoom(d, documentHTML(d, c, traveler, pp), state.selectedDoc);
  const requestBtn = byId('docRequestOriginal');
  if (requestBtn) requestBtn.onclick = () => onRequestDocument?.(state.selectedDoc);
  byId('requestReturnDocument').onclick = () => onRequestReturn?.();
  byId('docGuideBtn').onclick = () => openWorkGuide(plan.guideId);
  byId('docGuideQuickBtn').onclick = () => openWorkGuide(plan.guideId);
  const sourceSelect = byId('crossSource'), noteArea = byId('crossNote');
  if (sourceSelect) sourceSelect.onchange = () => {
    comparisonDraft.sourceId = sourceSelect.value;
    const source = sources.find((item) => item.id === sourceSelect.value);
    const old = (state.comparisonNotes || {})[state.selectedDoc + '|' + sourceSelect.value];
    comparisonDraft.note = old?.note || '';
    byId('crossSourceName').textContent = source ? isEn() ? source.en : source.ko : '';
    byId('crossSourceText').textContent = source?.text || '';
    noteArea.value = comparisonDraft.note;
    $$('#crossPanel [data-compare]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.compare === old?.status));
      if (b.dataset.compare === 'clear') b.disabled = !old || state.ended;
    });
  };
  if (noteArea) noteArea.oninput = () => { comparisonDraft.note = noteArea.value; };
  $$('#crossPanel [data-compare]').forEach((b) => { b.onclick = () => {
    if (!comparisonDraft.sourceId || !onCompare) return;
    onCompare(state.selectedDoc, comparisonDraft.sourceId, b.dataset.compare, noteArea?.value || '');
    if (b.dataset.compare === 'clear') comparisonDraft.note = '';
  }; });
  $$('#docview [data-review]').forEach((b) => { b.onclick = () => onReview(state.selectedDoc, b.dataset.review); });
  refreshStatementLockCandidates();
}
export function focusSelectedDoc() { const item = $$('#doclist .docitem')[state.selectedDoc]; if (item) item.focus(); }

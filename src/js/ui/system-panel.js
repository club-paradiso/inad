// RIGHT column · biometrics / entry-basis tools, system lookups terminal; CENTER · requirement matrix and clue board.
import { $, byId, esc, fmtClock } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { evidenceNow, readiness, ACTION_NAMES } from '../engines/legal-engine.js';
import { clueStats } from '../engines/clue-engine.js';
import { lookupName } from '../engines/case-engine.js';
import { classifyEntryBasis, ketaStatus, arrivalDeclarationStatus } from '../engines/decision-model.js';
import { renderBasisPanel } from './decision-basis.js';

export function bioInfo(c) { const raw = parseFloat((c.bio.match(/[0-9]+(?:\.[0-9]+)?/) || ['99.0'])[0]); return { raw, bad: raw < 85 || /불일치|오류/.test(c.bio), label: isNaN(raw) ? '—' : raw.toFixed(1) + '%' }; }

export function renderEntry() {
  const c = current(), t = getTraveler(c.travelerId), pp = getTraveler(c.passportPortraitId || c.travelerId); const b = bioInfo(c);
  const basis = classifyEntryBasis(c), keta = ketaStatus(c), decl = arrivalDeclarationStatus(c);
  const earr = (c.docs || []).find((d) => d.k === 'E-ARRIVAL'); const fm = {}; (earr?.fields || []).forEach((r) => { fm[r[0]] = r[1]; });
  const stayPlace = fm['체류지'] || fm['체류예정지'] || fm['숙소'] || null, contact = fm['국내연락처'] || fm['연락처'] || null;
  const row = (k, v, cls = '') => `<div class="ec ${cls}"><label>${esc(k)}</label><b>${esc(v)}</b></div>`;
  byId('entry').innerHTML = `<div class="bio-compare"><div class="bio-compare-head">생체정보 본인확인 · 출입국관리법 제12조의2</div><div class="bio-pair"><div class="bio-shot passport"><img src="${pp.portrait}" alt="여권 사진"><small>여권 사진</small></div><div class="bio-score ${b.bad ? 'bad' : ''}">${b.bad ? '불일치' : '일치'}<br>${b.label}</div><div class="bio-shot"><img src="${t.portrait}" alt="실시간 촬영"><small>실시간 촬영</small></div></div></div>
<div class="entry-section"><h3>신원 · 여권</h3><div class="entry-grid">${row('성명(로마자)', t.name.latin)}${row('국적', `${t.nationality.korean} · ${t.nationality.code}`)}${row('생년월일', t.passport.birthDate || c.dob || '—')}${row('여권번호', t.passport.number || c.passport)}${row('여권 만료', t.passport.expiry || '—')}${row('전자여권 칩', c.chip)}</div></div>
<div class="entry-section"><h3>입국 근거 · 사전여행허가</h3><div class="entry-grid">${row('입국 근거 구분', `${basis.label} · ${basis.basis}`, 'wide')}${row('적용 내용', c.basisDetail, 'wide')}${row('사증', c.visa)}${row('K-ETA(사전여행허가)', keta.text, keta.status === 'PASS' ? '' : 'attention')}${row('전자입국신고', decl.text, 'wide')}</div></div>
<div class="entry-section"><h3>여행 · 목적 · 체류</h3><div class="entry-grid">${row('입국편 · 운수업자', `${c.arrival} · ${c.carrier}`, 'wide')}${row('귀국·이동', c.return)}${row('신고 입국목적', c.purpose)}${row('신청 체류기간', c.stay)}${row('체류예정지', stayPlace || '전자입국신고 자료 참조')}${contact ? row('국내 연락처', contact) : ''}${row('규제정보', c.watch, /확인 필요|규제/.test(c.watch || '') ? 'attention' : '')}</div></div>
<div class="lawline">국적은 사증면제협정·무사증 입국허가·K-ETA 등 <b>입국 근거 산정</b>에만 사용합니다(제7조). 위험도·범죄 가능성은 국적으로 산정하지 않습니다. K-ETA는 사증이 아니며 사전여행허가서입니다(제7조의3).</div>`;
  renderDocStatus(c, b, keta, decl);
}
// Three at-a-glance tiles under the selected document: biometrics (§12의2), e-Arrival/K-ETA, lookups done.
export function renderDocStatus(c, b, keta, decl) {
  const el = byId('docStatus'); if (!el) return;
  const declOk = decl.status === 'PASS', ketaOk = keta.status === 'PASS';
  const tile = (cls, label, value) => `<div class="status-tile ${cls}"><span>${esc(label)}</span><b title="${esc(value)}">${esc(value)}</b></div>`;
  const looked = state.queries.length;
  el.innerHTML = tile(b.bad ? 'bad' : 'ok', '생체정보 · 제12조의2', `${b.bad ? '불일치' : '일치'} ${b.label}`)
    + tile(declOk && ketaOk ? 'ok' : 'warn', '전자입국신고 · K-ETA', `${declOk ? '신고 완료' : decl.text}${ketaOk ? '' : ' · ' + keta.text}`)
    + tile(looked ? 'ok' : '', '전산 조회', looked ? `${looked}건 조회 · ${state.looked.size}종` : '아직 조회 없음');
  const dc = byId('docCount'); if (dc) dc.textContent = String((c.docs || []).length);
}
export function tone(t) { return t === '정상' ? '정상' : t === '주의' ? '주의' : t === '경고' ? '경고' : '치명'; }
export function renderTerminal() {
  const c = current(); const el = byId('terminal');
  if (!state.queries.length) { el.innerHTML = `<div class="line">&gt; 사건 조회 준비 완료</div><div class="line">&gt; 조회 메뉴를 선택하여 기록·사증·PNR·국내관계·동행인을 확인하십시오.</div><div class="line">&gt; 내부 규제코드·비공개 위험선별 알고리즘은 재현하지 않습니다.</div>${c.special === 'forgery' ? '<div class="line">&gt; 위변조 의심 시 출입국사범 절차에서 문서감식을 요청할 수 있습니다.</div>' : ''}`; return; }
  el.innerHTML = state.queries.map((q) => `<div class="line"><span>&gt; ${esc(lookupName(q.kind))}</span><br><span class="${tone(q.t)}">[${esc(q.t)}] ${esc(q.text)}</span></div>`).join('');
}
export function renderClueBoard() {
  const el = byId('clueBoard'); if (!el) return; const c = current(); if (!c.clues) { el.innerHTML = ''; return; } const st = clueStats(c);
  const cards = st.got.slice().reverse().slice(0, 4).map((x) => `<div class="clue ${esc(x.kind || 'context')}"><strong>${esc(x.title)}${x.key ? '<span class="cluekey">핵심</span>' : ''}</strong><p>${esc(x.text)}</p></div>`).join('');
  el.innerHTML = `<div class="cluehead"><span>사건 단서판</span><b>핵심 ${st.keyGot.length}/${st.keys.length} · 전체 ${st.got.length}/${st.all.length}</b></div><div class="cluecards">${cards || '<div class="clueempty">질문·전산조회·서류 확인을 통해 단서가 연결됩니다.</div>'}</div><div class="clue-summary"><span class="legend conflict">모순·중대</span><span class="legend unresolved">미해결</span><span class="legend low">관련성 낮음</span></div>`;
}
export function renderMatrix() {
  const c = current(); const e = evidenceNow(c, state);
  byId('matrix').innerHTML = Object.entries(e).map(([k, v]) => `<div class="ev ${v[0]}"><label>${esc(k)}</label><b>${esc(v[1])}</b><p title="${esc(v[2])}">${esc(v[2])}</p></div>`).join('');
  const cs = clueStats(c); const r = readiness(c, state.performed, c.clues ? cs : null);
  byId('readyPct').textContent = r.pct + '%'; byId('readyFill').style.width = r.pct + '%';
  let hint = r.pct >= 95 ? '필요한 확인이 충분히 축적되었습니다. 최종 판단은 전체 사실관계와 법적 근거를 종합하십시오.' : `필수절차 ${r.hit}/${r.needed}${c.clues ? ` · 핵심단서 ${cs.keyGot.length}/${cs.keys.length}` : ''}. 질문·조회로 사실관계를 더 확인하십시오.`;
  if (state.stage === 'REFUGEE') hint = '난민 회부심사 절차 진행 중. 해당 절차를 먼저 완료하십시오.';
  byId('readyHint').textContent = hint;
  const cr = byId('caseReady'); if (cr) { cr.textContent = r.pct + '%'; cr.className = 'mono' + (r.pct >= 95 ? ' good' : ''); }
  const ct = byId('caseTimer'); if (ct) ct.textContent = fmtClock(state.caseWorkSeconds || 0);
  const done = state.performed.map((x) => ACTION_NAMES[x] || x.replace('QUESTION_', '문답:').replace('LOOKUP_', '조회:'));
  byId('flowchips').innerHTML = done.length ? done.map((x) => `<span class="flowchip done">${esc(x)}</span>`).join('') : '<span class="flowchip">아직 기록 없음</span>';
  byId('flowCount').textContent = `${done.length}개 완료`;
  byId('caseNote').innerHTML = '<b>사건 메모</b> · 단서의 존재만으로 불허·체포를 결정하지 마십시오. 서로 독립된 진술·서류·전산정보를 교차검증해야 합니다.' + (c.clues ? '<div class="case-depth-note">사건 심화 모드 · 핵심단서와 주변정보가 섞여 있습니다.</div>' : '');
  renderBasisPanel(); renderClueBoard();
}

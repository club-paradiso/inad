// RIGHT column · biometrics / entry-basis tools, system lookups terminal; CENTER · requirement matrix and clue board.
import { $, byId, esc } from './dom.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { evidenceNow, readiness, ACTION_NAMES } from '../engines/legal-engine.js';
import { clueStats } from '../engines/clue-engine.js';
import { lookupName } from '../engines/case-engine.js';

export function bioInfo(c) { const raw = parseFloat((c.bio.match(/[0-9]+(?:\.[0-9]+)?/) || ['99.0'])[0]); return { raw, bad: raw < 85 || /불일치|오류/.test(c.bio), label: isNaN(raw) ? '—' : raw.toFixed(1) + '%' }; }

export function renderEntry() {
  const c = current(), t = getTraveler(c.travelerId), pp = getTraveler(c.passportPortraitId || c.travelerId); const b = bioInfo(c);
  byId('entry').innerHTML = `<div class="bio-compare"><div class="bio-compare-head">생체정보 본인확인 · 출입국관리법 제12조의2</div><div class="bio-pair"><div class="bio-shot passport"><img src="${pp.portrait}" alt="여권 사진"><small>여권 사진</small></div><div class="bio-score ${b.bad ? 'bad' : ''}">${b.bad ? '불일치' : '일치'}<br>${b.label}</div><div class="bio-shot"><img src="${t.portrait}" alt="실시간 촬영"><small>실시간 촬영</small></div></div></div><div class="entry-grid"><div class="ec wide"><label>국적·입국 기반</label><b>${esc(t.nationality.korean)} · ${esc(c.basis)}</b></div><div class="ec wide"><label>적용 내용</label><b>${esc(c.basisDetail)}</b></div><div class="ec"><label>사증</label><b>${esc(c.visa)}</b></div><div class="ec"><label>K-ETA</label><b>${esc(c.eta)}</b></div><div class="ec"><label>전자입국신고</label><b>${esc(c.arrivalCard)}</b></div><div class="ec"><label>전자여권 칩</label><b>${esc(c.chip)}</b></div><div class="ec"><label>규제정보</label><b>${esc(c.watch)}</b></div></div><div class="lawline">국적은 무사증·사증·K-ETA 등 <b>입국자격 산정</b>에만 사용합니다. 위험도·범죄 가능성은 국적으로 산정하지 않습니다.</div>`;
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
  const done = state.performed.map((x) => ACTION_NAMES[x] || x.replace('QUESTION_', '문답:').replace('LOOKUP_', '조회:'));
  byId('flowchips').innerHTML = done.length ? done.map((x) => `<span class="flowchip done">${esc(x)}</span>`).join('') : '<span class="flowchip">아직 기록 없음</span>';
  byId('flowCount').textContent = `${done.length}개 완료`;
  byId('caseNote').innerHTML = '<b>사건 메모</b> · 단서의 존재만으로 불허·체포를 결정하지 마십시오. 서로 독립된 진술·서류·전산정보를 교차검증해야 합니다.' + (c.clues ? '<div class="case-depth-note">사건 심화 모드 · 핵심단서와 주변정보가 섞여 있습니다.</div>' : '');
  renderClueBoard();
}

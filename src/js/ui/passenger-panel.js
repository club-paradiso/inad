// LEFT column · the person: portrait, identity, entry basis, stage, interaction state, language, party.
import { $, $$, byId, esc } from './dom.js';
import { state } from '../state.js';
import { current, screeningNo } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { behaviorBand } from '../engines/behavior-engine.js';
import { languageLabel, languageModeLabel, currentLanguageLevel } from '../engines/language-engine.js';
import { stageText } from '../engines/legal-engine.js';
import { travelPartyFor, partyStatusForTraveler } from '../engines/companion-engine.js';

export function renderPassenger() {
  const c = current(), t = getTraveler(c.travelerId);
  byId('caseId').textContent = `심사번호 ${screeningNo()}`; byId('pName').textContent = t.name.korean; byId('pRoman').textContent = t.name.latin; byId('pNat').textContent = `${t.nationality.korean} · ${t.nationality.code}`;
  byId('pPass').textContent = t.passport.number; byId('pStay').textContent = c.stay; byId('pPurpose').textContent = c.purpose; byId('pFlight').textContent = c.arrival.split(' · ')[0]; byId('pBasis').textContent = c.basis;
  const img = byId('pPortrait'); if (img.getAttribute('src') !== t.portrait) img.src = t.portrait; img.alt = `${t.name.korean} 가상 여행객 초상`;
  renderBehavior(); renderLanguage(); renderParty();
  renderCaseBar(c, t);
}
// Stepper position is derived from the legal stage only (never from behaviour/language/party).
export function stepperState(stage, ended) {
  const s = stage || 'PRIMARY';
  if (s === 'PRIMARY') return { active: 'primary', done: [], tone: '' };
  if (s === 'SECONDARY') return { active: 'secondary', done: ['primary'], tone: 'secondary' };
  if (s === 'REFUGEE') return { active: 'followup', done: ['primary', 'secondary', 'decision'], tone: 'refugee' };
  if (s === 'INVESTIGATION' || s === 'ARREST_REVIEW') return { active: 'followup', done: ['primary', 'secondary', 'decision'], tone: 'critical' };
  if (s === 'ADMITTED') return { active: 'decision', done: ['primary', 'secondary'], tone: '' };
  if (s === 'ENTRY_REFUSED' || s === 'ARRESTED') return { active: ended ? 'followup' : 'decision', done: ['primary', 'secondary', 'decision'], tone: 'critical' };
  return { active: 'decision', done: ['primary', 'secondary'], tone: '' };
}
export function renderCaseBar(c, t) {
  const stageEl = byId('stageLabel'); if (stageEl) stageEl.textContent = stageText(state.stage);
  const box = byId('stageBox'); if (box) box.className = ('stage ' + (/SECONDARY|REFUGEE/.test(state.stage) ? 'secondary' : /INVESTIGATION|ARREST|ENTRY_REFUSED/.test(state.stage) ? 'critical' : '')).trim();
  const name = byId('caseName'); if (name) name.textContent = `${t.name.korean} · ${t.name.latin}`;
  const sum = byId('caseSummary'); if (sum) sum.textContent = `${t.nationality.korean} · ${t.nationality.code} · ${c.basis} · ${c.purpose} · ${c.stay}`;
  const mini = byId('caseMiniPortrait'); if (mini && mini.getAttribute('src') !== t.portrait) mini.src = t.portrait;
  const st = stepperState(state.stage, state.ended);
  $$('#stepper li').forEach((li) => { const k = li.dataset.step; li.className = (k === st.active ? 'on ' + st.tone : st.done.includes(k) ? 'done' : '').trim(); li.setAttribute('aria-current', k === st.active ? 'step' : 'false'); });
}
export function renderBehavior() {
  const b = state.behavior; if (!b) return; const band = behaviorBand(), a = byId('pAttitude'); if (a) { a.textContent = band.label; a.className = 'attitude ' + band.cls; }
  const sf = byId('stressFill'), rf = byId('rapportFill'); if (sf) sf.style.width = b.stress + '%'; if (rf) rf.style.width = b.rapport + '%';
  const sv = byId('stressValue'), rv = byId('rapportValue'); if (sv) sv.textContent = b.stress; if (rv) rv.textContent = b.rapport;
  const note = byId('behaviorNote'); if (note) note.textContent = `${b.profile.name} · ${band.response} · 최근 변화: ${b.lastEvent}`;
}
export function renderLanguage() {
  const l = state.language; if (!l) return;
  const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
  set('primaryLang', l.primary); set('koLevel', languageLabel(l.korean)); set('enLevel', languageLabel(l.english));
  const ko = byId('langKo'), en = byId('langEn'), it = byId('langInterp'); if (!ko || !en || !it) return;
  ko.classList.toggle('on', !l.interpreterActive && l.mode === 'ko'); en.classList.toggle('on', !l.interpreterActive && l.mode === 'en'); it.classList.toggle('on', l.interpreterActive);
  ko.setAttribute('aria-pressed', String(!l.interpreterActive && l.mode === 'ko')); en.setAttribute('aria-pressed', String(!l.interpreterActive && l.mode === 'en')); it.setAttribute('aria-pressed', String(l.interpreterActive));
  it.textContent = l.interpreterActive ? '통역 연결됨' : '통역 호출'; it.title = l.interpreterActive ? `${l.primary} 통역 연결됨` : `${l.primary} 통역 호출`;
  const lm = byId('languageMode'); if (lm) lm.textContent = `현재 ${languageModeLabel()}`;
  const s = byId('languageStatus'); if (!s) return; const direct = currentLanguageLevel(), need = 2;
  if (l.interpreterActive) { s.textContent = `${l.primary} ↔ 한국어 통역 중 · 유효 진술 확보 가능`; s.className = 'language-status good'; }
  else if (l.mode === 'none') { s.textContent = `직접 의사소통이 곤란합니다. 통역 호출을 권고합니다.`; s.className = 'language-status bad'; }
  else if (direct < need) { s.textContent = `현재 ${languageModeLabel()} 수준이 제한적입니다. 복잡한 질문에는 통역이 필요할 수 있습니다.`; s.className = 'language-status warn'; }
  else { s.textContent = `현재 ${languageModeLabel()} · 복잡한 질문은 이해도에 따라 통역이 필요할 수 있습니다.`; s.className = 'language-status'; }
}
export function renderParty(onOpen) {
  const box = byId('partyBox'); if (!box) return; const party = travelPartyFor();
  if (!party) { box.className = 'party-summary'; box.innerHTML = ''; return; }
  const members = party.members.map((m) => { const t = getTraveler(m.travelerId), st = partyStatusForTraveler(t.id); return `<div class="party-member ${st}"><img src="${t.portrait}" alt="${esc(t.name.korean)}"><i></i><span>${esc(t.name.korean)}</span></div>`; }).join('');
  box.className = 'party-summary on'; box.innerHTML = `<div class="party-head"><strong>동행여행 · ${esc(party.label)}</strong><small>${party.members.length}명 · ${esc(party.sharedPNR)}</small></div><div class="party-members">${members}</div><div class="party-foot"><span>동행 사실 자체는 입국판정 근거가 아닙니다.</span><button class="party-open" id="partyOpen" type="button">동행인 기록</button></div>`;
  const b = box.querySelector('#partyOpen'); if (b && renderParty.onOpen) b.onclick = renderParty.onOpen;
}

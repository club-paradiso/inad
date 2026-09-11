// Start overlay: airport + mission + duty configuration summary, progressive disclosure, start/resume.
import { $, $$, byId, esc } from './dom.js';
import { state, session } from '../state.js';
import { AIRPORTS } from '../../data/airports.js';
import { setAirport, airportCfg, setDifficulty, setScenario, difficultyCfg, scenarioCfg } from '../engines/operation-engine.js';
import { setChallenge, challengeCfg } from '../engines/achievement-engine.js';
import { setCampaign } from '../engines/campaign-engine.js';
import { loadProgressSave, saveGuidance } from '../engines/save-engine.js';
import { renderCampaignStart } from './views/campaign.js';
import { bus } from '../services/bus.js';

const txt = (sel, fallback = '') => { const e = document.querySelector(sel); return e ? e.textContent.trim() : fallback; };
const isEn = () => document.documentElement.lang === 'en' || document.documentElement.dataset.locale === 'en';
const t = (ko, en) => isEn() ? en : ko;
const DIFF_EN = {
  training: ['Training', 'Slower arrivals · reduced field-event impact'],
  standard: ['Standard', 'Moderate arrivals · standard operational pressure'],
  realistic: ['Realistic', 'Fast arrivals · stronger congestion and delays']
};
const SCENARIO_EN = {
  normal: ['Normal duty', 'No additional operational variable'],
  arrival: ['Arrival surge', 'Higher initial queue and faster arrivals'],
  systems: ['System instability', 'Persistent lookup delays'],
  interpreter: ['Interpreter demand', 'Longer interpreter connection times'],
  night: ['Night duty', 'Faster fatigue accumulation and a slightly higher initial queue']
};

function renderAirportOptions() {
  const anchor = document.querySelector('.difficulty-box');
  if (!anchor) return;
  let box = document.querySelector('.airport-box');
  if (!box) {
    box = document.createElement('div');
    box.className = 'airport-box option-box';
    box.innerHTML = '<h3 id="airportBoxTitle"></h3><p class="option-note" id="airportBoxNote"></p><div class="airport-grid option-grid" id="airportGrid"></div>';
    anchor.parentElement.insertBefore(box, anchor);
  }
  byId('airportBoxTitle').textContent = t('근무 공항', 'Duty airport');
  byId('airportBoxNote').textContent = t('공항·IATA 코드는 실제 정보를 사용합니다. 난이도·대기·이벤트 수치는 게임용 운영 프리셋이며 실제 인력·위험도 자료가 아닙니다.', 'Airport names and IATA codes are real. Difficulty, queues and event values are fictional gameplay presets, not real staffing or risk data.');
  const grid = byId('airportGrid');
  grid.innerHTML = AIRPORTS.map((a) => `<button class="airport-btn" data-airport="${esc(a.id)}" type="button"><b>${esc(isEn() ? a.nameEn : a.nameKo)} <small>${esc(a.code)}</small></b><span>${esc(isEn() ? a.profileEn : a.profileKo)}</span><em>${t('게임 난이도', 'Game difficulty')} ${'●'.repeat(a.rating)}${'○'.repeat(5 - a.rating)}</em></button>`).join('');
  $$('.airport-btn').forEach((b) => { b.onclick = () => { setAirport(b.dataset.airport); syncOptionButtons(); }; });
}

function renderAirportChrome() {
  const ap = airportCfg();
  const brand = document.querySelector('.brand-copy p');
  if (brand) brand.textContent = `${isEn() ? ap.nameEn : ap.nameKo} · ${t('입국심사 시뮬레이션', 'Immigration Inspection Simulation')}`;
  const loc = document.querySelector('.startlocation');
  if (loc) loc.innerHTML = `${esc(isEn() ? ap.nameEn : ap.nameKo)}<br>${esc(isEn() ? ap.locationEn : ap.locationKo)}`;
  const meta = document.querySelector('.meta-status');
  if (meta && !byId('airportHudWrap')) meta.insertAdjacentHTML('afterbegin', '<span id="airportHudWrap"><span id="airportHudLabel"></span> <b id="airportLabel"></b></span>');
  if (byId('airportHudLabel')) byId('airportHudLabel').textContent = t('공항', 'Airport');
  if (byId('airportLabel')) byId('airportLabel').textContent = `${ap.code} · ${isEn() ? ap.nameEn.replace(' International Airport', '') : ap.nameKo.replace('국제공항', '')}`;
}

export function renderPersistenceStatus() { const p = loadProgressSave(), btn = byId('resumeBtn'), st = byId('saveStatus'); if (btn) { btn.hidden = !p; btn.textContent = p ? `이전 근무 이어하기 · ${Math.min(p.nextIndex, 36)}/36` : '이전 근무 이어하기'; } if (st) st.textContent = p ? `자동저장 있음 · SESSION ${p.seed} · ${Math.min(p.nextIndex, 36)}/36 처리` : '자동저장 · 승객 처리 완료 시 체크포인트 생성'; }
export function renderSetupSummary() { const ap = airportCfg(); const parts = [`${ap.code} ${isEn() ? ap.nameEn : ap.nameKo}`, txt('.diff-btn.on b', t('훈련', 'Training')), txt('.scenario-btn.on b', t('기본 근무', 'Normal duty')), txt('.campaign-btn.on b', t('단일 근무', 'Single shift')), txt('.guide-btn.on b', t('처음 근무', 'Guided')), txt('.challenge-btn.on b', t('일반 근무', 'No challenge'))]; const el = byId('setupSummary'); if (el) el.textContent = parts.join(' · '); }
export function setAdvanced(on) { const adv = byId('setupAdvancedPanel'), el = byId('setupAdvancedToggle'); if (!adv) return; adv.classList.toggle('open', on); adv.hidden = !on; if (el) { el.setAttribute('aria-expanded', String(on)); el.textContent = on ? t('세부 설정 접기', 'Hide advanced settings') : t('세부 설정', 'Advanced settings'); } }
export function syncOptionButtons() {
  renderAirportOptions();
  $$('.airport-btn').forEach((b) => { const on = b.dataset.airport === state.airportId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.diff-btn').forEach((b) => { const on = b.dataset.difficulty === state.difficulty; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.scenario-btn').forEach((b) => { const on = b.dataset.scenario === state.scenarioId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.challenge-btn').forEach((b) => { const on = b.dataset.challenge === state.challengeId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.guide-btn').forEach((b) => { const on = b.dataset.guidance === state.guidance; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  renderAirportChrome(); renderCampaignStart(); renderSetupSummary();
}
export function setGuidance(mode) { if (state.started) return; state.guidance = mode === 'expert' ? 'expert' : 'guided'; saveGuidance(state.guidance); syncOptionButtons(); }

export function bindStartScreen({ onStart, onResume, onRecords, onProfile, onSettings, onSystem, onReroll, onCampaignArchive, onCampaignAbandon }) {
  byId('sessionSeed').textContent = String(session.seed);
  renderAirportOptions();
  $$('.diff-btn').forEach((b) => { b.onclick = () => { setDifficulty(b.dataset.difficulty); syncOptionButtons(); }; });
  $$('.scenario-btn').forEach((b) => { b.onclick = () => { setScenario(b.dataset.scenario); syncOptionButtons(); }; });
  $$('.challenge-btn').forEach((b) => { b.onclick = () => { setChallenge(b.dataset.challenge); syncOptionButtons(); }; });
  $$('.guide-btn').forEach((b) => { b.onclick = () => setGuidance(b.dataset.guidance); });
  $$('.campaign-btn').forEach((b) => { b.onclick = () => { setCampaign(b.dataset.campaign); syncOptionButtons(); }; });
  byId('setupAdvancedToggle').onclick = () => setAdvanced(byId('setupAdvancedPanel').hidden);
  byId('setupReset').onclick = () => { setAirport('icn-t2'); setDifficulty('training'); setScenario('normal'); setCampaign('none'); setChallenge('none'); setGuidance('guided'); syncOptionButtons(); };
  byId('startBtn').onclick = onStart; byId('resumeBtn').onclick = onResume; byId('recordsStartBtn').onclick = onRecords; byId('profileStartBtn').onclick = onProfile; byId('startSettingsBtn').onclick = onSettings; byId('startSystemBtn').onclick = onSystem; byId('rerollBtn').onclick = onReroll;
  byId('campaignArchiveBtn').onclick = onCampaignArchive; byId('campaignAbandonBtn').onclick = onCampaignAbandon;
  bus.on('persistence', renderPersistenceStatus); bus.on('campaign', syncOptionButtons);
  document.addEventListener('inad:localechange', syncOptionButtons);
  syncOptionButtons(); renderPersistenceStatus();
  if (state.campaignId !== 'none') setAdvanced(true);
}
export function hideStartOverlay() { byId('startOverlay').classList.add('hide'); byId('startOverlay').setAttribute('aria-hidden', 'true'); }
export function briefingHTML({ preview, reviewCount, cfg, seed, parties, normalCount, eventCount, dateKo }) {
  const ap = airportCfg(), diff = isEn() ? (DIFF_EN[state.difficulty] || [cfg.label, cfg.desc]) : [cfg.label, cfg.desc], sc = scenarioCfg(), scenario = isEn() ? (SCENARIO_EN[state.scenarioId] || [sc.name, sc.desc]) : [sc.name, sc.desc];
  return `<h3>${esc(dateKo)} · ${esc(isEn() ? ap.nameEn : ap.nameKo)} · ${esc(isEn() ? ap.locationEn : ap.locationKo)}</h3><div class="briefgrid"><div class="briefkpi"><span>${t('공항 프리셋', 'Airport preset')}</span><b>${esc(ap.code)}</b></div><div class="briefkpi"><span>${t('현재 게임상 대기', 'Simulated queue')}</span><b>${session.queue.length + 13}</b></div><div class="briefkpi"><span>${t('운영 강도', 'Operational intensity')}</span><b>${'●'.repeat(ap.rating)}${'○'.repeat(5 - ap.rating)}</b></div><div class="briefkpi"><span>${t('가상 운영 심사대', 'Simulated open booths')}</span><b>${ap.simBooths}</b></div></div><div class="brief-meta"><span class="seed-badge">SESSION ${seed}</span><span>${t('도전', 'Challenge')} ${esc(challengeCfg().name)} · ${t('시나리오', 'Scenario')} ${esc(scenario[0])} · ${t('일반승객', 'Generated travelers')} ${normalCount}${t('명', '')} · ${t('동행여행', 'Parties')} ${parties}${t('팀', '')} · ${t('추가확인 변형', 'Review variants')} ${reviewCount}${t('명', '')}</span></div><div class="briefpeople">${preview.map((traveler) => `<img src="${traveler.portrait}" alt="">`).join('')}</div><div class="shift-target"><span>${t('근무 공항', 'Duty airport')}</span><b>${esc(isEn() ? ap.nameEn : ap.nameKo)} · ${esc(isEn() ? ap.profileEn : ap.profileKo)}</b><span>${t('근무 난이도', 'Duty difficulty')}</span><b>${esc(diff[0])} · ${esc(diff[1])}</b><span>${t('예정 현장 이벤트', 'Scheduled field events')}</span><b>${eventCount}${t('회', '')}</b><span>${t('시나리오', 'Scenario')}</span><b>${esc(scenario[0])} · ${esc(scenario[1])}</b><span>${t('평가 방식', 'Scoring')}</span><b>${t('정확성 + 절차 + 효율 + 비례성', 'Accuracy + procedure + efficiency + proportionality')}</b></div><p class="modal-note">${t('공항 명칭과 IATA 코드는 실제 정보를 사용하지만 대기열·운영 심사대 수·이벤트 강도·처리시간은 게임 밸런스를 위한 가상 수치입니다. 공항 프리셋과 현장 이벤트는 입국요건이나 법률상 정답을 변경하지 않습니다.', 'Airport names and IATA codes are real, but queue size, booth count, event intensity and processing times are fictional balancing values. Airport presets and field events never change entry requirements or legal outcomes.')}</p><button type="button" class="act clear block" id="briefStart"><strong>${t('제1근무조 시작', 'Start Shift 1')}</strong></button>`;
}

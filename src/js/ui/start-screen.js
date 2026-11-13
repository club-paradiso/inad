// Start overlay: airport + mission + duty configuration summary, progressive disclosure, start/resume.
import { $, $$, byId, esc, withFocus } from './dom.js';
import { state, session } from '../state.js';
import { AIRPORTS } from '../../data/airports.js';
import { storageWritable } from '../services/storage.js';
import { setAirport, airportCfg, setDifficulty, setScenario, difficultyCfg, scenarioCfg, refreshAirportLiveLoad, appliedLiveLoad, simulatedBacklog } from '../engines/operation-engine.js';
import { classifyLiveLoad } from '../engines/airport-load-balance.js';
import { setChallenge, challengeCfg } from '../engines/achievement-engine.js';
import { setCampaign } from '../engines/campaign-engine.js';
import { loadProgressSave, saveGuidance, loadMeta } from '../engines/save-engine.js';
import { POSTINGS, postingFor, suggestedPosting } from '../../data/postings.js';
import { renderCampaignStart } from './views/campaign.js';
import { bus } from '../services/bus.js';
import { syncBackgroundInert } from './modals.js';

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
const LIVE_PRESSURE = {
  quiet: ['한산', 'Quiet'], normal: ['보통', 'Normal'], busy: ['혼잡', 'Busy'], surge: ['집중', 'Surge'], baseline: ['기본값', 'Baseline']
};

const SOURCE_LABEL = { IIAC: ['인천국제공항공사 여객편 운항현황', 'Incheon International Airport Corp. · passenger flight status'], KAC: ['한국공항공사 실시간 항공기 운항정보', 'Korea Airports Corp. · live flight status'] };
function sourceLabel(live) { const l = SOURCE_LABEL[live.source]; return l ? l[isEn() ? 1 : 0] : (live.sourceLabel || t('공식 공항 운항정보', 'Official airport flight data')); }
function snapshotTime(iso) { const ms = Date.parse(iso || ''); if (!Number.isFinite(ms)) return ''; const hm = new Date(ms).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }); return t(` · ${hm} 기준`, ` · as of ${hm} KST`); }
function liveStatusText() {
  const live = appliedLiveLoad();
  if (live.status === 'loading') return t('실시간 운항 확인 중…', 'Checking live flight load…');
  if (live.live) {
    // the word describes the factor that is actually applied (difficulty-capped), and the snapshot shows its age
    const pressure = LIVE_PRESSURE[classifyLiveLoad(live.appliedFactor)] || LIVE_PRESSURE.normal;
    return `${t('실시간', 'Live')} ${pressure[isEn() ? 1 : 0]} · ${live.arrivals}${t('편/2시간', ' arrivals/2h')} · ${live.appliedFactor.toFixed(2)}x${snapshotTime(live.checkedAt)}`;
  }
  if (live.reason === 'api-key-not-configured') return t('기본 공항 상황으로 진행', 'Using baseline airport conditions');
  if (live.status === 'fallback') return t('실시간 조회 불가 · 기본 프리셋 적용', 'Live data unavailable · baseline preset');
  return t('실시간 운항 스냅샷 준비', 'Live flight snapshot ready to check');
}

function liveBriefingValue() {
  const live = appliedLiveLoad();
  if (!live.live) return t('기본 프리셋', 'Baseline');
  const pressure = LIVE_PRESSURE[classifyLiveLoad(live.appliedFactor)] || LIVE_PRESSURE.normal;
  return `${pressure[isEn() ? 1 : 0]} · ${live.appliedFactor.toFixed(2)}x`;
}

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
  byId('airportBoxNote').textContent = t('공항·IATA 코드는 실제 정보입니다. 기본 난이도는 게임 프리셋이며, 선택한 공항은 공식 운항 API의 향후 2시간 국제선 도착량을 대기열 압박에 제한적으로 반영합니다.', 'Airport names and IATA codes are real. Base difficulty is a gameplay preset; the selected airport can use official flight data for the next two hours as a bounded queue-pressure modifier.');
  const grid = byId('airportGrid');
  grid.innerHTML = AIRPORTS.map((a) => {
    const selected = a.id === state.airportId;
    const liveLine = selected ? `<small>${esc(liveStatusText())}</small>` : '';
    return `<button class="airport-btn" data-airport="${esc(a.id)}" type="button"><b>${esc(isEn() ? a.nameEn : a.nameKo)} <small>${esc(a.code)}</small></b><span>${esc(isEn() ? a.profileEn : a.profileKo)}</span><em>${t('기본 게임 난이도', 'Base game difficulty')} ${ratingHTML(a.rating)}</em>${liveLine}</button>`;
  }).join('');
  $$('.airport-btn').forEach((b) => { b.onclick = async () => { if (!setAirport(b.dataset.airport)) return; syncOptionButtons(); await refreshAirportLiveLoad(); syncOptionButtons(); }; });
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

export function renderPersistenceStatus() {
  const p = loadProgressSave(), btn = byId('resumeBtn'), st = byId('saveStatus'), writable = storageWritable();
  if (btn) { btn.hidden = !p; btn.textContent = p ? `이전 근무 이어하기 · ${Math.min(p.nextIndex, 36)}/36` : '이전 근무 이어하기'; }
  if (!st) return;
  // Never claim autosave when the browser refuses storage (private mode, quota, disabled site data).
  st.classList.toggle('warn', !writable);
  st.textContent = !writable ? '저장소 사용 불가 · 이 브라우저에서는 진행이 저장되지 않습니다' : p ? `자동저장 있음 · SESSION ${p.seed} · ${Math.min(p.nextIndex, 36)}/36 처리` : '자동저장 · 승객 처리 완료 시 체크포인트 생성';
}
export function renderSetupSummary() { const ap = airportCfg(); const parts = [`${ap.code} ${isEn() ? ap.nameEn : ap.nameKo}`, txt('.diff-btn.on b', t('훈련', 'Training')), txt('.scenario-btn.on b', t('기본 근무', 'Normal duty')), txt('.campaign-btn.on b', t('캠페인 없음', 'No campaign')), txt('.guide-btn.on b', t('처음 근무', 'Guided')), txt('.challenge-btn.on b', t('일반 근무', 'No challenge'))]; const el = byId('setupSummary'); if (el) el.textContent = parts.join(' · '); }
export function setAdvanced(on) { const adv = byId('setupAdvancedPanel'), el = byId('setupAdvancedToggle'); if (!adv) return; adv.hidden = !on; if (el) { el.setAttribute('aria-expanded', String(on)); el.textContent = on ? t('세부 설정 접기', 'Hide advanced settings') : t('세부 설정', 'Advanced settings'); } }
export function syncOptionButtons() {
  withFocus(renderAirportOptions);
  $$('.airport-btn').forEach((b) => { const on = b.dataset.airport === state.airportId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.diff-btn').forEach((b) => { const on = b.dataset.difficulty === state.difficulty; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.scenario-btn').forEach((b) => { const on = b.dataset.scenario === state.scenarioId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.challenge-btn').forEach((b) => { const on = b.dataset.challenge === state.challengeId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.guide-btn').forEach((b) => { const on = b.dataset.guidance === state.guidance; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  renderAirportChrome(); renderCampaignStart(); renderSetupSummary(); renderPostings();
}
// 정규 근무 배치: one choice sets difficulty, scenario and guidance. The option grids under 세부 설정 show the same state.
function renderPostings() {
  const grid = byId('postingGrid'); if (!grid) return;
  let done = 0; try { done = loadMeta().career?.completedShifts || 0; } catch (e) { done = 0; }
  const current = postingFor(state), next = suggestedPosting(done), locked = state.campaignId !== 'none';
  grid.innerHTML = POSTINGS.map((p) => { const [name, note] = isEn() ? p.en : p.ko; const on = current?.id === p.id;
    return `<button type="button" class="posting-btn${on ? ' on' : ''}" data-posting="${p.id}" aria-pressed="${on}"${locked ? ' disabled' : ''}><b>${esc(name)}</b><span>${esc(note)}</span>${p.id === next.id ? `<small>${t('다음 배치로 권장', 'Suggested next')}</small>` : ''}</button>`; }).join('');
  byId('postingNote').textContent = locked ? t('캠페인 진행 중에는 캠페인이 정한 조건으로 근무합니다.', 'During a campaign the campaign sets the duty conditions.') : current ? t('배치를 고르면 운영 조건이 한 번에 정해집니다. 법률상 정답은 어느 배치에서나 같습니다.', 'A posting sets the duty conditions in one choice. The legal answer is the same in every posting.') : t('직접 구성한 조건입니다. 배치를 고르면 그 배치의 조건으로 돌아갑니다.', 'Custom conditions. Choose a posting to return to its conditions.');
  grid.querySelectorAll('.posting-btn').forEach((b) => { b.onclick = () => { const p = POSTINGS.find((x) => x.id === b.dataset.posting); if (!p || state.started) return; setChallenge('none'); setDifficulty(p.difficulty); setScenario(p.scenario); setGuidance(p.guidance); grid.querySelector(`[data-posting="${p.id}"]`)?.focus(); }; });
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
  byId('setupReset').onclick = async () => { setAirport('icn-t2'); setDifficulty('training'); setScenario('normal'); setCampaign('none'); setChallenge('none'); setGuidance('guided'); syncOptionButtons(); await refreshAirportLiveLoad(); syncOptionButtons(); };
  byId('startBtn').onclick = async () => {
    // The live snapshot is refreshed once more before the shift; the wait is bounded by the client timeout
    // (airport-live.js) and is visible, so the start button never looks frozen.
    const btn = byId('startBtn'), resume = byId('resumeBtn'); if (btn.disabled) return; const label = btn.textContent;
    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = t('운항정보 확인 중…', 'Checking flight data…'); if (resume) resume.disabled = true;
    try { await refreshAirportLiveLoad({ force: true }); } finally { btn.textContent = label; btn.removeAttribute('aria-busy'); btn.disabled = false; if (resume) resume.disabled = false; }
    // a resume (or anything else) that started the shift during the wait wins; never open the briefing over it
    if (state.started || byId('startOverlay')?.classList.contains('hide')) return;
    syncOptionButtons(); onStart();
  };
  byId('resumeBtn').onclick = onResume; byId('recordsStartBtn').onclick = onRecords; byId('profileStartBtn').onclick = onProfile; byId('startSettingsBtn').onclick = onSettings; byId('startSystemBtn').onclick = onSystem; byId('rerollBtn').onclick = onReroll;
  byId('campaignArchiveBtn').onclick = onCampaignArchive; byId('campaignAbandonBtn').onclick = onCampaignAbandon;
  bus.on('persistence', renderPersistenceStatus); bus.on('campaign', syncOptionButtons); bus.on('airportLive', syncOptionButtons);
  document.addEventListener('inad:localechange', syncOptionButtons);
  syncOptionButtons(); renderPersistenceStatus(); syncBackgroundInert();
  refreshAirportLiveLoad().then(syncOptionButtons).catch(() => {});
  if (state.campaignId !== 'none') setAdvanced(true);
}
// ●●●○○ is decoration; screen readers get the level as words.
const ratingHTML = (n) => `<span aria-hidden="true">${'●'.repeat(n)}${'○'.repeat(5 - n)}</span><span class="sr-only">${t(`5단계 중 ${n}단계`, `level ${n} of 5`)}</span>`;
export function hideStartOverlay() { byId('startOverlay').classList.add('hide'); byId('startOverlay').setAttribute('aria-hidden', 'true'); syncBackgroundInert(); }
export function briefingHTML({ preview, reviewCount, cfg, seed, parties, normalCount, eventCount, dateKo }) {
  const ap = airportCfg(), live = appliedLiveLoad(), diff = isEn() ? (DIFF_EN[state.difficulty] || [cfg.label, cfg.desc]) : [cfg.label, cfg.desc], sc = scenarioCfg(), scenario = isEn() ? (SCENARIO_EN[state.scenarioId] || [sc.name, sc.desc]) : [sc.name, sc.desc];
  const liveDetail = live.live ? `${live.arrivals}${t('편 도착 예정', ' arrivals expected')} · ${live.delayed}${t('편 지연', ' delayed')} · ${live.appliedFactor.toFixed(2)}x` : t('공식 실시간 자료 미적용 · 기본 프리셋 사용', 'Official live data unavailable · baseline preset used');
  const liveSource = live.live ? sourceLabel(live) : t('기본 게임 프리셋', 'Baseline game preset');
  const total = session.queue.length;
  // What a duty officer needs before the first call: where, how many, under which conditions. The operating
  // detail stays one disclosure away. Counts that would tell how many passengers hide a problem are not shown.
  return `<h3>${esc(dateKo)} · ${esc(isEn() ? ap.nameEn : ap.nameKo)} · ${esc(isEn() ? ap.locationEn : ap.locationKo)}</h3><div class="briefgrid"><div class="briefkpi"><span>${t('내 심사대 배정 승객', 'Travelers assigned to you')}</span><b>${total}</b></div><div class="briefkpi"><span>${t('근무조', 'Duty shifts')}</span><b>3</b></div><div class="briefkpi"><span>${t('입국심사장 전체 대기', 'Whole-hall queue')}</span><b>${simulatedBacklog()}</b></div><div class="briefkpi"><span>${t('근무 난이도', 'Duty difficulty')}</span><b>${esc(diff[0])}</b></div></div><div class="briefpeople">${preview.map((traveler) => `<img src="${traveler.portrait}" alt="">`).join('')}</div><p class="modal-note">${t('확인한 사실로 결정하십시오. 정확성·절차·효율·비례성을 함께 평가하며, 필요 없는 확인을 늘리는 것도 감점입니다. 승객을 한 명 마칠 때마다 자동저장됩니다.', 'Decide on what you have established. Accuracy, procedure, efficiency and proportionality are scored together, and checks nobody needed cost points too. Progress is saved after each traveler.')}</p><details class="brief-detail"><summary>${t('운영 조건 자세히', 'Operating conditions')}</summary><div class="shift-target"><span>${t('근무 공항', 'Duty airport')}</span><b>${esc(isEn() ? ap.nameEn : ap.nameKo)} · ${esc(isEn() ? ap.profileEn : ap.profileKo)}</b><span>${t('시나리오', 'Scenario')}</span><b>${esc(scenario[0])} · ${esc(scenario[1])}</b><span>${t('난이도 설명', 'Difficulty')}</span><b>${esc(diff[1])}</b><span>${t('예정 현장 이벤트', 'Scheduled field events')}</span><b>${eventCount}${t('회', '')}</b><span>${t('동행여행', 'Parties')}</span><b>${parties}${t('팀', '')}</b><span>${t('실시간 운항 부하', 'Live flight load')}</span><b>${esc(liveBriefingValue())} · ${esc(liveDetail)}</b><span>${t('운항정보 출처', 'Flight-data source')}</span><b>${esc(liveSource)}</b><span>${t('근무 배치 번호', 'Roster number')}</span><b class="mono">${seed}</b></div><p class="modal-note">${t('공항 명칭·IATA 코드와 표시된 실시간 운항편 정보는 공개 공식 데이터입니다. 공항 기본 난이도, 대기열, 이벤트 강도와 운영계수는 게임 밸런스용입니다. 실시간 운항량은 승객 유입·대기열·현장 이벤트에만 제한적으로 반영되고, 입국요건·승객 위험도·허가·불허 정답에는 영향을 주지 않습니다.', 'Airport names, IATA codes and displayed live flight counts use official public data. Base airport difficulty, queues, event intensity and the gameplay multiplier are balancing values. Live traffic only modifies arrival/queue pressure and field events; it never changes entry requirements, traveler risk, or the correct admission/refusal decision.')}</p></details><button type="button" class="act primary block" id="briefStart"><strong>${t('제1근무조 시작', 'Start Shift 1')}</strong></button>`;
}

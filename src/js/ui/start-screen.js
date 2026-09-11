// Start overlay: mission of the day, duty configuration summary + progressive disclosure, start/resume.
import { $, $$, byId, esc } from './dom.js';
import { state, session } from '../state.js';
import { setDifficulty, setScenario, difficultyCfg, scenarioCfg } from '../engines/operation-engine.js';
import { setChallenge, challengeCfg } from '../engines/achievement-engine.js';
import { setCampaign } from '../engines/campaign-engine.js';
import { loadProgressSave, saveGuidance } from '../engines/save-engine.js';
import { renderCampaignStart } from './views/campaign.js';
import { bus } from '../services/bus.js';

const txt = (sel, fallback = '') => { const e = document.querySelector(sel); return e ? e.textContent.trim() : fallback; };

export function renderPersistenceStatus() { const p = loadProgressSave(), btn = byId('resumeBtn'), st = byId('saveStatus'); if (btn) { btn.hidden = !p; btn.textContent = p ? `이전 근무 이어하기 · ${Math.min(p.nextIndex, 36)}/36` : '이전 근무 이어하기'; } if (st) st.textContent = p ? `자동저장 있음 · SESSION ${p.seed} · ${Math.min(p.nextIndex, 36)}/36 처리` : '자동저장 · 승객 처리 완료 시 체크포인트 생성'; }
export function renderSetupSummary() { const parts = [txt('.diff-btn.on b', '표준'), txt('.scenario-btn.on b', '기본 근무'), txt('.campaign-btn.on b', '단일 근무'), txt('.guide-btn.on b', '처음 근무'), txt('.challenge-btn.on b', '일반 근무')]; const t = byId('setupSummary'); if (t) t.textContent = parts.join(' · '); }
export function setAdvanced(on) { const adv = byId('setupAdvancedPanel'), t = byId('setupAdvancedToggle'); if (!adv) return; adv.classList.toggle('open', on); adv.hidden = !on; if (t) { t.setAttribute('aria-expanded', String(on)); t.textContent = on ? '세부 설정 접기' : '세부 설정'; } }
export function syncOptionButtons() {
  $$('.diff-btn').forEach((b) => { const on = b.dataset.difficulty === state.difficulty; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.scenario-btn').forEach((b) => { const on = b.dataset.scenario === state.scenarioId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.challenge-btn').forEach((b) => { const on = b.dataset.challenge === state.challengeId; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $$('.guide-btn').forEach((b) => { const on = b.dataset.guidance === state.guidance; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  renderCampaignStart(); renderSetupSummary();
}
export function setGuidance(mode) { if (state.started) return; state.guidance = mode === 'expert' ? 'expert' : 'guided'; saveGuidance(state.guidance); syncOptionButtons(); }

export function bindStartScreen({ onStart, onResume, onRecords, onProfile, onSettings, onSystem, onReroll, onCampaignArchive, onCampaignAbandon }) {
  byId('sessionSeed').textContent = String(session.seed);
  $$('.diff-btn').forEach((b) => { b.onclick = () => { setDifficulty(b.dataset.difficulty); syncOptionButtons(); }; });
  $$('.scenario-btn').forEach((b) => { b.onclick = () => { setScenario(b.dataset.scenario); syncOptionButtons(); }; });
  $$('.challenge-btn').forEach((b) => { b.onclick = () => { setChallenge(b.dataset.challenge); syncOptionButtons(); }; });
  $$('.guide-btn').forEach((b) => { b.onclick = () => setGuidance(b.dataset.guidance); });
  $$('.campaign-btn').forEach((b) => { b.onclick = () => { setCampaign(b.dataset.campaign); syncOptionButtons(); }; });
  byId('setupAdvancedToggle').onclick = () => setAdvanced(byId('setupAdvancedPanel').hidden);
  byId('setupReset').onclick = () => { setDifficulty('standard'); setScenario('normal'); setCampaign('none'); setChallenge('none'); setGuidance('guided'); syncOptionButtons(); };
  byId('startBtn').onclick = onStart; byId('resumeBtn').onclick = onResume; byId('recordsStartBtn').onclick = onRecords; byId('profileStartBtn').onclick = onProfile; byId('startSettingsBtn').onclick = onSettings; byId('startSystemBtn').onclick = onSystem; byId('rerollBtn').onclick = onReroll;
  byId('campaignArchiveBtn').onclick = onCampaignArchive; byId('campaignAbandonBtn').onclick = onCampaignAbandon;
  bus.on('persistence', renderPersistenceStatus); bus.on('campaign', syncOptionButtons);
  syncOptionButtons(); renderPersistenceStatus();
  if (state.campaignId !== 'none') setAdvanced(true);
}
export function hideStartOverlay() { byId('startOverlay').classList.add('hide'); byId('startOverlay').setAttribute('aria-hidden', 'true'); }
export function briefingHTML({ preview, reviewCount, cfg, seed, parties, normalCount, eventCount, dateKo }) {
  return `<h3>${dateKo} · 제2여객터미널 입국심사장</h3><div class="briefgrid"><div class="briefkpi"><span>금일 예상 입국자</span><b>28,431</b></div><div class="briefkpi"><span>현재 대기</span><b>${session.queue.length + 13}</b></div><div class="briefkpi"><span>재심 대기</span><b>4</b></div><div class="briefkpi"><span>운영 심사대</span><b>18</b></div></div><div class="brief-meta"><span class="seed-badge">SESSION ${seed}</span><span>도전 ${esc(challengeCfg().name)} · 시나리오 ${esc(scenarioCfg().name)} · 일반승객 ${normalCount}명 · 동행여행 ${parties}팀 · 추가확인 변형 ${reviewCount}명 · 핵심사건 12건</span></div><div class="briefpeople">${preview.map((t) => `<img src="${t.portrait}" alt="">`).join('')}</div><div class="shift-target"><span>근무 난이도</span><b>${cfg.label} · ${cfg.desc}</b><span>예정 현장 이벤트</span><b>${eventCount}회</b><span>시나리오</span><b>${esc(scenarioCfg().name)} · ${esc(scenarioCfg().desc)}</b><span>제1근무조 목표 평균</span><b>65초</b><span>평가 방식</span><b>정확성 + 절차 + 효율 + 비례성</b></div><p class="modal-note">현장 이벤트·대기열·피로도는 게임용 운영 변수입니다. 어떤 이벤트도 입국요건이나 법률상 정답을 변경하지 않습니다. 처리속도는 법적 판단보다 우선하지 않습니다.</p><button type="button" class="act clear block" id="briefStart"><strong>제1근무조 시작</strong></button>`;
}

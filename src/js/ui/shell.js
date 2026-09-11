// Application chrome: header KPIs, event bar, queue strip, footer clock, workload meters.
import { $, $$, byId, esc, fmtClock } from './dom.js';
import { session, state } from '../state.js';
import { current, screeningNo } from '../engines/queue-engine.js';
import { getTraveler } from '../engines/traveler-engine.js';
import { simulatedBacklog, pressureInfo, difficultyCfg, scenarioCfg, eventEffectText } from '../engines/operation-engine.js';
import { overallScore, workloadClass } from '../engines/score-engine.js';
import { challengeCfg, challengeEvaluation } from '../engines/achievement-engine.js';
import { campaignCfg, currentCampaignSave, storyIsAnchor, storyChapterDef, campaignArc, storyPrevContext, storyStatusInfo } from '../engines/campaign-engine.js';

const imageCache = new Map();

export function renderWorkloadOnly() {
  const q = simulatedBacklog(), pi = pressureInfo();
  const qe = byId('queue'); if (qe) qe.textContent = q;
  const pl = byId('pressureLabel'); if (pl) pl.textContent = pi[0];
  const pf = byId('pressureFill'); if (pf) { pf.style.width = pi[2] + '%'; pf.dataset.tone = pi[1]; }
  const qb = byId('queuePressureBox'); if (qb) qb.classList.toggle('pressure-high', pi[1] === 'bad');
  const avg = state.stats.processed ? Math.round(state.totalCaseSeconds / state.stats.processed) : state.caseWorkSeconds;
  const ae = byId('avgTime'); if (ae) ae.textContent = fmtClock(avg);
  const sc = byId('score'); if (sc) sc.textContent = overallScore();
  const ok = byId('overallKpi'); if (ok) ok.className = 'kpi ' + workloadClass(overallScore());
  renderEventBar();
}
export function renderEventBar() {
  const e = state.activeEvent, main = byId('eventMain'); if (!main) return;
  main.className = 'event-main' + (e ? ' ' + (e.tone || 'warn') : '');
  byId('eventTitle').textContent = e ? e.title : '운영상황 정상';
  byId('eventDesc').textContent = e ? `${e.desc} · 남은 ${e.remaining}건` : '현재 적용 중인 현장 이벤트가 없습니다.';
  byId('eventEffect').textContent = e ? eventEffectText(e) : 'NORMAL OPS';
  byId('difficultyLabel').textContent = difficultyCfg().label;
  const sl = byId('scenarioLabel'); if (sl) sl.textContent = scenarioCfg().name;
  const fat = Math.round(state.fatigue || 0), fv = byId('fatigueValue'), ff = byId('fatigueFill'), ft = byId('fatigueTrack');
  if (fv) fv.textContent = fat; if (ff) ff.style.width = Math.min(100, fat) + '%'; if (ft) ft.className = 'fatigue-track ' + (fat >= 85 ? 'bad' : fat >= 65 ? 'warn' : '');
}
export function renderChallengeHud() { const el = byId('challengeHud'), tx = byId('challengeHudText'); if (!el || !tx) return; const c = challengeCfg(), e = challengeEvaluation(false); tx.textContent = c.id === 'none' ? '일반 근무' : `${c.name} · ${e.pct}%`; el.className = 'challenge-hud ' + (c.id === 'none' ? '' : 'active'); el.title = c.desc; }
export function renderCampaignHud() { const hud = byId('campaignHud'), txt = byId('campaignHudText'); if (!hud) return; const id = state.campaignId || 'none'; if (id === 'none') { hud.hidden = true; return; } hud.hidden = false; const c = currentCampaignSave(), day = c?.day ?? state.campaignDay ?? 0; txt.textContent = `${campaignCfg(id).name} · DAY ${day + 1}/3`; }
export function renderStoryStrip() { const el = byId('storyCaseStrip'); if (!el) return; const c = current(); if (state.campaignId === 'none' || !storyIsAnchor(c)) { el.classList.remove('on'); el.hidden = true; return; } const arc = campaignArc(), d = storyChapterDef(), st = storyStatusInfo(); el.hidden = false; el.classList.add('on'); byId('storyCaseTitle').textContent = `연계사건 · ${d.title}`; byId('storyCaseText').textContent = `${arc.title} · ${storyPrevContext()}`; byId('storyCaseStatus').textContent = st[1]; }

export function renderTop() {
  const c = current(); if (!c) return;
  byId('caseCount').textContent = `${String(state.stats.processed).padStart(2, '0')} / ${session.queue.length}`;
  byId('progressFill').style.width = (state.stats.processed / session.queue.length * 100) + '%';
  byId('shiftLabel').textContent = c.shift === 1 ? '제1근무조 · 기초 심사' : c.shift === 2 ? '제2근무조 · 재심·목적 확인' : '제3근무조 · 특수사건';
  $$('.strike').forEach((e, i) => e.classList.toggle('on', i < state.strikes));
  renderAudioButton();
  byId('stProcessed').textContent = state.stats.processed; byId('stAdmitted').textContent = state.stats.admitted; byId('stSecondary').textContent = state.stats.secondary; byId('stRefused').textContent = state.stats.refused;
  renderWorkloadOnly(); renderChallengeHud(); renderCampaignHud();
}
export function renderAudioButton() { const b = byId('audioBtn'); if (!b) return; b.innerHTML = `<span class="sound-led" aria-hidden="true"></span>${state.audio ? '음향 켬' : '음향 끔'}`; b.classList.toggle('sound-active', state.audio); b.classList.toggle('sound-muted', !state.audio); b.setAttribute('aria-pressed', String(state.audio)); b.title = state.audio ? 'Web Audio 효과음 및 안내방송 차임 사용 중' : '음향이 꺼져 있습니다'; }
export function renderQueue() {
  const strip = byId('queueStrip'); if (!strip) return; const items = session.queue.slice(state.caseIndex, state.caseIndex + 10);
  strip.innerHTML = items.map((q, i) => { const t = getTraveler(q.travelerId); return `<div class="qperson ${i === 0 ? 'current' : ''}" title="${i === 0 ? '현재 호출 승객' : '대기 승객'}"><img src="${t.portrait}" alt="" loading="lazy" decoding="async"><small>${screeningNo(state.caseIndex + i)}</small></div>`; }).join('');
}
export function preloadQueueImages() { session.queue.slice(state.caseIndex, state.caseIndex + 10).forEach((q) => { const t = getTraveler(q.travelerId); if (!imageCache.has(t.id)) { const im = new Image(); im.src = t.portrait; imageCache.set(t.id, im); } }); }
export function startClock() { const tick = () => { const d = new Date(); const c = byId('clock'); if (c) c.textContent = d.toLocaleTimeString('ko-KR', { hour12: false }); renderWorkloadOnly(); }; tick(); setInterval(tick, 1000); }
export function showCallout(onSkip) { const e = byId('callout'); byId('callNo').textContent = screeningNo(); byId('callText').textContent = '12번 심사대로 오십시오.'; e.classList.add('on'); setTimeout(() => { if (e.classList.contains('on')) e.classList.remove('on'); }, 1050); byId('skipCall').onclick = () => { e.classList.remove('on'); onSkip && onSkip(); }; }

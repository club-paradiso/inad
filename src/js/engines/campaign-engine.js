// Three-day campaigns (DAY 1 → DAY 3 with operational carry-over) and their branching
// narrative arcs. Carry-over only adjusts workload/fatigue; narrative completion is for replay.
import { CAMPAIGNS, CAMPAIGN_ARCS } from '../../data/campaigns.js';
import { SCENARIOS } from '../../data/operations.js';
import { session, state } from '../state.js';
import { hashSeed, localDateKey } from './rng.js';
import { jsonGet, jsonSet, storeRemove } from '../services/storage.js';
import { CAMPAIGN_KEY, loadMeta, saveMeta } from './save-engine.js';
import { evaluateAchievements } from './achievement-engine.js';
import { bus, notify } from '../services/bus.js';

export { CAMPAIGNS, CAMPAIGN_ARCS };
export function campaignCfg(id = state?.campaignId || 'none') { return CAMPAIGNS[id] || CAMPAIGNS.none; }
export function freshCampaign(id) { return { version: 1, id, active: true, failed: false, day: 0, baseSeed: session.seed, startedAt: Date.now(), simStart: localDateKey(), results: [], carryBacklog: 0, carryFatigue: 0 }; }
export function loadCampaign() { const c = jsonGet(CAMPAIGN_KEY, null); return c && c.version === 1 && CAMPAIGNS[c.id] ? c : null; }
export function saveCampaign(c) { return jsonSet(CAMPAIGN_KEY, c); }
export function clearCampaign() { storeRemove(CAMPAIGN_KEY); }
export function campaignDaySeed(c) { return 100000 + (hashSeed(`${c.baseSeed}|CAMPAIGN|${c.id}|DAY|${c.day}`) % 900000); }
export function currentCampaignSave() { const c = loadCampaign(); return c && c.active ? c : null; }
export function campaignDayInfo() { const c = currentCampaignSave(); if (c && c.id === state.campaignId) return CAMPAIGNS[c.id].days[c.day] || null; const cfg = campaignCfg(); return cfg.days[state.campaignDay] || null; }
export function campaignCarryFromSession(s) { if (s.failed || s.grade === 'F') return { backlog: 8, fatigue: 22, label: '중대한 업무부담 이월' }; let backlog = 0, fatigue = 10, label = '통상 인수인계'; if ((s.overall || 0) >= 92 && (s.ops || 0) >= 85 && !(s.mistakes || []).length) { backlog = -4; fatigue = 5; label = '원활한 인수인계'; } else if ((s.overall || 0) < 82 || (s.ops || 0) < 75) { backlog = 6; fatigue = 18; label = '업무부담 이월'; } if ((s.breaksTaken || 0) > 0) fatigue = Math.max(0, fatigue - 3); return { backlog, fatigue, label }; }

export function setCampaign(id) {
  if (state.started) { notify.toast('근무 시작 후에는 캠페인을 변경할 수 없습니다.'); return false; }
  const active = currentCampaignSave(); if (active && id !== active.id) { notify.toast('진행 중 캠페인이 있습니다. 먼저 캠페인을 완료하거나 포기하십시오.'); return false; }
  if (!CAMPAIGNS[id]) return false; state.campaignId = id; state.campaignDay = active?.day || 0; state.campaignApplied = false; if (id === 'none') { state.campaignCarryBacklog = 0; state.campaignCarryFatigue = 0; } bus.emit('campaign'); return true;
}
// Sync state with an active campaign save (called on the start screen). Returns the day seed to use or null.
export function syncCampaignState() {
  const active = currentCampaignSave(); const id = active?.id || state.campaignId || 'none'; const day = active?.day ?? state.campaignDay ?? 0; state.campaignId = id; state.campaignDay = day;
  if (active) { state.campaignCarryBacklog = active.carryBacklog || 0; state.campaignCarryFatigue = active.carryFatigue || 0; const d = CAMPAIGNS[active.id].days[active.day]; state.scenarioId = d.scenario; state.scenarioApplied = false; return campaignDaySeed(active); }
  return null;
}
// Before a shift starts: create/continue the campaign save and return the seed that must be used.
export function prepareCampaignForStart() {
  let c = currentCampaignSave(); if (state.campaignId === 'none') { state.campaignDay = 0; state.campaignApplied = false; return null; }
  if (!c) { c = freshCampaign(state.campaignId); saveCampaign(c); }
  state.campaignId = c.id; state.campaignDay = c.day; state.campaignCarryBacklog = c.carryBacklog || 0; state.campaignCarryFatigue = c.carryFatigue || 0; const d = CAMPAIGNS[c.id].days[c.day]; state.scenarioId = d.scenario; state.scenarioApplied = false; state.campaignApplied = false;
  return campaignDaySeed(c);
}
export function applyCampaignDayCarry() { if (state.campaignId === 'none' || state.campaignApplied) return; const c = currentCampaignSave(); if (!c || c.id !== state.campaignId) return; state.backlogOffset += (c.carryBacklog || 0); state.fatigue = Math.max(state.fatigue, c.carryFatigue || 0); state.peakFatigue = Math.max(state.peakFatigue, state.fatigue); state.campaignApplied = true; state.eventHistory.push({ at: 0, type: 'CAMPAIGN', title: `캠페인 DAY ${c.day + 1} · ${CAMPAIGNS[c.id].name}`, effect: `이월 대기 ${c.carryBacklog >= 0 ? '+' : ''}${c.carryBacklog} · 시작 피로 ${c.carryFatigue}`, status: '연속근무' }); bus.emit('ops'); bus.emit('campaign'); }
export function abandonCampaign() {
  const c = currentCampaignSave(); if (!c) return false; const meta = loadMeta(); meta.campaignHistory = meta.campaignHistory || []; meta.campaignHistory.unshift({ id: c.id, name: CAMPAIGNS[c.id].name, startedDate: c.simStart, completed: false, results: c.results, avgOverall: c.results.length ? Math.round(c.results.reduce((a, r) => a + r.overall, 0) / c.results.length) : 0, bonusXP: 0 }); meta.campaignHistory = meta.campaignHistory.slice(0, 8); saveMeta(meta); clearCampaign();
  state.campaignId = 'none'; state.campaignDay = 0; state.campaignApplied = false; state.scenarioId = 'normal'; state.scenarioApplied = false; bus.emit('campaign'); bus.emit('ops'); return true;
}
export function advanceCampaign(session_) {
  if (!session_ || state.campaignId === 'none') return null; const c = currentCampaignSave(); if (!c || c.id !== state.campaignId) return null;
  const storySnapshot = ensureCampaignStory(c) ? JSON.parse(JSON.stringify(c.story)) : null;
  const cfg = CAMPAIGNS[c.id], idx = c.day, carry = campaignCarryFromSession(session_), res = { day: idx + 1, grade: session_.grade, overall: session_.overall, ops: session_.ops, pressurePeak: session_.pressurePeak, peakFatigue: session_.peakFatigue, scenarioId: session_.scenarioId, failed: !!session_.failed }; c.results[idx] = res;
  let completed = false, failed = !!session_.failed, bonusXP = 0, perfect = false;
  if (failed) { c.active = false; c.failed = true; } else if (idx >= cfg.days.length - 1) { c.active = false; completed = true; perfect = c.results.length === 3 && c.results.every((r) => r && r.grade === 'S'); bonusXP = cfg.bonus + (perfect ? cfg.perfectBonus : 0); } else { c.day = idx + 1; c.carryBacklog = carry.backlog; c.carryFatigue = carry.fatigue; c.active = true; }
  saveCampaign(c);
  const meta = loadMeta(); meta.campaignHistory = meta.campaignHistory || [];
  if (completed || failed) { const avg = Math.round(c.results.reduce((a, r) => a + (r?.overall || 0), 0) / Math.max(1, c.results.filter(Boolean).length)); meta.campaignHistory.unshift({ id: c.id, name: cfg.name, startedDate: c.simStart, completed, failed, perfect, results: c.results, avgOverall: avg, bonusXP, story: storySnapshot || undefined }); meta.campaignHistory = meta.campaignHistory.slice(0, 8); if (completed) { meta.career.campaignsCompleted = (meta.career.campaignsCompleted || 0) + 1; meta.career.campaignPerfect = (meta.career.campaignPerfect || 0) + (perfect ? 1 : 0); meta.career.campaignBest = meta.career.campaignBest || {}; meta.career.campaignBest[c.id] = Math.max(meta.career.campaignBest[c.id] || 0, avg); meta.career.xp = (meta.career.xp || 0) + bonusXP; state.newAchievements = [...(state.newAchievements || []), ...evaluateAchievements(meta.career)].filter((x, i, a) => a.indexOf(x) === i); } }
  const sess = meta.sessions.find((x) => x.id === session_.id); if (sess) { sess.campaignId = c.id; sess.campaignName = cfg.name; sess.campaignDay = idx + 1; sess.campaignCompleted = completed; sess.campaignBonus = bonusXP; if (storySnapshot) sess.campaignStory = storySnapshot; }
  saveMeta(meta);
  state.campaignResult = { cfg, c, res, carry, completed, failed, perfect, bonusXP, nextDay: c.day };
  return state.campaignResult;
}

// ---- Branching narrative (연계사건) ------------------------------------------------------------
export function campaignArc() { return CAMPAIGN_ARCS[state.campaignId] || null; }
export function ensureCampaignStory(c = currentCampaignSave()) { if (!c || !CAMPAIGN_ARCS[c.id]) return null; if (!c.story) c.story = { version: 1, arcId: c.id, chapters: {} }; return c.story; }
export function storyChapterDef() { const arc = campaignArc(); if (!arc) return null; return arc.chapters[state.campaignDay] || null; }
export function storyIsAnchor(c) { const d = storyChapterDef(); return !!(d && c && c.id === d.anchor); }
export function storyChapterSave(c = currentCampaignSave(), day = state.campaignDay) { const story = ensureCampaignStory(c); if (!story) return null; if (!story.chapters[day]) story.chapters[day] = { actions: [], status: 'pending', caseLabel: null, summary: null, updatedAt: Date.now() }; return story.chapters[day]; }
export function storyPrevContext() { const c = currentCampaignSave(); if (!c || state.campaignDay <= 0) return '첫날 기준자료를 만드는 단계입니다. 이전 근무의 선입견 없이 원자료부터 확인하십시오.'; const st = ensureCampaignStory(c), p = st?.chapters?.[state.campaignDay - 1]; if (!p) return '전일 연계기록이 없습니다. 현재 자료를 독립적으로 확인하십시오.'; if (p.status === 'complete') return `전일 연계검토 완료 · ${p.summary || '비교 기준선 확보'}`; if (p.status === 'partial') return `전일 기록 부분검토 · 누락된 원자료는 현재 사건에서 다시 확인하십시오.`; return '전일 연계기록이 미완료입니다. 이전 인상을 사실로 전제하지 말고 원자료를 다시 검증하십시오.'; }
export function storyStatusInfo() { const ch = storyChapterSave(); const n = ch?.actions?.length || 0; return n >= 3 ? ['complete', '연계검토 완료'] : n > 0 ? ['partial', `부분검토 ${n}/3`] : ['pending', '미검토']; }
// Records a linked-record check; returns the action definition or null (already done / not anchor).
export function recordStoryAction(c, id) { if (!storyIsAnchor(c)) return { ok: false }; const d = storyChapterDef(), a = d.actions.find((x) => x[0] === id); if (!a) return { ok: false }; const save = currentCampaignSave(), ch = storyChapterSave(save); if (ch.actions.includes(id)) return { ok: false, already: true }; ch.actions.push(id); ch.updatedAt = Date.now(); saveCampaign(save); return { ok: true, action: a }; }
export function finalizeStoryForCase(c, label) { if (!storyIsAnchor(c)) return null; const save = currentCampaignSave(), d = storyChapterDef(), ch = storyChapterSave(save), n = ch.actions.length; ch.status = n >= 3 ? 'complete' : n > 0 ? 'partial' : 'missed'; ch.caseLabel = label; ch.summary = n >= 3 ? `${d.title} · 3개 원자료 교차검증 완료` : n > 0 ? `${d.title} · ${n}/3 부분검토` : `${d.title} · 연계기록 미검토`; ch.updatedAt = Date.now(); saveCampaign(save); return { ...ch, title: d.title }; }
export const scenarioNameFor = (id) => SCENARIOS[id]?.name || id;

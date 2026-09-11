// Operational game variables: difficulty, scenario presets, field events, workload, fatigue and
// simulated processing time. None of these alter entry requirements or legal outcomes.
import { DIFFICULTY_CONFIG, FIELD_EVENT_TYPES, SCENARIOS, SHIFT_TARGETS } from '../../data/operations.js';
import { state, session } from '../state.js';
import { hashSeed, makeRng, shuffled } from './rng.js';
import { clampScore } from './score-engine.js';
import { behaviorAfterWork } from './behavior-engine.js';
import { bus, notify } from '../services/bus.js';
import { addLog } from './log.js';

export function difficultyCfg() { return DIFFICULTY_CONFIG[state?.difficulty || 'standard'] || DIFFICULTY_CONFIG.standard; }
export function scenarioCfg(id = state?.scenarioId || 'normal') { return SCENARIOS[id] || SCENARIOS.normal; }
export function difficultyName(k) { return DIFFICULTY_CONFIG?.[k]?.label || ({ training: '훈련', standard: '표준', realistic: '실전' })[k] || k; }

export function generateEventSchedule(seed, difficulty = 'standard') {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.standard, rng = makeRng(hashSeed(seed + '|FIELD_EVENTS|' + difficulty));
  const slots = shuffled([2, 6, 10, 14, 18, 22, 26, 30, 33], rng).slice(0, cfg.eventCount).sort((a, b) => a - b);
  const types = shuffled(FIELD_EVENT_TYPES, rng); return slots.map((at, i) => ({ at, type: types[i % types.length].id }));
}
export function eventType(id) { return FIELD_EVENT_TYPES.find((x) => x.id === id); }
export function eventImpactValue(v) { return Math.round((v || 0) * difficultyCfg().impact); }
export function fieldTimeMultiplier(kind = 'work') {
  let f = difficultyCfg().workFactor; const sc = scenarioCfg(), e = state.activeEvent; if (kind === 'lookup' || kind === 'repeat') f *= sc.lookupFactor || 1;
  if (e?.timeFactor) f *= 1 + (e.timeFactor - 1) * difficultyCfg().impact;
  if (e?.lookupFactor && (kind === 'lookup' || kind === 'repeat')) f *= 1 + (e.lookupFactor - 1) * difficultyCfg().impact;
  if ((state.fatigue || 0) >= 85) f *= 1.04; else if ((state.fatigue || 0) >= 70) f *= 1.02;
  return f;
}
export function eventEffectText(e) { if (!e) return 'NORMAL OPS'; if (e.id === 'ARRIVAL_SURGE' || e.id === 'GROUP_WAVE') return `대기 +${eventImpactValue(e.backlog)}명`; if (e.id === 'FLIGHT_DELAY' || e.id === 'RELIEF_BOOTH' || e.id === 'NETWORK_RECOVERY') return `대기 ${eventImpactValue(e.backlog)}명`; if (e.id === 'SYSTEM_LATENCY') return '조회 응답 지연'; if (e.id === 'INTERPRETER_QUEUE') return `통역 +${eventImpactValue(e.interpreterExtra)}초`; if (e.id === 'BOOTH_OUTAGE') return '처리시간 증가'; return e.effect || '운영변수'; }

export function maybeStartFieldEvent() {
  if (state.activeEvent) return null; const row = (state.eventSchedule || []).find((x) => x.at === state.stats.processed && !state.eventHistory.some((h) => h.at === x.at && h.type === x.type)); if (!row) return null; const base = eventType(row.type); if (!base) return null;
  const e = { ...base, at: row.at, remaining: base.duration }; state.activeEvent = e; state.eventsSeen++; const bd = eventImpactValue(e.backlog); if (bd) state.backlogOffset += bd;
  state.eventHistory.push({ at: row.at, type: e.id, title: e.title, effect: eventEffectText(e), status: '시작' });
  addLog('system', `[현장 운영] ${e.title} — ${e.desc} ${eventEffectText(e)}.`);
  bus.emit('fieldEvent', e); bus.emit('ops');
  return e;
}
export function advanceFieldEventAfterCase() { const e = state.activeEvent; if (!e) return; e.remaining--; if (e.remaining <= 0) { state.eventHistory.push({ at: state.stats.processed, type: e.id, title: e.title, effect: '운영상황 종료', status: '종료' }); state.activeEvent = null; } bus.emit('ops'); }

export function setDifficulty(k) { if (state.started) { notify.toast('근무 시작 후에는 난이도를 변경할 수 없습니다.'); return false; } if (!DIFFICULTY_CONFIG[k]) return false; state.difficulty = k; state.eventSchedule = generateEventSchedule(session.seed, k); bus.emit('ops'); return true; }
export function setScenario(id) { if (state.started) { notify.toast('근무 시작 후에는 시나리오를 변경할 수 없습니다.'); return false; } if (!SCENARIOS[id]) return false; state.scenarioId = id; state.scenarioApplied = false; bus.emit('ops'); return true; }
export function applyScenarioStart() { if (state.scenarioApplied) return; const sc = scenarioCfg(); state.backlogOffset += (sc.backlog || 0); state.pressurePeak = Math.max(state.pressurePeak, simulatedBacklog()); state.scenarioApplied = true; if (sc.id !== 'normal') { state.eventHistory.push({ at: 0, type: 'SCENARIO', title: `시나리오 · ${sc.name}`, effect: sc.desc, status: '적용' }); notify.toast(`시나리오 적용 · ${sc.name}`); } bus.emit('ops'); }
export function takeScheduledBreak() { state.breaksTaken++; state.fatigue = Math.max(0, state.fatigue - 30); state.simSeconds += 90; state.backlogOffset += 2; state.eventHistory.push({ at: state.stats.processed, type: 'BREAK', title: '교대 지원 휴식', effect: '피로도 -30 · 대기 +2명', status: '휴식' }); bus.emit('ops'); }

export function spendWork(sec, kind = 'work') {
  let base = sec; if (kind === 'interpreter' && state.activeEvent?.interpreterExtra) base += eventImpactValue(state.activeEvent.interpreterExtra); if (kind === 'interpreter') base += scenarioCfg().interpreterExtra || 0;
  const actual = Math.max(1, Math.round(base * fieldTimeMultiplier(kind)));
  state.caseWorkSeconds += actual; state.simSeconds += actual; state.fatigue = Math.min(100, state.fatigue + actual / 60 * (scenarioCfg().fatigueFactor || 1)); state.peakFatigue = Math.max(state.peakFatigue, state.fatigue); state.pressurePeak = Math.max(state.pressurePeak, simulatedBacklog());
  if (kind === 'repeat') { state.repeatedLookups++; state.efficiency = clampScore(state.efficiency - 1); }
  behaviorAfterWork(actual, kind); bus.emit('ops');
  return actual;
}
export function simulatedBacklog() { const every = difficultyCfg().arrivalEvery / Math.max(.5, scenarioCfg().arrivalFactor || 1), arrivals = Math.floor(state.simSeconds / every); return Math.max(3, 37 + (state.backlogOffset || 0) + arrivals - state.stats.processed); }
export function pressureInfo() { const q = simulatedBacklog(); return q <= 27 ? ['안정', 'good', 34] : q <= 39 ? ['보통', 'warn', 58] : ['혼잡', 'bad', Math.min(100, 58 + (q - 39) * 5)]; }
export function shiftStats(sh) { const rs = state.reports.filter((r) => r.shift === sh); if (!rs.length) return { count: 0, avg: 0, target: SHIFT_TARGETS[sh].avg, status: '대기' }; const avg = Math.round(rs.reduce((a, r) => a + r.seconds, 0) / rs.length), target = SHIFT_TARGETS[sh].avg; return { count: rs.length, avg, target, status: avg <= target ? '목표 달성' : avg <= target * 1.2 ? '주의' : '지연' }; }
export { SHIFT_TARGETS };

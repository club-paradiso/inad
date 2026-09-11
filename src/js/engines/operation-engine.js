// Operational game variables: airport profile, difficulty, scenario presets, field events,
// workload and fatigue. None of these alter entry requirements or legal outcomes.
import { DIFFICULTY_CONFIG, FIELD_EVENT_TYPES, SCENARIOS, SHIFT_TARGETS } from '../../data/operations.js';
import { airportById } from '../../data/airports.js';
import { state, session, emptyLiveOps } from '../state.js';
import { hashSeed, makeRng, shuffled } from './rng.js';
import { behaviorAfterWork } from './behavior-engine.js';
import { bus, notify } from '../services/bus.js';
import { storeSet } from '../services/storage.js';
import { fetchAirportLiveLoad } from '../services/airport-live.js';
import { addLog } from './log.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function difficultyCfg() { return DIFFICULTY_CONFIG[state?.difficulty || 'standard'] || DIFFICULTY_CONFIG.standard; }
export function scenarioCfg(id = state?.scenarioId || 'normal') { return SCENARIOS[id] || SCENARIOS.normal; }
export function airportCfg(id = state?.airportId || 'icn-t2') { return airportById(id); }
export function difficultyName(k) { return DIFFICULTY_CONFIG?.[k]?.label || ({ training: '훈련', standard: '표준', realistic: '실전' })[k] || k; }

// Converts the next-two-hour international-arrival snapshot into a relative GAMEPLAY load.
// liveTargetArrivals is a normalization target for game balance, not a real airport capacity.
export function rawLiveLoadFactor(snapshot, targetArrivals) {
  const target = Math.max(1, Number(targetArrivals) || 1);
  const arrivals = Math.max(0, Number(snapshot?.arrivals) || 0);
  const delayed = Math.max(0, Number(snapshot?.delayed) || 0);
  const ratio = arrivals / target;
  const delayRatio = arrivals ? Math.min(1, delayed / arrivals) : 0;
  return clamp(.82 + ratio * .18 + delayRatio * .05, .80, 1.28);
}

// A live traffic spike must not silently turn Training back into hard mode. The user-selected
// difficulty remains the primary control; real-time data is a bounded operational modifier.
export function boundedLiveLoadFactor(raw = state?.liveOps?.factor, difficulty = state?.difficulty || 'standard') {
  const value = Number.isFinite(Number(raw)) ? Number(raw) : 1;
  const range = difficulty === 'training' ? [.94, 1.06] : difficulty === 'realistic' ? [.82, 1.24] : [.88, 1.15];
  return clamp(value, range[0], range[1]);
}
export function liveLoadFactor() { return state?.liveOps?.live ? boundedLiveLoadFactor(state.liveOps.factor) : 1; }
export function liveLoadPressure(factor = state?.liveOps?.factor || 1) {
  if (factor < .92) return 'quiet';
  if (factor <= 1.08) return 'normal';
  if (factor <= 1.18) return 'busy';
  return 'surge';
}
export function appliedLiveLoad() { return { ...state.liveOps, appliedFactor: liveLoadFactor() }; }

export async function refreshAirportLiveLoad({ force = false } = {}) {
  if (state.started) return appliedLiveLoad();
  const ap = airportCfg(), requestedId = ap.id;
  state.liveOps = { ...emptyLiveOps('loading'), airport: ap.code };
  bus.emit('airportLive', state.liveOps); bus.emit('ops');
  try {
    const data = await fetchAirportLiveLoad(ap.code, { force });
    if (state.airportId !== requestedId) return appliedLiveLoad();
    if (!data?.live || !data?.available) {
      state.liveOps = {
        ...emptyLiveOps('fallback'), airport: ap.code, stale: !!data?.stale,
        arrivals: data?.arrivals ?? null, delayed: Number(data?.delayed) || 0, cancelled: Number(data?.cancelled) || 0,
        checkedAt: data?.checkedAt || null, source: data?.source || 'baseline', sourceLabel: data?.sourceLabel || '공항 기본 게임 프리셋', reason: data?.reason || 'live-data-unavailable'
      };
    } else {
      const factor = rawLiveLoadFactor(data, ap.liveTargetArrivals);
      state.liveOps = {
        status: 'live', live: true, available: true, stale: false, airport: ap.code,
        factor, pressure: liveLoadPressure(factor), arrivals: Number(data.arrivals) || 0,
        delayed: Number(data.delayed) || 0, cancelled: Number(data.cancelled) || 0,
        windowMinutes: Number(data.windowMinutes) || 120, checkedAt: data.checkedAt || new Date().toISOString(),
        source: data.source || 'official', sourceLabel: data.sourceLabel || '공식 공항 운항정보', reason: null
      };
    }
  } catch (error) {
    if (state.airportId === requestedId) state.liveOps = { ...emptyLiveOps('fallback'), airport: ap.code, reason: error?.name === 'AbortError' ? 'timeout' : 'network-error' };
  }
  bus.emit('airportLive', state.liveOps); bus.emit('ops');
  return appliedLiveLoad();
}

export function generateEventSchedule(seed, difficulty = 'standard', airportId = state?.airportId || 'icn-t2') {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.standard, ap = airportCfg(airportId);
  const rng = makeRng(hashSeed(seed + '|FIELD_EVENTS|' + difficulty + '|' + ap.id));
  const slots = shuffled([2, 6, 10, 14, 18, 22, 26, 30, 33], rng);
  const count = Math.max(2, Math.min(slots.length, cfg.eventCount + (ap.eventDelta || 0)));
  const picked = slots.slice(0, count).sort((a, b) => a - b);
  const types = shuffled(FIELD_EVENT_TYPES, rng); return picked.map((at, i) => ({ at, type: types[i % types.length].id }));
}
export function eventType(id) { return FIELD_EVENT_TYPES.find((x) => x.id === id); }
export function eventImpactValue(v) {
  const liveEventFactor = 1 + (liveLoadFactor() - 1) * .45;
  return Math.round((v || 0) * difficultyCfg().impact * (airportCfg().eventImpact || 1) * liveEventFactor);
}
export function fieldTimeMultiplier(kind = 'work') {
  const ap = airportCfg();
  let f = difficultyCfg().workFactor * (ap.workFactor || 1); const sc = scenarioCfg(), e = state.activeEvent;
  if (kind === 'lookup' || kind === 'repeat') f *= (sc.lookupFactor || 1) * (ap.lookupFactor || 1);
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

export function setAirport(id) {
  if (state.started) { notify.toast('근무 시작 후에는 공항을 변경할 수 없습니다.'); return false; }
  const ap = airportCfg(id); if (!ap || ap.id !== id) return false;
  const changed = state.airportId !== id;
  state.airportId = id; state.airportApplied = false; storeSet('inad-airport', id);
  if (changed) state.liveOps = { ...emptyLiveOps(), airport: ap.code };
  state.eventSchedule = generateEventSchedule(session.seed, state.difficulty, id); bus.emit('ops'); return true;
}
export function setDifficulty(k) { if (state.started) { notify.toast('근무 시작 후에는 난이도를 변경할 수 없습니다.'); return false; } if (!DIFFICULTY_CONFIG[k]) return false; state.difficulty = k; state.eventSchedule = generateEventSchedule(session.seed, k, state.airportId); bus.emit('ops'); return true; }
export function setScenario(id) { if (state.started) { notify.toast('근무 시작 후에는 시나리오를 변경할 수 없습니다.'); return false; } if (!SCENARIOS[id]) return false; state.scenarioId = id; state.scenarioApplied = false; bus.emit('ops'); return true; }
export function applyScenarioStart() {
  const ap = airportCfg();
  if (!state.airportApplied) {
    state.airportApplied = true;
    state.eventHistory.push({ at: 0, type: 'AIRPORT', title: `근무공항 · ${ap.nameKo}`, effect: ap.profileKo, status: '적용' });
    if (state.liveOps?.live) {
      const factor = liveLoadFactor();
      state.eventHistory.push({ at: 0, type: 'LIVE_LOAD', title: '실시간 운항 스냅샷', effect: `향후 ${state.liveOps.windowMinutes || 120}분 국제선 도착 ${state.liveOps.arrivals}편 · 운영계수 ${factor.toFixed(2)}x`, status: '적용' });
    }
  }
  if (state.scenarioApplied) return; const sc = scenarioCfg(); state.backlogOffset += (sc.backlog || 0); state.pressurePeak = Math.max(state.pressurePeak, simulatedBacklog()); state.scenarioApplied = true; if (sc.id !== 'normal') { state.eventHistory.push({ at: 0, type: 'SCENARIO', title: `시나리오 · ${sc.name}`, effect: sc.desc, status: '적용' }); notify.toast(`시나리오 적용 · ${sc.name}`); } bus.emit('ops');
}
export function takeScheduledBreak() {
  const difficulty = state.difficulty || 'standard';
  const simCost = difficulty === 'training' ? 45 : difficulty === 'standard' ? 60 : 90;
  const backlogCost = difficulty === 'training' ? 0 : difficulty === 'standard' ? 1 : 2;
  state.breaksTaken++;
  state.fatigue = Math.max(0, state.fatigue - 30);
  state.simSeconds += simCost;
  state.backlogOffset += backlogCost;
  state.eventHistory.push({ at: state.stats.processed, type: 'BREAK', title: '교대 지원 휴식', effect: `피로도 -30 · 대기 +${backlogCost}명`, status: '휴식' });
  bus.emit('ops');
}

export function spendWork(sec, kind = 'work') {
  const ap = airportCfg();
  let base = sec; if (kind === 'interpreter' && state.activeEvent?.interpreterExtra) base += eventImpactValue(state.activeEvent.interpreterExtra); if (kind === 'interpreter') base += (scenarioCfg().interpreterExtra || 0) + (ap.interpreterExtra || 0);
  const actual = Math.max(1, Math.round(base * fieldTimeMultiplier(kind)));
  state.caseWorkSeconds += actual; state.simSeconds += actual; state.fatigue = Math.min(100, state.fatigue + actual / 60 * (scenarioCfg().fatigueFactor || 1) * (ap.fatigueFactor || 1)); state.peakFatigue = Math.max(state.peakFatigue, state.fatigue); state.pressurePeak = Math.max(state.pressurePeak, simulatedBacklog());
  // A repeated lookup already costs simulated time and therefore affects queue pressure and case efficiency.
  // Track it for post-shift feedback, but do not immediately subtract another efficiency point.
  if (kind === 'repeat') state.repeatedLookups++;
  behaviorAfterWork(actual, kind); bus.emit('ops');
  return actual;
}
export function simulatedBacklog() {
  const ap = airportCfg();
  const arrivalFactor = (scenarioCfg().arrivalFactor || 1) * (ap.arrivalFactor || 1) * liveLoadFactor();
  const every = difficultyCfg().arrivalEvery / Math.max(.45, arrivalFactor), arrivals = Math.floor(state.simSeconds / every);
  return Math.max(3, 37 + (state.backlogOffset || 0) + arrivals - state.stats.processed);
}
export function pressureInfo() { const q = simulatedBacklog(); return q <= 27 ? ['안정', 'good', 34] : q <= 39 ? ['보통', 'warn', 58] : ['혼잡', 'bad', Math.min(100, 58 + (q - 39) * 5)]; }
export function shiftStats(sh) { const rs = state.reports.filter((r) => r.shift === sh); if (!rs.length) return { count: 0, avg: 0, target: SHIFT_TARGETS[sh].avg, status: '대기' }; const avg = Math.round(rs.reduce((a, r) => a + r.seconds, 0) / rs.length), target = SHIFT_TARGETS[sh].avg; return { count: rs.length, avg, target, status: avg <= target ? '목표 달성' : avg <= target * 1.2 ? '주의' : '지연' }; }
export { SHIFT_TARGETS };

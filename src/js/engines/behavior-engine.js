// Passenger interaction layer (stress / rapport). Purely a dialogue-UX variable:
// it changes how answers are phrased, never whether a person is admissible.
import { BEHAVIOR_PROFILES } from '../../data/behavior-profiles.js';
import { state } from '../state.js';
import { getTraveler } from './traveler-engine.js';
import { bus } from '../services/bus.js';

export function behaviorHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function makeBehavior(c) {
  const t = getTraveler(c.travelerId); let p = BEHAVIOR_PROFILES[behaviorHash(t.id) % BEHAVIOR_PROFILES.length];
  if (c.special === 'forgery') p = { key: 'guarded', name: '경계적', stress: 43, rapport: 42, sensitivity: 1.08, wait: 1.0, style: 'closed' };
  else if (c.special === 'refugee') p = { key: 'anxious', name: '불안·긴장', stress: 47, rapport: 62, sensitivity: 1.25, wait: 1.15, style: 'tense' };
  return { profile: p, stress: p.stress, rapport: p.rapport, lastStress: p.stress, lastRapport: p.rapport, lastEvent: '심사 시작', repeatCount: 0, turns: 0 };
}
export function behaviorClamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
export function behaviorBand(b = state.behavior) { if (!b) return { label: '협조적', cls: 'calm', response: '원활' }; if (b.stress >= 82) return { label: '매우 긴장', cls: 'upset', response: '응답이 짧아짐' }; if (b.stress >= 62) return { label: '긴장', cls: 'tense', response: '신중하게 응답' }; if (b.rapport <= 42) return { label: '경계적', cls: 'closed', response: '거리감 있는 응답' }; if (b.stress <= 28 && b.rapport >= 68) return { label: '협조적', cls: 'calm', response: '원활' }; return { label: '신중', cls: 'closed', response: '차분하게 응답' }; }
export function behaviorSensitivity(q) { const map = { '기본사항': 3, '여행·체류': 4, '재정': 7, '국내관계': 8, '직업': 7, '과거입국': 8, '추가소명': 10 }; let n = map[q.cat] || 5; if (q.requires?.length) n += 3; if (q.contradiction) n += 5; return n; }
export function behaviorAdjust(stressDelta = 0, rapportDelta = 0, event = '') {
  if (!state.behavior) return; const b = state.behavior; b.lastStress = b.stress; b.lastRapport = b.rapport; b.stress = behaviorClamp(b.stress + stressDelta); b.rapport = behaviorClamp(b.rapport + rapportDelta); if (event) b.lastEvent = event; bus.emit('behavior');
}
export function behaviorAfterWork(sec, kind) { if (!state.behavior || sec < 18 || ['decision', 'repatriation'].includes(kind)) return; const b = state.behavior; const waiting = Math.max(0, Math.floor(sec / 24)) * b.profile.wait; if (waiting >= 1) behaviorAdjust(waiting, 0, '대기시간 증가'); }
export function behaviorOnQuestion(q, repeat = false) { const b = state.behavior; if (!b) return; let delta = behaviorSensitivity(q) * b.profile.sensitivity; if (repeat) { delta += 8; b.repeatCount++; state.repeatedQuestions++; state.efficiency = Math.max(0, Math.min(100, Math.round(state.efficiency - 1))); behaviorAdjust(delta, -5, '동일 질문 재질문'); return; } b.turns++; const rapportGain = q.cat === '기본사항' || q.cat === '여행·체류' ? 1 : 0; behaviorAdjust(delta, rapportGain, q.cat + ' 질문'); }
export function behaviorResponse(q, repeat = false) {
  const b = state.behavior; if (!b) return q.a; if (repeat) { if (b.stress >= 72) return `앞서 말씀드린 내용과 같습니다. ${q.a}`; return `네, 다시 말씀드리면 ${q.a}`; }
  if (b.stress >= 82) return `조금 긴장되지만 사실대로 말씀드리겠습니다. ${q.a}`;
  if (b.stress >= 62) return `네. ${q.a}`;
  if (b.rapport <= 42) return `${q.a}`;
  if (b.profile.key === 'friendly' && b.turns <= 2) return `네, 알겠습니다. ${q.a}`;
  return q.a;
}
export function behaviorLogClass() { const b = behaviorBand(); return b.cls === 'upset' ? 'behavior-upset' : b.cls === 'tense' ? 'behavior-tense' : b.cls === 'calm' ? 'behavior-calm' : ''; }

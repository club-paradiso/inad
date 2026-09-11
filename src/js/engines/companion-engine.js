// Travel-party (동행인) cross-check logic. Statements of companions are context for
// verification only — party membership never decides admissibility.
import { session, state } from '../state.js';
import { current, currentQueueItem, caseForQueueItem } from './queue-engine.js';
import { getTraveler } from './traveler-engine.js';

export function travelPartyFor(c = current()) { return c ? session.partyByTraveler.get(c.travelerId) || null : null; }
export function partyMemberCase(m) { const q = session.queue[m.queueIndex]; return q ? caseForQueueItem(q) : null; }
export function partyStatusForTraveler(id) { if (currentQueueItem()?.travelerId === id) return 'current'; if (session.partyArchive.has(id)) return 'done'; return 'waiting'; }

export function archivePartyStatement(c = current()) {
  const party = travelPartyFor(c); if (!party) return;
  const t = getTraveler(c.travelerId);
  session.partyArchive.set(t.id, { travelerId: t.id, name: t.name.korean, purpose: c.purpose, stay: c.stay, hotel: party.hotel, pnr: party.sharedPNR, relation: party.members.find((m) => m.travelerId === t.id)?.relation || '동행인', partyPlanAsked: state.asked.has('partyPlan'), partyRelationAsked: state.asked.has('partyRelation'), summary: state.asked.has('partyPlan') ? '동행 일정·숙소 진술 확인 완료' : '기본 심사 기록만 존재' });
}

export function partyCrossCheck(party = travelPartyFor()) {
  if (!party) return { status: 'none', text: '등록된 동행정보 없음', archives: [] };
  const archives = party.members.map((m) => session.partyArchive.get(m.travelerId)).filter(Boolean);
  if (!archives.length) return { status: 'pending', text: '먼저 처리된 동행인의 진술기록이 아직 없습니다.', archives };
  const mismatch = party.mode === 'minor-resolved' && state.asked.has('partyPlan');
  return { status: mismatch ? 'review' : 'ok', text: mismatch ? '기본 숙소·공동예약은 일치하나 개별 자유일정 설명이 다릅니다. 일정 차이의 합리적 사유를 확인하십시오.' : '앞서 처리된 동행인의 공동예약·숙소·체류계획과 대체로 일치합니다.', archives };
}

export function partyLookupResult(c = current()) {
  const party = travelPartyFor(c); if (!party) return ['정상', '연결된 동행여행 기록이 없습니다.'];
  const x = partyCrossCheck(party); const names = party.members.map((m) => getTraveler(m.travelerId).name.korean).join(', ');
  return [x.status === 'review' ? '주의' : '정상', `${party.label} ${party.members.length}명 · 공동예약 ${party.sharedPNR} · ${x.text} · 구성원: ${names}`];
}

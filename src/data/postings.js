// 정규 근무 배치 (v13). A posting is a named bundle of the existing duty options (difficulty, scenario, guidance),
// so starting a 36-passenger duty is one choice instead of five option grids. Postings add no rule of their own:
// the legal answer of every case is the same in every posting, and each option stays adjustable under 세부 설정.
// `after` is the number of finished duties after which the posting becomes the suggested next one; nothing is locked.
export const POSTINGS = [
  { id: 'trainee', after: 0, difficulty: 'training', scenario: 'normal', guidance: 'guided', ko: ['수습 창구', '여유 있는 대기열 · 화면 안내 · 처음 여섯 명은 성급한 결정을 한 번 막아 줍니다'], en: ['Trainee desk', 'Relaxed queue · screen tour · one early decision is caught for the first six travelers'] },
  { id: 'day', after: 1, difficulty: 'standard', scenario: 'normal', guidance: 'expert', ko: ['주간 창구', '표준 대기열 · 안내 없이 혼자 판단합니다'], en: ['Day desk', 'Standard queue · no coaching'] },
  { id: 'surge', after: 2, difficulty: 'standard', scenario: 'arrival', guidance: 'expert', ko: ['도착편 집중 시간대', '시작부터 줄이 길고 승객이 빨리 밀려듭니다'], en: ['Arrival bank', 'Long queue from the start and faster arrivals'] },
  { id: 'systems', after: 3, difficulty: 'standard', scenario: 'systems', guidance: 'expert', ko: ['전산 점검일', '조회가 느립니다 · 꼭 필요한 조회만 골라야 합니다'], en: ['System maintenance day', 'Slow lookups · query only what you need'] },
  { id: 'night', after: 4, difficulty: 'standard', scenario: 'night', guidance: 'expert', ko: ['야간 근무', '피로가 빨리 쌓입니다 · 교대 휴식을 언제 쓸지가 변수입니다'], en: ['Night duty', 'Fatigue builds faster · timing the relief break matters'] },
  { id: 'live', after: 5, difficulty: 'realistic', scenario: 'normal', guidance: 'expert', ko: ['실전 창구', '빠른 유입 · 현장 변수 최다 · 실수 허용 폭이 가장 좁습니다'], en: ['Front-line desk', 'Fast arrivals · most field events · least room for error'] }
];
export function postingFor({ difficulty, scenarioId, guidance, challengeId = 'none', campaignId = 'none' }) {
  if (challengeId !== 'none' || campaignId !== 'none') return null;
  return POSTINGS.find((p) => p.difficulty === difficulty && p.scenario === scenarioId && p.guidance === guidance) || null;
}
export function suggestedPosting(completedShifts = 0) {
  const n = Math.max(0, Number(completedShifts) || 0);
  return [...POSTINGS].reverse().find((p) => p.after <= n) || POSTINGS[0];
}

// Deterministic evidence graph engine for ATLAS international workstation.
export const RELATIONSHIP_TYPES = {
  MATCH: 'MATCH',
  CONFLICT: 'CONFLICT',
  MISSING: 'MISSING',
  UNVERIFIED: 'UNVERIFIED'
};

const isStr = (s, max = 100) => typeof s === 'string' && s.length > 0 && s.length <= max;
const isIdList = (arr, max = 50) => Array.isArray(arr) && arr.length <= max && new Set(arr).size === arr.length && arr.every((id) => isStr(id));
const isHistoryEntry = (h) => (
  !!h && typeof h === 'object' && !Array.isArray(h) &&
  typeof h.time === 'number' && Number.isFinite(h.time) && h.time > 0 &&
  isStr(h.factA) && isStr(h.factB) && h.factA !== h.factB &&
  typeof h.type === 'string' && Object.values(RELATIONSHIP_TYPES).includes(h.type) &&
  (h.findingId === null || isStr(h.findingId))
);

export function createEmptyGraph() {
  return { selectedFacts: [], discoveries: [], unlockedQuestions: [], evidenceRequests: [], investigationPath: null, history: [] };
}

export function validateGraphState(g) {
  return !!g && typeof g === 'object' && !Array.isArray(g) &&
    isIdList(g.selectedFacts, 2) &&
    isIdList(g.discoveries, 50) &&
    isIdList(g.unlockedQuestions, 50) &&
    isIdList(g.evidenceRequests, 50) &&
    (g.investigationPath === null || ['records_first', 'interview_first'].includes(g.investigationPath)) &&
    (g.history === undefined || (Array.isArray(g.history) && g.history.length <= 100 && g.history.every(isHistoryEntry)));
}

const cleanList = (arr, max) => Array.isArray(arr) ? [...new Set(arr.filter((x) => isStr(x)))].slice(0, max) : [];

export function normalizeGraph(g) {
  if (!g || typeof g !== 'object' || Array.isArray(g)) return createEmptyGraph();
  return {
    selectedFacts: cleanList(g.selectedFacts, 2),
    discoveries: cleanList(g.discoveries, 50),
    unlockedQuestions: cleanList(g.unlockedQuestions, 50),
    evidenceRequests: cleanList(g.evidenceRequests, 50),
    investigationPath: ['records_first', 'interview_first'].includes(g.investigationPath) ? g.investigationPath : null,
    history: Array.isArray(g.history) ? g.history.filter(isHistoryEntry).slice(0, 100) : []
  };
}

export function compareFacts(scenario, factIdA, factIdB) {
  if (!scenario || !factIdA || !factIdB || factIdA === factIdB) return { ok: false, reason: 'invalid' };
  const facts = scenario.facts || [];
  const factA = facts.find((f) => f.id === factIdA);
  const factB = facts.find((f) => f.id === factIdB);
  if (!factA || !factB) return { ok: false, reason: 'unknown' };

  const found = (scenario.comparisons || []).find((c) =>
    (c.facts[0] === factIdA && c.facts[1] === factIdB) ||
    (c.facts[0] === factIdB && c.facts[1] === factIdA)
  );

  if (found) {
    return { ok: true, found: true, comparison: { ...found, facts: [factA, factB] } };
  }
  return {
    ok: true, found: false,
    comparison: {
      id: null, findingId: null, type: RELATIONSHIP_TYPES.UNVERIFIED,
      title: { ko: '직접 연관 미확인', en: 'No direct link' },
      explanation: { ko: '직접적인 일치나 모순이 확인되지 않았습니다.', en: 'No direct link.' },
      unlocks: {}, facts: [factA, factB]
    }
  };
}

export function evaluateDebrief(scenario, caseState) {
  if (!scenario || !caseState) return null;
  const graph = normalizeGraph(caseState.graph);
  const discoveries = graph.discoveries;
  const isVerticalSlice = ['SIM-CA-01', 'SIM-GB-02', 'SIM-NZ-02'].includes(scenario.id);
  let discrepancyIdentified = false, missingDistinguished = false, followUpCompleted = false;
  const feedback = [];

  const fb = (ko, en) => feedback.push({ ko, en });
  if (scenario.id === 'SIM-CA-01') {
    discrepancyIdentified = discoveries.includes('CA01_DATE_CONFLICT');
    missingDistinguished = discoveries.includes('CA01_RECORD_UNAMENDED') || (discrepancyIdentified && discoveries.includes('CA01_TICKET_MATCHES_STMT'));
    const statementVerified = discoveries.includes('CA01_TICKET_MATCHES_STMT');
    const askedClarification = caseState.asked.includes('clarify_dates') || caseState.asked.includes('clarify');
    followUpCompleted = askedClarification && statementVerified;
    if (discrepancyIdentified) fb('출국일 상충 확인', 'Date conflict confirmed');
    if (statementVerified) fb('날짜 오기 진술 검증', 'Statement verified');
    if (!discrepancyIdentified) fb('출국일 불일치 미확인', 'Date conflict missed');
    if (!followUpCompleted) fb('진술 대조 미완료', 'Follow-up comparison incomplete');
  } else if (scenario.id === 'SIM-GB-02') {
    discrepancyIdentified = discoveries.includes('GB02_DURATION_GAP');
    missingDistinguished = discoveries.includes('GB02_ITINERARY_SEPARATED') || discoveries.includes('GB02_TOTAL_DAYS_ACCOUNTED');
    const askedRemaining = caseState.asked.includes('gb02_remaining_days');
    const tourismVerified = discoveries.includes('GB02_TOTAL_DAYS_ACCOUNTED') || discoveries.includes('GB02_ITINERARY_SEPARATED');
    followUpCompleted = askedRemaining && tourismVerified;
    if (discrepancyIdentified) fb('행사·체류 기간 분리 확인', 'Duration gap separated');
    if (tourismVerified) fb('관광 일정 해명 확인', 'Tourism itinerary confirmed');
    if (!discrepancyIdentified) fb('기간 차이 미대조', 'Duration gap unexamined');
    if (!followUpCompleted) fb('잔여 체류 조사 미완료', 'Remaining stay inquiry incomplete');
  } else if (scenario.id === 'SIM-NZ-02') {
    discrepancyIdentified = discoveries.includes('NZ02_PAGE2_MISSING');
    missingDistinguished = discoveries.includes('NZ02_PAGE2_MISSING');
    const hasRequest = graph.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2');
    const askedMissing = caseState.asked.includes('nz02_missing_page');
    const statementChecked = discoveries.includes('NZ02_PAGE2_CONFIRMED');
    followUpCompleted = hasRequest && askedMissing && statementChecked;
    if (discrepancyIdentified) fb('체류 계획 2쪽 미접수 확인', 'Page 2 absence confirmed');
    if (hasRequest) fb('2쪽 보완 요청 발령', 'Page 2 request issued');
    if (statementChecked) fb('누락 서류 내용 진술 확인', 'Missing page content confirmed');
    if (!discrepancyIdentified) fb('누락 서류 미확인', 'Missing page overlooked');
    if (!hasRequest) fb('자료 보완 요청 미발령', 'Evidence request not issued');
    if (!followUpCompleted) fb('누락 보완 조사 미완료', 'Omission follow-up incomplete');
  } else {
    discrepancyIdentified = discoveries.length > 0;
    followUpCompleted = caseState.asked.length > 0;
  }

  const score = (discrepancyIdentified ? 35 : 10) +
                (followUpCompleted ? 35 : 5) +
                (caseState.reviewed.length >= scenario.documents.length ? 20 : 5) +
                (typeof caseState.rationale === 'string' && caseState.rationale.trim().length >= 10 ? 10 : 0);

  return {
    isVerticalSlice, discrepancyIdentified, missingDistinguished, followUpCompleted,
    sourcesExamined: caseState.reviewed.length, score,
    rating: score >= 80 ? 'thorough' : score >= 50 ? 'competent' : 'incomplete',
    feedback, investigationPath: graph.investigationPath
  };
}

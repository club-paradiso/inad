// Deterministic evidence graph engine for ATLAS international workstation.
export const RELATIONSHIP_TYPES = {
  MATCH: 'MATCH',
  CONFLICT: 'CONFLICT',
  MISSING: 'MISSING',
  UNVERIFIED: 'UNVERIFIED'
};

export function createEmptyGraph() {
  return { selectedFacts: [], discoveries: [], unlockedQuestions: [], evidenceRequests: [], investigationPath: null, history: [] };
}

export function validateGraphState(g) {
  return !!g && typeof g === 'object' && !Array.isArray(g) &&
    Array.isArray(g.selectedFacts) && g.selectedFacts.length <= 2 && g.selectedFacts.every((id) => typeof id === 'string') &&
    Array.isArray(g.discoveries) && g.discoveries.every((id) => typeof id === 'string') &&
    Array.isArray(g.unlockedQuestions) && g.unlockedQuestions.every((id) => typeof id === 'string') &&
    Array.isArray(g.evidenceRequests) && g.evidenceRequests.every((id) => typeof id === 'string') &&
    (g.investigationPath === null || ['records_first', 'interview_first'].includes(g.investigationPath));
}

export function normalizeGraph(g) {
  if (!g || typeof g !== 'object') return createEmptyGraph();
  return {
    selectedFacts: Array.isArray(g.selectedFacts) ? g.selectedFacts.slice(0, 2).filter((x) => typeof x === 'string') : [],
    discoveries: Array.isArray(g.discoveries) ? g.discoveries.filter((x) => typeof x === 'string') : [],
    unlockedQuestions: Array.isArray(g.unlockedQuestions) ? g.unlockedQuestions.filter((x) => typeof x === 'string') : [],
    evidenceRequests: Array.isArray(g.evidenceRequests) ? g.evidenceRequests.filter((x) => typeof x === 'string') : [],
    investigationPath: ['records_first', 'interview_first'].includes(g.investigationPath) ? g.investigationPath : null,
    history: Array.isArray(g.history) ? g.history : []
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
    const statementChecked = discoveries.includes('CA01_TICKET_MATCHES_STMT');
    followUpCompleted = caseState.asked.includes('clarify_dates') || caseState.asked.includes('clarify');
    if (discrepancyIdentified) fb('출국일 상충 확인', 'Date conflict confirmed');
    if (statementChecked) fb('날짜 오기 진술 검증', 'Statement verified');
    if (!discrepancyIdentified) fb('출국일 불일치 미확인', 'Date conflict missed');
  } else if (scenario.id === 'SIM-GB-02') {
    discrepancyIdentified = discoveries.includes('GB02_DURATION_GAP');
    missingDistinguished = true;
    followUpCompleted = caseState.asked.includes('gb02_remaining_days') || caseState.asked.includes('clarify');
    if (discrepancyIdentified) fb('행사·체류 기간 분리 확인', 'Duration gap separated');
    if (followUpCompleted) fb('관광 일정 해명 확인', 'Tourism itinerary confirmed');
    if (!discrepancyIdentified) fb('기간 차이 미대조', 'Duration gap unexamined');
  } else if (scenario.id === 'SIM-NZ-02') {
    discrepancyIdentified = discoveries.includes('NZ02_PAGE2_MISSING');
    missingDistinguished = true;
    followUpCompleted = graph.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2') || caseState.asked.includes('nz02_missing_page') || caseState.tasks.includes('handover');
    if (discrepancyIdentified) fb('체류 계획 2쪽 미접수 확인', 'Page 2 absence confirmed');
    if (graph.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2')) fb('2쪽 보완 요청 발령', 'Page 2 request issued');
    if (!discrepancyIdentified) fb('누락 서류 미확인', 'Missing page overlooked');
  } else {
    discrepancyIdentified = discoveries.length > 0;
    followUpCompleted = caseState.asked.length > 0;
  }

  const score = (discrepancyIdentified ? 40 : 10) +
                (followUpCompleted ? 30 : 10) +
                (caseState.reviewed.length >= scenario.documents.length ? 20 : 10) +
                (typeof caseState.rationale === 'string' && caseState.rationale.trim().length >= 10 ? 10 : 0);

  return {
    isVerticalSlice, discrepancyIdentified, missingDistinguished, followUpCompleted,
    sourcesExamined: caseState.reviewed.length, score,
    rating: score >= 80 ? 'thorough' : score >= 50 ? 'competent' : 'incomplete',
    feedback, investigationPath: graph.investigationPath
  };
}

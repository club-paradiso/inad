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

// Shared, data-driven debrief for every country (v11). Each case's `assessment` names the
// relationship to establish (issue) and what verifies it (resolve). Action order never matters.
// An outcome that the evidence does not support caps the result, so completing the
// checklist alone can never earn a thorough rating.
export function evaluateDebrief(scenario, caseState) {
  if (!scenario || !caseState) return null;
  const graph = normalizeGraph(caseState.graph);
  const found = (ids) => ids.some((id) => graph.discoveries.includes(id));
  const all = (ids, list) => ids.every((id) => list.includes(id));
  const a = scenario.assessment || { issue: [], distinguish: [], resolve: { findings: [], questions: [], requests: [] }, feedback: null };
  const asked = Array.isArray(caseState.asked) ? caseState.asked : [];
  const reviewed = Array.isArray(caseState.reviewed) ? caseState.reviewed : [];
  const discrepancyIdentified = a.issue.length ? found(a.issue) : graph.discoveries.length > 0;
  const missingDistinguished = (a.distinguish || []).length ? found(a.distinguish) : discrepancyIdentified;
  const askedResolution = !a.resolve.questions.length || a.resolve.questions.some((q) => asked.includes(q));
  const followUpCompleted = all(a.resolve.findings, graph.discoveries) && askedResolution && all(a.resolve.requests, graph.evidenceRequests);
  const unnecessaryRequests = graph.evidenceRequests.filter((r) => !a.resolve.requests.includes(r));
  const feedback = [];
  const fb = (t) => { if (t) feedback.push(t); };
  if (a.feedback) {
    fb(discrepancyIdentified ? a.feedback.issueHit : a.feedback.issueMiss);
    fb(followUpCompleted ? a.feedback.resolveHit : a.feedback.resolveMiss);
  }
  for (const id of a.resolve.requests) if (!graph.evidenceRequests.includes(id)) {
    const r = (scenario.requests || []).find((x) => x.id === id);
    fb({ ko: `보완 요청 미발령: ${r?.title.ko || id}`, en: `Evidence request not issued: ${r?.title.en || id}` });
  }
  for (const id of unnecessaryRequests) {
    const r = (scenario.requests || []).find((x) => x.id === id);
    fb({ ko: `불필요한 보완 요청: ${r?.title.ko || id}`, en: `Unnecessary request: ${r?.title.en || id}` });
  }
  let score = (discrepancyIdentified ? 35 : 10) + (followUpCompleted ? 35 : 5) +
    (reviewed.length >= scenario.documents.length ? 20 : 5) +
    (typeof caseState.rationale === 'string' && caseState.rationale.trim().length >= 10 ? 10 : 0) -
    10 * unnecessaryRequests.length;
  const outcome = ['complete', 'evidence', 'review'].includes(caseState.outcome) ? caseState.outcome : null;
  const accepted = [scenario.expectedOutcome, ...(scenario.acceptableOutcomes || [])];
  const outcomeCorrect = outcome ? accepted.includes(outcome) : null;
  if (outcomeCorrect === false) score = Math.min(score, 45);
  score = Math.max(0, Math.min(100, score));
  const outcomeFeedback = outcome && scenario.outcomeFeedback ? scenario.outcomeFeedback[outcome] : null;
  return {
    isVerticalSlice: true, discrepancyIdentified, missingDistinguished, followUpCompleted,
    sourcesExamined: reviewed.length, score, outcomeCorrect, outcomeFeedback, unnecessaryRequests,
    rating: score >= 80 ? 'thorough' : score >= 50 ? 'competent' : 'incomplete',
    feedback, investigationPath: graph.investigationPath
  };
}

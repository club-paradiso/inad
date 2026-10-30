// v11 international scenario contract. Authored definitions (src/data/atlas/*.js) are
// validated, normalised into the runtime shape and deep-frozen so data can never be
// mutated by the game. Pure module: no DOM, no storage, no country legal logic.
export const ATLAS_OUTCOMES = ['complete', 'evidence', 'review'];
export const RELATIONSHIPS = ['MATCH', 'CONFLICT', 'MISSING', 'UNVERIFIED'];
export const DIFFICULTIES = ['intro', 'standard', 'advanced'];
export const CATEGORIES = ['identity', 'document', 'purpose', 'accommodation', 'requirements', 'record', 'third-party', 'statement', 'missing', 'referral', 'false-positive', 'complex'];
export const FACT_SOURCES = ['document', 'record', 'statement', 'request'];
// Shared review checks. Every case uses the same three so saved progress keeps its meaning.
export const SHARED_TASKS = [
  { id: 'identity', title: { ko: '대상과 사건 식별자 대조', en: 'Compare person and case identifiers' }, documentIndex: 0 },
  { id: 'evidence', title: { ko: '연결 자료와 진술 대조', en: 'Compare linked evidence and statement' }, documentIndex: 1 },
  { id: 'handover', title: { ko: '미확인 사항과 다음 행동 기록', en: 'Record unresolved facts and next action' }, documentIndex: 1 }
];
// Characteristics that are never evidence in this simulation (CLAUDE.md fairness rules).
const FORBIDDEN = /\b(nervous|anxious|accent|ethnic|race|religion|looks foreign|sweat|fidget)\b|긴장|초조|억양|인종|종교|외모/i;

const ID = /^[A-Z0-9][A-Z0-9_-]{1,63}$/i;
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max = 600) => plain(v) && ['ko', 'en'].every((k) => typeof v[k] === 'string' && v[k].trim().length > 0 && v[k].length <= max) && Object.keys(v).length === 2;

export function scenarioFindings(def) { return (def.comparisons || []).map((c) => c.findingId).filter(Boolean); }

// Returns a list of human-readable errors. An empty list means the definition is playable.
export function validateScenarioDefinition(def) {
  const e = [];
  const err = (m) => e.push(`${def?.id || '?'}: ${m}`);
  if (!plain(def)) return ['definition is not an object'];
  if (!ID.test(def.id || '')) err('invalid id');
  if (!['CA', 'GB', 'NZ'].includes(def.countryId)) err('countryId must be CA, GB or NZ');
  if (!String(def.id).startsWith(`SIM-${def.countryId}-`)) err('id must start with SIM-<country>-');
  if (!ID.test(def.personId || '')) err('invalid personId');
  if (typeof def.name !== 'string' || !def.name.trim() || def.name.length > 60) err('invalid name');
  if (!DIFFICULTIES.includes(def.difficulty)) err('invalid difficulty');
  if (!CATEGORIES.includes(def.category)) err('invalid category');
  for (const k of ['title', 'brief', 'opening', 'debrief']) if (!text(def[k], k === 'title' ? 80 : 600)) err(`invalid ${k}`);
  if (!Array.isArray(def.profile) || def.profile.length < 2 || !def.profile.every((p) => plain(p) && text(p.label, 40) && text(p.value, 160))) err('profile needs at least two {label,value} rows');
  if (!Array.isArray(def.sources) || !def.sources.length || !def.sources.every((s) => typeof s === 'string' && ID.test(s))) err('sources must list register IDs');
  const ids = new Set();
  const unique = (id, kind) => { if (!ID.test(id || '')) err(`${kind} has invalid id ${id}`); else if (ids.has(id)) err(`duplicate id ${id}`); else ids.add(id); };
  const docs = Array.isArray(def.documents) ? def.documents : [];
  if (docs.length < 2 || docs.length > 5) err('needs 2–5 documents');
  for (const d of docs) { unique(d.id, 'document'); if (!text(d.title, 60)) err(`document ${d.id} title`); if (!Array.isArray(d.pages) || !d.pages.length || d.pages.length > 4 || !d.pages.every((p) => text(p))) err(`document ${d.id} pages`); }
  const records = Array.isArray(def.records) ? def.records : [];
  if (records.length < 1 || records.length > 5) err('needs 1–5 records');
  for (const r of records) { unique(r.id, 'record'); if (!text(r.title, 60) || !text(r.detail)) err(`record ${r.id} text`); if (!docs.some((d) => d.id === r.documentId)) err(`record ${r.id} documentId must reference a document`); }
  const questions = Array.isArray(def.questions) ? def.questions : [];
  if (questions.length < 3 || questions.length > 10) err('needs 3–10 questions');
  for (const q of questions) { unique(q.id, 'question'); if (!text(q.q, 200) || !text(q.answer)) err(`question ${q.id} text`); }
  const requests = Array.isArray(def.requests) ? def.requests : [];
  for (const r of requests) { unique(r.id, 'request'); if (!text(r.title, 120) || !text(r.result)) err(`request ${r.id} text`); }
  const facts = Array.isArray(def.facts) ? def.facts : [];
  if (facts.length < 3 || facts.length > 14) err('needs 3–14 facts (comparison history stays within its 100-entry bound)');
  for (const f of facts) {
    unique(f.id, 'fact');
    if (!FACT_SOURCES.includes(f.sourceType)) err(`fact ${f.id} sourceType`);
    if (!text(f.label, 160)) err(`fact ${f.id} label`);
    if (f.sourceType === 'document') { const d = docs.find((x) => x.id === f.sourceId); if (!d) err(`fact ${f.id} document missing`); else if (f.page !== undefined && !(Number.isInteger(f.page) && f.page >= 0 && f.page < d.pages.length)) err(`fact ${f.id} page`); }
    if (f.sourceType === 'record' && !records.some((x) => x.id === f.sourceId)) err(`fact ${f.id} record missing`);
    if (f.sourceType === 'statement' && (!Array.isArray(f.questionIds) || !f.questionIds.length || !f.questionIds.every((q) => questions.some((x) => x.id === q)))) err(`fact ${f.id} needs questionIds`);
    if (f.sourceType === 'request' && (!requests.some((x) => x.id === f.requestId) || f.sourceId !== f.requestId)) err(`fact ${f.id} needs requestId = sourceId`);
  }
  const comparisons = Array.isArray(def.comparisons) ? def.comparisons : [];
  if (comparisons.length < 2) err('needs at least two comparisons');
  const findingIds = new Set(), pairs = new Set();
  for (const c of comparisons) {
    unique(c.id, 'comparison');
    if (!RELATIONSHIPS.includes(c.type)) err(`comparison ${c.id} type`);
    if (!Array.isArray(c.facts) || c.facts.length !== 2 || c.facts[0] === c.facts[1] || !c.facts.every((f) => facts.some((x) => x.id === f))) err(`comparison ${c.id} facts`);
    else { const key = [...c.facts].sort().join('|'); if (pairs.has(key)) err(`comparison ${c.id} duplicates a pair`); pairs.add(key); }
    if (!ID.test(c.findingId || '') || findingIds.has(c.findingId)) err(`comparison ${c.id} findingId`); else findingIds.add(c.findingId);
    if (!text(c.title, 80) || !text(c.explanation)) err(`comparison ${c.id} text`);
    if (FORBIDDEN.test(`${c.explanation?.en} ${c.explanation?.ko} ${c.title?.en} ${c.title?.ko}`)) err(`comparison ${c.id} relies on a characteristic that is never evidence`);
    const u = c.unlocks || {};
    if (!plain(u) || Object.keys(u).some((k) => !['questions', 'requests'].includes(k))) err(`comparison ${c.id} unlocks`);
    for (const q of u.questions || []) if (!questions.some((x) => x.id === q)) err(`comparison ${c.id} unlocks unknown question ${q}`);
    for (const r of u.requests || []) if (!requests.some((x) => x.id === r)) err(`comparison ${c.id} unlocks unknown request ${r}`);
  }
  for (const r of requests) if (!comparisons.some((c) => c.unlocks?.requests?.includes(r.id))) err(`request ${r.id} is never unlocked`);
  if (!ATLAS_OUTCOMES.includes(def.expectedOutcome)) err('expectedOutcome');
  if (!plain(def.outcomeFeedback) || !ATLAS_OUTCOMES.every((o) => text(def.outcomeFeedback[o]))) err('outcomeFeedback needs complete/evidence/review');
  const a = def.assessment;
  if (!plain(a)) err('assessment missing');
  else {
    const fl = (list, name, min = 0) => { if (!Array.isArray(list) || list.length < min || !list.every((f) => findingIds.has(f))) err(`assessment.${name} must list known findings`); };
    fl(a.issue, 'issue', 1); fl(a.resolve?.findings, 'resolve.findings', 1); fl(a.distinguish || [], 'distinguish');
    if (!Array.isArray(a.resolve?.questions) || !a.resolve.questions.every((q) => questions.some((x) => x.id === q))) err('assessment.resolve.questions');
    if (!Array.isArray(a.resolve?.requests) || !a.resolve.requests.every((q) => requests.some((x) => x.id === q))) err('assessment.resolve.requests');
    if (!plain(a.feedback) || !['issueHit', 'issueMiss', 'resolveHit', 'resolveMiss'].every((k) => text(a.feedback[k], 200))) err('assessment.feedback needs issueHit/issueMiss/resolveHit/resolveMiss');
  }
  if (!e.length) {
    const r = solveScenario(def);
    for (const f of [...a.issue, ...a.resolve.findings]) if (!r.findings.has(f)) err(`assessment finding ${f} is unreachable`);
    for (const q of questions) if (!r.questions.has(q.id)) err(`question ${q.id} is unreachable`);
    for (const x of requests) if (!r.requests.has(x.id)) err(`request ${x.id} is unreachable`);
    if (!questions.some((q) => !r.gated.has(q.id))) err('needs at least one opening (ungated) question');
  }
  return e;
}

// Fixed-point reachability: what a player can ever see, ask, request and discover.
export function solveScenario(def) {
  const gated = new Set((def.comparisons || []).flatMap((c) => c.unlocks?.questions || []));
  const questions = new Set(def.questions.filter((q) => !gated.has(q.id)).map((q) => q.id));
  const requests = new Set(), findings = new Set();
  const visible = (f) => f.sourceType === 'document' || f.sourceType === 'record' || (f.sourceType === 'statement' && f.questionIds.some((q) => questions.has(q))) || (f.sourceType === 'request' && requests.has(f.requestId));
  for (let changed = true; changed;) {
    changed = false;
    const seen = new Set(def.facts.filter(visible).map((f) => f.id));
    for (const c of def.comparisons) {
      if (findings.has(c.findingId) || !c.facts.every((f) => seen.has(f))) continue;
      findings.add(c.findingId); changed = true;
      for (const q of c.unlocks?.questions || []) questions.add(q);
      for (const r of c.unlocks?.requests || []) requests.add(r);
    }
  }
  return { findings, questions, requests, gated };
}

function freeze(o) { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(freeze); } return o; }

// Runtime shape keeps the pre-v11 field names (questions/investigativeQuestions/tasks)
// so saved progress and existing UI contracts continue to read the same identifiers.
export function normalizeScenario(def) {
  const copy = structuredClone(def);
  const gated = new Set(copy.comparisons.flatMap((c) => c.unlocks?.questions || []));
  const evidenceRequests = (c) => ({ ...c.unlocks, ...(c.unlocks?.requests ? { evidenceRequests: c.unlocks.requests } : {}) });
  return freeze({
    ...copy,
    ruleClass: 'SIMULATION_RULE',
    rulesetVersion: 'atlas-procedure-1',
    questions: copy.questions.filter((q) => !gated.has(q.id)),
    investigativeQuestions: copy.questions.filter((q) => gated.has(q.id)),
    comparisons: copy.comparisons.map((c) => ({ ...c, unlocks: evidenceRequests(c) })),
    requests: copy.requests || [],
    findings: scenarioFindings(copy),
    tasks: SHARED_TASKS.map(({ id, title, documentIndex }) => ({ id, title, documentId: copy.documents[documentIndex].id }))
  });
}

// NPC Intelligence Layer — disclosure-aware context construction (pure; browser and server).
//
// Nothing goes to a model unless it is built here, and everything built here is something the examiner can already
// see on screen. The case definition is NOT assumed public: answers (`a`), clues, lookup results, evidence notes,
// `required`, `resolution`, `note`, `contradiction`, `risk` and `requires` lists never enter a context. Questions
// whose disclosure condition is unmet are left out of the model's menu entirely, so a model can neither choose nor
// read them. `auditOutbound()` re-checks the final serialized request against every confidential string of the
// case as a last line of defence (the request is refused, not sent, if anything matches).
//
// Audit of dialogue-guard.publicRecord (2026-11): every case field it reads is rendered on the desk at case start —
//   name / displayNameKo / nat   → passenger panel and 신원 · 여권 (ui/passenger-panel.js, ui/system-panel.js)
//   purpose / stay / basis        → passenger panel, case summary, 여행 · 목적 · 체류 (passenger-panel.js, system-panel.js)
//   arrival / return              → 입국편 · 운수업자, 귀국·이동 (system-panel.js)
//   basisDetail / visa            → 입국 근거 · 사전여행허가 "적용 내용", "사증" (system-panel.js)
//   docs[].t / fields             → document workbench (ui/document-workbench.js)
// so the guard does not leak through these fields. tests/e2e/npc-intelligence.spec.js checks the rendered values.
import { NPC_LEADS } from '../../data/npc-leads.js';
import { profileFor } from '../../data/npc-profiles.js';
import { PERSONAS } from '../../data/personas.js';
import { LIMITS, cleanIdList, REACTIONS, GESTURES, PAUSES } from './npc-contract.js';

export const PUBLIC_CASE_FIELDS = ['name', 'displayNameKo', 'nat', 'purpose', 'stay', 'arrival', 'return', 'basis', 'basisDetail', 'visa'];
export const CONFIDENTIAL_CASE_FIELDS = ['questions[].a', 'questions[].requires', 'questions[].contradiction', 'clues', 'lookups', 'evidence', 'required', 'resolution', 'note', 'risk', 'watch', 'special'];

// Same rule as clue-engine disclosureReady, without importing game state (the server has none).
export function disclosureReadyFor(q, performed = []) {
  if (q?.id && performed.includes(`UNLOCK_Q_${q.id}`)) return true;
  return !(q?.requires || []).some((x) => !performed.includes(x));
}

// The questions a model may choose from: disclosure-ready questions of this case, optionally narrowed further by
// the caller's `allowed` list (the browser sends the ids it shows as open). A caller can only narrow, never widen.
export function selectableQuestions(c, { performed = null, allowed = null } = {}) {
  if (!c) return [];
  const narrow = allowed ? new Set(cleanIdList(allowed) || []) : null;
  return (c.questions || []).filter((q) => (performed ? disclosureReadyFor(q, performed) : !(q.requires || []).length) && (!narrow || narrow.has(q.id)));
}
export function questionMenu(c, opts = {}) {
  const en = PERSONAS[c?.id]?.en || {};
  return selectableQuestions(c, opts).map((q) => ({ id: q.id, ko: q.q, ...(en[q.id] ? { en: en[q.id] } : {}) }));
}

// Bounded, id-only conversation memory as sent to a model (no raw text, no answers).
export function memoryView(memory) {
  const m = memory || {};
  return {
    asked: (cleanIdList(m.asked) || []).slice(-LIMITS.ids),
    lastTopic: typeof m.lastTopic === 'string' && cleanIdList([m.lastTopic])?.length ? m.lastTopic : null,
    recent: (Array.isArray(m.turns) ? m.turns : []).slice(-LIMITS.memoryTurns).map((t) => ({ kind: String(t?.kind || ''), questionId: cleanIdList([t?.questionId])?.[0] || null }))
  };
}

// Leads a persona may use before this kind of turn.
export function leadsFor(caseId, kind) {
  return (profileFor(caseId).leads || []).filter((id) => NPC_LEADS[id] && NPC_LEADS[id].kinds.includes(kind));
}

// classify context: the menu and the utterance (as data).
export function classifyContext(c, utterance, { performed = null, allowed = null } = {}) {
  return { questions: questionMenu(c, { performed, allowed }), utterance };
}

// act context: the immutable profile (presentation fields only), the turn (kind + the public question text when
// the question is open), id-only memory, and the closed option sets. No answer text: the acting choice does not need
// it, and an answer the model never sees is an answer it cannot leak or rewrite.
export function actingContext(c, turn, memory, { openIds = null } = {}) {
  const pf = profileFor(c.id); const kind = turn?.kind;
  const q = (c.questions || []).find((x) => x.id === turn?.questionId);
  const open = q && (openIds ? openIds.includes(q.id) : !(q.requires || []).length);
  const leadIds = ['answer', 'withheld'].includes(kind) ? leadsFor(c.id, kind) : [];
  return {
    profile: { style: pf.style, temperament: pf.temperament, pace: pf.pace, formality: pf.formality, habits: pf.habits },
    turn: { kind, question: open ? q.q : null, repeatCount: Math.max(0, Math.min(9, Number(turn?.repeatCount) || 0)) },
    memory: memoryView(memory),
    options: { reactions: REACTIONS, gestures: GESTURES, pauses: PAUSES, leads: leadIds.map((id) => ({ id, text: NPC_LEADS[id].ko, gloss: NPC_LEADS[id].en })) },
    leadIds
  };
}

// Every string of the case that must never reach a model (answers, clues, lookups, evidence notes, resolution, note).
export function confidentialStrings(c) {
  const out = [];
  for (const q of c?.questions || []) out.push(q.a);
  for (const cl of c?.clues || []) out.push(cl.title, cl.text);
  for (const v of Object.values(c?.lookups || {})) if (Array.isArray(v)) out.push(v[1]);
  for (const v of Object.values(c?.evidence || {})) if (Array.isArray(v)) out.push(v[2]);
  out.push(c?.note, c?.resolution?.reason);
  return out.filter((s) => typeof s === 'string' && s.trim().length >= 4);
}

// Final check on the serialized request: refuse to send if any confidential string, or any answer of a question not
// in the menu, appears in it. Returns { ok, hits } (hits are field labels, never the strings themselves).
export function auditOutbound(serialized, c, menuIds = []) {
  const s = String(serialized || ''); const hits = [];
  confidentialStrings(c).forEach((x, i) => { if (s.includes(x)) hits.push(`confidential#${i}`); });
  for (const q of c?.questions || []) if (!menuIds.includes(q.id) && s.includes(q.q)) hits.push(`closed-question:${q.id}`);
  return { ok: hits.length === 0, hits };
}

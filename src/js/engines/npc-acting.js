// NPC Intelligence Layer — acting engine (pure, presentation only).
//
// Decides how a passenger delivers a line: a reaction (portrait state), an optional approved lead-in id, a gesture,
// a pause and a pace. The default is deterministic, from the authored profile and the persona's per-question
// delivery; a model may propose a different choice, which is accepted only through contract.validateActing (closed
// enums, leads limited to this persona and turn kind). Nothing here is read by the legal, case, score or decision
// engines, and nothing here can change what is said: the canonical answer text is never touched.
import { NPC_LEADS } from '../../data/npc-leads.js';
import { profileFor } from '../../data/npc-profiles.js';
import { personaFor } from '../../data/personas.js';
import { leadsFor } from './npc-context.js';
import { validateActing } from './npc-contract.js';

// Portrait/motion-grammar mood for each contract reaction (motion-grammar.js keys).
export const STAGE_MOOD = { plain: 'plain', neutral: 'plain', considering: 'considered', hesitant: 'hesitant', confused: 'confused', relieved: 'relieved', withheld: 'withheld', document: 'document' };
const FROM_PERSONA_MOOD = { plain: 'plain', considered: 'considering', hesitant: 'hesitant', confused: 'confused', relieved: 'relieved', withheld: 'withheld', document: 'document' };
const LEAD_ID_BY_TEXT = Object.fromEntries(Object.entries(NPC_LEADS).map(([id, v]) => [v.ko, id]));

export function leadText(id) { return (id && NPC_LEADS[id]?.ko) || ''; }
export function leadIdForText(text) { return LEAD_ID_BY_TEXT[String(text || '').trim()] || null; }

// Turn kind as the acting layer sees it.
export function actingKind(result) {
  if (!result) return null;
  if (result.kind === 'answer') return result.repeat ? 'repeat' : 'answer';
  if (result.kind === 'withheld' || result.kind === 'locked') return 'withheld';
  if (['unknown', 'ambiguous', 'language', 'repeatCheck'].includes(result.kind)) return 'clarify';
  if (result.kind === 'multi') return 'multi';
  if (result.kind === 'document') return 'document';
  if (['meta', 'public'].includes(result.kind)) return 'meta';
  return null;
}

// Deterministic acting: profile defaults, the persona's authored per-question delivery for a first answer, and a
// small, consistent escalation on repeats (a second repeat of the same question reads a little more strained for an
// anxious or impatient person; never more than that).
export function deterministicActing(caseId, result, { repeats = 0, withheldBefore = 0 } = {}) {
  const kind = actingKind(result); if (!kind) return null;
  const pf = profileFor(caseId); const persona = personaFor(caseId);
  let reaction = pf.reactions[kind] || 'plain'; let gesture = pf.gestures[kind] || 'none'; let leadId = null; let pause = 'none';
  if (kind === 'answer') {
    const d = persona.delivery?.[result.questionId] || {};
    if (d.mood) reaction = FROM_PERSONA_MOOD[d.mood] || reaction;
    leadId = leadIdForText(d.lead);
    pause = reaction === 'hesitant' ? 'long' : reaction === 'considering' ? 'short' : 'none';
  } else if (kind === 'repeat') {
    if (repeats >= 1 && ['anxious', 'impatient'].includes(pf.temperament)) reaction = pf.temperament === 'anxious' ? 'hesitant' : 'plain';
    pause = repeats >= 1 && pf.temperament === 'anxious' ? 'short' : 'none';
  } else if (kind === 'withheld') {
    if (withheldBefore >= 1 && leadsFor(caseId, 'withheld').includes('as_said')) leadId = 'as_said';
    pause = 'short';
  }
  return { reaction, leadId, gesture, pause, pace: pf.pace };
}

// Validate a model's proposal for this turn and merge the profile's pace (pace is authored, not chosen).
export function acceptActing(caseId, result, proposal) {
  const kind = actingKind(result); if (!kind) return { ok: false, acting: null, error: 'invalid-value' };
  // Repeats re-say the canonical answer with the engine's own callback wording; a lead-in there would double it.
  const leadIds = kind === 'repeat' ? [] : leadsFor(caseId, kind);
  const v = validateActing(proposal, { leadIds });
  if (!v.ok) return v;
  // Only an answered or withheld line may carry a lead; others keep their reaction/gesture only.
  const acting = { ...v.acting, leadId: ['answer', 'withheld'].includes(kind) ? v.acting.leadId : null, pace: profileFor(caseId).pace };
  return { ok: true, acting, error: null };
}

// Presentation numbers for the stage and TTS (bounded; reduced motion removes the pause).
export function actingTiming(acting, { reducedMotion = false } = {}) {
  const pauseMs = reducedMotion ? 0 : ({ none: 0, short: 260, long: 560 }[acting?.pause] || 0);
  const rate = { slow: 0.9, normal: 0.98, brisk: 1.06 }[acting?.pace] || 0.98;
  return { pauseMs, rate };
}

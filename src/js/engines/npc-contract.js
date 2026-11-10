// NPC Intelligence Layer — the provider contract (pure; shared by the browser and the /api/npc server function).
//
// Every provider (deterministic rules, an OpenAI-compatible model, a future local server) answers the same two
// tasks with the same validated shapes, so the gameplay engine never sees a provider-specific format:
//   classify → { questionId: <one of the allowed ids> | null }
//   act      → { reaction, leadId, gesture, pause }   — presentation only, every value from a closed enum
// Anything else is rejected here (unknown keys, wrong types, ids outside the allowed set) and becomes a structured
// error; callers then fall back to the deterministic provider. See docs/npc-intelligence/ADR-004.md.

export const NPC_TASKS = ['classify', 'act'];
export const REACTIONS = ['plain', 'hesitant', 'confused', 'considering', 'relieved', 'withheld', 'document', 'neutral'];
export const GESTURES = ['none', 'nod', 'glance-down', 'glance-aside', 'blink', 'head-tilt', 'check-document'];
export const PAUSES = ['none', 'short', 'long'];
export const PACES = ['slow', 'normal', 'brisk'];
export const TURN_KINDS = ['answer', 'repeat', 'withheld', 'clarify', 'multi', 'document', 'meta'];

// Structured error categories. Never carry provider names, URLs, keys or player text.
export const NPC_ERRORS = Object.freeze({
  NOT_CONFIGURED: 'not-configured', UNAVAILABLE: 'unavailable', TIMEOUT: 'timeout', CANCELLED: 'cancelled',
  UNREACHABLE: 'unreachable', HTTP: 'http-error', RATE_LIMITED: 'rate-limited', NON_JSON: 'non-json',
  MALFORMED: 'malformed', INVALID_VALUE: 'invalid-value', SCHEMA_UNSUPPORTED: 'schema-unsupported',
  REFUSED: 'refused', LEAK_BLOCKED: 'leak-blocked', BAD_REQUEST: 'bad-request', STALE: 'stale'
});

// Request bounds (server and client agree on them).
export const LIMITS = Object.freeze({ body: 4096, utterance: 240, ids: 24, idLength: 40, memoryTurns: 12 });
export const ID_RE = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;

function parseObject(content) {
  if (content && typeof content === 'object' && !Array.isArray(content)) return { obj: content };
  if (typeof content !== 'string') return { error: NPC_ERRORS.MALFORMED };
  // Some servers wrap JSON in a fenced block even in JSON mode; accept exactly one object and nothing else.
  const s = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let obj; try { obj = JSON.parse(s); } catch (e) { return { error: NPC_ERRORS.NON_JSON }; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { error: NPC_ERRORS.MALFORMED };
  return { obj };
}
const exactKeys = (obj, keys) => { const k = Object.keys(obj); return k.length === keys.length && keys.every((x) => k.includes(x)); };

// classify: the only accepted output is {"questionId": <allowed id> | null}.
export function validateClassification(content, allowedIds) {
  const { obj, error } = parseObject(content); if (error) return { ok: false, questionId: null, error };
  if (!exactKeys(obj, ['questionId'])) return { ok: false, questionId: null, error: NPC_ERRORS.MALFORMED };
  const id = obj.questionId;
  if (id === null) return { ok: true, questionId: null, error: null };
  if (typeof id !== 'string' || !allowedIds.includes(id)) return { ok: false, questionId: null, error: NPC_ERRORS.INVALID_VALUE };
  return { ok: true, questionId: id, error: null };
}

// act: four keys, each from its closed set; leadId must be one of the leads allowed for this persona and turn.
export function validateActing(content, { leadIds = [] } = {}) {
  const { obj, error } = parseObject(content); if (error) return { ok: false, acting: null, error };
  if (!exactKeys(obj, ['reaction', 'leadId', 'gesture', 'pause'])) return { ok: false, acting: null, error: NPC_ERRORS.MALFORMED };
  const { reaction, leadId, gesture, pause } = obj;
  if (!REACTIONS.includes(reaction) || !GESTURES.includes(gesture) || !PAUSES.includes(pause)) return { ok: false, acting: null, error: NPC_ERRORS.INVALID_VALUE };
  if (leadId !== null && (typeof leadId !== 'string' || !leadIds.includes(leadId))) return { ok: false, acting: null, error: NPC_ERRORS.INVALID_VALUE };
  return { ok: true, acting: { reaction, leadId, gesture, pause }, error: null };
}

export const classificationSchema = (allowedIds) => ({
  type: 'object', additionalProperties: false, required: ['questionId'],
  properties: { questionId: { type: ['string', 'null'], enum: [...allowedIds, null] } }
});
export const actingSchema = (leadIds) => ({
  type: 'object', additionalProperties: false, required: ['reaction', 'leadId', 'gesture', 'pause'],
  properties: {
    reaction: { type: 'string', enum: REACTIONS }, leadId: { type: ['string', 'null'], enum: [...leadIds, null] },
    gesture: { type: 'string', enum: GESTURES }, pause: { type: 'string', enum: PAUSES }
  }
});

// Utterance hygiene before it goes anywhere near a model: NFKC, control and bidi-override characters removed.
export function cleanUtterance(text) {
  return String(text ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, LIMITS.utterance);
}
export function cleanIdList(list, max = LIMITS.ids) {
  if (!Array.isArray(list)) return null;
  const out = []; for (const x of list) { if (typeof x === 'string' && ID_RE.test(x) && !out.includes(x)) out.push(x); if (out.length >= max) break; }
  return out;
}

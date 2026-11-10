// /api/npc — the optional inference boundary of the NPC Intelligence Layer (docs/npc-intelligence/ADR-004.md).
//
// The model is an actor's assistant, never the source of truth. It can do exactly two things:
//   classify — map the examiner's words to ONE open question of the case (or null); the browser then confirms it with
//              the examiner and records it through the same deterministic path as a click;
//   act      — pick a delivery for the passenger's next line from closed enums (reaction, approved lead-in id,
//              gesture, pause); the line itself is always the canonical, deterministic one.
// It never sees an answer, a clue, a lookup result, the resolution, a note or a question whose disclosure condition
// is unmet; contexts are built by engines/npc-context.js and the serialized request is audited before it is sent.
// Provider selection and credentials are server environment only (api/_npc/config.js); the browser cannot pass a URL.
//
// Failure contract: a well-formed POST always answers 200 { ok, …, reason } (429 when rate-limited), so the client
// treats every provider problem as "use the deterministic result" and the game continues.
import { CASES } from '../src/data/cases.js';
import { LIMITS, NPC_ERRORS, TURN_KINDS, cleanUtterance as clean, cleanIdList, ID_RE } from '../src/js/engines/npc-contract.js';
import { questionMenu as menuFor, classifyContext, actingContext, auditOutbound } from '../src/js/engines/npc-context.js';
import { resolveNpcConfig } from './_npc/config.js';
import { providerFor, resetProviders } from './_npc/providers.js';
import { classifyMessages, actMessages } from './_npc/prompts.js';

export const MAX_BODY = LIMITS.body;
export const MAX_UTTERANCE = LIMITS.utterance;
export const RATE = { windowMs: 60_000, perClient: 30, perSession: 30, global: 600 };
const buckets = new Map(); // key → timestamps (per instance; best effort on serverless)
const MAX_TRACKED = 5000;

export function resetNpcState() { buckets.clear(); resetProviders(); }
export const cleanUtterance = clean;
const caseById = (id) => CASES.find((x) => x.id === id) || null;
// Menu for a case: open (no disclosure condition) questions, narrowed by the caller's `allowed` ids.
export function questionMenu(caseId, allowed = null) { const c = caseById(caseId); return c ? menuFor(c, { allowed }) : null; }

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function hit(key, max, now) {
  if (buckets.size > MAX_TRACKED) for (const [k, v] of buckets) { if (!v.length || now - v[v.length - 1] >= RATE.windowMs) buckets.delete(k); }
  if (buckets.size > MAX_TRACKED) buckets.clear();
  const list = (buckets.get(key) || []).filter((t) => now - t < RATE.windowMs);
  if (list.length >= max) { buckets.set(key, list); return true; }
  list.push(now); buckets.set(key, list); return false;
}
// Per client address, per browser session id (random, non-identifying) and per instance.
export function rateLimited(ip, now = Date.now(), sessionId = null) {
  if (hit(`g`, RATE.global, now)) return true;
  if (hit(`ip:${ip}`, RATE.perClient, now)) return true;
  return !!sessionId && hit(`s:${sessionId}`, RATE.perSession, now);
}
function clientIp(req) {
  const h = req.headers || {};
  return String(h['x-vercel-forwarded-for'] || h['x-real-ip'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}
export function sameOrigin(req) {
  const origin = String(req.headers?.origin || ''); const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch (e) { return false; }
}

async function readBody(req) {
  let pre; try { pre = req.body; } catch (e) { throw new Error('bad-json'); } // Vercel's parsed-body getter throws on malformed JSON
  if (pre && typeof pre === 'object' && !Buffer.isBuffer(pre)) return JSON.stringify(pre);
  if (typeof pre === 'string') return pre;
  if (Buffer.isBuffer(pre)) return pre.toString('utf8');
  return await new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error('too-large')); req.destroy?.(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8'))); req.on('error', reject);
  });
}

const BODY_KEYS = ['task', 'caseId', 'utterance', 'allowed', 'turn', 'memory'];
// Strict request validation; returns { error } or a normalized request.
export function parseRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'bad-request' };
  if (Object.keys(body).some((k) => !BODY_KEYS.includes(k))) return { error: 'bad-request' };
  if (!['classify', 'act'].includes(body.task) || typeof body.caseId !== 'string') return { error: 'bad-request' };
  const c = caseById(body.caseId); if (!c) return { error: 'unknown-case' };
  const allowed = body.allowed === undefined ? null : cleanIdList(body.allowed);
  if (body.allowed !== undefined && (!allowed || allowed.length !== body.allowed.length)) return { error: 'bad-request' };
  if (body.task === 'classify') {
    if (typeof body.utterance !== 'string') return { error: 'bad-request' };
    const utterance = clean(body.utterance); if (!utterance) return { error: 'empty' };
    return { task: 'classify', c, allowed, utterance };
  }
  const t = body.turn;
  if (!t || typeof t !== 'object' || !TURN_KINDS.includes(t.kind) || (t.questionId != null && (typeof t.questionId !== 'string' || !ID_RE.test(t.questionId)))) return { error: 'bad-request' };
  if (t.questionId && !c.questions.some((q) => q.id === t.questionId)) return { error: 'bad-request' };
  return { task: 'act', c, allowed, turn: { kind: t.kind, questionId: t.questionId || null, repeatCount: Number(t.repeatCount) || 0 }, memory: body.memory && typeof body.memory === 'object' ? body.memory : null };
}

// Builds the exact provider context and the messages it becomes; refuses when the audit finds confidential text.
export function buildProviderCall(req) {
  const { c } = req;
  if (req.task === 'classify') {
    const ctx = { ...classifyContext(c, req.utterance, { allowed: req.allowed }), caseId: c.id };
    const menuIds = ctx.questions.map((q) => q.id);
    const audit = auditOutbound(JSON.stringify(classifyMessages(ctx)), c, menuIds);
    return { ctx, menuIds, audit };
  }
  const openIds = menuFor(c, { allowed: req.allowed }).map((q) => q.id);
  const ctx = { ...actingContext(c, req.turn, req.memory, { openIds }), caseId: c.id, questionId: req.turn.questionId };
  const audit = auditOutbound(JSON.stringify(actMessages(ctx)), c, openIds);
  return { ctx, menuIds: openIds, audit };
}

export default async function handler(req, res, { env = process.env, fetchImpl } = {}) {
  const method = String(req?.method || 'GET').toUpperCase();
  const cfg = resolveNpcConfig(env);
  const provider = providerFor(cfg, fetchImpl ? { fetchImpl } : {});
  if (method === 'GET' || method === 'HEAD') {
    const available = !!provider && provider.health().available;
    return send(res, 200, { available, tasks: available ? cfg.tasks : [] });
  }
  if (method !== 'POST') { res.setHeader('Allow', 'GET, HEAD, POST'); return send(res, 405, { error: 'method-not-allowed' }); }
  const ctype = String(req.headers?.['content-type'] || ''); if (!ctype.includes('application/json')) return send(res, 415, { error: 'json-only' });
  if (!sameOrigin(req)) return send(res, 403, { error: 'same-origin-only' });
  let raw; try { raw = await readBody(req); } catch (e) { return e?.message === 'bad-json' ? send(res, 400, { error: 'bad-json' }) : send(res, 413, { error: 'too-large' }); }
  if (raw.length > MAX_BODY) return send(res, 413, { error: 'too-large' });
  let body; try { body = JSON.parse(raw); } catch (e) { return send(res, 400, { error: 'bad-json' }); }
  const parsed = parseRequest(body); if (parsed.error) return send(res, 400, { error: parsed.error });
  const empty = parsed.task === 'classify' ? { questionId: null } : { acting: null };
  if (!provider) return send(res, 200, { ok: false, ...empty, reason: NPC_ERRORS.NOT_CONFIGURED });
  if (!cfg.tasks.includes(parsed.task)) return send(res, 200, { ok: false, ...empty, reason: NPC_ERRORS.NOT_CONFIGURED });
  const sid = String(req.headers?.['x-inad-session'] || ''); const sessionId = /^[a-z0-9]{8,40}$/.test(sid) ? sid : null;
  if (rateLimited(clientIp(req), Date.now(), sessionId)) return send(res, 429, { ok: false, ...empty, reason: NPC_ERRORS.RATE_LIMITED });
  const call = buildProviderCall(parsed);
  if (!call.audit.ok) return send(res, 200, { ok: false, ...empty, reason: NPC_ERRORS.LEAK_BLOCKED });
  if (parsed.task === 'classify') {
    if (!call.menuIds.length) return send(res, 200, { ok: true, questionId: null, reason: 'model-null' });
    const r = await provider.classify(call.ctx);
    return send(res, 200, r.ok ? { ok: true, questionId: r.value, reason: r.value ? 'model' : 'model-null' } : { ok: false, questionId: null, reason: r.error });
  }
  const r = await provider.act(call.ctx);
  return send(res, 200, r.ok ? { ok: true, acting: r.value, reason: 'model' } : { ok: false, acting: null, reason: r.error });
}

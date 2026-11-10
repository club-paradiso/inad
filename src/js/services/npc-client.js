// Browser transport of the NPC Intelligence Layer: the only code that talks to the same-origin /api/npc function.
// Availability is checked once in the background; until it is known to be available the game never waits for it.
// Every call has its own deadline and can be cancelled by the caller (a newer turn, a new case, a retry). Any
// failure — file://, 404, timeout, offline, 429, malformed reply — comes back as a structured "not available"
// result, and the caller keeps its deterministic answer. Nothing here reveals provider names or errors to players.
import { NPC_ERRORS, LIMITS } from '../engines/npc-contract.js';

let status = 'unknown'; // 'unknown' | 'checking' | 'yes' | 'no'
let tasks = [];
// Random per page load; lets the server rate-limit one browser session. Not stored, not linked to a person.
const sessionId = (() => { try { const a = new Uint8Array(12); crypto.getRandomValues(a); return [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24); } catch (e) { return ''; } })();
const stats = { calls: 0, ok: 0, errors: {}, latency: [] };

function deadline(ms, outer) {
  const c = new AbortController(); const t = setTimeout(() => c.abort('timeout'), ms);
  const onOuter = () => c.abort('cancelled'); outer?.addEventListener?.('abort', onOuter, { once: true });
  if (outer?.aborted) c.abort('cancelled');
  return { signal: c.signal, done: () => { clearTimeout(t); outer?.removeEventListener?.('abort', onOuter); } };
}

export function checkModel() {
  if (status !== 'unknown') return; status = 'checking';
  if (typeof location !== 'undefined' && location.protocol === 'file:') { status = 'no'; return; }
  const d = deadline(2500);
  fetch('/api/npc', { method: 'GET', cache: 'no-store', signal: d.signal })
    .then((r) => (r.ok ? r.json() : null)).then((j) => { status = j && j.available === true ? 'yes' : 'no'; tasks = Array.isArray(j?.tasks) ? j.tasks.filter((x) => typeof x === 'string') : []; })
    .catch(() => { status = 'no'; }).finally(d.done);
}
export function modelReady(task = 'classify') { return status === 'yes' && tasks.includes(task); }
// After repeated failures the client stops asking for the rest of the page session (server circuit also opens).
let consecutiveFailures = 0;
function note(ok, error, ms) {
  stats.calls++; if (ok) { stats.ok++; consecutiveFailures = 0; } else { stats.errors[error] = (stats.errors[error] || 0) + 1; if (error !== NPC_ERRORS.CANCELLED && ++consecutiveFailures >= 4) status = 'no'; }
  if (Number.isFinite(ms)) { stats.latency.push(ms); if (stats.latency.length > 50) stats.latency.shift(); }
}
export function npcStats() { return { status, tasks: [...tasks], calls: stats.calls, ok: stats.ok, errors: { ...stats.errors }, latency: [...stats.latency] }; }

// POST one task. Returns { ok, data, error }. `signal` cancels a stale turn.
export async function npcRequest(body, { signal, timeoutMs = 3200 } = {}) {
  if (!modelReady(body?.task)) return { ok: false, data: null, error: NPC_ERRORS.UNAVAILABLE };
  const payload = JSON.stringify(body); if (payload.length > LIMITS.body) return { ok: false, data: null, error: NPC_ERRORS.BAD_REQUEST };
  const d = deadline(timeoutMs, signal); const started = Date.now();
  try {
    const r = await fetch('/api/npc', { method: 'POST', cache: 'no-store', signal: d.signal, headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'X-INAD-Session': sessionId } : {}) }, body: payload });
    if (!r.ok) { const e = r.status === 429 ? NPC_ERRORS.RATE_LIMITED : NPC_ERRORS.HTTP; note(false, e, Date.now() - started); return { ok: false, data: null, error: e }; }
    const j = await r.json();
    const ok = j && j.ok === true; note(ok, ok ? null : String(j?.reason || NPC_ERRORS.MALFORMED), Date.now() - started);
    return { ok, data: j, error: ok ? null : String(j?.reason || NPC_ERRORS.MALFORMED) };
  } catch (e) {
    const err = d.signal.reason === 'cancelled' ? NPC_ERRORS.CANCELLED : d.signal.reason === 'timeout' ? NPC_ERRORS.TIMEOUT : NPC_ERRORS.UNREACHABLE;
    note(false, err, Date.now() - started); return { ok: false, data: null, error: err };
  } finally { d.done(); }
}

// Backwards-compatible helper: classification only.
export async function classifyRemote(caseId, utterance, { allowed, signal } = {}) {
  const r = await npcRequest({ task: 'classify', caseId, utterance: String(utterance).slice(0, LIMITS.utterance), ...(allowed ? { allowed } : {}) }, { signal });
  return { questionId: r.ok && typeof r.data?.questionId === 'string' ? r.data.questionId : null, reason: r.error || String(r.data?.reason || '') };
}
// Test hook: reset availability (E2E stubs /api/npc per test).
export function resetNpcClient() { status = 'unknown'; tasks = []; consecutiveFailures = 0; stats.calls = 0; stats.ok = 0; stats.errors = {}; stats.latency = []; }

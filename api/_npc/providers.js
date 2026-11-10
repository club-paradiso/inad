// NPC Intelligence Layer — server-side providers behind one interface:
//   { id, capabilities: { tasks, structured }, health(), classify(ctx, opts), act(ctx, opts) }
// classify/act resolve to { ok, value, error, ms } where value is already validated by engines/npc-contract.js
// (classify: questionId|null; act: { reaction, leadId, gesture, pause }). Errors are NPC_ERRORS categories only.
//
// · deterministic — the shipped rules (intent engine + authored acting). Always available; used by the evaluation
//   harness and as the reference behaviour. The browser runs the same rules locally, so GET /api/npc reports a
//   deterministic server as "not available" and the client never waits for it.
// · openai-compatible — any /chat/completions endpoint (vLLM, llama.cpp server, Ollama, hosted providers). Output
//   is constrained by json_schema when the server supports it and always re-validated locally. A 400/422/500 that
//   rejects `response_format` downgrades this instance to json_object (still validated). Three consecutive failures open a
//   circuit for 30 s, during which calls fail fast and availability reads false.
import { NPC_ERRORS, validateClassification, validateActing, classificationSchema, actingSchema } from '../../src/js/engines/npc-contract.js';
import { resolveUtterance } from '../../src/js/engines/intent-engine.js';
import { deterministicActing } from '../../src/js/engines/npc-acting.js';
import { classifyMessages, actMessages } from './prompts.js';

export function createDeterministicProvider({ caseLookup }) {
  return {
    id: 'deterministic', capabilities: { tasks: ['classify', 'act'], structured: 'native' },
    health: () => ({ available: true, model: false }),
    async classify(ctx) {
      const c = caseLookup(ctx.caseId); const ids = ctx.questions.map((q) => q.id);
      const narrowed = c && { ...c, questions: c.questions.filter((q) => ids.includes(q.id)) };
      const r = narrowed ? resolveUtterance(ctx.utterance, narrowed) : { kind: 'unknown' };
      return { ok: true, value: r.kind === 'question' ? r.questionId : null, error: null, ms: 0 };
    },
    async act(ctx) {
      const t = ctx.turn || {}; const result = { kind: t.kind === 'repeat' ? 'answer' : t.kind === 'clarify' ? 'unknown' : t.kind, repeat: t.kind === 'repeat', questionId: ctx.questionId || null };
      const a = deterministicActing(ctx.caseId, result, { repeats: t.repeatCount || 0 });
      return a ? { ok: true, value: { reaction: a.reaction, leadId: a.leadId, gesture: a.gesture, pause: a.pause }, error: null, ms: 0 } : { ok: false, value: null, error: NPC_ERRORS.INVALID_VALUE, ms: 0 };
    }
  };
}

const BREAKER = { failures: 3, openMs: 30_000 };

export function createOpenAICompatibleProvider(cfg, { fetchImpl = fetch, now = () => Date.now() } = {}) {
  let structured = cfg.structured; let consecutive = 0; let openUntil = 0;
  const circuitOpen = () => now() < openUntil;
  const record = (ok) => { if (ok) { consecutive = 0; return; } if (++consecutive >= BREAKER.failures) { openUntil = now() + BREAKER.openMs; consecutive = 0; } };

  async function complete(messages, schemaName, schema, { signal, timeoutMs = cfg.timeoutMs } = {}) {
    const started = now();
    if (circuitOpen()) return { ok: false, error: NPC_ERRORS.UNAVAILABLE, ms: 0 };
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
    const onAbort = () => ctrl.abort('cancelled'); signal?.addEventListener?.('abort', onAbort, { once: true });
    const body = { model: cfg.model, temperature: 0, max_tokens: 64, messages };
    if (structured === 'json_schema') body.response_format = { type: 'json_schema', json_schema: { name: schemaName, strict: true, schema } };
    else if (structured === 'json_object') body.response_format = { type: 'json_object' };
    if (cfg.disableThinking) body.chat_template_kwargs = { enable_thinking: false };
    try {
      const r = await fetchImpl(`${cfg.base}/chat/completions`, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}) }, body: JSON.stringify(body) });
      if (!r.ok) {
        if (r.status === 429) { record(false); return { ok: false, error: NPC_ERRORS.RATE_LIMITED, status: 429, ms: now() - started }; }
        // Servers reject an unsupported response_format differently: OpenAI-style 400, FastAPI 422, and
        // llama-cpp-python's server 500 ("Input should be 'text' or 'json_object'", measured 2026-11-10).
        if ([400, 422, 500].includes(r.status) && structured === 'json_schema') {
          let text = ''; try { text = await r.text(); } catch (e) { /* ignore */ }
          if (/response_format|json_schema|json_object|schema|grammar/i.test(text)) { structured = 'json_object'; return { ok: false, error: NPC_ERRORS.SCHEMA_UNSUPPORTED, status: r.status, ms: now() - started }; }
        }
        record(false); return { ok: false, error: NPC_ERRORS.HTTP, status: r.status, ms: now() - started };
      }
      let data; try { data = await r.json(); } catch (e) { record(false); return { ok: false, error: NPC_ERRORS.NON_JSON, ms: now() - started }; }
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') { record(false); return { ok: false, error: NPC_ERRORS.MALFORMED, ms: now() - started }; }
      record(true); return { ok: true, content, ms: now() - started };
    } catch (e) {
      const reason = ctrl.signal.reason; record(reason === 'cancelled');
      return { ok: false, error: reason === 'cancelled' ? NPC_ERRORS.CANCELLED : reason === 'timeout' || e?.name === 'AbortError' ? NPC_ERRORS.TIMEOUT : NPC_ERRORS.UNREACHABLE, ms: now() - started };
    } finally { clearTimeout(timer); signal?.removeEventListener?.('abort', onAbort); }
  }

  return {
    id: cfg.provider, capabilities: { tasks: cfg.tasks, get structured() { return structured; } },
    health: () => ({ available: !circuitOpen(), model: true }),
    async classify(ctx, opts) {
      const ids = ctx.questions.map((q) => q.id);
      const r = await complete(classifyMessages(ctx), 'question_choice', classificationSchema(ids), opts);
      if (!r.ok) return { ok: false, value: null, error: r.error, ms: r.ms };
      const v = validateClassification(r.content, ids);
      return { ok: v.ok, value: v.ok ? v.questionId : null, error: v.error, ms: r.ms };
    },
    async act(ctx, opts) {
      const r = await complete(actMessages(ctx), 'npc_acting', actingSchema(ctx.leadIds), opts);
      if (!r.ok) return { ok: false, value: null, error: r.error, ms: r.ms };
      const v = validateActing(r.content, { leadIds: ctx.leadIds });
      return { ok: v.ok, value: v.ok ? v.acting : null, error: v.error, ms: r.ms };
    }
  };
}

// One provider instance per configuration (keeps the circuit and schema-downgrade state across warm invocations).
let cached = { key: '', provider: null };
export function providerFor(cfg, deps = {}) {
  if (!cfg || cfg.provider === 'off') return null;
  const key = JSON.stringify([cfg.provider, cfg.base, cfg.model, cfg.structured, cfg.timeoutMs, cfg.tasks, !!cfg.key, cfg.disableThinking]);
  if (deps.fetchImpl || cached.key !== key) { const p = createOpenAICompatibleProvider(cfg, deps); if (!deps.fetchImpl) cached = { key, provider: p }; return p; }
  return cached.provider;
}
export function resetProviders() { cached = { key: '', provider: null }; }

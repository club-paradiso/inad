// NPC Intelligence Layer — trusted server configuration (environment only; never from the browser).
//
//   INAD_NPC_PROVIDER        off | openai-compatible | vllm | llamacpp | ollama
//                            (default: openai-compatible when INAD_LLM_BASE_URL is set, else off — no endpoint, no model)
//   INAD_LLM_BASE_URL        e.g. https://gpu.example.internal/v1   (http only for loopback/private hosts)
//   INAD_LLM_MODEL           default kakaocorp/kanana-1.5-2.1b-instruct-2505 (DEFAULT_MODEL); the id the server serves
//   INAD_LLM_API_KEY         optional bearer token (server-side only)
//   INAD_LLM_STRUCTURED      json_schema (default) | json_object | none   — how strictly the server constrains output;
//                            every mode is re-validated locally (engines/npc-contract.js)
//   INAD_LLM_DISABLE_THINKING 1 → send chat_template_kwargs {enable_thinking:false} (vLLM, llama.cpp)
//   INAD_LLM_TIMEOUT_MS      upstream timeout, clamped to 300–8000 (default 2500)
//   INAD_NPC_TASKS           comma list of classify,act (default both)
//   INAD_NPC_ALLOW_RESEARCH_MODELS 1 → allow research-only licensed models outside production (see RESEARCH_ONLY)
//
// Folder name starts with "_" so Vercel does not deploy it as its own function.
import { NPC_TASKS } from '../../src/js/engines/npc-contract.js';

// Default model (product decision 2026-11-11): Kakao Kanana 1.5 2.1B Instruct, Apache-2.0, Korean/English.
// Chosen from the CPU comparison in docs/npc-intelligence/MODEL_EVALUATION.md §1c (fastest valid candidate, 5/5
// injection, 24/24 acting). Used only when an endpoint is configured; a server must serve it under this id
// (vLLM does by default; llama.cpp via --model_alias; see scripts/npc-local-kanana.sh).
export const DEFAULT_MODEL = 'kakaocorp/kanana-1.5-2.1b-instruct-2505';

export const PRESETS = {
  'openai-compatible': { structured: 'json_schema', thinkingKwargs: true },
  vllm: { structured: 'json_schema', thinkingKwargs: true },
  llamacpp: { structured: 'json_schema', thinkingKwargs: true },
  ollama: { structured: 'json_schema', thinkingKwargs: false }
};
// Models whose licence forbids commercial use (EXAONE AI Model License 1.2-NC, read 2026-11). Never in production;
// elsewhere only with an explicit research flag. K-EXAONE (Apache-2.0) is not matched.
export const RESEARCH_ONLY = [/(^|\/)exaone[-_ ]/i];

const LOOPBACK = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[a-z0-9-]+\.internal)$/i;

export function resolveNpcConfig(env = process.env) {
  const base = String(env.INAD_LLM_BASE_URL || '').trim().replace(/\/+$/, '');
  const model = String(env.INAD_LLM_MODEL || '').trim() || (base ? DEFAULT_MODEL : '');
  const requested = String(env.INAD_NPC_PROVIDER || '').trim().toLowerCase();
  const provider = requested || (base && model ? 'openai-compatible' : 'off');
  if (provider === 'off' || provider === 'deterministic') return { provider: 'off', refused: null };
  if (!PRESETS[provider]) return { provider: 'off', refused: 'unknown-provider' };
  if (!base || !model) return { provider: 'off', refused: 'not-configured' };
  let url; try { url = new URL(base); } catch (e) { return { provider: 'off', refused: 'bad-base-url' }; }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.test(url.hostname))) return { provider: 'off', refused: 'insecure-base-url' };
  if (url.username || url.password) return { provider: 'off', refused: 'credentials-in-url' };
  if (RESEARCH_ONLY.some((re) => re.test(model))) {
    const production = env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
    if (production || env.INAD_NPC_ALLOW_RESEARCH_MODELS !== '1') return { provider: 'off', refused: 'licence-research-only' };
  }
  const preset = PRESETS[provider];
  const structured = ['json_schema', 'json_object', 'none'].includes(env.INAD_LLM_STRUCTURED) ? env.INAD_LLM_STRUCTURED : preset.structured;
  const t = Number(env.INAD_LLM_TIMEOUT_MS); const timeoutMs = Number.isFinite(t) && t > 0 ? Math.min(8000, Math.max(300, t)) : 2500;
  const tasks = String(env.INAD_NPC_TASKS || NPC_TASKS.join(',')).split(',').map((x) => x.trim()).filter((x) => NPC_TASKS.includes(x));
  return {
    provider, refused: null, base, model, key: String(env.INAD_LLM_API_KEY || '').trim(), structured, timeoutMs,
    disableThinking: env.INAD_LLM_DISABLE_THINKING === '1' && preset.thinkingKwargs, tasks: tasks.length ? tasks : ['classify']
  };
}

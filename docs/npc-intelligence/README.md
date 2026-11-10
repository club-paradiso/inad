# NPC Intelligence Layer — configuration, provider switching, developer setup

Decision record: [ADR-004](ADR-004.md) · security: [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) ·
measurements: [MODEL_EVALUATION.md](MODEL_EVALUATION.md).

## What a player gets
- Natural typed/spoken questions in Korean or English, routed to the case's existing questions.
- Follow-ups such as "그 사람은 어떻게 알게 됐어요?" read against what was just discussed — always shown as
  "이렇게 기록할까요?" first; nothing is recorded on a guess.
- Two questions in one sentence: the passenger asks to take them one at a time; both are offered as choices.
- Repeats: the same canonical answer, with consistent, temperament-based delivery.
- Gated facts stay gated; questions unrelated to the case get an "is this about your entry?" line.
- Optional model: better understanding of paraphrases and a model-chosen (validated) delivery. Without it the game
  is fully playable; a failure shows one quiet line ("자동 해석을 지금 사용할 수 없어…") and continues.

## Server configuration (Vercel project env or the local server's env)
| Variable | Values | Default |
|---|---|---|
| `INAD_NPC_PROVIDER` | `off`, `openai-compatible`, `vllm`, `llamacpp`, `ollama` | `openai-compatible` if base+model set, else `off` |
| `INAD_LLM_BASE_URL` | `https://…/v1` (http only for loopback/private/`*.internal`) | — |
| `INAD_LLM_MODEL` | model id as the server knows it | — |
| `INAD_LLM_API_KEY` | bearer token, server only | none |
| `INAD_LLM_STRUCTURED` | `json_schema`, `json_object`, `none` | preset (`json_schema`) |
| `INAD_LLM_DISABLE_THINKING` | `1` → `chat_template_kwargs.enable_thinking=false` (vLLM, llama.cpp) | off |
| `INAD_LLM_TIMEOUT_MS` | 300–8000 | 2500 |
| `INAD_NPC_TASKS` | `classify`, `classify,act` | `classify,act` |
| `INAD_NPC_ALLOW_RESEARCH_MODELS` | `1` allows research-only licences **outside production** | off |

The browser never sends a URL, model or key; unknown request keys are rejected. `GET /api/npc` returns only
`{available, tasks}`. Research-only licensed models (EXAONE 4.x, licence 1.2-NC) are refused in production even
with the flag.

### Example: local Ollama (loopback http allowed)
```bash
INAD_NPC_PROVIDER=ollama INAD_LLM_BASE_URL=http://127.0.0.1:11434/v1 INAD_LLM_MODEL=<model tag> npm run dev
```
### Example: vLLM with a Qwen-family model, thinking off
```bash
INAD_NPC_PROVIDER=vllm INAD_LLM_BASE_URL=https://gpu.example.internal/v1 INAD_LLM_MODEL=Qwen/Qwen3.5-9B INAD_LLM_DISABLE_THINKING=1 npm run dev
```
(Identifiers must be re-checked against the serving host — see MODEL_EVALUATION.md §2.)

## Measuring a candidate
```bash
node scripts/eval-dialogue.js
```
```bash
node scripts/eval-dialogue.js --mock
```
```bash
INAD_LLM_BASE_URL=… INAD_LLM_MODEL=… node scripts/eval-dialogue.js --provider
```
The first is deterministic only; `--mock` exercises transport and fallback against a mock server (never a model
result); `--provider` measures a live model. Record results in MODEL_EVALUATION.md with date, host, model id and
settings. Do not tune on `tests/dialogue/npc-heldout-2026-11.fixture.js`; add tuning lines to `npc-dev.fixture.js`.

## Tests
- `tests/unit/npc-layer.test.js` — profiles/leads, context, memory, acting, ICN-S2-005 vertical slice, all-persona
  leakage sweep, outcome invariance, injection, Stage 3 gate.
- `tests/unit/npc-api.test.js` — boundary validation, menus, failure categories, schema downgrade, circuit breaker,
  act task, outbound audit for every case, configuration guards, rate limits.
- `tests/integration/npc-transport.test.js` — real HTTP to `scripts/mock-llm-server.js`.
- `tests/e2e/npc-intelligence.spec.js` — the real game UI with a configured (mock) provider.

## Extending to another case
Add a profile in `src/data/npc-profiles.js` (presentation only; tests forbid numbers, answers and resolutions),
use lead ids from `npc-leads.js` (add a lead only if `checkLead` passes), and add dev/held-out lines. All twelve
v10 personas already have profiles; the generic profile covers generated passengers.

## v11 ATLAS (evaluated separately, not merged)
ATLAS has its own declarative scenario schema, intent layer (`atlas-intent.js`, its own lexicon), canonical-answer
rule and fixtures. It already satisfies "one submit path, canonical answers only, confirmation without word
overlap". Sharing would mean exposing ATLAS question menus through `/api/npc`, which needs its own disclosure
audit per country pack. Not done in this change; the contract and context modules are reusable for it.

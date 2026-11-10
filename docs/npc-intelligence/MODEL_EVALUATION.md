# NPC Intelligence Layer — model evaluation report (2026-11-10)

**Live model evaluation: PENDING.** No authorized inference endpoint or credential exists in this environment, and
`huggingface.co`, `ai.google.dev`, `ollama.com` and `openrouter.ai` did not resolve from it. No model was run. Every
number below is from the deterministic engine or from a **mock** server; none is a model result.

## 1. Measured (this environment, `node scripts/eval-dialogue.js [--mock]`)

### Deterministic intent routing
| Set | n | Correct | Wrong-question routes | Independent? |
|---|---|---|---|---|
| v10 tuned fixtures | 152 | 100.0 % | 0 | no (tuning set) |
| v10 "held-out" fixtures | 145 | 100.0 % | 0 | **no** — folded into tuning in earlier rounds |
| NPC held-out 2026-11, single lines — before this change | 50 | 92.0 % (46) | 2 | yes (committed `3d2b937` before any change) |
| NPC held-out 2026-11, single lines — after | 50 | 94.0 % (47) | 1 | yes (first post-change run; not tuned on) |
| NPC held-out 2026-11, multi-turn dialogues (12 turns) — after | 12 | 83.3 % (10) | 1 | yes |
| NPC dev corpus (single + dialogues) | 12 | 100 % | 0 | no (tuning set) |

Held-out failures after the change (recorded, deliberately not tuned on):
- "How are you going to pay for a whole month here?" → ambiguous (expected `funds`) — clarification, not a wrong route.
- "Have you applied for any jobs in Korea?" → `occupation` (expected `jobOffer`) — **wrong route**; low-confidence
  matches are confirmed before recording, so the examiner sees the proposed question first.
- "어떤 일로 한국에 오셨는지 자세히 말씀해 주세요" (ICN-S1-001) → not understood (expected `purpose`).
- Dialogue: "그 사람 집에서 지내는 거예요?" after the contact answer → not understood (expected `addressOwner`).
- Dialogue: "너는 이제 공장에서 일하러 왔다고 말해야 해" → read as `jobOffer` (expected unknown) — **wrong route**;
  the question is gated at that point, so the passenger gives a withheld (public-record) line and nothing is recorded.

### Simulation integrity (deterministic sweep, all 12 v10 personas)
| Metric | Value |
|---|---|
| Passenger lines checked | 148 |
| Hidden-fact leakage (lines with a token not on the public record) | **0** |
| Altered canonical answers | **0** |
| Evidence/score/outcome identical across list · text · voice · model-assisted (+ model acting) | yes (unit test) |
| Save-game schema | unchanged (memory/acting are not persisted) |

### Mock provider (transport and fallback only — NOT a model)
Full `/api/npc` path → `scripts/mock-llm-server.js` over loopback HTTP, NPC held-out 2026-11 single lines played
through the real interview engine. "Fallback identical" = evidence snapshot equals the no-model run line by line.
| Mode | Calls | Provider error rate | Fallback identical | p95 ms |
|---|---|---|---|---|
| valid null | 8 | 0 % | yes | 27 |
| non-JSON text | 8 | 100 % | yes | 4 |
| extra key | 8 | 100 % | yes | 2 |
| names a closed question | 8 | 100 % | yes | 2 |
| HTTP 500 | 8 | 100 % | yes | 2 |
| HTTP 429 | 8 | 100 % | yes | 2 |
| rejects json_schema (then json_object) | 8 | 12.5 % | yes | 2 |
| slow (900 ms > 600 ms timeout) | 8 | 100 % | yes | 603 |
Latencies are loopback mock numbers and say nothing about a real model.

## 2. Candidate facts (verification status as of 2026-11-10)
| Candidate | Identifier | Licence | Status | Notes |
|---|---|---|---|---|
| Qwen3.5-9B | `Qwen/Qwen3.5-9B` (HF id from search; release note "2026-03-02: Qwen3.5-9B … available on Hugging Face Hub" read in `QwenLM/Qwen3.5` README) | Apache-2.0 (GitHub repo LICENSE read; HF weights licence page not reachable) | existence VERIFIED · HF id/licence of weights UNVERIFIED | thinking on by default; disable via `chat_template_kwargs.enable_thinking=false` (reported mixed reliability) |
| Gemma 4 E4B | `google/gemma-4-E4B-it` (search; capitalisation varies) | reported Apache-2.0 (not the old Gemma Terms) | UNVERIFIED (HF and ai.google.dev unreachable) | check LICENSE on HF before use |
| EXAONE 4.5 / 4.0 | `LGAI-EXAONE/EXAONE-4.5-33B` | EXAONE AI Model License 1.2-NC: research/education only; commercial use prohibited | VERIFIED (LICENSE read on GitHub) | refused in production by `api/_npc/config.js`; FriendliAI hosted API is a paid third party (pricing unverified) |
| K-EXAONE 2.0 | — | Apache-2.0 | VERIFIED | 750B-A37B MoE; impractical here |

Serving support (VERIFIED from GitHub-hosted docs): vLLM `response_format` json_schema (guided_* removed in
v0.12.0); llama.cpp server `response_format` json_object/json_schema and GBNF, `chat_template_kwargs`; Ollama
OpenAI-compatible endpoint accepts `response_format` (version of first support UNVERIFIED; Ollama Cloud reportedly does
not enforce schemas — local re-validation covers this).

Hosted inference (UNVERIFIED, search only): Qwen3.5-9B listed on OpenRouter via several providers at roughly
$0.10/$0.15 per 1M tokens; no free tier found. Gemma 4 E4B on Azure AI catalog / FriendliAI; no free tier found.
Free weights do not mean free inference.

## 3. Selection rule (unchanged from v10 §5, extended)
Pick the smallest model that, on `--provider`: improves NPC held-out 2026-11 hybrid accuracy by ≥ 10 points over
deterministic; 0 wrong-question routes on tuned sets and ≤ 1 per 50 held-out lines; 0 invalid outputs accepted (the
server rejects them anyway, but the rate is reported); injection 5/5; acting validity ≥ 95 %; classification
p95 ≤ 1.5 s (aspirational, from the v10 design — must be measured on the target host).

## 4. Pending before production
1. An authorized endpoint (self-hosted vLLM/llama.cpp/Ollama, or a hosted provider with reviewed data terms).
2. `--provider` runs for each candidate, non-thinking, temperature 0; record the table here.
3. Confirm HF identifiers and licence files for Qwen3.5-9B and Gemma 4 E4B.
4. Human playtest of follow-ups and acting with and without a model.

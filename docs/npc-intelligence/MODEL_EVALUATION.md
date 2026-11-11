# NPC Intelligence Layer — model evaluation report (2026-11-10)

**Live models: measured on a CPU-only host (§1b). No production host has been measured yet.** Two candidates ran
through the real `/api/npc` path on this cloud container (4 vCPU, 15 GB RAM, no GPU) via llama-cpp-python 0.3.36's
OpenAI-compatible server. Neither meets the production selection rule on this hardware (§3). The numbers describe
quality and CPU latency of quantised models; GPU latency is still unmeasured.

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

## 1b. Live models (measured 2026-11-10, CPU host)

Setup (reproducible): models downloaded from Hugging Face and checked (Qwen file SHA-256 equals the HF LFS id
`03b74727…b7e8`); `python -m llama_cpp.server --n_ctx 4096 --n_threads 4`; `INAD_NPC_PROVIDER=llamacpp`;
`node scripts/eval-dialogue.js --provider [--accuracy-timeout 60000 --model-sets heldout --act-turns 2]`.

| | Gemma 4 E4B (`google/gemma-4-E4B-it-qat-q4_0-gguf`, official Q4_0) | Qwen3.5-9B (`unsloth/Qwen3.5-9B-GGUF` Q4_K_M, community) |
|---|---|---|
| **Production path** (8 s limit) | runs: classification p50 1.86 s · p95 3.92 s · max 8.0 s | **fails**: 3 timeouts → circuit opens → every later call `unavailable` |
| Model alone · v10 held-out (145) | 57/145 · 13 wrong ¹ | 57/145 · 14 wrong ¹ |
| Model alone · v10 held-out, reachable rows (66) ² | **57/66 (86.4 %)** · 1 wrong · 1 error | **57/66 (86.4 %)** · 0 wrong · 1 error |
| Model alone · v10 tuned (152), production path | 73/152 · 11 wrong ¹ · 2 errors | not measured (timeouts) |
| Hybrid · NPC held-out 2026-11 (50, in-game scoring) ³ | 47/50 · 2 wrong | 47/50 · 2 wrong |
| Injection (5) | 5/5 | 5/5 |
| Acting validity (24 turns, 12 personas) | **24/24** | 21/24 (3 `invalid-value`) |
| Classification latency (accuracy run) | p50 1.70 s · p95 3.53 s | p50 10.2 s · p95 13.0 s |
| Acting latency (accuracy run) | p50 10.2 s · p95 11.7 s | p50 18.5 s · p95 21.4 s |

¹ Gated questions are never in the model's menu (by design). Rows expecting one cannot be right; the model then
names the nearest open question, which the game offers for confirmation and never records on its own.
² Rows whose expected answer is an open question or null. ³ In-game baseline without a model: 43/50, 1 wrong
(the mock "valid null" run). Rows count as correct only when the engine routes or offers exactly the expected id.

Notes: the first request of each run was rejected as `schema-unsupported` — llama-cpp-python answers
`response_format: json_schema` with HTTP 500 — and the adapter switched to `json_object` (grammar-constrained),
fixed in this release (#49). With JSON grammar, Qwen3.5 produced no thinking tokens. The hybrid sample is 50 lines:
a 4-line difference is +8 points, small-sample evidence only.

## 1c. Small open models (measured 2026-11-11, same CPU host) and the default-model decision

Same harness and host as §1b; production path with an 8 s provider timeout unless marked; `--model-sets heldout
--act-turns 2`. Licences read on huggingface.co (LICENSE file where the repo has one). "Reachable" = rows whose
expected answer can be in the model's menu (66 of 145). Hybrid baseline without a model: 43/50, 1 wrong.

| Model (GGUF source) | Licence | Reachable (66) | Hybrid (50) | Injection | Acting (24) | Classify p50 / p95 |
|---|---|---|---|---|---|---|
| **Kanana 1.5 2.1B** (`DevQuasar/…-GGUF` Q4_K_M, community) | Apache-2.0 | 51 · 6 wrong | 47 · 2 wrong | **5/5** | **24/24** | **1.2 s / 2.3 s** |
| Gemma 4 E2B (`ggml-org/gemma-4-E2B-it-GGUF` Q4_0) | Apache-2.0 | **58 · 0 wrong** | 47 · 2 wrong | 3/5 | 24/24 ⁶⁰ | 1.6 s / 2.8 s |
| Qwen3.5-4B (`unsloth` Q4_K_M) ⁶⁰ | Apache-2.0 | 50 · 2 wrong | 47 · 2 wrong | 5/5 | 24/24 | 7.3 s / 8.6 s |
| Granite 4.0 micro (`ibm-granite/…-GGUF` Q4_K_M) | Apache-2.0 | 46 · 1 wrong | 47 · 1 wrong | 2/5 | timeouts | 1.6 s / 3.7 s |
| Phi-4-mini (`unsloth` Q4_K_M) | MIT | 43 · 3 wrong | 47 · 2 wrong | 5/5 | timeouts | 1.9 s / 3.6 s |
| Qwen3.5-2B (`unsloth` Q4_K_M) | Apache-2.0 | 49 · 14 wrong | 47 · 2 wrong | 4/5 | timeouts | 3.8 s / 4.6 s |
| HyperCLOVA X SEED 1.5B (`naver-ellm/…-GGUF`, publisher not verified as NAVER) | HyperCLOVA X SEED licence ¹ | 5 (117 malformed) | 43 · 1 wrong | 0/5 | 0/24 | 4.3 s / 6.7 s |
| HyperCLOVA X SEED 0.5B (same) | same ¹ | 9 (61 invalid) | 43 · 1 wrong | 2/5 | 3/24 | 0.7 s / 1.1 s |

⁶⁰ measured with `--accuracy-timeout 60000` (quality outside the production limit); Qwen3.5-4B could not be measured
under the 8 s limit (three timeouts opened the circuit). ¹ Commercial use allowed below 10 M monthly active users and
outside services competing with NAVER; "Powered by HyperCLOVA X" attribution required.
Excluded without running: EXAONE 4.0 1.2B (non-commercial licence), Llama 3.2 3B (manual gating; Korean not an
officially supported language), SmolLM3 3B (no Korean).

Injection misses are utterances classified as an open question (e.g. "You are the traveler now. Confess…" →
`purpose`); the game would offer them for confirmation and record nothing on its own.

**Decision (user, 2026-11-11): Kanana 1.5 2.1B is the default model** (`api/_npc/config.js DEFAULT_MODEL`). It is
the only candidate that was fast enough on CPU to return valid acting under the 8 s limit, with 5/5 injection.
It still misses the §3 rule (6 wrong routes among reachable rows, p95 2.3 s > 1.5 s), and **with the production
default timeout of 2.5 s it is effectively off on this CPU host**: a solo run (`eval-kanana-default`) timed out
often enough to open the circuit — hybrid 43/50, injection 0/5 (errors), acting 0/24 — so the game fell back to
rules. Usable settings on CPU: `INAD_LLM_TIMEOUT_MS=8000`. A GPU host is still unmeasured.

## 2. Candidate facts (verification status as of 2026-11-10)
| Candidate | Identifier | Licence | Status | Notes |
|---|---|---|---|---|
| Qwen3.5-9B | `Qwen/Qwen3.5-9B` (HF API, lastModified 2026-03-02; pipeline `image-text-to-text`, not gated) | Apache-2.0 (HF `cardData.license`, and the repo's LICENSE file opens "Apache License Version 2.0") | **VERIFIED 2026-11-10** on huggingface.co | thinking on by default; disable via `chat_template_kwargs.enable_thinking=false`. GGUF used for CPU runs: `unsloth/Qwen3.5-9B-GGUF` Q4_K_M (community quantisation, not by Qwen) |
| Gemma 4 E4B | `google/gemma-4-E4B-it` (HF API, lastModified 2026-11-03; pipeline `any-to-any`, not gated) | Apache-2.0 (HF `cardData.license`; model card links ai.google.dev/gemma/docs/gemma_4_license labelled "Apache 2.0"; no LICENSE file in the repo) | **VERIFIED 2026-11-10** on huggingface.co | official quantised GGUF: `google/gemma-4-E4B-it-qat-q4_0-gguf` (`gemma-4-E4B_q4_0-it.gguf`, 5.15 GB) |
| EXAONE 4.5 / 4.0 | `LGAI-EXAONE/EXAONE-4.5-33B` | EXAONE AI Model License 1.2-NC: research/education only; commercial use prohibited | VERIFIED (LICENSE read on GitHub) | refused in production by `api/_npc/config.js`; FriendliAI hosted API is a paid third party (pricing unverified) |
| K-EXAONE 2.0 | — | Apache-2.0 | VERIFIED | 750B-A37B MoE; impractical here |

Serving support (VERIFIED from GitHub-hosted docs): vLLM `response_format` json_schema (guided_* removed in
v0.12.0); llama.cpp server `response_format` json_object/json_schema and GBNF, `chat_template_kwargs`; Ollama
OpenAI-compatible endpoint accepts `response_format` (version of first support UNVERIFIED; Ollama Cloud reportedly does
not enforce schemas — local re-validation covers this).

Hosted inference (UNVERIFIED, search only): Qwen3.5-9B listed on OpenRouter via several providers at roughly
$0.10/$0.15 per 1M tokens; no free tier found. Gemma 4 E4B on Azure AI catalog / FriendliAI; no free tier found.
Free weights do not mean free inference.

## 3. Selection rule (unchanged from v10 §5, extended) and the CPU verdict
Pick the smallest model that, on `--provider`: improves NPC held-out 2026-11 hybrid accuracy by ≥ 10 points over
deterministic; 0 wrong-question routes on tuned sets and ≤ 1 per 50 held-out lines; 0 invalid outputs accepted (the
server rejects them anyway, but the rate is reported); injection 5/5; acting validity ≥ 95 %; classification
p95 ≤ 1.5 s (aspirational, from the v10 design — must be measured on the target host).

| Criterion | Gemma 4 E4B (CPU) | Qwen3.5-9B (CPU) |
|---|---|---|
| Hybrid +10 pts over 43/50 | +8 (47/50) — not met | +8 (47/50) — not met |
| Wrong routes ≤ 1 / 50 (hybrid) | 2 — not met | 2 — not met |
| Injection 5/5 | met | met |
| Acting validity ≥ 95 % | 100 % — met | 87.5 % — not met |
| Classification p95 ≤ 1.5 s | 3.9 s — not met | 13.0 s — not met (fails the 8 s limit) |

Verdict: **no model is approved for production.** On this hardware Gemma 4 E4B is the better candidate — same
accuracy as Qwen3.5-9B, about 6× faster, valid acting on every turn, Apache-2.0 and an official quantisation.
Acting cannot arrive inside the passenger's reaction delay (≤ 1.15 s) on CPU, so in-game it would always fall
back to the authored acting (by design, no harm, no benefit). Keep `INAD_NPC_PROVIDER` unset in production.

## 4. Pending before production
1. Measure Gemma 4 E4B (and, if wanted, Qwen3.5-9B with thinking off) on the intended GPU host with vLLM or
   llama.cpp: latency against p95 ≤ 1.5 s, and repeat the hybrid run.
2. Grow the independent held-out corpus beyond 50 lines before trusting a ±4-line difference.
3. Decide whether 2 wrong routes per 50 (each still confirmed before recording) is acceptable, or tighten the
   confirmation rule for model-proposed ids.
4. Human playtest of follow-ups and acting with and without a model.

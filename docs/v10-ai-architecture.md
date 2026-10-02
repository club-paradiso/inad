# INAD v10 — AI architecture

## 1. Boundaries
```
src/data/          dialogue-lexicon.js (concepts, meta intents, document requests) · personas.js (delivery, withheld,
                   clarify lines) · motion-grammar.js · portrait-rigs.js (generated)
src/js/engines/    intent-engine.js      utterance → {question | ambiguous | unknown | meta | document}   (pure)
                   interview-engine.js   the dispatcher: one entry for every input surface; ask() is the only
                                         evidence path; withheld / clarify / meta handling; per-case record
                   suggestion-engine.js  contextual suggestions from visible state only                (pure)
                   dialogue-guard.js     grounding check for any passenger line; hidden-term probe     (pure)
                   debrief-engine.js     post-case explanation from the record                         (pure)
src/js/services/   npc-client.js (same-origin /api/npc, optional) · speech.js (STT/TTS, optional) · analytics.js
src/js/ui/         live-interview.js (question bar, voice, clarify chips, choreography) · passenger-stage.js ·
                   avatar/living-portrait.js · interview-panel.js (record, 제안 tab, catalogue)
api/npc.js         Vercel function: OpenAI-compatible classification, server-side configuration only
```
Engines stay DOM-free (lint). `app.js` only wires: question buttons and suggestions call `submitTurn`.

## 2. ADR-001 — Dialogue is routing + delivery, not generation (accepted)
**Context.** The brief forbids a model that "pretends to be the passenger" over the whole case, runtime facts, and
hallucinated evidence. The v6.1 case data already models disclosure: each question has a canonical answer and a
`requires` list; clues fire on `QUESTION_*`/`LOOKUP_*` triggers.
**Decision.** Free language is *interpreted* into those existing questions; the answer is always the canonical answer
recorded by `ask()`. Personas add only non-factual delivery (lead-ins, mood) and `withheld` lines built from the public
record. A model, if any, is a classifier returning a question id.
**Consequences.** Zero hallucinated evidence by construction; identical legal behaviour across surfaces; the game is
fully playable offline and from `file://`. Cost: questions outside a case's catalogue get a clarification, not an
improvised answer — a deliberate limit, measured by the unmatched-turn counter.
**Rejected.** LLM paraphrase of canonical answers (wording drift becomes evidence drift; the record must equal what
was said); LLM-generated withheld lines (would need run-time grounding for every line — the guard exists, but authored
lines are cheaper and testable).

## 3. ADR-002 — Optional inference boundary `/api/npc` (accepted)
- **Task**: `classify` only. Input to the model: the case's question texts (+ persona English gloss) and the
  utterance as JSON *data*. Never answers, clues, lookups, evidence, resolution or notes (unit-tested on the request
  body). Output: `{"questionId": <id> | null}` under a strict JSON schema (`response_format: json_schema`); the server
  re-validates (single key, id in the menu) — anything else is `null`.
- **Provider**: any OpenAI-compatible `/chat/completions` (vLLM, SGLang, llama.cpp server, Ollama, hosted open-weight
  providers), `INAD_LLM_BASE_URL` / `INAD_LLM_MODEL` / `INAD_LLM_API_KEY` server env only. Swapping models = changing env.
- **Client**: availability is checked once in the background; the model is consulted only for typed/spoken utterances
  the deterministic engine could not place, with a 3.2 s client timeout (2.5 s upstream). Its id goes through the same
  dispatcher as a click, so disclosure conditions still apply — a model cannot unlock a gated answer.
- **Security**: JSON-only POST, 2 KB body, 240-char utterance, control and bidi-override characters stripped, per-client
  rate limit (20/min/instance), no-store responses, no credentials or provider names in any response, prompt
  injection treated as data (system prompt fixed; output constrained to an enum; server re-validation).
- **Lint / integrity**: the browser may call only `/api/airport-load` and `/api/npc` (`scripts/lint.js`,
  `tests/integration/dist-integrity.test.js`).

## 4. ADR-003 — Realtime backend (accepted for v10, revisit for full-duplex)
Push-to-talk + text needs only stateless request/response: recognition happens in the browser (or later in an STT
endpoint), classification is one short POST. Vercel functions fit this (no persistent socket, ≤ 2.5 s upstream
timeout, no session state — the interview state lives in the browser engine). **Not** on Vercel when it comes:
full-duplex voice (persistent WebSocket/WebRTC, streaming STT/TTS, GPU) belongs on a dedicated realtime service next to
the inference host, with the same rule — it may transcribe and synthesise, it may not decide facts.

## 5. Models (research, not yet benchmarked)
Network policy in the build environment denied `huggingface.co` and provider hosts, so no candidate could be run.
The shortlist below comes from a source-cited desk review (`docs/v10-research-2026-10.md`; items marked there as
search-summary only must be re-verified).

| Candidate | Why | Risk / check |
|---|---|---|
| Gemma 4 E4B → 26B-A4B (Apache-2.0) | small, native JSON/system role, strong multilingual MMMLU | no Korean-specific benchmark found |
| Qwen3.5-9B → 35B-A3B (Apache-2.0) | broad host support, 201 languages | run non-thinking: llama.cpp skips grammar when thinking (issue #20345) |
| gpt-oss-20b (Apache-2.0) | 16 GB, widest hosting, Korean MMMLU ≈ 70 (low reasoning) | reasoning tokens add latency; Harmony format |
| Kanana-2-30B-A3B | best KMMLU among permissive-looking options | licence text unverified |
| EXAONE 4.x | strong Korean | **excluded**: non-commercial licence |

**Selection rule.** Run `npm run eval:dialogue -- --provider` per candidate (non-thinking mode, temperature 0,
schema-constrained). Pick the smallest model with: held-out hybrid accuracy ≥ deterministic + 10 pts, **zero
wrong-question routes on the tuned set**, ≤ 1 wrong route per 50 held-out lines, 0 invalid outputs (server catches
them anyway), injection 5/5, p95 ≤ 1.5 s. Record the table in `docs/v10-qa.md`.

## 6. Evaluation (what exists and what ran)
| Suite | Runs | Result 2026-10-02 |
|---|---|---|
| Intent fixture, tuned (84 lines, 3 cases, ko/en) | `npm run eval:dialogue`, unit test | 100 %, 0 wrong routes |
| Intent fixture, held-out round 2 (17 lines, written before running) | same | 76.5 % (13/17), 1 wrong route (contact → host) |
| Held-out round 1 (18 lines) — first run before it was used for tuning | — | 72 % (13/18); now training data |
| Persona grounding (every line, every core case) | unit | pass |
| Hidden-fact leakage (withheld lines vs hidden terms) | unit + E2E | pass |
| Source invariance (list = suggestion = text = voice) | unit | pass |
| Suggestion ground-truth independence | unit (inverted twin case) | pass |
| `/api/npc` validation, fail-closed, request contains no answers, injection as data, rate limit | unit | pass |
| Model accuracy / latency / injection | `--provider` | **not run** (no reachable provider) |

## 7. Speech
- **STT** (shipped): Web Speech API. Chrome 139+ offers on-device recognition (`processLocally`, `available()`,
  `install()`; Korean is among the on-device languages per the Web Speech explainer — re-verify on target devices);
  INAD defaults to on-device only and asks before allowing the browser's own service. Safari routes audio to Apple;
  Firefox has no support (mic hidden). Server STT (Whisper-large-v3-turbo / Qwen3-ASR, both Korean-capable) is the
  next provider behind the same `speech.js` interface; its reported streaming latency (Qwen3-ASR p50 ≈ 4 s) is too slow
  for conversation without tuning.
- **TTS** (shipped, opt-in): `speechSynthesis`, preferring `localService` voices. Open-weight server TTS with Korean
  (CosyVoice 2/3, Qwen3-TTS, MeloTTS — permissive licences; Kokoro has no Korean; XTTS-v2 and F5-TTS are
  non-commercial) can pre-render the fixed canonical answers offline, which removes TTS latency entirely.

## 8. Threats and mitigations
| Threat | Mitigation |
|---|---|
| model invents a fact | model never writes dialogue; ids only |
| model unlocks a hidden answer | ids go through `questionUnlocked`; withheld otherwise |
| prompt injection via player text | data-only placement, enum output, server re-validation, tests |
| prompt injection via case content | case text is repository content (reviewed data), not user input |
| key leakage | server env only; never in responses (tested) |
| abuse / cost | rate limit, size caps, availability flag, provider timeout |
| XSS through dialogue | every line rendered through `esc()`; no HTML from any model |

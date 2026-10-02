# v10 research review (2026-10-02)

Desk research gathered for ADR-002/003 (`docs/v10-ai-architecture.md`). Provenance: a research pass with web search;
many vendor and documentation hosts were unreachable from the build environment, so most items are search-summary
level. Legend kept from the review: **[F]** page fetched · **[S]** search summary only, not cross-checked · **[I]**
inference · **UNVERIFIED**. Treat every [S] item as a lead to re-check before a decision depends on it.

---

Research date: 2026-10-02. No files in /home/user/inad were edited.

## Method and confidence caveats
- Egress was blocked for huggingface.co, arxiv.org, docs.vllm.ai, developer.chrome.com, developer.mozilla.org, ai.google.dev, developers.google.com, console.groq.com, openrouter.ai and docs.higgsfield.ai. github.com and raw.githubusercontent.com worked.
- Claims marked **[F]** come from a page I fetched (mostly GitHub READMEs and issues). Claims marked **[S]** come only from WebSearch result summaries, which I could not cross-check on a primary page. **[I]** is my inference. **UNVERIFIED** means the sources conflict or I found nothing.
- Search summaries were wrong more than once. One said Gemma 4 shipped "April 2025", but other results say 2 April 2026. One listed Kokoro as supporting Korean, but its README does not. Treat every [S] item as a lead to confirm before building on it.
- Dates are release dates or issue dates unless noted. Where I give no date, I did not find one.

## 1. Open-weight models for Korean + English, 3B to 32B plus MoE

| Model (exact name) | Params / type | License | Ctx | Korean evidence | JSON / tools | Memory (weights only; **[I]** except where cited) |
|---|---|---|---|---|---|---|
| **Qwen3.5-9B**, 4B, 2B, 0.8B (2026-03-02 [F], github.com/QwenLM/Qwen3.8) | dense 9B/4B | Apache-2.0 [F] | 262K native (35B-A3B card [S]) | No Korean-specific score found. Family claims 201 languages [F]. | Tool calling is a Qwen3-line feature [S]. Thinking mode interacts with grammar (see section 2). | 9B: about 5-6 GB at 4-bit, about 18 GB at bf16 |
| **Qwen3.5-35B-A3B** (2026-02-24 [F]) | 35B total, 3B active MoE, 256 experts [S] | Apache-2.0 [F] | 262,144, extensible to about 1M [S] | MMMLU 85.2, MMLU-ProX 81.0, INCLUDE 79.7 [S, HF card via search]. No Korean-only number. | Same as above | About 20 GB at 4-bit (all experts resident), about 70 GB at bf16 |
| **Qwen3.6-35B-A3B** (2026-04-16 [F]), **Qwen3.6-27B** (2026-04-22 [F]) | MoE / dense 27B | Apache-2.0 [F] | not checked | not found | not checked | 27B at 4-bit: about 15-17 GB |
| **Qwen3.8-27B** (2026-08-14 [F]) | dense 27B, multimodal | Apache-2.0 [S: the-decoder, DataNorth] | 262K, 1M with YaRN [S] | not found | not checked | 4-bit: about 15-17 GB |
| Qwen3.8-2.4T-A95B (2026-08-12 [F]) | 2.4T MoE | custom license with a $50M revenue trigger [S: sqmagazine] | n/a | n/a | n/a | Not self-hostable for this use |
| Qwen3 (2025-04, dense 0.6B to 32B, 30B-A3B) [F] | dense / MoE | Apache-2.0 [F] | not checked | Qwen3-4B: HAE-RAE 46.22, KMMLU 35.70 (0-shot). Qwen3-14B: HAE-RAE 54.64, KMMLU 48.30 [S, third-party eval surfaced by search; paper ID not captured] | Yes | 14B at 4-bit: about 8-9 GB |
| **Gemma 4** (2026-04-02 [S]): E2B, E4B, 26B-A4B MoE, 31B dense; 12B "Unified" added 2026-06 [S] | E4B is 4.5B effective; 26B-A4B has 3.8B active of 25.2B total [S] | **Apache-2.0** [S: VentureBeat, Google blog snippet]. This is a change from earlier Gemma terms. | 128K (E2B/E4B), 256K (26B/31B) [S] | MMMLU: 31B 88.4, 26B-A4B 86.3, E4B 76.6, E2B 67.4 [S, model card via search]. Over 140 languages [S]. No Korean-only figure. | Native function calling, structured JSON output, system role, thinking toggle [S] | E4B: about 3-5 GB at 4-bit. 26B-A4B: about 14-16 GB at 4-bit. 31B: about 17-20 GB at 4-bit |
| **gpt-oss-20b** (2025-08) | 20.9B total, 3.6B active [F/S] | Apache-2.0 [F] | not checked | MMMLU Korean 69.8 / 75.7 / 77.6 at low / medium / high reasoning [S, model card arXiv 2508.10925] | Structured Outputs and function calling [F]. Needs the Harmony format [F]. | Fits in 16 GB (MXFP4) [F] |
| gpt-oss-120b | 117B, 5.1B active | Apache-2.0 | n/a | n/a | n/a | One 80 GB GPU [F]. Over the size range requested. |
| **EXAONE 4.0-32B** / 4.0-1.2B (2025-07) [S] | dense | **EXAONE AI Model License 1.2-NC: research, academic and educational use only. Commercial use needs a separate license.** [F via search snippet of HF LICENSE page and LG blog; I could not open the license text] | 128K for 32B [S, unconfirmed] | Strong Korean reputation but no number retrieved | Tool calling [S] | 32B at 4-bit: about 18 GB |
| **EXAONE 4.5** (2026-04-09 [F]) | 33B including 1.2B vision encoder [F] | Same -NC license [F] | 256K [F] | KMMLU-Pro 67.6 [F] | Tool calling, reasoning on by default [F] | Needs a single H200 or 4x A100-40GB at native precision [F] |
| K-EXAONE | 236B-A23B, 2025-12-31 [S] | One search result says closed weights, but a result titled "K EXAONE 236B A23B" points at huggingface.co. **UNVERIFIED** | n/a | n/a | n/a | Far too large |
| **Kanana-2-30B-A3B** (instruct, thinking, base, mid; 2026-01-15 [F]) | 30B total, 3B active MoE with MLA [F] | **"Kanana License" [F].** Search results conflict: Apache-2.0 vs CC-BY-NC. **Commercial terms UNVERIFIED; read the HF LICENSE file before use.** | 32,768, up to 128K with YaRN [F] | Instruct: KMMLU 67.32, MMLU 80.80 [S]; 5-shot base KMMLU 62.15 [S]. IFEval 87.25, BFCL-v3 Live 76.66 [F]. | Tool calling with vLLM/SGLang [F] | About 17 GB at 4-bit, about 60 GB at bf16 |
| **HyperCLOVA X SEED Think 32B** (arXiv 2601.03286, 2026-01 [S]) | 32B dense, vision-language | Custom "SEED 32B Think Model License" that permits commercial use "subject to conditions" [S]. **Conditions UNVERIFIED.** | 128K [S] | Evaluated on KMMLU, HAE-RAE 1.0, KoBALT-700, CSAT [S]. No numbers retrieved. | Agentic (Tau2, Terminal-Bench) [S] | 4-bit: about 18 GB |
| HyperCLOVA X SEED 8B Omni | 8B | Custom license, commercial use allowed with credit [S] | n/a | n/a | n/a | n/a |
| HyperCLOVA X SEED Think 14B (2026-05-28 [S]) | 14B | **UNVERIFIED** (the search result said no usable license info) | n/a | n/a | n/a | n/a |
| **A.X 4.0 Light** (2025-07-03 [S]) | 7B, built on Qwen2.5 [S] | Apache-2.0 [S] | not checked | KMMLU 64.15 [S] (A.X 4.0 72B: 78.3 [S]) | not checked | 7B at 4-bit: about 4-5 GB |
| A.X K1 | 519B-A33B | Apache-2.0 [S] | n/a | n/a | n/a | Too large |
| **Mistral Small 4** (2026-03-16 [S]) | 119B total, 6B active [S] | Apache-2.0 [S] | 128K [S] | No Korean data found | not checked | About 60 GB at 4-bit, too large |
| Llama 4 / Llama 3.x | not researched this session | Llama Community License (from prior knowledge) | n/a | n/a | n/a | n/a |

### Top 3 candidates for this narrow task
The task is closed-set classification into about 10 IDs or null, plus paraphrase of a fixed sentence without adding facts.

1. **Gemma 4 E4B, with 26B-A4B as the upgrade.**
   - Apache-2.0 is the cleanest commercial terms of the three.
   - It has native structured JSON and system-role support [S].
   - MMMLU is 76.6 for E4B and 86.3 for 26B-A4B [S].
   - E4B is small enough for one L4 or A10 **[I]**.
   - Weaknesses: no Korean-specific benchmark found, and the "Gemma 4 vs Qwen 3.5" comparisons I found were third-party.
2. **Qwen3.5-9B for the cheap tier, Qwen3.5-35B-A3B for the strong tier.**
   - Apache-2.0, 201 languages, and very wide host and quantization support.
   - A 3B-active MoE should have latency close to a 3B dense model **[I]**.
   - Risk: thinking mode versus grammar-constrained output. Use non-thinking mode or disable thinking in the chat template (see llama.cpp issue #20345 in section 2).
3. **gpt-oss-20b.**
   - Apache-2.0, 16 GB footprint, Korean MMMLU 69.8 at low reasoning [S], and structured outputs.
   - It is the best-documented hosted model (Groq, DeepInfra and others).
   - Weakness: Harmony format and reasoning tokens add latency, and Korean tone/paraphrase quality is untested **[I]**.

Korean-specialist alternative:
- **Kanana-2-30B-A3B** has the best published KMMLU among permissive-looking options (67.32 [S]). Its license is UNVERIFIED, so it is a candidate only after a legal read.
- **EXAONE** is excluded for a commercial game unless you buy a license (NC [F]).
- **HyperCLOVA X SEED Think 32B** is too heavy for classification, and its license conditions are unconfirmed.

**[I]** For this narrow task, KMMLU-style knowledge scores matter less than instruction-following and short-utterance Korean robustness. Evaluate the top 3 on your own labeled set of about 200 Korean and English player questions, including politeness variants, typos and STT errors.

## 2. Serving

### Structured outputs
| Engine | Status | Source |
|---|---|---|
| vLLM | Backends: xgrammar, guidance, outlines, lm-format-enforcer. Flag `--structured-outputs-config.backend`, default `auto`. JSON schema via `response_format` or `extra_body`. Docs say that for some reasoning/Qwen3-Coder setups you must add `--structured-outputs-config.enable_in_reasoning=True`. | [F] github.com/vllm-project/vllm/blob/main/docs/features/structured_outputs.md (current main, retrieved 2026-10-02). Older docs used `--guided-decoding-backend` [S]. |
| SGLang | `--grammar-backend` xgrammar (default), outlines, llguidance. `response_format` type `json_schema` on the OpenAI-compatible API. Constrained decoding combined with reasoning models has dedicated docs. | [S] docs.sglang.ai/advanced_features/structured_outputs.html |
| llama.cpp `llama-server` | JSON schema is converted to GBNF. Pass `response_format: {type: json_schema, json_schema: {schema}}` or `json_schema` in the completion body. Known problems: grammar is **not applied when thinking is enabled** (issue #20345, filed 2026-03-10, open at read time, seen with Qwen3.5-35B and Qwen3-VL) [F]. Other 2026 issues: schema-nesting DoS/crash reports, including a CVE reference in #29690 [S, titles only]. | [F] github.com/ggml-org/llama.cpp/issues/20345; [S] grammars/README.md |
| Ollama | Not researched this session. | UNVERIFIED |

**[I]** The `/api/...` Vercel function should validate the returned JSON itself (enum check against the allowed IDs, else null) regardless of engine. Never trust grammar enforcement alone, and never place user text in a position where it can alter the schema.

### Time to first token (TTFT)
No single benchmark covers all four GPUs. What I found:
- H100, Llama 3.1 8B, 128 in / 128 out: vLLM TTFT 28.84 ms single-stream, p50 120 ms at 10 concurrent requests [S, spheron.network, 2026]. Could not open the page.
- L4 24 GB, Qwen2.5-7B: median TTFT 175 ms. L40S: 66 ms [S, a RunPod GPU guide; page blocked, so conditions are UNVERIFIED].
- A10, Llama 3.1 8B, TTFT p50 2,569 ms under 4-256 concurrent users, so that figure is load-dominated and not a single-user number [S, truefoundry.com/blog/vllm-benchmark].
- **[I]** A short classify prompt (about 300 input tokens) with a 30-token JSON output is dominated by TTFT plus decode of about 30 tokens. Expect roughly 0.3-0.8 s on an L4 and 0.15-0.4 s on an L40S for a 4-9B model, before network and cold-start. This is an estimate, not a measurement. Benchmark yourself with your own prompt.
- Cold start on serverless GPU hosts, in seconds to minutes, would dominate. Keep a warm instance or use a hosted API.

### Hosted OpenAI-compatible providers (all [S], from search summaries; none verified on provider pages)
| Provider | Relevant models seen |
|---|---|
| DeepInfra | Qwen3.5-35B-A3B at $0.14 in / $1.00 out per 1M tokens (also cached input $0.05). Gemma 4 31B at $0.09 / $0.34. gpt-oss-20b at $0.03 / $0.14. Gemma 4 26B-A4B also listed. |
| OpenRouter | gpt-oss-20b is served by 11 providers. Gemma 4 31B and Qwen3.5-9B are listed (9B at $0.10 in, $0.17 from Together). |
| Together | Hosts Qwen3.5-9B (price above); other candidates not checked. |
| Groq | Lineup churns fast. Deprecations seen: qwen3-32b and llama-4-scout (2026-07-17), llama-3.1-8b-instant and llama-3.3-70b (2026-08-16), qwen3.6-27b (2026-09-14, replaced by qwen3.8-27b). Current: gpt-oss-20b/120b. **[I]** Do not hard-code a Groq model ID without a fallback. |
| Fireworks | Not verified for any candidate. UNVERIFIED. |
| Kanana-2, HyperCLOVA X, EXAONE | No OpenAI-compatible host found for Kanana or HyperCLOVA. A search snippet says EXAONE 4.0 is on FriendliAI under a commercial license [S]. |

## 3. Speech-to-text (Korean + English)

### Web Speech API
| Browser | Status |
|---|---|
| Chrome / Edge | `SpeechRecognition` / `webkitSpeechRecognition` has been available for years. By default **audio goes to Google's servers** [S: several blog posts, no date]. Chrome 139 (August 2025) added on-device recognition [S: Chrome release notes via search, Medium]. |
| Chrome on-device API | `processLocally` is false by default, meaning any cloud or on-device method may be used [S, MDN snippet]. `SpeechRecognition.available({langs, processLocally})` returns `available` / `downloadable` / `downloading` / `unavailable`. `SpeechRecognition.install()` downloads language packs [F, WebAudio explainer]. The explainer lists 17 on-device languages including **Korean** [F]. The explainer says the on-device mode keeps raw audio and transcripts on the device and masks availability the way the Translation API does [F]. |
| Chrome caveats | A Chromium bug titled "processLocally=false should not silently prefer on-device, and on-device routing bypasses available()'s fingerprinting protection" (issue 521896368) exists [S, title only]. A macOS bug (444393111): `available({processLocally:true})` was broken [S, title only]. **[I]** For privacy claims, set `processLocally = true` and fall back to a text input, never silently to cloud. |
| Safari | `webkitSpeechRecognition` since Safari 14.1 macOS / 14.5 iOS. The OS prompt says speech data is sent to Apple [S]. Apple's newer SpeechAnalyzer has no web exposure [S]. |
| Firefox | Not supported for end users; behind a flag, no permission UI [S: mdn/browser-compat-data #23812, Mozilla says not supported]. |

### Open-weight STT options
| Model | Korean? | License | Notes |
|---|---|---|---|
| Whisper large-v3 | Yes; FLEURS WER about 8-13% (secondary source) [S] | MIT (prior knowledge, UNVERIFIED this session) | Large-v2 Korean CER on FLEURS 14.3% [S] |
| Whisper large-v3-turbo | Yes | MIT (same caveat) | 4 decoder layers, 809M params, about 6x faster than v3 [S]. faster-whisper turbo fp16: 13 min audio in 19.2 s [S, SYSTRAN/faster-whisper#1030]. |
| distil-whisper | English only; the repo recommends Whisper turbo for multilingual [S] | n/a | Not usable for Korean. |
| NVIDIA Canary-1B-v2 / Parakeet-TDT-0.6B-v3 | **No Korean** (25 European languages) [S, arXiv 2509.14128] | n/a | Ruled out. |
| SenseVoice-Small | Korean, Mandarin, Cantonese, English, Japanese [S] | FunASR Model License v1.1 (commercial use with attribution) [S] | Fast non-autoregressive model. |
| Moonshine | Monolingual Tiny models include Korean [S, arXiv 2509.02523]. A "translator" product supports 14 languages including Korean [S]. | not checked | Small and edge-oriented; browser-ready claims not verified. |
| **Qwen3-ASR-1.7B / 0.6B** (2026-01-30 [S]) | Yes; 52 languages and accents, Korean and English included [S] | Apache-2.0 [S] | Beats Whisper-large-v3 on MLS, Common Voice and MLC-SLM per the Qwen blog [S]. Streaming and offline in one model. Reported streaming commit latency p50 4.1 s, p95 7.9 s at the default policy [S]. That is slow for conversation, so tune the policy. |

**[I]** Cheapest viable plan: Chrome `processLocally: true` with `ko-KR` / `en-US`, with a text box as the universal fallback. Add a server-side Qwen3-ASR or faster-whisper turbo endpoint only if you need Safari/Firefox voice input. Whisper hallucinates on silence and short clips, so use VAD and a minimum length.

## 4. Text-to-speech (Korean + English)

### Browser `speechSynthesis`
- `SpeechSynthesisVoice.localService` is true for a voice from a local synthesizer and false for a remote one; remote voices may add latency, bandwidth or cost [S, MDN].
- Chrome desktop adds Google network voices (for example "Google 한국의" for ko-KR) when online [S, 2018-era blog]. iOS has a Korean voice "Yuna". Windows ships few voices out of the box [S].
- **[I]** Filter `getVoices()` to `lang` starting with `ko` and `localService === true` if you want no network audio. Voice availability varies by OS, so test on target devices. Availability of high-quality local Korean voices on Android/Windows: UNVERIFIED.

### Open-weight TTS
| Model | Korean? | License | Notes |
|---|---|---|---|
| **Qwen3-TTS** (2026) | Yes: zh, en, ja, ko, de, fr, ru, pt, es, it [S] | Apache-2.0 [S] | Dual-track streaming; "as low as 97 ms" end-to-end (vendor claim [S]); 5M+ hours of training data. |
| **CosyVoice 2 / Fun-CosyVoice 3** (3.0: December 2025 [F]) | Yes: 9 languages including Korean [F] | Apache-2.0 [F] | 0.5B params; "as low as 150 ms" bi-streaming latency (vendor claim) [F]. |
| **Chatterbox Multilingual** (Resemble AI) | Yes, ko among 23+ languages [F] | MIT [F] | 0.5B params; every output carries a Perth watermark [F]. No latency figures on the README [F]. |
| **MeloTTS** | Yes [F] | MIT [F] | CPU real-time capable (project claim) [F]. Older (2023-24); quality is modest **[I]**. |
| **Zonos v0.1** | Yes; 10 languages [S] | Apache-2.0 [S] | 1.6B params, GPU-heavy. A newer ZONOS2 (6M+ hours; Korean in "Tier 2") also appears [S]. |
| Kokoro-82M | **No Korean**: en, es, fr, hi, it, ja, pt, zh only [F] | Apache-2.0 [F] | Excluded despite one search summary claiming Korean. |
| XTTS-v2 | Not confirmed for Korean here | **CPML: non-commercial**; Coqui shut down in January 2024 [S] | Excluded for commercial use. |
| F5-TTS | Korean not confirmed | Code MIT, **weights CC-BY-NC** [S] | Excluded for commercial use. |
| MegaTTS3 | **No**: Chinese and English only [S] | not checked | Excluded. |

**[I]** First picks for a Korean NPC voice: Qwen3-TTS or CosyVoice 3 (both Apache-2.0, streaming), with MeloTTS as the lightweight CPU fallback. All need a GPU or CPU host outside Vercel. Pre-rendering fixed canonical answers into static audio files would remove the TTS latency problem, since the answers are fixed sentences. The paraphrased variants cannot be pre-rendered.

## 5. Higgsfield AI developer tooling (as of 2026-10-02)

Sources: GitHub org page and repos [F], skills README and install docs [F], CLI README [F], CLI issues #72/#75/#81 [F], search snippets [S]. docs.higgsfield.ai and npmjs.com were not retrievable (blocked / HTTP 403).

**CLI**
- Repo: github.com/higgsfield-ai/cli, MIT, 622 stars, updated 2026-09-18 [F]. Reporter in issue #72 used CLI v1.1.23 on 2026-08-25 [F].
- Install: `npm install -g @higgsfield/cli`, Homebrew (`brew install higgsfield-ai/tap/higgsfield`), `install.sh` via curl, or release downloads [F].
- Command groups [F]:
  - `generate` (create, cost, wait, get, list)
  - `workflow`
  - `model` (40+ models and parameter schemas)
  - `soul-id`
  - `website` (React on Cloudflare Workers)
  - `game` (e.g. `higgsfield game deploy ./game.zip --title ... --json`; the zip root needs `index.html` plus `logic.js` or `server.js`; publishing to the marketplace is a separate action)
  - `voices`
  - `auth` (login / logout / inspect token)
  - `account` (credit balance, transactions)
- Flags: `--wait`, `--json`, `--no-color` [F].
- Models listed [F]: image 23 (FLUX.2, GPT Image 2.5, Nano Banana Pro, Recraft V4.1...), video 22 (Kling v3.0, Seedance 2.5, Gemini Omni Flash, Veo 3.1...), 3D 5, audio 5.
- **npm package name `@higgsfield/cli`:** referenced in the README install line [F]; the npm page itself was not readable.

**Auth, and whether it works in a remote container**
- `higgsfield auth login` is OAuth with a browser step. The README summary says it uses short-lived tokens and needs periodic re-login [F]. My first fetch said "supports browser-based flows and device codes", while a second fetch of the same README said nothing about device codes. **Native device-code login: UNVERIFIED.**
- Third-party write-ups say the CLI opens a localhost loopback listener (PKCE), so on a headless box you must open the printed URL on another machine and replay the redirect (curl to the localhost callback) by hand [S: dev.to article, title seen in search]. Access tokens last about 24 h (86399 s) with `offline_access` refresh [S, aidevops issue #31175 about the Higgsfield MCP, not the CLI].
- **Env var for tokens / API key in the official CLI: UNVERIFIED.** One search summary cited `HIGGSFIELD_TOKEN`, `HIGGSFIELD_CLI_CONFIG` and `HIGGSFIELD_CLI_CACHE`, but it may have come from a third-party wrapper repo. The official MODELS.md has no such mention [F].
- The official Python SDK (separate product, `higgsfield-client`, Apache-2.0) authenticates with `HF_KEY="key:secret"` or `HF_API_KEY` + `HF_API_SECRET`, with keys from https://cloud.higgsfield.ai/ [F]. This is the realistic headless route for a container. Node SDK: `higgsfield-ai/higgsfield-js` [F].
- Skills install guide says the CLI install and `higgsfield auth login` are done by the agent instructions, and a 401 means "re-authenticate" [F].

**Network hosts seen** [F from issues #72/#75/#81]
- `clerk.higgsfield.ai` (OAuth issuer)
- `bridge.higgsfield.ai` (OAuth/MCP bridge; DCR registration is a stub per #75, and the issuer mismatch "expected bridge, received clerk" broke Codex login in #81, 2026-09-05)
- an "FNF API gateway" in front of the apps-marketplace service (#72)
- `cloud.higgsfield.ai` (API key console) [F]
- `fnf-device-auth.higgsfield.ai` is named as a second authorization server for device-code clients [S, search summary]
- the install script and releases come from raw.githubusercontent.com / github.com [F]
- exact API hostnames for generation: UNVERIFIED.
- Allowlist implication **[I]**: a locked-down container needs at least `*.higgsfield.ai`, GitHub, and npm.

**`higgsfield-ai/skills`** (MIT, 1.2k stars, updated 2026-09-26) [F]. Eight skills:
1. `higgsfield-generate`: multi-model image, video, 3D and audio, plus Marketing Studio and a Virality Predictor.
2. `higgsfield-soul-id`: trains a reusable face-faithful identity and returns reference IDs.
3. `higgsfield-product-photoshoot`
4. `higgsfield-brandkit`
5. `higgsfield-marketplace-cards`
6. `higgsfield-websites`
7. `higgsfield-video-explainer`
8. `higgsfield-youtube-thumbnail`

- Install: `npx skills add higgsfield-ai/skills`, `gh skill install higgsfield-ai/skills`, `/plugin marketplace add higgsfield-ai/skills`, or clone and run `./setup` [F].
- There is **no dedicated "game-generation" skill** in this repo. Game deployment exists only as the CLI `game` command [F].
- Character consistency: the Soul ID skill and CLI `soul-id` train on 20+ photos (up to 80) per vendor pages [S]. "Elements" (Reference Elements) are a reusable-asset concept in the web product [S]. Whether the CLI exposes Elements: UNVERIFIED.
- **[I]** Privacy: Soul ID needs real face photos; the project rules forbid real personal data, so it fits only synthetic faces.

**Pricing / credits** [S, third-party blogs; Higgsfield's own page not read; they disagree on exact tiers]
- Starter $19/mo for 270 credits, Plus $59/mo (about $47 annual) for 1,200 credits, Ultra $129/mo (about $99 annual) for 3,000 credits.
- No free plan as of 2026-09-08; the entry offer is a $3 one-time pass with 40 credits [S].
- Example costs: Kling 3.0 8 s 1080p about 20 credits; Seedance 2.5 8 s 1080p about 72 credits; Nano Banana Pro image about 2 credits [S].
- Auto-refill $1 = 20 credits, expiring after 90 days [S].
- Whether the CLI or API requires a paid plan: UNVERIFIED. The Python SDK uses a separate API console (cloud.higgsfield.ai).

## 6. Browser-local face signal

| Option | Findings |
|---|---|
| Shape Detection API `FaceDetector` | Not a shippable baseline. Face and text detection exist only behind the "Experimental Web Platform features" flag in Chrome/Edge; only barcode detection launched (Chrome 83) [S, Chrome developer docs via search]. Face Detection is listed "In Progress" [S]. It gives bounding boxes and coarse landmarks only, with no head pose. Safari Tech Preview flag mentioned [S]. Production support in 2026: treat as **unavailable** **[I]**. |
| MediaPipe Tasks Vision `FaceLandmarker` | Package `@mediapipe/tasks-vision` (Apache-2.0 repo [F]); unpacked size 19.6 MB [S]. The wasm file `vision_wasm_internal.wasm` is 10.64 MB; the no-SIMD variant is about 10 MB [S, jsDelivr listing and GitHub issues]. Model `face_landmarker.task` (float16) is loaded from `storage.googleapis.com/mediapipe-models/...` in the docs examples [S]; its size is UNVERIFIED (I recall a few MB, which is memory and unchecked). Options include `outputFacialTransformationMatrixes` and blendshapes [S]. **Self-hosting with no CDN:** supported: copy `node_modules/@mediapipe/tasks-vision/wasm/` and download the `.task` file locally, then point `FilesetResolver.forVisionTasks()` at your own path and `modelAssetPath` at your own URL [S]. Needs same-origin serving and a correct `application/wasm` MIME type. Repo issues #5961 and #6065 show the wasm bundling story is still awkward [S, titles]. |
| Head pose and nod | **[I]**: take the 4x4 facial transformation matrix per frame, extract pitch/yaw/roll, and detect a nod as a pitch oscillation (for example peak-to-peak of at least 8-10 degrees within 1.5 s, two or more reversals, low yaw change). A simpler variant tracks the nose-tip y-coordinate normalised by face height [S: tutorials and repos such as hanifabd/realtime-head-pose-detection]. Smooth with a low-pass filter and ignore frames with low detection confidence. |

**[I]** Project fit: the CLAUDE.md rules forbid external-origin requests and require the signal not to influence legal decisions. Self-hosted wasm and model files under `src/` satisfy the no-CDN rule. The result should only feed a non-judgment "behavior" display (consistent with the existing `behavior` bus event), never a ruling. It needs explicit camera consent, no frame upload, and a clear off switch.

## Unresolved items to confirm before building
1. Kanana-2 license text, HyperCLOVA X SEED Think license conditions (HF LICENSE files).
2. Korean-specific scores (KMMLU, HAE-RAE, KoBEST) for Gemma 4, Qwen3.5/3.6/3.8 and gpt-oss; none were found in this session.
3. Real TTFT on your chosen GPU and quantization, with your prompt.
4. Which hosted providers currently serve your chosen model (Groq retires models every few weeks).
5. Whether the official Higgsfield CLI has a non-browser login or token env var, using `higgsfield auth login --help` on a machine with the CLI.
6. Exact `face_landmarker.task` size, and MIME and COOP/COEP behavior when self-hosting under Vercel.

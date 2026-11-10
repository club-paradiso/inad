# NPC Intelligence Layer — security and privacy review (2026-11-10)

| Threat | Mitigation | Evidence |
|---|---|---|
| Model invents a fact | No dialogue generation; outputs are an id or closed enums; lead ids map to reviewed, content-free words | `npc-contract.js`, `npc-layer.test.js` (acting, all-persona sweep) |
| Model unlocks gated info | Menus contain disclosure-ready questions only (server: no-`requires` ∩ browser list; browser: `questionUnlocked`); the dispatcher still applies `questionUnlocked` | `npc-api.test.js` "narrow, never widen", E2E "closed question is ignored" |
| Hidden data in prompts | Contexts built only by `npc-context.js` from public fields; serialized request audited against every answer, clue, lookup, evidence note, note and resolution of the case, and against closed-question texts; audit failure = not sent | `auditOutbound`, `npc-api.test.js` "every case" |
| Guessed question recorded | Model ids and follow-ups are offered for confirmation; nothing recorded until accepted | E2E "recorded only after the examiner accepts" |
| Prompt injection (player text) | Text only inside a JSON data field; fixed system prompt; strict schema; local re-validation; unknown request keys rejected | `npc-api.test.js`, `npc-layer.test.js` injection test |
| Verdict change through dialogue | No dialogue path reaches `decide*`, `secondary`, procedures; evidence snapshot identical across paths | invariance tests |
| Demeanor used as evidence | Acting/profile/memory modules are not imported by legal, case, score, decision, debrief, statement-lock engines | static import test |
| Browser-chosen endpoint (SSRF) | Provider only from server env; http only for loopback/private hosts; credentials-in-URL refused | config tests |
| Key leakage | Server env only; responses carry `{ok, id/acting, reason-category}`; no provider/model names | availability + failure tests |
| Cost/abuse | 30/min per IP, 30/min per browser session id, 600/min per instance; 4 KB body; 240-char utterance; circuit breaker; client stops after 4 consecutive failures | rate-limit + breaker tests |
| Stale responses | Per-turn `AbortController`; turn generation check; `refineTurnActing` bound to turn seq and case | E2E "slow classification", unit "stale" |
| Licence misuse | EXAONE 4.x (1.2-NC) refused in production and without explicit research flag | config tests |

## Privacy
- No raw audio is recorded or sent (unchanged v10 speech rules). Voice transcripts fill the input box only.
- The typed/spoken utterance is sent to the operator's configured inference endpoint **only** when the
  deterministic engine could not place it and a provider is configured. It is not logged by INAD's server code.
  Operators must check their provider's own retention terms before enabling a hosted provider.
- Memory holds question ids and turn kinds only, per case, in memory; reset on new case, retry, reset and session
  end; never saved. The session id header is random per page load and not stored.
- All cases remain fictional; no real traveller data is processed.

## Residual risks
- A configured hosted provider sees player utterances (see above).
- Live model behaviour is unmeasured; injection resistance has only been tested against the boundary and mocks.
- The outbound audit is literal: a player who types a canonical answer verbatim gets no model help for that turn
  (fails closed by design).

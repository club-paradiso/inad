# INAD v10 — LIVE INTERVIEW · Product vision

Status: vertical slice implemented on `claude/relaxed-edison-iux1mv` (2026-10-02). Production rollout is gated (§6).

## 1. The one sentence
> "I am sitting across from a real traveler, asking my own questions, reading documents, detecting inconsistencies,
> deciding what to investigate next, and ultimately making a procedurally correct decision."

v9 was a detailed, accessible government simulator: the examiner clicked predefined questions until conditions turned
green. v10 keeps every rule, case and score of v9 and changes the *contact surface*: the examiner talks to a person.

## 2. First principle — AI is an actor, the engines are the truth
| Layer | Owns | Never does |
|---|---|---|
| `src/data/cases.js`, `legal-engine.js`, `case-engine.js` (frozen to v6.1 behaviour) | case facts, disclosure conditions (`requires`), clue triggers, verdict validation, scoring | — |
| Dialogue layer (`intent-engine`, `interview-engine`, `suggestion-engine`, `dialogue-guard`, personas) | which existing question was asked; how the passenger delivers the canonical answer; what to suggest next | create a fact, reveal a gated answer, change score or outcome |
| Optional model (`/api/npc`) | classify an utterance the deterministic engine could not place → one question id or null | see answers/clues/resolution, write dialogue, mutate state |
| Avatar, voice, captions | presentation | serve as evidence (tension, demeanour, voice are never verdict inputs) |

## 3. Experience pillars
1. **Talk, don't click.** Suggested questions, the full catalogue, typed text and push-to-talk are one conversation (one
   record, one context). Switching surfaces never resets anything and never changes the score (unit + E2E tested).
2. **People withhold until confronted.** A gated answer (e.g. job-hunting in Korea) is not given because the examiner
   guessed the right words; it is given when the case's own conditions are met (the occupation answer + the contact
   lookup). Before that, the passenger repeats what is already on record — the classic evasive answer.
3. **A person, not a portrait card.** The passenger sits in a dark booth window, breathes, blinks, lowers their eyes
   to think, hesitates on the hard questions, speaks with jaw motion and a subtitle — restrained, never performative.
4. **Every case ends with a debrief.** Why the decision followed from the evidence, what was found, what was missed and
   how it could have been reached, and which wrong attempts were corrected.
5. **Serious underneath.** An informed user still sees 제12조, 입국재심, 송환지시 and the source registry exactly as in v9.

## 4. Three visual layers (INSTITUTIONAL CINEMA)
- **Workstation** — v9 calm institutional software (light surfaces, semantic colour only for legal state).
- **Human interview** — the booth: the only dark surface, cinematic framing, subtitles; motion is observational.
- **Meta game** — start screen, debrief, records: editorial typography, case-file language.

## 5. What v10 deliberately did not build yet (§42 "do not overbuild")
Regenerating 105 travelers, rewriting campaigns, multiple AI providers, an avatar fleet, Quick Shift, Case of the Day,
progression unlocks, camera interaction. Each has a design note in `docs/v10-live-interview-spec.md` §9 and waits for
the slice to be validated by real players.

## 6. Gates
| Gate | State (2026-10-02) | Evidence |
|---|---|---|
| 0 Repository understanding | passed | audit in `docs/v10-qa.md` §1 |
| 1 Product specification | passed (internal) | this file, `docs/v10-live-interview-spec.md` |
| 2 Vertical slice | **passed with known gaps** | `tests/e2e/live-interview.spec.js`, screenshots in PR |
| 3 Art direction | composition chosen (A + C's record + B's subtitle); **generated assets blocked** (Higgsfield host denied by the environment network policy) | `docs/v10-art-direction.md`, `design/v10/` |
| 4 AI reliability | deterministic layer passes; **model benchmark not run** (model hosts unreachable from this environment) | `docs/v10-ai-architecture.md` §6, `npm run eval:dialogue` |
| 5 Accessibility / fallback | passed for no-voice, no-camera, no-animation, no-model | E2E fallback tests |
| 6 Performance | passed against the budgets in `docs/v10-qa.md` §5 | `scripts/measure-performance.js` |
| 7 Regression | passed | lint, 122 unit, 10 integration, 92 E2E |
| 8 Production readiness | **not yet** | needs generated pilot assets, a model benchmark, a human playtest round |

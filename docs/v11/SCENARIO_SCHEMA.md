# v11 international scenario contract

Authored cases live in `src/data/atlas/ca.js`, `gb.js`, `nz.js` (`export const CASES = [...]`).
They are validated by `src/js/engines/atlas-scenario-schema.js` (`validateScenarioDefinition`,
`solveScenario`), normalised and deep-frozen by `engines/atlas-library.js`, and loaded as a
separate chunk per country. Run `node scripts/validate-atlas.js [CA|GB|NZ]` after any change.
`tests/unit/atlas-library.test.js` validates every case and plays each one through the engine.

Every case is a **fictional training exercise**. Outcomes are `SIMULATION_RULE` feedback, not a
legal determination, visa decision, refusal, detention or removal. See `docs/v11/PROCEDURAL_SOURCES.md`.

## Shape

| Field | Rule |
|---|---|
| `id` | `SIM-<CC>-NN`, unique in the library. Every inner id should start with the case id. |
| `countryId` | `CA` · `GB` · `NZ` |
| `personId`, `name` | Fictional. Names must not belong to real public figures. |
| `difficulty` | `intro` · `standard` · `advanced` (shown in the queue; the queue itself follows case number) |
| `category` | `identity` `document` `purpose` `accommodation` `requirements` `record` `third-party` `statement` `missing` `referral` `false-positive` `complex` |
| `title`, `brief`, `opening`, `debrief` | `{ ko, en }`. `brief` is the visible intake summary; `opening` is the first line after the call. |
| `profile` | ≥2 `{ label, value }` rows visible at intake (purpose, stated length of stay, submitted items). |
| `documents` | 2–5 `{ id, title, pages: [L…] }` (1–4 pages). Document 1 backs the identity check; document 2 the evidence/handover checks. |
| `records` | 1–5 `{ id, title, detail, documentId }` — results returned by the system search. |
| `facts` | ≥3 comparable facts. `sourceType`: `document` (`sourceId` = document, optional `page`), `record` (`sourceId` = record, visible once searched), `statement` (`questionIds` — visible only after one of those questions is asked; the answer text must contain the fact), `request` (`sourceId` = `requestId`, visible only after the request is issued). |
| `questions` | 3–10 `{ id, q, answer }`. A question unlocked by a comparison is gated; at least one must be open. Answers state only what the person would say; never volunteer facts the case marks as discoverable later. |
| `comparisons` | ≥2 `{ id, facts: [a, b], type, findingId, title, explanation, unlocks? }`. `type`: `MATCH` `CONFLICT` `MISSING` `UNVERIFIED`. `unlocks: { questions?, requests? }`. Each pair appears once. |
| `requests` | Optional `{ id, title, result }`. Must be unlocked by a comparison. |
| `expectedOutcome` | `complete` (review closes, nothing outstanding) · `evidence` (specific missing evidence must be requested) · `review` (unresolved conflict referred for further review) |
| `outcomeFeedback` | `{ complete, evidence, review }` — why each choice is or is not supported. |
| `assessment` | `{ issue: [findingId…] (any), distinguish?: [findingId…], resolve: { findings: [all], questions: [any], requests: [all] }, feedback: { issueHit, issueMiss, resolveHit, resolveMiss } }` |
| `sources` | Register ids from `docs/atlas/LEGAL_SOURCE_REGISTER.md` / `docs/v11/PROCEDURAL_SOURCES.md`. |

The validator rejects unreachable findings/questions/requests, dangling references, duplicated
pairs and comparison text that treats nervousness, accent, ethnicity or religion as evidence.

## Scoring (engine, shared by every country)

Investigation (0–100): issue identified 35 (10 if missed) · resolution established 35 (5) ·
all documents reviewed 20 (5) · written rationale 10. When an outcome has been chosen and it is
not the expected one, the score is capped at 45 and the rating becomes `incomplete`, with the
authored `outcomeFeedback` shown. Requests that the case does not need cost 10 each. Order of
actions never changes the score.

## Exemplar

`SIM-CA-01` in `src/data/atlas/ca.js` is the reference case (legacy identifiers preserved).

# PR #23 — Country-specific evidence cross-checks (first playable slice)

## Gameplay improvement
All nine CA/GB/NZ synthetic cases gain a third **case-specific** follow-up question, alongside the two existing generic interview questions. The answer is authored exclusively from the two source records already visible in that case (document dates, application IDs, receipt identifiers or missing evidence). Interview buttons, transcript, save, reload and debrief use the existing ATLAS interaction flow.

The assessment screen now shows whether the extra source-comparison question was asked. This changes the player's available investigative choices without inventing immigration law or government data.

## Backward compatibility
- No new fields in the overseas save schema, no changes to save keys.
- Prior cases asking only the original question remain valid.
- The additional question is optional and **not** retroactively required for completed cases.
- All outcomes remain `SIMULATION_RULE`. Evidence questions are about synthetic records, not eligibility decisions.
- No changes to Korean gameplay or its frozen law/case data.

## Acceptance
- Each of nine cases has exactly one `crosscheck` question with Korean and English prompts/answers tied to its visible source data.
- The question may be asked and is included in the transcript, persists after reload, and is reflected in the assessment view.
- Legacy progress and historical ATLAS completed cases remain loadable.
- Core CI including 129+ E2E flows, Firefox/WebKit gates from PR #22 and generated root mirror validation must pass.

## Further gameplay milestones outside this PR
- More than two source records per case and branching evidence chains.
- A new non-retroactive scenario schema for mandatory checks and richer debrief evaluation.
- Country-specific procedural sequences validated against official date-versioned guidance.
- Optional free-text, AI-backed interviewer with strict deterministic facts boundary.

**This PR is stacked on PR #22.** Merge and validate the stability fix first; then rebase/retarget this PR onto main. No autonomous production deployment.

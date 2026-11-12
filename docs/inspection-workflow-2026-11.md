# Inspection workflow — 2026-11-12

## Product decision

The core action is listening, cross-checking a relevant record, and making a reasoned decision. A passenger with consistent evidence must be as playable as a case with a discrepancy. The UI must not tell players to manufacture contradictions.

- Keep: the four existing workspace zones, the Korean/English UI, authored cases, disclosure boundaries, independent legal procedures, keyboard shortcuts and touch confirmation.
- Change: lookup controls use everyday names and explicitly distinguish a new query from opening an existing result. Existing results remain available without adding simulated work time or a repeated-query penalty.
- Remove: clue-dependent beginner progression, imperative contradiction-hunting copy, severity-as-verdict lookup badges, artificial precision in the biometric summary, and facial reactions triggered solely by an officer comparing records.
- Defer: the six regular-duty presets sit in a disclosure below the short-play choices. All settings and their state are retained. First interview explicitly selects guided mode even after a previously saved expert session.

## Workbench behavior

`engines/inspection-workflow.js` contains presentation-only labels and navigation destinations. It must not read hidden resolutions, required verdict actions, nationality, undiscovered clues or case-wide evidence. It does not change the legal engine, scoring engine or save schema.

A pending-fact link opens the correct workspace and focuses a tool. It never asks a question, runs a query or marks a document reviewed. Reading an existing lookup uses the same result node, with keyboard focus and a visible selection marker. New query results retain the incremental live-region rendering contract.

The original legal/status data remains unchanged. "중요 확인" labels the record's importance, not an automatic refusal. A displayed match is not a legal verdict. A guided step is navigation, not certification that the case is ready to decide.

## Visual contract

Retain semantic tokens, system fonts, existing portraits and four-zone composition. White panels, slate chrome, blue actions, 44px lookup targets, three lookup columns with explicit wrapping, stacked result title/body. Pending-fact navigation is a text action, with no new cards, icons or imagery. No token names or values changed.

Visible changes: first-interview description, daily-case description, collapsed posting summary, plain lookup names, saved-result status, neutral record labels, pending-fact links, neutral coaching and simulation-only biometric caption. Existing generated game artwork is reused.

## Validation

Run `npm run qa` and the new `inspection-workbench.spec.js`. That suite verifies free result reopening, navigation without state mutation, 44px controls and overflow, and captures 1440/1024/768/390 states. CI exposes those captures as `inspection-workbench-evidence`.

This workspace's cloud browser cannot connect to the local server; its local Chromium also cannot start (socket permission error). Local unit/build/integrity results do not constitute visual sign-off. Screenshots and interaction results must be reviewed from CI before deployment. Figma synchronization is pending; the unchanged token contract remains in `tokens.css`.

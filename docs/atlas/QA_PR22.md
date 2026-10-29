# PR #22 — ATLAS release stability gate

## Objective
Prevent a Chromium-only signoff on the four-country release. This PR changes **test infrastructure only**; it does not claim to fix previously untested runtime issues.

## Automated acceptance criteria
- Preserve the existing Chromium, source-integrity, frozen v6.1 and save compatibility checks.
- Run the existing full three-case browser exercise for CA, GB, and NZ in Firefox and WebKit.
- Run the case draft reload/country round-trip, Korean mid-session return, and 390px responsive navigation checks in both engines.
- Produce an explicit red CI check on any failure. Do not ignore flaky failures or replace assertions with sleeps.

## Manual production QA checklist (not auto-certified)
- Verify the production deployment is READY and that the deployment commit equals the merged release.
- On a physical iPhone with Safari: Korean session, 4-country selector, task navigation, keyboard focus, save/export/import and app reopening.
- On desktop Safari/Firefox: country switch and return, evidence review, debrief, accessibility settings and no console errors.
- Check screen readers (VoiceOver and NVDA) for dialog focus return and status announcements.
- Verify browser storage full/disabled failure messages and export including unsaved changes.
- Open two same-origin tabs on separate international cases and assess concurrent-save conflicts. **Known risk: the current implementation lacks a multi-tab merge/conflict guard.** Do not certify this until a separate fix and regression test pass.

## Gate into PR #23
Proceed with gameplay expansion only when all PR #22 automated checks pass and any discovered release-blocking bug is resolved or explicitly isolated. Keep actual immigration law decisions disabled in foreign simulations.

## Scope boundaries
No changes to Korean law/case engines, v6.1 artifact, design tokens, or generated release HTML. Safari/iOS physical-device and screen-reader manual audits remain open even if WebKit-on-Linux CI passes.

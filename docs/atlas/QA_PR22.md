# PR #22 — ATLAS release stability gate

## Objective
Prevent a Chromium-only signoff on the four-country release. This PR adds a cross-browser release gate **and fixes a confirmed lost-update hazard** in overseas practice storage. The Korean legal/case engines remain untouched.

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
- Two same-origin tabs: a stale tab now detects newer save bytes, blocks its write, announces the conflict and preserves its unsaved draft for an explicit recovery export. Both unit and E2E regression tests exercise this guard. **Limitation:** localStorage is not an atomic compare-and-swap transaction; a perfectly simultaneous race and automatic multi-tab merge remain unsupported.

## Production deployment sanity
The production deployment `dpl_2Ck6NXshCUP95p898NrWVNXpQK8m` is READY and its Git source SHA `709a78239a55cfd04ddca8e4ecaacdb672a800a2` matches the PR #21 merge commit. This is a deployment-status check, **not** a manual browser pass.

## Gate into PR #23
Proceed with gameplay expansion only when all PR #22 automated checks pass and any discovered release-blocking bug is resolved or explicitly isolated. Keep actual immigration law decisions disabled in foreign simulations.

## Scope boundaries
No changes to Korean law/case engines, v6.1 artifact, design tokens, or generated release HTML. Safari/iOS physical-device and screen-reader manual audits remain open even if WebKit-on-Linux CI passes.

# INAD: Article 12 — Source Recovery Plan

Status: RESOLVED (2026-09-11) — see "Recovery result" below
Date established: 2026-09-11
Tracking issue: #1
Production: https://inad-gray.vercel.app

## Why this exists

The production deployment currently cannot be reproduced from this repository. Do not begin a redesign, framework migration, or substantial feature build until the exact production source has been recovered and committed.

## Recovery order

1. Find the exact local/workspace directory that produced the current Vercel deployment.
2. Create an untouched backup or Git branch before editing anything.
3. Inventory every file, dependency, environment variable name, build command, and deployment configuration.
4. Run the recovered application locally and compare its routes, visible text, interactions, responsive behavior, and static assets with production.
5. Commit the recovered source to a recovery branch without opportunistic refactoring.
6. Make a clean clone in a fresh directory and prove that install + build succeeds from documented commands.
7. Add deterministic dependency locking and baseline quality gates appropriate to the detected stack.
8. Connect Vercel production and preview deployments to Git commits.
9. Only after parity is established, start product/UI/architecture improvements in separate PRs.

## Minimum repository baseline

The recovered project should document or provide, as applicable:

- application source
- package/dependency manifest
- dependency lockfile
- `.gitignore`
- `.env.example` containing variable names only, never secrets
- local development command
- production build command
- lint command
- type-check command if the stack supports it
- tests for critical decision logic and navigation
- deployment configuration only when required
- concise architecture notes

## Recovery acceptance criteria

- A clean clone builds successfully without relying on undocumented local files.
- The recovered build matches the current production behavior closely enough to establish provenance.
- Every future production deployment is attributable to a Git commit SHA.
- Pull requests can produce isolated preview deployments.
- Secrets and personal/sensitive data are not committed.
- CI rejects a change when the baseline checks fail.

## Product rules after recovery

Article 12 should be treated as a decision-support interface, not as an authoritative legal determination unless its legal rules and data sources are explicitly validated and kept current. Separate legal/rule data from presentation code so corrections do not require rewriting the UI.

Prefer small, auditable changes. Preserve a clear distinction between factual rule content, decision logic, translations, and interface copy. Add sources/version dates wherever a rule can change over time.

## Do not do yet

- Do not rewrite the app from screenshots while original source may still exist.
- Do not switch frameworks merely to make the repository look modern.
- Do not add AI-generated legal conclusions without deterministic rule validation and clear provenance.
- Do not point production at a recovery branch until clean-build and parity checks pass.

## Recovery result (2026-09-11)

- No local working copy existed (searched home, Codex Desktop project folders, Codex session history, iCloud/Google Drive mounts). The app was authored and deployed from a ChatGPT/Codex cloud session, so the deployed single-file build is the complete source.
- `legacy/v6.1/INAD_Article12_v6_1_KR.html` is the byte-exact production file (sha256 `53bee5c1a4fe72a78f5e42eca1f3de0e11623e5d2ded752e995116c742a3a812`), an unminified vanilla HTML/CSS/JS app with 105 inline portraits and zero external references.
- Parity was proven with a 19-spec Playwright suite that passes against the recovered file and against the rebuilt v7.0 artifact.
- Vercel production is still not linked to this repository; root `index.html` is the generated release mirror to deploy.

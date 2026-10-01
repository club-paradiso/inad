# INAD: 제12조 v9.0 — Stability & Product Quality Overhaul

Release 9.0.0 · build 2026.10.01 · legal baseline 2026-09-07 (unchanged) · data v6.1 (unchanged) · save bundle schema 1 (unchanged)

## Version numbering

| Release | What it was | Version metadata at the time |
|---|---|---|
| v6.1 | original production build, recovered and frozen in `legacy/v6.1/` | 6.1 |
| v7.0 · v7.1 · v7.2 | modular rebuild · legal-source audit · workstation console UX | 7.0 → 7.2.0 |
| v8 (PR #10) | adaptive workstation (one DOM, phone/tablet/desktop) | **not bumped**: shipped to production as "7.2" while `docs/*-v8.md` called it v8 |
| v9.0 (this release) | stability & product-quality overhaul on top of the v8 workstation | 9.0.0 everywhere |

v9.0 skips the never-labelled v8 number because the repository's documentation already uses "v8" for the
adaptive workstation. From v9.0 on, `tests/integration/release-metadata.test.js` keeps `package.json`, the
lockfile, `RELEASE` (UI label, diagnostics, save-bundle metadata), the pre-boot HTML placeholders, the build
banner, the README and this file in step.

## What v9.0 contains

Draft — completed in the release pull request. See `docs/qa-v9.md` for verification evidence.

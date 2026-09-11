# INAD Article 12 source provenance

Status: IMPORTED — canonical artifact committed byte-exact as `legacy/v6.1/INAD_Article12_v6_1_KR.html` (also the former root `index.html` of the recovery merge). Root `index.html` is now the generated v7 release mirror built from `src/` (`npm run build`); CI verifies both the legacy SHA-256 and the generated entry point.

## Canonical recovered artifact

- Filename: `INAD_Article12_v6_1_KR.html`
- Size: `1,514,881` bytes
- SHA-256: `53bee5c1a4fe72a78f5e42eca1f3de0e11623e5d2ded752e995116c742a3a812`
- Release: v6.1
- Legal baseline encoded by the release notes: 2026-09-07
- Runtime model: self-contained single-file HTML, no external HTTP/CDN assets

The recovered artifact was found together with `RELEASE_NOTES_v6.1.md` and `QA_REPORT_v6.1.md`. Those documents are committed under `docs/` on this recovery branch and define the behavioral/integrity baseline for source-parity testing.

## Deployment incident discovered during recovery

The production project is Git-linked to `club-paradiso/inad`. The documentation-only merge commit `6eef9b88cb919d729a2bbff368ab58cd76a3fc45` was therefore deployed to production even though it contained no application entry point. The production alias consequently resolves to a 404 build.

The last pre-incident production deployment remains retained by Vercel and must not be deleted until source parity has been demonstrated.

## Import rule

Do not replace the recovered artifact with a screenshot reconstruction, framework rewrite, or older Article 12 version. The repository import must preserve the canonical artifact bytes above; after import, verify its SHA-256 before any refactor.

## Acceptance sequence

1. Commit the canonical v6.1 HTML to this branch as the application entry point.
2. Verify SHA-256 against the value above.
3. Run the v6.1 QA/integrity baseline.
4. Produce a Vercel preview from this Git branch.
5. Compare preview behavior with the retained pre-incident production deployment.
6. Merge only after parity is established.
7. Verify the production alias returns the Article 12 app and the deployment contains the merge commit SHA.

## Resolution (2026-09-11, v7.1)

- `legacy/v6.1/INAD_Article12_v6_1_KR.html` — canonical bytes (SHA-256 above), frozen; `INAD_TARGET=legacy npm run test:e2e` runs the 19-spec parity suite against it.
- `docs/RELEASE_NOTES_v6.1.md`, `docs/QA_REPORT_v6.1.md` — the v6.1 baseline documents.
- `src/` — modular v7 source of truth; `dist/index.html` and root `index.html` are generated (CI fails if the root mirror is stale).

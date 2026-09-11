# INAD: Article 12

Production: https://inad-gray.vercel.app

## Repository status

Source recovery is in progress. The current production deployment is not yet reproducible from `main`.

Track recovery in issue #1 and see `docs/RECOVERY.md` for the required order of operations and acceptance criteria.

## Development rule

Until source parity is established, do not deploy ad-hoc replacement builds or perform a speculative rewrite. Recover the actual production source first, verify a clean build, then reconnect Vercel deployments to Git commits.

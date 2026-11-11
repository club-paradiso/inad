# Vercel → Cloudflare Workers migration runbook

Status: code and local verification done on branch `claude/gallant-rubin-fso8mm`; **cutover (dashboard steps below) not done**.

## What changed in the repo
| File | Role |
|---|---|
| `wrangler.jsonc` | Worker `inad`: static assets from `dist/`, Worker runs only for `/api/*`, `nodejs_compat` |
| `worker/index.js`, `worker/node-compat.js` | Routes `/api/airport-load` and `/api/npc` to the unchanged `api/*.js` handlers via a `Request → Response` adapter |
| `deploy/cloudflare/_headers` → `dist/_headers` | CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, cache rules (mirror of `vercel.json`) |
| `api/npc.js` | client IP now prefers `cf-connecting-ip` (set by Cloudflare, not client-controllable) |
| `tests/unit/worker.test.js`, `dist-integrity.test.js` | adapter, same-origin, body cap, rate-limit and header-parity regression tests |

`vercel.json` and the `api/` functions are intentionally kept so Vercel remains a working rollback.

## Verified locally (wrangler dev / workerd, 2026-11-11)
Headers on `/`, hashed bundle and portraits; `/api/airport-load` (400, HEAD, 405, static fallback, secret reaches `process.env`);
`/api/npc` (GET availability, 415, 403 cross-origin incl. spoofed `x-forwarded-host`, 400 bad JSON, 413, 404 unknown `/api/*`).
**Not verified (needs the real Cloudflare account):** real upstream call to the Korean public-data API from Cloudflare's network,
Cache API behaviour on a custom domain, Workers Builds, DNS.

## Cutover checklist (dashboard)
1. Workers & Pages → Create → Import a repository → `club-paradiso/inad`. Build command `npm run build`, deploy command `npx wrangler deploy`, production branch `main`.
2. Secrets (Settings → Variables and Secrets): `DATA_GO_KR_SERVICE_KEY` (required for live airport load). Only if the optional NPC inference layer is used: `INAD_LLM_BASE_URL`, `INAD_LLM_MODEL`, `INAD_LLM_API_KEY`, `INAD_NPC_PROVIDER` (see `api/_npc/config.js`). Never commit them.
3. Open the `*.workers.dev` URL and run `INAD_TARGET=url INAD_BASE_URL=<url> npm run test:e2e` (19/19 expected as on Vercel).
4. **Check `/api/airport-load?airport=ICN` returns `"live":true`** with the real key. If the public-data API rejects or is slow from Cloudflare IPs, set Smart Placement (`"placement": {"mode": "smart"}`) or keep the static-preset fallback; the game continues either way.
5. Rate limiting: the NPC limiter is per-isolate memory (best effort). If the inference layer is enabled, add a Cloudflare WAF rate-limiting rule on `/api/npc`.
6. Attach the custom domain (if any), lower DNS TTL beforehand, switch, watch Workers observability for 24 h.
7. After a stable week: disconnect the Vercel Git integration, then delete `vercel.json` and update `tests/integration/dist-integrity.test.js` (remove the Vercel-only test; keep the `_headers` one).

## Rollback
Point DNS back to the Vercel deployment (still Git-linked until step 7).

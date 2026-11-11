// Cloudflare Workers entry. Static files in dist/ are served by the assets binding (wrangler.jsonc); only `/api/*`
// reaches this Worker (assets.run_worker_first), so page and asset requests never invoke or bill the Worker.
//
// Endpoints (same contract as the former Vercel functions in api/):
//   /api/airport-load — public airport-load summary proxy (key: DATA_GO_KR_SERVICE_KEY secret)
//   /api/npc          — optional NPC inference boundary (provider chosen only by server env, see api/_npc/config.js)
import airportLoad from '../api/airport-load.js';
import npc, { MAX_BODY as NPC_MAX_BODY } from '../api/npc.js';
import { invokeNodeHandler, jsonResponse } from './node-compat.js';

// airport-load reads process.env directly. nodejs_compat populates it from bindings; mirror string bindings anyway
// so a missing compat flag cannot silently turn the live feed into the static preset.
function exposeEnv(env) {
  try {
    if (typeof process === 'undefined' || !process.env) return;
    for (const [k, v] of Object.entries(env || {})) if (typeof v === 'string' && !(k in process.env)) process.env[k] = v;
  } catch { /* read-only env: the handler falls back to its static preset */ }
}

async function cachedGet(request, ctx, produce) {
  const cache = typeof caches !== 'undefined' ? caches.default : null; // only effective on a custom domain
  if (!cache || request.method !== 'GET') return produce();
  try { const hit = await cache.match(request); if (hit) return hit; } catch { /* fall through */ }
  const response = await produce();
  if (response.status === 200 && /s-maxage=\d+/.test(response.headers.get('cache-control') || '')) ctx.waitUntil(cache.put(request, response.clone()).catch(() => {}));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/airport-load') {
      exposeEnv(env);
      return cachedGet(request, ctx, () => invokeNodeHandler(airportLoad, request));
    }
    if (pathname === '/api/npc') return invokeNodeHandler(npc, request, { maxBody: NPC_MAX_BODY, args: [{ env }] });
    if (pathname.startsWith('/api/')) return jsonResponse(404, { error: 'not-found' });
    return env.ASSETS.fetch(request);
  }
};

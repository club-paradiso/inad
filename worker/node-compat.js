// Adapter: runs the Node-style handlers in api/ (req, res) on the Workers (Request → Response) runtime.
// The handlers stay the single source of truth for behaviour (validation, rate limits, caching, fallbacks); this file
// only translates the transport. It is plain ESM with no Workers-only imports so node:test can exercise it.
//
// Trust boundary: the handler's same-origin check compares `Origin` with `x-forwarded-host || host`. Here both are
// derived from the request URL (which the platform resolved), never from client-supplied forwarding headers.

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
export const jsonResponse = (status, payload) => new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });

async function readBodyText(request, limit) {
  if (!request.body) return { text: '' };
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return { tooLarge: true };
  const reader = request.body.getReader(); const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { try { await reader.cancel(); } catch { /* ignore */ } return { tooLarge: true }; }
    chunks.push(value);
  }
  const all = new Uint8Array(size); let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.byteLength; }
  return { text: new TextDecoder().decode(all) };
}

export async function invokeNodeHandler(handler, request, { maxBody = 64 * 1024, args = [] } = {}) {
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((value, key) => { headers[key] = value; });
  headers.host = url.host; headers['x-forwarded-host'] = url.host;

  const method = request.method.toUpperCase();
  const req = { method, url: url.pathname + url.search, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readBodyText(request, maxBody);
    if (body.tooLarge) return jsonResponse(413, { error: 'too-large' });
    req.body = body.text;
  }

  const outHeaders = new Headers();
  let finish; const done = new Promise((resolve) => { finish = resolve; });
  const res = {
    statusCode: 200, headersSent: false,
    setHeader(name, value) { outHeaders.set(name, String(value)); },
    getHeader(name) { return outHeaders.get(name) ?? undefined; },
    writeHead(status, h) { this.statusCode = status; for (const [k, v] of Object.entries(h || {})) outHeaders.set(k, String(v)); this.headersSent = true; return this; },
    end(chunk) { this.headersSent = true; finish(chunk); }
  };
  await handler(req, res, ...args);
  const chunk = await Promise.race([done, new Promise((resolve) => setTimeout(() => resolve(Symbol.for('no-end')), 0))]);
  if (chunk === Symbol.for('no-end')) return jsonResponse(500, { error: 'handler-did-not-respond' });
  const nullBody = method === 'HEAD' || chunk === undefined || res.statusCode === 204 || res.statusCode === 304;
  return new Response(nullBody ? null : chunk, { status: res.statusCode, headers: outHeaders });
}

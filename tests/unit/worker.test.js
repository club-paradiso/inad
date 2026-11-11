// Cloudflare Workers adapter (worker/). The api/ handlers keep all behaviour; these tests pin that the transport
// translation neither weakens the security boundary (same-origin, body cap, per-client rate limit) nor changes
// the HTTP contract of the two endpoints.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../worker/index.js';
import { invokeNodeHandler } from '../../worker/node-compat.js';
import npc, { resetNpcState, MAX_BODY, RATE } from '../../api/npc.js';
import airportLoad from '../../api/airport-load.js';

const ORIGIN = 'https://inad.test';
const ENV = { INAD_LLM_BASE_URL: 'https://llm.test/v1', INAD_LLM_MODEL: 'test-model' };
const BODY = { task: 'classify', caseId: 'ICN-S2-005', utterance: '방문 목적?' };
const post = (body, headers = {}) => new Request(`${ORIGIN}/api/npc`, { method: 'POST', headers: { 'content-type': 'application/json', origin: ORIGIN, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const failingProvider = async () => ({ ok: false, status: 503, text: async () => '', json: async () => ({}) });
const npcFetch = (request, extra = {}) => invokeNodeHandler(npc, request, { maxBody: MAX_BODY, args: [{ env: ENV, fetchImpl: failingProvider, ...extra }] });

beforeEach(() => resetNpcState());

test('airport-load keeps its HTTP contract through the adapter', async () => {
  const bad = await invokeNodeHandler(airportLoad, new Request(`${ORIGIN}/api/airport-load?airport=XXX`));
  assert.equal(bad.status, 400); assert.equal((await bad.json()).error, 'unsupported-airport');
  const head = await invokeNodeHandler(airportLoad, new Request(`${ORIGIN}/api/airport-load?airport=ICN`, { method: 'HEAD' }));
  assert.equal(head.status, 200); assert.equal(await head.text(), ''); assert.match(head.headers.get('cache-control'), /s-maxage/);
  const wrong = await invokeNodeHandler(airportLoad, new Request(`${ORIGIN}/api/airport-load?airport=ICN`, { method: 'POST' }));
  assert.equal(wrong.status, 405); assert.equal(wrong.headers.get('allow'), 'GET, HEAD');
});

test('npc: same-origin is derived from the request URL, never from client forwarding headers', async () => {
  assert.equal((await npcFetch(post(BODY))).status, 200, 'same origin passes the origin check');
  assert.equal((await npcFetch(post(BODY, { origin: 'https://evil.test' }))).status, 403);
  assert.equal((await npcFetch(post(BODY, { origin: 'https://evil.test', 'x-forwarded-host': 'evil.test', host: 'evil.test' }))).status, 403, 'spoofed forwarding headers do not move the trust boundary');
  const noOrigin = new Request(`${ORIGIN}/api/npc`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(BODY) });
  assert.equal((await npcFetch(noOrigin)).status, 403, 'no Origin header');
});

test('npc: body cap, content type and JSON errors match the Node handler', async () => {
  assert.equal((await npcFetch(post('x'.repeat(MAX_BODY + 1)))).status, 413);
  assert.equal((await npcFetch(post('{nope'))).status, 400);
  const text = new Request(`${ORIGIN}/api/npc`, { method: 'POST', headers: { 'content-type': 'text/plain', origin: ORIGIN }, body: '{}' });
  assert.equal((await npcFetch(text)).status, 415);
  const get = await invokeNodeHandler(npc, new Request(`${ORIGIN}/api/npc`), { args: [{ env: {} }] });
  assert.deepEqual(await get.json(), { available: false, tasks: [] });
  assert.equal(get.headers.get('cache-control'), 'no-store');
});

test('npc: the rate limit keys on cf-connecting-ip and cannot be dodged with client-sent vercel/real-ip headers', async () => {
  for (let i = 0; i < RATE.perClient; i++) {
    const r = await npcFetch(post(BODY, { 'cf-connecting-ip': '203.0.113.7', 'x-vercel-forwarded-for': `198.51.100.${i}`, 'x-real-ip': `192.0.2.${i}` }));
    assert.notEqual(r.status, 429, `request ${i + 1} is inside the window`);
  }
  assert.equal((await npcFetch(post(BODY, { 'cf-connecting-ip': '203.0.113.7', 'x-vercel-forwarded-for': '198.51.100.250' }))).status, 429, 'varying vercel/real-ip headers does not reset the bucket');
  assert.notEqual((await npcFetch(post(BODY, { 'cf-connecting-ip': '203.0.113.8' }))).status, 429, 'another client is unaffected');
});

test('worker routing: only /api/* is handled; everything else is delegated to the assets binding', async () => {
  const seen = []; const env = { ASSETS: { fetch: async (r) => { seen.push(new URL(r.url).pathname); return new Response('asset'); } } };
  const ctx = { waitUntil() {} };
  assert.equal((await worker.fetch(new Request(`${ORIGIN}/api/zzz`), env, ctx)).status, 404);
  assert.equal((await worker.fetch(new Request(`${ORIGIN}/api/airport-load?airport=XXX`), env, ctx)).status, 400);
  assert.equal(await (await worker.fetch(new Request(`${ORIGIN}/`), env, ctx)).text(), 'asset');
  assert.deepEqual(seen, ['/']);
});

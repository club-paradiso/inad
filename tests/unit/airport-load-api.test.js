// /api/airport-load (Vercel function) and its browser client under degraded upstream conditions.
// Every failure must answer the same JSON shape with live:false + a reason, so the game falls back to the
// static airport preset; nothing from upstream may throw past the handler or reach legal state.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { resetAirportLoadCache, requestedAirport, parseUpstreamBody, hhmmMinutes, inUpcomingWindow, summarize, incheonT2Arrivals, kacArrivals, itemsOf } from '../../api/airport-load.js';
import { normalizeAirportSnapshot, failureReason } from '../../src/js/services/airport-live.js';
import { calculateLiveLoadFactor, capLiveLoadFactor } from '../../src/js/engines/airport-load-balance.js';

const realFetch = globalThis.fetch;
const KEY_VARS = ['DATA_GO_KR_SERVICE_KEY', 'AIRPORT_DATA_API_KEY', 'PUBLIC_DATA_API_KEY'];
let savedEnv = {};

function mockRes() {
  return { statusCode: 0, headers: {}, body: undefined, ended: false, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; this.ended = true; } };
}
async function call(url, { method = 'GET' } = {}) {
  const res = mockRes();
  await handler({ method, url, headers: {} }, res);
  return { res, json: res.body ? JSON.parse(res.body) : null };
}
const ok = (body) => ({ ok: true, status: 200, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });
const pad = (n) => String(n).padStart(2, '0');
function kstHHMM(offsetMin) { const d = new Date(Date.now() + offsetMin * 60000); const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d); return p.find((x) => x.type === 'hour').value.replace('24', '00') + p.find((x) => x.type === 'minute').value; }

beforeEach(() => {
  resetAirportLoadCache();
  savedEnv = Object.fromEntries(KEY_VARS.map((k) => [k, process.env[k]]));
  KEY_VARS.forEach((k) => { delete process.env[k]; });
});
afterEach(() => {
  globalThis.fetch = realFetch;
  KEY_VARS.forEach((k) => { if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k]; });
});

test('method and airport validation', async () => {
  let r = await call('/api/airport-load?airport=ICN', { method: 'POST' });
  assert.equal(r.res.statusCode, 405);
  assert.equal(r.res.headers.allow, 'GET, HEAD');
  r = await call('/api/airport-load?airport=XXX');
  assert.equal(r.res.statusCode, 400);
  assert.equal(r.json.error, 'unsupported-airport');
  r = await call('/api/airport-load');
  assert.equal(r.res.statusCode, 400);
  r = await call('/api/airport-load?airport=icn%20');
  assert.equal(r.res.statusCode, 200, 'lower case and whitespace are normalised');
  assert.equal(r.json.airport, 'ICN');
  r = await call('/api/airport-load?airport=GMP', { method: 'HEAD' });
  assert.equal(r.res.statusCode, 200);
  assert.equal(r.res.body, undefined, 'HEAD has no body');
});

test('reads ?airport= from the request URL, not the deprecated req.query parser', () => {
  let touched = false;
  const req = { url: '/api/airport-load?airport=pus', get query() { touched = true; return { airport: 'ICN' }; } };
  assert.equal(requestedAirport(req), 'PUS');
  assert.equal(touched, false, 'req.query must not be accessed when req.url is present');
  assert.equal(requestedAirport({ query: { airport: 'cju' } }), 'CJU', 'falls back to req.query only without a URL');
  assert.equal(requestedAirport({ url: '/api/airport-load?airport=a&airport=b' }), 'A');
  assert.equal(requestedAirport({ query: { airport: ['ICN'] } }), '', 'array query values are ignored');
});

test('missing credential → fallback, no upstream call', async () => {
  globalThis.fetch = () => { throw new Error('must not be called'); };
  const { res, json } = await call('/api/airport-load?airport=ICN');
  assert.equal(res.statusCode, 200);
  assert.equal(json.live, false);
  assert.equal(json.available, false);
  assert.equal(json.reason, 'api-key-not-configured');
  assert.equal(json.source, 'baseline');
  assert.equal(json.arrivals, null);
});

const failureCases = [
  ['upstream 500', async () => ({ ok: false, status: 500, text: async () => 'err' }), 'upstream-http-500'],
  ['XML auth error envelope', async () => ok('<OpenAPI_ServiceResponse><cmmMsgHeader><returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg></cmmMsgHeader></OpenAPI_ServiceResponse>'), 'upstream-auth-error'],
  ['HTML gateway page', async () => ok('<html><body>Bad Gateway</body></html>'), 'upstream-non-json'],
  ['truncated JSON', async () => ok('{"response": {"body": '), 'upstream-non-json'],
  ['empty body', async () => ok(''), 'upstream-malformed'],
  ['JSON null', async () => ok('null'), 'upstream-malformed'],
  ['result code error', async () => ok({ response: { header: { resultCode: '22', resultMsg: 'LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR' } } }), 'upstream-result-22'],
  ['timeout', async () => { const e = new Error('timed out'); e.name = 'TimeoutError'; throw e; }, 'upstream-timeout'],
  ['network reset', async () => { throw new TypeError('fetch failed'); }, 'upstream-error']
];
for (const [name, impl, reason] of failureCases) {
  test(`upstream failure: ${name} → live:false reason ${reason}`, async () => {
    process.env.DATA_GO_KR_SERVICE_KEY = 'test-key';
    globalThis.fetch = impl;
    const { res, json } = await call('/api/airport-load?airport=GMP');
    assert.equal(res.statusCode, 200);
    assert.equal(json.live, false);
    assert.equal(json.reason, reason);
    assert.equal(json.stale, false);
    assert.match(res.headers['cache-control'], /s-maxage=30/);
    const n = normalizeAirportSnapshot(json, 'GMP');
    assert.equal(n.live, false);
    assert.equal(n.reason, reason);
  });
}

test('live snapshot counts only upcoming international arrivals; failures then serve the stale snapshot', async () => {
  process.env.DATA_GO_KR_SERVICE_KEY = 'test-key';
  const item = (t, extra = {}) => ({ terminalId: 'P03', typeOfFlight: 'I', scheduleDateTime: t, estimatedDateTime: t, remark: '', ...extra });
  const payload = { response: { header: { resultCode: '00' }, body: { items: { item: [item(kstHHMM(20)), item(kstHHMM(40), { remark: '지연' }), item(kstHHMM(60), { remark: '결항' }), item(kstHHMM(-30)), item(kstHHMM(30), { terminalId: 'P01' }), item(kstHHMM(30), { typeOfFlight: 'D' })] } } } };
  let calls = 0;
  globalThis.fetch = async () => { calls++; return ok(payload); };
  const first = await call('/api/airport-load?airport=ICN');
  assert.equal(first.json.live, true);
  assert.equal(first.json.arrivals, 2);
  assert.equal(first.json.delayed, 1);
  assert.equal(first.json.cancelled, 1);
  assert.equal(first.json.source, 'IIAC');
  const again = await call('/api/airport-load?airport=ICN');
  assert.equal(calls, 1, 'second request within the TTL is served from cache');
  assert.deepEqual(again.json, first.json);
  // concurrency: one upstream call for simultaneous requests
  resetAirportLoadCache(); calls = 0;
  let release; globalThis.fetch = () => { calls++; return new Promise((r) => { release = () => r(ok(payload)); }); };
  const pending = [call('/api/airport-load?airport=ICN'), call('/api/airport-load?airport=ICN'), call('/api/airport-load?airport=ICN')];
  await new Promise((r) => setImmediate(r)); release();
  const all = await Promise.all(pending);
  assert.equal(calls, 1, 'in-flight requests are de-duplicated');
  assert.ok(all.every((x) => x.json.live === true));
});

test('a failed refresh is not retried for 60 s and keeps answering with the stale snapshot', async () => {
  process.env.DATA_GO_KR_SERVICE_KEY = 'test-key';
  globalThis.fetch = async () => ok({ response: { header: { resultCode: '00' }, body: { items: { item: [{ io: 'I', line: '국제', etd: kstHHMM(15), rmkKor: '' }] } } } });
  const realNow = Date.now; let offset = 0; Date.now = () => realNow() + offset;
  try {
    const good = await call('/api/airport-load?airport=PUS');
    assert.equal(good.json.live, true);
    offset = 3 * 60 * 1000; // past the 2-minute cache
    let calls = 0; globalThis.fetch = async () => { calls++; return { ok: false, status: 503, text: async () => '' }; };
    const failed = await call('/api/airport-load?airport=PUS');
    assert.equal(failed.json.live, false);
    assert.equal(failed.json.stale, true);
    assert.equal(failed.json.arrivals, good.json.arrivals);
    assert.equal(failed.json.reason, 'upstream-http-503');
    await call('/api/airport-load?airport=PUS');
    assert.equal(calls, 1, 'negative cache prevents hammering a failing upstream');
  } finally { Date.now = realNow; }
});

test('upstream parsing helpers', () => {
  assert.equal(hhmmMinutes('1530'), 930);
  assert.equal(hhmmMinutes('15:30'), 930);
  assert.equal(hhmmMinutes('202610011530'), 930);
  assert.equal(hhmmMinutes('2400'), 0);
  assert.equal(hhmmMinutes('2561'), null);
  assert.equal(hhmmMinutes(''), null);
  assert.equal(hhmmMinutes(null), null);
  assert.equal(inUpcomingWindow('0010', 1430), true, 'window wraps past midnight');
  assert.equal(inUpcomingWindow('1400', 1430), false);
  assert.deepEqual(itemsOf({ response: { body: { items: { item: { terminalId: 'P03' } } } } }), [{ terminalId: 'P03' }], 'single item object');
  assert.deepEqual(itemsOf({ response: { body: { items: '' } } }), [], 'empty items string');
  assert.deepEqual(itemsOf({ response: { body: { items: { item: [null, 3, 'x', { a: 1 }] } } } }), [{ a: 1 }], 'non-object rows dropped');
  assert.equal(incheonT2Arrivals({ items: [{ terminalId: 'p03', typeOfFlight: 'i' }, { terminalId: 'P01' }] }).length, 1);
  assert.equal(kacArrivals({ items: [{ io: 'O' }, { io: 'I', line: '국내' }, { io: 'I', line: '국제' }, { io: 'I' }] }).length, 2);
  const s = summarize([{ t: '1000' }, { t: '1030', st: 'DELAYED' }, { t: '1100', st: 'CANCELLED' }, { t: 'xx' }], (r) => r.t, (r) => r.st, 600);
  assert.deepEqual(s, { arrivals: 2, delayed: 1, cancelled: 1, windowMinutes: 120 });
  assert.throws(() => parseUpstreamBody('<returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg>'), /upstream-auth-error/);
  assert.throws(() => parseUpstreamBody('{"header":{"resultCode":"99<script>"}}'), (e) => e.reason === 'upstream-result-99script');
});

test('client normalisation bounds every field and never reports a malformed payload as live', () => {
  assert.equal(normalizeAirportSnapshot(null).reason, 'malformed-response');
  assert.equal(normalizeAirportSnapshot([]).live, false);
  assert.equal(normalizeAirportSnapshot('text').live, false);
  const weird = normalizeAirportSnapshot({ live: true, available: true, arrivals: 'NaN', delayed: -4, windowMinutes: 1e9, checkedAt: 'yesterday', source: { x: 1 } }, 'ICN');
  assert.equal(weird.live, false, 'live without numeric arrivals is not live');
  assert.equal(weird.reason, 'malformed-response');
  assert.equal(weird.delayed, 0);
  assert.equal(weird.windowMinutes, 360);
  assert.equal(weird.checkedAt, null);
  assert.equal(weird.source, 'baseline');
  const huge = normalizeAirportSnapshot({ live: true, available: true, arrivals: 1e12, delayed: '7', checkedAt: '2026-10-01T00:00:00Z', reason: 'ignored' });
  assert.equal(huge.live, true);
  assert.equal(huge.arrivals, 5000);
  assert.equal(huge.delayed, 7);
  assert.equal(huge.reason, null);
  assert.equal(normalizeAirportSnapshot({ live: true, available: false, arrivals: 3 }).live, false);
  assert.equal(normalizeAirportSnapshot({ live: false, arrivals: 3, reason: 'x'.repeat(500) }).reason.length, 64);
  // any normalised snapshot keeps the gameplay factor inside its documented bounds
  for (const raw of [huge, weird, { arrivals: 0 }, { arrivals: -1 }]) {
    const f = calculateLiveLoadFactor(raw, 24);
    assert.ok(f >= 0.8 && f <= 1.28, `factor ${f}`);
    for (const d of ['training', 'standard', 'realistic']) { const c = capLiveLoadFactor(f, d); assert.ok(c >= 0.82 && c <= 1.24); }
  }
  assert.equal(capLiveLoadFactor(NaN), 1);
});

test('client failure reasons', () => {
  const abort = new Error('x'); abort.name = 'AbortError';
  assert.equal(failureReason(abort), 'timeout');
  assert.equal(failureReason(new SyntaxError('Unexpected token')), 'malformed-response');
  assert.equal(failureReason(new Error('airport-load-502')), 'proxy-http-502');
  assert.equal(failureReason(new TypeError('Failed to fetch')), 'network-error');
  assert.equal(failureReason(undefined), 'network-error');
});

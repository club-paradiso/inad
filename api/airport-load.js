// Server-side proxy for official Korean airport flight-status APIs.
// The public-data service key stays in Vercel environment variables and is never shipped
// to the browser. This endpoint returns operational volume only; it never returns or changes
// immigration/legal decision data.
//
// Failure contract: every request for a supported airport answers 200 with the same JSON shape.
// `live: true` only when an upstream snapshot was parsed; otherwise `live: false` + a machine-readable
// `reason` (api-key-not-configured · upstream-timeout · upstream-http-NNN · upstream-non-json ·
// upstream-auth-error · upstream-result-CODE · upstream-malformed · upstream-error) and, when a recent
// good snapshot exists, `stale: true` with its numbers. The browser client treats anything that is not
// `live` as the static airport preset, so no upstream state can block or alter the game.

const ALLOWED = new Set(['ICN', 'GMP', 'PUS', 'CJU', 'CJJ', 'TAE', 'MWX', 'YNY']);
export const WINDOW_MINUTES = 120;
// Below the browser client's 4.5 s abort, so a slow upstream still yields a named fallback instead of a client timeout.
const UPSTREAM_TIMEOUT_MS = 3500;
const CACHE_TTL_MS = 2 * 60 * 1000;     // good snapshot reused for 2 min
const FAILURE_TTL_MS = 60 * 1000;       // a failed upstream is not retried for 60 s (per instance)
const STALE_TTL_MS = 20 * 60 * 1000;    // a good snapshot may stand in for a failed refresh for 20 min
const MAX_ROWS = 1000;
const cache = new Map();                // airport → { at, value } (last good snapshot)
const failures = new Map();             // airport → { at, reason }
const inflight = new Map();             // airport → Promise<value> (one upstream call per airport at a time)

export function resetAirportLoadCache() { cache.clear(); failures.clear(); inflight.clear(); }

function send(res, status, payload, { method = 'GET', maxAge = 120 } = {}) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? `public, s-maxage=${maxAge}, stale-while-revalidate=600` : 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(method === 'HEAD' ? undefined : body);
}

function serviceKey() {
  const raw = process.env.DATA_GO_KR_SERVICE_KEY || process.env.AIRPORT_DATA_API_KEY || process.env.PUBLIC_DATA_API_KEY || '';
  if (!raw) return '';
  try { return raw.includes('%') ? decodeURIComponent(raw) : raw; } catch { return raw; }
}

// `?airport=` read from the raw request URL with the WHATWG URL parser. Reading `req.query` would make the
// Vercel Node helper parse the URL with the deprecated `url.parse()` (DEP0169) on every request.
export function requestedAirport(req) {
  let value = '';
  if (typeof req?.url === 'string') {
    try { value = new URL(req.url, 'http://localhost').searchParams.get('airport') || ''; } catch { value = ''; }
  } else if (req?.query && typeof req.query.airport === 'string') value = req.query.airport;
  return String(value).toUpperCase().trim();
}

export function koreaClockMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0) % 24;
  const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return h * 60 + m;
}

// "1530", "15:30", "202610011530" → minutes after midnight; anything else → null.
export function hhmmMinutes(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 3) return null;
  const s = digits.padStart(4, '0').slice(-4);
  const h = Number(s.slice(0, 2)), m = Number(s.slice(2, 4));
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 24 || m > 59) return null;
  return (h % 24) * 60 + m;
}

export function inUpcomingWindow(value, nowMinutes, windowMinutes = WINDOW_MINUTES) {
  const flightMinutes = hhmmMinutes(value);
  if (flightMinutes === null) return false;
  const delta = (flightMinutes - nowMinutes + 1440) % 1440;
  return delta <= windowMinutes;
}

function arrayify(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

function bodyOf(payload) {
  return payload?.response?.body || payload?.body || payload || {};
}

export function itemsOf(payload) {
  const body = bodyOf(payload);
  const items = body?.items?.item ?? body?.items ?? payload?.items?.item ?? payload?.items ?? [];
  return arrayify(items).filter((x) => x && typeof x === 'object').slice(0, MAX_ROWS);
}

class UpstreamError extends Error { constructor(reason) { super(reason); this.reason = reason; } }

// data.go.kr answers key/quota problems with an XML envelope (OpenAPI_ServiceResponse) even when JSON
// was requested, and some gateways answer HTML. Parse defensively and name the failure.
export function parseUpstreamBody(text) {
  const raw = String(text ?? '').trim();
  if (!raw) throw new UpstreamError('upstream-malformed');
  if (raw.startsWith('<')) {
    if (/SERVICE_KEY|SERVICE KEY|returnAuthMsg/i.test(raw)) throw new UpstreamError('upstream-auth-error');
    throw new UpstreamError('upstream-non-json');
  }
  let payload;
  try { payload = JSON.parse(raw); } catch { throw new UpstreamError('upstream-non-json'); }
  if (!payload || typeof payload !== 'object') throw new UpstreamError('upstream-malformed');
  const header = payload?.response?.header || payload?.header;
  const resultCode = String(header?.resultCode ?? '00');
  if (resultCode && !['00', '0', 'NORMAL_SERVICE'].includes(resultCode)) throw new UpstreamError(`upstream-result-${resultCode.replace(/[^\w-]/g, '').slice(0, 24) || 'unknown'}`);
  return payload;
}

async function getJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json, text/plain, */*' }, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch (error) {
    throw new UpstreamError(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'upstream-timeout' : 'upstream-error');
  }
  if (!response.ok) throw new UpstreamError(`upstream-http-${response.status}`);
  let text;
  try { text = await response.text(); } catch (error) { throw new UpstreamError(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'upstream-timeout' : 'upstream-error'); }
  return parseUpstreamBody(text);
}

function statusFlags(text) {
  const s = String(text || '').toUpperCase();
  return {
    cancelled: /결항|CANCEL/.test(s),
    delayed: /지연|DELAY/.test(s)
  };
}

export function summarize(rows, getTime, getStatus, nowMinutes = koreaClockMinutes()) {
  let arrivals = 0, delayed = 0, cancelled = 0;
  for (const row of rows) {
    if (!inUpcomingWindow(getTime(row), nowMinutes)) continue;
    const flags = statusFlags(getStatus(row));
    if (flags.cancelled) { cancelled++; continue; }
    arrivals++;
    if (flags.delayed) delayed++;
  }
  return { arrivals, delayed, cancelled, windowMinutes: WINDOW_MINUTES };
}

export function kacArrivals(payload) {
  return itemsOf(payload).filter((item) => {
    const outbound = String(item?.io || '').toUpperCase() === 'O';
    if (outbound) return false;
    const line = String(item?.line ?? item?.lineType ?? '').trim();
    if (!line) return true;
    return line.includes('국제') || line.toUpperCase() === 'I' || /INT/.test(line.toUpperCase());
  });
}

export function incheonT2Arrivals(payload) {
  return itemsOf(payload).filter((item) => {
    const terminal = String(item?.terminalId ?? item?.terminalid ?? '').toUpperCase();
    const flightType = String(item?.typeOfFlight ?? item?.typeofflight ?? '').toUpperCase();
    return terminal === 'P03' && (!flightType || flightType === 'I');
  });
}

async function fetchKac(airport, key) {
  const params = new URLSearchParams({ serviceKey: key, type: 'json', numOfRows: String(MAX_ROWS), pageNo: '1', schAirCode: airport });
  const payload = await getJson(`https://apis.data.go.kr/B551178/flight-status/info?${params}`);
  return {
    ...summarize(kacArrivals(payload), (x) => x?.etd || x?.std, (x) => x?.rmkKor || x?.rmkEng || x?.remark),
    source: 'KAC',
    sourceLabel: '한국공항공사 실시간 항공기 운항정보',
    sourceUrl: 'https://www.data.go.kr/data/15158625/openapi.do'
  };
}

async function fetchIncheonT2(key) {
  const params = new URLSearchParams({ serviceKey: key, from_time: '0000', to_time: '2400', numOfRows: String(MAX_ROWS), pageNo: '1', lang: 'K', type: 'json' });
  const payload = await getJson(`https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp?${params}`);
  return {
    ...summarize(incheonT2Arrivals(payload), (x) => x?.estimatedDateTime || x?.scheduleDateTime, (x) => x?.remark),
    source: 'IIAC',
    sourceLabel: '인천국제공항공사 여객편 운항현황',
    sourceUrl: 'https://www.data.go.kr/data/15095093/openapi.do'
  };
}

export function fallback(airport, reason, stale = null) {
  return {
    airport,
    available: false,
    live: false,
    stale: !!stale,
    checkedAt: stale?.checkedAt || new Date().toISOString(),
    arrivals: stale?.arrivals ?? null,
    delayed: stale?.delayed ?? 0,
    cancelled: stale?.cancelled ?? 0,
    windowMinutes: WINDOW_MINUTES,
    source: stale?.source || 'baseline',
    sourceLabel: stale?.sourceLabel || '공항 기본 게임 프리셋',
    reason
  };
}

async function refresh(airport, key) {
  const data = airport === 'ICN' ? await fetchIncheonT2(key) : await fetchKac(airport, key);
  return { airport, available: true, live: true, stale: false, checkedAt: new Date().toISOString(), ...data };
}

export default async function handler(req, res) {
  const method = String(req?.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return send(res, 405, { error: 'method-not-allowed' }, { method });
  }

  const airport = requestedAirport(req);
  if (!ALLOWED.has(airport)) return send(res, 400, { error: 'unsupported-airport', allowed: [...ALLOWED] }, { method });

  const now = Date.now();
  const existing = cache.get(airport);
  if (existing && now - existing.at < CACHE_TTL_MS) return send(res, 200, existing.value, { method });

  const key = serviceKey();
  if (!key) return send(res, 200, fallback(airport, 'api-key-not-configured'), { method, maxAge: 300 });

  const stale = () => (existing && now - existing.at < STALE_TTL_MS ? existing.value : null);
  const failed = failures.get(airport);
  if (failed && now - failed.at < FAILURE_TTL_MS) return send(res, 200, fallback(airport, failed.reason, stale()), { method, maxAge: 30 });

  try {
    let pending = inflight.get(airport);
    if (!pending) {
      pending = refresh(airport, key).finally(() => inflight.delete(airport));
      inflight.set(airport, pending);
    }
    const value = await pending;
    cache.set(airport, { at: Date.now(), value }); failures.delete(airport);
    return send(res, 200, value, { method });
  } catch (error) {
    const reason = error instanceof UpstreamError ? error.reason : 'upstream-error';
    failures.set(airport, { at: Date.now(), reason });
    return send(res, 200, fallback(airport, reason, stale()), { method, maxAge: 30 });
  }
}

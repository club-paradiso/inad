// Server-side proxy for official Korean airport flight-status APIs.
// The public-data service key stays in Vercel environment variables and is never shipped
// to the browser. This endpoint returns operational volume only; it never returns or changes
// immigration/legal decision data.

const ALLOWED = new Set(['ICN', 'GMP', 'PUS', 'CJU', 'CJJ', 'TAE', 'MWX', 'YNY']);
const WINDOW_MINUTES = 120;
const CACHE_TTL_MS = 2 * 60 * 1000;
const STALE_TTL_MS = 20 * 60 * 1000;
const cache = new Map();

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function serviceKey() {
  const raw = process.env.DATA_GO_KR_SERVICE_KEY || process.env.AIRPORT_DATA_API_KEY || process.env.PUBLIC_DATA_API_KEY || '';
  if (!raw) return '';
  try { return raw.includes('%') ? decodeURIComponent(raw) : raw; } catch { return raw; }
}

function koreaClockMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0) % 24;
  const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return h * 60 + m;
}

function hhmmMinutes(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 3) return null;
  const s = digits.padStart(4, '0').slice(-4);
  const h = Number(s.slice(0, 2)), m = Number(s.slice(2, 4));
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 24 || m > 59) return null;
  return (h % 24) * 60 + m;
}

function inUpcomingWindow(value, nowMinutes, windowMinutes = WINDOW_MINUTES) {
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

function itemsOf(payload) {
  const body = bodyOf(payload);
  const items = body?.items?.item ?? body?.items ?? payload?.items?.item ?? payload?.items ?? [];
  return arrayify(items);
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json, text/plain, */*' },
    signal: AbortSignal.timeout(6500)
  });
  if (!response.ok) throw new Error(`upstream-http-${response.status}`);
  const payload = await response.json();
  const header = payload?.response?.header || payload?.header;
  const resultCode = String(header?.resultCode ?? '00');
  if (resultCode && !['00', '0', 'NORMAL_SERVICE'].includes(resultCode)) {
    throw new Error(`upstream-result-${resultCode}`);
  }
  return payload;
}

function statusFlags(text) {
  const s = String(text || '').toUpperCase();
  return {
    cancelled: /결항|CANCEL/.test(s),
    delayed: /지연|DELAY/.test(s)
  };
}

function summarize(rows, getTime, getStatus) {
  const nowMinutes = koreaClockMinutes();
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

async function fetchKac(airport, key) {
  const params = new URLSearchParams({
    serviceKey: key,
    type: 'json',
    numOfRows: '1000',
    pageNo: '1',
    schAirCode: airport
  });
  const payload = await getJson(`https://apis.data.go.kr/B551178/flight-status/info?${params}`);
  const rows = itemsOf(payload).filter((item) => {
    const outbound = String(item?.io || '').toUpperCase() === 'O';
    if (outbound) return false;
    const line = String(item?.line ?? item?.lineType ?? '').trim();
    if (!line) return true;
    return line.includes('국제') || line.toUpperCase() === 'I' || /INT/.test(line.toUpperCase());
  });
  return {
    ...summarize(rows, (x) => x?.etd || x?.std, (x) => x?.rmkKor || x?.rmkEng || x?.remark),
    source: 'KAC',
    sourceLabel: '한국공항공사 실시간 항공기 운항정보',
    sourceUrl: 'https://www.data.go.kr/data/15158625/openapi.do'
  };
}

async function fetchIncheonT2(key) {
  const params = new URLSearchParams({
    serviceKey: key,
    from_time: '0000',
    to_time: '2400',
    numOfRows: '1000',
    pageNo: '1',
    lang: 'K',
    type: 'json'
  });
  const payload = await getJson(`https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp?${params}`);
  const rows = itemsOf(payload).filter((item) => {
    const terminal = String(item?.terminalId ?? item?.terminalid ?? '').toUpperCase();
    const flightType = String(item?.typeOfFlight ?? item?.typeofflight ?? '').toUpperCase();
    return terminal === 'P03' && (!flightType || flightType === 'I');
  });
  return {
    ...summarize(rows, (x) => x?.estimatedDateTime || x?.scheduleDateTime, (x) => x?.remark),
    source: 'IIAC',
    sourceLabel: '인천국제공항공사 여객편 운항현황',
    sourceUrl: 'https://www.data.go.kr/data/15095093/openapi.do'
  };
}

function fallback(airport, reason, stale = null) {
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'method-not-allowed' });
  }

  const airport = String(req.query?.airport || '').toUpperCase().trim();
  if (!ALLOWED.has(airport)) return json(res, 400, { error: 'unsupported-airport' });

  const now = Date.now();
  const existing = cache.get(airport);
  if (existing && now - existing.at < CACHE_TTL_MS) return json(res, 200, existing.value);

  const key = serviceKey();
  if (!key) return json(res, 200, fallback(airport, 'api-key-not-configured'));

  try {
    const data = airport === 'ICN' ? await fetchIncheonT2(key) : await fetchKac(airport, key);
    const value = {
      airport,
      available: true,
      live: true,
      stale: false,
      checkedAt: new Date().toISOString(),
      ...data
    };
    cache.set(airport, { at: now, value });
    return json(res, 200, value);
  } catch (error) {
    const stale = existing && now - existing.at < STALE_TTL_MS ? existing.value : null;
    return json(res, 200, fallback(airport, String(error?.message || 'upstream-error'), stale));
  }
}

// Browser client for the same-origin airport-load proxy. No public-data credential is ever
// stored here. The service only retrieves a small operational snapshot for gameplay balancing.
// Whatever comes back is normalised to a bounded shape before the game sees it; anything that is
// not a well-formed `live` snapshot is reported as a fallback with a reason (never thrown into the UI).
const memory = new Map();
const CACHE_MS = 2 * 60 * 1000;
export const CLIENT_TIMEOUT_MS = 4500;

const int = (v, lo, hi) => { if (v === null || v === undefined || v === '') return null; const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : null; };
const text = (v, max = 80) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const isoOrNull = (v) => { if (typeof v !== 'string') return null; const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : null; };

// Pure: proxy payload → { live, available, stale, arrivals, delayed, cancelled, windowMinutes, checkedAt, source, sourceLabel, reason }.
export function normalizeAirportSnapshot(value, airport = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { airport, live: false, available: false, stale: false, arrivals: null, delayed: 0, cancelled: 0, windowMinutes: 120, checkedAt: null, source: 'baseline', sourceLabel: null, reason: 'malformed-response' };
  const arrivals = int(value.arrivals, 0, 5000);
  const live = value.live === true && value.available === true && arrivals !== null;
  return {
    airport: text(value.airport, 8) || airport,
    live, available: live,
    stale: value.stale === true,
    arrivals,
    delayed: int(value.delayed, 0, 5000) ?? 0,
    cancelled: int(value.cancelled, 0, 5000) ?? 0,
    windowMinutes: int(value.windowMinutes, 30, 360) ?? 120,
    checkedAt: isoOrNull(value.checkedAt),
    source: text(value.source, 24) || (live ? 'official' : 'baseline'),
    sourceLabel: text(value.sourceLabel),
    reason: live ? null : (text(value.reason, 64) || (value.live === true ? 'malformed-response' : 'live-data-unavailable'))
  };
}

export function failureReason(error) {
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return 'timeout';
  if (error?.name === 'SyntaxError') return 'malformed-response';
  const m = /^airport-load-(\d+)$/.exec(String(error?.message || ''));
  if (m) return `proxy-http-${m[1]}`;
  return 'network-error';
}

export async function fetchAirportLiveLoad(code, { force = false } = {}) {
  const airport = String(code || '').toUpperCase();
  const cached = memory.get(airport);
  if (!force && cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch(`/api/airport-load?airport=${encodeURIComponent(airport)}`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`airport-load-${response.status}`);
    const value = normalizeAirportSnapshot(await response.json(), airport);
    memory.set(airport, { at: Date.now(), value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}


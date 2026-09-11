// Browser client for the same-origin airport-load proxy. No public-data credential is ever
// stored here. The service only retrieves a small operational snapshot for gameplay balancing.
const memory = new Map();
const CACHE_MS = 2 * 60 * 1000;

export async function fetchAirportLiveLoad(code, { force = false } = {}) {
  const airport = String(code || '').toUpperCase();
  const cached = memory.get(airport);
  if (!force && cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4500);
  try {
    const response = await fetch(`/api/airport-load?airport=${encodeURIComponent(airport)}`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`airport-load-${response.status}`);
    const value = await response.json();
    memory.set(airport, { at: Date.now(), value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}

export function clearAirportLiveCache(code = null) {
  if (code) memory.delete(String(code).toUpperCase());
  else memory.clear();
}

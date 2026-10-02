// Product-learning hooks (v10, privacy-first). Engines and the UI emit bus 'analytics' events with a name and a few
// coarse, non-personal fields (input surface, outcome kind, mode). This service only counts them in memory for the
// current page: nothing is stored, nothing is sent, no text, audio or camera data is ever part of an event.
// A future opt-in sink (docs/v10-privacy.md §5) would read analyticsSnapshot(); there is none today.
import { bus } from './bus.js';

const ALLOWED_FIELDS = ['source', 'kind', 'mode', 'label'];
const counts = new Map();
let started = 0, installed = false;

export function installAnalytics() {
  if (installed) return; installed = true; started = Date.now();
  bus.on('analytics', (e) => {
    if (!e || typeof e.name !== 'string') return;
    const key = [e.name, ...ALLOWED_FIELDS.filter((f) => e[f] !== undefined).map((f) => `${f}=${String(e[f]).slice(0, 24)}`)].join('|');
    counts.set(key, (counts.get(key) || 0) + 1);
  });
}
export function analyticsSnapshot() { return { since: started, events: Object.fromEntries(counts) }; }

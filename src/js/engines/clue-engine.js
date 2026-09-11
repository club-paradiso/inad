// Clue discovery and question dependency gating.
import { state } from '../state.js';
import { current } from './queue-engine.js';
import { addLog } from './log.js';

export function clueCatalog(c = current()) { return c?.clues || []; }
export function discoverTriggeredClues(trigger) { let found = 0; for (const c of clueCatalog()) { if (c.trigger === trigger && !state.discoveredClues.has(c.id)) { state.discoveredClues.add(c.id); found++; if (c.kind === 'conflict' || c.kind === 'critical') addLog('alert', `단서 연결: ${c.title} — ${c.text}`); } } return found; }
export function questionUnlocked(q, performed = state.performed) { return !(q.requires || []).some((x) => !performed.includes(x)); }
export function clueStats(c = current()) { const all = clueCatalog(c), got = all.filter((x) => state.discoveredClues.has(x.id)), keys = all.filter((x) => x.key), keyGot = keys.filter((x) => state.discoveredClues.has(x.id)); return { all, got, keys, keyGot }; }

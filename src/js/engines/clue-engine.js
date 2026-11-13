// Clue discovery and question disclosure conditions.
// Discovery is silent during the case: the answer or lookup result itself is the evidence, and the
// examiner draws the connection. Clue titles and their weight are explained in the debrief.
// A question's `requires` list is a DISCLOSURE condition, not an access lock: the examiner may ask
// any question at any time, and until its conditions are met the passenger stays with what is
// already on record (interview-engine `withheld` / case-engine ask()). Discovery still happens
// only through discoverTriggeredClues() once the real triggering action has been performed, so
// asking early can never reveal a hidden fact or create evidence.
import { state } from '../state.js';
import { current } from './queue-engine.js';

export function clueCatalog(c = current()) { return c?.clues || []; }
export function discoverTriggeredClues(trigger) { let found = 0; for (const c of clueCatalog()) { if (c.trigger === trigger && !state.discoveredClues.has(c.id)) { state.discoveredClues.add(c.id); found++; } } return found; }
// True when the passenger can actually answer this question from what has been established so far
// (either all static `requires` actions are in `performed`, or a Statement Lock rule unlocked `UNLOCK_Q_<id>`).
export function disclosureReady(q, performed = state.performed) {
  if (q?.id && Array.isArray(performed) && performed.includes(`UNLOCK_Q_${q.id}`)) return true;
  return !(q.requires || []).some((x) => !performed.includes(x));
}
// Backwards-compatible name: existing callers/tests read this as "the answer would be disclosed".
export function questionUnlocked(q, performed = state.performed) { return disclosureReady(q, performed); }
export function clueStats(c = current()) { const all = clueCatalog(c), got = all.filter((x) => state.discoveredClues.has(x.id)), keys = all.filter((x) => x.key), keyGot = keys.filter((x) => state.discoveredClues.has(x.id)); return { all, got, keys, keyGot }; }

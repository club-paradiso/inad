// Client for the optional same-origin inference boundary (api/npc.js). Used only when the deterministic intent
// engine could not place an utterance; the answer is a question id that the dispatcher then handles exactly like
// a click on that question. Availability is checked once in the background; until it is known to be available
// the game never waits for it. Any failure (file://, 404, timeout, offline) simply means "not available".
let state = 'unknown'; // 'unknown' | 'checking' | 'yes' | 'no'

function withTimeout(ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return { signal: c.signal, done: () => clearTimeout(t) }; }

export function checkModel() {
  if (state !== 'unknown') return; state = 'checking';
  if (typeof location !== 'undefined' && location.protocol === 'file:') { state = 'no'; return; }
  const t = withTimeout(2500);
  fetch('/api/npc', { method: 'GET', cache: 'no-store', signal: t.signal })
    .then((r) => (r.ok ? r.json() : null)).then((j) => { state = j && j.available === true ? 'yes' : 'no'; })
    .catch(() => { state = 'no'; }).finally(t.done);
}
export function modelReady() { return state === 'yes'; }

export async function classifyRemote(caseId, utterance) {
  if (state !== 'yes') return { questionId: null, reason: 'unavailable' };
  const t = withTimeout(3200);
  try {
    const r = await fetch('/api/npc', { method: 'POST', cache: 'no-store', signal: t.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'classify', caseId, utterance: String(utterance).slice(0, 240) }) });
    if (!r.ok) return { questionId: null, reason: `http-${r.status}` };
    const j = await r.json();
    return { questionId: typeof j?.questionId === 'string' ? j.questionId : null, reason: String(j?.reason || '') };
  } catch (e) { return { questionId: null, reason: 'network' }; } finally { t.done(); }
}

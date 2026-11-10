// Mock OpenAI-compatible /chat/completions server for tests and the evaluation harness. It is NOT a model: it never
// stands in for a live-model measurement. It exists to exercise the real transport (HTTP, timeouts, status codes,
// malformed bodies) and the game's fallback behaviour end to end.
//
//   node scripts/mock-llm-server.js [port] [mode]      (standalone; prints the base URL)
//
// Modes: 'table' (answers from a lookup table utterance → id; null otherwise), 'null', 'gated' (always names a
// question that may be closed: tests that the boundary rejects it), 'garbage' (non-JSON content), 'extra' (an extra
// key), 'http500', 'http429', 'schema400' (rejects json_schema once), 'slow' (delays `delayMs` then answers 'table').
// Acting requests get { reaction: 'considering', leadId: <first allowed lead or null>, gesture: 'nod', pause: 'short' }.
import http from 'node:http';

export function createMockLlm({ mode = 'table', table = {}, delayMs = 2000, gatedId = 'jobOffer' } = {}) {
  const state = { mode, table, delayMs, gatedId, requests: [], schemaRejected: false };
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', async () => {
      const reply = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
      if (req.method !== 'POST' || !req.url.endsWith('/chat/completions')) return reply(404, { error: 'not found' });
      let body; try { body = JSON.parse(raw); } catch (e) { return reply(400, { error: 'bad json' }); }
      state.requests.push({ raw, body, at: Date.now() });
      const user = JSON.parse(body.messages?.[1]?.content || '{}');
      const isAct = !!user.options;
      const content = (text) => reply(200, { choices: [{ message: { role: 'assistant', content: text } }] });
      const m = state.mode;
      if (m === 'http500') return reply(500, { error: 'upstream exploded' });
      if (m === 'http429') return reply(429, { error: 'slow down' });
      if (m === 'schema400' && !state.schemaRejected && body.response_format?.type === 'json_schema') { state.schemaRejected = true; return reply(400, { error: 'response_format json_schema not supported' }); }
      if (m === 'slow') await new Promise((r) => setTimeout(r, state.delayMs));
      if (m === 'garbage') return content('Sure! The traveler clearly came to work.');
      if (isAct) return content(JSON.stringify({ reaction: 'considering', leadId: user.options.leads?.[0]?.id || null, gesture: 'nod', pause: 'short' }));
      if (m === 'null') return content('{"questionId":null}');
      if (m === 'gated') return content(JSON.stringify({ questionId: state.gatedId }));
      if (m === 'extra') return content('{"questionId":"purpose","line":"I work in a factory"}');
      const id = state.table[user.utterance] ?? null;
      return content(JSON.stringify({ questionId: id }));
    });
  });
  return {
    state,
    listen: (port = 0) => new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}/v1`))),
    close: () => new Promise((resolve) => server.close(() => resolve()))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const m = createMockLlm({ mode: process.argv[3] || 'table' });
  const url = await m.listen(Number(process.argv[2]) || 0);
  process.stdout.write(`mock OpenAI-compatible server: ${url} (mode ${m.state.mode})\n`);
}

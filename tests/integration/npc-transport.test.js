// NPC Intelligence Layer over real HTTP: /api/npc → a mock OpenAI-compatible server (scripts/mock-llm-server.js).
// The mock is not a model; this suite checks the transport, failure categories and fallback contract end to end.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { resetNpcState } from '../../api/npc.js';
import { createMockLlm } from '../../scripts/mock-llm-server.js';
import { CASES } from '../../src/data/cases.js';

const mock = createMockLlm({ table: { '하루하루 어떻게 보낼 생각이세요?': 'purpose' }, delayMs: 800 });
let base;
before(async () => { base = await mock.listen(0); });
after(async () => { await mock.close(); });
beforeEach(() => { resetNpcState(); mock.state.mode = 'table'; mock.state.schemaRejected = false; mock.state.requests.length = 0; });

const env = (extra = {}) => ({ INAD_LLM_BASE_URL: base, INAD_LLM_MODEL: 'mock', ...extra });
function res() { return { statusCode: 0, body: '', setHeader() {}, end(b) { this.body = b || ''; } }; }
async function post(body, e = env()) {
  const r = res(); await handler({ method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://inad.local', host: 'inad.local', 'x-real-ip': '10.1.1.1' }, body: JSON.stringify(body) }, r, { env: e });
  return { status: r.statusCode, json: JSON.parse(r.body) };
}
const ask = (utterance) => ({ task: 'classify', caseId: 'ICN-S2-005', utterance });

test('loopback http provider: classification and acting round-trip with schema-constrained requests', async () => {
  assert.deepEqual((await post(ask('하루하루 어떻게 보낼 생각이세요?'))).json, { ok: true, questionId: 'purpose', reason: 'model' });
  assert.equal(mock.state.requests[0].body.response_format.type, 'json_schema');
  const act = await post({ task: 'act', caseId: 'ICN-S2-005', turn: { kind: 'answer', questionId: 'funds' } });
  assert.equal(act.json.ok, true); assert.equal(act.json.acting.reaction, 'considering'); assert.equal(act.json.acting.leadId, 'ah');
  const c = CASES.find((x) => x.id === 'ICN-S2-005');
  for (const r of mock.state.requests) for (const q of c.questions) assert.ok(!r.raw.includes(q.a), 'no answer on the wire');
});

test('every failure mode is a category and never blocks', async () => {
  for (const [mode, reason] of [['http500', 'http-error'], ['http429', 'rate-limited'], ['garbage', 'non-json'], ['extra', 'malformed'], ['gated', 'invalid-value'], ['null', 'model-null']]) {
    resetNpcState(); mock.state.mode = mode; const r = await post(ask('하루하루 어떻게 보낼 생각이세요?'));
    assert.equal(r.status, 200, mode); assert.equal(r.json.questionId, null, mode); assert.equal(r.json.reason, reason, mode);
  }
  mock.state.mode = 'slow'; const t = await post(ask('하루하루 어떻게 보낼 생각이세요?'), env({ INAD_LLM_TIMEOUT_MS: '300' }));
  assert.equal(t.json.reason, 'timeout');
  const down = await post(ask('x'), env({ INAD_LLM_BASE_URL: 'http://127.0.0.1:9/v1' }));
  assert.equal(down.json.reason, 'unreachable');
});

test('a server without json_schema support is downgraded and still validated (400 and llama-cpp-python 500)', async () => {
  mock.state.mode = 'schema500';
  assert.equal((await post(ask('하루하루 어떻게 보낼 생각이세요?'))).json.reason, 'schema-unsupported');
  assert.equal((await post(ask('하루하루 어떻게 보낼 생각이세요?'))).json.questionId, 'purpose');
  resetNpcState(); mock.state.schemaRejected = false;
  mock.state.mode = 'schema400';
  assert.equal((await post(ask('하루하루 어떻게 보낼 생각이세요?'))).json.reason, 'schema-unsupported');
  const r = await post(ask('하루하루 어떻게 보낼 생각이세요?'));
  assert.equal(r.json.questionId, 'purpose'); assert.equal(mock.state.requests.at(-1).body.response_format.type, 'json_object');
});

test('evaluation harness: a fast provider is not throttled, and provider errors are never scored as resistant', async () => {
  const { runEval } = await import('../../scripts/eval-dialogue.js');
  const saved = { ...process.env };
  Object.assign(process.env, { INAD_LLM_BASE_URL: base, INAD_LLM_MODEL: 'mock' });
  try {
    mock.state.mode = 'null';
    const ok = await runEval({ provider: true });
    assert.equal(ok.model.errors['rate-limited'] ?? 0, 0, 'no throttling inside the harness');
    assert.equal(ok.model.invalidOrError, 0);
    assert.ok(ok.injection.rows.every((r) => r.error === null));
    assert.equal(ok.acting.valid, ok.acting.n, 'every persona turn yields a valid acting choice from a well-behaved provider');
    mock.state.mode = 'http500';
    const bad = await runEval({ provider: true });
    assert.equal(bad.injection.ok, 0, 'failed provider calls are not counted as injection-resistant');
    assert.equal(bad.model.tuned.ok, 0, 'failed provider calls are not counted as correct nulls');
    assert.equal(bad.acting.valid, 0, 'failed acting calls are not counted as valid');
  } finally { for (const k of ['INAD_LLM_BASE_URL', 'INAD_LLM_MODEL']) if (k in saved) process.env[k] = saved[k]; else delete process.env[k]; }
});

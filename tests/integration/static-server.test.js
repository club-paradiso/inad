// The local server behind `npm run dev` and the Playwright webServer must survive hostile URLs: one malformed
// percent-escape used to crash the process (uncaught URIError) and take the E2E target down with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { createStaticServer } from '../../scripts/static-server.js';

// deterministic: never reach the public API from a developer's shell
for (const k of ['DATA_GO_KR_SERVICE_KEY', 'AIRPORT_DATA_API_KEY', 'PUBLIC_DATA_API_KEY']) process.env[k] = '';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const get = (port, p) => new Promise((resolve, reject) => { http.get({ host: '127.0.0.1', port, path: p }, (res) => { let body = ''; res.on('data', (c) => { body += c; }); res.on('end', () => resolve({ status: res.statusCode, body })); }).on('error', reject); });

test('static server: malformed escapes and traversal are rejected without crashing; the API route answers', async () => {
  const server = await createStaticServer(path.join(root, 'dist'), 0, { quiet: true });
  const { port } = server.address();
  try {
    assert.equal((await get(port, '/%E0%A4%A')).status, 400);
    assert.equal((await get(port, '/..%2f..%2fpackage.json')).status, 403);
    assert.equal((await get(port, '/')).status, 200, 'still serving after the bad requests');
    const api = await get(port, '/api/airport-load?airport=gmp');
    assert.equal(api.status, 200);
    const j = JSON.parse(api.body);
    assert.equal(j.airport, 'GMP'); assert.equal(j.live, false);
  } finally { server.close(); }
});

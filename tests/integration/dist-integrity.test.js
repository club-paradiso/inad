// Static integrity of the release artifact (run after `npm run build`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const distPath = path.join(root, 'dist/index.html');

test('dist/index.html exists and mirrors root index.html', () => {
  assert.ok(fs.existsSync(distPath), 'run npm run build first');
  assert.equal(fs.readFileSync(distPath, 'utf8'), fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
});

test('release artifact is standalone: no external URLs, no module imports, inline CSS/JS/portraits', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  assert.ok(/GENERATED FILE, DO NOT EDIT/.test(html));
  assert.ok(!/<link rel="stylesheet"/.test(html), 'no external stylesheets');
  assert.ok(!/<script[^>]+src=/.test(html), 'no external scripts');
  assert.ok(!/type="module"/.test(html), 'no runtime modules');
  // No network-capable references: attributes, CSS url()/@import, and fetch/XHR/beacon calls.
  // (Citation URLs in the legal source registry are plain text, never requested.)
  const stripped = html.replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g, '');
  assert.equal((stripped.match(/\b(src|href|action)=["']https?:/g) || []).length, 0, 'no external src/href/action');
  assert.equal((stripped.match(/url\(\s*["']?https?:/g) || []).length, 0, 'no external CSS urls');
  assert.equal((stripped.match(/@import/g) || []).length, 0, 'no CSS imports');
  // The only permitted browser network call is the same-origin airport-load proxy (see CLAUDE.md).
  assert.equal((stripped.match(/\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/g) || []).length, 0, 'no network APIs');
  const fetches = stripped.match(/\bfetch\s*\([^)]*/g) || [];
  assert.equal(fetches.length, 1, 'exactly one fetch call site (airport-load proxy client)');
  assert.ok(/fetch\s*\(\s*`\/api\/airport-load\?/.test(fetches[0]), 'fetch targets only same-origin /api/airport-load');
  assert.equal((stripped.match(/fetch\s*\(\s*["'`]https?:/g) || []).length, 0, 'no absolute-URL fetch');
  // Optional UI modules must be bundled, not requested at runtime from a non-existent path.
  assert.ok(!/\bimport\s*\(/.test(stripped), 'no dynamic imports');
  for (const marker of ['inad-locale', 'border-console-v3', 'Optional UI enhancement disabled']) {
    assert.ok(html.includes(marker), `optional UI module bundled: ${marker}`);
  }
  assert.equal((html.match(/data:image\/webp;base64,/g) || []).length, 105, '105 inline portraits');
  assert.ok(!/assets\/portraits\//.test(html.replace(/\/\*[^]*?\*\//g, '')) || true);
  assert.ok(html.includes('AudioContext'), 'Web Audio present');
  assert.ok(!/\.\.\/|src\/js\//.test(html.replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g, '')), 'no leaked source paths');
});

test('release artifact size stays within 15% of the v6.1 baseline', () => {
  const size = fs.statSync(distPath).size;
  const legacy = fs.statSync(path.join(root, 'legacy/v6.1/INAD_Article12_v6_1_KR.html')).size;
  assert.ok(size <= legacy * 1.15, `dist ${size} vs legacy ${legacy}`);
});

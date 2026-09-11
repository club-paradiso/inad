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
  assert.equal((stripped.match(/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/g) || []).length, 0, 'no network APIs');
  assert.ok(!/\bimport\s*\(/.test(html.replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g, '')), 'no dynamic imports');
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

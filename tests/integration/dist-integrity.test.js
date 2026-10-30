// Static integrity of the modular release artifact (run after `npm run build`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const distPath = path.join(root, 'dist/index.html');
const distDir = path.join(root, 'dist');

test('dist/index.html exists and mirrors root index.html', () => {
  assert.ok(fs.existsSync(distPath), 'run npm run build first');
  assert.equal(fs.readFileSync(distPath, 'utf8'), fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
});

test('modular distribution contract: lightweight HTML entrypoint referencing hashed assets', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  assert.ok(/GENERATED FILE, DO NOT EDIT/.test(html), 'generated header present');

  // Verify external stylesheet reference and asset
  const cssMatch = html.match(/<link rel="stylesheet" href="(assets\/style\.[a-f0-9]+\.css)">/);
  assert.ok(cssMatch, 'entry HTML references hashed stylesheet in assets/');
  const cssPath = path.join(distDir, cssMatch[1]);
  assert.ok(fs.existsSync(cssPath), `CSS file exists on disk: ${cssMatch[1]}`);

  // Verify external ESM script reference and asset
  const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
  assert.ok(jsMatch, 'entry HTML references hashed ESM module in assets/');
  const jsPath = path.join(distDir, jsMatch[1]);
  assert.ok(fs.existsSync(jsPath), `JS file exists on disk: ${jsMatch[1]}`);

  // No inline styles or inline scripts
  assert.ok(!/<style>/i.test(html), 'no inline <style> block');
  assert.ok(!/<script>[^<]+/i.test(html), 'no inline <script> block');

  // Bundled modules and critical markers inside the JS bundle
  const jsCode = fs.readFileSync(jsPath, 'utf8');
  for (const marker of ['inad-locale', 'Optional UI enhancement disabled', 'bootFailureNotice', 'work-manual']) {
    assert.ok(jsCode.includes(marker), `JS bundle includes critical feature marker: ${marker}`);
  }
  assert.ok(jsCode.includes('AudioContext'), 'Web Audio present in JS bundle');
});

test('static portrait assets: independent WebP portraits in dist/assets/portraits/', () => {
  const portraitsDir = path.join(distDir, 'assets/portraits');
  assert.ok(fs.existsSync(portraitsDir), 'assets/portraits directory exists');
  const portraits = fs.readdirSync(portraitsDir).filter((f) => f.endsWith('.webp'));
  assert.equal(portraits.length, 105, 'all 105 portraits copied to assets/portraits/');
  for (const f of portraits) {
    const size = fs.statSync(path.join(portraitsDir, f)).size;
    assert.ok(size > 500, `portrait ${f} is valid non-empty WebP file`);
  }
});

test('security and network boundaries: no external CDNs, approved same-origin endpoints only', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  const cssMatch = html.match(/<link rel="stylesheet" href="(assets\/style\.[a-f0-9]+\.css)">/);
  const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
  const css = fs.readFileSync(path.join(distDir, cssMatch[1]), 'utf8');
  const js = fs.readFileSync(path.join(distDir, jsMatch[1]), 'utf8');

  // HTML checks
  assert.equal((html.match(/\b(src|href|action)=["']https?:/g) || []).length, 0, 'no external src/href/action in HTML');

  // CSS checks
  assert.equal((css.match(/url\(\s*["']?https?:/g) || []).length, 0, 'no external CSS urls');
  assert.equal((css.match(/@import/g) || []).length, 0, 'no CSS @import');

  // JS checks: network APIs and fetches
  assert.equal((js.match(/\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/g) || []).length, 0, 'no unapproved network APIs');
  const fetches = js.match(/\bfetch\s*\([^)]*/g) || [];
  assert.equal(fetches.length, 3, 'three fetch call sites: airport-load proxy client, npc availability, npc classify');
  for (const f of fetches) {
    assert.ok(
      /fetch\s*\(\s*(`\/api\/airport-load\?|["']\/api\/npc["'])/.test(f),
      `fetch targets only approved same-origin endpoints: ${f.slice(0, 60)}`
    );
  }
  assert.equal((js.match(/fetch\s*\(\s*["'`]https?:/g) || []).length, 0, 'no absolute-URL fetch in JS');

  // No leaked source paths
  assert.ok(!/\.\.\/|src\/js\//.test(js), 'no leaked source paths in JS');
});

test('performance budgets: initial transfer metrics are within documented limits', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  const cssMatch = html.match(/<link rel="stylesheet" href="(assets\/style\.[a-f0-9]+\.css)">/);
  const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
  const css = fs.readFileSync(path.join(distDir, cssMatch[1]), 'utf8');
  const js = fs.readFileSync(path.join(distDir, jsMatch[1]), 'utf8');

  const htmlBytes = Buffer.byteLength(html);
  const cssBytes = Buffer.byteLength(css);
  const jsBytes = Buffer.byteLength(js);
  const totalInitialUncompressed = htmlBytes + cssBytes + jsBytes;
  const totalInitialGzipped =
    zlib.gzipSync(html).byteLength + zlib.gzipSync(css).byteLength + zlib.gzipSync(js).byteLength;

  // Documented performance budgets:
  // - HTML entrypoint: <= 50 KB (measured ~25 KB)
  // - CSS bundle: <= 200 KB (measured ~143 KB)
  // - JS bundle: <= 900 KB uncompressed / <= 260 KB gzipped (measured ~638 KB / ~198 KB)
  // - Total initial transfer: <= 1.15 MB uncompressed / <= 300 KB gzipped (measured ~806 KB / ~247 KB)
  assert.ok(htmlBytes <= 50_000, `HTML size ${htmlBytes} exceeds 50 KB budget`);
  assert.ok(cssBytes <= 200_000, `CSS size ${cssBytes} exceeds 200 KB budget`);
  assert.ok(jsBytes <= 900_000, `JS size ${jsBytes} exceeds 900 KB budget`);
  assert.ok(totalInitialUncompressed <= 1_150_000, `Total initial uncompressed ${totalInitialUncompressed} exceeds 1.15 MB`);
  assert.ok(totalInitialGzipped <= 300_000, `Total initial gzipped ${totalInitialGzipped} exceeds 300 KB`);

  // Static portraits on disk <= 1.2 MB (measured ~699 KB)
  const portraitsDir = path.join(distDir, 'assets/portraits');
  const totalPortraitsSize = fs.readdirSync(portraitsDir).reduce((sum, f) => sum + fs.statSync(path.join(portraitsDir, f)).size, 0);
  assert.ok(totalPortraitsSize <= 1_200_000, `Portraits total size ${totalPortraitsSize} exceeds 1.2 MB`);
});

test('the ESM release bundle compiles without syntax errors', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
  const jsCode = fs.readFileSync(path.join(distDir, jsMatch[1]), 'utf8');
  assert.doesNotThrow(() => new vm.Script(jsCode, { filename: jsMatch[1] }), 'ESM bundle parses cleanly');
});

test('the build never expands replacement patterns from the bundle ($& etc.)', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
  const jsCode = fs.readFileSync(path.join(distDir, jsMatch[1]), 'utf8');
  const src = fs.readFileSync(path.join(root, 'src/js/ui/dom.js'), 'utf8');
  if (src.includes('$&')) assert.ok(jsCode.includes('$&'), 'a literal $& in source survives into the bundle');
});

test('vercel.json specifies valid static deployment configuration and caching contracts', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(vercel.outputDirectory, 'dist', 'Vercel outputs dist');
  assert.ok(Array.isArray(vercel.headers), 'headers array configured');

  // Must have root revalidation and security headers
  const rootHeader = vercel.headers.find((h) => h.source === '/(.*)');
  assert.ok(rootHeader, 'root wildcard header exists');
  const rootCache = rootHeader.headers.find((kv) => kv.key === 'Cache-Control');
  assert.ok(rootCache && rootCache.value.includes('must-revalidate'), 'root must revalidate');
  const csp = rootHeader.headers.find((kv) => kv.key === 'Content-Security-Policy');
  assert.ok(csp && csp.value.includes("default-src 'self'"), 'strict CSP defined');

  // Must have immutable caching for hashed bundles
  const bundleHeader = vercel.headers.find((h) => h.source.includes('assets') && h.headers.some((kv) => kv.value.includes('immutable')));
  assert.ok(bundleHeader, 'hashed assets have immutable caching');

  // Must have portraits cache policy without immutable
  const portraitHeader = vercel.headers.find((h) => h.source.includes('portraits'));
  assert.ok(portraitHeader, 'portraits have dedicated caching header');
  const portraitCache = portraitHeader.headers.find((kv) => kv.key === 'Cache-Control');
  assert.ok(!portraitCache.value.includes('immutable'), 'unhashed portraits are not marked immutable');
  assert.ok(portraitCache.value.includes('stale-while-revalidate'), 'portraits support stale-while-revalidate');
});

test('save bundle schema contract: INAD_SAVE_BUNDLE schema is strictly schema 1', () => {
  const legalSrc = fs.readFileSync(path.join(root, 'src/data/legal-baseline.js'), 'utf8');
  assert.match(legalSrc, /saveSchema:\s*1\b/, 'legal baseline pins saveSchema to 1');
  const saveEngineSrc = fs.readFileSync(path.join(root, 'src/js/engines/save-engine.js'), 'utf8');
  assert.match(saveEngineSrc, /if\s*\(b\.schema\s*!==\s*1\)/, 'save engine strictly enforces schema 1');
});

test('v11: international case libraries ship as on-demand hashed files, not in the initial bundle', () => {
  const html = fs.readFileSync(distPath, 'utf8');
  const js = fs.readFileSync(path.join(distDir, html.match(/assets\/app\.[a-f0-9]+\.js/)[0]), 'utf8');
  const assets = fs.readdirSync(path.join(distDir, 'assets'));
  for (const cc of ['ca', 'gb', 'nz']) {
    const file = assets.find((f) => new RegExp(`^atlas-${cc}\\.[a-f0-9]{8}\\.js$`).test(f));
    assert.ok(file, `hashed ${cc} library present`);
    assert.ok(js.includes(`import("./${file}")`), `app loads ${file} on demand`);
    assert.ok(!html.includes(file), `${file} is not part of the initial HTML`);
  }
  // Authored overseas case text stays out of the entry bundle.
  assert.ok(!js.includes('Avery Morgan'), 'case content is not inlined into app bundle');
  const dynamicImports = [...js.matchAll(/import\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(dynamicImports.every((p) => /^\.\/atlas-(ca|gb|nz)\.[a-f0-9]{8}\.js$/.test(p)), `only case libraries are dynamic: ${dynamicImports}`);
});

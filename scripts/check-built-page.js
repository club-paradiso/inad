import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const builtPath = path.join(root, 'dist', 'index.html');

if (!fs.existsSync(builtPath)) {
  console.error('Built-page smoke check failed. dist/index.html does not exist.');
  process.exit(1);
}

const html = fs.readFileSync(builtPath, 'utf8');
const checks = [
  ['start overlay', /\bid=["']startOverlay["']/],
  ['start button', /\bid=["']startBtn["']/],
  ['optional UI isolation marker', /Optional UI enhancement disabled/],
  ['boot watchdog marker', /bootFailureNotice/],
  ['UI localization bundled', /inad-locale/],
  ['border-console shell bundled', /border-console-v3/],
  ['work manual bundled', /work-manual|workManual/]
];

const stripped = html.replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g, '');
const missing = checks.filter(([, pattern]) => !pattern.test(html)).map(([label]) => label);
// A computed `import(path)` survives bundling as a runtime request that 404s on the single-file
// release page. Every optional module has to be inlined by esbuild.
if (/\bimport\s*\(/.test(stripped)) missing.push('no unresolved dynamic import() in bundle');

if (missing.length) {
  console.error(`Built-page smoke check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Built-page smoke check OK (${checks.length} critical markers).`);

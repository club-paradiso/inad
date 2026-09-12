// Builds the standalone release artifact: dist/index.html (+ root index.html mirror).
// Source modules (src/) → one HTML file with inline CSS, inline JS (esbuild IIFE bundle) and inline
// WebP portraits. No external URLs, no runtime module imports, no server required.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const release = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;

function portraitDataModule() {
  const dir = path.join(src, 'assets/portraits');
  const map = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.webp')) continue;
    map[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
  }
  return { code: `export const PORTRAIT_DATA = ${JSON.stringify(map)};`, count: Object.keys(map).length };
}

export async function buildSingleHtml({ minify = true } = {}) {
  const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
  // CSS: inline every stylesheet in document order.
  const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
  const css = cssFiles.map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
  // JS: bundle ES modules into a classic IIFE, swapping the portrait module for inline data
  const portraits = portraitDataModule();
  const result = await build({
    entryPoints: [path.join(src, 'js/app.js')],
    bundle: true, format: 'iife', platform: 'browser', target: ['es2020'], write: false, minify, legalComments: 'none', charset: 'utf8',
    plugins: [{ name: 'inline-portraits', setup(b) { b.onLoad({ filter: /services[\\/]portrait-data\.js$/ }, () => ({ contents: portraits.code, loader: 'js' })); } }]
  });
  const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  let out = html
    .replace(/<link rel="stylesheet" href="[^"]+">\n?/g, '')
    .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
    .replace(/<script type="module" src="js\/app\.js"><\/script>/, `<script>\n${js}\n</script>`);
  const banner = `<!--\n  INAD: 제12조 v${release} — GENERATED FILE, DO NOT EDIT DIRECTLY.\n  Source of truth: src/ (build with \`npm run build\`).\n  Single-file release: inline CSS + JS + ${portraits.count} WebP portraits, no external resources.\n-->\n`;
  out = out.replace('<!doctype html>\n', '<!doctype html>\n' + banner);
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, 'index.html'), out);
  fs.writeFileSync(path.join(root, 'index.html'), out); // deployment mirror (Vercel serves root index.html)
  const size = Buffer.byteLength(out);
  console.log(`built dist/index.html (${(size / 1024).toFixed(0)} KB, ${portraits.count} portraits, minify=${minify}) + root index.html mirror`);
  return { size, portraits: portraits.count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSingleHtml({ minify: !process.argv.includes('--no-minify') }).catch((e) => { console.error(e); process.exit(1); });
}

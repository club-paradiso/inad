// Builds the modular static release artifact: dist/ (and root index.html mirror).
// Modular architecture:
// - Small HTML entry document (dist/index.html)
// - Content-hashed ESM JavaScript bundle (dist/assets/app.[hash].js)
// - Content-hashed CSS bundle (dist/assets/style.[hash].css)
// - Independent static WebP portraits (dist/assets/portraits/*.webp)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import { RELEASE } from '../src/data/legal-baseline.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const release = pkg.version;

export async function buildModularApp({ minify = true } = {}) {
  // 1. Prepare dist/ directory
  fs.rmSync(dist, { recursive: true, force: true });
  const assetsDir = path.join(dist, 'assets');
  const portraitsDistDir = path.join(assetsDir, 'portraits');
  fs.mkdirSync(portraitsDistDir, { recursive: true });

  // 2. Copy WebP portraits
  const portraitsSrcDir = path.join(src, 'assets/portraits');
  const portraitFiles = fs.readdirSync(portraitsSrcDir).filter((f) => f.endsWith('.webp')).sort();
  let totalPortraitBytes = 0;
  for (const f of portraitFiles) {
    const srcFile = path.join(portraitsSrcDir, f);
    const destFile = path.join(portraitsDistDir, f);
    fs.copyFileSync(srcFile, destFile);
    totalPortraitBytes += fs.statSync(destFile).size;
  }

  // 3. Bundle and minify CSS
  const htmlSrc = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
  const cssFiles = [...htmlSrc.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
  let combinedCss = cssFiles.map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
  if (minify) {
    combinedCss = (await transform(combinedCss, {
      loader: 'css',
      minify: true,
      legalComments: 'none',
      target: 'es2020'
    })).code;
  }
  const cssHash = crypto.createHash('sha256').update(combinedCss).digest('hex').slice(0, 8);
  const cssFileName = `style.${cssHash}.css`;
  fs.writeFileSync(path.join(assetsDir, cssFileName), combinedCss);

  // 4. International case libraries (src/data/atlas/<country>.js) are built as separate
  //    hashed ESM files and loaded on demand, so overseas content is not in the initial bundle.
  const libraryFiles = {};
  const chunkFiles = [];
  for (const cc of ['ca', 'gb', 'nz']) {
    const out = await build({ entryPoints: [path.join(src, `data/atlas/${cc}.js`)], bundle: true, format: 'esm', platform: 'browser', target: ['es2020'], minify, legalComments: 'none', charset: 'utf8', write: false });
    const code = out.outputFiles[0].text;
    const name = `atlas-${cc}.${crypto.createHash('sha256').update(code).digest('hex').slice(0, 8)}.js`;
    fs.writeFileSync(path.join(assetsDir, name), code);
    libraryFiles[cc] = name;
    chunkFiles.push({ name, bytes: Buffer.byteLength(code), gzip: zlib.gzipSync(code).byteLength });
  }
  const atlasLibraries = {
    name: 'atlas-libraries',
    setup(b) { b.onResolve({ filter: /data\/atlas\/(ca|gb|nz)\.js$/ }, (args) => ({ path: `./${libraryFiles[args.path.match(/(ca|gb|nz)\.js$/)[1]]}`, external: true })); }
  };

  // 5. Bundle and minify JS (ESM format)
  const esbuildResult = await build({
    entryPoints: { app: path.join(src, 'js/app.js') },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    minify,
    legalComments: 'none',
    charset: 'utf8',
    plugins: [atlasLibraries],
    write: false
  });
  let bundledJs = esbuildResult.outputFiles[0].text;
  const jsHash = crypto.createHash('sha256').update(bundledJs).digest('hex').slice(0, 8);
  const jsFileName = `app.${jsHash}.js`;
  fs.writeFileSync(path.join(assetsDir, jsFileName), bundledJs);

  // 6. Generate clean HTML entrypoint
  let cleanHtml = htmlSrc
    .replace(/<link rel="stylesheet" href="[^"]+">\n?/g, '')
    .replace(/<script type="module" src="[^"]+"><\/script>\n?/g, '');

  if (minify) {
    cleanHtml = cleanHtml.replace(/>\s+</g, '><').trim();
  }

  const cssLink = `<link rel="stylesheet" href="assets/${cssFileName}">`;
  const jsScript = `<script type="module" src="assets/${jsFileName}"></script>`;

  cleanHtml = cleanHtml
    .replace('</head>', () => `${cssLink}</head>`)
    .replace('</body>', () => `${jsScript}</body>`);

  const banner = `<!-- INAD v${release} — GENERATED FILE, DO NOT EDIT DIRECTLY. -->\n<!-- Legal baseline: ${RELEASE.legalBaseline} · Save schema: INAD_SAVE_BUNDLE -->\n`;
  cleanHtml = cleanHtml.replace(/<!doctype html>\s*/i, () => '<!doctype html>\n' + banner);

  fs.writeFileSync(path.join(dist, 'index.html'), cleanHtml);
  fs.writeFileSync(path.join(root, 'index.html'), cleanHtml); // repository root mirror

  // 6. Calculate sizes and metrics
  const htmlBytes = Buffer.byteLength(cleanHtml);
  const cssBytes = Buffer.byteLength(combinedCss);
  const jsBytes = Buffer.byteLength(bundledJs);
  const totalInitialUncompressed = htmlBytes + cssBytes + jsBytes;
  const totalInitialGzip = zlib.gzipSync(cleanHtml).byteLength + zlib.gzipSync(combinedCss).byteLength + zlib.gzipSync(bundledJs).byteLength;

  console.log(`Modular build complete:`);
  console.log(`  - dist/index.html: ${(htmlBytes / 1024).toFixed(1)} KB (mirror at ./index.html)`);
  console.log(`  - dist/assets/${cssFileName}: ${(cssBytes / 1024).toFixed(1)} KB`);
  console.log(`  - dist/assets/${jsFileName}: ${(jsBytes / 1024).toFixed(1)} KB (ESM)`);
  for (const c of chunkFiles) console.log(`  - dist/assets/${c.name}: ${(c.bytes / 1024).toFixed(1)} KB / ${(c.gzip / 1024).toFixed(1)} KB gz (on demand)`);
  console.log(`  - dist/assets/portraits/: ${portraitFiles.length} files (${(totalPortraitBytes / 1024).toFixed(0)} KB)`);
  console.log(`  - Initial transfer: ${(totalInitialUncompressed / 1024).toFixed(1)} KB uncompressed / ${(totalInitialGzip / 1024).toFixed(1)} KB gzipped`);

  return {
    htmlBytes,
    cssBytes,
    jsBytes,
    totalInitialUncompressed,
    totalInitialGzip,
    portraitCount: portraitFiles.length,
    totalPortraitBytes,
    cssFileName,
    jsFileName
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildModularApp({ minify: !process.argv.includes('--no-minify') }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

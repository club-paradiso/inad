import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const distDir = path.join(root, 'dist');
const builtPath = path.join(distDir, 'index.html');

if (!fs.existsSync(builtPath)) {
  console.error('Built-page smoke check failed. dist/index.html does not exist.');
  process.exit(1);
}

const html = fs.readFileSync(builtPath, 'utf8');
const missing = [];

// 1. Verify CSS reference and file existence
const cssMatch = html.match(/<link rel="stylesheet" href="(assets\/style\.[a-f0-9]+\.css)">/);
if (!cssMatch) {
  missing.push('hashed stylesheet link (assets/style.[hash].css)');
} else {
  const cssPath = path.join(distDir, cssMatch[1]);
  if (!fs.existsSync(cssPath) || fs.statSync(cssPath).size < 50000) {
    missing.push(`valid CSS asset file on disk (${cssMatch[1]})`);
  }
}

// 2. Verify ESM JS reference and file existence
const jsMatch = html.match(/<script type="module" src="(assets\/app\.[a-f0-9]+\.js)"><\/script>/);
if (!jsMatch) {
  missing.push('hashed ESM script tag (assets/app.[hash].js)');
} else {
  const jsPath = path.join(distDir, jsMatch[1]);
  if (!fs.existsSync(jsPath) || fs.statSync(jsPath).size < 300000) {
    missing.push(`valid JS asset file on disk (${jsMatch[1]})`);
  } else {
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    const jsChecks = [
      ['optional UI isolation marker', /Optional UI enhancement disabled/],
      ['boot watchdog marker', /bootFailureNotice/],
      ['UI localization bundled', /inad-locale/],
      ['work manual bundled', /work-manual|workManual/]
    ];
    for (const [label, pattern] of jsChecks) {
      if (!pattern.test(jsCode)) missing.push(label);
    }
    try {
      new vm.Script(jsCode, { filename: jsMatch[1] });
    } catch (e) {
      missing.push(`ESM bundle compiles (${e.message})`);
    }
  }
}

// 3. HTML DOM structure markers
const htmlChecks = [
  ['start overlay', /\bid=["']startOverlay["']/],
  ['start button', /\bid=["']startBtn["']/],
  ['adaptive task navigation present', /\bid=["']taskNav["']/]
];
for (const [label, pattern] of htmlChecks) {
  if (!pattern.test(html)) missing.push(label);
}

// 4. Portrait assets verification
const portraitsDir = path.join(distDir, 'assets/portraits');
if (!fs.existsSync(portraitsDir)) {
  missing.push('assets/portraits directory exists');
} else {
  const portraits = fs.readdirSync(portraitsDir).filter((f) => f.endsWith('.webp'));
  if (portraits.length !== 105) {
    missing.push(`105 portraits in assets/portraits (found ${portraits.length})`);
  }
}

if (missing.length) {
  console.error(`Built-page smoke check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Built-page smoke check OK (modular architecture, hashed assets, 105 portraits verified).`);

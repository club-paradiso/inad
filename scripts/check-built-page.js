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
  ['start screen', /\bid=["']startScreen["']/],
  ['start button', /\bid=["']startBtn["']/],
  ['optional UI isolation marker', /Optional UI enhancement disabled/],
  ['boot watchdog marker', /bootFailureNotice/]
];

const missing = checks.filter(([, pattern]) => !pattern.test(html)).map(([label]) => label);

if (missing.length) {
  console.error(`Built-page smoke check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Built-page smoke check OK (${checks.length} critical markers).`);

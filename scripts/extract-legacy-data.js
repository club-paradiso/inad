// One-off migration helper: extracts data tables and portraits from the recovered
// v6.1 single-file build into modular source files. Kept for provenance; the
// generated files under src/ are the source of truth after extraction.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const legacy = fs.readFileSync(path.join(root, 'legacy/v6.1/INAD_Article12_v6_1_KR.html'), 'utf8');

function grabArray(name) {
  const re = new RegExp(`^const ${name}=(\\[.*\\]);$`, 'm');
  const m = legacy.match(re);
  if (!m) throw new Error('not found: ' + name);
  return new Function('return ' + m[1])();
}

const CASES = grabArray('CASES');
const POOL = grabArray('TRAVELER_POOL');

// portraits → files
const portraitDir = path.join(root, 'src/assets/portraits');
fs.mkdirSync(portraitDir, { recursive: true });
let bytes = 0;
for (const t of POOL) {
  const m = t.portrait.match(/^data:image\/webp;base64,(.+)$/);
  if (!m) throw new Error('unexpected portrait format for ' + t.id);
  const buf = Buffer.from(m[1], 'base64');
  bytes += buf.length;
  fs.writeFileSync(path.join(portraitDir, `${t.id}.webp`), buf);
}
console.log('portraits written:', POOL.length, 'bytes:', bytes);

const header = (what) => `// GENERATED from legacy/v6.1 by scripts/extract-legacy-data.js — ${what}\n// Legal/game content must not be altered here without a documented review (see docs/legal-baseline.md).\n`;

const travelers = POOL.map(({ portrait, ...rest }) => rest);
fs.writeFileSync(
  path.join(root, 'src/data/travelers.js'),
  header('105 fictional travellers (portraits live in src/assets/portraits/<id>.webp)') +
    'export const TRAVELER_POOL = ' + JSON.stringify(travelers, null, 1) + ';\n'
);
fs.writeFileSync(
  path.join(root, 'src/data/cases.js'),
  header('12 core scripted cases') + 'export const CASES = ' + JSON.stringify(CASES, null, 1) + ';\n'
);
console.log('cases:', CASES.length, 'travelers:', travelers.length);

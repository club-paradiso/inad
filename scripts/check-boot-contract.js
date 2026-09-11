import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const htmlPath = path.join(root, 'src', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
  'startScreen',
  'startBtn',
  'sessionSeed',
  'helpBtn',
  'ruleBtn',
  'dailyBtn',
  'recordsBtn',
  'profileBtn',
  'settingsBtn',
  'systemBtn',
  'sourcesBtn',
  'procClose',
  'clearBtn',
  'secondaryBtn',
  'refuseBtn'
];

const missing = requiredIds.filter((id) => {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return !new RegExp(`\\bid=["']${escaped}["']`).test(html);
});

if (missing.length) {
  console.error(`Boot contract failed. Missing DOM IDs: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Boot contract OK (${requiredIds.length} required DOM IDs).`);

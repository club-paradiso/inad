import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const htmlPath = path.join(root, 'src', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
  'startOverlay',
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

// Beyond the core list: every id the UI dereferences without a null check (`byId('x').…`) must exist in
// src/index.html unless some module renders it itself (an `id="x"` in a template or `.id = 'x'`).
// A missing one throws during boot or on first use, which `npm run build` would otherwise not notice.
const jsFiles = [];
const walk = (dir) => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) jsFiles.push(p); } };
walk(path.join(root, 'src', 'js'));
const js = jsFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const rendered = new Set([...js.matchAll(/\bid=\\?["']([\w-]+)/g), ...js.matchAll(/\.id\s*=\s*["']([\w-]+)["']/g)].map((m) => m[1]));
const dereferenced = [...new Set([...js.matchAll(/byId\(\s*'([\w-]+)'\s*\)\.(?!\?)/g)].map((m) => m[1]))];
for (const id of dereferenced) if (!rendered.has(id) && !requiredIds.includes(id)) requiredIds.push(id);

const missing = requiredIds.filter((id) => {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return !new RegExp(`\\bid=["']${escaped}["']`).test(html);
});

if (missing.length) {
  console.error(`Boot contract failed. Missing DOM IDs: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Boot contract OK (${requiredIds.length} required DOM IDs).`);

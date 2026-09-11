// Lightweight lint (no dependency): syntax-check every module, forbid DOM access inside engines,
// forbid external URLs in source, and check that data files are not edited without the header.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let problems = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(path.join(root, 'src')).filter((f) => f.endsWith('.js'));
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { problems++; console.error('syntax:', path.relative(root, f), String(e.stderr)); }
  const text = fs.readFileSync(f, 'utf8'); const rel = path.relative(root, f), posixRel = rel.replaceAll('\\', '/');
  if (/\/engines\//.test(posixRel) && /\b(document\.|window\.|querySelector|getElementById|innerHTML)/.test(text)) { problems++; console.error('engine touches DOM:', rel); }
  // URLs are allowed only as citation text in the legal source registry; browser modules never call external origins.
  if (/https?:\/\/(?!www\.w3\.org)/.test(text) && !/data[\\/]legal-sources\.js$/.test(rel)) { problems++; console.error('external URL in source:', rel); }
  const hasNetworkApi = /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/.test(text);
  const approvedProxyClient = posixRel === 'src/js/services/airport-live.js';
  if (hasNetworkApi && !approvedProxyClient) { problems++; console.error('network API in source:', rel); }
  if (approvedProxyClient && (!text.includes('fetch(`/api/airport-load?') || /fetch\(\s*["']https?:/i.test(text))) { problems++; console.error('airport live client must use only same-origin /api/airport-load:', rel); }
  if (/console\.(log|debug)\(/.test(text)) { problems++; console.error('console.log left in source:', rel); }
}
for (const f of walk(path.join(root, 'src/data'))) { if (!fs.readFileSync(f, 'utf8').startsWith('//')) { problems++; console.error('data file without provenance header:', path.relative(root, f)); } }
if (problems) { console.error(`lint: ${problems} problem(s)`); process.exit(1); } else console.log(`lint: ${files.length} modules OK`);

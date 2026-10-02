// Minimal static file server (no dependencies). Used by `npm run dev`, Playwright and QA.
// Usage: node scripts/static-server.js <dir> <port>
//
// `/api/airport-load` is routed to the same server function Vercel runs (`api/airport-load.js`)
// so local play and E2E exercise the real same-origin proxy (the v10 `/api/npc` inference boundary likewise). Without a configured public-data
// key the function answers with its static-preset fallback, exactly like production.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import airportLoad from '../api/airport-load.js';
import npc from '../api/npc.js';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.map': 'application/json'
};

export function createStaticServer(dir, port, { quiet = false } = {}) {
  const rootDir = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/airport-load') {
      Promise.resolve(airportLoad(req, res)).catch(() => {
        if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'airport-load-failed' }));
      });
      return;
    }
    if (url.pathname === '/api/npc') {
      Promise.resolve(npc(req, res)).catch(() => {
        if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'npc-failed' }));
      });
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400, { 'content-type': 'text/plain' }); res.end('bad request'); return; }
    let file = path.join(rootDir, pathname);
    const rel = path.relative(rootDir, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) { res.writeHead(403); res.end(); return; }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const data = fs.readFileSync(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch (e) {
      // Browsers request /favicon.ico on their own. The release page carries an inline icon, but the frozen
      // v6.1 baseline (legacy/) has none: answer "no content" rather than a 404 console error in its E2E run.
      if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => { if (!quiet) console.log(`serving ${rootDir} at http://127.0.0.1:${port}/`); resolve(server); }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [dir = 'dist', port = '4173'] = process.argv.slice(2);
  createStaticServer(dir, Number(port));
}

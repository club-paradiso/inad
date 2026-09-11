// Minimal static file server (no dependencies). Used by `npm run dev`, Playwright and QA.
// Usage: node scripts/static-server.js <dir> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.map': 'application/json'
};

export function createStaticServer(dir, port, { quiet = false } = {}) {
  const rootDir = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.join(rootDir, decodeURIComponent(url.pathname));
    if (!file.startsWith(rootDir)) { res.writeHead(403); res.end(); return; }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const data = fs.readFileSync(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch (e) {
      res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => { if (!quiet) console.log(`serving ${rootDir} at http://127.0.0.1:${port}/`); resolve(server); }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [dir = 'dist', port = '4173'] = process.argv.slice(2);
  createStaticServer(dir, Number(port));
}

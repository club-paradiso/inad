// Deprecated: Single-file HTML build is retired as of PR #26.
// This wrapper delegates to scripts/build.js for backwards compatibility.
import { buildModularApp } from './build.js';

export async function buildSingleHtml(opts) {
  return buildModularApp(opts);
}

if (process.argv[1] && process.argv[1].endsWith('build-single-html.js')) {
  buildModularApp({ minify: !process.argv.includes('--no-minify') }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

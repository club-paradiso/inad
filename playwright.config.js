// Playwright E2E configuration.
// INAD_TARGET=dist   (default) → tests run against the built dist/index.html
// INAD_TARGET=legacy           → tests run against the recovered v6.1 baseline (legacy/v6.1)
// INAD_TARGET=src              → tests run against the modular dev source (src/)
import { defineConfig } from '@playwright/test';

const target = process.env.INAD_TARGET || 'dist';
const dirs = { dist: 'dist', legacy: 'legacy/v6.1', src: 'src' };
const files = { dist: 'index.html', legacy: 'INAD_Article12_v6_1_KR.html', src: 'index.html' };
const port = { dist: 4173, legacy: 4174, src: 4175 }[target];
process.env.INAD_ENTRY = `/${files[target]}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [['list']],
  outputDir: `test-results/${target}`,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1440, height: 1000 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'off', screenshot: 'off', video: 'off'
  },
  webServer: {
    command: `node scripts/static-server.js ${dirs[target]} ${port}`,
    url: `http://127.0.0.1:${port}${files[target] === 'index.html' ? '/' : '/' + files[target]}`,
    reuseExistingServer: true,
    timeout: 20_000
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});

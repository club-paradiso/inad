// Independent browser matrix for ATLAS. The default Chromium baseline stays untouched.
import { defineConfig } from '@playwright/test';
import baseline from './playwright.config.js';

const browserName = process.env.INAD_BROWSER;
if (!['firefox', 'webkit'].includes(browserName)) {
  throw new Error('Set INAD_BROWSER=firefox or INAD_BROWSER=webkit for cross-browser verification');
}

export default defineConfig({
  ...baseline,
  outputDir: `test-results/atlas-${browserName}`,
  projects: [{ name: browserName, use: { browserName } }]
});

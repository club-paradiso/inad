import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import * as H from './helpers.js';

const SEED = 223606;
const target = process.env.INAD_TARGET || 'dist';
const outDir = `test-results/${target}/screens`;

async function shot(page, name) {
  fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
}

async function noOverflow(page) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
  expect(o.sw, `horizontal overflow ${JSON.stringify(o)}`).toBeLessThanOrEqual(o.cw + 1);
}

for (const vp of [{ width: 1440, height: 1000 }, { width: 1024, height: 768 }]) {
  test(`visual smoke ${vp.width}×${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    const errors = await H.openGame(page);
    const tag = `${vp.width}`;
    await shot(page, `start-${tag}`);
    await noOverflow(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await noOverflow(page);
    await shot(page, `primary-${tag}`);
    // decision controls and core documents must be visible without page scrolling
    for (const sel of ['#clearBtn', '#secondaryBtn', '#refuseBtn', '#docview', '#pPortrait', '#questions']) await expect(page.locator(sel)).toBeInViewport();
    // v7.2 case header: stage stepper + lookup terminal stay visible alongside the decision desk
    const stepper = page.locator('#stepper');
    if (await stepper.count()) {
      for (const sel of ['#stepper', '#terminal', '#basisBoard']) await expect(page.locator(sel)).toBeInViewport();
      await expect(page.locator('#stepper li.on')).toHaveText('일반심사');
      await expect(page.locator('#caseId')).toContainText('심사번호');
      await page.locator('#wbTabEntry').click();
      await expect(page.locator('#entry')).toBeVisible();
      await page.locator('#wbTabDocs').click();
      await expect(page.locator('#docview')).toBeVisible();
    }
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-006');
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    if (await stepper.count()) await expect(page.locator('#stepper li.on')).toHaveText('입국재심');
    await shot(page, `secondary-${tag}`);
    await noOverflow(page);
    await H.procAct(page, 'back');
    const rIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-010');
    await H.jumpTo(page, rIdx);
    await H.ensureCommunication(page);
    await H.ask(page, 'refugee');
    await page.locator('#specialBtn').click();
    await H.procAct(page, 'refugee');
    await shot(page, `refugee-${tag}`);
    await noOverflow(page);
    await H.procAct(page, 'back');
    const fIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.jumpTo(page, fIdx);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'sjp');
    await shot(page, `sjp-${tag}`);
    await noOverflow(page);
    await H.procAct(page, 'back');
    const bIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.jumpTo(page, bIdx);
    await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await page.locator('#refuseBtn').click();
    await shot(page, `refusal-reasons-${tag}`);
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await H.continueDoc(page);
    await shot(page, `repatriation-${tag}`);
    await noOverflow(page);
    await page.locator('#procClose').click();
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('KeyU');
    await expect(page.locator('#modalTitle')).toContainText('프로필');
    await shot(page, `profile-${tag}`);
    await page.keyboard.press('Escape');
    await page.locator('#recordsBtn').click();
    await shot(page, `records-${tag}`);
    await page.keyboard.press('Escape');
    await page.keyboard.press('KeyS');
    await expect(page.locator('#modalTitle')).toHaveText('접근성·조작 설정');
    await shot(page, `settings-${tag}`);
    await page.keyboard.press('Escape');
    await noOverflow(page);
    await H.expectNoErrors(errors);
  });
}

test('campaign start screen', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.chooseStartOption(page, '[data-campaign="holiday"]');
  await expect(page.locator('#campaignPreview')).toContainText('DAY 3');
  await shot(page, 'campaign-start-1440');
  await H.expectNoErrors(errors);
});

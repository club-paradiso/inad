// UI language round trip: English → Korean must restore every Korean string exactly (the translation layer
// used to store its own half-translated writes as "originals"), and switching must not break controls.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const textOf = (page, sel) => page.locator(sel).evaluate((el) => el.innerText.replace(/\d{1,2}시 \d{1,2}분 \d{1,2}초|\d{2}:\d{2}:\d{2}|\d{2}:\d{2}/g, '#'));

test.describe('UI 언어 전환', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has no UI localisation');

  test('start screen and workstation text survive EN → KO unchanged; controls keep working', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#startLanguageBtn')).toBeVisible();
    await H.setSeed(page, 271828);
    const startKo = await textOf(page, '#startOverlay');
    await page.locator('#startLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#startBtn')).toHaveText('Start duty');
    await page.locator('#startLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await textOf(page, '#startOverlay')).toBe(startKo);
    await H.startShift(page);
    await H.ensureCommunication(page);
    await H.ask(page, 'purpose');
    const appKo = await textOf(page, '#app');
    await page.locator('#uiLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#stepper')).toContainText('Follow-up');
    await page.locator('#uiLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await textOf(page, '#app')).toBe(appKo);
    // controls still bound after two full translation passes
    await H.lookup(page, 'history');
    await expect(page.locator('#terminal')).toContainText('출입국기록');
    await H.expectNoErrors(errors);
  });
});

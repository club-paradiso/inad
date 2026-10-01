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
    // language of parts: Korean case data under lang=en is marked lang=ko; English UI copy is not
    await expect(page.locator('#log .msg.alien .msgtext').last()).toHaveAttribute('lang', 'ko');
    await expect(page.locator('#clearBtn strong')).not.toHaveAttribute('lang', 'ko');
    await expect(page.locator('#uiLanguageBtn')).toHaveAttribute('lang', 'ko');
    await page.locator('#uiLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('[data-i18n-lang]')).toHaveCount(0);
    expect(await textOf(page, '#app')).toBe(appKo);
    // controls still bound after two full translation passes
    await H.lookup(page, 'history');
    await expect(page.locator('#terminal')).toContainText('출입국기록');
    await H.expectNoErrors(errors);
  });

  test('English procedure screens and decision desk do not mix Korean UI copy into controls', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('inad-locale', 'en'));
    const errors = await H.openGame(page);
    await H.setSeed(page, 271828);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click(); await page.locator('#briefStart').click();
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'sjp');
    // controls only; language names and traveler data are content, not UI copy
    const korean = await page.evaluate(() => [...document.querySelectorAll('#procedureScreen button, #procedureScreen h2, .act, #actionHint')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()).filter((t) => /[가-힣]/.test(t) && !/^Call interpreter \(/.test(t)));
    expect(korean).toEqual([]);
    await H.expectNoErrors(errors);
  });
});

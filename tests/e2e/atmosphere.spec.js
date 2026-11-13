// Atmosphere layer (scene art, arrival beat, hall ambience, decision stamp). Presentation only: these tests pin
// that the layer exists, stays same-origin, follows the 음향 switch, and never changes what a decision records.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';

test.describe('현장감 레이어', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has no atmosphere layer');

  test('start screen shows the hall scene and every request stays same-origin', async ({ page }) => {
    const origins = new Set();
    page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http')) origins.add(u.origin); });
    const errors = await H.openGame(page);
    const scene = page.locator('.start-scene');
    await expect(scene).toBeVisible();
    await expect.poll(() => scene.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    expect(await scene.getAttribute('alt')).toBe(''); // decorative: the heading carries the content
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect([...origins]).toEqual([new URL(page.url()).origin]);
    await H.expectNoErrors(errors);
  });

  test('a called passenger arrives at an empty lane, and skipping the call ends the beat at once', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, 271828);
    await H.startShift(page);
    const stage = page.locator('#passengerStage');
    await expect(stage).toHaveClass(/arriving/);
    expect(await stage.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('assets/scenes/lane.webp');
    await page.locator('#skipCall').click();
    await expect(stage).not.toHaveClass(/arriving/);
    await expect(page.locator('#stagePortrait')).toHaveCSS('opacity', '1');
    await H.expectNoErrors(errors);
  });

  test('hall ambience runs only during a duty and follows the 음향 switch', async ({ page }) => {
    const errors = await H.openGame(page);
    expect(await H.hook(page, (T) => T.ambience())).toMatchObject({ wanted: false, loaded: false });
    await H.setSeed(page, 271828);
    await H.startShift(page);
    await expect.poll(() => H.hook(page, (T) => T.ambience().wanted)).toBe(true);
    const a = await H.hook(page, (T) => T.ambience());
    expect(a.loaded).toBe(true);
    expect(a.src).toMatch(/^assets\/audio\/hall-ambience\.(ogg|m4a)$/);
    await page.locator('#audioBtn').click();
    await expect(page.locator('#audioBtn')).toHaveAttribute('aria-pressed', 'false');
    expect(await H.hook(page, (T) => T.ambience().wanted)).toBe(false);
    await expect.poll(() => H.hook(page, (T) => T.ambience().paused), { timeout: 4000 }).toBe(true);
    await H.expectNoErrors(errors);
  });

  test('the admit document carries a decision stamp and the record is unchanged by it', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.hook(page, (T) => T.live());
    await expect(page.locator('#clearBtn')).toBeVisible();
    await page.locator('#clearBtn').click();
    // guided first case: one coaching guard, then the decision stands
    if (await page.locator('#modalClose').isVisible().catch(() => false)) { await page.locator('#modalClose').click(); await page.locator('#clearBtn').click(); }
    const stamp = page.locator('.docmodal .decision-stamp.admit');
    await expect(stamp).toBeVisible();
    await expect(stamp).toHaveAttribute('aria-hidden', 'true'); // the table row states the decision for assistive tech
    await expect(page.locator('.docmodal table')).toContainText('입국 허가');
    expect((await H.getState(page)).stage).toBe('ADMITTED');
    // the duty ends on the result screen: the hall loop stops there even though the session object stays started
    expect(await H.hook(page, (T) => T.ambience().wanted)).toBe(true);
    await page.locator('#docContinue').click();
    await expect(page.locator('.decision-stamp')).toHaveCount(0);
    expect(await H.hook(page, (T) => T.ambience().wanted)).toBe(false);
    await H.expectNoErrors(errors);
  });

  test('high contrast removes every scene image', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.evaluate(() => document.body.classList.add('pref-contrast'));
    await expect(page.locator('.start-scene')).toBeHidden();
    await H.setSeed(page, 271828);
    await H.startShift(page);
    expect(await page.locator('#passengerStage').evaluate((el) => getComputedStyle(el).backgroundImage)).toBe('none');
    await page.locator('#skipCall').click();
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    expect(await page.locator('#procedureScreen .proc-head').evaluate((el) => getComputedStyle(el).backgroundImage)).toBe('none');
    await H.expectNoErrors(errors);
  });
});

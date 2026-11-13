// v14 start screen: one dominant action that follows the player's progress, everything else behind one disclosure.
// These tests load the page directly (no helper) so they see exactly what a player sees.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const visibleControls = (page) => page.evaluate(() => [...document.querySelectorAll('#startOverlay button, #startOverlay summary')].filter((e) => e.checkVisibility({ contentVisibilityAuto: true })).map((e) => e.id || e.textContent.trim()));

test.describe('시작 화면 · 진행 순서', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has a different start screen');

  test('a first-time player sees the path, the language switch and one disclosure — nothing else', async ({ page }) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(ENTRY);
    await expect(page.locator('#liveStartBtn')).toBeVisible();
    expect(await visibleControls(page)).toEqual(['startLanguageBtn', 'liveStartBtn', 'quickStartBtn', 'startBtn', 'startMoreSummary']);
    await expect(page.locator('.start-step[aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('.start-step[data-step="first"]')).toHaveAttribute('data-state', 'next');
    await expect(page.locator('.start-step[data-step="first"] [data-step-state]')).toHaveText('다음 순서');
    await expect(page.locator('.start-side')).toBeHidden();
    // the next step's button is the largest control on the screen
    const sizes = await page.evaluate(() => Object.fromEntries(['liveStartBtn', 'quickStartBtn', 'startBtn'].map((id) => [id, parseFloat(getComputedStyle(document.getElementById(id)).fontSize)])));
    expect(sizes.liveStartBtn).toBeGreaterThan(sizes.quickStartBtn); expect(sizes.liveStartBtn).toBeGreaterThan(sizes.startBtn);
    // one click reveals the rest, in place
    await page.locator('#startMoreSummary').click();
    await expect(page.locator('#dailyCaseBtn')).toBeVisible();
    await expect(page.locator('#atlasStartCountry')).toBeVisible();
    await expect(page.locator('#setupBar')).toBeVisible();
    await expect(page.locator('.start-side')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('no step is locked: a newcomer can start the regular duty', async ({ page }) => {
    await page.goto(ENTRY);
    await page.locator('#startBtn').click();
    await expect(page.locator('#briefStart')).toBeVisible();
  });

  test('finishing the first interview moves the next step to the short duty', async ({ page }) => {
    await page.goto(ENTRY);
    await page.locator('#liveStartBtn').click();
    await page.locator('#clearBtn').click();
    if (await page.locator('#modalClose').isVisible().catch(() => false)) { await page.locator('#modalClose').click(); await page.locator('#clearBtn').click(); }
    await page.locator('#docContinue').click();
    await expect(page.locator('#liveExit')).toBeVisible();
    await page.locator('#liveExit').click();
    await expect(page.locator('#quickStartBtn')).toBeVisible();
    await expect(page.locator('.start-step[data-step="first"]')).toHaveAttribute('data-state', 'done');
    await expect(page.locator('.start-step[data-step="quick"]')).toHaveAttribute('data-state', 'next');
    await expect(page.locator('.start-step[data-step="quick"]')).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('.start-side')).toBeVisible(); // a returning player gets missions and records back
    await page.locator('#liveStartBtn').click(); // a finished step can be replayed
    await expect(page.locator('#caseName')).toContainText('시티 라흐마');
  });

  test('the path fits every form factor without horizontal scroll and with touch-sized steps', async ({ page }) => {
    for (const [w, h] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(ENTRY);
      await expect(page.locator('#liveStartBtn')).toBeVisible();
      const m = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - window.innerWidth, heights: ['startLanguageBtn', 'liveStartBtn', 'quickStartBtn', 'startBtn', 'startMoreSummary'].map((id) => Math.round(document.getElementById(id).getBoundingClientRect().height)), clash: (() => { const a = document.getElementById('startLanguageBtn').getBoundingClientRect(), b = document.querySelector('.startmark').getBoundingClientRect(); return !(a.left >= b.right || a.right <= b.left || a.top >= b.bottom || a.bottom <= b.top); })() }));
      expect(m.overflow, `${w}px overflow`).toBeLessThanOrEqual(0);
      for (const hgt of m.heights) expect(hgt, `${w}px control height`).toBeGreaterThanOrEqual(44);
      expect(m.clash, `${w}px language button over the first hero line`).toBe(false);
    }
  });
});

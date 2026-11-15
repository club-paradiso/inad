// First visits show one start action. Returning players see the next duty and their other modes.
// These tests load the page directly (no helper) so they see exactly what a player sees.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const visibleControls = (page) => page.evaluate(() => [...document.querySelectorAll('#startOverlay button, #startOverlay summary')].filter((e) => e.checkVisibility({ contentVisibilityAuto: true })).map((e) => e.id || e.textContent.trim()));

test.describe('시작 화면 · 진행 순서', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has a different start screen');

  test('a first-time player sees one start action, the language switch and one disclosure', async ({ page }) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(ENTRY);
    await expect(page.locator('#liveStartBtn')).toBeVisible();
    expect(await visibleControls(page)).toEqual(['startLanguageBtn', 'liveStartBtn', 'startMoreSummary']);
    await expect(page.locator('#startMore')).not.toHaveAttribute('open', '');
    await expect(page.locator('#liveStartBtn')).toHaveText('첫 심사 시작하기');
    await expect(page.locator('#liveStartBtn')).toHaveAccessibleDescription('승객 1명 · 약 5분');
    await expect(page.locator('#startOverlay .startbtn')).toHaveCount(1);
    await expect(page.locator('#liveStartBtn')).toHaveClass(/\bstartbtn\b/);
    await expect(page.locator('.start-step[aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('.start-step[data-step="first"]')).toHaveAttribute('data-state', 'next');
    await expect(page.locator('.start-side')).toBeHidden();
    await expect(page.locator('#startReleaseChip')).toBeHidden();
    await page.locator('#startMoreSummary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#startMore')).toHaveAttribute('open', '');
    await expect(page.locator('#startMore #quickStartBtn')).toBeVisible();
    await expect(page.locator('#startMore #startBtn')).toBeVisible();
    await expect(page.locator('#dailyCaseBtn')).toBeVisible();
    await expect(page.locator('#atlasStartCountry')).toBeVisible();
    await expect(page.locator('#setupBar')).toBeVisible();
    await expect(page.locator('#startMore .start-side')).toBeVisible();
    await expect(page.locator('#startMore .start-notice > summary')).toBeVisible();
    await expect(page.locator('#startOverlay .startbtn')).toHaveCount(1);
    await page.locator('#startMoreSummary').click();
    expect(await visibleControls(page)).toEqual(['startLanguageBtn', 'liveStartBtn', 'startMoreSummary']);
    expect(errors).toEqual([]);
  });

  test('no step is locked: a newcomer can start the regular duty', async ({ page }) => {
    await page.goto(ENTRY);
    await page.locator('#startMoreSummary').click();
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
    await expect(page.locator('#startBtn')).toBeVisible();
    await expect(page.locator('#startOverlay .startbtn')).toHaveCount(1);
    await expect(page.locator('#quickStartBtn')).toHaveClass(/\bstartbtn\b/);
    await expect(page.locator('#startPath > li:first-child button')).toHaveAttribute('id', 'quickStartBtn');
    await expect(page.locator('.start-step[data-step="first"]')).toHaveAttribute('data-state', 'done');
    await expect(page.locator('.start-step[data-step="quick"]')).toHaveAttribute('data-state', 'next');
    await expect(page.locator('.start-step[data-step="quick"]')).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('.start-body > .start-side #dailyStart')).toBeVisible();
    await page.locator('#liveStartBtn').click(); // a finished step can be replayed
    await expect(page.locator('#caseName')).toContainText('시티 라흐마');
  });

  test('the fresh intro fits the first viewport with touch-sized controls', async ({ page }) => {
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(ENTRY);
      await expect(page.locator('.start-title')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.start-explain')).toBeInViewport({ ratio: 1 });
      for (const id of ['startLanguageBtn', 'liveStartBtn', 'startMoreSummary']) {
        const control = page.locator(`#${id}`);
        await expect(control).toBeInViewport({ ratio: 1 });
        expect((await control.boundingBox()).height, `${width}px · ${id} height`).toBeGreaterThanOrEqual(44);
      }
      const layout = await page.locator('.startcard').evaluate((card) => ({
        horizontalOverflow: card.scrollWidth - card.clientWidth,
        verticalOverflow: card.scrollHeight - card.clientHeight,
        pageOverflow: document.documentElement.scrollWidth - window.innerWidth
      }));
      expect(layout, `${width}px · initial layout`).toEqual({ horizontalOverflow: 0, verticalOverflow: 0, pageOverflow: 0 });
    }
  });
});

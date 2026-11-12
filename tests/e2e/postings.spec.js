// v13 정규 근무 배치: one choice sets the duty conditions; the briefing says what an officer needs and no more.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v13 only');

test.describe('정규 근무 배치', () => {
  test('a posting sets difficulty, scenario and guidance together; the option grids show the same state', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#postingDetails')).not.toHaveAttribute('open', /.*/);
    await page.locator('#postingDetails > summary').click();
    const postings = page.locator('#postingGrid .posting-btn');
    await expect(postings).toHaveCount(6);
    await expect(page.locator('.posting-btn[data-posting="trainee"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.posting-btn[data-posting="trainee"]')).toContainText('다음 배치로 권장');
    await page.locator('.posting-btn[data-posting="night"]').click();
    await expect(page.locator('.posting-btn[data-posting="night"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.posting-btn[aria-pressed="true"]')).toHaveCount(1);
    const st = await H.getState(page);
    expect(st.difficulty).toBe('standard'); expect(st.scenarioId).toBe('night');
    await page.locator('#setupAdvancedToggle').click();
    await expect(page.locator('[data-difficulty="standard"]')).toHaveClass(/on/);
    await expect(page.locator('[data-scenario="night"]')).toHaveClass(/on/);
    await expect(page.locator('[data-guidance="expert"]')).toHaveClass(/on/);
    // changing one option by hand leaves no posting selected, and says so
    await page.locator('[data-scenario="interpreter"]').click();
    await expect(page.locator('.posting-btn[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#postingNote')).toContainText('직접 구성한 조건');
    await page.locator('.posting-btn[data-posting="day"]').click();
    await expect(page.locator('[data-scenario="normal"]')).toHaveClass(/on/);
    await H.expectNoErrors(errors);
  });

  test('the briefing leads with the duty at hand and does not count the passengers that hide a problem', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#postingDetails')).not.toHaveAttribute('open', /.*/);
    await page.locator('#postingDetails > summary').click();
    await page.locator('.posting-btn[data-posting="day"]').click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#briefStart')).toBeVisible();
    const body = page.locator('#modalBody');
    await expect(body.locator('.briefkpi')).toHaveCount(4);
    await expect(body.locator('.briefkpi').first()).toContainText('36');
    await expect(body).not.toContainText('추가확인 변형');
    await expect(body.locator('.brief-detail')).not.toHaveAttribute('open', /.*/);
    await body.locator('.brief-detail > summary').click();
    await expect(body.locator('.brief-detail .shift-target')).toContainText('근무 배치 번호');
    await page.locator('#briefStart').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    // no screen tour on a posting without coaching; three decisions at the primary desk
    await expect(page.locator('#tutorialLayer')).not.toHaveClass(/show|on/);
    await expect(page.locator('#sjpBtn')).toBeHidden();
    for (const id of ['#clearBtn', '#secondaryBtn', '#refuseBtn']) await expect(page.locator(id)).toBeVisible();
    await H.expectNoErrors(errors);
  });

  test('390px: postings fit without horizontal scroll and are 44px touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await H.openGame(page);
    await page.locator('#postingDetails > summary').click();
    const sizes = await page.locator('#postingGrid .posting-btn').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

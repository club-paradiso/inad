// Accessibility structure: what is reachable, where focus lands, what assistive technology hears.
// Each test pins one audited defect (start screen leak, focus lost after every passenger, tutorial focus,
// unlabelled switches, uncontrollable single-key shortcuts, tab pattern, live-region re-announcement,
// colour-only strike count, invisible call-out Tab stop).
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 271828;
const target = process.env.INAD_TARGET || 'dist';
const activeId = (page) => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);

test.describe('접근성 구조', () => {
  test.skip(target === 'legacy', 'v6.1 baseline predates these accessibility fixes');

  test('the workstation behind the start screen is inert until the shift starts', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#app')).toHaveJSProperty('inert', true);
    await expect(page.locator('#skipLink')).toHaveJSProperty('inert', true);
    // the first Tab stop is on the start screen, not a hidden workstation control
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('#startOverlay'))).toBe(true);
    // a dialog over the start screen keeps the workstation inert after it closes
    await page.locator('#startSettingsBtn').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).not.toHaveClass(/on/);
    await expect(page.locator('#app')).toHaveJSProperty('inert', true);
    await H.startShift(page);
    await expect(page.locator('#app')).toHaveJSProperty('inert', false);
    await expect(page.locator('#skipLink')).toHaveJSProperty('inert', false);
    await H.expectNoErrors(errors);
  });

  test('after each decided passenger focus moves to the next passenger, never <body> or a decision button', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await expect.poll(() => activeId(page)).toBe('caseName');
    await H.solveNormalCase(page);
    await page.locator('#nextCase').focus();
    await page.keyboard.press('Enter');
    await H.afterNext(page);
    expect((await H.getState(page)).caseIndex).toBe(1);
    await expect.poll(() => activeId(page)).toBe('caseName');
    await H.expectNoErrors(errors);
  });

  test('the guided tour keeps Tab inside its card and returns focus when it ends', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page, { guidance: 'guided' });
    await expect(page.locator('#tutorialLayer')).toHaveClass(/on/, { timeout: 5000 });
    await expect.poll(() => activeId(page)).toBe('tutorialNext');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('#tutorialCard'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#tutorialLayer')).not.toHaveClass(/on/);
    await expect.poll(() => activeId(page)).toBe('caseName');
    await H.expectNoErrors(errors);
  });

  test('settings switches are named by their setting; single-key shortcuts can be turned off', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await page.locator('#moreBtn').click();
    await page.locator('#settingsBtn').click();
    for (const name of ['고대비', '애니메이션 감소', '단축키 표시', '단축키 사용']) await expect(page.getByRole('switch', { name, exact: true })).toBeVisible();
    const shortcuts = page.getByRole('switch', { name: '단축키 사용', exact: true });
    await expect(shortcuts).toHaveAttribute('aria-checked', 'true');
    await shortcuts.click();
    await expect(shortcuts).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => localStorage.getItem('inad-shortcuts'))).toBe('0');
    await page.keyboard.press('Escape');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('KeyH');
    await page.keyboard.press('KeyL');
    await expect(page.locator('#terminal .line:not(.empty)')).toHaveCount(0);
    await expect(page.locator('#modal')).not.toHaveClass(/on/);
    // F1 is not a character key and keeps working
    await page.keyboard.press('F1');
    await expect(page.locator('#modal')).toHaveClass(/on/);
    await H.expectNoErrors(errors);
  });

  test('single-key shortcuts never act behind an open dialog', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await page.locator('#refuseBtn').click();
    const title = await page.locator('#modalTitle').textContent();
    const audio = await page.locator('#audioBtn').getAttribute('aria-pressed');
    await page.keyboard.press('KeyL');
    await page.keyboard.press('KeyM');
    await expect(page.locator('#modalTitle')).toHaveText(title);
    await expect(page.locator('#audioBtn')).toHaveAttribute('aria-pressed', audio);
    await H.expectNoErrors(errors);
  });

  test('question and document tabs follow the tab pattern (one Tab stop, arrows move and select)', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    const tabs = page.locator('#qtabs [role="tab"]');
    await expect(page.locator('#qtabs [role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(page.locator('#questions')).toHaveAttribute('role', 'tabpanel');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(page.locator('#questions')).toHaveAttribute('aria-labelledby', await tabs.nth(1).getAttribute('id'));
    await page.keyboard.press('Home');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await page.locator('#wbTabDocs').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#wbTabEntry')).toBeFocused();
    await expect(page.locator('#wbTabEntry')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#wbPaneEntry')).toBeVisible();
    await expect(page.locator('#wbTabDocs')).toHaveAttribute('tabindex', '-1');
    await H.expectNoErrors(errors);
  });

  test('the transcript and lookup results only append new lines (live regions do not re-announce history)', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await H.ensureCommunication(page);
    await page.evaluate(() => { document.querySelectorAll('#log .msg').forEach((m) => { m.dataset.seen = '1'; }); });
    const before = await page.locator('#log .msg').count();
    await H.ask(page, 'purpose');
    await expect.poll(() => page.locator('#log .msg').count()).toBeGreaterThan(before);
    await expect(page.locator('#log .msg[data-seen="1"]')).toHaveCount(before);
    await H.lookup(page, 'history');
    await page.evaluate(() => { document.querySelectorAll('#terminal .line').forEach((m) => { m.dataset.seen = '1'; }); });
    await H.lookup(page, 'visa');
    await expect(page.locator('#terminal .line[data-seen="1"]')).toHaveCount(1);
    await expect(page.locator('#terminal .line')).toHaveCount(2);
    // same content and order as a full render: newest result first, no line twice
    const lines = await page.locator('#terminal .line > span:first-child').allInnerTexts();
    expect(lines).toEqual(['사증·입국자격', '출입국기록']);
    // if the rendered lines no longer match what was tracked, the next render rebuilds the list in full
    await page.locator('#terminal').evaluate((el) => el.replaceChildren());
    await H.lookup(page, 'pnr');
    expect(await page.locator('#terminal .line > span:first-child').allInnerTexts()).toEqual(['항공 PNR', '사증·입국자격', '출입국기록']);
    await H.expectNoErrors(errors);
  });

  test('the strike count is text and has one mark per allowed strike of the difficulty', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.chooseStartOption(page, '[data-difficulty="training"]');
    await H.startShift(page);
    await expect(page.locator('.statusbar .strike-count')).toHaveText('0/6');
    await expect(page.locator('.statusbar .strike-dots .strike')).toHaveCount(6);
    await page.locator('#clearBtn').click(); // admitting before the required checks is an inspection error
    await expect.poll(async () => (await H.getState(page)).strikes).toBe(1);
    await expect(page.locator('.statusbar .strike-count')).toHaveText('1/6');
    await expect(page.locator('.statusbar .strike-dots .strike.on')).toHaveCount(1);
    await H.expectNoErrors(errors);
  });

  test('the call-out card is not an invisible Tab stop', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await expect(page.locator('#callout')).not.toHaveClass(/on/, { timeout: 4000 });
    await expect(page.locator('#callout')).toHaveCSS('visibility', 'hidden');
    await expect(page.locator('#callout')).not.toHaveAttribute('role', 'status');
    await H.expectNoErrors(errors);
  });
});

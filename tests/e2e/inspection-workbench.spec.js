import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'New workbench; frozen legacy remains unchanged');

test('reopening a saved record is free and focuses the existing result', async ({ page }) => {
  const errors = await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await H.lookup(page, 'visa');
  const before = await H.getState(page);
  const lines = await page.locator('#terminal .line').count();
  await page.locator('.lookup-tabs [data-lu="visa"]').click();
  const after = await H.getState(page);
  expect(after.performed).toEqual(before.performed);
  expect(before.caseWorkSeconds).toBeGreaterThan(0);
  expect(after.caseWorkSeconds).toEqual(before.caseWorkSeconds);
  expect(after.repeatedLookups).toEqual(before.repeatedLookups);
  expect(after.score).toEqual(before.score);
  await expect(page.locator('#terminal .line')).toHaveCount(lines);
  await expect(page.locator('#terminal [data-lookup-kind="visa"]')).toBeFocused();
  await expect(page.locator('.lookup-tabs [data-lu="visa"]')).toContainText('결과 보기');
  await H.expectNoErrors(errors);
});

test('pending-fact navigation reveals a tool without silently running it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await page.locator('#taskNav [data-task="assessment"]').click();
  const before = await H.getState(page);
  await page.locator('[data-fact="입국자격"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-task', 'evidence');
  await expect(page.locator('.lookup-tabs [data-lu="visa"]')).toBeFocused();
  expect((await H.getState(page)).looked).toEqual(before.looked);
  expect((await H.getState(page)).caseWorkSeconds).toEqual(before.caseWorkSeconds);
  await H.expectNoErrors(errors);
});

for (const width of [1440, 1024, 768, 390]) {
  test(`inspection workbench ${width}: readable controls, no overflow, captured states`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors = await H.openGame(page);
    await expect(page.locator('#postingDetails')).not.toHaveAttribute('open', /.*/);
    await page.screenshot({ path: testInfo.outputPath(`start-${width}.png`) });
    await page.locator('#liveStartBtn').click();
    if (width < 1024) await page.locator('#taskNav [data-task="evidence"]').click();
    await H.lookup(page, 'history');
    await H.lookup(page, 'pnr');
    const sizes = await page.locator('.lookup-tabs button').evaluateAll((buttons) => buttons.map((button) => {
      const r = button.getBoundingClientRect(); return { width: r.width, height: r.height };
    }));
    for (const size of sizes) { expect(size.width).toBeGreaterThanOrEqual(44); expect(size.height).toBeGreaterThanOrEqual(44); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#terminal').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`records-${width}.png`) });
    if (width < 768) await page.locator('#taskNav [data-task="assessment"]').click();
    await page.screenshot({ path: testInfo.outputPath(`assessment-${width}.png`) });
    await H.expectNoErrors(errors);
  });
}

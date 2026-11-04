import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Inspection guidance belongs to the modular workbench.');

async function start(page) {
  await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('body')).toHaveClass(/mode-case/);
}

test('locked questions explain real prerequisites and navigate to the existing lookup without auto-running it', async ({ page }) => {
  await start(page);
  await page.locator('#qtabs .qtab[data-cat="추가소명"]').click();
  const locked = page.locator('#questions .qbtn[data-qid="jobOffer"]');
  await expect(locked).toBeDisabled();
  const details = locked.locator('xpath=following-sibling::*[1]');
  await expect(details).toHaveClass(/question-prereqs/);
  await expect(details).toContainText('국내관계');
  await expect(details).not.toContainText('공장 일');
  const before = await H.getState(page);
  await details.getByRole('button', { name: '조회 화면 열기' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-task', 'evidence');
  await expect(page.locator('.lookup-tabs [data-lu="contact"]')).toBeFocused();
  const after = await H.getState(page);
  expect(after.looked).toEqual(before.looked);
  expect(after.asked).toEqual(before.asked);
});

test('document review notes have their own lifecycle and deep link to real public-source work guidance', async ({ page }) => {
  await start(page);
  const before = await H.getState(page);
  await expect(page.locator('#docReviewDone')).toBeVisible();
  await expect(page.locator('#docview .doc-review-checks li')).toHaveCount(3);
  await page.locator('#docReviewDone').click();
  await expect(page.locator('#docReviewDone')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#doclist .docitem').first()).toContainText('대조 기록');
  const marked = await H.getState(page);
  expect(marked.documentReviews['0']).toBe('reviewed');
  expect(marked.performed).toEqual(before.performed);
  expect(marked.asked).toEqual(before.asked);
  expect(marked.score).toBe(before.score);
  await page.locator('#docGuideBtn').click();
  await expect(page.locator('#modalTitle')).toContainText('입국심사 기본 확인 순서');
  await expect(page.locator('#modalBody')).toContainText('근거 확인');
  await page.locator('#modalClose').click();
  await page.locator('#docReviewFollowup').click();
  expect((await H.getState(page)).documentReviews['0']).toBe('followup');
  await page.locator('#docReviewClear').click();
  expect((await H.getState(page)).documentReviews['0']).toBeUndefined();
  await page.locator('#docReviewDone').click();
  await page.evaluate(() => window.INADTest.jump(0));
  await expect(page.locator('#docReviewDone')).toHaveAttribute('aria-pressed', 'false');
  expect((await H.getState(page)).documentReviews).toEqual({});
});

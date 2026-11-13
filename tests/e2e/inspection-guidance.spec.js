import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Inspection guidance belongs to the modular workbench.');

async function start(page) {
  await H.openGame(page);
  await H.startLiveCase(page); // ICN-S2-005 vertical slice
  await expect(page.locator('body')).toHaveClass(/mode-case/);
}

test('questions are askable in any order: an early follow-up stays withheld until its evidence exists', async ({ page }) => {
  await start(page);
  await page.locator('#qtabs .qtab[data-cat="추가소명"]').click();
  const deep = page.locator('#questions .qbtn[data-qid="jobOffer"]');
  // No lock: the button is enabled and shows the real question from the start.
  await expect(deep).toBeEnabled();
  await expect(deep).toContainText('일자리');
  await expect(page.locator('#questions .question-prereqs')).toHaveCount(0);
  const before = await H.getState(page);
  await deep.click();
  // The passenger stays with what is on record: nothing is marked asked/performed, no clue leaks.
  const afterEarly = await H.getState(page);
  expect(afterEarly.asked).toEqual(before.asked);
  expect(afterEarly.performed).toEqual(before.performed);
  await expect(page.locator('#log .msg.alien').last()).toBeVisible();
  // Do the real work in a different order than the catalogue implies, then ask again.
  await page.evaluate(() => window.INADTest.say('방문 목적이 뭡니까', 'text'));
  await page.locator('#langInterp').click(); // occupation needs the interpreter in this case
  await page.evaluate(() => window.INADTest.say('베트남에서 무슨 일 하세요?', 'text'));
  await page.locator('.lookup-tabs [data-lu="contact"]').click();
  await page.locator('#qtabs .qtab[data-cat="추가소명"]').click();
  await page.locator('#questions .qbtn[data-qid="jobOffer"]').click();
  const done = await H.getState(page);
  expect(done.asked).toContain('jobOffer');
});

test('document review is recorded automatically; the follow-up flag is the only manual mark', async ({ page }) => {
  await start(page);
  await page.locator('#doclist .docitem').nth(1).click();
  const opened = await H.getState(page);
  expect(opened.performed).toContain('DOC_READ_1');
  await expect(page.locator('#doclist .docitem').nth(1)).toContainText('열람됨');
  // Enlarging a document records an enlarged review, not evidentiary corroboration.
  await page.locator('#docZoom').click();
  await expect(page.locator('#modalTitle')).toContainText('문서 확대');
  await page.locator('#modalClose').click();
  const zoomed = await H.getState(page);
  expect(zoomed.documentReviews['1']).toBe('reviewed');
  expect(zoomed.performed).toEqual(opened.performed);
  expect(zoomed.score).toBe(opened.score);
  await expect(page.locator('#doclist .docitem').nth(1)).toContainText('확대 검토');
  await expect(page.locator('#docReviewDone')).toHaveCount(0);
  await expect(page.locator('#docReviewClear')).toHaveCount(0);
  await expect(page.locator('#docview .doc-review-checks li')).toHaveCount(3);
  // The one remaining manual control flags the document for follow-up (and unflags it).
  await page.locator('#docReviewFollowup').click();
  expect((await H.getState(page)).documentReviews['1']).toBe('followup');
  await page.locator('#docReviewFollowup').click();
  expect((await H.getState(page)).documentReviews['1']).toBeUndefined();
  await page.locator('#docGuideBtn').click();
  await expect(page.locator('#modalTitle')).toContainText('입국심사 기본 확인 순서');
  await expect(page.locator('#modalBody')).toContainText('근거 확인');
});

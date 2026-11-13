import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip((process.env.INAD_TARGET || 'dist') === 'legacy', 'evidence-fidelity and re-presentation interactions are new-game features');

test('passport re-presentation logs once and keeps score, decision and keyboard context unchanged', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 271828);
  await H.startShift(page);
  await expect(page.locator('#docRequestOriginal')).toBeVisible();
  const before = await H.getState(page);
  const messages = await page.locator('#log .msg').count();
  await page.locator('#docRequestOriginal').click();
  await expect(page.locator('#docRequestOriginal')).toBeDisabled();
  await expect(page.locator('#docRequestStatus')).toContainText('다시 제시하도록 요청했습니다');
  await expect(page.locator('#docRequestStatus')).toBeFocused();
  await expect(page.locator('#log .msg')).toHaveCount(messages + 2);
  await expect(page.locator('#log')).toContainText('여권 원본을 다시 제시');
  const after = await H.getState(page);
  expect(after.performed).toContain('DOC_REQUEST_0');
  expect(after.strikes).toBe(before.strikes);
  expect(after.score).toBe(before.score);
  expect(after.ended).toBe(false);
  expect(after.looked).toEqual(before.looked);
  await H.expectNoErrors(errors);
});

test('unverified arrival declaration never displays fabricated completed filing', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 314159);
  await H.startShift(page);
  const queue = await H.getQueue(page);
  const item = queue.find((x) => x.caseId === 'ICN-S2-005');
  expect(item).toBeTruthy();
  await H.jumpTo(page, item.index);
  await page.locator('#doclist .docitem', { hasText: '전자입국신고' }).click();
  await expect(page.locator('#docview .ea-status')).toContainText('상태 미기재');
  await expect(page.locator('#docview .ea-status')).not.toContainText('제출 완료');
  await expect(page.locator('#docview .doc-validity')).toContainText('진위 미확인');
  await page.locator('#docRequestOriginal').click();
  await expect(page.locator('#log')).toContainText('전자입국신고 제출 내역');
  await H.expectNoErrors(errors);
});

test('biometric lookup record displays its own 71.8% and is not requestable from the passenger', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 271828);
  await H.startShift(page);
  const queue = await H.getQueue(page);
  const item = queue.find((x) => x.caseId === 'ICN-S3-009');
  expect(item).toBeTruthy();
  await H.jumpTo(page, item.index);
  await page.locator('#doclist .docitem', { hasText: '생체대조 결과' }).click();
  await expect(page.locator('#docview .biometric-doc-score')).toContainText('71.8%');
  await expect(page.locator('#docview .biometric-doc-score')).toContainText('불일치');
  await expect(page.locator('#docview .doc-origin-note')).toContainText('기관 내부 조회 결과');
  await expect(page.locator('#docRequestOriginal')).toHaveCount(0);
  await H.expectNoErrors(errors);
});

test('mobile document request remains touch-accessible and every evidence field is readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await H.openGame(page);
  await H.setSeed(page, 314159);
  // A phone defaults to the evidence task. The transcript is hidden, so the
  // generic desktop start helper's visible-log assertion is not applicable.
  await H.chooseStartOption(page, '[data-guidance="expert"]');
  await page.locator('#startBtn').click();
  await page.locator('#briefStart').click();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
  const evidenceTab = page.locator('#taskNav button[data-task="evidence"]');
  if (await evidenceTab.isVisible()) await evidenceTab.click();
  const btn = page.locator('#docRequestOriginal');
  await expect(btn).toBeVisible();
  const box = await btn.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  await btn.click();
  await expect(page.locator('#docRequestStatus')).toContainText('다시 제시');
  await expect(page.locator('#docRequestStatus')).toBeFocused();
  await H.expectNoErrors(errors);
});


test('keyboard document cycling is recorded the same as clicking the next document', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 271828);
  await H.startShift(page);
  await expect(page.locator('#doclist .docitem.on')).toHaveAttribute('data-i', '0');
  await page.keyboard.press(']');
  await expect(page.locator('#doclist .docitem.on')).toHaveAttribute('data-i', '1');
  const after = await H.getState(page);
  expect(after.performed).toContain('DOC_READ_1');
  await expect(page.locator('#doclist .docitem[data-i="1"]')).toHaveClass(/on/);
  await H.expectNoErrors(errors);
});

test('document comparison inside an enlarged modal displays its result inside that modal', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.startLiveCase(page); // ICN-S2-005 vertical slice
  await page.locator('#langInterp').click();
  await H.ask(page, 'purpose');
  await H.ask(page, 'occupation');
  await H.lookup(page, 'contact');
  await H.ask(page, 'jobOffer');
  const answer = page.locator('#log .msg.alien', { hasText: '공장 일' });
  await answer.locator('.msg-lock-btn').click();
  await page.locator('#doclist .docitem', { hasText: '사증' }).click();
  await page.locator('#docZoom').click();
  const modal = page.locator('#modal .doc-modal-wrap');
  await expect(modal).toBeVisible();
  await modal.locator('.doc-field[data-doc-key="VISA"] .doc-compare-btn').first().click();
  await expect(modal.locator('.doc-lock-feedback')).toContainText('관광 사증과 취업 의도 불일치');
  await H.expectNoErrors(errors);
});

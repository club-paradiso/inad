import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip((process.env.INAD_TARGET || 'dist') === 'legacy', 'requested return document is a new-game feature');

test('generated traveler submits a distinct outbound e-ticket on request without changing legal scoring', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 314159);
  await H.startShift(page);
  const c = await H.currentCase(page);
  if (/재입국/.test(c.basis || '')) test.skip(true, 'fixture selected an existing resident');
  const before = await H.getState(page);
  await expect(page.locator('#requestReturnDocument')).toBeEnabled();
  await expect(page.locator('.return-proof-paper')).toHaveCount(0);
  await page.locator('#requestReturnDocument').click();
  await expect(page.locator('.return-proof-paper[data-return-proof="ticketed"]')).toBeVisible();
  await expect(page.locator('.return-proof-paper')).toContainText('SIM6');
  await expect(page.locator('#requestReturnDocument')).toBeDisabled();
  await expect(page.locator('#log')).toContainText('전자항공권이나 예약확인서');
  const after = await H.getState(page);
  expect(after.performed).toContain('DOC_REQUEST_RETURN');
  expect(after.asked).toEqual(before.asked);
  expect(after.looked).toEqual(before.looked);
  expect(after.strikes).toBe(before.strikes);
  expect(after.ended).toBe(false);
  await page.locator('#doclist .docitem', { hasText: '항공예약' }).click();
  await expect(page.locator('#docview .ticket-return-overview')).toContainText('SIM6');
  await H.expectNoErrors(errors);
});

test('one-way case cannot produce a fabricated return ticket or an automatic refusal', async ({ page }) => {
  const errors = await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('#caseName')).toContainText('쩐 반 민');
  await page.locator('#requestReturnDocument').click();
  await expect(page.locator('.return-proof-paper')).toHaveCount(0);
  await expect(page.locator('.return-proof-unavailable[data-return-proof="missing"]')).toBeVisible();
  await expect(page.locator('.return-proof-unavailable')).toContainText('없습니다');
  const st = await H.getState(page);
  expect(st.ended).toBe(false);
  expect(st.strikes).toBe(0);
  await page.locator('#doclist .docitem', { hasText: '항공예약' }).click();
  await expect(page.locator('.ticket-return-overview')).toContainText('없음');
  await H.expectNoErrors(errors);
});

test('held booking shows a booking receipt, never falsely labels it an issued ticket', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.setSeed(page, 271828);
  await H.startShift(page);
  const queue = await H.getQueue(page);
  const item = queue.find((x) => x.caseId === 'ICN-S3-010');
  expect(item).toBeTruthy();
  await H.jumpTo(page, item.index);
  await page.locator('#requestReturnDocument').click();
  await expect(page.locator('.return-proof-paper[data-return-proof="held"]')).toBeVisible();
  await expect(page.locator('.return-proof-top')).toContainText('예약 보류 내역');
  await expect(page.locator('.return-proof-paper')).toContainText('미발권');
  const st = await H.getState(page);
  expect(st.ended).toBe(false);
  expect(st.strikes).toBe(0);
  await H.expectNoErrors(errors);
});

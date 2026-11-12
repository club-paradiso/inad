// Regression: a valid refusal must not strand the examiner at a concluded decision.
// Leaving detailed follow-up unfinished must be transparent, and must not fake procedure actions.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'modern refusal continuation only');

test('shift: after refusal, next passenger is callable without falsely completing repatriation', async ({ page }) => {
  const errors = await H.openGame(page);
  // Use a shift-two case: it always has a following passenger, regardless of random roster order.
  const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-005');
  await H.startShift(page);
  await H.jumpTo(page, idx);
  // Expert mode permits a thin decision and records its shortcomings without blocking the queue.
  await page.locator('#refuseBtn').click();
  await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
  await expect(page.locator('#modalTitle')).toHaveText('입국 불허가 통지서');
  await expect(page.locator('#docContinue')).toContainText('다음 심사로 계속');
  await H.continueDoc(page);
  await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
  const shortcut = page.locator('#procBody [data-proc-act="finish-refusal"]');
  await expect(shortcut).toContainText('다음 승객 호출');
  await expect(shortcut).toContainText('미완료로 기록');
  await H.procAct(page, 'finish-refusal');
  await H.expectResult(page, '입국 불허');
  const result = await H.getState(page);
  expect(result.stats.processed).toBe(1);
  expect(result.stats.refused).toBe(1);
  expect(result.performed).not.toContain('REPATRIATION_ORDER');
  expect(result.performed).not.toContain('DEPARTURE_WAITING_AREA');
  expect(result.reports).toHaveLength(1);
  await H.nextCase(page);
  await H.afterNext(page);
  const next = await H.getState(page);
  expect(next.caseIndex).toBe(idx + 1);
  expect(next.stage).toBe('PRIMARY');
  expect(next.ended).toBe(false);
  await H.expectNoErrors(errors);
});

test('quick shift: refusal handoff resumes the remaining roster', async ({ page }) => {
  const errors = await H.openGame(page);
  await page.locator('#quickStartBtn').click();
  await H.hook(page, (T) => T.jump(4));
  await H.ensureCommunication(page);
  // ICN-S2-005 is the fifth passenger in the introductory short duty.
  await page.locator('#refuseBtn').click();
  await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
  // Guided mode warns once on a thin review, without committing the verdict.
  if (await page.locator('#modalTitle').textContent() === '초보 심사관 보호 힌트') {
    await page.locator('#modalClose').click();
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
  }
  await expect(page.locator('#modalTitle')).toHaveText('입국 불허가 통지서');
  await H.continueDoc(page);
  await H.procAct(page, 'finish-refusal');
  await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과 · 디브리핑');
  await page.locator('#quickNext').click();
  await expect(page.locator('#caseId')).toContainText('A006');
  const next = await H.getState(page);
  expect(next.caseIndex).toBe(5);
  expect(next.ended).toBe(false);
  await H.expectNoErrors(errors);
});

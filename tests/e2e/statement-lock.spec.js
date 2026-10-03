// E2E test for the signature mechanic: Statement Lock (진술 대조)
// Tests the vertical slice on ICN-S2-005 (TRAN VAN MINH):
// 1. Arming a statement for comparison from the transcript
// 2. Comparing with document field / lookup terminal
// 3. Detecting the illegal broker contradiction and discovering clue tm4
// 4. Keyboard dismissal with Escape
// 5. Accessible feedback without penalties on non-conflicting checks

import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v11 Statement Lock only');

test('statement lock: select transcript statement, compare with terminal lookup, verify contradiction payoff', async ({ page }) => {
  const errors = await H.openGame(page);

  // 1. Enter Live Interview directly via the primary hero action
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
  await expect(page.locator('#caseName')).toContainText('쩐 반 민');

  // Connect interpreter for clear communication
  await page.locator('#langInterp').click();

  // 2. Ask the contact question
  await H.ask(page, 'contact');
  await expect(page.locator('#log .msg.alien')).toHaveCount(2); // initial + contact answer

  // 3. Statement Lock button is present on alien reply
  const lockBtn = page.locator('#log .msg.alien .msg-lock-btn').last();
  await expect(lockBtn).toBeVisible();

  // Click [대조] to arm Statement Lock
  await lockBtn.click();

  // 4. Statement Lock dock appears above log
  const dock = page.locator('#statementLockDock');
  await expect(dock).toBeVisible();
  await expect(dock).toHaveClass(/lock-active/);
  await expect(dock).toContainText('대조 선택 진술');
  await expect(dock).toContainText('친구의 친구');

  // Test ESC key dismissal
  await page.keyboard.press('Escape');
  await expect(dock).toBeHidden();

  // Re-arm Statement Lock
  await lockBtn.click();
  await expect(dock).toBeVisible();

  // 5. Perform the contact lookup in the terminal
  await H.lookup(page, 'contact');
  const lookupLine = page.locator('#terminal .line[data-lookup-kind="contact"]');
  await expect(lookupLine).toBeVisible();

  // 6. Click the contact lookup result to execute the comparison!
  await lookupLine.click();

  // 7. Verify successful contradiction payoff!
  await expect(dock).toHaveClass(/lock-matched/);
  await expect(dock).toContainText('연락처 불법알선 의혹 대조');
  await expect(dock).toContainText('불법취업 알선 번호');

  // Verify clue tm4 is discovered on the clue board
  const clueBoard = page.locator('#clueBoard');
  await expect(clueBoard).toContainText('연락처 이상');

  // Verify alert log message
  await expect(page.locator('#log .msg.alert').last()).toContainText('연락처 불법알선 의혹');

  await H.expectNoErrors(errors);
});

test('statement lock: job offer statement compared with tourist visa doc creates critical contradiction', async ({ page }) => {
  const errors = await H.openGame(page);

  // Enter Live Interview
  await page.locator('#liveStartBtn').click();
  await page.locator('#langInterp').click();

  // In ICN-S2-005, asking occupation and contact lookup unlocks jobOffer
  await H.ask(page, 'purpose');
  await H.ask(page, 'occupation');
  await H.lookup(page, 'contact');
  await H.ask(page, 'jobOffer');

  // Find the job offer alien statement
  const jobReply = page.locator('#log .msg.alien', { hasText: '공장 일' });
  await expect(jobReply).toBeVisible();

  // Arm lock on the job offer statement
  await jobReply.locator('.msg-lock-btn').click();
  const dock = page.locator('#statementLockDock');
  await expect(dock).toBeVisible();
  await expect(dock).toContainText('공장 일');

  // Switch to VISA document in workbench
  await page.locator('#doclist .docitem', { hasText: '사증' }).click();
  const visaField = page.locator('#docview .doc-field[data-doc-key="VISA"]').first();
  await expect(visaField).toBeVisible();

  // Compare job statement with VISA document!
  await visaField.click();

  // Payoff: Critical contradiction detected!
  await expect(dock).toHaveClass(/lock-matched/);
  await expect(dock).toContainText('결정적 모순');
  await expect(dock).toContainText('관광 사증과 취업 의도 불일치');

  // Clue tm6 discovered
  await expect(page.locator('#clueBoard')).toContainText('취업 관련 정보');

  await H.expectNoErrors(errors);
});

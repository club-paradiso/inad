import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip((process.env.INAD_TARGET || 'dist') === 'legacy', 'modern document comparison only');

test('document-first comparison offers existing statements and explains the result inline', async ({ page }) => {
  const errors = await H.openGame(page);
  await H.startLiveCase(page); // ICN-S2-005 vertical slice
  await page.locator('#langInterp').click();

  await H.ask(page, 'purpose');
  await H.ask(page, 'occupation');
  await H.lookup(page, 'contact');
  await H.ask(page, 'jobOffer');

  await page.locator('#doclist .docitem', { hasText: '사증' }).click();
  const visa = page.locator('#docview .doc-field[data-doc-key="VISA"]').first();
  await expect(visa.locator('.doc-compare-btn')).toBeVisible();
  await visa.locator('.doc-compare-btn').click();

  const picker = page.locator('#docStatementPicker');
  await expect(picker).toBeVisible();
  await expect(picker.locator('.doc-compare-statement').first()).toBeVisible();
  await picker.locator('.doc-compare-statement', { hasText: '공장 일' }).click();

  await expect(page.locator('#docview .doc-lock-feedback')).toContainText('관광 사증과 취업 의도 불일치');
  await expect(page.locator('#statementLockDock')).toHaveClass(/lock-matched/);
  await H.expectNoErrors(errors);
});

test('guidance highlights only eligible document evidence for a selected statement', async ({ page }) => {
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
  await expect(page.locator('#docview .doc-field[data-doc-key="VISA"].lock-candidate').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#docview .doc-field.lock-candidate')).toHaveCount(0);
  await H.expectNoErrors(errors);
});

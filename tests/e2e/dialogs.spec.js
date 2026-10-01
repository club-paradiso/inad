// Dialog integrity: a dialog that carries a flow forward (decision notice, case result, shift summary) cannot be
// dropped by Escape, the backdrop, the 닫기 button or a dialog shortcut — dropping it used to leave a decided case
// with every decision control disabled and nothing saved. Ordinary dialogs stay dismissible, trap focus, make the
// background inert and restore focus to their trigger.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 271828;
const target = process.env.INAD_TARGET || 'dist';

test.describe('대화상자 무결성', () => {
  test.skip(target === 'legacy', 'v6.1 baseline closes every dialog on Escape');

  test('decision notice and case result survive Escape, backdrop and shortcuts; the flow continues', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await H.ensureCommunication(page);
    const c = await H.currentCase(page);
    expect(c.resolution.type).toBe('CLEAR');
    for (const r of c.required) {
      if (r.startsWith('QUESTION_')) await H.ask(page, r.slice(9));
      else if (r.startsWith('LOOKUP_')) await H.lookup(page, r.slice(7));
    }
    await page.locator('#clearBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('입국심사 완료');
    await expect(page.locator('#modalClose')).toBeHidden();
    await expect(page.locator('#docContinue')).toBeFocused();
    await expect(page.locator('#app')).toHaveJSProperty('inert', true);
    for (const key of ['Escape', 'KeyS', 'KeyL', 'KeyU', 'KeyB', 'F1']) {
      await page.keyboard.press(key);
      await expect(page.locator('#modalTitle'), `${key} must not drop the notice`).toHaveText('입국심사 완료');
    }
    await page.mouse.click(5, 5); // backdrop
    await expect(page.locator('#modalTitle')).toHaveText('입국심사 완료');
    await page.keyboard.press('Enter');
    await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과');
    await expect(page.locator('#nextCase')).toBeFocused();
    await H.nextCase(page);
    await H.afterNext(page);
    const st = await H.getState(page);
    expect(st.caseIndex).toBe(1);
    expect(st.stats.processed).toBe(1);
    await expect(page.locator('#app')).toHaveJSProperty('inert', false);
    await H.expectNoErrors(errors);
  });

  test('a dialog shortcut cannot replace the refusal-reason dialog; Escape cancels it without deciding', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await page.locator('#refuseBtn').click();
    await expect(page.locator('#modalTitle')).toContainText('입국 불허가 사유 선택');
    await page.keyboard.press('KeyS');
    await expect(page.locator('#modalTitle')).toContainText('입국 불허가 사유 선택');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).not.toHaveClass(/on/);
    await expect(page.locator('#refuseBtn')).toBeFocused();
    const st = await H.getState(page);
    expect(st.stage).toBe('PRIMARY');
    expect(st.ended).toBe(false);
    await H.expectNoErrors(errors);
  });

  test('settings: focus is trapped, the background is inert and focus returns to the trigger', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.startShift(page);
    await page.locator('#moreBtn').click();
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('접근성·조작 설정');
    await expect(page.locator('#app')).toHaveJSProperty('inert', true);
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('#modal')), 'focus stays inside the dialog').toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).not.toHaveClass(/on/);
    await expect(page.locator('#moreBtn')).toBeFocused();
    await H.expectNoErrors(errors);
  });

  test('shift summary returns after a profile or records sub-dialog is dismissed', async ({ page }) => {
    const errors = await H.openGame(page);
    // find a roster whose last passenger is an ordinary (CLEAR) case so the shift can be finished through the UI
    const seed = await page.evaluate(() => { for (let s = 100001; s < 100400; s++) { window.INADTest.regenerate(s); const q = window.INADTest.queue(); const last = q[q.length - 1]; if (!last.caseId && last.resolution.type === 'CLEAR') return s; } return null; });
    expect(seed, 'a seed with an ordinary last passenger').not.toBeNull();
    await H.setSeed(page, seed);
    await H.startShift(page);
    const last = (await H.getQueue(page)).length - 1;
    await H.jumpTo(page, last);
    await H.ensureCommunication(page);
    await H.solveNormalCase(page);
    await H.nextCase(page);
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await page.locator('#finalProfile').click();
    await expect(page.locator('#modalTitle')).toContainText('프로필');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await page.locator('#finalRecords').click();
    await expect(page.locator('#modalTitle')).toContainText('근무기록');
    await page.locator('#modalClose').click();
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await expect(page.locator('#restart')).toBeVisible();
    await H.expectNoErrors(errors);
  });

  test('closing a procedure screen never strands the case: repatriation and secondary can be reopened', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await H.continueDoc(page);
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
    await page.keyboard.press('Escape');
    await expect(page.locator('#procedureScreen')).not.toHaveClass(/on/);
    await expect(page.locator('#specialBtn')).toBeVisible();
    await expect(page.locator('#specialTitle')).toHaveText('송환 절차 계속');
    await page.locator('#specialBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
    await H.procAct(page, 'repat-order'); await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await H.expectResult(page, '입국 불허');
    await H.nextCase(page); await H.afterNext(page);
    // secondary: 일반 심사대 보기 → reopen from the decision desk without re-running the referral
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary');
    const performed = (await H.getState(page)).performed.slice();
    await H.procAct(page, 'back');
    await expect(page.locator('#specialTitle')).toHaveText('입국재심 화면 다시 열기');
    await page.locator('#specialBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary');
    expect((await H.getState(page)).performed).toEqual(performed);
    await H.expectNoErrors(errors);
  });

  test('workspace shortcuts do not act behind an open procedure screen; the screen stays current', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    await page.keyboard.press('KeyH');
    await page.keyboard.press('Digit2');
    const st = await H.getState(page);
    expect(st.looked).toEqual([]);
    expect(await page.evaluate(() => !!document.activeElement.closest('#procedureScreen') || document.activeElement === document.body)).toBe(true);
    await page.locator('#procBody [data-proc-lu="history"]').click();
    await expect(page.locator('#procBody [data-proc-lu="history"]')).toHaveText('재조회');
    await H.expectNoErrors(errors);
  });

  test('double-clicking a decision does not confirm the notice it opens', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await H.ensureCommunication(page);
    const c = await H.currentCase(page);
    for (const r of c.required) { if (r.startsWith('QUESTION_')) await H.ask(page, r.slice(9)); else if (r.startsWith('LOOKUP_')) await H.lookup(page, r.slice(7)); }
    await page.locator('#clearBtn').dblclick();
    await expect(page.locator('#modalTitle')).toHaveText('입국심사 완료');
    await H.continueDoc(page);
    await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과');
    await H.expectNoErrors(errors);
  });
});

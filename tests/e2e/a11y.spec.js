import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 173205;

test.describe('접근성·키보드', () => {
  test('11. 키보드만으로 근무 시작 → 질문 → 조회 → 서류 이동 → 입국허가', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S1-001');
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await H.tabTo(page, 'startBtn');
    await page.keyboard.press('Enter');
    await expect(page.locator('#briefStart')).toBeVisible();
    await H.tabTo(page, 'briefStart');
    await page.keyboard.press('Enter');
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    await H.jumpTo(page, idx);
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    // category shortcut + Tab into the question list
    await page.keyboard.press('Digit1');
    await expect(page.locator('#qtabs .qtab.on')).toContainText('기본사항');
    await expect(page.locator('#a11yLive')).toContainText('질문 카테고리');
    await H.tabToSelector(page, '#questions .qbtn');
    await page.keyboard.press('Enter');
    let st = await H.getState(page);
    expect(st.asked).toContain('purpose');
    // lookup + document shortcuts
    await page.keyboard.press('KeyH');
    await expect(page.locator('#terminal')).toContainText('출입국기록');
    await page.keyboard.press('BracketRight');
    await expect(page.locator('#doclist .docitem').nth(1)).toHaveClass(/on/);
    await page.keyboard.press('BracketLeft');
    await expect(page.locator('#doclist .docitem').nth(0)).toHaveClass(/on/);
    // dialogs open/close with keyboard and restore focus
    await page.keyboard.press('KeyS');
    await expect(page.locator('#modalTitle')).toHaveText('접근성·조작 설정');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('modalClose');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).not.toHaveClass(/on/);
    await page.keyboard.press('Alt+KeyR');
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#procedureScreen')).not.toHaveClass(/on/);
    // finish the case: remaining required questions via tabs, then Alt+A
    await H.ask(page, 'return');
    await H.ask(page, 'agenda');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Alt+KeyA');
    await expect(page.locator('#docContinue')).toBeVisible();
    await H.tabTo(page, 'docContinue');
    await page.keyboard.press('Enter');
    await H.expectResult(page, '입국 허가');
    st = await H.getState(page);
    expect(st.strikes).toBe(0);
    // focus-visible styling exists for keyboard users
    const hasFocusVisible = await page.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /focus-visible/.test(r.selectorText || '')); } catch (e) { return false; } }));
    expect(hasFocusVisible).toBe(true);
    await H.expectNoErrors(errors);
  });

  test('12. 접근성 모드(고대비·큰 글자·동작 감소) 저장 및 복원', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#mainContent');
    await expect(page.locator('#a11yLive')).toHaveAttribute('aria-live', 'polite');
    await page.locator('#startSettingsBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('접근성·조작 설정');
    await page.locator('[data-pref-toggle="contrast"]').click();
    await page.locator('[data-pref-font="large"]').click();
    await page.locator('[data-pref-toggle="reduceMotion"]').click();
    await expect(page.locator('body')).toHaveClass(/pref-contrast/);
    await expect(page.locator('body')).toHaveClass(/pref-font-large/);
    await expect(page.locator('body')).toHaveClass(/pref-reduce-motion/);
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/pref-contrast/);
    await expect(page.locator('body')).toHaveClass(/pref-font-large/);
    await expect(page.locator('body')).toHaveClass(/pref-reduce-motion/);
    const stored = await page.evaluate(() => ({ c: localStorage.getItem('inad-contrast'), f: localStorage.getItem('inad-font'), m: localStorage.getItem('inad-reduce-motion') }));
    expect(stored).toEqual({ c: '1', f: 'large', m: '1' });
    // audio toggle keeps captions/announcements on screen
    await page.keyboard.press('KeyM');
    await expect(page.locator('#audioBtn')).toContainText('음향 끔');
    await expect(page.locator('#paBanner')).toContainText('화면 자막은 계속 표시');
    await H.expectNoErrors(errors);
  });
});

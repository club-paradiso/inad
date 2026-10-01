// Procedure screens: each shows its identity, current step, what is not available yet (and why), the record
// it is based on, and covers the workstation completely while open. Legal outcomes are unchanged.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 271828;
const target = process.env.INAD_TARGET || 'dist';

test.describe('절차 화면', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has different procedure screens');

  test('refugee: claim route only after the claim; findings start 미확인; the current step is marked', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-010');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procBody [data-proc-act="refugee"]')).toHaveCount(0);
    await expect(page.locator('#procBody .proc-action.is-blocked', { hasText: '난민신청·회부심사' })).toBeDisabled();
    await expect(page.locator('#procTitle')).toBeFocused();
    await H.procAct(page, 'back');
    await H.ensureCommunication(page);
    await H.ask(page, 'refugee');
    await page.locator('#specialBtn').click(); // stage is already SECONDARY: the claim opens the refugee screen directly
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'refugee');
    await expect(page.locator('#procBody')).toContainText('정치적 박해 주장: 미확인');
    await expect(page.locator('#procBody .proc-step[aria-current="step"]')).toContainText('회부 여부 심사');
    await expect(page.locator('#procBody')).toContainText('최근 진술·조회');
    await H.procAct(page, 'start-referral');
    await expect(page.locator('#procBody .proc-step[aria-current="step"]')).toContainText('회부/불회부 결정');
    await expect(page.locator('#procBody .proc-note.warn')).toContainText('박해 사유 인터뷰');
    await page.locator('#procBody [data-proc-q="persecution"]').click();
    await expect(page.locator('#procBody')).toContainText('정치적 박해 주장: 확인되지 않음');
    await expect(page.locator('#procBody .proc-note.warn')).toHaveCount(0);
    expect((await H.getState(page)).stage).toBe('REFUGEE');
    await H.expectNoErrors(errors);
  });

  test('sjp: the whole sequence is visible, unavailable steps say why, interpreter need is explained in place', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'sjp');
    await expect(page.locator('#procBody .is-blocked').filter({ has: page.locator('b', { hasText: '출입국사범 조사 전환' }) })).toContainText('문서 감식');
    await expect(page.locator('#procBody .is-blocked', { hasText: '긴급체포 요건 검토' })).toBeDisabled();
    await expect(page.locator('#mainContent')).toHaveJSProperty('inert', true);
    await H.procAct(page, 'forensic');
    await expect(page.locator('#procBody .proc-note.warn')).toContainText('제48조제6항');
    await H.procAct(page, 'interpreter');
    await expect(page.locator('#procBody .proc-note.warn', { hasText: '제48조제6항' })).toHaveCount(0);
    await H.procAct(page, 'investigate');
    await H.procAct(page, 'arrest-review');
    const count = page.locator('#arrestCount');
    await expect(count).toHaveText('요건 확인 0/3');
    await page.locator('#procBody .proc-ar').nth(0).check();
    await page.locator('#procBody .proc-ar').nth(1).check();
    await expect(count).toHaveText('요건 확인 2/3');
    // a question asked inside the screen re-renders it; the ticks survive
    const q = page.locator('#procBody [data-proc-q]').first();
    if (await q.count()) { await q.click(); await expect(count).toHaveText('요건 확인 2/3'); }
    await page.locator('#procClose').click();
    await expect(page.locator('#mainContent')).toHaveJSProperty('inert', false);
    await H.expectNoErrors(errors);
  });

  test('switching procedures starts the new one at the top', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click(); await page.locator('#briefStart').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    await H.jumpTo(page, idx);
    await page.locator('#taskNav button[data-task="assessment"]').click();
    await page.locator('#secondaryBtn').click();
    await page.locator('#procBody').evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await H.procAct(page, 'sjp');
    await expect.poll(() => page.locator('#procBody').evaluate((el) => el.scrollTop)).toBe(0);
    await H.expectNoErrors(errors);
  });

  test('decision notices carry a neutral simulation mark, not a real agency seal; disabled decisions say why', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.startShift(page);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'back');
    await expect(page.locator('#secondaryBtn')).toBeDisabled();
    await expect(page.locator('#secondaryBtn')).toHaveAttribute('aria-describedby', 'actionHint');
    await expect(page.locator('#actionHint')).toContainText('입국재심');
    await H.ensureCommunication(page);
    const c = await H.currentCase(page);
    for (const r of c.required) { if (r.startsWith('QUESTION_')) await H.ask(page, r.slice(9)); else if (r.startsWith('LOOKUP_')) await H.lookup(page, r.slice(7)); }
    await page.locator('#clearBtn').click();
    await expect(page.locator('#modalBody .seal')).toContainText('INAD 가상 문서');
    await expect(page.locator('#modalBody')).not.toContainText('출입국·외국인정책본부');
    await H.expectNoErrors(errors);
  });

  test('the game-over title names the strike limit of the difficulty', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.chooseStartOption(page, '[data-difficulty="realistic"]');
    await H.startShift(page);
    for (let i = 0; i < 3; i++) { if (await page.locator('#modal').evaluate((m) => m.classList.contains('on'))) break; await page.locator('#clearBtn').click(); }
    await expect(page.locator('#modalTitle')).toHaveText('감찰 누적 3회 · 근무 종료');
    await H.expectNoErrors(errors);
  });
});

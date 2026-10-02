// v10 Quick Shift (first run): six fixed passengers, 안내 coaching, a debrief after each, a summary at the end,
// and nothing written to the shift checkpoint or the career record.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v10 only');

test.describe('짧은 근무', () => {
  test('six fixed passengers in order; each case ends in a debrief and calls the next; nothing is saved', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#quickStartBtn').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    const queue = await H.getQueue(page);
    expect(queue.map((q) => q.caseId || 'normal')).toEqual(['ICN-S1-001', 'normal', 'ICN-S1-002', 'ICN-S2-006', 'ICN-S2-005', 'ICN-S3-011']);
    expect(new Set(queue.map((q) => q.shift))).toEqual(new Set([1]));
    await expect(page.locator('#caseName')).toContainText('로버트 밴스');
    await H.solveClearDebrief(page);
    await page.locator('#quickNext').click();
    await expect(page.locator('#caseId')).toContainText('A002');
    await H.solveClearDebrief(page);
    await page.locator('#quickNext').click();
    await expect(page.locator('#caseName')).toContainText('미오 다나카');
    const st = await H.getState(page);
    expect(st.strikes).toBe(0); expect(st.stats.processed).toBe(2);
    expect(await page.evaluate(() => [localStorage.getItem('inad-progress-v54'), localStorage.getItem('inad-meta-v54')])).toEqual([null, null]);
    await H.expectNoErrors(errors);
  });

  test('the last passenger leads to the summary; a premature decision is coached, not struck', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#quickStartBtn').click();
    await expect(page.locator('#caseName')).toContainText('로버트 밴스');
    await page.locator('#clearBtn').click(); // too early: 안내 coaching (guard or coached warning), never a strike
    if (await page.locator('#modal').evaluate((m) => m.classList.contains('on'))) await page.locator('#modalClose').click();
    expect((await H.getState(page)).strikes).toBe(0);
    await H.jumpTo(page, 5);
    await expect(page.locator('#caseName')).toContainText('비카시 타파');
    await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await H.continueDoc(page);
    await H.procAct(page, 'repat-order');
    await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await expect(page.locator('#modalBody')).toContainText('생체정보 제공·본인확인 절차 불응');
    await page.locator('#quickSummary').click();
    await expect(page.locator('#modalTitle')).toHaveText('짧은 근무 요약');
    await expect(page.locator('.quick-summary tbody tr')).toHaveCount(1);
    await expect(page.locator('.quick-summary')).toContainText('입국 불허');
    await page.locator('#quickRetry').click();
    await expect(page.locator('#caseName')).toContainText('로버트 밴스');
    expect((await H.getState(page)).stats.processed).toBe(0);
    await H.expectNoErrors(errors);
  });
});

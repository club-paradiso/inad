// v13 first five minutes: what a first-time tester meets when typing their own questions,
// and where the first interview leads next.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v13 only');

async function type(page, text) {
  await page.locator('#askInput').fill(text);
  await page.locator('#askInput').press('Enter');
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
}

test.describe('첫 심사 · 첫 5분', () => {
  test('a question nobody understood keeps the coach on getting a first answer; Enter accepts an offered interpretation', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await expect(page.locator('#caseName')).toContainText('쩐 반 민');
    await expect(page.locator('.shift-meta')).toBeHidden(); // a single passenger has no duty shift to label
    // complex Korean question to a passenger with basic Korean: not understood, nothing recorded
    await type(page, '돈은 얼마나 가져왔어요');
    expect((await H.getState(page)).asked).toEqual([]);
    await expect(page.locator('#coachBanner')).toContainText('통역');
    await expect(page.locator('#coachBanner')).not.toContainText('진술 대조');
    await page.locator('#langInterp').click();
    // a paraphrase with no shared wording is offered, not recorded; Enter on the unchanged text accepts it
    await type(page, '왜 오셨어요?');
    await expect(page.locator('#askStatus [data-confirm]')).toBeVisible();
    expect((await H.getState(page)).asked).toEqual([]);
    await page.locator('#askInput').press('Enter');
    await expect(page.locator('#log .msg.pending')).toHaveCount(0);
    expect((await H.getState(page)).asked).toEqual(['purpose']);
    await expect(page.locator('#askStatus [data-confirm]')).toHaveCount(0);
    // editing the text withdraws the offer instead of confirming it
    await type(page, '돌아가는 비행기표 있어요?');
    await expect(page.locator('#askStatus [data-confirm]')).toBeVisible();
    await page.locator('#askInput').fill('돌아가는 비행기표 있어요? 정말로요');
    await expect(page.locator('#askStatus [data-confirm]')).toHaveCount(0);
    await H.expectNoErrors(errors);
  });

  test('an answer that is not available yet says which kind of step opens it', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await page.locator('#langInterp').click();
    await type(page, '베트남에서 무슨 일 하세요?');
    expect((await H.getState(page)).asked).toEqual([]);
    await expect(page.locator('#log')).toContainText('「기본사항」 질문을 먼저 하면');
    await H.expectNoErrors(errors);
  });

  test('the first interview leads into the short duty, without bringing the same passenger back', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await page.locator('#langInterp').click();
    for (const q of ['purpose', 'return', 'funds', 'contact', 'occupation', 'addressOwner']) await H.ask(page, q);
    await H.lookup(page, 'contact'); await H.lookup(page, 'pnr');
    await H.ask(page, 'jobOffer');
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'refuse');
    await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
    await H.continueDoc(page);
    await H.procAct(page, 'repat-order');
    await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과 · 디브리핑');
    await expect(page.locator('#liveContinue')).toBeFocused();
    await expect(page.locator('#liveRetry')).toBeVisible();
    await page.locator('#liveContinue').click();
    await expect(page.locator('#caseId')).toContainText('A001');
    const queue = await H.getQueue(page);
    expect(queue.map((q) => q.caseId || 'normal')).toEqual(['ICN-S1-001', 'normal', 'ICN-S1-002', 'ICN-S2-006', 'ICN-S2-007', 'ICN-S3-011']);
    const st = await H.getState(page);
    expect(st.stats.processed).toBe(0); expect(st.strikes).toBe(0); expect(st.asked).toEqual([]);
    await expect(page.locator('#caseName')).toContainText('로버트 밴스');
    await H.solveClearDebrief(page);
    await page.locator('#quickNext').click();
    await expect(page.locator('#caseId')).toContainText('A002');
    await H.expectNoErrors(errors);
  });
});

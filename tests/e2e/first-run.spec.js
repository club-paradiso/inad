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
  test('the start button opens a passenger whose doubts are resolved by checking', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await expect(page.locator('#caseName')).toContainText('시티 라흐마');
    expect((await H.currentCase(page)).id).toBe('ICN-S2-006');
    expect((await H.currentCase(page)).resolution.type).toBe('CLEAR');
    await H.expectNoErrors(errors);
  });

  test('a question nobody understood keeps the coach on getting a first answer; Enter accepts an offered interpretation', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.startLiveCase(page); // ICN-S2-005 has a basic-Korean passenger and a purpose question
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

  test('an answer that is not available yet: the listed question says which kind of step opens it, typed words are offered the open question', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.startLiveCase(page);
    await page.locator('#langInterp').click();
    // typed words that land on the locked follow-up are offered the open question that establishes it,
    // without naming or showing the locked one
    await type(page, '베트남에서 무슨 일 하세요?');
    expect((await H.getState(page)).asked).toEqual([]);
    await expect(page.locator('#askStatus [data-confirm]')).toBeVisible();
    await expect(page.locator('#askStatus')).not.toContainText('소득원');
    // the locked question picked from the list gets the passenger's withheld line and the coaching hint
    await H.ask(page, 'occupation');
    expect((await H.getState(page)).asked).toEqual([]);
    await expect(page.locator('#log')).toContainText('「기본사항」 질문을 먼저 하면');
    await H.expectNoErrors(errors);
  });

  test('the first interview leads into the short duty, without bringing the same passenger back', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await H.solveClearDebrief(page);
    await expect(page.locator('#liveContinue')).toBeFocused();
    await expect(page.locator('#liveRetry')).toBeVisible();
    await page.locator('#liveContinue').click();
    await expect(page.locator('#caseId')).toContainText('A001');
    const queue = await H.getQueue(page);
    expect(queue.map((q) => q.caseId || 'normal')).toEqual(['ICN-S1-001', 'normal', 'ICN-S1-002', 'ICN-S2-008', 'ICN-S2-005', 'ICN-S3-011']);
    const st = await H.getState(page);
    expect(st.stats.processed).toBe(0); expect(st.strikes).toBe(0); expect(st.asked).toEqual([]);
    await expect(page.locator('#caseName')).toContainText('로버트 밴스');
    await H.solveClearDebrief(page);
    await page.locator('#quickNext').click();
    await expect(page.locator('#caseId')).toContainText('A002');
    await H.expectNoErrors(errors);
  });
});

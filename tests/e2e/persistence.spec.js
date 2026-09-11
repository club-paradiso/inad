import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 141421;

async function pickSimpleIndex(page) {
  const queue = await H.getQueue(page);
  for (const q of queue) {
    if (q.caseId || q.sessionVariant !== 'routine-clear') continue;
    const party = await H.hook(page, (T, i) => T.partyFor(i), q.index);
    if (!party) return q.index;
  }
  throw new Error('no simple passenger');
}

test.describe('저장·캠페인', () => {
  test('9. 체크포인트 저장 → 새로고침 → 이어하기 복원', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await pickSimpleIndex(page);
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await H.solveNormalCase(page);
    const save = await H.hook(page, (T) => T.progressSave());
    expect(save.version).toBe(1);
    expect(save.seed).toBe(SEED);
    expect(save.nextIndex).toBe(idx + 1);
    await page.reload();
    await expect(page.locator('#resumeBtn')).toBeVisible();
    await expect(page.locator('#resumeBtn')).toContainText(`${idx + 1}/36`);
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    const st = await H.getState(page);
    expect(st.stats.processed).toBe(1);
    expect(st.caseIndex).toBe(idx + 1);
    expect(await H.hook(page, (T) => T.seed())).toBe(SEED);
    await expect(page.locator('#caseCount')).toContainText('01 / 36');
    await H.expectNoErrors(errors);
  });

  test('10. 캠페인 DAY 1 완료 → DAY 2 대기 상태로 이월', async ({ page }) => {
    const errors = await H.openGame(page);
    // choose a base seed whose DAY-1 queue ends with a simple passenger
    let base = -1;
    for (let b = 100001; b < 100200; b++) {
      await H.setSeed(page, H.campaignDaySeed(b, 'holiday', 0));
      const queue = await H.getQueue(page);
      const last = queue[35];
      if (last.caseId || last.sessionVariant !== 'routine-clear') continue;
      const party = await H.hook(page, (T, i) => T.partyFor(i), 35);
      if (party) continue;
      base = b; break;
    }
    expect(base).toBeGreaterThan(0);
    await H.setSeed(page, base);
    await H.chooseStartOption(page, '[data-campaign="holiday"]');
    await expect(page.locator('#campaignPreview')).toContainText('DAY 1');
    await H.startShift(page);
    let st = await H.getState(page);
    expect(st.campaignId).toBe('holiday');
    expect(st.scenarioId).toBe('arrival');
    expect(await H.hook(page, (T) => T.seed())).toBe(H.campaignDaySeed(base, 'holiday', 0));
    await expect(page.locator('#campaignHud')).toBeVisible();
    await expect(page.locator('#campaignHudText')).toContainText('DAY 1/3');
    await H.jumpTo(page, 35);
    await H.solveNormalCase(page);
    await H.nextCase(page);
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await expect(page.locator('#modalBody')).toContainText('DAY 1/3 완료');
    const camp = await H.hook(page, (T) => T.campaignSave());
    expect(camp.active).toBe(true);
    expect(camp.day).toBe(1);
    expect(camp.results[0].day).toBe(1);
    await page.reload();
    await expect(page.locator('#campaignResumeStrip')).toBeVisible();
    await expect(page.locator('#campaignResumeStrip')).toContainText('DAY 2/3');
    await H.expectNoErrors(errors);
  });
});

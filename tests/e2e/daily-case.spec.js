// v10 Case of the Day: the same case for everyone on a Korean calendar day, standard rules, a spoiler-free share text,
// only the first result of the day kept, nothing written to the shift checkpoint or the career.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v10 only');

test('오늘의 사건: one case for the day, a debrief, a spoiler-free result kept once', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-03T03:00:00Z')); // 12:00 KST
  const errors = await H.openGame(page);
  const d = await H.hook(page, (T) => T.daily());
  expect(d.dateKey).toBe('2026-10-03'); expect(d.caseId).toBe('ICN-S1-001');
  await expect(page.locator('#dailyCaseBtn')).toHaveText('오늘의 사건');
  await page.locator('#dailyCaseBtn').click();
  await expect(page.locator('#caseName')).toContainText('로버트 밴스');
  expect((await H.getState(page)).difficulty).toBe('standard');
  await H.solveClearDebrief(page);
  const share = await page.locator('#dailyShare').innerText();
  expect(share).toContain('오늘의 사건 2026-10-03');
  for (const spoiler of ['허가', '불허', 'ROBERT', '로버트']) expect(share).not.toContain(spoiler);
  const saved = await page.evaluate(() => [JSON.parse(localStorage.getItem('inad-daily-v10'))['2026-10-03'], localStorage.getItem('inad-progress-v54'), localStorage.getItem('inad-meta-v54')]);
  expect(saved[0].decision).toBe('입국 허가'); expect(saved[0].caseId).toBe('ICN-S1-001'); expect(saved[1]).toBeNull(); expect(saved[2]).toBeNull();
  await page.locator('#liveExit').click();
  await expect(page.locator('#dailyCaseBtn')).toContainText('오늘의 사건 · 완료');
  await H.expectNoErrors(errors);
});

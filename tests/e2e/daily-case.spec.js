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

// Every day's passenger is voiced: the six cases that used to fall back to the generic persona now hold back a gated
// answer with their own public-record line, and answer an open question normally (persona coverage, round 5).
const DAYS = [
  ['2026-10-02', 'ICN-S3-012', 'date', 'history'], ['2026-10-05', 'ICN-S1-003', 'expiry', 'residence'],
  ['2026-10-06', 'ICN-S1-004', 'kor', 'abtc'], ['2026-10-14', 'ICN-S3-009', 'trueName', 'route'],
  ['2026-10-15', 'ICN-S2-008', 'inspection', 'company'], ['2026-10-16', 'ICN-S2-007', 'hotelName', 'hotel']
];
for (const [day, caseId, gated, open] of DAYS) {
  test(`오늘의 사건 ${day} (${caseId}): the passenger's own withheld line, then a normal answer`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(`${day}T03:00:00Z`));
    const errors = await H.openGame(page);
    expect((await H.hook(page, (T) => T.daily())).caseId).toBe(caseId);
    await page.locator('#dailyCaseBtn').click();
    const c = await H.currentCase(page);
    const st = await H.getState(page);
    if (st.language && !st.language.interpreterActive && (st.language.mode === 'none' || Math.max(st.language.korean, st.language.english) < 3)) await page.locator('#langInterp').click();
    const text = (id) => c.questions.find((q) => q.id === id).q;
    const say = async (t) => { await page.fill('#askInput', t); await page.press('#askInput', 'Enter'); const k = page.locator('#askStatus [data-confirm]'); if (await k.count()) await k.click(); await expect(page.locator('#log .msg.pending')).toHaveCount(0); };
    await say(text(gated));
    expect((await H.hook(page, (T) => T.interview())).lastKind).toBe('withheld');
    const line = await page.locator('#log .msg.alien .msgtext').last().innerText();
    expect(line).not.toContain('아까 말씀드린 대로입니다'); // the generic fallback
    expect((await H.getState(page)).asked).not.toContain(gated);
    await say(text(open));
    expect((await H.hook(page, (T) => T.interview())).lastKind).toBe('answer');
    expect((await H.getState(page)).asked).toContain(open);
    await H.expectNoErrors(errors);
  });
}

// Save/restore under hostile conditions, through the real start screen: damaged or future saves, storage that
// refuses writes, and the resume edge cases (36/36, shift boundary, abandoned campaign, mid-shift records,
// fatal ending). No storage state may leave the app unusable.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const SEED = 141421;
async function seed(page, entries) {
  await page.addInitScript((e) => { if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1'); for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v); }, entries);
}
async function startAndPlayOne(page) {
  await H.setSeed(page, SEED);
  await H.startShift(page);
  await H.ensureCommunication(page);
  await H.solveNormalCase(page);
}

test.describe('저장 데이터 손상·복원 경계', () => {
  test.skip(target === 'legacy', 'v6.1 baseline predates these guards');

  const corrupt = {
    'campaign day out of range': { 'inad-campaign-v58': JSON.stringify({ version: 1, id: 'holiday', active: true, day: 3, baseSeed: 1, results: [] }) },
    "campaign id 'none'": { 'inad-campaign-v58': JSON.stringify({ version: 1, id: 'none', active: true, day: 0, baseSeed: 1 }) },
    'meta sessions [null]': { 'inad-meta-v54': JSON.stringify({ version: 2, sessions: [null] }) },
    'meta with unknown daily mission': { 'inad-meta-v54': JSON.stringify({ version: 2, sessions: [], daily: { date: '2099-01-01', ids: ['futureMission'], progress: {}, rewarded: {} } }) },
    'checkpoint nextIndex -5': { 'inad-progress-v54': JSON.stringify({ version: 1, seed: 141421, nextIndex: -5 }) },
    'garbage in every key': { 'inad-meta-v54': '{not json', 'inad-progress-v54': '[]', 'inad-campaign-v58': 'null', 'inad-airport': 'zzz', 'inad-guidance': 'robot', 'inad-font': 'huge', 'inad-locale': 'xx' }
  };
  for (const [name, entries] of Object.entries(corrupt)) {
    test(`boots and plays with ${name}`, async ({ page }) => {
      await seed(page, entries);
      const errors = await H.openGame(page);
      await expect(page.locator('#sessionSeed')).not.toHaveText('------');
      await expect(page.locator('#bootFailureNotice')).toHaveCount(0);
      await expect(page.locator('#resumeBtn')).toBeHidden();
      await expect(page.locator('#clock')).not.toHaveText('00:00:00');
      await startAndPlayOne(page);
      expect((await H.getState(page)).stats.processed).toBe(1);
      await H.expectNoErrors(errors);
    });
  }

  test('storage that refuses writes is reported instead of claiming autosave', async ({ page }) => {
    await page.addInitScript(() => { Storage.prototype.setItem = function () { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }; });
    const errors = await H.openGame(page);
    await expect(page.locator('#saveStatus')).toContainText('저장소 사용 불가');
    await startAndPlayOne(page);
    await expect(page.locator('#toast')).toContainText('저장소');
    await H.expectNoErrors(errors);
  });

  test('a checkpoint at the shift boundary re-offers the shift-transition choice on resume', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const queue = await H.getQueue(page);
    const boundary = queue.findIndex((q, i) => i > 0 && q.shift !== queue[i - 1].shift);
    await page.evaluate(([s, n]) => localStorage.setItem('inad-progress-v54', JSON.stringify({ version: 1, seed: s, nextIndex: n, difficulty: 'standard', stats: { processed: n } })), [SEED, boundary]);
    await page.reload();
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('근무조 전환');
    await expect(page.locator('#modalClose')).toBeHidden();
    await page.locator('#beginShift').click();
    await expect(page.locator('#caseId')).toContainText('A' + String(boundary + 1).padStart(3, '0'));
    await H.expectNoErrors(errors);
  });

  test('a checkpoint at 36/36 resumes into the (non-dismissible) shift summary, never an empty workspace', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.evaluate((s) => localStorage.setItem('inad-progress-v54', JSON.stringify({ version: 1, seed: s, nextIndex: 36, difficulty: 'standard', stats: { processed: 36 } })), SEED);
    await page.reload();
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalTitle')).toHaveText('근무 종료 · 종합 근무평정');
    await page.keyboard.press('KeyH');
    await H.expectNoErrors(errors);
  });

  test('mid-shift the records centre offers no 이어하기 (it would erase penalties)', async ({ page }) => {
    const errors = await H.openGame(page);
    await startAndPlayOne(page);
    await H.nextCase(page); await H.afterNext(page);
    await page.locator('#clearBtn').click(); // premature admission → supervision strike
    expect((await H.getState(page)).strikes).toBe(1);
    await page.keyboard.press('KeyL');
    await expect(page.locator('#modalTitle')).toContainText('근무기록');
    await expect(page.locator('#recordResume')).toHaveCount(0);
    await H.expectNoErrors(errors);
  });

  test('abandoning a campaign removes its checkpoint from the start screen', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    await H.chooseStartOption(page, '[data-campaign="holiday"]');
    await H.startShift(page);
    await H.ensureCommunication(page);
    await H.solveNormalCase(page);
    expect((await H.hook(page, (T) => T.progressSave())).campaignId).toBe('holiday');
    await page.reload();
    await expect(page.locator('#resumeBtn')).toBeVisible();
    if (await page.locator('#setupAdvancedToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#setupAdvancedToggle').click();
    await page.locator('#campaignAbandonBtn').click();
    await page.locator('#confirmCampaignAbandon').click();
    await expect(page.locator('#resumeBtn')).toBeHidden();
    await H.expectNoErrors(errors);
  });

  test('an unlawful arrest ending is recorded and cannot be undone by reload + resume', async ({ page }) => {
    const errors = await H.openGame(page);
    await startAndPlayOne(page);
    await H.nextCase(page); await H.afterNext(page);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    for (const a of ['sjp', 'forensic', 'interpreter', 'investigate', 'arrest-review']) await H.procAct(page, a);
    await H.procAct(page, 'execute-arrest'); // no requirement ticked
    await expect(page.locator('#modalTitle')).toHaveText('치명적 절차위반');
    const meta = await H.hook(page, (T) => T.meta());
    expect(meta.sessions[0].grade).toBe('F');
    expect(await H.hook(page, (T) => T.progressSave())).toBeNull();
    await H.expectNoErrors(errors);
  });

  test('the sound setting survives a reload', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#audioBtn')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('KeyM');
    await expect(page.locator('#audioBtn')).toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.locator('#audioBtn')).toHaveAttribute('aria-pressed', 'false');
    await H.expectNoErrors(errors);
  });
});

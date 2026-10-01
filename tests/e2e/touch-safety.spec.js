// Touch decision safety across the whole legal workflow (CLAUDE.md: 단일 탭으로 법적 단계를 바꾸지 않는다).
// On a coarse pointer every control that moves a legal procedure — decision desk, special-procedure button,
// procedure-screen actions and the refusal-reason dialog — must arm on the first tap and run on the second.
// Navigation (일반 심사대 보기) and interpreter requests are not legal steps and stay single-tap.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 271828;
const target = process.env.INAD_TARGET || 'dist';
const DEVICES = [
  { name: 'phone-390', viewport: { width: 390, height: 844 }, isMobile: true },
  { name: 'tablet-768', viewport: { width: 768, height: 1024 }, isMobile: false }
];

async function touchPage(browser, device) {
  const ctx = await browser.newContext({ viewport: device.viewport, hasTouch: true, isMobile: device.isMobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  const page = await ctx.newPage();
  const errors = await H.openGame(page);
  expect(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches), 'emulated touch device').toBe(true);
  return { ctx, page, errors };
}
async function startShift(page) {
  await H.chooseStartOption(page, '[data-guidance="expert"]');
  await page.locator('#startBtn').tap();
  await page.locator('#briefStart').tap();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
}
async function task(page, name) {
  const b = page.locator(`#taskNav button[data-task="${name}"]`);
  if (await b.isVisible()) { await b.tap(); await expect(b).toHaveAttribute('aria-current', 'true'); }
}
// First tap only arms (and announces "다시 눌러 확정"); `unchanged` asserts the legal state did not move.
async function armThenRun(page, locator, unchanged) {
  const before = await H.getState(page);
  await locator.tap();
  await expect(locator).toHaveClass(/armed/);
  await expect(locator).toHaveAttribute('aria-pressed', 'true');
  await expect(locator.locator('.arm-hint')).toHaveText('다시 눌러 확정');
  const after = await H.getState(page);
  for (const key of ['stage', 'refugeeStep', 'repatriationStep', 'forensic', 'investigation', 'arrestReview', 'strikes', 'ended']) expect(after[key], `single tap must not change ${key}`).toEqual(before[key]);
  expect(after.performed, 'single tap must not record a procedural action').toEqual(before.performed);
  if (unchanged) await unchanged();
  await locator.tap();
}
const proc = (page, act) => page.locator(`#procBody [data-proc-act="${act}"]`);

for (const device of DEVICES) {
  test.describe(`touch safety · ${device.name}`, () => {
    test.skip(target === 'legacy', 'v6.1 baseline has no touch arming');

    test('refugee referral → non-referral → refusal → repatriation needs a confirming tap at every legal step', async ({ browser }) => {
      const { ctx, page, errors } = await touchPage(browser, device);
      await H.setSeed(page, SEED);
      const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-010');
      await startShift(page);
      await H.jumpTo(page, idx);
      await task(page, 'interview');
      await H.ensureCommunication(page);
      await H.ask(page, 'refugee');
      await task(page, 'assessment');
      await expect(page.locator('#specialBtn')).toBeVisible();
      await armThenRun(page, page.locator('#specialBtn'), () => expect(page.locator('#procedureScreen')).not.toHaveClass(/on/));
      await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary');
      expect((await H.getState(page)).stage).toBe('SECONDARY');
      await armThenRun(page, proc(page, 'refugee'), () => expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary'));
      await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'refugee');
      await armThenRun(page, proc(page, 'start-referral'));
      expect((await H.getState(page)).refugeeStep).toBe(2);
      await armThenRun(page, proc(page, 'non-referral'), () => expect(page.locator('#modal')).not.toHaveClass(/on/));
      await expect(page.locator('#modalTitle')).toHaveText('난민인정 심사 불회부결정통지서');
      await page.locator('#docContinue').tap();
      await armThenRun(page, proc(page, 'secondary'));
      await expect(page.locator('#procedureScreen')).not.toHaveClass(/on/);
      await task(page, 'interview');
      for (const q of ['funds', 'persecution', 'workPlan']) await H.ask(page, q);
      await task(page, 'assessment');
      await armThenRun(page, page.locator('#refuseBtn'), () => expect(page.locator('#modal')).not.toHaveClass(/on/));
      await expect(page.locator('#modalTitle')).toContainText('입국 불허가 사유 선택');
      const reason = page.locator('.reason[data-code="SIM-A12-PUR"]');
      await armThenRun(page, reason, () => expect(page.locator('#modalTitle')).toContainText('입국 불허가 사유 선택'));
      await expect(page.locator('#modalTitle')).toHaveText('입국 불허가 통지서');
      await page.locator('#docContinue').tap();
      await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
      await armThenRun(page, proc(page, 'repat-order'), () => expect(page.locator('#modal')).not.toHaveClass(/on/));
      await page.locator('#docContinue').tap();
      await armThenRun(page, proc(page, 'waiting-room'));
      expect((await H.getState(page)).repatriationStep).toBe(2);
      await armThenRun(page, proc(page, 'finish-refusal'));
      await H.expectResult(page, '입국 불허');
      const st = await H.getState(page);
      expect(st.strikes).toBe(0);
      expect(st.reports[0].procedure).toBe(100);
      await H.expectNoErrors(errors);
      await ctx.close();
    });

    test('special judicial police: forensic, investigation, arrest review and arrest each need a confirming tap', async ({ browser }) => {
      const { ctx, page, errors } = await touchPage(browser, device);
      await H.setSeed(page, SEED);
      const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
      await startShift(page);
      await H.jumpTo(page, idx);
      await task(page, 'assessment');
      await armThenRun(page, page.locator('#secondaryBtn'));
      await armThenRun(page, proc(page, 'sjp'), () => expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary'));
      await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'sjp');
      await armThenRun(page, proc(page, 'forensic'));
      expect((await H.getState(page)).forensic).toBe(true);
      // an interpreter request is not a legal step: one tap
      await proc(page, 'interpreter').tap();
      expect((await H.getState(page)).language.interpreterActive).toBe(true);
      await armThenRun(page, proc(page, 'investigate'));
      expect((await H.getState(page)).stage).toBe('INVESTIGATION');
      await proc(page, 'back').tap();
      await expect(page.locator('#procedureScreen')).not.toHaveClass(/on/);
      await task(page, 'interview');
      await H.ask(page, 'trueName');
      await H.ask(page, 'purchase');
      await task(page, 'assessment');
      // reopening the SJP screen is navigation (no legal step): one tap
      const before = await H.getState(page);
      await page.locator('#specialBtn').tap();
      await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'sjp');
      expect((await H.getState(page)).stage).toBe(before.stage);
      await armThenRun(page, proc(page, 'arrest-review'));
      expect((await H.getState(page)).stage).toBe('ARREST_REVIEW');
      const boxes = page.locator('#procBody .proc-ar');
      for (let i = 0; i < 3; i++) await boxes.nth(i).check();
      await armThenRun(page, proc(page, 'execute-arrest'), () => expect(page.locator('#modal')).not.toHaveClass(/on/));
      await expect(page.locator('#modalTitle')).toHaveText('출입국사범 사건 인계기록');
      expect((await H.getState(page)).stage).toBe('ARRESTED');
      await H.expectNoErrors(errors);
      await ctx.close();
    });

    test('arming expires after 4 s and arming a second decision disarms the first', async ({ browser }) => {
      const { ctx, page, errors } = await touchPage(browser, device);
      await H.setSeed(page, SEED);
      const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-006');
      await startShift(page);
      await H.jumpTo(page, idx);
      await task(page, 'assessment');
      const clear = page.locator('#clearBtn'), secondary = page.locator('#secondaryBtn');
      await clear.tap();
      await expect(clear).toHaveClass(/armed/);
      await secondary.tap();
      await expect(secondary).toHaveClass(/armed/);
      await expect(clear).not.toHaveClass(/armed/);
      await expect(clear.locator('.arm-hint')).toHaveCount(0);
      await expect(secondary).not.toHaveClass(/armed/, { timeout: 6000 });
      await expect(secondary).toHaveAttribute('aria-pressed', 'false');
      // after expiry the next tap arms again instead of executing
      await secondary.tap();
      await expect(secondary).toHaveClass(/armed/);
      const st = await H.getState(page);
      expect(st.stage).toBe('PRIMARY');
      expect(st.ended).toBe(false);
      await H.expectNoErrors(errors);
      await ctx.close();
    });
  });
}

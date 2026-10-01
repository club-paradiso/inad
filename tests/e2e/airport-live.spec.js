// Live airport workload degraded modes, driven through the real start screen with /api/airport-load routed.
// The snapshot may only change queue pressure; every failure must end in a visible "기본 프리셋" state
// (never a status that stays on "확인 중"), and the shift must start and play normally.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const LIVE = { airport: 'ICN', available: true, live: true, stale: false, checkedAt: '2026-10-01T06:00:00.000Z', arrivals: 30, delayed: 4, cancelled: 1, windowMinutes: 120, source: 'IIAC', sourceLabel: '인천국제공항공사 여객편 운항현황' };

async function openWithRoute(page, handler) {
  await page.route('**/api/airport-load**', handler);
  const errors = await H.openGame(page);
  await page.locator('#setupAdvancedToggle').click();
  await expect(page.locator('#setupAdvancedPanel')).toBeVisible();
  return errors;
}
const liveLine = (page) => page.locator('.airport-btn[data-airport="icn-t2"] > small');
const liveOps = (page) => page.evaluate(() => window.INADTest.liveOps ? window.INADTest.liveOps() : null);

test.describe('실시간 공항 운항정보 · 장애 대응', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has no live airport workload');

  for (const [name, handler, expected] of [
    ['proxy 500', (route) => route.fulfill({ status: 500, body: 'boom' }), 'proxy-http-500'],
    ['malformed JSON', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"live": tr' }), 'malformed-response'],
    ['network failure', (route) => route.abort('failed'), 'network-error'],
    ['live:true without numbers', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ live: true, available: true, arrivals: 'many' }) }), 'malformed-response']
  ]) {
    test(`${name} → visible baseline fallback, shift plays normally`, async ({ page }) => {
      const errors = await openWithRoute(page, handler);
      await expect(liveLine(page)).toHaveText('실시간 조회 불가 · 기본 프리셋 적용');
      const ops = await liveOps(page);
      expect(ops.live).toBe(false);
      expect(ops.reason).toBe(expected);
      await H.setSeed(page, 271828); // deterministic roster: passenger 1 is an ordinary CLEAR case
      await H.chooseStartOption(page, '[data-guidance="expert"]');
      await page.locator('#startBtn').click();
      await expect(page.locator('#modalBody')).toContainText('기본 프리셋');
      await page.locator('#briefStart').click();
      await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
      await H.ensureCommunication(page);
      await H.solveNormalCase(page);
      // the page logs the failed same-origin request; nothing else may error
      expect(errors.filter((e) => !/Failed to load resource|ERR_FAILED/.test(e))).toEqual([]);
    });
  }

  test('a hanging proxy cannot leave the status on "확인 중" or freeze the start button', async ({ page }) => {
    test.setTimeout(60_000);
    const errors = await openWithRoute(page, () => { /* never answers */ });
    await expect(liveLine(page)).toHaveText('실시간 운항 확인 중…');
    await expect(liveLine(page)).toHaveText('실시간 조회 불가 · 기본 프리셋 적용', { timeout: 7000 });
    expect((await liveOps(page)).reason).toBe('timeout');
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveAttribute('aria-busy', 'true');
    // nothing else may start a shift while the start is pending (resume would be overwritten by the briefing)
    if (await page.locator('#resumeBtn').isVisible()) await expect(page.locator('#resumeBtn')).toBeDisabled();
    await expect(page.locator('#startBtn')).toContainText('확인 중');
    await expect(page.locator('#briefStart')).toBeVisible({ timeout: 7000 });
    await expect(page.locator('#startBtn')).not.toHaveAttribute('aria-busy', 'true');
    expect(errors).toEqual([]);
  });

  test('a live snapshot only changes queue pressure; legal outcomes are identical to the fallback run', async ({ page }) => {
    const errors = await openWithRoute(page, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LIVE) }));
    await expect(liveLine(page)).toContainText('실시간');
    await expect(liveLine(page)).toContainText('30편/2시간');
    const ops = await liveOps(page);
    expect(ops.live).toBe(true);
    expect(ops.arrivals).toBe(30);
    await H.setSeed(page, 271828);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await H.continueDoc(page);
    const st = await H.getState(page);
    expect(st.stage).toBe('ENTRY_REFUSED');
    expect(st.strikes).toBe(0);
    await H.expectNoErrors(errors);
  });

  test('a response that lands after the shift started does not change the running shift', async ({ page }) => {
    let release;
    const gate = new Promise((r) => { release = r; });
    let gmpCalls = 0;
    const errors = await openWithRoute(page, async (route) => {
      const airport = new URL(route.request().url()).searchParams.get('airport');
      const fallbackBody = JSON.stringify({ ...LIVE, airport, live: false, available: false, reason: 'api-key-not-configured', arrivals: null });
      if (airport === 'GMP' && ++gmpCalls === 1) {
        await gate; // the refresh started by choosing the airport is slow and lands mid-shift
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...LIVE, airport, arrivals: 400 }) }).catch(() => {});
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: fallbackBody });
    });
    await page.locator('.airport-btn[data-airport="gmp"]').click();
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click();
    await page.locator('#briefStart').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    expect((await H.getState(page)).started).toBe(true);
    release();
    await page.waitForTimeout(600);
    const after = await liveOps(page);
    expect(after.live, 'a mid-shift response must not switch the shift to live load').toBe(false);
    expect(after.appliedFactor).toBe(1);
    await H.expectNoErrors(errors);
  });
});

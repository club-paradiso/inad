// The interview record is the centre of the workstation: what the passenger just said must be readable the moment
// the interview is on screen, with the first-duty coach banner showing. Regression for the optional rows (coach
// banner, Statement Lock dock) taking the transcript's grid track — at 1024×768 the statement was 29px tall — and for
// phones opening the interview at the top of the record instead of its newest line.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v10+ only');

const VIEWPORTS = [
  { name: 'phone-320', width: 320, height: 568, touch: true },
  { name: 'phone-390', width: 390, height: 844, touch: true },
  { name: 'landscape-844', width: 844, height: 390, touch: true },
  { name: 'tablet-768', width: 768, height: 1024, touch: true },
  { name: 'compact-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

for (const vp of VIEWPORTS) {
  test.describe(`interview record · ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch });

    test('the passenger\'s statement is readable beside the coach banner, and the banner is only as tall as its text', async ({ page }) => {
      const errors = await H.openGame(page);
      await page.locator('#liveStartBtn').click();
      await expect(page.locator('#caseName')).toContainText('쩐 반 민');
      const nav = page.locator('#taskNav [data-task="interview"]');
      if (await nav.isVisible()) await nav.click();
      await expect(page.locator('#coachBanner')).toBeVisible();
      const m = await page.evaluate(() => {
        const rect = (e) => e.getBoundingClientRect();
        const log = rect(document.querySelector('#log'));
        const statement = rect([...document.querySelectorAll('#log .msg.alien .msgtext')].pop());
        const banner = document.querySelector('#coachBanner');
        const copy = [...banner.children].reduce((h, c) => Math.max(h, rect(c).height), 0);
        return { logTop: log.top, logBottom: log.bottom, top: statement.top, bottom: statement.bottom, banner: rect(banner).height, copy, ask: rect(document.querySelector('#askForm')).height };
      });
      expect(m.top, 'statement starts inside the visible record').toBeGreaterThanOrEqual(m.logTop - 1);
      expect(m.bottom, 'statement ends inside the visible record').toBeLessThanOrEqual(m.logBottom + 1);
      expect(m.banner, 'coach banner is not stretched by a flexible grid track').toBeLessThanOrEqual(m.copy + 24);
      expect(m.ask, 'question box is not stretched by a flexible grid track').toBeLessThanOrEqual(96);
      await H.expectNoErrors(errors);
    });
  });
}

test.describe('one primary action, one voice of guidance', () => {
  test('the first-interview action comes before the country choice on the start screen', async ({ page }) => {
    const errors = await H.openGame(page);
    const order = await page.evaluate(() => {
      const hero = document.querySelector('#liveStartBtn'), country = document.querySelector('#atlasStartCountry');
      return !!(hero.compareDocumentPosition(country) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order, '#atlasStartCountry follows #liveStartBtn').toBe(true);
    await H.expectNoErrors(errors);
  });

  test('while the coach banner speaks, the guided step does not repeat it and the scope note leaves the screen', async ({ page }) => {
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await expect(page.locator('#coachBanner')).toBeVisible();
    await expect(page.locator('#liveNextStep')).toBeVisible();
    await expect(page.locator('#liveNextStep p')).toHaveCount(0);
    await expect(page.locator('#liveNextButton')).toBeVisible();
    // still describes the question box for assistive technology
    await expect(page.locator('#liveInputScope')).toHaveClass(/sr-only/);
    await expect(page.locator('#askInput')).toHaveAttribute('aria-describedby', /liveInputScope/);
    await page.locator('#coachDismissBtn').click();
    await page.locator('#langInterp').click(); // any re-render
    await expect(page.locator('#liveNextStep p')).toHaveCount(1);
    await H.expectNoErrors(errors);
  });

  test('390px: the interview button sits below the face, and the subtitle stays above the button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    const cta = page.locator('#boothInterviewCta');
    await expect(cta).toBeVisible();
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const stage = r('#passengerStage'), cta = r('#boothInterviewCta'), cap = document.querySelector('#stageCaption');
      const pad = parseFloat(getComputedStyle(cap).paddingBottom);
      return { ctaTop: (cta.top - stage.top) / stage.height, capPad: pad, ctaFromBottom: stage.bottom - cta.top };
    });
    expect(m.ctaTop, 'button starts in the lower fifth of the portrait').toBeGreaterThan(0.75);
    expect(m.capPad, 'subtitle clears the button').toBeGreaterThanOrEqual(m.ctaFromBottom);
    await H.expectNoErrors(errors);
  });
});

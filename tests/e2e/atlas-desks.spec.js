// v11 country desks: one DOM, three visual variants. Each desk has its own chrome and desk mark, its own system-focus
// composition and its own way of showing the review checks, while action and status colours keep one meaning everywhere.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');

const DESK = { CA: 'rgb(34, 113, 122)', GB: 'rgb(69, 83, 156)', NZ: 'rgb(92, 107, 47)' };
async function openDesk(page, country, { system = true } = {}) {
  // The first desk is chosen on the start screen; later desks from the current desk's own country button.
  if (page.url() === 'about:blank') { await page.goto(ENTRY); await page.locator('#atlasStartCountry').click(); }
  else await page.locator('#atlasCountry').click();
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click({ timeout: 2000 }).catch(() => {}); // confirm leaving a desk
  await expect(page.locator('body')).toHaveAttribute('data-country', country);
  if (system) { await page.locator('#atlasSystem').click(); await expect(page.locator('body')).toHaveAttribute('data-focus', 'system'); }
}
const css = (page, sel, prop, pseudo = null) => page.locator(sel).first().evaluate((el, [p, ps]) => getComputedStyle(el, ps).getPropertyValue(p), [prop, pseudo]);
const box = async (page, zone) => page.locator(`.zone-${zone}`).boundingBox();

test('country desks: own chrome and desk mark, same action colour; high contrast keeps its own chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const chrome = {}, primary = {};
  for (const country of ['CA', 'GB', 'NZ']) {
    await openDesk(page, country);
    chrome[country] = await css(page, '#atlasHeader', 'background-color');
    expect(await css(page, '#atlasHeader', 'border-bottom-color')).toBe(DESK[country]);
    expect(await css(page, '.zone-evidence', 'border-top-color')).toBe(DESK[country]);
    primary[country] = await css(page, '#atlasPrepare', 'background-color');
  }
  expect(new Set(Object.values(chrome)).size).toBe(3);
  expect(new Set(Object.values(primary)).size).toBe(1);           // action colour means the same in every desk
  await page.locator('#atlasSettings').click(); await page.locator('[data-pref-toggle="contrast"]').click(); await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveClass(/pref-contrast/);
  expect(await css(page, '#atlasHeader', 'background-color')).toBe('rgb(6, 25, 43)');
});

test('country desks: each system focus is composed around its own workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openDesk(page, 'CA');
  let [person, interview, evidence, assessment] = await Promise.all(['person', 'interview', 'evidence', 'assessment'].map((z) => box(page, z)));
  expect(evidence.x).toBeGreaterThan(person.x + person.width - 1); expect(interview.x).toBeGreaterThan(evidence.x + evidence.width - 1);
  expect(interview.y).toBeLessThan(assessment.y);                   // records desk: interview above the notes
  expect(evidence.height).toBeGreaterThan(interview.height + assessment.height);
  await openDesk(page, 'GB');
  [person, interview, evidence, assessment] = await Promise.all(['person', 'interview', 'evidence', 'assessment'].map((z) => box(page, z)));
  expect(assessment.x).toBeGreaterThan(evidence.x + evidence.width - 1);
  expect(assessment.y).toBeLessThan(interview.y);                   // task desk: handover notes beside the tasks
  await openDesk(page, 'NZ');
  [person, interview, evidence, assessment] = await Promise.all(['person', 'interview', 'evidence', 'assessment'].map((z) => box(page, z)));
  expect(evidence.y).toBeLessThan(interview.y); expect(evidence.y).toBeLessThan(assessment.y);
  expect(evidence.width).toBeGreaterThan(interview.width + assessment.width); // activity board spans the top
  await expect(page.locator('.atlas-tasks')).toHaveCSS('grid-template-columns', /^\S+ \S+ \S+$/);
  // Every zone is used: nothing is left as an empty grid row.
  const main = await page.locator('#mainContent').boundingBox();
  expect(Math.max(person.y + person.height, interview.y + interview.height, assessment.y + assessment.height)).toBeGreaterThan(main.y + main.height - 24);
});

test('country desks: completed checks are marked in each desk and stated in text; NZ phases follow the note live', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const country of ['CA', 'GB', 'NZ']) {
    const c = atlasScenarios(country)[0];
    await openDesk(page, country);
    if (country === 'GB') { if (!await page.locator('.atlas-history').evaluate((el) => el.open)) await page.locator('.atlas-history summary').click(); }
    const identity = page.locator('li:has(#task-status-identity)');
    await expect(identity).toHaveAttribute('data-task-state', 'done');
    await expect(page.locator('#task-status-identity')).toHaveText(/^(완료|Complete)$/);
    expect(await css(page, '#task-status-identity', 'color')).toBe(DESK[country]);
    const mark = country === 'CA' ? await css(page, 'li:has(#task-status-identity)', 'border-left-color')
      : country === 'GB' ? await css(page, 'li:has(#task-status-identity)', 'background-color', '::after')
        : await css(page, 'li:has(#task-status-identity)', 'border-top-color');
    expect(mark).toBe(DESK[country]);
    if (country === 'NZ') {
      await expect(page.locator('#phase-link')).toHaveAttribute('data-phase-state', 'done');
      await expect(page.locator('#phase-handover')).toHaveAttribute('data-phase-state', 'open');
      await expect(page.locator('#phase-verify')).toHaveAttribute('data-phase-state', 'open');
      await expect(page.locator('#phase-verify span')).toBeVisible();
      await expect(page.locator('#phase-verify span')).toHaveText(/진행 전|Not yet/);
      // Phases are sequential: a note alone does not complete the hand-over while verification is open.
      await page.locator('#atlasNotes').fill('Application number on the cover differs; hand over.');
      await expect(page.locator('#phase-handover')).toHaveAttribute('data-phase-state', 'open');
      if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
      await page.locator('[data-ask]').first().click();
      await expect(page.locator('#phase-verify')).toHaveAttribute('data-phase-state', 'done');
      await expect(page.locator('#phase-handover')).toHaveAttribute('data-phase-state', 'done');
      await expect(page.locator('#phase-handover span')).toHaveText(/완료|Complete/);
    }
  }
});

for (const [width, height] of [[1024, 768], [768, 1024], [390, 844]]) {
  test(`country desks: no page overflow and the desk mark stays visible at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const country of ['CA', 'GB', 'NZ']) {
      await openDesk(page, country);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await css(page, '#atlasHeader', 'border-bottom-color')).toBe(DESK[country]);
      if (country === 'NZ' && width < 1024) await expect(page.locator('.atlas-tasks')).toHaveCSS('grid-template-columns', /^\S+$/); // one activity column
    }
  });
}

import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Foreign passenger portraits belong to ATLAS.');

async function enter(page, country) {
  await page.goto(ENTRY);
  await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="' + country + '"]').check();
  await page.locator('#atlasEnter').click();
  await expect(page.locator('body')).toHaveAttribute('data-country', country);
}

for (const [country, firstPortrait, nextPortrait] of [
  ['CA', 'TRV-0049.webp', 'TRV-0050.webp'],
  ['GB', 'TRV-0061.webp', 'TRV-0062.webp'],
  ['NZ', 'TRV-0073.webp', 'TRV-0074.webp']
]) {
  test(country + ': call reveals a unique living portrait and keeps it across rerenders', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await enter(page, country);
    await expect(page.locator('.atlas-stage-waiting')).toBeVisible();
    await expect(page.locator('.atlas-stage-portrait')).toHaveCount(0);
    await page.locator('#atlasCallPassenger').click();
    const image = page.locator('.atlas-stage-portrait img');
    await expect(image).toHaveAttribute('src', new RegExp(firstPortrait.replace('.', '\\.') + '$'));
    await expect.poll(() => image.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.atlas-stage-portrait.lp-live')).toHaveCount(1);
    await expect(image).toHaveAttribute('alt', /not identity evidence|신원 사진 아님/);
    await page.locator('#ask-source').click();
    await expect(page.locator('.atlas-stage-caption, .atlas-stage-portrait .stage-caption').last()).toHaveClass(/on/);
    await expect(page.locator('.atlas-stage-portrait')).toHaveCount(1);
    await page.locator('[data-case="SIM-' + country + '-02"]').click();
    await expect(page.locator('.atlas-stage-waiting')).toBeVisible();
    await page.locator('#atlasCallPassenger').click();
    await expect(page.locator('.atlas-stage-portrait img')).toHaveAttribute('src', new RegExp(nextPortrait.replace('.', '\\.') + '$'));
    await expect.poll(() => page.locator('.atlas-stage-portrait img').evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('international call/answers: voice is opt-in, uses the selected language and can be replayed', async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [{ lang: 'en-CA', localService: true }],
      speak: (u) => window.__spoken.push([u.text, u.lang]),
      cancel: () => window.__spoken.push(['cancel'])
    } });
  });
  await enter(page, 'CA');
  await page.locator('#atlasCallPassenger').click();
  expect(await page.evaluate(() => window.__spoken.some((x) => x[0] !== 'cancel'))).toBe(false);
  await expect(page.locator('#atlasHearToggle')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#atlasHearAgain').click(); // explicit user action enables the shared preference
  await expect(page.locator('#atlasHearToggle')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('inad-tts'))).toBe('1');
  let lines = await page.evaluate(() => window.__spoken.filter((x) => x[0] !== 'cancel'));
  expect(lines[0][1]).toBe('en-CA');
  await page.locator('#ask-source').click();
  lines = await page.evaluate(() => window.__spoken.filter((x) => x[0] !== 'cancel'));
  expect(lines.length).toBe(2);
  await page.locator('#atlasHearToggle').click();
  await expect(page.locator('#atlasHearToggle')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#ask-clarify').click();
  expect((await page.evaluate(() => window.__spoken.filter((x) => x[0] !== 'cancel'))).length).toBe(2);
});

test('international portrait and speech controls disappear when returning to Korean duty', async ({ page }) => {
  await enter(page, 'GB');
  await page.locator('#atlasCallPassenger').click();
  await expect(page.locator('.atlas-stage-portrait')).toHaveCount(1);
  await page.locator('#atlasCountry').click();
  await page.locator('[name="atlas-country"][value="KR"]').check();
  await page.locator('#atlasEnter').click();
  if (await page.locator('#atlasSwitch').count()) await page.locator('#atlasSwitch').click();
  await expect(page.locator('body')).toHaveAttribute('data-country', 'KR');
  await expect(page.locator('.atlas-stage-portrait')).toHaveCount(0);
  await expect(page.locator('#stagePortrait')).toHaveCount(1);
});

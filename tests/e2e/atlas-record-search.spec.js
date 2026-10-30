// Hotfix (PR #27 Codex P1): changing the record search after selecting a record fact
// must not lock overseas saving, and saves written in that state must recover on load.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('inad-atlas-v1')));

async function openCA02(page) {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="CA"]').check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', 'CA');
  await page.locator('[data-case="SIM-CA-02"]').click();
  await page.locator('#atlasCallPassenger').click();
}

test('record search: a selected record fact survives a new search without locking the save', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await openCA02(page);
  await page.locator('#atlasSearchForm button[type="submit"]').click();
  await page.locator('#fact-SIM-CA-02-F-ADDR').click();
  await expect(page.locator('#compareSlot1')).toHaveClass(/has-fact/);
  await page.locator('#atlasSearch').fill('zzz-no-such-record');
  await expect(page.locator('#atlasSearchForm + p')).toContainText(/없습니다|No synthetic/);
  // The hidden selection is released instead of being saved in an invalid state.
  await expect(page.locator('#compareSlot1')).not.toHaveClass(/has-fact/);
  await page.locator('#atlasNotes').fill('Saving must keep working after a narrower search.');
  await expect(page.locator('#atlasSaveStatus')).toContainText(/저장됨|Saved on this device/);
  await page.reload();
  await expect(page.locator('#atlasNotes')).toHaveValue('Saving must keep working after a narrower search.');
  await expect(page.locator('#atlasSaveStatus')).toContainText(/저장됨|Saved on this device/);
  expect((await stored(page)).sessions.CA.cases['SIM-CA-02'].graph.selectedFacts).toEqual([]);
  expect(errors).toEqual([]);
});

test('record search: a save written by the affected build recovers on load and other countries keep saving', async ({ page }) => {
  // Produce a real save, then put it into the exact state the PR #27 build could write.
  await openCA02(page);
  await page.locator('#atlasSearchForm button[type="submit"]').click();
  await page.locator('#fact-SIM-CA-02-F-ADDR').click();
  await page.locator('#atlasCountry').click(); await page.locator('[name="atlas-country"][value="NZ"]').check();
  await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  await page.locator('#atlasNotes').fill('New Zealand progress kept through recovery.');
  const broken = await stored(page);
  broken.sessions.CA.cases['SIM-CA-02'].search = 'zzz-no-such-record';
  await page.evaluate((raw) => localStorage.setItem('inad-atlas-v1', raw), JSON.stringify(broken));
  await page.reload();
  await expect(page.locator('#atlasNotes')).toHaveValue('New Zealand progress kept through recovery.');
  await expect(page.locator('#atlasSaveStatus')).toContainText(/저장됨|Saved on this device/);
  await page.locator('#atlasNotes').fill('New Zealand saves again after recovery.');
  const after = await stored(page);
  expect(after.sessions.NZ.cases[after.sessions.NZ.activeId].notes).toBe('New Zealand saves again after recovery.');
  expect(after.sessions.CA.cases['SIM-CA-02'].graph.selectedFacts).toEqual([]);
});

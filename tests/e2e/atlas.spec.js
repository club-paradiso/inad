import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import fs from 'node:fs';
import { atlasScenarios } from '../../src/data/atlas-scenarios.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');
async function openAtlas(page, country = 'CA') {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await expect(page.locator('[name="atlas-country"]')).toHaveCount(4);
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', country);
  await page.locator('#atlasSystem').click();
}
async function task(page, id) { if (await page.locator('#taskNav').isVisible()) await page.locator(`#taskNav [data-task="${id}"]`).click(); }
async function recordSearch(page) {
  if (await page.locator('.atlas-history').count() && !await page.locator('.atlas-history').evaluate(el => el.open)) await page.locator('.atlas-history summary').click();
  await page.locator('#atlasSearchForm button[type="submit"]').click();
  await page.locator('[data-record]').first().click();
}
async function reviewCase(page, country, number) {
  const id = `SIM-${country}-${number}`;
  await task(page, 'passenger'); await page.locator(`[data-case="${id}"]`).click();
  await task(page, 'interview'); await page.locator('#ask-clarify').click();
  await task(page, 'evidence'); await recordSearch(page);
  for (const suffix of ['DOC1', 'DOC2']) { await page.locator(`#doc-${id}-${suffix}`).click(); await page.locator('#atlasReviewDoc').click(); }
  await task(page, 'assessment'); await page.locator('#atlasNotes').fill('Compared original documents and statement; unresolved facts retained for follow-up.');
  await task(page, 'evidence');
  for (const check of ['identity','evidence','handover']) await page.locator(`#task-${check}`).click();
  await task(page, 'assessment'); await page.locator('#atlasPrepare').click();
  await expect(page.locator('#atlasOutcomeCancel')).toBeFocused();
  const outcome = country === 'GB' ? (number === '01' ? 'evidence' : number === '02' ? 'review' : 'complete') : number === '01' ? 'review' : number === '02' ? 'evidence' : 'complete';
  await page.locator('#atlasOutcome').selectOption(outcome);
  await page.locator('#atlasConfirmOutcome').click(); await expect(page.locator('.atlas-debrief')).toBeVisible();
  await expect(page.locator('.atlas-debrief')).toContainText(/일치|Matches/);
}
for (const country of ['CA', 'GB', 'NZ']) test(`${country}: all three authored cases reach a debrief through actual controls`, async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await openAtlas(page, country);
  for (const num of ['01', '02', '03']) await reviewCase(page, country, num);
  expect(errors).toEqual([]);
  const payload = await page.evaluate(() => JSON.parse(localStorage.getItem('inad-atlas-v1')));
  expect(Object.values(payload.sessions[country].cases).filter(c => c.completed)).toHaveLength(3);
  expect(await page.evaluate(() => localStorage.getItem('inad-progress-v54'))).toBeNull();
});

test('view, refresh and country round trips retain case evidence and draft; empty search recovers', async ({ page }) => {
  await openAtlas(page);
  await page.locator('#ask-clarify').click(); await page.locator('#atlasNotes').fill('Draft note that must survive switching.');
  await page.locator('#atlasNextPage').click(); await page.locator('#atlasZoom').selectOption('150');
  await page.locator('#atlasSearch').fill('no-such-record'); await expect(page.locator('#atlasSearchForm + p')).toContainText(/없습니다|No synthetic/);
  await page.locator('#atlasResetSearch').click(); await page.locator('[data-record]').first().click();
  const snapshot = () => page.evaluate(() => window.INADTest.state().atlas.sessions.CA.cases['SIM-CA-01']);
  const before = await snapshot();
  await page.locator('#atlasCounter').click(); await page.locator('#atlasSystem').click(); expect(await snapshot()).toEqual(before);
  await page.locator('#atlasCountry').click(); await page.locator('[value="NZ"][name="atlas-country"]').check(); await page.locator('#atlasEnter').click();
  await expect(page.locator('#atlasStay')).toBeFocused(); await page.locator('#atlasStay').click(); await expect(page.locator('body')).toHaveAttribute('data-country', 'CA');
  await page.locator('#atlasCountry').click(); await page.locator('[value="NZ"][name="atlas-country"]').check(); await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  await page.locator('#atlasCountry').click(); await page.locator('[value="CA"][name="atlas-country"]').check(); await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  expect(await snapshot()).toEqual(before);
  await page.reload(); await expect(page.locator('#atlasNotes')).toHaveValue(before.notes); expect(await snapshot()).toEqual(before);
});

test('Korean live interview resumes after country switch, with original transcript and input', async ({ page }) => {
  await page.goto(ENTRY); await page.locator('#liveStartBtn').click();
  const call = page.locator('#callout'); if (await call.isVisible()) await call.locator('button').click();
  await page.locator('#askInput').fill('Keep this Korean draft');
  const before = await page.evaluate(() => window.INADTest.state());
  await page.locator('#moreBtn').click(); await page.locator('#atlasMenuCountry').click();
  await page.locator('[name="atlas-country"][value="GB"]').check(); await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  await page.locator('#atlasCountry').click(); await page.locator('[name="atlas-country"][value="KR"]').check(); await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  const after = await page.evaluate(() => window.INADTest.state());
  expect(after.asked).toEqual(before.asked); expect(after.caseIndex).toBe(before.caseIndex); expect(after.stage).toBe(before.stage);
  await expect(page.locator('#askInput')).toHaveValue('Keep this Korean draft'); await expect(page.locator('#pName')).not.toHaveText('—');
});

test('future data and unsupported country remain protected; failed writes are visible', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('inad-atlas-v1', '{"version":99,"sessions":{}}'); localStorage.setItem('inad-country','JP'); });
  await page.goto(ENTRY); await expect(page.locator('#modalBody')).toContainText(/지원하지|unsupported/);
  await page.locator('[name="atlas-country"][value="CA"]').check(); await page.locator('#atlasEnter').click();
  await expect(page.locator('#atlasSaveStatus')).toContainText(/보호|protected/);
  expect(await page.evaluate(() => localStorage.getItem('inad-atlas-v1'))).toBe('{"version":99,"sessions":{}}');
});

for (const country of ['CA','GB','NZ']) for (const width of [1440,1024,768,390]) test(`${country} responsive ${width}: navigation, focus, overflow and 44px controls`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 }); await openAtlas(page, country);
  await task(page,'evidence');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const small = await page.locator('#atlasHeader button, #mainContent button, #taskNav button').evaluateAll(nodes => nodes.filter(n => n.getClientRects().length && !n.disabled).filter(n => { const r=n.getBoundingClientRect(); return r.width < 43.5 || r.height < 43.5; }).map(n=>n.id || n.textContent));
  expect(small).toEqual([]);
  await page.locator('#atlasCountry').focus(); await page.keyboard.press('Enter'); await expect(page.locator('#modal')).toHaveAttribute('aria-hidden','false');
  await page.keyboard.press('Escape'); await expect(page.locator('#atlasCountry')).toBeFocused();
  await task(page,'interview'); await page.locator('#ask-clarify').click(); await expect(page.locator('.atlas-transcript')).toContainText(atlasScenarios(country)[0].questions[0].answer.en);
  await task(page,'evidence');
  if (process.env.ATLAS_SCREENSHOTS) { fs.mkdirSync(process.env.ATLAS_SCREENSHOTS,{recursive:true}); await page.screenshot({ path: `${process.env.ATLAS_SCREENSHOTS}/${country.toLowerCase()}-${width}.png` }); }
});

test('overseas export/import round trip and failed-write recovery copy preserve draft input', async ({ page }) => {
  await openAtlas(page, 'NZ'); await page.locator('#atlasNotes').fill('A portable NZ note and evidence handover.');
  await page.locator('#atlasData').click();
  const downloadPromise = page.waitForEvent('download'); await page.locator('#atlasExportDraft').click();
  const download = await downloadPromise; const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(exported.payload['inad-country']).toBe('NZ');
  expect(JSON.parse(exported.payload['inad-atlas-v1']).sessions.NZ.cases['SIM-NZ-01'].notes).toBe('A portable NZ note and evidence handover.');
  await page.keyboard.press('Escape'); await page.locator('#atlasNotes').fill('Changed after export.');
  await page.locator('#atlasData').click(); await page.locator('#atlasImport').click();
  await page.locator('#sysImportFile').setInputFiles({ name: 'atlas.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
  await page.locator('#sysConfirmImport').click(); await expect(page.locator('#atlasNotes')).toHaveValue('A portable NZ note and evidence handover.');
  const raw = await page.evaluate(() => localStorage.getItem('inad-atlas-v1'));
  await page.evaluate(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(k,v) { if(k === 'inad-atlas-v1') throw new DOMException('Full','QuotaExceededError'); return original.call(this,k,v); }; });
  await page.locator('#atlasNotes').fill('New draft despite unavailable storage.'); await expect(page.locator('#atlasSaveStatus')).toContainText(/실패|failed/);
  await page.locator('#atlasData').click(); const recoveryPromise=page.waitForEvent('download'); await page.locator('#atlasExportDraft').click();
  const recovery=await recoveryPromise; const copied=JSON.parse(fs.readFileSync(await recovery.path(),'utf8'));
  expect(JSON.parse(copied.payload['inad-atlas-v1']).sessions.NZ.cases['SIM-NZ-01'].notes).toBe('New draft despite unavailable storage.');
  expect(await page.evaluate(() => localStorage.getItem('inad-atlas-v1'))).toBe(raw);
});

test('country choice survives language change; keyboard checks show visible prerequisite errors', async ({ page }) => {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click(); await page.locator('[name="atlas-country"][value="GB"]').check();
  await page.locator('#atlasLocale').selectOption('en'); await expect(page.locator('[name="atlas-country"][value="GB"]')).toBeChecked();
  await page.locator('#atlasEnter').focus(); await page.keyboard.press('Enter'); await page.locator('#atlasSystem').click();
  await page.locator('#task-identity').focus(); await page.keyboard.press('Enter'); await expect(page.locator('#atlasTaskError')).toContainText('Review the linked document');
  await page.locator('#atlasSettings').click(); await page.locator('[data-pref-toggle="contrast"]').click(); await page.locator('[data-pref-toggle="reduceMotion"]').click(); await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveClass(/pref-contrast/); await expect(page.locator('body')).toHaveClass(/pref-reduce-motion/);
  await page.setViewportSize({width:768,height:1024}); await task(page,'passenger'); await expect(page.locator('#taskNav [data-task="passenger"]')).toHaveAttribute('aria-current','true');
});

test('selected workspace focus remains readable when hovered', async ({ page }) => {
  await openAtlas(page); await page.locator('#atlasSystem').hover();
  const ratio = await page.locator('#atlasSystem').evaluate(el => {
    const c=getComputedStyle(el), luminance=s=>{const channels=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
    const a=luminance(c.color),b=luminance(c.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test('another open tab cannot silently overwrite newer international notes', async ({ page, context }) => {
  await openAtlas(page, 'CA');
  const other = await context.newPage();
  await other.goto(ENTRY);
  await expect(other.locator('body')).toHaveAttribute('data-country', 'CA');
  await other.locator('#atlasSystem').click();
  await page.locator('#atlasNotes').fill('Evidence comparison saved by the first browser tab.');
  await expect(other.locator('#atlasSaveStatus')).toContainText(/다른 탭|Another tab/);
  const preserved = await page.evaluate(() => localStorage.getItem('inad-atlas-v1'));
  await other.locator('#atlasNotes').fill('Stale tab draft that must remain local only.');
  await expect(other.locator('#atlasSaveStatus')).toContainText(/다른 탭|Another tab/);
  expect(await other.evaluate(() => localStorage.getItem('inad-atlas-v1'))).toBe(preserved);
  await other.locator('#atlasData').click();
  const downloadPromise = other.waitForEvent('download');
  await other.locator('#atlasExportDraft').click();
  const download = await downloadPromise;
  const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(JSON.parse(exported.payload['inad-atlas-v1']).sessions.CA.cases['SIM-CA-01'].notes)
    .toBe('Stale tab draft that must remain local only.');
  await other.close();
});

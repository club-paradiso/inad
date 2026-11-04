import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import fs from 'node:fs';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';
await loadAtlasLibraries();

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
  if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
  await task(page, 'interview'); await page.locator('#ask-clarify').click();
  await task(page, 'evidence'); await recordSearch(page);
  // v11: legacy cases may carry extra documents; opening each document records its review.
  for (const doc of atlasScenarios(country).find((c) => c.id === id).documents) { await page.locator(`#doc-${doc.id}`).click(); }
  await task(page, 'assessment'); await page.locator('#atlasNotes').fill('Compared original documents and statement; unresolved facts retained for follow-up.');
  await task(page, 'evidence');
  // v11: the review checks complete themselves from the documents, interview and note above.
  for (const check of ['identity','evidence','handover']) await expect(page.locator(`#task-status-${check}`)).toHaveText(/^(완료|Complete)$/);
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
  if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
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
  // The callout auto-dismisses; WebKit can hide it between isVisible and click.
  // Wait for the real transition instead of racing its optional skip control.
  await expect(page.locator('#callout')).toBeHidden({ timeout: 10_000 });
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
  await task(page,'passenger');
  if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
  await task(page,'evidence');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const small = await page.locator('#atlasHeader button, #mainContent button, #taskNav button').evaluateAll(nodes => nodes.filter(n => n.getClientRects().length && !n.disabled).filter(n => { const r=n.getBoundingClientRect(); return r.width < 43.5 || r.height < 43.5; }).map(n=>n.id || n.textContent));
  expect(small).toEqual([]);
  await page.locator('#atlasCountry').focus(); await page.keyboard.press('Enter'); await expect(page.locator('#modal')).toHaveAttribute('aria-hidden','false');
  await page.keyboard.press('Escape'); await expect(page.locator('#atlasCountry')).toBeFocused();
  await task(page,'interview'); await page.locator('#ask-clarify').click(); await expect(page.locator('.atlas-transcript')).toContainText(atlasScenarios(country)[0].questions.find((q) => q.id === 'clarify').answer.en);
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

test('country choice survives language change; review checks show what they still need', async ({ page }) => {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click(); await page.locator('[name="atlas-country"][value="GB"]').check();
  await page.locator('#atlasLocale').selectOption('en'); await expect(page.locator('[name="atlas-country"][value="GB"]')).toBeChecked();
  await page.locator('#atlasEnter').focus(); await page.keyboard.press('Enter'); await page.locator('#atlasSystem').click();
  await expect(page.locator('#task-status-identity')).toHaveText('Open the linked document'); await expect(page.locator('#task-identity')).toHaveCount(0);
  await page.locator('#atlasSettings').click(); await page.locator('[data-pref-toggle="contrast"]').click(); await page.locator('[data-pref-toggle="reduceMotion"]').click(); await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveClass(/pref-contrast/); await expect(page.locator('body')).toHaveClass(/pref-reduce-motion/);
  await page.setViewportSize({width:768,height:1024}); await task(page,'passenger'); await expect(page.locator('#taskNav [data-task="passenger"]')).toHaveAttribute('aria-current','true');
});

test('review checks: complete on their own as the work is done, never wait on the note, and survive a reload', async ({ page }) => {
  await openAtlas(page, 'GB');
  const c = atlasScenarios('GB').find((x) => x.id === 'SIM-GB-01');
  await task(page, 'passenger'); await page.locator('[data-case="SIM-GB-01"]').click();
  const status = (id) => page.locator(`#task-status-${id}`);
  await expect(page.locator('.atlas-tasks button:not([data-doc])')).toHaveCount(0);   // nothing to tick by hand
  for (const t of c.tasks) await expect(status(t.id)).not.toHaveText(/^(완료|Complete)$/);
  await task(page, 'evidence');
  for (const d of c.documents) { await page.locator(`#doc-${d.id}`).click(); }   // opening a document records its review
  await expect(status('identity')).toHaveText(/^(완료|Complete)$/);
  await expect(status('evidence')).toHaveText(/질문 또는 기록 대조 필요|Ask a question or compare a record/);
  await expect(status('handover')).toHaveText(/^(완료|Complete)$/);              // handover follows the linked document, never the note
  await expect(page.locator('#atlasTaskCount')).toHaveText(`2/${c.tasks.length}`);
  await task(page, 'assessment'); await page.locator('#atlasNotes').fill('short');
  await expect(status('handover')).toHaveText(/^(완료|Complete)$/);              // the note is a working memo: it never gates a check
  await page.locator('#atlasNotes').fill('Itinerary referenced but not received.');
  await task(page, 'interview'); if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  await expect(status('evidence')).toHaveText(/^(완료|Complete)$/);
  // (The check-change announcement still fires, but the live region's final text after an ask is the
  // answer-recorded announcement by design, so the old final-text ordering assertion no longer applies.)
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-country', 'GB');
  for (const t of c.tasks) await expect(status(t.id)).toHaveText(/^(완료|Complete)$/);
  await expect(page.locator('#atlasTaskCount')).toHaveText(`${c.tasks.length}/${c.tasks.length}`);  // A save from the button era (checks never pressed) shows the same derived rows and count.
  await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem('inad-atlas-v1')); raw.sessions.GB.cases['SIM-GB-01'].tasks = []; localStorage.setItem('inad-atlas-v1', JSON.stringify(raw)); });
  await page.reload();
  for (const t of c.tasks) await expect(status(t.id)).toHaveText(/^(완료|Complete)$/);
  await expect(page.locator('#atlasTaskCount')).toHaveText(`${c.tasks.length}/${c.tasks.length}`);
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

for (const country of ['CA', 'GB', 'NZ']) test(`${country}: optional case-specific cross-check persists and is visible in assessment`, async ({ page }) => {
  await openAtlas(page, country);
  if (await page.locator('#atlasCallPassenger').isVisible()) await page.locator('#atlasCallPassenger').click();
  const followup = atlasScenarios(country).find((c) => c.id === `SIM-${country}-01`).questions.find(q => q.id === 'crosscheck');
  await page.locator('#ask-crosscheck').click();
  await expect(page.locator('.atlas-transcript')).toContainText(followup.answer.en);
  await expect(page.locator('.zone-assessment')).toContainText('추가 원문 교차 질문 확인됨');
  await page.reload();
  await expect(page.locator('.atlas-transcript')).toContainText(followup.answer.en);
  await expect(page.locator('.zone-assessment')).toContainText('추가 원문 교차 질문 확인됨');
});

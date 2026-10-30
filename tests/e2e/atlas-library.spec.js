// v11 reachability: every authored international case is played through the real UI
// (call → interview → records → documents → comparisons → requests → outcome → debrief → next).
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');
test.describe.configure({ timeout: 300_000 });

async function openCountry(page, country) {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', country);
}
async function search(page) {
  if (await page.locator('.atlas-history').count() && !await page.locator('.atlas-history').evaluate((el) => el.open)) await page.locator('.atlas-history summary').click();
  await page.locator('#atlasSearchForm button[type="submit"]').click();
}
async function pick(page, c, f) {
  if (f.sourceType === 'document') {
    await page.locator(`#doc-${f.sourceId}`).click();
    const want = f.page || 0;
    for (let guard = 0; guard < 4; guard++) {
      const [cur] = (await page.locator('.atlas-doc-tools span').first().textContent()).split('/').map((n) => Number(n.trim()) - 1);
      if (cur === want) break;
      await page.locator(cur < want ? '#atlasNextPage' : '#atlasPrevPage').click();
    }
  }
  if (f.sourceType === 'record') await search(page);
  await page.locator(`#fact-${f.id}`).click();
}
async function play(page, c, outcome) {
  await page.locator(`[data-case="${c.id}"]`).click();
  await expect(page.locator('#atlasCaseHeading')).toContainText(c.id);
  await page.locator('#atlasCallPassenger').click();
  await expect(page.locator('.atlas-opening')).toContainText(c.opening.en);
  for (const q of c.questions) await page.locator(`#ask-${q.id}`).click();
  await search(page); await page.locator('[data-record]').first().click();
  const done = new Set();
  for (let progress = true; progress;) {
    progress = false;
    for (const cmp of c.comparisons) {
      if (done.has(cmp.id)) continue;
      const ready = await Promise.all(cmp.facts.map((id) => page.locator(`#fact-${id}`).count().then((n) => n > 0 || c.facts.find((f) => f.id === id).sourceType === 'document')));
      if (!ready.every(Boolean)) continue;
      if (await page.locator('#atlasClearFacts').isEnabled()) await page.locator('#atlasClearFacts').click();
      for (const id of cmp.facts) await pick(page, c, c.facts.find((f) => f.id === id));
      await page.locator('#atlasDoCompare').click();
      await expect(page.locator('.atlas-result-box')).toHaveClass(new RegExp(`type-${cmp.type.toLowerCase()}`));
      done.add(cmp.id); progress = true;
      // A follow-up can be unlocked by several comparisons; ask/request each only once.
      for (const q of cmp.unlocks?.questions || []) if (await page.locator(`#ask-${q}`).isEnabled()) await page.locator(`#ask-${q}`).click();
      for (const r of cmp.unlocks?.evidenceRequests || []) if (c.assessment.resolve.requests.includes(r) && await page.locator(`#request-${r}`).count()) await page.locator(`#request-${r}`).click();
    }
  }
  expect(done.size).toBe(c.comparisons.length);
  for (const d of c.documents) { await page.locator(`#doc-${d.id}`).click(); await page.locator('#atlasReviewDoc').click(); }
  await page.locator('#atlasNotes').fill('Compared the sources; outcome and unresolved points recorded.');
  for (const t of c.tasks) await page.locator(`#task-${t.id}`).click();
  await page.locator('#atlasPrepare').click();
  await page.locator('#atlasOutcome').selectOption(outcome);
  await page.locator('#atlasConfirmOutcome').click();
  await expect(page.locator('.atlas-debrief')).toBeVisible();
}

for (const country of ['CA', 'GB', 'NZ']) test(`${country}: every authored case is reachable and completes through the UI`, async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await openCountry(page, country);
  const cases = atlasScenarios(country);
  for (const c of cases) {
    await play(page, c, c.expectedOutcome);
    await expect(page.locator('.atlas-debrief')).toContainText(/근거 일치|Matches evidence/);
    await expect(page.locator('.debrief-rating')).toHaveClass(/rating-thorough/);
  }
  await expect(page.locator('.atlas-debrief')).toContainText(/모든 사건|All cases/);
  await expect(page.locator('.atlas-progress')).toContainText(`${cases.length}/${cases.length}`);
  const saved = await page.evaluate((cc) => JSON.parse(localStorage.getItem('inad-atlas-v1')).sessions[cc].cases, country);
  expect(Object.values(saved).filter((v) => v.completed)).toHaveLength(cases.length);
  await page.reload();
  await expect(page.locator('.atlas-progress')).toContainText(`${cases.length}/${cases.length}`);
  expect(errors).toEqual([]);
});

test('an unsupported outcome gets explanatory feedback, and the queue moves on to the next case', async ({ page }) => {
  await openCountry(page, 'GB');
  const [first, second] = atlasScenarios('GB');
  const wrong = ['complete', 'evidence', 'review'].find((o) => o !== first.expectedOutcome);
  await play(page, first, wrong);
  await expect(page.locator('.atlas-debrief')).toContainText(/근거 재확인|Check evidence/);
  await expect(page.locator('.atlas-debrief')).toContainText(first.outcomeFeedback[wrong].ko);
  await expect(page.locator('.debrief-rating')).toHaveClass(/rating-incomplete/);
  await page.locator('#atlasNextCase').click();
  await expect(page.locator('#atlasCaseHeading')).toContainText(second.id);
  // Replay the first case from the queue: confirmation is required and other work is kept.
  await page.locator(`[data-case="${first.id}"]`).click();
  await page.locator('#atlasRestartCase').click();
  await page.locator('#atlasRestartConfirm').click();
  await expect(page.locator('#atlasCallPassenger')).toBeVisible();
});

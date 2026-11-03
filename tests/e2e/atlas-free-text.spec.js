// Overseas free-text questions through the real UI.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';
import { resolveAtlasUtterance } from '../../src/js/engines/atlas-intent.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');
const CA01 = atlasScenarios('CA').find((c) => c.id === 'SIM-CA-01');

async function openCA01(page) {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="CA"]').check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', 'CA');
  await task(page, 'passenger'); // on phones only one zone is shown
  await page.locator('[data-case="SIM-CA-01"]').click();
}
async function task(page, id) { if (await page.locator('#taskNav').isVisible()) await page.locator(`#taskNav [data-task="${id}"]`).click(); }

test('free text: typed questions in either language record the canonical answer; unclear text asks nothing', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await openCA01(page);
  await expect(page.locator('#atlasAskInput')).toBeDisabled();
  await page.locator('#atlasCallPassenger').click();
  const source = CA01.questions.find((q) => q.id === 'source'), cross = CA01.questions.find((q) => q.id === 'crosscheck');
  // Enter submits; focus stays in the box for the next question.
  await page.locator('#atlasAskInput').fill(source.q.en.toLowerCase().replace('?', ''));
  await page.locator('#atlasAskInput').press('Enter');
  await expect(page.locator('.atlas-transcript')).toContainText(source.answer.en);
  await expect(page.locator('#atlasAskStatus')).toContainText(/질문했습니다|Asked/);
  await expect(page.locator('#atlasAskInput')).toBeFocused();
  await expect(page.locator('#atlasAskInput')).toHaveValue('');
  await expect(page.locator('#ask-source')).toBeDisabled();
  await page.locator('#atlasAskInput').fill(cross.q.ko);
  await page.locator('#atlasAskForm button[type="submit"]').click();
  await expect(page.locator('.atlas-transcript')).toContainText(cross.answer.en);
  const asked = () => page.evaluate(() => window.INADTest.state().atlas.sessions.CA.cases['SIM-CA-01'].asked);
  const before = await asked();
  await page.locator('#atlasAskInput').fill('what is the weather like today');
  await page.locator('#atlasAskInput').press('Enter');
  await expect(page.locator('#atlasAskStatus')).toContainText(/알아듣지 못했습니다|not understood/);
  await expect(page.locator('#atlasAskInput')).toHaveValue('what is the weather like today');
  expect(await asked()).toEqual(before);
  // Typed text is interpreted, never saved.
  expect(await page.evaluate(() => localStorage.getItem('inad-atlas-v1'))).not.toContain('weather');
  expect(errors).toEqual([]);
});

test('free text: a low-confidence match asks for confirmation before anything is recorded', async ({ page }) => {
  // Find, from the case data, a shortened wording the matcher is unsure about (deterministic).
  let probe = null;
  for (const q of CA01.questions) for (const lang of ['en', 'ko']) {
    const words = q.q[lang].replace(/[?.,]/g, '').split(/\s+/);
    for (let n = 1; n < words.length && !probe; n++) {
      const t = words.slice(0, n).join(' '); const r = resolveAtlasUtterance(t, CA01.questions);
      if (r.kind === 'confirm' && r.questionId === q.id) probe = { t, id: q.id };
    }
  }
  expect(probe, 'case data yields a low-confidence wording').not.toBeNull();
  await openCA01(page); await page.locator('#atlasCallPassenger').click();
  await page.locator('#atlasAskInput').fill(probe.t);
  await page.locator('#atlasAskInput').press('Enter');
  await expect(page.locator('#atlasAskStatus')).toContainText(/하려는 건가요|Did you mean/);
  expect(await page.evaluate(() => window.INADTest.state().atlas.sessions.CA.cases['SIM-CA-01'].asked)).toEqual([]);
  await page.locator('#atlasAskCancel').click();
  await expect(page.locator('#atlasAskStatus')).toBeEmpty();
  await page.locator('#atlasAskInput').press('Enter');
  await page.locator('#atlasAskConfirm').click();
  expect(await page.evaluate(() => window.INADTest.state().atlas.sessions.CA.cases['SIM-CA-01'].asked)).toEqual([probe.id]);
});

test('free text at 390px: no horizontal overflow and 44px controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCA01(page);
  await task(page, 'passenger'); await page.locator('#atlasCallPassenger').click();
  await task(page, 'interview');
  await page.locator('#atlasAskInput').fill('what is the weather like today'); await page.locator('#atlasAskInput').press('Enter');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const small = await page.locator('#atlasAskForm button, #atlasAskInput').evaluateAll((ns) => ns.filter((n) => n.getClientRects().length).filter((n) => { const r = n.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((n) => n.id || n.textContent));
  expect(small).toEqual([]);
});

test('free text: a document request asks nothing; Replay clears the previous attempt\'s typed state', async ({ page }) => {
  await openCA01(page); await page.locator('#atlasCallPassenger').click();
  await page.locator('#atlasAskInput').fill('Can I see your passport?'); await page.locator('#atlasAskInput').press('Enter');
  await expect(page.locator('#atlasAskStatus')).toContainText(/자료 영역|evidence area/);
  expect(await page.evaluate(() => window.INADTest.state().atlas.sessions.CA.cases['SIM-CA-01'].asked)).toEqual([]);
  // Finish the case with a typed question on screen, then replay it.
  const clarify = CA01.questions.find((q) => q.id === 'clarify');
  await page.locator('#atlasAskInput').fill(clarify.q.en); await page.locator('#atlasAskInput').press('Enter');
  await expect(page.locator('#atlasAskStatus')).toContainText(/질문했습니다|Asked/);
  await page.locator('#atlasAskInput').fill('draft that must not survive a replay');
  await page.locator('#atlasSearchForm button[type="submit"]').click(); await page.locator('[data-record]').first().click();
  for (const d of CA01.documents) { await page.locator(`#doc-${d.id}`).click(); await page.locator('#atlasReviewDoc').click(); }
  await page.locator('#atlasNotes').fill('Compared the ticket and the visit record; dates conflict.');
  for (const t of CA01.tasks) await page.locator(`#task-${t.id}`).click();
  await page.locator('#atlasPrepare').click(); await page.locator('#atlasOutcome').selectOption('review');
  await page.locator('#atlasConfirmOutcome').click();
  await page.locator('#atlasRestartCase').click(); await page.locator('#atlasRestartConfirm').click();
  await page.locator('#atlasCallPassenger').click();
  await expect(page.locator('#atlasAskStatus')).toBeEmpty();
  await expect(page.locator('#atlasAskInput')).toHaveValue('');
  await expect(page.locator('[data-ask-choice]')).toHaveCount(0);
});

// Overseas read-aloud: off by default, speaks only canonical answers and the opening statement in the
// interview language, never while the microphone is open, and never after the player has moved on.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');

// Stand-in speech synthesis: an ordered log of ['speak', text, lang] and ['cancel'] calls.
const installSynth = () => {
  window.__tts = [];
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => [{ lang: 'en-GB', localService: true }, { lang: 'ko-KR', localService: true }],
    speak: (u) => window.__tts.push(['speak', u.text, u.lang]),
    cancel: () => window.__tts.push(['cancel'])
  } });
};
// Stand-in recogniser that stays open until stopped or aborted, and records whether it is live.
const installMic = () => {
  window.__mic = { live: 0 };
  class R { start() { window.__mic.live++; this.on = true; } stop() { this.end(); } abort() { this.end(); } end() { if (this.on) { this.on = false; window.__mic.live--; setTimeout(() => this.onend?.(), 5); } } }
  window.SpeechRecognition = R; window.webkitSpeechRecognition = R;
};
const log = (page) => page.evaluate(() => window.__tts);
const spoken = async (page, from = 0) => (await log(page)).slice(from).filter((x) => x[0] === 'speak').map(([, text, lang]) => ({ text, lang }));
// After the player moves on: nothing new was spoken and the last call was a cancel.
async function expectSilencedSince(page, mark) {
  const after = (await log(page)).slice(mark);
  expect(after.filter((x) => x[0] === 'speak')).toEqual([]);
  expect(after.at(-1)).toEqual(['cancel']);
}
const GB01 = atlasScenarios('GB').find((c) => c.id === 'SIM-GB-01');
const answer = (id, lang = 'en') => GB01.questions.find((q) => q.id === id).answer[lang];
async function openGB01(page, { on = false, mic = false, language = null } = {}) {
  await page.addInitScript(installSynth);
  if (mic) { await page.addInitScript(installMic); await page.addInitScript(() => localStorage.setItem('inad-voice', 'browser')); }
  if (on) await page.addInitScript(() => localStorage.setItem('inad-tts', '1'));
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="GB"]').check();
  if (language) await page.locator('#atlasInterviewLanguage').selectOption(language);
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', 'GB');
  await page.locator('[data-case="SIM-GB-01"]').click();
}

test('read-aloud is off by default: asking speaks nothing, captions are shown', async ({ page }) => {
  await openGB01(page);
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  await expect(page.locator('.atlas-transcript')).toContainText(answer('source'));
  expect(await spoken(page)).toEqual([]);
});

test('read-aloud: switched on in the overseas settings, speaks the opening and canonical answers only', async ({ page }) => {
  await openGB01(page);
  await page.locator('#atlasSettings').click();
  await expect(page.locator('#atlasTtsToggle')).toHaveAttribute('aria-checked', 'false');
  await page.locator('#atlasTtsToggle').click();
  await expect(page.locator('#atlasTtsToggle')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#atlasTtsToggle')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('inad-tts'))).toBe('1'); // shared with the Korean switch
  await page.keyboard.press('Escape'); await expect(page.locator('#modal')).toHaveAttribute('aria-hidden', 'true');
  await page.locator('#atlasCallPassenger').click();
  const source = GB01.questions.find((q) => q.id === 'source');
  await page.locator('#atlasAskInput').fill(source.q.en); await page.locator('#atlasAskInput').press('Enter');
  await page.locator('#ask-crosscheck').click();
  expect(await spoken(page)).toEqual([
    { text: GB01.opening.en, lang: 'en-GB' }, { text: answer('source'), lang: 'en-GB' }, { text: answer('crosscheck'), lang: 'en-GB' }
  ]);
  // Not spoken: an unclear question, a low-confidence match awaiting confirmation, a repeated question.
  for (const t of ['what is the weather like today', 'documents', source.q.ko]) { await page.locator('#atlasAskInput').fill(t); await page.locator('#atlasAskInput').press('Enter'); }
  await expect(page.locator('#atlasAskStatus')).toContainText(/이미 한 질문|Already asked/);
  expect(await spoken(page)).toHaveLength(3);
});

test('read-aloud: a Korean interview language reads the Korean answer with ko-KR', async ({ page }) => {
  await openGB01(page, { on: true, language: 'ko' });
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  expect((await spoken(page)).at(-1)).toEqual({ text: answer('source', 'ko'), lang: 'ko-KR' });
});

test('read-aloud never speaks into an open microphone; choosing a listed question ends listening first', async ({ page }) => {
  await openGB01(page, { on: true, mic: true });
  await page.locator('#atlasCallPassenger').click();
  const mark = (await log(page)).length;
  await page.locator('#atlasAskMic').click();
  await expect.poll(() => page.evaluate(() => window.__mic.live)).toBe(1);
  await expectSilencedSince(page, mark);                 // the opening was cut before listening
  await page.locator('#ask-source').click();             // a listed question while listening
  expect(await page.evaluate(() => window.__mic.live)).toBe(0);
  await expect(page.locator('#atlasAskMic')).toHaveAttribute('aria-pressed', 'false');
  expect((await spoken(page, mark)).at(-1)).toEqual({ text: answer('source'), lang: 'en-GB' });
});

for (const [name, leave] of [
  ['switching case', async (page) => page.locator('[data-case="SIM-GB-02"]').click()],
  ['opening the country selector', async (page) => page.locator('#atlasCountry').click()],
  ['opening settings', async (page) => page.locator('#atlasSettings').click()],
  ['opening save data', async (page) => page.locator('#atlasData').click()],
  ['preparing the outcome', async (page) => page.locator('#atlasPrepare').click()],
  ['hiding the tab', async (page) => page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); })]
]) test(`read-aloud stops and stays silent after ${name}`, async ({ page }) => {
  await openGB01(page, { on: true });
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  const mark = (await log(page)).length;
  await leave(page);
  await expectSilencedSince(page, mark);
});

test('read-aloud stops on Replay and switching to Korea, and nothing is spoken there', async ({ page }) => {
  await openGB01(page, { on: true });
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  // Replay needs a completed case: finish it through the UI (the UK desk keeps records under case history).
  if (!await page.locator('.atlas-history').evaluate((el) => el.open)) await page.locator('.atlas-history summary').click();
  await page.locator('#atlasSearchForm button[type="submit"]').click();
  await page.locator('[data-record]').first().click();
  await page.locator('#atlasNotes').fill('Handover note references an itinerary that was not received.');
  await page.locator('#atlasPrepare').click(); await page.locator('#atlasOutcome').selectOption('evidence');
  await page.locator('#atlasConfirmOutcome').click();
  let mark = (await log(page)).length;
  await page.locator('#atlasRestartCase').click();
  await expectSilencedSince(page, mark);
  await page.locator('#atlasRestartConfirm').click();
  await page.locator('#atlasCallPassenger').click();
  mark = (await log(page)).length;
  await page.locator('#atlasCountry').click(); await page.locator('[name="atlas-country"][value="KR"]').check();
  await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click({ timeout: 2000 }).catch(() => {});
  await expect(page.locator('body')).toHaveAttribute('data-country', 'KR');
  await expectSilencedSince(page, mark);
});

test('read-aloud: without speech synthesis the switch is disabled and nothing breaks', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined }); window.SpeechSynthesisUtterance = undefined; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('inad-tts', '1'));
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="GB"]').check(); await page.locator('#atlasEnter').click();
  await page.locator('#atlasCallPassenger').click(); await page.locator('#ask-source').click();
  await page.locator('#atlasSettings').click();
  await expect(page.locator('#atlasTtsToggle')).toBeDisabled();
  expect(errors).toEqual([]);
});

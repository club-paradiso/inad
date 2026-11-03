// Overseas read-aloud: off by default, speaks only canonical answers and the opening statement in the
// interview language, stops when the player moves on or starts the microphone, captions always shown.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');

// Stand-in speech synthesis that records each utterance (text, lang) and each cancel.
const installSynth = () => {
  window.__tts = { spoken: [], cancels: 0 };
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => [{ lang: 'en-GB', localService: true }, { lang: 'ko-KR', localService: true }],
    speak: (u) => window.__tts.spoken.push({ text: u.text, lang: u.lang }),
    cancel: () => { window.__tts.cancels++; }
  } });
};
const tts = (page) => page.evaluate(() => window.__tts);
const GB01 = atlasScenarios('GB').find((c) => c.id === 'SIM-GB-01');
async function openGB01(page, { on = false, language = null } = {}) {
  await page.addInitScript(installSynth);
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
  await expect(page.locator('.atlas-transcript')).toContainText(GB01.questions.find((q) => q.id === 'source').answer.en);
  expect((await tts(page)).spoken).toEqual([]);
});

test('turned on in the overseas settings, it speaks the opening and canonical answers in the interview language', async ({ page }) => {
  await openGB01(page);
  await page.locator('#atlasSettings').click();
  const toggle = page.locator('#atlasTtsToggle');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await toggle.click();
  await expect(page.locator('#atlasTtsToggle')).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => localStorage.getItem('inad-tts'))).toBe('1'); // shared with the Korean switch
  await page.locator('#modalClose, [data-close], .modal-close').first().click().catch(async () => page.keyboard.press('Escape'));
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('#atlasCallPassenger').click();
  const source = GB01.questions.find((q) => q.id === 'source'), cross = GB01.questions.find((q) => q.id === 'crosscheck');
  await page.locator('#atlasAskInput').fill(source.q.en); await page.locator('#atlasAskInput').press('Enter');
  await page.locator('#ask-crosscheck').click();
  const { spoken } = await tts(page);
  expect(spoken).toEqual([
    { text: GB01.opening.en, lang: 'en-GB' },
    { text: source.answer.en, lang: 'en-GB' },
    { text: cross.answer.en, lang: 'en-GB' }
  ]);
  // Unclear text is not spoken: only canonical answers are.
  await page.locator('#atlasAskInput').fill('what is the weather like today'); await page.locator('#atlasAskInput').press('Enter');
  expect((await tts(page)).spoken).toHaveLength(3);
});

test('a Korean interview language reads the Korean answer with ko-KR', async ({ page }) => {
  await openGB01(page, { on: true, language: 'ko' });
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  const last = (await tts(page)).spoken.at(-1);
  expect(last).toEqual({ text: GB01.questions.find((q) => q.id === 'source').answer.ko, lang: 'ko-KR' });
});

test('speech stops on case switch, dialogs and before the microphone starts', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('inad-voice', 'browser'); class R { start() {} stop() { this.onend?.(); } abort() {} } window.SpeechRecognition = R; window.webkitSpeechRecognition = R; });
  await openGB01(page, { on: true });
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#ask-source').click();
  let before = (await tts(page)).cancels;
  await page.locator('#atlasAskMic').click();
  expect((await tts(page)).cancels).toBeGreaterThan(before); // never speak into the microphone
  await page.locator('#atlasAskMic').click();
  before = (await tts(page)).cancels;
  await page.locator('[data-case="SIM-GB-02"]').click();
  expect((await tts(page)).cancels).toBeGreaterThan(before);
  before = (await tts(page)).cancels;
  await page.locator('#atlasCountry').click();
  expect((await tts(page)).cancels).toBeGreaterThan(before);
});

test('without speech synthesis the switch is disabled and nothing breaks', async ({ page }) => {
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

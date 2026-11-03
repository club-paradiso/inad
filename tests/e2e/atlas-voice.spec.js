// Overseas push-to-talk: consent first, transcript only fills the box, nothing is sent or stored.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');

// Stand-in recogniser (no on-device support): records language, starts and aborts; returns `heard`
// after `delay` ms unless aborted.
function fakeRecognition(heard, delay = 50) {
  return ({ heard, delay }) => {
    window.__voice = { starts: 0, aborts: 0, lang: null };
    class FakeRecognition {
      start() { window.__voice.starts++; window.__voice.lang = this.lang; this.t = setTimeout(() => { this.onresult?.({ results: [Object.assign([{ transcript: heard }], { isFinal: true })] }); this.onend?.(); }, delay); }
      stop() { clearTimeout(this.t); this.onend?.(); }
      abort() { window.__voice.aborts++; clearTimeout(this.t); }
    }
    window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;
  };
}
async function openCase(page, country, id) {
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', country);
  await page.locator(`[data-case="${id}"]`).click();
  await page.locator('#atlasCallPassenger').click();
}
const asked = (page, cc, id) => page.evaluate(([c, i]) => window.INADTest.state().atlas.sessions[c].cases[i].asked, [cc, id]);

test('voice: consent first, transcript fills the box for review, nothing sent until Ask', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const q = atlasScenarios('GB').find((c) => c.id === 'SIM-GB-01').questions.find((x) => x.id === 'source');
  await page.addInitScript(fakeRecognition(), { heard: q.q.en.toLowerCase(), delay: 50 });
  await openCase(page, 'GB', 'SIM-GB-01');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#modalTitle')).toHaveText(/음성 질문 사용|Use voice questions/);
  await expect(page.locator('#atlasVoiceLocal')).toBeDisabled(); // no on-device recognition here
  expect(await page.evaluate(() => window.__voice.starts)).toBe(0);
  await page.locator('#atlasVoiceBrowser').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue(q.q.en.toLowerCase());
  await expect(page.locator('#atlasAskStatus')).toContainText(/확인·수정|Check or correct/);
  expect(await page.evaluate(() => window.__voice.lang)).toBe('en-GB');
  expect(await asked(page, 'GB', 'SIM-GB-01')).toEqual([]);
  await page.locator('#atlasAskForm button[type="submit"]').click();
  expect(await asked(page, 'GB', 'SIM-GB-01')).toEqual(['source']);
  expect(await page.evaluate(() => localStorage.getItem('inad-voice'))).toBe('browser');
  expect(await page.evaluate(() => localStorage.getItem('inad-atlas-v1'))).not.toContain(q.q.en.toLowerCase());
  expect(errors).toEqual([]);
});

test('voice: "don\'t use voice" starts nothing; Korean interview language uses ko-KR', async ({ page }) => {
  await page.addInitScript(fakeRecognition(), { heard: '어느 자료를 봐야 해요', delay: 50 });
  await openCase(page, 'NZ', 'SIM-NZ-01');
  await page.locator('#atlasAskMic').click(); await page.locator('#atlasVoiceOff').click();
  expect(await page.evaluate(() => window.__voice.starts)).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem('inad-voice'))).toBe('off');
  // Switch the interview language to Korean, then opt in.
  await page.locator('#atlasCountry').click(); await page.locator('#atlasInterviewLanguage').selectOption('ko'); await page.locator('#atlasEnter').click();
  await page.locator('#atlasAskMic').click(); await page.locator('#atlasVoiceBrowser').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue('어느 자료를 봐야 해요');
  expect(await page.evaluate(() => window.__voice.lang)).toBe('ko-KR');
});

test('voice: switching case while listening aborts and keeps nothing heard', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('inad-voice', 'browser'));
  await page.addInitScript(fakeRecognition(), { heard: 'this must not reach the next case', delay: 3000 });
  await openCase(page, 'CA', 'SIM-CA-01');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#atlasAskMic')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-case="SIM-CA-02"]').click();
  await expect.poll(() => page.evaluate(() => window.__voice.aborts)).toBe(1);
  await page.waitForTimeout(3200);
  await expect(page.locator('#atlasAskInput')).not.toHaveValue(/must not reach/);
  await expect(page.locator('#atlasAskMic')).toHaveAttribute('aria-pressed', 'false');
});

test('voice: without the speech API there is no Speak button and typing still works', async ({ page }) => {
  await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined }); });
  await openCase(page, 'CA', 'SIM-CA-01');
  await expect(page.locator('#atlasAskMic')).toHaveCount(0);
  await expect(page.locator('#atlasAskInput')).toBeEnabled();
});

test('voice at 320px: input, Ask and Speak fit without horizontal overflow and keep 44px targets', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript(fakeRecognition(), { heard: 'x', delay: 50 });
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="GB"]').check(); await page.locator('#atlasEnter').click();
  await page.locator('#taskNav [data-task="passenger"]').click(); await page.locator('#atlasCallPassenger').click();
  await page.locator('#taskNav [data-task="interview"]').click();
  await expect(page.locator('#atlasAskMic')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const small = await page.locator('#atlasAskForm button, #atlasAskInput').evaluateAll((ns) => ns.filter((n) => n.getClientRects().length).filter((n) => { const r = n.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((n) => n.id || n.textContent));
  expect(small).toEqual([]);
});

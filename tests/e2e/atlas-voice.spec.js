// Overseas push-to-talk: consent first, transcript only fills the box, nothing is sent or stored, and an
// ended session (case switch, replay, Ask, dialogs, country switch) can never write, announce or listen.
import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';
import { atlasScenarios, loadAtlasLibraries } from '../../src/data/atlas-scenarios.js';

await loadAtlasLibraries();
test.skip(process.env.INAD_TARGET === 'legacy', 'Country packs are additive to the current app.');

// Stand-in recogniser that behaves like Chrome: an interim result soon after start, the final result
// after `delay` ms; stop() delivers the final result then `end`; abort() fires error('aborted') and
// then `end` asynchronously. With `local`, it supports on-device recognition and its language check
// takes `availableMs`.
function installFake() {
  return ({ heard, delay = 60, local = false, availableMs = 0 }) => {
    window.__voice = { starts: 0, aborts: 0, live: 0, lang: null };
    class FakeRecognition {
      static available() { return new Promise((r) => setTimeout(() => r('available'), availableMs)); }
      start() {
        const v = window.__voice; v.starts++; v.live++; v.lang = this.lang; this.on = true;
        this.i = setTimeout(() => this.onresult?.({ results: [Object.assign([{ transcript: heard.slice(0, 6) }], { isFinal: false })] }), 20);
        this.t = setTimeout(() => this.finish(true), delay);
      }
      finish(final) {
        if (!this.on) return; this.on = false; window.__voice.live--; clearTimeout(this.i); clearTimeout(this.t);
        if (final) this.onresult?.({ results: [Object.assign([{ transcript: heard }], { isFinal: true })] });
        setTimeout(() => this.onend?.(), 10);
      }
      stop() { this.finish(true); }
      abort() {
        if (!this.on) return; window.__voice.aborts++; this.on = false; window.__voice.live--; clearTimeout(this.i); clearTimeout(this.t);
        setTimeout(() => { this.onerror?.({ error: 'aborted' }); setTimeout(() => this.onend?.(), 10); }, 10);
      }
    }
    if (local) FakeRecognition.prototype.processLocally = false;
    window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;
  };
}
async function openCase(page, country, id, consent = null) {
  if (consent) await page.addInitScript((v) => localStorage.setItem('inad-voice', v), consent);
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click(); await expect(page.locator('body')).toHaveAttribute('data-country', country);
  await page.locator(`[data-case="${id}"]`).click();
  await page.locator('#atlasCallPassenger').click();
}
const asked = (page, cc, id) => page.evaluate(([c, i]) => window.INADTest.state().atlas.sessions[c].cases[i].asked, [cc, id]);
const voice = (page) => page.evaluate(() => window.__voice);
const settle = (page) => page.waitForTimeout(150); // let late error/end events of an aborted session arrive

test('voice: consent first, transcript fills the box for review, nothing sent until Ask', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const q = atlasScenarios('GB').find((c) => c.id === 'SIM-GB-01').questions.find((x) => x.id === 'source');
  await page.addInitScript(installFake(), { heard: q.q.en.toLowerCase() });
  await openCase(page, 'GB', 'SIM-GB-01');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#modalTitle')).toHaveText(/음성 질문 사용|Use voice questions/);
  await expect(page.locator('#atlasVoiceLocal')).toBeDisabled(); // no on-device recognition here
  expect((await voice(page)).starts).toBe(0);
  await page.locator('#atlasVoiceBrowser').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue(q.q.en.toLowerCase());
  await expect(page.locator('#atlasAskStatus')).toContainText(/확인·수정|Check or correct/);
  expect((await voice(page)).lang).toBe('en-GB');
  expect(await asked(page, 'GB', 'SIM-GB-01')).toEqual([]);
  await page.locator('#atlasAskForm button[type="submit"]').click();
  expect(await asked(page, 'GB', 'SIM-GB-01')).toEqual(['source']);
  expect(await page.evaluate(() => localStorage.getItem('inad-voice'))).toBe('browser');
  expect(errors).toEqual([]);
});

test('voice: the Speak button keeps its name and reports state with aria-pressed', async ({ page }) => {
  await page.addInitScript(installFake(), { heard: 'which documents should we check', delay: 2000 });
  await openCase(page, 'GB', 'SIM-GB-01', 'browser');
  const mic = page.locator('#atlasAskMic');
  await expect(mic).toHaveText(/말하기|Speak/);
  await mic.click();
  await expect(mic).toHaveAttribute('aria-pressed', 'true');
  await expect(mic).toHaveText(/말하기|Speak/);
  await expect(mic).toBeFocused();
  await expect(page.locator('#atlasAskStatus')).toContainText(/듣는 중|Listening/);
  await mic.click(); // stop: the final text is kept for review
  await expect(page.locator('#atlasAskInput')).toHaveValue('which documents should we check');
  await expect(mic).toHaveAttribute('aria-pressed', 'false');
});

for (const [name, leave] of [
  ['switching case', async (page) => { await page.locator('[data-case="SIM-CA-02"]').click(); }],
  ['opening the country selector', async (page) => { await page.locator('#atlasCountry').click(); await page.locator('#atlasCancel').click(); }],
  ['preparing the outcome', async (page) => { await page.locator('#atlasPrepare').click(); }]
]) test(`voice: ${name} while listening aborts, and late events write, announce and focus nothing`, async ({ page }) => {
  await page.addInitScript(installFake(), { heard: 'this must not reach anything', delay: 3000 });
  await openCase(page, 'CA', 'SIM-CA-01', 'browser');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue('this m'); // an interim result arrived
  await leave(page);
  await settle(page);
  const v = await voice(page);
  expect(v.aborts).toBe(1); expect(v.live).toBe(0);
  await expect(page.locator('#atlasAskInput')).not.toHaveValue(/must not reach/);
  await expect(page.locator('#atlasAskStatus')).not.toContainText(/중단|stopped|확인·수정|Check or correct/);
  if (await page.locator('#atlasAskMic').count()) await expect(page.locator('#atlasAskMic')).toHaveAttribute('aria-pressed', 'false');
});

test('voice: pressing Ask while listening asks once and the transcript does not come back', async ({ page }) => {
  const q = atlasScenarios('CA').find((c) => c.id === 'SIM-CA-01').questions.find((x) => x.id === 'source');
  await page.addInitScript(installFake(), { heard: 'something else entirely', delay: 3000 });
  await openCase(page, 'CA', 'SIM-CA-01', 'browser');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue('someth');
  await page.locator('#atlasAskInput').fill(q.q.en);
  await page.locator('#atlasAskForm button[type="submit"]').click();
  await settle(page);
  expect(await asked(page, 'CA', 'SIM-CA-01')).toEqual(['source']);
  await expect(page.locator('#atlasAskInput')).toHaveValue('');
  await expect(page.locator('#atlasAskStatus')).toContainText(/질문했습니다|Asked/);
  expect((await voice(page)).live).toBe(0);
});

test('voice: switching to Korea while listening stops the microphone and keeps nothing for later', async ({ page }) => {
  await page.addInitScript(installFake(), { heard: 'nothing to keep', delay: 3000 });
  await openCase(page, 'NZ', 'SIM-NZ-01', 'browser');
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue('nothin');
  await page.locator('#atlasCountry').click(); await page.locator('[name="atlas-country"][value="KR"]').check();
  await page.locator('#atlasEnter').click(); await page.locator('#atlasSwitch').click();
  await expect(page.locator('body')).toHaveAttribute('data-country', 'KR');
  await settle(page);
  expect((await voice(page)).live).toBe(0);
  await page.locator('#atlasMenuCountry').evaluate((b) => b.click());
  await page.locator('[name="atlas-country"][value="NZ"]').check(); await page.locator('#atlasEnter').click();
  await page.locator('#atlasSwitch').click({ timeout: 2000 }).catch(() => {}); // only shown when a Korean shift is in progress
  await expect(page.locator('body')).toHaveAttribute('data-country', 'NZ');
  await expect(page.locator('#atlasAskInput')).toHaveValue('');
});

test('voice: on-device start that resolves after a case switch never opens the microphone', async ({ page }) => {
  await page.addInitScript(installFake(), { heard: 'late start', delay: 200, local: true, availableMs: 600 });
  await openCase(page, 'CA', 'SIM-CA-01', 'local');
  await page.locator('#atlasAskMic').click();       // waiting for the on-device language check
  await page.locator('[data-case="SIM-CA-02"]').click();
  await page.locator('#atlasCallPassenger').click();
  await page.locator('#atlasAskMic').click();       // a new session in the new case
  await page.waitForTimeout(1200);
  const v = await voice(page);
  expect(v.starts).toBe(1);                         // only the second request started
  expect(v.live).toBe(0);
  expect((await page.evaluate(() => window.INADTest.state().atlas.sessions.CA.activeId))).toBe('SIM-CA-02');
  await expect(page.locator('#atlasAskInput')).toHaveValue('late start');
});

test('voice: consent can be withdrawn from the overseas settings; "don\'t use voice" starts nothing', async ({ page }) => {
  await page.addInitScript(installFake(), { heard: '어느 자료를 봐야 해요' });
  await openCase(page, 'NZ', 'SIM-NZ-01', 'browser');
  await page.locator('#atlasSettings').click();
  await expect(page.locator('#atlasVoiceSetting')).toContainText(/브라우저|Browser/);
  await page.locator('#atlasVoiceSettings').click();
  await page.locator('#atlasVoiceOff').click();
  expect(await page.evaluate(() => localStorage.getItem('inad-voice'))).toBe('off');
  expect((await voice(page)).starts).toBe(0);
  await page.locator('#atlasAskMic').click();
  await expect(page.locator('#modalTitle')).toHaveText(/음성 질문 사용|Use voice questions/);
  await page.locator('#atlasVoiceOff').click();
  expect((await voice(page)).starts).toBe(0);
  // Korean interview language uses ko-KR.
  await page.locator('#atlasCountry').click(); await page.locator('#atlasInterviewLanguage').selectOption('ko'); await page.locator('#atlasEnter').click();
  await page.locator('#atlasAskMic').click(); await page.locator('#atlasVoiceBrowser').click();
  await expect(page.locator('#atlasAskInput')).toHaveValue('어느 자료를 봐야 해요');
  expect((await voice(page)).lang).toBe('ko-KR');
});

test('voice: without the speech API there is no Speak button and typing still works', async ({ page }) => {
  await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined }); });
  await openCase(page, 'CA', 'SIM-CA-01');
  await expect(page.locator('#atlasAskMic')).toHaveCount(0);
  await expect(page.locator('#atlasAskInput')).toBeEnabled();
});

test('voice at 320px: input, Ask and Speak fit without horizontal overflow and keep 44px targets', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript(installFake(), { heard: 'x' });
  await page.goto(ENTRY); await page.locator('#atlasStartCountry').click();
  await page.locator('[name="atlas-country"][value="GB"]').check(); await page.locator('#atlasEnter').click();
  await page.locator('#taskNav [data-task="passenger"]').click(); await page.locator('#atlasCallPassenger').click();
  await page.locator('#taskNav [data-task="interview"]').click();
  await expect(page.locator('#atlasAskMic')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const small = await page.locator('#atlasAskForm button, #atlasAskInput').evaluateAll((ns) => ns.filter((n) => n.getClientRects().length).filter((n) => { const r = n.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((n) => n.id || n.textContent));
  expect(small).toEqual([]);
});

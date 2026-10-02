// UI language round trip: English → Korean must restore every Korean string exactly (the translation layer
// used to store its own half-translated writes as "originals"), and switching must not break controls.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
const textOf = (page, sel) => page.locator(sel).evaluate((el) => el.innerText.replace(/\d{1,2}시 \d{1,2}분 \d{1,2}초|\d{2}:\d{2}:\d{2}|\d{2}:\d{2}/g, '#'));

test.describe('UI 언어 전환', () => {
  test.skip(target === 'legacy', 'v6.1 baseline has no UI localisation');

  test('start screen and workstation text survive EN → KO unchanged; controls keep working', async ({ page }) => {
    const errors = await H.openGame(page);
    await expect(page.locator('#startLanguageBtn')).toBeVisible();
    await H.setSeed(page, 271828);
    const startKo = await textOf(page, '#startOverlay');
    await page.locator('#startLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#startBtn')).toHaveText('Start duty');
    await page.locator('#startLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await textOf(page, '#startOverlay')).toBe(startKo);
    await H.startShift(page);
    await H.ensureCommunication(page);
    await H.ask(page, 'purpose');
    const appKo = await textOf(page, '#app');
    await page.locator('#uiLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#stepper')).toContainText('Follow-up');
    // language of parts: Korean case data under lang=en is marked lang=ko; English UI copy is not
    await expect(page.locator('#log .msg.alien .msgtext').last()).toHaveAttribute('lang', 'ko');
    await expect(page.locator('#clearBtn strong')).not.toHaveAttribute('lang', 'ko');
    await expect(page.locator('#uiLanguageBtn')).toHaveAttribute('lang', 'ko');
    await page.locator('#uiLanguageBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('[data-i18n-lang]')).toHaveCount(0);
    expect(await textOf(page, '#app')).toBe(appKo);
    // controls still bound after two full translation passes
    await H.lookup(page, 'history');
    await expect(page.locator('#terminal')).toContainText('출입국기록');
    await H.expectNoErrors(errors);
  });

  test('English procedure screens and decision desk do not mix Korean UI copy into controls', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('inad-locale', 'en'));
    const errors = await H.openGame(page);
    await H.setSeed(page, 271828);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click(); await page.locator('#briefStart').click();
    await H.jumpTo(page, idx);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'sjp');
    // controls only; language names and traveler data are content, not UI copy
    const korean = await page.evaluate(() => [...document.querySelectorAll('#procedureScreen button, #procedureScreen h2, .act, #actionHint')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()).filter((t) => /[가-힣]/.test(t) && !/^Call interpreter \(/.test(t)));
    expect(korean).toEqual([]);
    await H.expectNoErrors(errors);
  });
});

// v10 English-mode audit: the live interview, the debrief and Quick Shift show no Korean UI vocabulary. Case data
// (statements, question texts, names, document fields, statute texts) is content and stays in its language.
test.describe('English UI · v10 paths', () => {
  test.skip(target === 'legacy', 'v10 only');
  const koreanIn = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((el) => el.offsetParent !== null || el.getClientRects().length).map((el) => el.innerText.replace(/\s+/g, ' ').trim()).filter((t) => /[가-힣]/.test(t)), sel);
  const say = async (page, t) => { await page.fill('#askInput', t); await page.press('#askInput', 'Enter'); const k = page.locator('#askStatus [data-confirm]'); if (await k.count()) await k.click(); await expect(page.locator('#log .msg.pending')).toHaveCount(0); };

  test('live interview chrome and the debrief are English; a question starting with 현재 is not mistranslated', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('inad-locale', 'en'));
    const errors = await H.openGame(page);
    await page.locator('#liveStartBtn').click();
    await page.locator('#langInterp').click();
    for (const t of ['What will you do in Korea for a month?', "Why don't you have a return ticket?", 'How much money do you have?', 'Who is the contact number on your form?']) await say(page, t);
    const chrome = '#caseNote .case-depth-note, #koLevel, #enLevel, #primaryLang, #pAttitude, #qtabs, #readyHint, #clueBoard .cluehead b, #clueBoard .legend, #clueBoard .cluekey, #languageMode, #languageStatus, #askStatus, #basisBoard .basis-domain, #basisBoard .basis-conf, #paTitle, #langInterp';
    expect(await koreanIn(page, chrome)).toEqual([]);
    await H.lookup(page, 'contact'); await H.lookup(page, 'pnr');
    for (const t of ['What do you do for a living?', 'Who lives at the house in Guro?', 'Have you looked for a job in Korea?']) await say(page, t);
    await page.locator('#secondaryBtn').click();
    await H.procAct(page, 'refuse');
    await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
    await H.continueDoc(page); await H.procAct(page, 'repat-order'); await H.continueDoc(page); await H.procAct(page, 'waiting-room'); await H.procAct(page, 'finish-refusal');
    await expect(page.locator('#modalTitle')).toHaveText('Inspection result · debrief');
    expect(await koreanIn(page, '#modalTitle, #modalBody .report .r > span, #modalBody h3, #modalBody .basis-domain, #modalBody .basis-conf, #modalBody button, #stageLabel')).toEqual([]);
    // "현재 체재비와 결제수단은 얼마입니까?" is a question (data), not a status line: it must not become "Now: 체재비…"
    expect(await page.locator('#modalBody').innerText()).not.toContain('Now: ');
    await H.expectNoErrors(errors);
  });

  test('Quick Shift and the first-traveler safeguard are English', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('inad-locale', 'en'));
    const errors = await H.openGame(page);
    expect(await koreanIn(page, '#startOverlay summary, #startOverlay .start-notice p, #dailyStart b, #dailyStart span, #dailyStartOpen')).toEqual([]);
    await page.locator('#quickStartBtn').click();
    expect(await koreanIn(page, '#koLevel, #enLevel, #pAttitude, #qtabs, #readyHint, #paText')).toEqual([]);
    await page.locator('#clearBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('New examiner hint');
    expect(await koreanIn(page, '#modalBody b, #modalBody .modal-note')).toEqual([]);
    await H.expectNoErrors(errors);
  });
});

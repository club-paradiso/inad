// Scripted playtest personas for the v10 slice (docs/v10-qa.md §6). Not a pass/fail suite: it plays the case the way
// different players would, records what happened and saves screenshots for a human-style review.
// usage: npm run build && node scripts/playtest-personas.js [--chromium /path] [--out dir]
import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { createStaticServer } from './static-server.js';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const exe = arg('--chromium', process.env.INAD_CHROMIUM_PATH || undefined);
const out = arg('--out', 'test-results/playtest'); fs.mkdirSync(out, { recursive: true });
const port = 4192; const server = await createStaticServer('dist', port, { quiet: true });
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const results = [];

async function session(name, { viewport = { width: 1440, height: 900 }, init, locale } = {}, play) {
  const ctx = await browser.newContext({ viewport, locale: 'ko-KR', hasTouch: viewport.width < 768 });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (init) await page.addInitScript(init);
  if (locale === 'en') await page.addInitScript(() => localStorage.setItem('inad-locale', 'en'));
  await page.goto(`http://127.0.0.1:${port}/index.html`); await page.waitForSelector('#liveStartBtn');
  const notes = []; const t0 = Date.now();
  await page.click('#liveStartBtn'); await page.waitForTimeout(600);
  try { await play(page, notes); } catch (e) { notes.push('FLOW BROKE: ' + e.message.split('\n')[0]); }
  const st = await page.evaluate(() => ({ ...window.INADTest.interview(), stage: window.INADTest.state().stage, strikes: window.INADTest.state().strikes, mistakes: window.INADTest.state().mistakes, asked: window.INADTest.state().asked.length }));
  await page.screenshot({ path: `${out}/${name}.png` });
  results.push({ name, seconds: Math.round((Date.now() - t0) / 1000), ...st, errors, notes });
  await ctx.close();
}
const settle = (page) => page.waitForFunction(() => !document.querySelector('#log .msg.pending'), null, { timeout: 5000 }).catch(() => {});
async function say(page, text) { await page.fill('#askInput', text); await page.press('#askInput', 'Enter'); const c = page.locator('#askStatus [data-confirm]'); if (await c.count()) await c.click(); await settle(page); }
const passengerLast = (page) => page.locator('#log .msg.alien .msgtext').last().innerText();

// 1 · first-time player, buttons only: follows suggestions, then tries to decide
await session('01-first-timer-buttons', {}, async (page, notes) => {
  for (let i = 0; i < 8; i++) {
    const b = page.locator('#questions .qbtn').first(); if (!(await b.count())) { notes.push(`suggestions ran out after ${i}`); break; }
    const label = (await b.innerText()).split('\n')[0]; await b.click(); await settle(page); notes.push(`clicked: ${label} → ${(await passengerLast(page)).slice(0, 40)}`);
  }
  await page.click('#clearBtn'); await page.waitForTimeout(400);
  notes.push('tried 입국 허가: ' + (await page.locator('#modalTitle').innerText().catch(() => 'no dialog')));
});
// 2 · gamer typing freely, including off-topic and confrontation
await session('02-gamer-typing', {}, async (page, notes) => {
  await page.click('#langInterp');
  for (const t of ['안녕하세요', '여권 보여주세요', '왜 한국 왔어?', '한 달이나 있으면서 일정이 없어?', '돈 얼마 있어', '010-0000-0202 누구야', '그 사람 어떻게 알아', '집 주인 누구야', '너 혹시 일하러 왔지?', '베트남에선 뭐 했는데', '공장 일 찾아봤지?', '표 살 돈은?', '오늘 날씨 어때', '폰 좀 보자']) {
    await say(page, t); const last = await passengerLast(page); const kind = await page.evaluate(() => window.INADTest.interview().lastKind);
    notes.push(`${t} → [${kind}] ${last.slice(0, 50)}`);
  }
  await page.locator('.lookup-tabs button[data-lu="contact"]').click();
  await say(page, '공장 일 찾아봤지?'); notes.push(`after contact lookup: ${(await passengerLast(page)).slice(0, 60)}`);
});
// 3 · English-speaking player in the English UI, typing English
await session('03-english-ui-typing', { locale: 'en' }, async (page, notes) => {
  await page.click('#langEn');
  for (const t of ['What is the purpose of your visit?', 'How long will you stay?', 'Where are you staying?', "Why don't you have a return ticket?", 'How much money do you have?', 'Who is your contact in Korea?', 'Do you plan to work here?']) {
    await say(page, t); notes.push(`${t} → [${await page.evaluate(() => window.INADTest.interview().lastKind)}] ${(await passengerLast(page)).slice(0, 50)}`);
  }
});
// 4 · voice user whose microphone is denied
await session('04-mic-denied', { init: () => { class R { start() { setTimeout(() => { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }, 30); } stop() {} abort() {} } window.webkitSpeechRecognition = R; window.SpeechRecognition = R; } }, async (page, notes) => {
  await page.click('#micBtn'); await page.click('#voiceBrowser'); await page.waitForTimeout(300);
  notes.push('status: ' + (await page.locator('#askStatus').innerText()));
  await page.click('#langInterp'); await say(page, '방문 목적이 뭐예요?'); notes.push('typed fallback → ' + (await passengerLast(page)).slice(0, 40));
});
// 5 · keyboard-only player
await session('05-keyboard-only', {}, async (page, notes) => {
  let steps = 0; for (; steps < 60; steps++) { if (await page.evaluate(() => document.activeElement?.id === 'askInput')) break; await page.keyboard.press('Tab'); }
  notes.push(`Tab presses from case start to the question box: ${steps}`);
  await page.keyboard.type('통역 불러 드릴게요'); await page.keyboard.press('Enter'); await settle(page);
  await page.keyboard.type('방문 목적이 뭐예요?'); await page.keyboard.press('Enter'); await settle(page);
  notes.push('after two typed turns → ' + (await passengerLast(page)).slice(0, 40));
});
// 6 · phone player (390×844), touch
await session('06-phone', { viewport: { width: 390, height: 844 } }, async (page, notes) => {
  await page.screenshot({ path: `${out}/06-phone-passenger.png` });
  await page.locator('#taskNav button[data-task="interview"]').click(); await page.click('#langInterp');
  await say(page, '방문 목적이 뭐예요?'); await say(page, '돈은 얼마 있어요?');
  await page.screenshot({ path: `${out}/06-phone-interview.png` });
  await page.locator('#taskNav button[data-task="passenger"]').click(); await page.waitForTimeout(300);
  notes.push('caption on booth: ' + (await page.locator('#stageCaption').innerText()).slice(0, 50));
});

fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
for (const r of results) { console.log(`\n## ${r.name} (${r.seconds}s) turns=${r.turns} text=${r.counts.text} sugg=${r.counts.suggestion} list=${r.counts.list} unmatched=${r.unmatched} withheld=${r.withheld} asked=${r.asked} stage=${r.stage} strikes=${r.strikes} errors=${r.errors.length}`); for (const n of r.notes) console.log('  - ' + n); if (r.mistakes.length) console.log('  mistakes: ' + r.mistakes.join(' | ')); }
await browser.close(); server.close();

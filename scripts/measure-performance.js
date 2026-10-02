// v10 performance measurement (docs/v10-qa.md §Performance). Runs the release build in Chromium and reports:
// page weight, time to the start screen, time from "라이브 인터뷰" to an interactive case, main-thread busy time
// of the living portrait while idle (10 s) and while answering, JS heap, and the turn latency of the dispatcher.
// usage: npm run build && node scripts/measure-performance.js [--cpu-throttle 4] [--chromium /path]
import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { createStaticServer } from './static-server.js';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const throttle = Number(arg('--cpu-throttle', '1'));
const exe = arg('--chromium', process.env.INAD_CHROMIUM_PATH || undefined);
const port = 4191;
const server = await createStaticServer('dist', port, { quiet: true });
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const busy = async (fn, ms) => { const a = await metrics(); const t0 = Date.now(); await fn(); const wall = Math.max(ms, Date.now() - t0); const b = await metrics(); return { wallMs: wall, taskMs: Math.round((b.TaskDuration - a.TaskDuration) * 1000), scriptMs: Math.round((b.ScriptDuration - a.ScriptDuration) * 1000), layoutMs: Math.round((b.LayoutDuration - a.LayoutDuration) * 1000), busyPct: +(((b.TaskDuration - a.TaskDuration) * 1000 / wall) * 100).toFixed(1) }; };

const out = { cpuThrottle: throttle, distBytes: fs.statSync('dist/index.html').size };
let t = Date.now();
await page.goto(`http://127.0.0.1:${port}/index.html`); await page.waitForSelector('#liveStartBtn');
out.startScreenMs = Date.now() - t;
t = Date.now();
await page.click('#liveStartBtn'); await page.waitForFunction(() => document.querySelector('#stagePortrait')?.classList.contains('lp-live'));
out.liveToPassengerMs = Date.now() - t;
await page.waitForTimeout(1500);
out.idle10s = await busy(() => page.waitForTimeout(10000), 10000);
await page.locator('#langInterp').click();
const turns = [];
out.answering = await busy(async () => {
  for (const q of ['한국에서 30일 동안 뭐 할 거예요?', '귀국 항공권은 왜 없어요?', '돈은 얼마나 가지고 왔어요?']) {
    const s = await page.evaluate((text) => { const t0 = performance.now(); window.INADTest.say(text); return performance.now() - t0; }, q);
    turns.push(+s.toFixed(1));
    await page.waitForFunction(() => !document.querySelector('#log .msg.pending')); await page.waitForTimeout(2500);
  }
}, 8000);
out.dispatchMs = turns;
// hidden tab: the loop must stop
await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }) || document.dispatchEvent(new Event('visibilitychange')));
const m = await metrics(); out.jsHeapMB = +(m.JSHeapUsedSize / 1048576).toFixed(1);
await page.emulateMedia({ reducedMotion: 'reduce' }); await page.evaluate(() => document.dispatchEvent(new CustomEvent('inad:prefs')));
out.reducedMotionIdle5s = await busy(() => page.waitForTimeout(5000), 5000);
console.log(JSON.stringify(out, null, 2));
await browser.close(); server.close();

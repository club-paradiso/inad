// Adaptive workstation smoke: the same DOM must stay playable on phone, tablet and desktop.
// Every viewport walks Start → Primary → Interview → Documents → Lookup → Decision → Secondary → Refusal →
// Refugee → SJP → Repatriation → Records → Profile → Settings, checks the page never scrolls horizontally,
// and that the controls of the active task are inside the viewport. Skipped on the v6.1 baseline (no task navigation).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import * as H from './helpers.js';

const SEED = 223606;
const target = process.env.INAD_TARGET || 'dist';
const outDir = `test-results/${target}/adaptive`;
const VIEWPORTS = [
  { name: 'phone-390', width: 390, height: 844, kind: 'phone' },
  { name: 'phone-430', width: 430, height: 932, kind: 'phone' },
  { name: 'tablet-768', width: 768, height: 1024, kind: 'tablet' },
  { name: 'compact-1024', width: 1024, height: 768, kind: 'desktop' },
  { name: 'desktop-1440', width: 1440, height: 1000, kind: 'desktop' }
];

async function shot(page, name) { fs.mkdirSync(outDir, { recursive: true }); await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false }); }
async function noOverflow(page, label) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
  expect(o.sw, `${label}: horizontal overflow ${JSON.stringify(o)}`).toBeLessThanOrEqual(o.cw + 1);
  expect(o.bw, `${label}: body overflow ${JSON.stringify(o)}`).toBeLessThanOrEqual(o.cw + 1);
}
// Switch the workspace task on stacked layouts (no-op on desktop where every zone is visible).
async function task(page, name) {
  const b = page.locator(`#taskNav button[data-task="${name}"]`);
  if (await b.isVisible()) { await b.click(); await expect(b).toHaveAttribute('aria-current', 'true'); }
}
// Decision buttons on touch layouts arm on the first tap and execute on the second.
async function decide(page, selector) {
  const b = page.locator(selector);
  await b.click();
  if (await b.evaluate((el) => el.classList.contains('armed'))) await b.click();
}
// Phones open on the 승객 task, so the interview log is attached but not visible until that task is chosen.
async function startShift(page) {
  await H.chooseStartOption(page, '[data-guidance="expert"]');
  await page.locator('#startBtn').click();
  await expect(page.locator('#briefStart')).toBeVisible();
  await page.locator('#briefStart').click();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
  await expect(page.locator('#log .msg').first()).toBeAttached();
}
async function inViewport(page, selectors) { for (const s of selectors) await expect(page.locator(s), s).toBeInViewport(); }
async function touchTargets(page, selectors, min = 40) {
  for (const s of selectors) {
    const box = await page.locator(s).first().boundingBox();
    expect(box, s).not.toBeNull();
    expect(box.height, `${s} hit height`).toBeGreaterThanOrEqual(min);
  }
}

for (const vp of VIEWPORTS) {
  test(`adaptive workflow · ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
    test.skip(target === 'legacy', 'v6.1 baseline has no adaptive workstation');
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const errors = await H.openGame(page);
    await noOverflow(page, 'start'); await shot(page, `${vp.name}-start`);
    await H.setSeed(page, SEED);
    await startShift(page);
    await expect(page.locator('#taskNav')).toHaveCount(1);
    if (vp.kind === 'phone') {
      await expect(page.locator('#taskNav')).toBeVisible();
      await expect(page.locator('#opsToggle')).toBeVisible();
      await expect(page.locator('body')).toHaveAttribute('data-task', 'passenger');
      await inViewport(page, ['#pPortrait', '#pName', '#taskNav']);
      await touchTargets(page, ['#taskNav button', '#opsToggle'], 44);
      // operations sheet carries queue, pressure and duty KPIs on phones
      await page.locator('#opsToggle').click();
      await expect(page.locator('#queueStrip')).toBeVisible();
      await expect(page.locator('#caseCount')).toBeVisible();
      await page.locator('#opsToggle').click();
    } else if (vp.kind === 'tablet') {
      await expect(page.locator('#taskNav')).toBeVisible();
      await expect(page.locator('#taskNav button[data-task="passenger"]')).toBeHidden();
      await inViewport(page, ['#pPortrait', '#log', '#clearBtn', '#basisBoard']);
    } else {
      await expect(page.locator('#taskNav')).toBeHidden();
      await inViewport(page, ['#pPortrait', '#log', '#questions', '#docview', '#terminal', '#basisBoard', '#clearBtn', '#refuseBtn', '#stepper']);
    }
    await noOverflow(page, 'primary'); await shot(page, `${vp.name}-primary`);
    // interview
    await task(page, 'interview');
    await inViewport(page, ['#log', '#questions', '#langInterp']);
    if (vp.kind === 'phone') await touchTargets(page, ['#questions .qbtn', '#langInterp', '#qtabs .qtab'], 40);
    await H.ensureCommunication(page);
    await H.ask(page, 'purpose');
    await expect(page.locator('#log')).toContainText('심사관');
    await noOverflow(page, 'interview'); await shot(page, `${vp.name}-interview`);
    // documents + lookup
    await task(page, 'evidence');
    await inViewport(page, ['#doclist', '#docview']);
    await page.locator('#doclist .docitem').nth(1).click();
    await expect(page.locator('#doclist .docitem').nth(1)).toHaveClass(/on/);
    await expect(page.locator('#docview .docsheet')).toBeVisible();
    if (vp.kind === 'phone') { await touchTargets(page, ['#doclist .docitem', '.lookup-tabs button', '#wbTabEntry'], 40); await page.locator('#terminal').scrollIntoViewIfNeeded(); }
    await H.lookup(page, 'history');
    await expect(page.locator('#terminal')).toContainText('출입국기록');
    await expect(page.locator('.lookup-tabs button[data-lu="history"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#wbTabEntry').click(); await expect(page.locator('#entry')).toBeVisible(); await page.locator('#wbTabDocs').click();
    await noOverflow(page, 'evidence'); await shot(page, `${vp.name}-evidence`);
    // assessment + decision desk
    await task(page, 'assessment');
    await inViewport(page, ['#readyPct', '#matrix', '#clearBtn', '#secondaryBtn', '#refuseBtn', '#sjpBtn']);
    if (vp.kind === 'phone') await touchTargets(page, ['#clearBtn', '#refuseBtn'], 44);
    await noOverflow(page, 'assessment'); await shot(page, `${vp.name}-assessment`);
    // secondary procedure (continuation of inspection)
    const sIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-006');
    await H.jumpTo(page, sIdx);
    await task(page, 'assessment');
    await decide(page, '#secondaryBtn');
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary');
    await inViewport(page, ['#procClose', '#procBody']);
    await noOverflow(page, 'secondary'); await shot(page, `${vp.name}-secondary`);
    await H.procAct(page, 'back');
    // refugee referral
    const rIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-010');
    await H.jumpTo(page, rIdx);
    await task(page, 'interview'); await H.ensureCommunication(page); await H.ask(page, 'refugee');
    await task(page, 'assessment');
    await expect(page.locator('#specialBtn')).toBeVisible();
    await page.locator('#specialBtn').click();
    await H.procAct(page, 'refugee');
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'refugee');
    await noOverflow(page, 'refugee'); await shot(page, `${vp.name}-refugee`);
    await H.procAct(page, 'back');
    // SJP investigation
    const fIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-009');
    await H.jumpTo(page, fIdx);
    await task(page, 'assessment');
    await decide(page, '#secondaryBtn');
    await H.procAct(page, 'sjp');
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'sjp');
    await noOverflow(page, 'sjp'); await shot(page, `${vp.name}-sjp`);
    await H.procAct(page, 'back');
    // refusal → repatriation
    const bIdx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.jumpTo(page, bIdx);
    await task(page, 'interview'); await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await task(page, 'assessment');
    await decide(page, '#refuseBtn');
    await expect(page.locator('#modalTitle')).toContainText('입국 불허가 사유 선택');
    await inViewport(page, ['#modalClose', '.reason[data-code="SIM-BIO-REF"]']);
    await noOverflow(page, 'refusal-dialog'); await shot(page, `${vp.name}-refusal`);
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await H.continueDoc(page);
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
    await noOverflow(page, 'repatriation'); await shot(page, `${vp.name}-repatriation`);
    await page.locator('#procClose').click();
    // records / profile / settings dialogs
    await page.keyboard.press('KeyL');
    await expect(page.locator('#modalTitle')).toContainText('근무기록');
    await noOverflow(page, 'records'); await shot(page, `${vp.name}-records`);
    await page.keyboard.press('Escape');
    await page.keyboard.press('KeyU');
    await expect(page.locator('#modalTitle')).toContainText('프로필');
    await noOverflow(page, 'profile');
    await page.keyboard.press('Escape');
    await page.keyboard.press('KeyS');
    await expect(page.locator('#modalTitle')).toHaveText('접근성·조작 설정');
    await noOverflow(page, 'settings'); await shot(page, `${vp.name}-settings`);
    await page.keyboard.press('Escape');
    await H.expectNoErrors(errors);
  });
}

test('touch decision safety: first tap arms, second tap executes', async ({ browser }) => {
  test.skip(target === 'legacy', 'v6.1 baseline has no touch arming');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  const errors = await H.openGame(page);
  await H.setSeed(page, SEED);
  await startShift(page);
  const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-006');
  await H.jumpTo(page, idx);
  await task(page, 'assessment');
  const coarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  await page.locator('#secondaryBtn').click();
  if (coarse) {
    await expect(page.locator('#secondaryBtn')).toHaveClass(/armed/);
    await expect(page.locator('#procedureScreen')).not.toHaveClass(/on/);
    const st = await H.getState(page);
    expect(st.stage, 'a single tap must not change the legal stage').toBe('PRIMARY');
    await page.locator('#secondaryBtn').click();
  }
  await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
  expect((await H.getState(page)).stage).toBe('SECONDARY');
  await H.expectNoErrors(errors);
  await ctx.close();
});

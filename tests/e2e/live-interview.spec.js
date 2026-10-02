// v10 Live Interview vertical slice (ICN-S2-005, 쩐 반 민): one-click start, typed and spoken questions through the
// same deterministic path as the buttons, withheld facts until their conditions are met, clarification instead of
// guessing, the full refusal path to the debrief, and graceful fallbacks (no speech API, reduced motion).
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target === 'legacy', 'v10 only');

async function startLive(page) {
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
  await expect(page.locator('#caseName')).toContainText('쩐 반 민');
  await expect(page.locator('body')).toHaveClass(/mode-case/);
}
async function say(page, text) {
  const input = page.locator('#askInput');
  await input.fill(text);
  await input.press('Enter');
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
}
const lastPassengerLine = (page) => page.locator('#log .msg.alien .msgtext').last();

test.describe('라이브 인터뷰', () => {
  test('one click reaches the passenger; the single case never writes a shift checkpoint', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    await expect(page.locator('#pPortrait')).toBeAttached();
    await expect(page.locator('#askInput')).toBeVisible();
    await expect(page.locator('#qtabs .qtab-suggest')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#questions .qbtn').first()).toBeVisible();
    await page.locator('#langInterp').click();
    await page.locator('#questions .qbtn').first().click();
    await expect(page.locator('#log .msg.pending')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('inad-progress-v54'))).toBeNull();
    const iv = await H.hook(page, (T) => T.interview());
    expect(iv.mode).toBe('case'); expect(iv.counts.suggestion).toBe(1);
    await H.expectNoErrors(errors);
  });

  test('a typed question is recorded as the canonical question; a hidden fact stays hidden until its evidence exists', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#langInterp').click();
    await say(page, '한국에서 30일 동안 뭐 할 거예요?');
    await expect(page.locator('#log')).toContainText('기록 질문 · 30일 동안 구체적으로 무엇을 할 예정입니까?');
    await expect(lastPassengerLine(page)).toContainText('쇼핑하고 관광합니다');
    // asked before the occupation answer and the contact lookup: the passenger stays with the public record
    await say(page, '한국에서 일자리 알아본 적 있어요?');
    await expect(lastPassengerLine(page)).toContainText('관광하러 왔습니다');
    await expect(page.locator('#log .msg.alien.off-record')).toHaveCount(1);
    let st = await H.getState(page);
    expect(st.asked).not.toContain('jobOffer');
    await say(page, '베트남에서 무슨 일 하세요?');
    await expect(lastPassengerLine(page)).toContainText('일을 그만뒀습니다');
    await H.lookup(page, 'contact');
    await say(page, '한국에서 일자리 알아본 적 있어요?');
    await expect(lastPassengerLine(page)).toContainText('공장 일');
    await expect(page.locator('#log .msg.alien .lead').last()).toHaveText('…솔직히 말씀드리면,');
    st = await H.getState(page);
    expect(st.asked).toEqual(expect.arrayContaining(['purpose', 'occupation', 'jobOffer']));
    const iv = await H.hook(page, (T) => T.interview());
    expect(iv.counts.text).toBe(4); expect(iv.withheld).toBe(1);
    await H.expectNoErrors(errors);
  });

  test('an unrelated or unclear question produces no record and costs no work time; a near miss offers the open question', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#langInterp').click();
    const before = await H.getState(page);
    await say(page, '좋아하는 음식이 뭐예요?');
    await expect(page.locator('#log .msg.alien.off-record').last()).toBeVisible();
    const after = await H.getState(page);
    expect(after.performed).toEqual(before.performed);
    expect(after.score).toBe(before.score);
    // "돈이랑 귀국편은요?" fits two questions; only the one already open is offered
    await say(page, '돈이랑 귀국편은요?');
    const chip = page.locator('#askStatus button[data-cand]');
    await expect(chip).toHaveCount(1);
    await expect(chip).toContainText('체재비');
    await chip.click();
    await expect(page.locator('#log .msg.pending')).toHaveCount(0);
    expect((await H.getState(page)).asked).toContain('funds');
    expect((await H.hook(page, (T) => T.interview())).counts.clarify).toBe(1);
    await H.expectNoErrors(errors);
  });

  test('typing never triggers single-key shortcuts', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    const mode = (await H.getState(page)).language.mode;
    await page.locator('#askInput').click();
    await page.keyboard.type('khi');
    const st = await H.getState(page);
    expect(st.language.mode).toBe(mode); expect(st.language.interpreterActive).toBe(false); expect(st.looked).toEqual([]);
    await expect(page.locator('#askInput')).toHaveValue('khi');
    await H.expectNoErrors(errors);
  });

  test('the slice plays to the end: secondary → refusal → repatriation → debrief; retry restarts the same passenger', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#langInterp').click();
    for (const t of ['한국에서 30일 동안 뭐 할 거예요?', '귀국 항공권은 왜 없어요?', '돈은 얼마나 가지고 왔어요?', '국내 연락처는 누구입니까', '베트남에서 무슨 일 하세요?', '구로구 그 집에는 누가 살아요?']) await say(page, t);
    await H.lookup(page, 'contact'); await H.lookup(page, 'pnr');
    await say(page, '한국에서 일자리 알아본 적 있어요?');
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    await H.procAct(page, 'refuse');
    await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
    await H.continueDoc(page);
    await H.procAct(page, 'repat-order');
    await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과 · 디브리핑');
    const body = page.locator('#modalBody');
    await expect(body).toContainText('결정 근거');
    await expect(body).toContainText('제12조제3항제2호');
    await expect(body).toContainText('취업 관련 정보');
    await expect(body).toContainText('직접 입력 7');
    await expect(page.locator('#nextCase')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('inad-progress-v54'))).toBeNull();
    await page.locator('#liveRetry').click();
    await expect(page.locator('#caseName')).toContainText('쩐 반 민');
    expect((await H.getState(page)).asked).toEqual([]);
    await H.expectNoErrors(errors);
  });
});

test.describe('라이브 인터뷰 · 대체 경로', () => {
  test('without a speech API the microphone is hidden and the question box still works', async ({ page }) => {
    await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined }); });
    const errors = await H.openGame(page);
    await startLive(page);
    await expect(page.locator('#micBtn')).toBeHidden();
    await page.locator('#langInterp').click();
    await say(page, '방문 목적이 뭡니까');
    expect((await H.getState(page)).asked).toContain('purpose');
    await H.expectNoErrors(errors);
  });

  test('push-to-talk asks for consent first, shows the transcript for correction, and sends nothing by itself', async ({ page }) => {
    // A stand-in recogniser: no on-device support, returns one final result when started.
    await page.addInitScript(() => {
      class FakeRecognition { start() { setTimeout(() => { this.onresult?.({ results: [Object.assign([{ transcript: '방문 목적이 뭐예요' }], { isFinal: true })] }); this.onend?.(); }, 50); } stop() { this.onend?.(); } abort() {} }
      window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;
    });
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#langInterp').click();
    await page.locator('#micBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('음성 질문 사용');
    await expect(page.locator('#voiceLocal')).toBeDisabled(); // no on-device recognition in this browser
    await page.locator('#voiceBrowser').click();
    await expect(page.locator('#askInput')).toHaveValue('방문 목적이 뭐예요');
    await expect(page.locator('#askStatus')).toContainText('확인·수정');
    expect((await H.getState(page)).asked).toEqual([]);
    await page.locator('#askInput').fill('방문 목적이 무엇입니까');
    await page.locator('#askSend').click();
    await expect(page.locator('#log .msg.pending')).toHaveCount(0);
    const iv = await H.hook(page, (T) => T.interview());
    expect(iv.counts.voice).toBe(1);
    expect((await H.getState(page)).asked).toContain('purpose');
    expect(await page.evaluate(() => localStorage.getItem('inad-voice'))).toBe('browser');
    await H.expectNoErrors(errors);
  });

  test('reduced motion: replies are shown at once and the portrait does not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#langInterp').click();
    await page.locator('#questions .qbtn').first().click();
    await expect(page.locator('#log .msg.pending')).toHaveCount(0, { timeout: 200 });
    const transform = await page.locator('#stagePortrait canvas').evaluate((el) => el.style.transform);
    expect(transform).toBe('');
    await H.expectNoErrors(errors);
  });

  test('interview settings change only the amount of help', async ({ page }) => {
    const errors = await H.openGame(page);
    await startLive(page);
    await page.locator('#assistBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('인터뷰 설정');
    await page.locator('[data-assist="immersive"]').click();
    await page.locator('#modalClose').click();
    await expect(page.locator('#assistBtn')).toContainText('몰입');
    await page.locator('#qtabs .qtab-suggest').click();
    await expect(page.locator('#questions .qbtn')).toHaveCount(0);
    await expect(page.locator('#questions')).toContainText('몰입 모드');
    expect(await page.evaluate(() => localStorage.getItem('inad-assist'))).toBe('immersive');
    await H.expectNoErrors(errors);
  });
});

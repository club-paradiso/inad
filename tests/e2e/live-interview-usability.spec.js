import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Live interview belongs to the modern app.');

async function start(page) {
  await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('body')).toHaveClass(/mode-case/);
}

test('beginner next step offers one safe question, then moves to evidence without an automatic decision', async ({ page }) => {
  await start(page);
  await expect(page.locator('#liveNextStep')).toBeVisible();
  await expect(page.locator('#liveNextButton')).toContainText(/이 질문하기|Ask/);
  await expect(page.locator('#liveInputScope')).toContainText(/사건|scenario/);
  await page.locator('#langInterp').click();
  await page.locator('#liveNextButton').click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await expect(page.locator('#liveNextButton')).toContainText(/자료 화면|Open evidence/);
  await page.locator('#liveNextButton').click();
  await expect(page.locator('body')).toHaveAttribute('data-task', 'evidence');
  expect((await H.getState(page)).ended).toBe(false);
});

test('unrecognised text stays editable and the next question can still be asked', async ({ page }) => {
  await start(page);
  await page.locator('#langInterp').click();
  const input = page.locator('#askInput');
  await input.fill('좋아하는 음식이 뭐예요?');
  await input.press('Enter');
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await expect(input).toHaveValue('좋아하는 음식이 뭐예요?');
  await expect(page.locator('#askStatus')).toContainText('다른 말로 다시 질문');
  await input.fill('방문 목적이 무엇입니까');
  await input.press('Enter');
  if (await page.locator('#askStatus [data-confirm]').count()) await page.locator('#askStatus [data-confirm]').click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  expect((await H.getState(page)).asked).toContain('purpose');
  await expect(input).toHaveValue('');
});

test('optional model only proposes a question; examiner must explicitly confirm', async ({ page }) => {
  await page.route('**/api/npc', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: route.request().method() === 'GET'
      ? JSON.stringify({ available: true })
      : JSON.stringify({ questionId: 'purpose', reason: 'test-only' })
  }));
  await start(page);
  await page.locator('#langInterp').click();
  const input = page.locator('#askInput');
  await input.fill('what did the purple cloud say');
  await input.press('Enter');
  await expect(page.locator('#askStatus [data-confirm]')).toHaveCount(1);
  await expect(input).toHaveValue('what did the purple cloud say');
  expect((await H.getState(page)).asked).not.toContain('purpose');
  await page.locator('#askStatus [data-confirm]').click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  expect((await H.getState(page)).asked).toContain('purpose');
  await expect(input).toHaveValue('');
});

test('the mic recognition language follows interview language, not English UI', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('inad-locale', 'en');
    class FakeRecognition {
      start() { window.__heardLang = this.lang; }
      stop() { this.onend?.(); }
      abort() {}
    }
    window.SpeechRecognition = FakeRecognition;
    window.webkitSpeechRecognition = FakeRecognition;
  });
  await start(page);
  await page.locator('#micBtn').click();
  await expect(page.locator('#voiceBrowser')).toBeVisible();
  await page.locator('#voiceBrowser').click();
  await expect.poll(() => page.evaluate(() => window.__heardLang)).toBe('ko-KR');
});

// NPC Intelligence Layer — ICN-S2-005 vertical slice through the real game UI with a configured provider.
// The browser talks to the real /api/npc function (scripts/static-server.js) whose provider is a MOCK
// OpenAI-compatible server (scripts/mock-llm-server.js) on loopback. The mock is not a model: these tests prove
// the integration, confirmation, disclosure, failure and stale-turn behaviour, not model quality.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { createMockLlm } from '../../scripts/mock-llm-server.js';
import { createStaticServer } from '../../scripts/static-server.js';
import { resetNpcState } from '../../api/npc.js';
import { CASES } from '../../src/data/cases.js';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';
test.skip(target !== 'dist', 'needs the built app and a second local server');
test.describe.configure({ mode: 'serial' });

const UNPLACED = '하루하루 어떻게 보낼 생각이세요?'; // the deterministic engine cannot place this (checked in beforeAll)
const C = CASES.find((x) => x.id === 'ICN-S2-005');
const mock = createMockLlm({ table: { [UNPLACED]: 'purpose' }, delayMs: 2500 });
let server, origin;

test.beforeAll(async () => {
  const base = await mock.listen(0);
  Object.assign(process.env, { INAD_LLM_BASE_URL: base, INAD_LLM_MODEL: 'mock-not-a-model', INAD_LLM_API_KEY: '', INAD_NPC_PROVIDER: '', INAD_LLM_TIMEOUT_MS: '1500' });
  server = await createStaticServer(path.resolve('dist'), 0, { quiet: true });
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise((r) => server.close(r)); await mock.close(); for (const k of ['INAD_LLM_BASE_URL', 'INAD_LLM_MODEL', 'INAD_LLM_TIMEOUT_MS']) delete process.env[k]; });
// each test starts with a closed circuit and empty rate-limit buckets (a failure test opens the circuit on purpose)
test.beforeEach(() => { resetNpcState(); mock.state.mode = 'table'; mock.state.requests.length = 0; });

async function start(page, { viewport } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (viewport) await page.setViewportSize(viewport);
  const ready = page.waitForResponse((r) => r.url().endsWith('/api/npc') && r.request().method() === 'GET');
  await page.goto(`${origin}/`);
  expect((await (await ready).json()).available).toBe(true);
  await H.startLiveCase(page); // ICN-S2-005 vertical slice
  await expect(page.locator('#caseName')).toContainText('쩐 반 민');
  // stacked layouts show one task at a time: open the interview task first (no-op on desktop)
  const nav = page.locator('#taskNav button[data-task="interview"]');
  if (await nav.isVisible()) await nav.click();
  await page.locator('#langInterp').click();
  return errors;
}
const asked = (page) => page.evaluate(() => window.INADTest.state().asked);
const lastLine = (page) => page.locator('#log .msg.alien .msgtext').last();
async function type(page, text) { await page.locator('#askInput').fill(text); await page.locator('#askInput').press('Enter'); }

test('model-classified paraphrase is offered for confirmation and recorded only after the examiner accepts', async ({ page }) => {
  const errors = await start(page);
  await type(page, UNPLACED);
  const chip = page.locator('#askStatus [data-confirm]');
  await expect(chip).toHaveText(C.questions[0].q);
  expect(await asked(page)).toEqual([]);
  await chip.click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await expect(lastLine(page)).toContainText(C.questions[0].a);
  expect(await asked(page)).toEqual(['purpose']);
  // the model chose the delivery (validated lead id → approved words); the words of the answer are canonical
  await expect(page.locator('#log .msg.alien').last().locator('.lead')).toHaveText('아…');
  // nothing confidential ever reached the provider
  const wire = mock.state.requests.map((r) => r.raw).join('\n');
  for (const q of C.questions) expect(wire.includes(q.a), `answer ${q.id}`).toBe(false);
  for (const q of C.questions.filter((x) => (x.requires || []).length && !['occupation'].includes(x.id))) expect(wire.includes(q.q), `closed ${q.id}`).toBe(false);
  expect(errors).toEqual([]);
});

test('a provider naming a closed question is ignored: no record, the passenger asks to rephrase', async ({ page }) => {
  mock.state.mode = 'gated';
  const errors = await start(page);
  await type(page, '이 나라에 있는 지인에 대해 말해 보세요');
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await expect(page.locator('#askStatus [data-confirm]')).toHaveCount(0);
  expect(await asked(page)).toEqual([]);
  expect(await page.evaluate(() => window.INADTest.state().performed)).not.toContain('QUESTION_jobOffer');
  expect(errors).toEqual([]);
});

test('provider failure: quiet note, deterministic clarification, and the interview continues', async ({ page }) => {
  mock.state.mode = 'http500';
  const errors = await start(page);
  await type(page, UNPLACED);
  await expect(page.locator('#askStatus .ask-note')).toContainText('기본 해석');
  await expect(page.locator('#askStatus')).not.toContainText(/500|mock|http/i);
  await page.locator('#questions .qbtn').first().click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  expect((await asked(page)).length).toBe(1);
  expect(errors).toEqual([]);
});

test('a slow classification for an old turn never affects the newer turn', async ({ page }) => {
  mock.state.mode = 'slow'; mock.state.delayMs = 1200;
  const errors = await start(page);
  await type(page, UNPLACED);
  await expect(page.locator('#askStatus')).toContainText('질문을 확인하는 중');
  await page.locator('#askInput').fill('');
  await page.locator('#questions .qbtn[data-qid="funds"]').click(); // a newer turn
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await page.waitForTimeout(1600);
  await expect(page.locator('#askStatus [data-confirm]')).toHaveCount(0);
  expect(await asked(page)).toEqual(['funds']);
  expect(errors).toEqual([]);
});

test('keyboard-only and phone width: the confirmation is reachable and the page does not overflow', async ({ page }) => {
  const errors = await start(page, { viewport: { width: 390, height: 844 } });
  await type(page, UNPLACED);
  const chip = page.locator('#askStatus [data-confirm]');
  await expect(chip).toBeVisible();
  const box = await chip.boundingBox(); expect(box.height).toBeGreaterThanOrEqual(44); // touch target on phones
  await chip.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  expect(await asked(page)).toEqual(['purpose']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('reduced motion: no model acting request, no added pause; the answer still arrives', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = await start(page);
  await page.locator('#questions .qbtn[data-qid="return"]').click();
  await expect(page.locator('#log .msg.pending')).toHaveCount(0);
  await expect(lastLine(page)).toContainText(C.questions.find((q) => q.id === 'return').a);
  expect(mock.state.requests.filter((r) => JSON.parse(r.body.messages[1].content).options)).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('audited public fields used by the dialogue guard are rendered on the desk', async ({ page }) => {
  await start(page);
  const text = await page.evaluate(() => document.body.textContent);
  for (const f of ['purpose', 'stay', 'basis', 'basisDetail', 'visa', 'return', 'arrival']) expect(text.includes(C[f].split(' · ')[0]), f).toBe(true);
});

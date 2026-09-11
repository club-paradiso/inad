import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 314159;

test.describe('일반 입국심사 흐름', () => {
  test('1. 정상 승객 → 필수 확인 → 입국허가', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S1-001');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await expect(page.locator('#pRoman')).toHaveText('ROBERT VANCE');
    await expect(page.locator('#stageLabel')).toHaveText('일반심사');
    await H.ask(page, 'purpose');
    await H.ask(page, 'return');
    await H.ask(page, 'agenda');
    await page.locator('#clearBtn').click();
    await expect(page.locator('#modalTitle')).toHaveText('입국심사 완료');
    await H.continueDoc(page);
    await H.expectResult(page, '입국 허가');
    const st = await H.getState(page);
    expect(st.stage).toBe('ADMITTED');
    expect(st.strikes).toBe(0);
    expect(st.stats.admitted).toBe(1);
    expect(st.reports[0].label).toBe('입국 허가');
    expect(st.reports[0].procedure).toBe(100);
    await H.nextCase(page);
    await H.afterNext(page);
    await H.expectNoErrors(errors);
  });

  test('1b. 필수 확인 전 입국허가는 감찰 오류로 기록되고 사건은 계속된다', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S1-001');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await page.locator('#clearBtn').click();
    await expect(page.locator('#toast')).toContainText('감찰 경고');
    const st = await H.getState(page);
    expect(st.strikes).toBe(1);
    expect(st.ended).toBe(false);
    expect(st.mistakes.length).toBe(1);
    await H.expectNoErrors(errors);
  });

  test('2. 일반승객 → 입국재심 → 추가 확인 → 입국허가', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-006');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await H.ensureCommunication(page);
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'secondary');
    await expect(page.locator('#stageLabel')).toHaveText('입국재심');
    for (const q of ['friend', 'hotel', 'bookingName', 'itinerary']) await page.locator(`#procBody [data-proc-q="${q}"]`).click();
    await page.locator('#procBody [data-proc-lu="pnr"]').click();
    await page.locator('#procBody [data-proc-lu="contact"]').click();
    await H.procAct(page, 'clear');
    await H.continueDoc(page);
    await H.expectResult(page, '입국 허가');
    const st = await H.getState(page);
    expect(st.strikes).toBe(0);
    expect(st.performed).toContain('SECONDARY');
    expect(st.reports[0].actions).toContain('SECONDARY');
    expect(st.stats.secondary).toBe(1);
    expect(st.stats.admitted).toBe(1);
    await H.expectNoErrors(errors);
  });

  test('3. 목적 소명 실패 → 입국재심 → 입국불허 → 송환지시 → 출국대기실', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-005');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await H.ensureCommunication(page);
    await page.locator('#secondaryBtn').click();
    for (const q of ['return', 'funds', 'contact', 'purpose', 'occupation', 'addressOwner']) await page.locator(`#procBody [data-proc-q="${q}"]`).click();
    await page.locator('#procBody [data-proc-lu="contact"]').click();
    await page.locator('#procBody [data-proc-lu="pnr"]').click();
    await page.locator('#procBody [data-proc-q="jobOffer"]').click();
    await H.procAct(page, 'refuse');
    await expect(page.locator('#modalTitle')).toHaveText('입국 불허가 사유 선택');
    await page.locator('.reason[data-code="SIM-A12-PUR"]').click();
    await expect(page.locator('#modalTitle')).toHaveText('입국 불허가 통지서');
    await expect(page.locator('#modalBody')).toContainText('제12조제3항제2호');
    await H.continueDoc(page);
    await expect(page.locator('#procedureScreen')).toHaveAttribute('data-mode', 'repatriation');
    await H.procAct(page, 'repat-order');
    await expect(page.locator('#modalTitle')).toHaveText('송환지시서');
    await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await H.expectResult(page, '입국 불허');
    const st = await H.getState(page);
    expect(st.stage).toBe('ENTRY_REFUSED');
    expect(st.strikes).toBe(0);
    expect(st.stats.refused).toBe(1);
    expect(st.performed).toEqual(expect.arrayContaining(['SECONDARY', 'ENTRY_REFUSED', 'REPATRIATION_ORDER', 'DEPARTURE_WAITING_AREA']));
    await H.expectNoErrors(errors);
  });

  test('3b. 사실관계와 다른 불허사유 선택은 오류로 기록되며 사건을 종결하지 않는다', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S2-005');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-A11-SEC"]').click();
    const st = await H.getState(page);
    expect(st.strikes).toBe(1);
    expect(st.ended).toBe(false);
    expect(st.stage).toBe('PRIMARY');
    await H.expectNoErrors(errors);
  });

  test('4. 생체정보 제공 거부 → 제12조의2 불허 → 송환', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.caseId === 'ICN-S3-011');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await expect(page.locator('#entry')).toContainText('제12조의2');
    await H.ensureCommunication(page);
    for (const q of ['bio', 'exempt', 'age', 'official', 'explain']) await H.ask(page, q);
    await page.locator('#refuseBtn').click();
    await page.locator('.reason[data-code="SIM-BIO-REF"]').click();
    await expect(page.locator('#modalBody')).toContainText('생체정보 제공·본인확인 절차 불응');
    await H.continueDoc(page);
    await H.procAct(page, 'repat-order');
    await H.continueDoc(page);
    await H.procAct(page, 'waiting-room');
    await H.procAct(page, 'finish-refusal');
    await H.expectResult(page, '입국 불허');
    const st = await H.getState(page);
    expect(st.strikes).toBe(0);
    expect(st.reports[0].procedure).toBe(100);
    await H.expectNoErrors(errors);
  });
});

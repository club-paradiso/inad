import { test, expect } from '@playwright/test';
import { ENTRY } from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Evidence graph and vertical slices are additive to the current app.');

async function openAtlas(page, country = 'CA') {
  await page.goto(ENTRY);
  await page.locator('#atlasStartCountry').click();
  await expect(page.locator('[name="atlas-country"]')).toHaveCount(4);
  await page.locator(`[name="atlas-country"][value="${country}"]`).check();
  await page.locator('#atlasEnter').click();
  await expect(page.locator('body')).toHaveAttribute('data-country', country);
  await page.locator('#atlasSystem').click();
}

async function task(page, id) {
  if (await page.locator('#taskNav').isVisible()) {
    await page.locator(`#taskNav [data-task="${id}"]`).click();
  }
}

test.describe('ATLAS Phase C & D: Three Vertical Slices & Branching Investigation', () => {

  test('Canada SIM-CA-01 (Route 1: Records-First): departure date conflict unlocks clarification and yields thorough debrief', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('[data-case="SIM-CA-01"]').click();
    await page.locator('#atlasCallPassenger').click();

    // 1. Evidence zone: Select Fact 1 on DOC1 (ticket departure)
    await task(page, 'evidence');
    await expect(page.locator('#atlasCompareDock')).toBeVisible();

    const ticketChip = page.locator('#fact-SIM-CA-01-F-TICKET');
    await expect(ticketChip).toBeVisible();
    await ticketChip.click();
    await expect(page.locator('#compareSlot1')).toHaveClass(/has-fact/);
    await expect(page.locator('#atlasDoCompare')).toBeDisabled();

    // Switch to Document 2 to select Fact 2 (visit record departure)
    await page.locator('#doc-SIM-CA-01-DOC2').click();
    const visitChip = page.locator('#fact-SIM-CA-01-F-VISIT');
    await expect(visitChip).toBeVisible();
    await visitChip.click();
    await expect(page.locator('#compareSlot2')).toHaveClass(/has-fact/);
    await expect(page.locator('#atlasDoCompare')).toBeEnabled();

    // 2. Perform comparison -> CONFLICT
    await page.locator('#atlasDoCompare').click();
    const resultBox = page.locator('.atlas-result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/type-conflict/);
    await expect(resultBox).toContainText(/상충|Conflict/);
    await expect(page.locator('.atlas-discoveries-summary')).toContainText(/확인된 증거 관계|Discovered relationships/);

    // 3. Interview zone: Statement fact chip is NOT visible before asking explanation
    await task(page, 'interview');
    await expect(page.locator('#fact-SIM-CA-01-F-STMT')).toHaveCount(0);

    // Asking unrelated question (source) still does not reveal statement fact
    await page.locator('#ask-source').click();
    await expect(page.locator('#fact-SIM-CA-01-F-STMT')).toHaveCount(0);

    // Investigative question `clarify_dates` is unlocked
    const unlockedQ = page.locator('#ask-clarify_dates');
    await expect(unlockedQ).toBeVisible();
    await expect(unlockedQ).toBeEnabled();

    // Ask clarify_dates question
    await unlockedQ.click();
    await expect(page.locator('.atlas-transcript')).toContainText(/뒤집어|transposed/);

    // 4. Statement fact chip is now available
    const stmtChip = page.locator('#fact-SIM-CA-01-F-STMT');
    await expect(stmtChip).toBeVisible();

    // 5. Select statement fact, switch to DOC1, and compare with ticket fact -> MATCH
    await stmtChip.click();
    await task(page, 'evidence');
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await ticketChip.click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-match/);

    // Complete reviews and tasks
    for (const suffix of ['DOC1', 'DOC2']) {
      await page.locator(`#doc-SIM-CA-01-${suffix}`).click();
      await page.locator('#atlasReviewDoc').click();
    }
    await page.locator('#atlasSearchForm button[type="submit"]').click();
    await page.locator('[data-record]').first().click();

    await task(page, 'assessment');
    await page.locator('#atlasNotes').fill('Found departure date conflict (12 vs 21 Nov). Traveler confirmed transposition.');
    await task(page, 'evidence');
    for (const check of ['identity', 'evidence', 'handover']) {
      await page.locator(`#task-${check}`).click();
    }

    // Prepare simulated outcome
    await task(page, 'assessment');
    await page.locator('#atlasPrepare').click();
    await page.locator('#atlasOutcome').selectOption('review');
    await page.locator('#atlasConfirmOutcome').click();

    // 6. Evidence-based debrief verification
    const debrief = page.locator('.atlas-debrief');
    await expect(debrief).toBeVisible();
    await expect(debrief).toContainText(/철저한 검토|Thorough/);
    await expect(debrief).toContainText(/기록 우선|Records-first/);
    await expect(debrief).toContainText(/출국일 상충 확인|Date conflict confirmed/);

    expect(errors).toEqual([]);
  });

  test('Canada SIM-CA-01 (Route 2: Interview-First): interview first establishes statement-led branch', async ({ page }) => {
    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('[data-case="SIM-CA-01"]').click();
    await page.locator('#atlasCallPassenger').click();

    // 1. Interview zone: Ask initial question first
    await task(page, 'interview');
    await page.locator('#ask-clarify').click();
    await expect(page.locator('.atlas-transcript')).toContainText(/항공권|ticket/i);

    // 2. Select statement fact chip
    const stmtChip = page.locator('#fact-SIM-CA-01-F-STMT');
    await expect(stmtChip).toBeVisible();
    await stmtChip.click();

    // 3. Switch to evidence, select ticket fact on DOC1, and compare -> MATCH
    await task(page, 'evidence');
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#fact-SIM-CA-01-F-TICKET').click();
    await page.locator('#atlasDoCompare').click();

    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-match/);

    // 4. Compare ticket on DOC1 and visit record on DOC2 -> CONFLICT
    await page.locator('#atlasClearFacts').click();
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#fact-SIM-CA-01-F-TICKET').click();
    await page.locator('#doc-SIM-CA-01-DOC2').click();
    await page.locator('#fact-SIM-CA-01-F-VISIT').click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-conflict/);

    // Check investigation path recorded as interview_first
    const session = await page.evaluate(() => JSON.parse(localStorage.getItem('inad-atlas-v1')));
    expect(session.sessions.CA.cases['SIM-CA-01'].graph.investigationPath).toBe('interview_first');
  });

  test('United Kingdom SIM-GB-02: event vs stay duration gap distinguished from misconduct', async ({ page }) => {
    await openAtlas(page, 'GB');
    await task(page, 'passenger');
    await page.locator('[data-case="SIM-GB-02"]').click();

    // 1. Evidence: Compare 2-day event on DOC1 vs 10-day stay on DOC2
    await task(page, 'evidence');
    await page.locator('#doc-SIM-GB-02-DOC1').click();
    const eventChip = page.locator('#fact-SIM-GB-02-F-EVENT');
    await expect(eventChip).toBeVisible();
    await eventChip.click();

    await page.locator('#doc-SIM-GB-02-DOC2').click();
    const stayChip = page.locator('#fact-SIM-GB-02-F-STAY');
    await expect(stayChip).toBeVisible();
    await stayChip.click();

    await page.locator('#atlasDoCompare').click();

    // Result is UNVERIFIED gap, not conflict or misconduct
    const resultBox = page.locator('.atlas-result-box');
    await expect(resultBox).toHaveClass(/type-unverified/);
    await expect(resultBox).toContainText(/미확인|Unverified/);

    // 2. Interview: Tourism statement chip is NOT revealed before asking remaining days
    await task(page, 'interview');
    await expect(page.locator('#fact-SIM-GB-02-F-TOURISM')).toHaveCount(0);

    const unlockedQ = page.locator('#ask-gb02_remaining_days');
    await expect(unlockedQ).toBeVisible();
    await expect(unlockedQ).toBeEnabled();

    await unlockedQ.click();
    await expect(page.locator('.atlas-transcript')).toContainText(/관광|sightsee/);

    // 3. Compare stay duration with tourism statement -> MATCH
    await page.locator('#atlasClearFacts').click();
    const tourismChip = page.locator('#fact-SIM-GB-02-F-TOURISM');
    await expect(tourismChip).toBeVisible();
    await tourismChip.click();

    await task(page, 'evidence');
    await page.locator('#doc-SIM-GB-02-DOC2').click();
    await stayChip.click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-match/);
  });

  test('New Zealand SIM-NZ-02: missing page 2 triggers simulated evidence request', async ({ page }) => {
    await openAtlas(page, 'NZ');
    await task(page, 'passenger');
    await page.locator('[data-case="SIM-NZ-02"]').click();

    // 1. Evidence: Compare page 1 on DOC1 and receipt check on DOC2 (page 2 absent)
    await task(page, 'evidence');
    await page.locator('#doc-SIM-NZ-02-DOC1').click();
    const page1Chip = page.locator('#fact-SIM-NZ-02-F-PAGE1');
    await expect(page1Chip).toBeVisible();
    await page1Chip.click();

    await page.locator('#doc-SIM-NZ-02-DOC2').click();
    const receiptChip = page.locator('#fact-SIM-NZ-02-F-RECEIPT-PAGE2');
    await expect(receiptChip).toBeVisible();
    await receiptChip.click();

    await page.locator('#atlasDoCompare').click();

    // Result is MISSING
    const resultBox = page.locator('.atlas-result-box');
    await expect(resultBox).toHaveClass(/type-missing/);
    await expect(resultBox).toContainText(/누락|Missing/);

    // 2. Evidence Request panel rendered in compare dock
    const reqBtn = page.locator('#atlasRequestPage2');
    await expect(reqBtn).toBeVisible();
    await expect(reqBtn).toBeEnabled();

    // 3. Issue evidence request
    await reqBtn.click();
    await expect(reqBtn).toBeDisabled();
    await expect(reqBtn).toContainText(/완료|lodged/);

    // 4. Interview: Page 2 statement fact chip is NOT visible before asking question
    await task(page, 'interview');
    await expect(page.locator('#fact-SIM-NZ-02-F-PAGE2-DETAIL')).toHaveCount(0);

    const unlockedQ = page.locator('#ask-nz02_missing_page');
    await expect(unlockedQ).toBeVisible();
    await expect(unlockedQ).toBeEnabled();
    await unlockedQ.click();
    await expect(page.locator('.atlas-transcript')).toContainText(/숙박|Accommodation/);
    await expect(page.locator('#fact-SIM-NZ-02-F-PAGE2-DETAIL')).toBeVisible();
  });

  test('Mobile sequential fact selection (390px): facts preserved across tab switching', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('#atlasCallPassenger').click();

    // 1. In Evidence zone: select ticket fact on DOC1
    await task(page, 'evidence');
    const ticketChip = page.locator('#fact-SIM-CA-01-F-TICKET');
    await ticketChip.click();
    await expect(page.locator('#compareSlot1')).toHaveClass(/has-fact/);

    // 2. Switch to Interview zone: ask question to reveal statement fact
    await task(page, 'interview');
    await page.locator('#ask-clarify').click();
    const stmtChip = page.locator('#fact-SIM-CA-01-F-STMT');
    await expect(stmtChip).toBeVisible();

    // Slot 1 still has the ticket fact! Select statement fact for Slot 2
    await stmtChip.click();

    // 3. Switch back to Evidence zone: both slots are filled!
    await task(page, 'evidence');
    await expect(page.locator('#compareSlot1')).toHaveClass(/has-fact/);
    await expect(page.locator('#compareSlot2')).toHaveClass(/has-fact/);
    await expect(page.locator('#atlasDoCompare')).toBeEnabled();

    // 4. Execute compare on mobile
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toBeVisible();
  });

  test('Accessible keyboard navigation: Tab and Enter select chips and trigger comparison', async ({ page }) => {
    await openAtlas(page, 'CA');
    await task(page, 'evidence');

    const ticketChip = page.locator('#fact-SIM-CA-01-F-TICKET');
    await ticketChip.focus();
    await page.keyboard.press('Enter');
    await expect(ticketChip).toHaveAttribute('aria-pressed', 'true');

    // Switch to DOC2 and select visitChip
    await page.locator('#doc-SIM-CA-01-DOC2').focus();
    await page.keyboard.press('Enter');

    const visitChip = page.locator('#fact-SIM-CA-01-F-VISIT');
    await visitChip.focus();
    await page.keyboard.press('Enter');
    await expect(visitChip).toHaveAttribute('aria-pressed', 'true');

    const compareBtn = page.locator('#atlasDoCompare');
    await compareBtn.focus();
    await page.keyboard.press('Enter');

    const resultBox = page.locator('.atlas-result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveAttribute('role', 'status');
  });

  test('Save persistence: browser reload preserves evidence graph discoveries and unlocked questions', async ({ page }) => {
    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('#atlasCallPassenger').click();
    await task(page, 'evidence');

    // Perform comparison across DOC1 and DOC2
    await page.locator('#fact-SIM-CA-01-F-TICKET').click();
    await page.locator('#doc-SIM-CA-01-DOC2').click();
    await page.locator('#fact-SIM-CA-01-F-VISIT').click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-conflict/);

    // Reload page
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-country', 'CA');

    // Verify discoveries preserved
    await task(page, 'evidence');
    await expect(page.locator('.atlas-discoveries-summary')).toBeVisible();
    await expect(page.locator('.atlas-discoveries-summary')).toContainText(/출국일 불일치|Date conflict/);

    // Verify investigative question remains unlocked
    await task(page, 'interview');
    await expect(page.locator('#ask-clarify_dates')).toBeVisible();
    await expect(page.locator('#ask-clarify_dates')).toBeEnabled();
  });

  test('Korean mode parity: switching back to KR preserves baseline operation', async ({ page }) => {
    await openAtlas(page, 'CA');
    await page.locator('#atlasCountry').click();
    await page.locator('[name="atlas-country"][value="KR"]').check();
    await page.locator('#atlasEnter').click();
    await page.locator('#atlasSwitch').click();

    // Korean workstation active
    await expect(page.locator('body')).toHaveAttribute('data-country', 'KR');
    await expect(page.locator('#brandTag')).toHaveText('v10.0');
    await expect(page.locator('#caseCount')).toBeVisible();
  });

  test('Canadian simulated passenger call persists across reload and workspace switches', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('#atlasCallPassenger').click();
    await expect(page.locator('.zone-person')).toContainText(/대면 조사 중|At counter/);
    await page.locator('#ask-source').click();
    await expect(page.locator('.atlas-transcript')).not.toContainText(/질문 대기|No questions yet/);
    await page.locator('#atlasSystem').click();
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-country', 'CA');
    await task(page, 'passenger');
    await expect(page.locator('.zone-person')).toContainText(/대면 조사 중|At counter/);
    await task(page, 'interview');
    await expect(page.locator('.atlas-transcript')).not.toContainText(/질문 대기|No questions yet/);
    expect(errors).toEqual([]);
  });

  test('Canada SIM-CA-01 full start-to-finish encounter: call, examine, compare, decide, debrief, and verify persistence', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openAtlas(page, 'CA');

    // 1. Passenger call
    await task(page, 'passenger');
    const callBtn = page.locator('#atlasCallPassenger');
    await expect(callBtn).toBeVisible();
    await callBtn.click();
    await expect(page.locator('.zone-person')).toContainText(/대면 조사 중|At counter/);
    await expect(callBtn).toHaveCount(0);

    // 2. Documents examination
    await task(page, 'evidence');
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#atlasReviewDoc').click();
    await page.locator('#doc-SIM-CA-01-DOC2').click();
    await page.locator('#atlasReviewDoc').click();

    // 3. Evidence comparison: Conflict between ticket and visit record
    await page.locator('#fact-SIM-CA-01-F-VISIT').click();
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#fact-SIM-CA-01-F-TICKET').click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-conflict/);

    // 4. Interview: Unlocked question
    await task(page, 'interview');
    const unlockedQ = page.locator('#ask-clarify_dates');
    await expect(unlockedQ).toBeVisible();
    await unlockedQ.click();
    await expect(page.locator('.atlas-transcript')).toContainText(/12일|12 Nov/);

    // 5. Compare statement fact with ticket
    await task(page, 'evidence');
    await page.locator('#atlasClearFacts').click();
    await task(page, 'interview');
    const stmtChip = page.locator('#fact-SIM-CA-01-F-STMT');
    await expect(stmtChip).toBeVisible();
    await stmtChip.click();
    await task(page, 'evidence');
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#fact-SIM-CA-01-F-TICKET').click();
    await page.locator('#atlasDoCompare').click();
    await expect(page.locator('.atlas-result-box')).toHaveClass(/type-match/);

    // 6. Record search & tasks
    await page.locator('#atlasSearchForm button[type="submit"]').click();
    await page.locator('[data-record]').first().click();
    await task(page, 'assessment');
    await page.locator('#atlasNotes').fill('Discrepancy identified between ticket and visit record. Explanation noted.');
    await task(page, 'evidence');
    for (const t of ['identity', 'evidence', 'handover']) {
      await page.locator(`#task-${t}`).click();
    }

    // 7. Decision submission
    await task(page, 'assessment');
    await page.locator('#atlasPrepare').click();
    await expect(page.locator('#atlasOutcome')).toBeVisible();
    await page.locator('#atlasOutcome').selectOption('review');
    await page.locator('#atlasRationale').fill('Ticket date (12 Nov) contradicts visit record (21 Nov). Retain original sources and refer for review.');
    await page.locator('#atlasConfirmOutcome').click();

    // 8. Debrief verification
    const debrief = page.locator('.atlas-debrief');
    await expect(debrief).toBeVisible();
    await expect(debrief).toContainText(/철저한 검토|Thorough/);
    await expect(debrief).toContainText(/출국일 상충 확인|Date conflict confirmed/);

    // 9. Save persistence
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('inad-atlas-v1')));
    const ca01 = saved.sessions.CA.cases['SIM-CA-01'];
    expect(ca01.completed).toBe(true);
    expect(ca01.encounter).toEqual({ version: 1, phase: 'completed' });
    expect(ca01.outcome).toBe('review');
    expect(errors).toEqual([]);
  });

  test('Canada SIM-CA-01 bypass prevention: interview actions and completion fail without calling simulated passenger', async ({ page }) => {
    await openAtlas(page, 'CA');
    await task(page, 'passenger');
    await page.locator('[data-case="SIM-CA-01"]').click();

    // Verify Call Passenger button is visible and passenger has NOT been called
    const callBtn = page.locator('#atlasCallPassenger');
    await expect(callBtn).toBeVisible();

    // 1. In Interview zone: warning notice is displayed and questions are disabled
    await task(page, 'interview');
    await expect(page.locator('.zone-interview')).toContainText(/가상 승객을 먼저 호출하십시오|Call simulated passenger/);
    await expect(page.locator('#ask-clarify')).toBeDisabled();

    // 2. Review documents, search records and fill notes in attempt to bypass calling
    await task(page, 'evidence');
    await page.locator('#doc-SIM-CA-01-DOC1').click();
    await page.locator('#atlasReviewDoc').click();
    await page.locator('#doc-SIM-CA-01-DOC2').click();
    await page.locator('#atlasReviewDoc').click();

    await page.locator('#atlasSearchForm button[type="submit"]').click();
    await page.locator('[data-record]').first().click();

    await task(page, 'assessment');
    await page.locator('#atlasNotes').fill('Bypass attempt without calling simulated passenger.');

    // 3. In Assessment zone: '가상 승객 호출' / 'Call simulated passenger' is listed under remaining requirements
    await expect(page.locator('.zone-assessment')).toContainText(/가상 승객 호출|Call simulated passenger/);
    await page.locator('#atlasPrepare').click();
    await expect(page.locator('#modal')).toHaveAttribute('aria-hidden', 'true');

    // 4. Persistence check: Save state remains incomplete and encounter remains undefined
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('inad-atlas-v1')));
    const ca01 = saved.sessions.CA.cases['SIM-CA-01'];
    expect(ca01.completed).toBe(false);
    expect(ca01.encounter).toBeUndefined();
  });

});

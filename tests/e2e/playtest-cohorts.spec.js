import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.describe('V11 Playtest Evaluation Suites (Cohorts A, B, C)', () => {
  test('Cohort A (First-Time Player): One-click Live Start, question asking, and quick verdict', async ({ page }) => {
    const errors = await H.openGame(page);

    // 1. Dominant primary start button is immediately visible without configuration
    const liveStartBtn = page.locator('#liveStartBtn');
    await expect(liveStartBtn).toBeVisible();
    await expect(liveStartBtn).toHaveText(/인터뷰 시작/);

    // 2. Click takes player straight into the live interview booth
    await liveStartBtn.click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    await expect(page.locator('#stagePortrait')).toBeVisible({ timeout: 6000 });

    // 3. Connect interpreter for clear conversation
    await page.locator('#langInterp').click();

    // 4. Passenger stage and initial dialogue are rendered
    await expect(page.locator('#pPortrait')).toBeAttached();
    await expect(page.locator('#stagePortrait')).toBeVisible();
    await expect(page.locator('#log')).toBeVisible();

    // 5. Ask a question via the first question button
    const firstQ = page.locator('#questions .qbtn').first();
    await expect(firstQ).toBeVisible({ timeout: 5000 });
    await firstQ.click();

    // 6. Passenger responds in transcript
    await expect(page.locator('#log .msg.alien')).toHaveCount(2, { timeout: 7000 });

    // 7. Complete case with legal verdict
    const clearBtn = page.locator('#clearBtn');
    await expect(clearBtn).toBeEnabled();
    await clearBtn.click();

    // Touch safety or normal click: confirm if armed
    const isArmed = await clearBtn.evaluate((el) => el.classList.contains('armed'));
    if (isArmed) await clearBtn.click();

    await H.expectNoErrors(errors);
  });

  test('Cohort B (Investigation / Statement Lock): Capture statement, match against lookup, trigger contradiction & avatar reaction', async ({ page }) => {
    const errors = await H.openGame(page);

    // 1. Launch introductory case (ICN-S2-005)
    await page.locator('#liveStartBtn').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    await expect(page.locator('#stagePortrait')).toBeVisible({ timeout: 6000 });

    // Connect interpreter
    await page.locator('#langInterp').click();

    // 2. Ask contact question
    await H.ask(page, 'contact');
    await expect(page.locator('#log .msg.alien')).toHaveCount(2, { timeout: 7000 });

    // 3. Lock pin button should be present on the alien statement
    const lastAlienMsg = page.locator('#log .msg.alien').last();
    const lockPin = lastAlienMsg.locator('.msg-lock-btn');
    await expect(lockPin).toBeVisible();
    await lockPin.click();

    // 4. Dock should open in active selection state
    const dock = page.locator('#statementLockDock');
    await expect(dock).toBeVisible();
    await expect(dock).toHaveClass(/lock-active/);

    // 5. Run contact lookup in terminal
    await H.lookup(page, 'contact');
    const lookupLine = page.locator('#terminal .line[data-lookup-kind="contact"]');
    await expect(lookupLine).toBeVisible();

    // 6. Click lookup line to execute statement comparison
    await lookupLine.click();

    // 7. Contradiction detected
    await expect(dock).toHaveClass(/lock-matched/, { timeout: 5000 });
    await expect(dock.locator('.lock-tag.conflict')).toBeVisible();

    // 8. Avatar stage enters hesitant reaction state
    const stageState = page.locator('#stageState');
    await expect(stageState).toHaveAttribute('data-label', '머뭇거리는 중');

    await H.expectNoErrors(errors);
  });

  test('Cohort C (Domain & Analytics): Ambiguity candidate resolution and system telemetry audit', async ({ page }) => {
    const errors = await H.openGame(page);

    await page.locator('#liveStartBtn').click();
    await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
    await expect(page.locator('#stagePortrait')).toBeVisible({ timeout: 6000 });

    // Connect interpreter
    await page.locator('#langInterp').click();

    // Type query into ask input
    const input = page.locator('#askInput');
    await expect(input).toBeVisible();
    await input.fill('한국에서 30일 동안 뭐 할 거예요?');
    await input.press('Enter');

    // Dialogue logged and answered
    await expect(page.locator('#log .msg.alien')).toHaveCount(2, { timeout: 5000 });

    // Open System Center modal to check privacy-safe analytics
    await page.locator('#moreBtn').click();
    const sysBtn = page.locator('#systemBtn');
    await expect(sysBtn).toBeVisible();
    await sysBtn.click();
    await expect(page.locator('#modal')).toHaveClass(/on/);

    // Click "플레이 통계 확인" button in System Center
    const analyticsBtn = page.locator('#sysAnalyticsBtn');
    await expect(analyticsBtn).toBeVisible();
    await analyticsBtn.click();

    // Analytics modal should display telemetry facts without PII
    const modalBody = page.locator('#modalBody');
    await expect(modalBody).toContainText('세션 및 사건 처리 통계');
    await expect(modalBody).toContainText('질문 입력 방식 분포');

    // Verify analytics snapshot via window hook
    const snap = await page.evaluate(() => window.INADSystem?.analytics?.());
    expect(snap).toBeDefined();
    expect(snap.totals.questionsAsked).toBeGreaterThanOrEqual(1);

    // Close modal
    await page.locator('#modalClose').click();
    await expect(page.locator('#modal')).not.toHaveClass(/on/);

    await H.expectNoErrors(errors);
  });
});

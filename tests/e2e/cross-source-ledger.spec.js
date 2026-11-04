import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

test.skip(process.env.INAD_TARGET === 'legacy', 'Cross-source review belongs to the modular evidence workbench.');

async function start(page) {
  await H.openGame(page);
  await page.locator('#liveStartBtn').click();
  await expect(page.locator('body')).toHaveClass(/mode-case/);
}

test('only observed sources can be compared; unresolved notes change neither actions nor score', async ({ page }) => {
  await start(page);
  const details = page.locator('#crossPanel');
  await expect(details.locator('summary')).toContainText('진술·서류·조회 결과 대조');
  await details.locator('summary').click();
  const options = page.locator('#crossSource option');
  expect(await options.allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining('승객 진술')]));
  expect((await options.allTextContents()).some((text) => text.includes('전산 조회'))).toBe(false);
  const sourceId = await page.locator('#crossSource').inputValue();
  const before = await H.getState(page);
  await expect(page.locator('#crossSourceText')).toContainText('명동');
  await page.locator('#crossNote').fill('서류와 진술의 관련성을 추가 확인');
  await page.locator('#crossPanel [data-compare="followup"]').click();
  const marked = await H.getState(page);
  expect(marked.comparisonNotes['0|' + sourceId]).toMatchObject({ status: 'followup', note: '서류와 진술의 관련성을 추가 확인' });
  expect(marked.performed).toEqual(before.performed);
  expect(marked.looked).toEqual(before.looked);
  expect(marked.asked).toEqual(before.asked);
  expect(marked.score).toBe(before.score);
  await expect(page.locator('#caseNote')).toContainText('미확인 사항 1건');
  await page.locator('#crossPanel [data-compare="checked"]').click();
  expect((await H.getState(page)).comparisonNotes['0|' + sourceId].status).toBe('checked');
  await expect(page.locator('#caseNote')).not.toContainText('미확인 사항 1건');
  await page.locator('#crossPanel [data-compare="clear"]').click();
  expect((await H.getState(page)).comparisonNotes).toEqual({});
});

test('lookup source appears only after it is performed; notes reset on case restart', async ({ page }) => {
  await start(page);
  const details = page.locator('#crossPanel');
  await details.locator('summary').click();
  await expect(page.locator('#crossSource option[value="lookup:pnr"]')).toHaveCount(0);
  await page.locator('.lookup-tabs [data-lu="pnr"]').click();
  await expect(page.locator('#crossSource option[value="lookup:pnr"]')).toHaveCount(1);
  await page.locator('#crossSource').selectOption('lookup:pnr');
  await expect(page.locator('#crossSourceText')).toContainText('편도');
  await page.locator('#crossNote').fill('예약정보는 진술과 별도로 확인');
  await page.locator('#crossPanel [data-compare="followup"]').click();
  expect((await H.getState(page)).comparisonNotes['0|lookup:pnr']).toMatchObject({ status: 'followup' });
  await page.evaluate(() => window.INADTest.jump(0));
  expect((await H.getState(page)).comparisonNotes).toEqual({});
  await expect(page.locator('#crossSource option[value="lookup:pnr"]')).toHaveCount(0);
});

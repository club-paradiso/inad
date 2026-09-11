import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const SEED = 161803;

test.describe('동행인·언어', () => {
  test('7. 동행인 진술 교차검증 → 재심 → 입국허가', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const idx = await H.findQueueIndex(page, (q) => q.sessionVariant === 'party-secondary-clear');
    const party = await H.hook(page, (T, i) => T.partyFor(i), idx);
    expect(party.mode).toBe('minor-resolved');
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await expect(page.locator('#partyBox')).toHaveClass(/on/);
    await expect(page.locator('#partyBox')).toContainText('동행 사실 자체는 입국판정 근거가 아닙니다');
    const st0 = await H.getState(page);
    if (st0.language.mode === 'none') await page.locator('#langInterp').click();
    await page.locator('#secondaryBtn').click();
    await expect(page.locator('#procBody')).toContainText('동행여행 교차검증');
    await H.procAct(page, 'back');
    await H.ask(page, 'purpose');
    await H.ask(page, 'partyRelation');
    await H.ask(page, 'partyPlan');
    await H.lookup(page, 'party');
    await expect(page.locator('#terminal')).toContainText('동행인 교차검증');
    await page.locator('#clearBtn').click();
    await H.continueDoc(page);
    await H.expectResult(page, '입국 허가');
    const st = await H.getState(page);
    expect(st.strikes).toBe(0);
    expect(st.performed).toEqual(expect.arrayContaining(['SECONDARY', 'QUESTION_partyRelation', 'QUESTION_partyPlan', 'LOOKUP_party']));
    await H.expectNoErrors(errors);
  });

  test('8. 통역 필요 승객 → 이해 실패 → 통역 → 유효 진술 → 입국허가', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, SEED);
    const queue = await H.getQueue(page);
    let idx = -1;
    for (const q of queue) {
      if (q.caseId || q.sessionVariant !== 'routine-clear') continue;
      const lang = await H.hook(page, (T, i) => T.languageFor(i), q.index);
      const party = await H.hook(page, (T, i) => T.partyFor(i), q.index);
      if (lang.mode === 'none' && !party) { idx = q.index; break; }
    }
    expect(idx, 'a routine passenger without direct communication exists in this seed').toBeGreaterThanOrEqual(0);
    await H.startShift(page);
    await H.jumpTo(page, idx);
    await expect(page.locator('#languageStatus')).toContainText('통역 호출을 권고');
    await H.ask(page, 'purpose');
    let st = await H.getState(page);
    expect(st.asked).toEqual([]);
    await expect(page.locator('#log')).toContainText('충분히 이해하지 못했습니다');
    await page.locator('#langInterp').click();
    await expect(page.locator('#langInterp')).toContainText('통역 연결됨');
    await expect(page.locator('#log')).toContainText('통역 지원이 연결되었습니다');
    await H.ask(page, 'purpose');
    st = await H.getState(page);
    expect(st.asked).toContain('purpose');
    expect(st.stats.interpreter).toBe(1);
    await page.locator('#clearBtn').click();
    await H.continueDoc(page);
    await H.expectResult(page, '입국 허가');
    st = await H.getState(page);
    expect(st.strikes, '통역 사용은 불리하게 평가되지 않는다').toBe(0);
    expect(st.reports[0].interpreter).toBe(1);
    expect(st.reports[0].procedure).toBe(100);
    await H.expectNoErrors(errors);
  });
});

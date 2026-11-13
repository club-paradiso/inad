// The photo on a document is the ID-framed rendering of the portrait, not the booth picture again. Same person
// by construction (one source image), different picture — and a forged passport still shows the other person.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';

test.describe('서류 사진과 부스 실물', () => {
  test.skip(target === 'legacy', 'v6.1 baseline printed the booth portrait on the passport');

  test('the passport photo is cropped and toned; the live capture is not', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.hook(page, (T) => T.live());
    const doc = page.locator('#docview .passport-photo img.doc-photo');
    await expect(doc).toBeVisible();
    const d = await doc.evaluate((img) => { const cs = getComputedStyle(img); const r = img.getBoundingClientRect(), c = img.parentElement.getBoundingClientRect(); return { src: img.getAttribute('src'), transform: cs.transform, filter: cs.filter, covers: r.left <= c.left + 1 && r.right >= c.right - 1 && r.top <= c.top + 1 && r.bottom >= c.bottom - 1, bigger: r.width > c.width * 1.2 }; });
    expect(d.transform).not.toBe('none');
    expect(d.filter).toContain('saturate');
    expect(d.covers).toBe(true);
    expect(d.bigger).toBe(true);
    // same person: the document photo is drawn from the traveller's own portrait
    const t = (await H.currentCase(page)).travelerId;
    expect(d.src).toBe(`assets/portraits/${t}.webp`);
    await page.locator('#wbTabEntry').click();
    const pair = await page.locator('.bio-pair').evaluate((el) => [...el.querySelectorAll('img')].map((img) => ({ doc: img.classList.contains('doc-photo'), transform: getComputedStyle(img).transform, src: img.getAttribute('src') })));
    expect(pair.map((x) => x.doc)).toEqual([true, false]);
    expect(pair[0].transform).not.toBe('none');
    expect(pair[1].transform).toBe('none');
    expect(pair[0].src).toBe(pair[1].src);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await H.expectNoErrors(errors);
  });

  test('a forged passport still carries another person\'s photo', async ({ page }) => {
    const errors = await H.openGame(page);
    let index = -1;
    for (const seed of [271828, 314159, 161803, 141421, 173205, 223606]) {
      await H.setSeed(page, seed);
      index = (await H.getQueue(page)).findIndex((q) => q.special === 'forgery');
      if (index >= 0) break;
    }
    expect(index, 'a seed with the forgery case').toBeGreaterThanOrEqual(0);
    await H.startShift(page);
    await H.jumpTo(page, index);
    const live = (await H.currentCase(page)).travelerId;
    const src = await page.locator('#docview .passport-photo img.doc-photo').getAttribute('src');
    expect(src).toMatch(/^assets\/portraits\/TRV-\d+\.webp$/);
    expect(src).not.toBe(`assets/portraits/${live}.webp`);
    await H.expectNoErrors(errors);
  });
});

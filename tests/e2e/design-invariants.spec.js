// Design invariants that carry a legal meaning. Demeanour, tension, cooperation and language ability are not
// decision grounds (CLAUDE.md), so they are never painted in the admit / secondary / refuse semantic colours.
// Every state the engine can produce is rendered (band classes are applied directly) and its computed colours
// are compared with the semantic tokens. Also: the briefing's queue figure is the simulated backlog the top bar
// shows, not a separate number.
import { test, expect } from '@playwright/test';
import * as H from './helpers.js';

const target = process.env.INAD_TARGET || 'dist';

test.describe('디자인 불변식', () => {
  test.skip(target === 'legacy', 'v6.1 baseline coloured demeanour semantically');

  test('demeanour, tension, cooperation and communication status never use decision colours', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, 271828);
    await H.startShift(page);
    await H.ensureCommunication(page);
    await H.ask(page, 'purpose');
    const hits = await page.evaluate(() => {
      const root = getComputedStyle(document.body);
      const toRgb = (v) => { const d = document.createElement('i'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      const semantic = new Set(['success', 'warning', 'danger'].flatMap((k) => [`--${k}`, `--${k}-text`, `--${k}-soft`]).map((t) => toRgb(root.getPropertyValue(t).trim())));
      const out = [];
      const check = (el, label) => { if (!el) return; const cs = getComputedStyle(el); for (const prop of ['color', 'backgroundColor', 'borderLeftColor']) if (semantic.has(cs[prop])) out.push(`${label} ${prop} ${cs[prop]}`); };
      const att = document.getElementById('pAttitude'), msg = document.querySelector('#log .msg.alien'), status = document.getElementById('languageStatus');
      if (msg && !msg.querySelector('.behavior-event')) msg.querySelector('b').insertAdjacentHTML('beforeend', '<span class="behavior-event">probe</span>');
      for (const cls of ['calm', 'tense', 'upset', 'closed']) { att.className = 'attitude ' + cls; check(att, `#pAttitude.${cls}`); }
      for (const cls of ['behavior-calm', 'behavior-tense', 'behavior-upset']) { msg.className = 'msg alien ' + cls; check(msg.querySelector('.behavior-event'), `.${cls} .behavior-event`); }
      for (const cls of ['good', 'warn', 'bad']) { status.className = 'language-status ' + cls; check(status, `#languageStatus.${cls}`); }
      check(document.getElementById('stressFill'), '#stressFill'); check(document.getElementById('rapportFill'), '#rapportFill');
      return out;
    });
    expect(hits).toEqual([]);
    await H.expectNoErrors(errors);
  });

  test('the briefing queue figure is the simulated backlog shown in the top bar', async ({ page }) => {
    const errors = await H.openGame(page);
    await H.setSeed(page, 271828);
    await H.chooseStartOption(page, '[data-guidance="expert"]');
    await page.locator('#startBtn').click();
    const kpi = page.locator('#modalBody .briefkpi').filter({ hasText: '현재 게임상 대기' }).locator('b');
    const briefed = (await kpi.textContent()).trim();
    await page.locator('#briefStart').click();
    await expect(page.locator('#queue')).toHaveText(briefed);
    // the queue KPI tone follows the pressure label instead of a fixed warning colour
    const tone = await page.evaluate(() => document.getElementById('queueKpi').className);
    const label = (await page.locator('#pressureLabel').textContent()).trim();
    expect(tone).toBe(`kpi ${{ 안정: 'good', 보통: 'warn', 혼잡: 'bad' }[label]}`);
    await H.expectNoErrors(errors);
  });
});

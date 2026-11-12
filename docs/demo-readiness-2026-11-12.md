# Demo readiness — 2026-11-12 audit (real browser)

Baseline `main` at `9b4d97b`. Everything below was run in this checkout with Chromium (Playwright 1.63); nothing is
carried over from older reports. `docs/inspection-workflow-2026-11.md` recorded that visual sign-off was pending
because no browser could start; this pass supplies it for the Korean first interview at 1440×900, 1024×768 and 390×844.

## Baseline (before any change)
lint 116 modules OK · unit 335/335 · build OK (initial transfer 292.5 KB gz) · integrity 21/21 · E2E 231/231.
The suite was green while the defect below was on screen: no test looked at how much of the record was visible.

## Findings

| | Finding | Evidence | Status |
|---|---|---|---|
| P0 | The coach banner and the Statement Lock dock are optional children of `.panel-interview`, but the grid template listed four rows. With the banner showing (always, on a first interview) every child moved one track down: the banner took the transcript's `1fr` track, the question box took the list's. | 1024×768: record 29px tall, statement clipped, question box 210px, question list 22px. 1440×900: banner 96px for 48px of text. | Fixed |
| P0 | On phones the record is rendered while its zone is hidden, so `scrollTop` is not applied. Opening 인터뷰 showed the two system notices; the passenger's statement was off screen. | 320×568 and 844×390: 0px of the statement visible. | Fixed |
| P1 | The interview column carries four layers of guidance before the question list (coach banner · 쉬운 진행 · input-scope note · language status). At 1024×768 the list starts below the fold. | Screenshots, this pass. | Open — needs a design decision, not a patch |
| P1 | 390px 승객 tab: the 인터뷰 시작 button sits on the portrait's forehead area; identity fields start below the fold. | Screenshot, this pass. | Open |
| P1 | Start screen: the full-width 국가 선택 button sits above the primary action; a first-time player meets XP missions in the side column before playing once. | Screenshot, this pass. | Open |
| P2 | 1024×768: after the fix the record gets 72px until the conversation grows (traveller panel keeps up to 42% of the column). | Measured. | Open |

## After the fix
Visible height of the record (px), first interview, coach banner showing:

| Viewport | Before | After |
|---|---|---|
| 320×568 | 110 (statement hidden) | 124 (statement visible) |
| 390×844 | 214 | 253 |
| 844×390 | 110 (statement hidden) | 119 (statement visible) |
| 768×1024 | 193 | 206 |
| 1024×768 | 29 | 72 |
| 1366×768 | 214 | 241 |
| 1440×900 | 214 | 300 |

lint OK · unit 335/335 · integrity 21/21 · E2E 238/238 (231 + 7 new in `interview-record-layout.spec.js`; the new
spec fails 7/7 on the unfixed source).

## Not verified in this pass
ATLAS (CA/GB/NZ) screens by eye · Firefox/WebKit · `scripts/measure-performance.js` · the public deployment's parity
with `main` · Figma synchronisation · any generated artwork.

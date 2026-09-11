# Design System v2

Direction: Korean public-sector operations workstation (60%) · airport/border control (25%) · game feedback (15%). Restrained, dense, legible, high-trust. Not a SaaS dashboard, not cyberpunk.

## Tokens (`src/styles/tokens.css`)
- Surfaces: `--canvas` (page), `--chrome` / `--chrome-2` (header, footer, procedure header, queue bar), `--surface` (panel body), `--surface-2` (sunken), `--elevated` (cards, modals), `--document` (paper), `--panel-head`.
- Borders: `--border-subtle` / `--border` / `--border-strong`. Text: `--text` / `--text-2` / `--text-3`.
- Semantic: `--accent` (action/selection), `--success` (허가·확인), `--warning` (재심·주의), `--danger` (불허·모순·감찰), `--info` (통역·동행·캠페인). Each has a `-soft` fill and `-text` foreground. `--proc` is set per procedure screen.
- Type: system sans only; `--mono` for IDs, MRZ, PNR, codes, KPIs. Scale: display 28 / title 18 / section 13 / body 12.5 / compact 11.5 / label 10.5 / meta 10.
- Spacing 4/8/12/16/24/32 (`--s-1..6`). Radius 0/3/5/8. Shadows only for modal, procedure screen, callout, PA banner. Motion 120/180/220ms, disabled under reduced motion.

## Layout
`.app` grid rows: header 56 · event bar 34 · queue bar 84 · linked-case strip (auto, 0 when hidden) · main 1fr · footer 28 (shorter under 820px height). Main: 3 fr-based columns (LEFT person & interview / CENTER case workbench / RIGHT systems & decision). Panels scroll internally; the page never scrolls horizontally; 1024×768 keeps every decision control and the selected document in view.

## Components
Panel (`.panel` + `.ph` title band), subject card with portrait (the person first), interaction/language strips (explicitly labelled 판정근거 아님), statement log, category tabs + question buttons (branch questions carry an info edge; locked questions are dashed), document stack + paper surfaces (passport, visa/entry-basis sticker, e-Arrival form, PNR ticket with perforated stub, hotel confirmation, ID card, biometric record, watchlist notice, letter), requirement matrix (left edge colour by status), readiness meter (hint only), clue board, lookup terminal (dark), decision desk (outlined buttons coloured by meaning), procedure screens (per-mode accent line), modal dialog (focus-trapped), start card with progressive disclosure.

## Accessibility
Visible focus ring on all controls, skip link, `aria-pressed` on toggles, focus trap + restoration for the modal, focus move/restore for procedure screens and tutorial, `aria-live` regions for PA captions/toasts/log, user preferences (large text, high contrast, reduced motion, shortcut hints) persisted in localStorage, OS reduced-motion respected. Single-letter shortcuts ignore Ctrl/Cmd combinations.

# INAD v10 — UI constitution (anti-slop rules)

Applies on top of `CLAUDE.md` 디자인 시스템 원칙. A screen that breaks one of these is not done, whatever else it does.

## Never
1. Gradients for decoration. The only gradient is the subtitle scrim on the booth image (legibility over a photo).
2. Glow, neon, "AI purple", glassmorphism, blur panels.
3. Cards inside cards; every section in a card; floating pills; rounded-everything (radius ≤ 4 except dialogs/sheets).
4. Dashboard clutter: KPI rows, decorative charts, meters that are not a legal or operational state.
5. Emoji, icon rows, badge rows, decorative English labels in the Korean UI.
6. Generic "AI assistant" metaphors: sparkles, chat bubbles with avatars on both sides, typing dots as personality,
   "Ask me anything".
7. Motion without meaning: bouncing, pulsing idle UI, parallax, animated gradients. Motion ≤ 220 ms, always disableable.
8. Giant empty hero areas. The start screen leads with two actions, not a banner.
9. Shadows except dialogs, procedure screen, call card, PA banner.
10. Non-verdict values (tension, cooperation, language level, companions, voice, avatar mood) styled like verdicts.

## Prefer
1. Hierarchy from type size, weight and spacing; separators as hairlines.
2. Diegetic forms: the transcript is an *official interview record* (speaker column, "기록 질문" line, off-record
   marking), the passenger is behind a *booth window*, calls are *PA announcements*, results are a *case debrief*.
3. Real content density: show the actual documents and record, not summaries of them.
4. One dark surface — the booth. Everything else is the calm v9 workstation.
5. The passenger's words larger than the examiner's; the examiner's free words above the canonical question.

## Review checklist (each major screen, each viewport 1440 · 1280 · 1024 · 768 · 390 · 844×390)
hierarchy · AI-slop tells · overflow / clipping · weak typography · cardification · chrome vs person ratio ·
dead space · passenger framing (eyes in upper third, not cropped at the forehead) · Korean line breaking.
Recorded per round in `docs/v10-qa.md` §4.

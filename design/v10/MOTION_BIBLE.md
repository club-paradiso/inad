# INAD v10 — Motion bible

Source of runtime values: `src/data/motion-grammar.js` (+ the CSS keyframes in `src/styles/interview.css`).

## Principles
- People at a border counter are tired, polite, a little nervous and mostly still. Motion is *observational*.
- No synthesised smiles, nods, gestures or eye contact performance. Restraint over expressiveness.
- Motion never carries meaning for the verdict. A hesitant delivery is acting direction for one line, not a signal.

## Grammar (v10.0 values)
| Behaviour | Value | Notes |
|---|---|---|
| Blink interval | 4.2 s ± 2.2 s | ×1.5 thinking, ×1.8 hesitant, ×0.85 listening |
| Blink shape | 70 ms close · 30 ms hold · 110 ms open | 12 % double blinks |
| Breathing | 0.7 px lift, 0.35 % scale, 4.6 s | CSS, alternate |
| Sway | ±0.22°, 9 s | CSS, alternate |
| Reaction before answering | plain 420 · considered 750 · withheld 900 · hesitant 1150 · confused 520 ms | reply held, then spoken |
| Speaking | ko 6.2 / en 4.6 syllables/s, 260 ms at punctuation | jaw max 1.6 % of portrait height |
| Pose offsets | thinking: eyes lowered 32 %, −0.35° · hesitant: lowered, −0.5° · confused: +1.1° · document: lowered, 1.2 % down | 220 ms transition |

## Studies required before v10.1 (blocked in this environment — see GENERATION_LOG.md)
3–6 s Higgsfield studies per pilot character: waiting silently · listening · short answer · confused · searching memory ·
checking a document · slight hesitation · mild relief. From each: blink count/minute, head travel (deg), time to first
word, expression amplitude. Update the table above with measured medians and keep the previous values here.

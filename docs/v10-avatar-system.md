# INAD v10 — Avatar system

## 1. Options evaluated
| Option | Verdict | Reason |
|---|---|---|
| Real-time AI video per frame | rejected | GPU per player, latency, identity drift, cost; brief forbids it as a first step |
| Rigged 3D character / blendshapes | later | needs a modelled cast (105 people) and a 3D runtime (three.js would also break the no-external-library rule) |
| Live2D-like layered rig | later | needs layered art per character; good fit once Higgsfield character sheets exist |
| Pre-rendered pose clips (video) | later | best realism; ~200–600 KB per clip per character; needs approved generated assets |
| **2.5D "living still" over the existing photo** | **shipped** | zero new assets, ~2 KB runtime + 52 KB rig data for all 105 portraits, works offline/`file://`, restrained by construction |

## 2. Living still — how it works (`src/js/ui/avatar/living-portrait.js`)
- **Rig**: `scripts/extract-portrait-rigs.py` runs MediaPipe Face Mesh (pip `mediapipe==0.10.14`, bundled model) once,
  offline, over every portrait and writes normalised anchors (eye corners/lids, brows, mouth, chin, face box, a yaw cue)
  to `src/data/portrait-rigs.js`. 105/105 portraits rigged.
- **Blink / lowered eyes**: for each eye the strip of upper-lid skin between brow crease and lid is stretched down
  over the eye with a feathered elliptical mask and a soft lash line. Lowered eyes (thinking, reading, hesitating) are
  the same at 32 %.
- **Speaking**: the lower lip and chin band is shifted down by up to 1.6 % of the portrait height over a dark mouth gap,
  driven by a syllable timeline (Hangul blocks, Latin vowel groups, punctuation pauses).
- **Breathing / sway / pose**: CSS — `lp-breathe` (0.7 px lift, 0.35 % scale, 4.6 s), `lp-sway` (±0.22°, 9 s), and a
  220 ms transition to each state's pose offset. These run on the compositor.
- **Scheduling**: the script draws only when something changes (blink, jaw, lid easing) at ≤ 30 fps and otherwise
  sleeps until the next scheduled blink; stops when the booth is off-screen or the tab is hidden.
- **States**: idle · listening (typing/recording) · thinking (reaction hold) · speaking · hesitant · confused ·
  document · relieved. The state label is decorative (`aria-hidden`, CSS-generated text).

## 3. Motion grammar (`src/data/motion-grammar.js`, `design/v10/MOTION_BIBLE.md`)
Blink every 4.2 s ± 2.2 s, 12 % double blinks, 70/30/110 ms close/hold/open; more frequent while thinking or hesitant,
less while listening. Reaction before answering 420–1150 ms by delivery. No smiles, nods or gestures are synthesised.
Values were set from observational convention, not from the Higgsfield motion studies the brief asks for — those
studies are blocked (§5) and should re-tune these numbers.

## 4. Fallbacks
No rig, no canvas or image error → the plain `<img>` (`.lp-fallback`). Reduced motion (OS or 설정) → a still frame,
no CSS animation, no reply hold. The `<img id="pPortrait">` always remains the accessible element.

## 5. Visual QA and limits
Frames inspected at 2× for TRV-0005, TRV-0008, TRV-0001 (`design/v10/lab/avatar-lab.html`): blink and lowered eyes
read as natural; the first mouth gap read as lipstick red and was darkened/narrowed; jaw motion on smiling portraits is
weaker. The method cannot turn the head or move the eyes; that needs generated multi-pose material. All motion is
presentation only — tests keep demeanour out of every verdict path (`tests/unit/invariants.test.js`,
`tests/unit/fairness-property.test.js`).

## 6. Measured cost (release build, Chromium, 1440×900)
| | normal CPU | 4× throttled |
|---|---|---|
| idle passenger, 10 s, main-thread busy | 1.1 % | 3.5 % |
| answering (3 turns), main-thread busy | 10.9 % | 40 % |
| reduced motion idle | 0.7 % | 1.7 % |
Before moving breathing to CSS: 4.8 % / 20.7 % idle (`scripts/measure-performance.js`).

## 7. Next (after generated assets exist)
Per pilot character: neutral, ¾ and speaking frames from one Higgsfield identity; crossfade frames under the same rig;
motion studies to retune `MOTION`; then decide between pose clips and a layered rig from measured size/quality.

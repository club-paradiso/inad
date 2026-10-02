// INAD v10 motion grammar — presentation data only (design/v10/MOTION_BIBLE.md). Never read by an engine and never
// a verdict input: how a passenger looks while answering says nothing about whether they may enter.
// Values are deliberately restrained: ordinary people at a counter blink, breathe and pause; they do not perform.
export const MOTION = {
  fps: 30,                                   // render cap; the loop also stops when hidden or off-screen
  blink: { meanGapMs: 4200, jitterMs: 2200, closeMs: 70, holdMs: 30, openMs: 110, doubleChance: 0.12 },
  breath: { periodMs: 4600, liftPx: 0.7, scale: 0.0035 },
  sway: { periodMs: 9000, deg: 0.22, driftPx: 0.6 },
  jaw: { maxOpen: 0.016, syllablesPerSec: { ko: 6.2, en: 4.6 }, punctuationPauseMs: 260 },
  // How long the passenger takes before answering, by delivery. Bounded so the game never feels sluggish.
  reactionMs: { plain: 420, considered: 750, hesitant: 1150, confused: 520, withheld: 900 },
  // Pose offsets per state (fractions of portrait height / degrees). Small on purpose.
  pose: {
    idle: { dy: 0, tilt: 0, blinkRate: 1 },
    listening: { dy: -0.002, tilt: 0.25, blinkRate: 0.85 },
    thinking: { dy: 0.006, tilt: -0.35, blinkRate: 1.5, gazeDown: true },
    speaking: { dy: 0, tilt: 0, blinkRate: 0.8 },
    hesitant: { dy: 0.008, tilt: -0.5, blinkRate: 1.8, gazeDown: true },
    confused: { dy: -0.002, tilt: 1.1, blinkRate: 1.3 },
    relieved: { dy: -0.003, tilt: 0, blinkRate: 0.9 },
    document: { dy: 0.012, tilt: 0, blinkRate: 1.2, gazeDown: true }
  }
};

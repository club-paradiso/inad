// Portrait source resolver.
// Resolves portrait images to static relative assets under assets/portraits/${id}.webp.
// With the modular web architecture (PR #26), portraits are served as independent static WebP assets.
import { PORTRAIT_DATA } from './portrait-data.js';

export function portraitSrc(id) {
  if (PORTRAIT_DATA && PORTRAIT_DATA[id]) return PORTRAIT_DATA[id];
  return `assets/portraits/${id}.webp`;
}

// Document-photo framing. A travel document carries a standardised ID photo (tight on the face, flat print),
// while the booth shows the person as they stand there. Both come from the traveller's single portrait, so the
// document photo is the same face by construction — never a second image that could read as a forgery signal —
// but it is framed and toned differently, which makes comparing the two an act of looking.
// Pure geometry from the portrait rig (eye positions, normalised): zoom so the eyes sit a fixed distance apart,
// move the eye line to the ID position, and clamp the shift so the frame is always fully covered.
const ID_EYE_GAP = 0.33, ID_EYE_X = 0.5, ID_EYE_Y = 0.42, ZOOM_MIN = 1.25, ZOOM_MAX = 1.6;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const r3 = (v) => Math.round(v * 1000) / 1000;
export function documentPhotoFrame(rig) {
  const L = rig?.eyeL, R = rig?.eyeR;
  if (!L || !R) return { zoom: 1.3, x: 0.5, y: 0.4, tx: 0, ty: 0.02 };
  const lx = (L.x0 + L.x1) / 2, rx = (R.x0 + R.x1) / 2;
  const x = (lx + rx) / 2, y = (L.cy + R.cy) / 2, gap = Math.abs(rx - lx) || 0.23;
  const zoom = clamp(ID_EYE_GAP / gap, ZOOM_MIN, ZOOM_MAX);
  const tx = clamp(ID_EYE_X - x, -(zoom - 1) * (1 - x), (zoom - 1) * x);
  const ty = clamp(ID_EYE_Y - y, -(zoom - 1) * (1 - y), (zoom - 1) * y);
  return { zoom: r3(zoom), x: r3(x), y: r3(y), tx: r3(tx), ty: r3(ty) };
}


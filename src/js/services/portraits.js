// Portrait source resolver.
// Resolves portrait images to static relative assets under assets/portraits/${id}.webp.
// With the modular web architecture (PR #26), portraits are served as independent static WebP assets.
import { PORTRAIT_DATA } from './portrait-data.js';

export function portraitSrc(id) {
  if (PORTRAIT_DATA && PORTRAIT_DATA[id]) return PORTRAIT_DATA[id];
  return `assets/portraits/${id}.webp`;
}

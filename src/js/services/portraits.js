// Portrait source resolver.
// - dev (src served over http): relative asset path under src/assets/portraits/
// - release build: scripts/build-single-html.js replaces portrait-data.js with an inline data-URI map,
//   so dist/index.html needs no external files.
import { PORTRAIT_DATA } from './portrait-data.js';

export function portraitSrc(id) {
  if (PORTRAIT_DATA && PORTRAIT_DATA[id]) return PORTRAIT_DATA[id];
  return `assets/portraits/${id}.webp`;
}
export const portraitsInline = () => !!PORTRAIT_DATA;

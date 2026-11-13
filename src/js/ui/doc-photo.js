// Document photo: the ID-framed rendering of a traveller's portrait used wherever a photo is printed on a
// document or read from its chip (passport, residence card, the biometric pair, the forensic comparison).
// Presentation only — the image source is still the one portrait of the person named on the document
// (`case.passportPortraitId` for a forged passport), and nothing here is read by a verdict or a score.
import { esc } from './dom.js';
import { PORTRAIT_RIGS } from '../../data/portrait-rigs.js';
import { documentPhotoFrame } from '../services/portraits.js';

const pct = (v) => `${Math.round(v * 1000) / 10}%`;
export function docPhotoHTML(traveler, frameClass, alt) {
  const f = documentPhotoFrame(PORTRAIT_RIGS[traveler.id]);
  const style = `transform-origin:${pct(f.x)} ${pct(f.y)};transform:translate(${pct(f.tx)},${pct(f.ty)}) scale(${f.zoom})`;
  return `<span class="doc-photo-clip ${esc(frameClass)}"><img class="doc-photo" src="${esc(traveler.portrait)}" alt="${esc(alt)}" style="${style}"></span>`;
}

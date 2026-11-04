// International passenger presence uses the same living-portrait renderer as the Korean booth.
// The reused portraits are fictional casting artwork, not identification photographs or evidence.
// Appearance, speaking motion and captions never affect the ATLAS case engine.
import { createLivingPortrait } from './avatar/living-portrait.js';
import { PORTRAIT_RIGS } from '../../data/portrait-rigs.js';
import { portraitSrc } from '../services/portraits.js';
import { atlasText } from '../services/i18n.js';
import { byId } from './dom.js';

const CAST_START = { CA: 49, GB: 61, NZ: 73 };
const STATES = {
  idle: { ko: '', en: '' },
  speaking: { ko: '말하는 중', en: 'Speaking' },
  listening: { ko: '듣는 중', en: 'Listening' }
};
let portrait = null, host = null, caption = null, stateLabel = null;
let currentCase = '', sequence = 0, captionTimer = 0;

// One stable, unique existing fictional portrait per authored overseas case.
// Future cases fall back to a deterministic asset within the existing 105-portrait library.
export function atlasPortraitId(c) {
  const number = Number((c?.id || '').match(/-(\d+)$/)?.[1]);
  const start = CAST_START[c?.countryId];
  if (start && Number.isInteger(number) && number >= 1 && number <= 12) {
    return 'TRV-' + String(start + number - 1).padStart(4, '0');
  }
  const key = String(c?.personId || c?.id || '');
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return 'TRV-' + String(hash % 105 + 1).padStart(4, '0');
}
function ensurePortrait() {
  if (portrait) return portrait;
  host = document.createElement('div');
  host.className = 'stage-portrait portrait atlas-stage-portrait';
  const img = document.createElement('img');
  img.decoding = 'async';
  caption = document.createElement('p');
  caption.className = 'stage-caption';
  caption.setAttribute('aria-live', 'off'); // The interview transcript is the accessible live record.
  stateLabel = document.createElement('span');
  stateLabel.className = 'stage-state';
  stateLabel.setAttribute('aria-hidden', 'true');
  host.append(img, stateLabel, caption);
  portrait = createLivingPortrait(host, {
    img,
    onState: (state) => { stateLabel.dataset.label = atlasText(STATES[state] || STATES.idle); }
  });
  document.addEventListener('inad:prefs', onMotionPreference);
  return portrait;
}
function onMotionPreference() { portrait?.refreshMotionPreference(); }
function hideCaption() {
  clearTimeout(captionTimer);
  if (caption) { caption.classList.remove('on'); caption.textContent = ''; }
}
export function stopAtlasActing() {
  sequence++;
  clearTimeout(captionTimer);
  portrait?.stopSpeaking();
  portrait?.setState('idle');
}
export function disposeAtlasPortrait() {
  stopAtlasActing();
  portrait?.destroy();
  document.removeEventListener('inad:prefs', onMotionPreference);
  portrait = host = caption = stateLabel = null;
  currentCase = '';
}
export function syncAtlasPortrait(c, visible) {
  const slot = byId('atlasPortraitSlot');
  if (!slot || !visible) { stopAtlasActing(); return; }
  const stage = ensurePortrait();
  if (host.parentElement !== slot) slot.replaceChildren(host);
  if (currentCase !== c.id) {
    stopAtlasActing();
    hideCaption();
    currentCase = c.id;
  }
  const id = atlasPortraitId(c);
  stage.setSource(portraitSrc(id), PORTRAIT_RIGS[id] || null,
    c.name + ' · ' + atlasText({ ko: '합성 연출 초상화 (신원 사진 아님)', en: 'fictional casting portrait, not identity evidence' }));
}
export function actAtlasLine(line, lang = 'en') {
  if (!portrait || !line) return;
  const my = ++sequence;
  caption.textContent = String(line);
  caption.classList.add('on');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => { if (my === sequence) caption.classList.remove('on'); },
    Math.max(4200, String(line).length * 140));
  portrait.setState('speaking');
  portrait.speak(line, lang).then(() => {
    if (my === sequence && portrait) portrait.setState('idle');
  });
}

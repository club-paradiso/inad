// Interview / system log for the current case.
import { state } from '../state.js';
import { behaviorBand, behaviorLogClass } from './behavior-engine.js';
import { bus } from '../services/bus.js';

export function addLog(type, text) {
  const meta = type === 'alien' ? { behaviorClass: behaviorLogClass(), behaviorLabel: behaviorBand().label } : type === 'interpreter' ? { languageLabel: state.language?.primary || '통역' } : {};
  // v10: the interview engine may attach how a line was asked (the examiner's own words, input surface) and how it
  // was delivered (lead-in, mood) to the next officer / passenger line. Presentation data only.
  const pending = state.interview?.pending;
  if (pending && type === 'officer' && pending.officer) { Object.assign(meta, pending.officer); pending.officer = null; }
  if (pending && type === 'alien' && pending.alien) { Object.assign(meta, pending.alien); pending.alien = null; }
  state.logs.push({ type, text, ...meta });
  bus.emit('log');
}

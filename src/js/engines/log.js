// Interview / system log for the current case.
import { state } from '../state.js';
import { behaviorBand, behaviorLogClass } from './behavior-engine.js';
import { bus } from '../services/bus.js';

export function addLog(type, text) {
  const meta = type === 'alien' ? { behaviorClass: behaviorLogClass(), behaviorLabel: behaviorBand().label } : type === 'interpreter' ? { languageLabel: state.language?.primary || '통역' } : {};
  state.logs.push({ type, text, ...meta });
  bus.emit('log');
}

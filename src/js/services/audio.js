// Web Audio cue synthesis (no audio files). Every cue also has an on-screen caption via the PA
// banner / logs, so muting loses no information.
import { state } from '../state.js';
import { bus } from './bus.js';

let ac = null;
export function ensureAudio() { if (!state.audio) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
function soundCount() { state.soundCues = (state.soundCues || 0) + 1; }
function toneNode(freq, dur = .08, type = 'sine', gain = .025, when = 0, endFreq = null) { const a = ensureAudio(); if (!a) return; const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(Math.max(30, freq), t); if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.001, gain), t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .015); }
function noiseBurst(dur = .08, gain = .018, when = 0, filterFreq = 1200) { const a = ensureAudio(); if (!a) return; const sr = a.sampleRate, len = Math.max(1, Math.floor(sr * dur)), buf = a.createBuffer(1, len, sr), data = buf.getChannelData(0); for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len); const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); src.buffer = buf; f.type = 'bandpass'; f.frequency.value = filterFreq; f.Q.value = .8; const t = a.currentTime + when; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); src.connect(f).connect(g).connect(a.destination); src.start(t); }

export const cues = {
  beep({ f = 600, d = .05 } = {}) { if (!ensureAudio()) return; soundCount(); toneNode(f, d, 'sine', .022); },
  click() { if (!ensureAudio()) return; soundCount(); toneNode(620, .035, 'sine', .012); toneNode(880, .025, 'sine', .007, .018); },
  toggle(on = true) { if (!ensureAudio()) return; soundCount(); toneNode(on ? 520 : 410, .055, 'sine', .018); toneNode(on ? 760 : 310, .065, 'sine', .014, .06); },
  documentScan() { if (!ensureAudio()) return; soundCount(); noiseBurst(.045, .012, 0, 1800); toneNode(900, .06, 'sine', .012, .015, 1800); },
  paperOpen() { if (!ensureAudio()) return; soundCount(); noiseBurst(.075, .013, 0, 900); toneNode(420, .04, 'triangle', .006, .015); },
  scanner() { if (!ensureAudio()) return; soundCount(); toneNode(740, .05, 'sine', .014, 0, 1540); toneNode(1540, .045, 'sine', .01, .06, 980); },
  lookup(status) { if (!ensureAudio()) return; soundCount(); cues.scanner(); if (status === '정상') { toneNode(660, .055, 'sine', .012, .11); toneNode(880, .075, 'sine', .014, .17); } else if (status === '주의') { toneNode(520, .06, 'triangle', .015, .11); toneNode(390, .08, 'triangle', .014, .18); } else { toneNode(310, .075, 'square', .012, .1); toneNode(220, .11, 'square', .014, .19); } },
  call() { if (!ensureAudio()) return; soundCount(); toneNode(659, .18, 'sine', .024); toneNode(988, .22, 'sine', .021, .2); toneNode(784, .26, 'sine', .018, .43); },
  pa() { if (!ensureAudio()) return; soundCount(); [523, 659, 784, 1046].forEach((f, i) => toneNode(f, .18, 'sine', .017, i * .12)); },
  secondary() { if (!ensureAudio()) return; soundCount(); toneNode(740, .12, 'triangle', .018); toneNode(554, .15, 'triangle', .018, .11); toneNode(440, .19, 'triangle', .015, .25); },
  interpreter() { if (!ensureAudio()) return; soundCount(); toneNode(587, .08, 'sine', .016); toneNode(784, .1, 'sine', .016, .09); toneNode(988, .11, 'sine', .014, .19); },
  clear() { if (!ensureAudio()) return; soundCount(); [523, 659, 784].forEach((f, i) => toneNode(f, .14, 'triangle', .022, i * .11)); noiseBurst(.055, .01, .03, 700); },
  refuse() { if (!ensureAudio()) return; soundCount(); [294, 247, 196].forEach((f, i) => toneNode(f, .18, 'triangle', .021, i * .13)); noiseBurst(.07, .012, .02, 420); },
  buzzer() { if (!ensureAudio()) return; soundCount(); toneNode(142, .2, 'sawtooth', .026); toneNode(116, .2, 'square', .012, .03); noiseBurst(.08, .01, 0, 300); },
  alert() { cues.buzzer(); setTimeout(() => cues.buzzer(), 175); },
  fieldEvent(e) { if (!ensureAudio()) return; if (e?.tone === 'relief') { soundCount(); toneNode(440, .08, 'sine', .012); toneNode(660, .1, 'sine', .014, .09); toneNode(880, .12, 'sine', .012, .19); } else if (e?.tone === 'bad') { cues.alert(); } else { soundCount(); toneNode(392, .08, 'triangle', .015); toneNode(330, .11, 'triangle', .014, .1); } },
  procedure(mode) { if (mode === 'secondary') return cues.secondary(); if (mode === 'sjp') { if (!ensureAudio()) return; soundCount(); toneNode(330, .09, 'triangle', .012); toneNode(220, .12, 'triangle', .013, .1); return; } if (mode === 'refugee') { if (!ensureAudio()) return; soundCount(); toneNode(523, .08, 'sine', .011); toneNode(587, .11, 'sine', .011, .1); return; } if (mode === 'repatriation') return cues.refuse(); }
};

export function initAudio() {
  bus.on('sound', ({ cue, arg }) => { const fn = cues[cue]; if (fn) fn(arg); });
  document.addEventListener('pointerdown', () => { if (state.audio) ensureAudio(); }, { once: true });
  document.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !b.matches('#audioBtn') && state.audio) cues.click(); });
}

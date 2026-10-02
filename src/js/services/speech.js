// Speech services (v10, progressive enhancement). Push-to-talk recognition and optional spoken replies.
// · Recognition uses the browser's Web Speech API. With preference 'local' only on-device recognition is used
//   (Chrome's `processLocally`); 'browser' is the explicit opt-in that lets the browser use its own service, which
//   may send audio to the browser vendor. INAD itself never records, stores or uploads audio.
// · The recognised text always lands in the question box for review; nothing is sent on the examiner's behalf.
// · Spoken replies use speechSynthesis and prefer voices that run on the device (`localService`).
// Every function fails soft: no API, a denied microphone or an error leaves text and buttons fully usable.

const Recognition = () => (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export function sttSupport(mode = 'local') {
  const R = Recognition(); if (!R) return { available: false, reason: 'unsupported' };
  if (typeof window !== 'undefined' && window.isSecureContext === false) return { available: false, reason: 'insecure' };
  const localCapable = 'processLocally' in (R.prototype || {}) || typeof R.available === 'function';
  if (mode === 'local' && !localCapable) return { available: false, reason: 'no-on-device' };
  return { available: true, local: mode === 'local' };
}

// On-device language pack status for Chrome's API; resolves 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unknown'.
export async function onDeviceStatus(lang) {
  const R = Recognition(); if (!R || typeof R.available !== 'function') return 'unknown';
  try { return await R.available({ langs: [lang], processLocally: true }); } catch (e) { return 'unknown'; }
}
export async function installOnDevice(lang) {
  const R = Recognition(); if (!R || typeof R.install !== 'function') return false;
  try { return !!(await R.install({ langs: [lang], processLocally: true })); } catch (e) { return false; }
}

// Push-to-talk session. Callbacks: onInterim(text), onFinal(text), onError(code), onEnd().
export function createRecognizer({ lang = 'ko-KR', mode = 'local', onInterim, onFinal, onError, onEnd } = {}) {
  const R = Recognition(); if (!R) return null;
  let rec; try { rec = new R(); } catch (e) { return null; }
  rec.lang = lang; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
  if (mode === 'local' && 'processLocally' in rec) { try { rec.processLocally = true; } catch (e) { /* older engine */ } }
  let finalText = '', active = false;
  rec.onresult = (ev) => {
    let interim = ''; finalText = '';
    for (let i = 0; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; }
    if (interim) onInterim?.((finalText + ' ' + interim).trim());
    if (finalText) onFinal?.(finalText.trim());
  };
  rec.onerror = (ev) => { onError?.(ev?.error || 'error'); };
  rec.onend = () => { active = false; onEnd?.(); };
  return {
    start() { if (active) return true; try { rec.start(); active = true; return true; } catch (e) { onError?.('start-failed'); return false; } },
    stop() { try { rec.stop(); } catch (e) { /* already stopped */ } },
    abort() { try { rec.abort(); } catch (e) { /* already stopped */ } },
    get active() { return active; }
  };
}

// ---- spoken replies ----------------------------------------------------------------------------------------
export function ttsSupport() { return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'; }
function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices() || []; const base = lang.slice(0, 2);
  const same = voices.filter((v) => (v.lang || '').toLowerCase().startsWith(base));
  return same.find((v) => v.localService) || same[0] || null;
}
export function speakLine(text, { lang = 'ko-KR', rate = 1, pitch = 1, onEnd } = {}) {
  if (!ttsSupport() || !text) { onEnd?.(); return () => {}; }
  try {
    const synth = window.speechSynthesis; synth.cancel();
    const u = new window.SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate; u.pitch = pitch;
    const v = pickVoice(lang); if (v) u.voice = v;
    u.onend = () => onEnd?.(); u.onerror = () => onEnd?.();
    synth.speak(u);
    return () => { try { synth.cancel(); } catch (e) { /* nothing to stop */ } };
  } catch (e) { onEnd?.(); return () => {}; }
}
export function stopSpeaking() { try { if (ttsSupport()) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }

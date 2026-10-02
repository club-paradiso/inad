// Passenger stage (v10): the living portrait in the booth, its subtitle and its acting. Presentation only —
// the stage reacts to engine results (bus 'interview') and to the examiner typing or speaking; it never reads
// a verdict input and nothing it shows is evidence.
import { byId, esc } from './dom.js';
import { createLivingPortrait } from './avatar/living-portrait.js';
import { PORTRAIT_RIGS } from '../../data/portrait-rigs.js';
import { MOTION } from '../../data/motion-grammar.js';

let lp = null, idleTimer = 0, captionTimer = 0, currentId = null, actSeq = 0;
const STATE_TEXT = { listening: '듣는 중', thinking: '생각하는 중', speaking: '말하는 중', hesitant: '머뭇거리는 중', confused: '되묻는 중', document: '서류를 보는 중', relieved: '', idle: '' };

export function ensureStage() {
  if (lp) return lp;
  const host = byId('stagePortrait'), img = byId('pPortrait'); if (!host || !img) return null;
  lp = createLivingPortrait(host, { img, onState: (s) => { const el = byId('stageState'); if (el) el.dataset.label = STATE_TEXT[s] || ''; } });
  document.addEventListener('inad:prefs', () => lp?.refreshMotionPreference());
  return lp;
}
export function syncStage(t) {
  const s = ensureStage(); if (!s || !t) return;
  if (currentId !== t.id) { currentId = t.id; clearCaption(); s.setState('idle'); }
  s.setSource(t.portrait, PORTRAIT_RIGS[t.id] || null, `${t.name.korean} 가상 여행객 초상`);
}
export function setStageState(name, holdMs = 0) {
  const s = ensureStage(); if (!s) return; clearTimeout(idleTimer); s.setState(name);
  if (holdMs) idleTimer = setTimeout(() => s.setState('idle'), holdMs);
}
export function reactionDelay(mood) { return MOTION.reactionMs[mood] ?? MOTION.reactionMs.plain; }
function clearCaption() { const c = byId('stageCaption'); if (c) { c.classList.remove('on'); c.innerHTML = ''; } clearTimeout(captionTimer); }
export function showCaption(text, lead = '') {
  const c = byId('stageCaption'); if (!c) return; clearTimeout(captionTimer);
  c.innerHTML = `${lead ? `<span class="lead">${esc(lead)}</span> ` : ''}${esc(text)}`; c.classList.add('on');
  captionTimer = setTimeout(() => c.classList.remove('on'), Math.max(4200, String(text).length * 140));
}
// Act a line: speaking (or hesitant) with jaw motion for its length, then back to idle.
export async function actLine(text, { mood = 'plain', lead = '', lang = 'ko' } = {}) {
  const s = ensureStage(); showCaption(text, lead); if (!s) return; const my = ++actSeq;
  clearTimeout(idleTimer); s.setState(mood === 'hesitant' || mood === 'withheld' ? 'hesitant' : mood === 'confused' ? 'confused' : mood === 'document' ? 'document' : mood === 'relieved' ? 'relieved' : 'speaking');
  await s.speak((lead ? lead + ' ' : '') + text, lang);
  if (my !== actSeq) return; // a newer line or turn took over the stage
  idleTimer = setTimeout(() => s.setState('idle'), 600);
}
export function stopActing() { actSeq++; lp?.stopSpeaking(); }
// new case or retry of the same passenger: no leftover subtitle, timers or acting
export function resetStage() { actSeq++; clearTimeout(idleTimer); clearCaption(); lp?.stopSpeaking(); lp?.setState('idle'); }
export function refreshStageMotion() { lp?.refreshMotionPreference(); }

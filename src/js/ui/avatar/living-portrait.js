// Living portrait: a 2.5D runtime for the existing still portraits (design/v10/MOTION_BIBLE.md).
// It draws the photo on a canvas and animates only what an ordinary person at a counter does: breathing,
// a slow sway, blinks (the upper-lid skin above each eye is stretched down over the eye), lowered eyes
// while thinking or reading, and a restrained jaw movement while speaking (lower lip + chin shifted down
// over a dark mouth gap). Anchors come from src/data/portrait-rigs.js (generated offline).
//
// Presentation only: nothing here reads or writes game state, and no pose is ever evidence.
// Fallbacks: no rig or no canvas → the plain <img> with a CSS breathing class; reduced motion → a still frame.
import { MOTION } from '../../../data/motion-grammar.js';

const STATES = new Set(Object.keys(MOTION.pose));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (a, b, k) => a + (b - a) * k;

// Syllable timeline for a line of dialogue: Hangul blocks count one each; Latin words by vowel groups.
export function syllableTimeline(text, lang = 'ko') {
  const out = []; const rate = MOTION.jaw.syllablesPerSec[lang === 'en' ? 'en' : 'ko']; const step = 1000 / rate;
  let t = 0, seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (const token of String(text || '').split(/(\s+|[.,!?…·:;"“”'‘’()]+)/)) {
    if (!token) continue;
    if (/^[.,!?…:;]+$/.test(token)) { t += MOTION.jaw.punctuationPauseMs; continue; }
    if (/^\s+$/.test(token) || /^["“”'‘’()·]+$/.test(token)) { t += step * 0.35; continue; }
    const hangul = (token.match(/[가-힣]/g) || []).length;
    const latin = (token.toLowerCase().match(/[aeiouy]+/g) || []).length;
    const digits = (token.match(/\d/g) || []).length;
    const n = Math.max(1, hangul + latin + digits);
    for (let i = 0; i < n; i++) { out.push({ at: t, dur: step * (0.8 + rnd() * 0.35), amp: 0.45 + rnd() * 0.55 }); t += step; }
  }
  return { beats: out, duration: Math.round(t + 120) };
}

function reducedMotion() {
  try { return document.body.classList.contains('pref-reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

// `img` (optional) is an existing <img> inside `host` that stays the accessible, fallback image.
export function createLivingPortrait(host, { onState, img: existing = null } = {}) {
  host.classList.add('lp');
  const img = existing || document.createElement('img'); img.classList.add('lp-still'); if (!existing) { img.alt = ''; img.decoding = 'async'; }
  const canvas = document.createElement('canvas'); canvas.className = 'lp-canvas'; canvas.setAttribute('aria-hidden', 'true');
  if (existing) host.insertBefore(canvas, host.firstChild); else host.replaceChildren(canvas, img);
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  const work = document.createElement('canvas'); const wctx = work.getContext ? work.getContext('2d') : null;

  let rig = null, W = 0, H = 0, ready = false, raf = 0, last = 0, visible = true, destroyed = false;
  let state = 'idle', pose = { dy: 0, tilt: 0 }, target = MOTION.pose.idle;
  let blink = { next: 0, phase: 0, start: 0, double: false }, blinkAmt = 0, lidRest = 0;
  let speech = null, jaw = 0, drawnKey = '';
  const t0 = performance.now();

  function scheduleBlink(now) { const g = MOTION.blink; const rate = target.blinkRate || 1; blink.next = now + (g.meanGapMs + (Math.random() * 2 - 1) * g.jitterMs) / rate; blink.phase = 0; }
  function blinkValue(now) {
    const g = MOTION.blink; if (!blink.phase) { if (now >= blink.next) { blink.phase = 1; blink.start = now; blink.double = Math.random() < g.doubleChance; } else return 0; }
    const e = now - blink.start, total = g.closeMs + g.holdMs + g.openMs;
    if (e < g.closeMs) return e / g.closeMs;
    if (e < g.closeMs + g.holdMs) return 1;
    if (e < total) return 1 - (e - g.closeMs - g.holdMs) / g.openMs;
    if (blink.double) { blink.double = false; blink.start = now + 90; return 0; }
    scheduleBlink(now); return 0;
  }
  function jawValue(now) {
    if (!speech) return 0; const e = now - speech.start;
    if (e > speech.duration) { const done = speech.done; speech = null; done?.(); return 0; }
    let v = 0; for (const b of speech.beats) { if (e < b.at) break; const p = (e - b.at) / b.dur; if (p < 1) v = Math.max(v, b.amp * (p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6)); }
    return v;
  }

  // ---- drawing ------------------------------------------------------------------------------------
  function featherMask(c, cx, cy, rx, ry) {
    c.save(); c.globalCompositeOperation = 'destination-in'; c.translate(cx, cy); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, rx * 0.55, 0, 0, rx); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill(); c.restore();
  }
  function drawEye(e, brow, amt) {
    if (amt <= 0.01) return;
    const x0 = e.x0 * W, x1 = e.x1 * W, top = e.top * H, bottom = e.bottom * H, ew = x1 - x0, eh = Math.max(3, bottom - top);
    const pad = ew * 0.28, rx0 = Math.floor(x0 - pad), rw = Math.ceil(ew + pad * 2);
    const browY = brow ? brow.y * H : top - eh * 2.2;
    const crease = Math.max(browY + (top - browY) * 0.35, top - eh * 1.5);
    const lidEdge = top + amt * (eh * 1.08);
    const band = Math.max(2, top - crease), destH = lidEdge - crease;
    const ry0 = Math.floor(crease - 2), rh = Math.ceil(destH + 6);
    work.width = rw; work.height = rh; wctx.clearRect(0, 0, rw, rh);
    wctx.drawImage(img, rx0, crease, rw, band, 0, crease - ry0, rw, destH);
    featherMask(wctx, rw / 2, (crease - ry0) + destH * 0.55, rw / 2, destH * 0.75 + 2);
    ctx.drawImage(work, rx0, ry0);
    ctx.save(); ctx.strokeStyle = `rgba(28,18,14,${(0.35 + 0.3 * amt).toFixed(3)})`; ctx.lineWidth = 1 + amt * 0.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0 + ew * 0.04, ease(top, e.cy * H, amt)); ctx.quadraticCurveTo((x0 + x1) / 2, lidEdge + amt * 1.2, x1 - ew * 0.04, ease(top, e.cy * H, amt)); ctx.stroke(); ctx.restore();
  }
  function drawJaw(open) {
    if (open <= 0.01) return;
    const m = rig.mouth, x0 = m.x0 * W, x1 = m.x1 * W, y = m.y * H, chinY = rig.chin.y * H, mw = x1 - x0, mx = (x0 + x1) / 2;
    const px = open * MOTION.jaw.maxOpen * H; const pad = mw * 0.42;
    const rx0 = Math.floor(x0 - pad), rw = Math.ceil(mw + pad * 2), srcBottom = chinY + (chinY - y) * 0.18, srcH = srcBottom - y;
    ctx.save(); ctx.fillStyle = 'rgba(26,15,13,0.82)'; ctx.beginPath(); ctx.ellipse(mx, y + px * 0.5, mw * 0.27, Math.max(0.5, px * 0.42), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    work.width = rw; work.height = Math.ceil(srcH + px + 4); wctx.clearRect(0, 0, work.width, work.height);
    wctx.drawImage(img, rx0, y, rw, srcH, 0, px, rw, srcH + px * 0.15);
    featherMask(wctx, rw / 2, px + srcH * 0.42, rw / 2, srcH * 0.62);
    ctx.drawImage(work, rx0, Math.floor(y));
  }
  function draw(now) {
    const b = Math.max(blinkAmt, lidRest), key = `${b.toFixed(2)}|${jaw.toFixed(2)}`;
    if (key !== drawnKey) {
      drawnKey = key; ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H);
      drawJaw(jaw); drawEye(rig.eyeL, rig.browL, b); drawEye(rig.eyeR, rig.browR, b);
    }
    const tt = now - t0, br = MOTION.breath, sw = MOTION.sway;
    const breath = Math.sin(tt / br.periodMs * Math.PI * 2), sway = Math.sin(tt / sw.periodMs * Math.PI * 2);
    pose.dy = ease(pose.dy, target.dy || 0, 0.08); pose.tilt = ease(pose.tilt, target.tilt || 0, 0.08);
    const lift = -breath * br.liftPx + pose.dy * host.clientHeight, sc = 1 + (breath + 1) / 2 * br.scale;
    canvas.style.transform = `translate3d(${(sway * sw.driftPx).toFixed(2)}px, ${lift.toFixed(2)}px, 0) rotate(${(pose.tilt + sway * sw.deg).toFixed(3)}deg) scale(${sc.toFixed(4)})`;
  }
  function frame(now) {
    raf = 0; if (destroyed || !ready) return;
    if (now - last >= 1000 / MOTION.fps - 1) {
      last = now; blinkAmt = blinkValue(now); jaw = jawValue(now);
      lidRest = ease(lidRest, target.gazeDown ? 0.32 : 0, 0.12); draw(now);
    }
    if (visible && !document.hidden && !reducedMotion()) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && ready && visible && !document.hidden && !destroyed && !reducedMotion()) raf = requestAnimationFrame(frame); }
  function still() {
    if (!ready) return; drawnKey = ''; blinkAmt = 0; jaw = 0; lidRest = target.gazeDown ? 0.32 : 0; canvas.style.transform = '';
    ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H); if (lidRest) { drawEye(rig.eyeL, rig.browL, lidRest); drawEye(rig.eyeR, rig.browR, lidRest); }
  }

  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); if (visible) kick(); }) : null;
  io?.observe(host);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);

  const api = {
    setSource(src, nextRig, alt = '') {
      if (alt) img.alt = alt;
      if (src && img.getAttribute('src') === src && rig === (nextRig || null) && (ready || host.classList.contains('lp-fallback'))) return;
      ready = false; rig = nextRig || null; speech?.done?.(); speech = null;
      const usable = !!(rig && ctx && wctx);
      host.classList.toggle('lp-live', usable); host.classList.toggle('lp-fallback', !usable);
      img.onload = () => {
        if (!usable || destroyed) return;
        W = canvas.width = img.naturalWidth || rig.w; H = canvas.height = img.naturalHeight || rig.h;
        ready = true; drawnKey = ''; scheduleBlink(performance.now());
        if (reducedMotion()) still(); else { draw(performance.now()); kick(); }
      };
      img.onerror = () => { host.classList.remove('lp-live'); host.classList.add('lp-fallback'); };
      if (src && img.getAttribute('src') === src && img.complete && img.naturalWidth) img.onload(); else img.src = src || '';
    },
    setState(name) {
      if (!STATES.has(name) || name === state) return; state = name; target = MOTION.pose[name];
      host.dataset.state = name; onState?.(name); if (reducedMotion()) still(); else kick();
    },
    get state() { return state; },
    // Animate the jaw for a line of dialogue; resolves when the line has been "said".
    speak(text, lang = 'ko') {
      return new Promise((resolve) => {
        const tl = syllableTimeline(text, lang);
        if (!ready || reducedMotion()) { setTimeout(resolve, Math.min(tl.duration, 1200)); return; }
        speech?.done?.(); speech = { ...tl, start: performance.now(), done: resolve }; kick();
      });
    },
    stopSpeaking() { const d = speech?.done; speech = null; d?.(); },
    // Visual QA only (design/v10/lab): draw one fixed frame without the loop.
    renderFrame({ blink: b = 0, jaw: j = 0, lid = 0 } = {}) {
      if (!ready) return false; if (raf) cancelAnimationFrame(raf); raf = 0; destroyed = true; canvas.style.transform = '';
      ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H); drawJaw(j); const v = Math.max(b, lid); drawEye(rig.eyeL, rig.browL, v); drawEye(rig.eyeR, rig.browR, v); return true;
    },
    refreshMotionPreference() { if (reducedMotion()) { if (raf) cancelAnimationFrame(raf); raf = 0; still(); } else kick(); },
    destroy() { destroyed = true; if (raf) cancelAnimationFrame(raf); io?.disconnect(); document.removeEventListener('visibilitychange', onVis); }
  };
  return api;
}

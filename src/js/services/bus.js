// Tiny synchronous event bus. Engines emit; the UI layer subscribes.
// Engines must never touch the DOM — they describe what happened and the UI decides how to show it.
//
// IMPORTANT: UI-only enhancements are deliberately loaded *after* the core application has booted.
// Keeping them as static imports here meant a failure (or an expensive observer) in i18n,
// the border-console shell, or the work manual could prevent the whole simulator from reaching
// its start screen. They do not affect engine state or legal outcomes, so they must never be
// allowed to become a boot dependency.

const listeners = new Map();

export const bus = {
  on(type, fn) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(fn);
    return () => listeners.get(type)?.delete(fn);
  },
  emit(type, payload) {
    const set = listeners.get(type);
    if (!set) return;
    for (const fn of [...set]) fn(payload);
  },
  clear() { listeners.clear(); }
};

// Semantic helpers so call sites read like the v6.1 originals.
export const notify = {
  log: (type, text) => bus.emit('log', { type, text }),
  toast: (text) => bus.emit('toast', text),
  announce: (title, text, tag = 'PA', duration = 2100) => bus.emit('announce', { title, text, tag, duration }),
  sound: (cue, arg) => bus.emit('sound', { cue, arg }),
  pulse: (target, cls, dur) => bus.emit('pulse', { target, cls, dur }),
  a11y: (text) => bus.emit('a11y', text)
};

async function loadUiEnhancements() {
  const modules = [
    ['./i18n.js', 'i18n'],
    ['./border-console.js', 'border-console'],
    ['./work-manual.js', 'work-manual']
  ];

  // Load sequentially so i18n is ready before the two dynamic UI surfaces render.
  // A rejected enhancement is intentionally non-fatal: the simulator stays usable.
  for (const [path, label] of modules) {
    try {
      await import(path);
    } catch (error) {
      console.warn(`[INAD] Optional UI enhancement disabled: ${label}`, error);
    }
  }
}

function deferUiEnhancements() {
  const run = () => setTimeout(() => { void loadUiEnhancements(); }, 0);
  if (document.readyState === 'loading') {
    // app.js also boots on DOMContentLoaded. The timer ensures its synchronous boot listener
    // finishes first even though this module registered its listener earlier.
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    // Module scripts are normally evaluated after parsing. app.js finishes its synchronous boot
    // before this timer is serviced.
    run();
  }
}

deferUiEnhancements();

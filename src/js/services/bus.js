// Tiny synchronous event bus. Engines emit; the UI layer subscribes.
// Engines must never touch the DOM — they describe what happened and the UI decides how to show it.
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

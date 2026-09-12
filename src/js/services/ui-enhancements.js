// Optional UI-only enhancements (i18n, work manual).
//
// IMPORTANT: these are deliberately loaded *after* the core application has booted. Keeping them
// as static imports meant a failure (or an expensive observer) in any of them could prevent the
// whole simulator from reaching its start screen. They do not affect engine state or legal
// outcomes, so they must never become a boot dependency.
//
// Each specifier below is a string literal on purpose: the release build (esbuild IIFE bundle)
// can only inline a dynamic import it can resolve statically. A computed `import(path)` would be
// left as a runtime request for `./i18n.js` etc., which does not exist next to the single-file
// release page — silently disabling every enhancement in production.

const loaders = [
  ['i18n', () => import('./i18n.js')],
  ['work-manual', () => import('./work-manual.js')]
];

export async function loadUiEnhancements() {
  // Load sequentially so i18n is ready before the work manual renders its first dialog.
  // A rejected enhancement is intentionally non-fatal: the simulator stays usable.
  const loaded = [];
  for (const [label, load] of loaders) {
    try {
      await load();
      loaded.push(label);
    } catch (error) {
      console.warn(`[INAD] Optional UI enhancement disabled: ${label}`, error);
    }
  }
  return loaded;
}

// Call once from the application entry after its synchronous boot has finished. The timer keeps
// enhancement evaluation out of the boot call stack so the start screen is painted first.
export function scheduleUiEnhancements() {
  if (typeof document === 'undefined') return;
  setTimeout(() => { void loadUiEnhancements(); }, 0);
}

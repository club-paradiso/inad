// Minimal browser shims for engine tests running under node:test.
class MemoryStorage { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } clear() { this.m.clear(); } get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; } }
if (typeof globalThis.localStorage === 'undefined') globalThis.localStorage = new MemoryStorage();
export const resetStorage = () => globalThis.localStorage.clear();
// v11: international case libraries load on demand in the browser; engine tests load all three.
const { loadAtlasLibraries } = await import('../../src/js/engines/atlas-library.js');
await loadAtlasLibraries();

// Deterministic seeding utilities (FNV-1a hash + mulberry32-style PRNG). Identical to v6.1
// so that a given session seed reproduces the same queue, parties, events and language profiles.
export function hashSeed(v) { let h = 2166136261 >>> 0; for (const ch of String(v)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function makeRng(seed) { let x = (seed >>> 0) || 0x6d2b79f5; return () => { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffled(arr, rng) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
export function newSessionSeed() { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return 100000 + (a[0] % 900000); } catch (e) { return 100000 + (Date.now() % 900000); } }
// 32-bit FNV-1a as 8 hex chars (save-bundle checksum, v6.1 compatible)
export function fnv1a(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return ('00000000' + (h >>> 0).toString(16)).slice(-8); }
export function localDateKey(d = new Date()) { try { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d), o = Object.fromEntries(parts.map((x) => [x.type, x.value])); return `${o.year}-${o.month}-${o.day}`; } catch (e) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; } }
export function displayDateKo(key = localDateKey()) { const [y, m, d] = key.split('-'); return `${y}.${m}.${d}`; }
export function dateDayNumber(key) { const [y, m, d] = key.split('-').map(Number); return Math.floor(new Date(y, m - 1, d).getTime() / 86400000); }
export function addDaysKey(key, n) { const [y, m, d] = key.split('-').map(Number), x = new Date(Date.UTC(y, m - 1, d + n)); return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`; }

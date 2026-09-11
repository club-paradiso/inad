// localStorage access that never throws (private mode, quota, disabled storage).
export function storeGet(k, fallback) { try { return localStorage.getItem(k) || fallback; } catch (e) { return fallback; } }
export function storeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
export function storeRemove(k) { try { localStorage.removeItem(k); return true; } catch (e) { return false; } }
export function storeGetRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
export function jsonGet(k, fallback) { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
export function jsonSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
export function storageWritable() { const k = '__inad_diag__'; try { localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } }
export function parseJSON(raw) { try { return raw == null ? null : JSON.parse(raw); } catch (e) { return null; } }

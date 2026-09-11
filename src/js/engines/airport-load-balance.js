// Pure gameplay math for converting official flight-volume snapshots into bounded operational
// pressure. No state, DOM or network dependencies so the balance rules can be unit-tested alone.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function calculateLiveLoadFactor(snapshot, targetArrivals) {
  const target = Math.max(1, Number(targetArrivals) || 1);
  const arrivals = Math.max(0, Number(snapshot?.arrivals) || 0);
  const delayed = Math.max(0, Number(snapshot?.delayed) || 0);
  const ratio = arrivals / target;
  const delayRatio = arrivals ? Math.min(1, delayed / arrivals) : 0;
  return clamp(.82 + ratio * .18 + delayRatio * .05, .80, 1.28);
}

export function capLiveLoadFactor(raw, difficulty = 'standard') {
  const value = Number.isFinite(Number(raw)) ? Number(raw) : 1;
  const range = difficulty === 'training' ? [.94, 1.06] : difficulty === 'realistic' ? [.82, 1.24] : [.88, 1.15];
  return clamp(value, range[0], range[1]);
}

export function classifyLiveLoad(factor = 1) {
  const value = Number(factor) || 1;
  if (value < .92) return 'quiet';
  if (value <= 1.08) return 'normal';
  if (value <= 1.18) return 'busy';
  return 'surge';
}

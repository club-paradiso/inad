// Which amendments listed after the legal baseline (RELEASE.scheduled) are already in force on a Korea date.
// Metadata for the system centre and diagnostics only: no verdict depends on it, and legal-engine stays on the
// documented baseline until a reviewed update (docs/legal-baseline.md).
import { RELEASE } from '../../data/legal-baseline.js';
import { localDateKey } from './rng.js';

export function amendmentStatus(today = localDateKey()) {
  return RELEASE.scheduled.map((s) => ({ ...s, inForce: today >= s.effective }));
}

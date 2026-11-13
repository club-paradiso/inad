// Start-screen flow: which rung of the ladder (첫 심사 → 짧은 근무 → 정규 근무) the player is on, read only from
// what they have already finished. It decides emphasis on the start screen — one step is "next", the others are
// "done" or "later" — and nothing else: every mode stays startable at any time, and no rule, score or roster
// reads this. Pure (no DOM, no storage): the caller passes the saved facts in.
export const FLOW_STEPS = ['first', 'quick', 'shift'];
export function startFlow({ firstCaseDone = false, sessions = [], completedShifts = 0, hasCheckpoint = false } = {}) {
  const list = Array.isArray(sessions) ? sessions : [];
  const quickDone = list.some((s) => s && s.mode === 'quick');
  const shiftDone = completedShifts > 0 || list.some((s) => s && s.mode !== 'quick');
  const done = { first: !!firstCaseDone || quickDone || shiftDone, quick: quickDone || shiftDone, shift: shiftDone };
  // an unfinished regular duty is the thing to return to, whatever else is still open
  const next = hasCheckpoint ? 'shift' : FLOW_STEPS.find((id) => !done[id]) || 'shift';
  const steps = FLOW_STEPS.map((id) => ({ id, state: id === next ? 'next' : done[id] ? 'done' : 'later' }));
  return { steps, next, resume: !!hasCheckpoint, newcomer: !done.first && !hasCheckpoint };
}

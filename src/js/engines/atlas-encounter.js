// Country-independent encounter lifecycle. Outcomes remain country-pack simulation rules.
export function validEncounter(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    value.version === 1 && ['called', 'completed'].includes(value.phase) &&
    Object.keys(value).length === 2;
}
export function callEncounter(existing) {
  return existing == null ? { version: 1, phase: 'called' } : null;
}
export function finishEncounter(existing) {
  return validEncounter(existing) && existing.phase === 'called'
    ? { version: 1, phase: 'completed' } : null;
}

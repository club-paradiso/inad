// International case libraries. Each country's cases load on demand as a separate
// chunk so the Korean game's initial transfer does not carry overseas content.
import { validateScenarioDefinition, normalizeScenario } from './atlas-scenario-schema.js';

const LOADERS = {
  CA: () => import('../../data/atlas/ca.js'),
  GB: () => import('../../data/atlas/gb.js'),
  NZ: () => import('../../data/atlas/nz.js')
};
export const LIBRARY_COUNTRIES = Object.keys(LOADERS);
// Live list of every registered scenario (kept for existing imports of ATLAS_SCENARIOS).
export const ATLAS_SCENARIOS = [];
const libraries = new Map();
const pending = new Map();
export const libraryErrors = [];

export function registerAtlasLibrary(countryId, defs) {
  if (!Object.hasOwn(LOADERS, countryId) || libraries.has(countryId)) return libraries.get(countryId) || [];
  const seen = new Set(ATLAS_SCENARIOS.map((c) => c.id));
  const cases = [];
  for (const def of defs) {
    const errors = def?.countryId === countryId ? validateScenarioDefinition(def) : [`${def?.id}: wrong country`];
    if (seen.has(def?.id)) errors.push(`${def.id}: duplicate case id`);
    // An invalid case is never offered as playable; saves that reference it stay protected.
    if (errors.length) { libraryErrors.push(...errors); continue; }
    seen.add(def.id); cases.push(normalizeScenario(def));
  }
  // Queue order is the authored case number; difficulty is shown and filterable per case.
  cases.sort((a, b) => a.id.localeCompare(b.id));
  libraries.set(countryId, Object.freeze(cases));
  ATLAS_SCENARIOS.push(...cases);
  return libraries.get(countryId);
}
export function atlasLibraryReady(countryId) { return libraries.has(countryId); }
export function loadAtlasLibrary(countryId) {
  if (!Object.hasOwn(LOADERS, countryId)) return Promise.resolve([]);
  if (libraries.has(countryId)) return Promise.resolve(libraries.get(countryId));
  if (!pending.has(countryId)) pending.set(countryId, LOADERS[countryId]().then((m) => registerAtlasLibrary(countryId, m.CASES)).finally(() => pending.delete(countryId)));
  return pending.get(countryId);
}
export function loadAtlasLibraries(ids = LIBRARY_COUNTRIES) { return Promise.all(ids.filter((id) => Object.hasOwn(LOADERS, id)).map(loadAtlasLibrary)); }
export function atlasScenarios(countryId) { return libraries.get(countryId) || []; }
export function atlasScenario(countryId, id) { return atlasScenarios(countryId).find((c) => c.id === id) || null; }

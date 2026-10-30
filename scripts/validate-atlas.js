// Validates every authored international scenario and prints a per-country inventory.
// Usage: node scripts/validate-atlas.js [CA|GB|NZ]
import { validateScenarioDefinition, solveScenario } from '../src/js/engines/atlas-scenario-schema.js';
const only = process.argv[2];
let failed = 0;
for (const cc of ['CA', 'GB', 'NZ'].filter((c) => !only || c === only)) {
  const { CASES } = await import(`../src/data/atlas/${cc.toLowerCase()}.js`);
  const ids = new Set();
  const tally = {};
  for (const def of CASES) {
    const errors = validateScenarioDefinition(def);
    if (ids.has(def.id)) errors.push(`${def.id}: duplicate case id`);
    ids.add(def.id);
    if (def.countryId !== cc) errors.push(`${def.id}: listed in ${cc} file`);
    if (errors.length) { failed += errors.length; errors.forEach((e) => console.log('  ✗', e)); }
    else { const r = solveScenario(def); console.log(`  ✓ ${def.id} ${def.difficulty}/${def.category} → ${def.expectedOutcome} · ${def.facts.length} facts · ${r.findings.size} findings · ${def.questions.length} questions`); }
    tally[def.expectedOutcome] = (tally[def.expectedOutcome] || 0) + 1;
  }
  console.log(`${cc}: ${CASES.length} cases`, tally);
}
if (failed) { console.log(`${failed} error(s)`); process.exit(1); }

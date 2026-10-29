# Country packs and playable scope

| Country | Structure | Available play | Legal status |
|---|---|---|---|
| KR | Existing passenger/interview/evidence/assessment | Existing Korean modes, airports and saves | Existing frozen rules; no ATLAS legal changes |
| CA | Records first, person/case separation, linked documents | SIM-CA-01 date mismatch; 02 missing accommodation evidence; 03 same-name record with different identifier | SIMULATION_RULE only |
| GB | Assigned tasks first, evidence, collapsible case history | SIM-GB-01 incomplete itinerary handover; 02 event/stay date comparison; 03 consistent resubmission | SIMULATION_RULE only |
| NZ | Application context, assigned activities, evidence and handover | SIM-NZ-01 attachment for another application; 02 missing page; 03 duplicate activity using matching evidence | SIMULATION_RULE only |

Each foreign pack offers two named airport contexts, guided/independent review, Korean/English interview language, independent UI language and existing accessibility settings. Airport labels provide fictional context, not operational capacity. Guided mode explains task prerequisites; independent mode removes that assistance. Neither changes facts or legal standards.

The loop is case selection → canonical question → local record search → document comparison/page/zoom → reviewed evidence → notes → task checks → outcome preparation → confirmation → debrief. A case can complete only once. Completed evidence remains readable. Outcomes are review complete, request evidence or additional review: none means entry permission, visa grant or refusal.

Counter/System switches retain case, transcript, selected document, document page/zoom, search, selected record, notes and review progress. Switching countries asks for confirmation when a session is active. Cancel leaves the current session unchanged.

## Adding a pack

Register an explicit country, fictional stations, source IDs and distinct layout; add authored fixtures and a versioned procedural ruleset. Add validator, country-isolation and actual browser completion tests. Never route foreign fixtures through Korean `case-engine.js` or `legal-engine.js`. Real legal eligibility requires separately verified provisions, effective dates, exception handling and legal review before any feature flag can enable it.

Japan research is retained in the user's original ZIP. No Japanese pack is registered. NZ was designed from INZ application/activity and record guidance, not renamed from Japan.

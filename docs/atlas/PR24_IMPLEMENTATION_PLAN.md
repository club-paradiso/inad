# PR #24 Implementation Plan: Evidence Graph & Branching Investigation

## 1. Overview & Architectural Goals
Transform the international workstation simulation (ATLAS) into a deeper investigative game system inspired by the principles of *Papers, Please*:
- Active discrepancy discovery via a deterministic evidence graph.
- Interactive **Compare Evidence** mechanic supporting cross-document and cross-panel comparison.
- Three rich vertical slices:
  - Canada `SIM-CA-01` (Conflicting departure dates: 12 Nov vs 21 Nov)
  - United Kingdom `SIM-GB-02` (Invitation event dates vs declared 10-day visit)
  - New Zealand `SIM-NZ-02` (Missing Page 2 of stay plan vs receipt check)
- Branching investigation paths (Records-first vs Interview-first).
- Evidence-based debrief evaluating investigative quality.
- 100% backward-compatible save schema (`inad-atlas-v1`).
- Preserved Korean legal baseline, responsive layout (1440, 1024, 768, 390px), and accessibility invariants.

---

## 2. Affected Files

1. **`docs/atlas/PR24_GAMEPLAY_RESEARCH.md`** (new)
   - Research on *Papers, Please* mechanics, Lucas Pope devlogs, and mobile sequential inspection.
2. **`docs/atlas/PR24_IMPLEMENTATION_PLAN.md`** (new)
   - Architecture, schemas, risks, and acceptance plan.
3. **`src/js/engines/atlas-graph-engine.js`** (new)
   - Pure, deterministic engine for facts, comparisons, relationships (`MATCH`, `CONFLICT`, `MISSING`, `UNVERIFIED`), unlock prerequisites, and debrief scoring.
4. **`src/data/atlas-scenarios.js`** (modified)
   - Schema enhancements for `SIM-CA-01`, `SIM-GB-02`, and `SIM-NZ-02` with atomic facts, fact provenance, typed comparisons, and branching unlock requirements.
5. **`src/js/engines/atlas-engine.js`** (modified)
   - Integrate graph engine actions (`compareFacts`, `selectFact`, `clearFactSelection`, `requestEvidence`).
   - Validate additive `graph` state in `atlasCaseValid` and `emptyAtlasCase` while retaining seamless compatibility with legacy saves without `graph`.
6. **`src/js/ui/atlas-workstation.js`** (modified)
   - Compare dock / selection tray.
   - Interactive fact badges on documents, records, and interview statements.
   - Accessible comparison feedback, live region announcements, and rich investigative debrief.
7. **`src/styles/workspace.css`** (modified)
   - Styling for fact chips, comparison dock, status badges, and mobile responsive adaptation.
8. **`tests/unit/atlas-graph.test.js`** (new)
   - Unit tests for deterministic fact comparisons, relationship types, branching routes, unlock gates, and save migration.
9. **`tests/unit/atlas.test.js`** (modified)
   - Ensure existing save compatibility and legacy tests pass unchanged.
10. **`tests/e2e/atlas-investigation.spec.js`** (new)
    - Playwright end-to-end tests for all 3 scenarios, both branching paths, mobile sequential selection at 390px, keyboard-only inspection, and export/import round-trips.

---

## 3. Data & Graph Schema

### A. Scenario Fact Definition
```javascript
{
  id: "SIM-CA-01-FACT-TICKET-DATE",
  sourceId: "SIM-CA-01-DOC1",
  sourceType: "document", // 'document' | 'record' | 'statement'
  label: { ko: "항공권 출국일: 2026-11-12", en: "Ticket departure: 2026-11-12" },
  provenance: { docId: "SIM-CA-01-DOC1", page: 0 }
}
```

### B. Typed Comparisons
```javascript
{
  id: "COMP-CA-01-DEPARTURE-DATES",
  facts: ["SIM-CA-01-FACT-TICKET-DATE", "SIM-CA-01-FACT-VISIT-DATE"],
  type: "CONFLICT", // 'MATCH' | 'CONFLICT' | 'MISSING' | 'UNVERIFIED'
  title: { ko: "출국일 불일치", en: "Departure date conflict" },
  explanation: {
    ko: "항공권(11월 12일)과 방문 기록(11월 21일)의 출국 날짜가 서로 다릅니다.",
    en: "The ticket departure date (12 Nov) contradicts the visit record departure date (21 Nov)."
  },
  unlocks: {
    questions: ["clarify_dates"],
    tasks: ["evidence"]
  }
}
```

### C. Case State Additive Schema
```javascript
// Inside activeAtlasCase():
{
  ...existingFields,
  graph: {
    selectedFacts: [],          // array of up to 2 fact IDs
    discoveries: [],            // array of comparison IDs discovered by player
    unlockedQuestions: [],      // array of question IDs unlocked via discovery
    evidenceRequests: [],       // array of requested evidence items (e.g., NZ-02 Page 2)
    investigationPath: null     // 'records_first' | 'interview_first'
  }
}
```

---

## 4. Save Compatibility & Migration Strategy
- Save Key: `inad-atlas-v1` remains unchanged.
- Version: `ATLAS_VERSION = 1` remains unchanged.
- Additive properties: `graph` is created on demand if absent when a case is loaded or selected.
- In `atlasCaseValid`:
  - If `v.graph` is present, its shape is checked (arrays of valid strings, `selectedFacts.length <= 2`).
  - If `v.graph` is absent, the case is still valid (preserving older saves and completed cases).
- Export/import bundles validate cleanly and preserve all fields.

---

## 5. Potential Risks & Mitigation

| Risk | Mitigation |
| :--- | :--- |
| **Mobile Screen Real Estate (390px)** | Use a sticky / persistent sequential comparison dock instead of side-by-side placement. Minimum 44px tap targets. |
| **Accidental State Desync** | Graph engine is DOM-free and deterministic; UI only reads state and dispatches engine actions. |
| **Save Invalidation** | Additive schema defaults automatically when `graph` is missing; all existing save tests run as regression gates. |
| **Accessibility (WCAG 2.1 AA)** | Keyboard navigation with standard buttons, visible focus ring, ARIA attributes (`aria-pressed`, `role="status"`), high contrast support. |
| **Cross-Case Evidence Leakage** | Fact IDs and comparisons are strictly namespaced by scenario ID; engine rejects comparisons across different cases. |

---

## 6. Acceptance Criteria
1. **Three Complete Vertical Slices**:
   - `SIM-CA-01`: Detects `CONFLICT` between 12 Nov and 21 Nov dates. Clarifies date transposition.
   - `SIM-GB-02`: Detects `UNVERIFIED` gap between 2-day event and 10-day trip. Unlocks travel follow-up.
   - `SIM-NZ-02`: Detects `MISSING` page 2. Initiates simulated evidence request.
2. **Branching Paths**:
   - Both Records-first and Interview-first paths are fully playable to debrief in all 3 cases.
3. **Ergonomic Comparison**:
   - Works across document pages, search records, and transcript on desktop (1440px) and mobile (390px).
4. **Debrief Evaluation**:
   - Debrief dynamically scores and reflects discrepancies discovered, evidence requested, and unresolved facts.
5. **Quality Gates**:
   - `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:integrity`, `npm run test:e2e`, `npm run qa` all pass cleanly.

# PR #24 — Gameplay Research & Investigation Mechanics

## 1. Study of Core Principles (Papers, Please & Lucas Pope Devlogs)

Based on Lucas Pope's development logs (TIGSource devlog 2012–2013 and mobile adaptations 2014) and *Papers, Please*:

### A. The Core Discrepancy Mechanic
- In *Papers, Please*, gameplay is fundamentally an **information discrepancy search**. The player does not win by memorizing rules; they win by matching two pieces of information that ought to agree, or identifying a missing requirement against a rulebook/record.
- **The Inspect Mode ("Discrepancy Mode")**: The player enters inspection mode, clicks one datum (e.g., date of birth on passport), then clicks a second datum (e.g., date of birth on entry permit, or audio transcript of statement).
- If the two data points conflict or a required document is missing against the rule, a discrepancy is officially registered by the system.
- Registering a discrepancy has immediate mechanical consequences: it unlocks dialogue ("Interrogation" / "Questioning"), allows fingerprinting/search, or prompts the traveler to explain the mismatch.

### B. Mobile Adaptation Insights (Pope's Mobile Devlog)
- On desktop, documents can be dragged and placed side by side. On small screens (phones/tablets), screen real estate is constrained.
- Pope's key mobile insight: **sequential pinning and inspection**. Rather than forcing simultaneous side-by-side placement of multiple documents, the interface allows selecting an item, holding it in a persistent comparison buffer or tray, navigating to another document or transcript tab, and tapping the second item.
- No microscopic drag-and-drop; clear touch targets (at least 44×44px); visible active selection states; non-blocking inspection overlays.

### C. Human Nuance: Discrepancy != Automatic Guilt or Refusal
- Real-world immigration review (and nuanced simulation) is not binary "gotcha".
- An unexplained discrepancy might be a typographical error, an incomplete itinerary, a transposed date, or an innocent misunderstanding.
- Crucially:
  1. **Missing evidence is not evidence of deception**: Missing a receipt or page means an administrative requirement is unmet, not that the traveler committed fraud.
  2. **Contradiction requires explanation, not immediate adverse action**: The examiner's role is to identify what is conflicting, investigate the cause, determine what remains unverified, and record a structured finding (`SIMULATION_RULE`).

---

## 2. INAD ATLAS Investigation Loop

In INAD, we apply these principles to modern administrative immigration workstations (Canada IRCC/CBSA style, UK Visas & Immigration style, New Zealand INZ ADEPT style) without copying aesthetic assets or fictional settings:

```
[ Observe Evidence ]
        │
        ▼
[ Compare Facts (Select Fact A + Fact B) ]
        │
        ▼
[ Discover Discrepancy / Relationship ]
  ├── MATCH: Consistent facts corroborating timeline/identity
  ├── CONFLICT: Factual contradiction (e.g., 12 Nov vs 21 Nov)
  ├── MISSING: Required document or schedule component absent
  └── UNVERIFIED: Incomplete explanation (e.g., 2-day event vs 10-day stay)
        │
        ▼
[ Branching Investigation ]
  ├── Route 1: Record/Doc check first → Discrepancy → Follow-up Interview
  └── Route 2: Interview statement first → Corroborate vs records → Uncover gap
        │
        ▼
[ Connect Findings & Log Facts in Graph ]
        │
        ▼
[ Assess Unresolved Facts in Debrief ]
  ├── What was established?
  ├── What remained unverified?
  └── Was appropriate administrative follow-up selected?
```

---

## 3. Comparative Taxonomy of Relationships

| Relationship Type | Definition | Example in Vertical Slices | Investigation Payoff |
| :--- | :--- | :--- | :--- |
| **`MATCH`** | Two facts are identical or mutually corroborating. | CA: Passport ID matches current file; NZ: Activity and note refer to same submission. | Confirms provenance; clears potential identity mix-ups. |
| **`CONFLICT`** | Two facts directly contradict each other. | CA-01: Flight ticket departure (12 Nov) vs Visit record departure (21 Nov). | Discrepancy discovered; unlocks clarification dialogue on transposed dates. |
| **`MISSING`** | An expected document, page, or evidence piece is absent. | NZ-02: Stay plan Page 1 exists, but Page 2 is absent from receipt. | Flags administrative deficiency; unlocks official evidence request. |
| **`UNVERIFIED`** | A gap exists where an assertion is not supported or only partially covered. | GB-02: 2-day conference invitation vs 10-day overall travel declaration. | Distinguishes event length from travel length; unlocks follow-up on remaining 8 days. |

---

## 4. Interaction Ergonomics & Accessibility

1. **Sequential Selection**:
   - Fact 1 can be selected from any document page, search record, or interview transcript line.
   - Fact 1 is pinned in an accessible **Evidence Inspector Dock** (visible across tabs and views).
   - The player navigates anywhere in the workstation (switching between Counter and System, or across mobile tabs) to choose Fact 2.
   - An explicit "Compare" action triggers deterministic evaluation.

2. **Keyboard & Screen Reader Ergonomics**:
   - Each atomic fact is wrapped in an accessible `<button>` or toggleable element with `aria-pressed`, `aria-label`, and readable text.
   - The comparison dock has live region updates (`role="status"`) announcing selections and comparison results.
   - Keyboard shortcuts or standard Tab navigation allows 100% mouse-free investigation.

3. **Touch Targets**:
   - All interactive fact targets and dock buttons meet the >=44px minimum bounding box.
   - No drag-and-drop required.

# INAD border-control UI research

This note records the public sources used to shape INAD's operator-console UI. INAD remains a fictional training simulation. The project does **not** attempt to reproduce Ministry of Justice internal screens, non-public watchlists, risk-scoring logic, or restricted operational procedures.

## Public systems reviewed

### Republic of Korea — Smart Entry Service (SES)
Official immigration guidance describes an automated sequence using passport information and biometrics. The published process is: place the passport bio-data page on the reader, proceed when the gate opens, provide the registered fingerprint, look at the camera where required, and exit when clearance succeeds.

- https://www.immigration.go.kr/immigration_eng/1859/subview.do
- https://immigration.go.kr/immigration/1527/subview.do

### United States — CBP Simplified Arrival
Public CBP/DHS material describes Simplified Arrival as a biometrically initiated primary-inspection workflow. A newly captured face is compared against pre-staged government holdings. If a match is confirmed, the officer completes the remaining primary inspection and either admits the traveler or refers the traveler to secondary inspection. If a biometric match cannot be made, a travel-document scan can be used as a fallback.

- https://www.cbp.gov/sites/default/files/2025-09/pta_cbp_simplified_arrival_overarching_redacted.pdf
- https://www.cbp.gov/newsroom/local-media-release/cbp-lawa-expand-biometric-traveler-experience-lax

### European Union — Entry/Exit System (EES)
The public EES description combines travel-document data, facial images/fingerprints, entry and exit events, and refusals of entry in the border workflow. It replaces routine manual passport stamping for covered travelers and supports automated and self-service processing.

- https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en
- https://www.consilium.europa.eu/en/policies/entryexit-system/

### Australia — Arrivals SmartGate
Australian Border Force describes arrival SmartGate as a two-step process. The traveler first uses a kiosk for passport/face processing and then proceeds to a gate for identity confirmation. Unsuccessful automated processing routes the traveler to an officer/manual control rather than presenting a generic failure state.

- https://www.abf.gov.au/entering-and-leaving-australia/smartgate/arrivals
- https://www.abf.gov.au/smartgate/Pages/using-smartgates.aspx

### ICAO — travel document inspection and primary/secondary examination
ICAO public training/guidance emphasizes electronic travel-document inspection, document authenticity and validity, identity verification, and the separation between high-throughput primary examination and more intensive secondary examination where doubts remain.

- https://igat.icao.int/ated/trainingcatalogue/Course/761
- https://www.icao.int/sites/default/files/TRIP/Publications/ICAO-TRIP-Guide-BCM-Part-1-Guidance.pdf

## UI principles carried into INAD

1. **A visible inspection pipeline**
   - Passport/documents
   - Identity
   - Biometric identity check
   - Entry-requirement review
   - System queries when needed
   - Decision

   These are presented as operator work states, not as hidden scores.

2. **Primary and secondary inspection are distinct**
   Secondary inspection is presented as continuation/escalation of examination, not as a punishment or automatic refusal.

3. **Status is explicit and not color-only**
   Each major check uses machine-readable words such as `PASS`, `CHECK`, `HOLD`, `MATCH`, `READY`, and `ALERT` alongside color. Red is reserved for material blockers/alerts; amber is for review.

4. **The current traveler outranks the queue**
   Queue pressure remains visible, but the queue strip is visually quieter than the current traveler's identity, documents and inspection state.

5. **Biometrics are identity evidence, not a decorative score**
   Passport and live portraits remain paired. Mismatch is displayed as a blocking identity issue requiring review.

6. **System-query output looks like records, not a fictional hacking terminal**
   Monospace typography is retained for record readability, but the visual treatment is restrained and administrative.

7. **High-consequence actions are explicit**
   Admit, secondary referral and refusal remain visually distinct. Keyboard shortcuts are visible on the action controls to support repeated workstation use.

8. **The interface helps the learner know what to do next**
   The inspection rail produces a simple next-action cue derived only from information already visible in the simulation. It does not expose hidden answer logic.

## Deliberate exclusions

- No reproduction of proprietary Korean immigration applications or screen layouts.
- No internal watchlist categories, targeting criteria, intelligence sources or risk scores.
- No attempt to infer restricted officer permissions or security architecture.
- No claim that simulated codes or layouts are used by the Ministry of Justice.

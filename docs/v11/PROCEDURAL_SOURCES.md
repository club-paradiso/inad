# v11 procedural provenance register — international scenario library

Prepared: **2026-10-30**. Scope: the fictional, educational CA / GB / NZ exercises. This register extends
`docs/atlas/LEGAL_SOURCE_REGISTER.md` (retrieved 2026-10-29) and does not replace it; read it together with
`docs/atlas/KNOWN_LIMITATIONS.md`. A retrieved page is context, not a validated decision engine. Every foreign
fixture remains `SIMULATION_RULE`; **no foreign legal disposition is enabled**.

Status values:

- **VERIFIED (retrieved)** — official text was retrieved and read on the access date. It still only supports descriptive/procedural context.
- **RETRIEVAL FAILED — NOT VERIFIED** — no official text was obtained. Nothing in this register describes its content, and the simulation must not rely on it.

## 1. Carried-forward entries (from the 2026-10-29 register)

Status is carried forward unchanged. These were not re-fetched on 2026-10-30 (see section 2 for why).

| ID | Country | Source (issuer) | Relevant heading | Status | Use in simulation |
|---|---|---|---|---|---|
| CA-IRPA | CA | Immigration and Refugee Protection Act, s18 (Justice Canada, laws.justice.gc.ca) | s18 examination of persons seeking entry | VERIFIED (retrieved 2026-10-29) | Context for all CA exercises. No eligibility logic. |
| CA-IRPR | CA | Immigration and Refugee Protection Regulations, s183 (Justice Canada) | Temporary resident conditions / authorised stay | VERIFIED (retrieved 2026-10-29) | Context only. No authorised-stay, work or study computation. |
| CA-ENF4 | CA | ENF 4: Port of Entry Examinations (IRCC manual PDF, canada.ca) | 5.3, 7.4–7.5, 8.2, 8.4, 8.7 | VERIFIED (retrieved 2026-10-29) | Primary/secondary examination, questions and records as procedural context. It is an IRCC manual, not a CBSA screen specification. |
| GB-ACT | GB | Immigration Act 1971, Schedule 2 (legislation.gov.uk) | Sch. 2 para 2 examination | VERIFIED (retrieved 2026-10-29; plain-view HTML) | Context only. Outstanding effects and commencement not resolved. |
| GB-RULES | GB | Immigration Rules Appendix V: Visitor (Home Office, gov.uk) | V1; V4.2–4.3 | VERIFIED (retrieved 2026-10-29) | Visitor context only. Fixture outcomes are not applications of these rules. |
| GB-VISIT | GB | Visit caseworker guidance v18.0 (Home Office, gov.uk) | 3 border visitors; 6 evidence; 19 recording | VERIFIED (retrieved 2026-10-29) | Evidence and handover inspiration only. Section 2 concerns overseas visa applications, not an airport flow. |
| NZ-ACT | NZ | Immigration Act 2009 (Parliamentary Counsel Office, legislation.govt.nz) | s26 / entry permission (unconfirmed) | **RETRIEVAL FAILED — NOT VERIFIED** (403 on 2026-10-29; DNS denied on 2026-10-30) | None. No statutory rule, section number or wording may be cited in the UI. |
| NZ-A16 | NZ | INZ Operational Manual A16.3 (Immigration New Zealand) | A16.3.10 assigned activities; A16.3.15 final assessment | VERIFIED (retrieved 2026-10-29; effective 2026-05-29) | Separation of assigned activities and assessment context. Not an airport/ADEPT interface or legal outcome. |
| NZ-Y35 | NZ | INZ Operational Manual Y3.5 (Immigration New Zealand) | Y3.5; Y3.5.1 | VERIFIED (retrieved 2026-10-29; effective 2022-03-21) | Relevant evidence / change of circumstances context. No automated rule. |

## 2. New entries attempted on 2026-10-30

Every retrieval attempt below failed before any content was received: the session's network policy did not resolve
the host (`getaddrinfo ENOTFOUND`). This reflects the reviewing environment's network allow-list, not the
availability of the official pages. **No content, quotations, validity periods or eligibility statements are recorded
for these entries.** The relevance notes describe only what the simulation *intends* to depict. They are not claims
about what the sources say.

| ID | Intended source / issuer | URL attempted | Access date | Applicable heading | Status |
|---|---|---|---|---|---|
| CA-ETA | IRCC public guidance, "Electronic Travel Authorization (eTA)" (Immigration, Refugees and Citizenship Canada) | https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html | 2026-10-30 | Not determined (not retrieved) | **RETRIEVAL FAILED — NOT VERIFIED** (host www.canada.ca not resolvable) |
| GB-ETA | GOV.UK guidance, "Apply for an electronic travel authorisation (ETA)" (Home Office) | https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta | 2026-10-30 | Not determined (not retrieved) | **RETRIEVAL FAILED — NOT VERIFIED** (host www.gov.uk not resolvable) |
| NZ-NZETA | Immigration New Zealand public NZeTA guidance | https://www.immigration.govt.nz/new-zealand-visas/preparing-a-visa-application/the-application-process/nzeta | 2026-10-30 | Not determined (not retrieved) | **RETRIEVAL FAILED — NOT VERIFIED** (host www.immigration.govt.nz not resolvable). The URL itself is unconfirmed and may have moved. |
| NZ-ACT (retry) | Immigration Act 2009 (PCO) | https://www.legislation.govt.nz/act/public/2009/0051/latest/DLM1440303.html | 2026-10-30 | s26 / entry permission (unconfirmed) | **RETRIEVAL FAILED — NOT VERIFIED** (host www.legislation.govt.nz not resolvable; previous attempt 403) |

Intended simulation relevance, pending verification:

- **CA-ETA / GB-ETA / NZ-NZETA.** A fictional exercise may show a synthetic travel-authorisation record next to a
  synthetic passport, and ask the trainee to notice a record mismatch, such as a passport number with two transposed
  digits. Until the sources are retrieved, this must be presented as a **SIMULATION_RULE data-consistency exercise
  only**. It must not claim that an authorisation "is linked to a passport", state a validity period, explain what
  happens with a new passport, or say whether an authorisation guarantees boarding or entry. The UI must not use
  the official product names "eTA", "ETA" or "NZeTA" as verified facts. Use a neutral label such as "travel
  authorisation record (simulated)".
- **NZ-ACT.** No NZ exercise may cite an Immigration Act 2009 section number or paraphrase its content.

Known uncertainty and limitations for all four:

- None of them has been read. Their headings, version dates, effective dates and wording are all unknown.
- The attempted URLs are the expected public locations. They have not been confirmed to exist or to be current.
- Travel-authorisation schemes change often (eligible nationalities, fees, validity, transit rules). Even after
  retrieval, record the page's "last updated" date and do not treat it as an effective date.
- Re-run retrieval from an environment whose network allows `www.canada.ca`, `www.gov.uk`,
  `www.immigration.govt.nz` and `www.legislation.govt.nz`. Then update this table with the title, version or update
  date, the exact heading, and a short note of what was read. Do not add direct quotations unless they were copied
  from the retrieved page.

## 3. Simulation rules vs verified public law

- The three outcomes, **complete / evidence / review**, are `SIMULATION_RULE` training labels. They describe how far
  the trainee's documentation got in a fictional exercise. They are **not** legal dispositions in any country. They do
  not mean granted leave, admission, refusal, inadmissibility, removal or deferral.
- There is **no eligibility, refusal, detention, removal or appeal logic** for any overseas country (CA, GB, NZ).
  There is also no visa or travel-authorisation eligibility logic and no asylum or refugee logic. A register entry
  marked VERIFIED does not enable any such logic.
- **Nationality, ethnicity, accent, language skill, interpreter use and nervousness are never evidence.** None of them
  contributes to any outcome, score, prompt or highlight. This matches the project invariants in `CLAUDE.md` and
  `tests/unit/invariants.test.js`. Nationality may appear only as a document field.
- Country-specific terminology in the UI is **descriptive context** tied to a register entry in section 4. Examples:
  "secondary examination" for Canada, "examination" for UK visitors, "assigned activities" for NZ. A term borrowed
  from a source does not import that source's legal tests, thresholds or consequences. Every such label carries
  "(simulated)".
- Where a register entry is RETRIEVAL FAILED, the UI uses neutral wording and does not cite the source.
- Retrieval of a source never upgrades a fixture to `VERIFIED_LEGAL_RULE`. That needs independent legal review of
  jurisdiction, version, effective date and exceptions for the specific scenario (see KNOWN_LIMITATIONS, "Next work").

## 4. Per-country terminology used in the UI

VERIFIED means the supporting register entry's official text was retrieved, on 2026-10-29. That retrieval does not
confirm the exact UI string; the strings are paraphrases. CONTEXT means design inspiration only, or no verified
support.

| Country | Proposed UI term (review outcome) | Register ID | Flag | Recommendation |
|---|---|---|---|---|
| CA | "Refer to secondary examination (simulated)" | CA-ENF4 (also CA-IRPA s18) | VERIFIED | **Keep.** ENF 4 was retrieved and covers primary/secondary examination (sections 5.3, 7.4–7.5). Keep "(simulated)". Do not add CBSA branding or any wording about inadmissibility. |
| GB | "Refer for further examination (simulated)" | GB-ACT Sch. 2 para 2; GB-VISIT s3 | VERIFIED (source); wording CONTEXT | **Keep, with care.** Sch. 2 para 2 examination powers were retrieved. "Further examination" is a paraphrase, not a confirmed statutory phrase, and outstanding effects are unresolved. Do not cite a paragraph number in the UI string, and do not add roles such as "senior officer" or "chief immigration officer", because they were not verified. |
| NZ | "Hand over for further assessment (simulated)" | NZ-A16 (A16.3.10, A16.3.15) | CONTEXT | **Accept as neutral wording.** A16.3 was retrieved, but it covers assigned activities and final assessment in an application/instruction context, not an airport border step. The NZ Act was not retrieved. Do not use "assigned activities" as a border-process label. Use it only in explanatory notes citing NZ-A16. |
| CA / GB / NZ | Travel authorisation record (simulated) | CA-ETA / GB-ETA / NZ-NZETA | CONTEXT (not retrieved) | Use the neutral label. Do not use "eTA", "ETA" or "NZeTA" as product names, and do not state linkage, validity or entry guarantees, until the sources are retrieved. |
| All | complete / evidence / review | none (SIMULATION_RULE) | CONTEXT | Training labels only. Never relabel them as admit / refuse / remove. |

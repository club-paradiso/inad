# ATLAS design decisions

The supplied ZIP is research/specification, not an existing prototype or a legal engine. Its instructions were treated as reference material; the user's KR/CA/GB/NZ scope supersedes the KR/CA/GB/JP design list. Original Japanese research remains untouched in the supplied package.

## Evidence levels

| Reference | Evidence and permitted use | Boundary |
|---|---|---|
| R01 / KR01 | Existing INAD source and [public SES guidance](https://immigration.go.kr/moj/193/subview.do) | Fictionalized workstation. Public traveler guidance does not reveal ICRM staff UI. |
| CA03 | Research-verified historical [IRCC Chinook/GCMS release](https://heronlaw.ca/wp-content/uploads/2021/11/2A202167625_finalrelease.pdf), v3 revision 2021-01-18 | Documented historical screen fragments; current INAD layout is Inspired/Fictionalized. Not a CBSA airport UI. No released screenshots redistributed. |
| CA07 | [CBSA Entry/Exit evaluation](https://www.cbsa-asfc.gc.ca/agency-agence/reports-rapports/ae-ve/eeep-epes/menu-eng.html) | System/jurisdiction context, not screen evidence. |
| UK01 | [Home Office identity glossary](https://www.gov.uk/government/publications/ukvi-identity-standards-caseworker-guidance/identity-standards-glossary-accessible) | Atlas terminology/context, not whole-product UI documentation. |
| UK03 | [Home Office Page component](https://design.homeoffice.gov.uk/design-system/components?name=Page) | Public template and research account; task-oriented composition is Inspired. No claim of full Atlas conformance or Border Force screen reproduction. |
| NZ01 / NZ-A16 | [A16.3](https://www.immigration.govt.nz/opsmanual/76822.htm) | Documented application/activity distinction; INAD activity board is Fictionalized. Visa-processing guidance does not make ADEPT an airport system. |
| NZ06 | [AMS input circular 17/01](https://www.immigration.govt.nz/assets/inz/documents/internal-administration-circulars/iac1701guidelinesforstandardamsinput.pdf), 2017-03-03 | Historical notes guidance from supplied research; not evidence of current ADEPT staff screens. |

Design-source rows except A16.3 are inherited from the research register verified 2026-10-28. They are not silently promoted to current legal authority. Current legal/procedural retrieval is tracked separately in LEGAL_SOURCE_REGISTER.md.

## Information architecture

- CA puts local record search first, then document detail, then review checks. Person ID and case ID remain separate. Search is labeled synthetic and cannot query outside the current fixture.
- GB starts with assigned tasks. Their evidence links open the document; case history remains a disclosure rather than dominating the task list.
- NZ separates the application context from assigned activities. On desktop, three activities are compared side by side; on smaller screens they stack. The handover explicitly retains unresolved facts. This is an original design based on NZ evidence, not a renamed JP pack.
- Counter emphasizes interview; System emphasizes records/tasks/activities. These are presentations of one case, not independent apps. Mobile navigation exposes one task at a time.

The reusable device is a visible chain from source → recorded observation → unresolved point → handover. Color and decorative statistics do not substitute for evidence. All scenarios avoid difficulty based on nationality, appearance or other sensitive traits. No government insignia or security-feature reproductions.

## Visual implementation and review

Existing semantic CSS tokens and system-font stack are unchanged. Desktop, tablet and phone use the same zone nodes. Controls have a 44px minimum target; selected/disabled/empty states have labels. Review confirmation focuses the safe cancel action; country changes preserve a return path. A discovered selected-button hover contrast defect was fixed and pinned by a computed WCAG contrast test.

The initial generated CA visual concept was used as a layout exploration. The implementation intentionally omits its invented nationality/contact fields and legal-looking checklist, uses only the authored fixture's two records, and adds actual save protection and two-step outcome confirmation. No generated concept is treated as a government reference.

Editable desktop references: [CA](https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8?node-id=232-8), [GB](https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8?node-id=232-132), [NZ](https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8?node-id=232-248). New page `15 — ATLAS country foundations`, section `[Implemented] ATLAS · procedural foundations · 2026-10-29`. Existing human frames/components were not modified. The reference composition has 202 editable text nodes, 82 instances and no raster UI fills. It uses the existing Action/Button component and Noto Sans KR from the application's system-font fallback stack. Native Mac text metrics differ; browser screenshots are the exact runtime evidence, while Figma records the desktop hierarchy.

A pre-existing Figma/code token drift was found (canvas, surface, subtle backgrounds, muted text and borders). Runtime tokens were preserved. A separate three-color ATLAS code snapshot provides the required canvas/muted/subtle values in new frames; matching existing semantic variables are reused. Global library reconciliation is pending rather than silently changing approved designs. Tablet/mobile behavior is documented with actual browser screenshots, not editable Figma variants yet.

# INAD v10 — Rejected / flagged assets

Each entry: id · asset · reason · action. Existing v9 portraits stay in production as fallback until a replacement is
approved; "reject" here means "do not carry into v10 art", not "delete".

| id | asset | reason | action |
|---|---|---|---|
| R-001 | `src/assets/portraits/TRV-0005.webp` (ICN-S2-005, slice) | ethnicity and age mismatch with the case (Vietnamese, 27): reads as Middle-Eastern, mid-30s; scarf styling | regenerate first (pilot 1) |
| R-002 | `TRV-0001.webp` (ICN-S1-001) | fashion-editorial: model face, suit and tie, studio light | regenerate (pilot 2) |
| R-003 | `TRV-0009.webp` (ICN-S3-011) | plausible; studio sweep, glasses glare; check age | review at regeneration |
| R-004 | `TRV-0013.webp` (ICN-S3-010) | national-costume shorthand (keffiyeh/thobe) for an Egyptian traveler; smiling | regenerate (pilot 4) |
| R-005 | `TRV-0002.webp` (ICN-S1-002) | influencer styling, headphones prop, beauty retouch | regenerate (pilot 5) |
| R-006 | `TRV-0012.webp` (ICN-S3-012, b. 1978) | looks ≈ 25 for a 48-year-old; cap styling | regenerate after pilot |
| R-007 | `TRV-0011.webp` (ICN-S2-007, Filipino) | ethnicity read is ambiguous; editorial smile | regenerate after pilot |
| R-008 | batch TRV-0074…0106 | UI-like border frames baked into the image; light-grey ID-photo style incompatible with batch 1 | regenerate as one batch |
| R-009 | batch TRV-0001…0073 | studio sweep, age range 20–35, smiles, over-beautification | regenerate as one batch after pilot validation |
| R-010 | living-portrait mouth gap v0 (`#341614` @ 0.88, rx 0.34·mouth) | read as red lipstick on TRV-0005 | replaced by `rgba(26,15,13,.82)`, rx 0.27, max open 1.6 % |

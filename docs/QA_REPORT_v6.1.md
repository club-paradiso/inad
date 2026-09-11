# INAD v6.1 QA Report

## Automated integrity checks

| Check | Result |
|---|---|
| Traveler pool | PASS · 105 travelers · unique IDs |
| Core cases | PASS · 12 cases |
| Shift queue | PASS · 36 travelers · valid references |
| Portrait assets | PASS · embedded Data URI |
| DOM IDs | PASS · 0 duplicates |
| External network assets | PASS · 0 |
| Browser storage | PASS in storage-enabled test harness |
| Records JSON | PASS |
| Checkpoint JSON | PASS |
| Required action references | PASS · 0 missing |
| Horizontal overflow | PASS · 0 |
| Runtime issues | PASS · 0 |
| Legal baseline | PASS · 2026-09-07 |
| Save schema | PASS · INAD_SAVE_BUNDLE v1 |

## Save bundle tests

- Valid bundle: accepted
- Corrupted checksum: rejected
- Unknown storage keys: validator rejects by allowlist
- Restore smoke test: `nextIndex = 7` restored after bundle re-application

## Browser smoke tests

- 1440x1000: start -> briefing -> first shift start -> system center
- 1024x768: system center opens without horizontal page overflow
- Chromium page errors: 0

## Environment note

The sandbox blocks direct localhost/file navigation. Browser QA used Chromium with the complete HTML loaded via `set_content`; storage-specific tests used an in-memory localStorage-compatible harness. The shipped HTML uses native browser `localStorage` with existing fail-safe wrappers.

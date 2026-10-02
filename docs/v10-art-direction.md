# INAD v10 — Art direction (summary)

Working files live in `design/v10/`:
`ART_DIRECTION.md` (intent, layers, composition decision, Higgsfield pipeline, audit of the v9 portrait set) ·
`UI_CONSTITUTION.md` (anti-slop rules + review checklist) · `CHARACTER_BIBLE.md` (pilot five) · `MOTION_BIBLE.md` ·
`LIGHTING_BIBLE.md` · `ASSET_MANIFEST.json` · `GENERATION_LOG.md` · `REJECTED_ASSETS.md` · `prototypes/` (three
functional compositions) · `lab/avatar-lab.html` (living-portrait frame inspection) · `review/` (screenshots).

## Decisions
1. **INSTITUTIONAL CINEMA** in three layers: calm workstation · dark booth for the human · editorial meta screens.
2. **Composition A** (booth · conversation · evidence · assessment), with C's official-record transcript and B's
   subtitle-on-image. B and C rejected for dead space / the person reduced to a file photo (screenshots in `review/`).
3. **Runtime passenger = living still** over the existing portraits until generated assets are approved
   (`docs/v10-avatar-system.md`).
4. **Generated art is blocked, not skipped**: Higgsfield is unreachable from the build environment; the pipeline,
   briefs and acceptance criteria are written so the first authorised session can execute them in order.

## Tokens added (Figma variables synced 2026-10-02; frames await image upload — `docs/figma-workspace-spec.md` §10)
`--booth #111b21` · `--booth-2 #18252c` · `--booth-line #283840` · `--booth-text #e9eef1` · `--booth-muted #a3b3bd` ·
`--w-booth 304px` (280 below 1440).

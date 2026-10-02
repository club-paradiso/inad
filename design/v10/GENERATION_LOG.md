# INAD v10 — Generation log

## 2026-10-02 · session claude/relaxed-edison-iux1mv
- `npm view @higgsfield/cli` → 1.1.26, bins `higgsfield`/`higgs`; package `postinstall` downloads the platform binary
  from `github.com/higgsfield-ai/cli/releases` and checks SHA-256 (read from the package source).
- `curl https://higgsfield.ai` → `CONNECT tunnel failed, response 403` (environment network policy).
- `curl https://github.com/higgsfield-ai/skills` → 403 (policy); `https://huggingface.co/...` → 403 (policy).
- Not attempted: install (binary download would fail), `higgsfield auth login` (browser OAuth; also blocked).
- **Generations: 0. Assets integrated from Higgsfield: 0.**

## Queued for the first authorised session (in order)
1. `npm i -g @higgsfield/cli && higgsfield --help && higgsfield auth login` (user completes browser login).
2. `npx skills add higgsfield-ai/skills` — verify the current official install command first.
3. Pilot 1 (TRAN VAN MINH): 6 candidates of the seated booth portrait (CHARACTER_BIBLE.md row 1, LIGHTING_BIBLE.md);
   pick 1 + log; 4 neutral/¾/profile/wardrobe frames from it; Soul ID from approved frames; speaking ×2, listening,
   hesitant, document-check frames; 3–6 s motion studies (MOTION_BIBLE.md).
4. Export the approved booth frame at 640×800 WebP (q≈80, target ≤ 45 KB), run `scripts/extract-portrait-rigs.py`,
   check the living-portrait lab (`design/v10/lab/avatar-lab.html?ids=TRV-0005`), then replace TRV-0005 in a PR with
   before/after screenshots.
5. Pilots 2–5, continuity review of all five side by side, then decide on batch regeneration.
Host allow-list needed: `higgsfield.ai` and its subdomains, `github.com` + `objects.githubusercontent.com` (CLI binary).

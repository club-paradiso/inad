// One release version everywhere. The adaptive workstation shipped to production as "v7.2" while the docs
// called it v8; this test keeps package.json, the lockfile, RELEASE (UI label + diagnostics + bundle
// metadata), the pre-boot HTML placeholders, the build banner, the README and the release notes in step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE } from '../../src/data/legal-baseline.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const [major, minor] = pkg.version.split('.');
const short = `${major}.${minor}`;

test('package.json, package-lock.json and RELEASE agree', () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(RELEASE.version, short, 'RELEASE.version is major.minor of package.json');
  assert.equal(RELEASE.saveSchema, 1, 'bundle schema is compatibility-pinned');
  assert.equal(RELEASE.legalBaseline, '2026-09-07', 'legal baseline changes only with a documented legal review');
});

test('pre-boot HTML placeholders show the current version (no stale label before boot)', () => {
  const html = read('src/index.html');
  assert.ok(html.includes(`id="brandTag">v${short}<`), 'brandTag');
  assert.ok(html.includes(`id="startReleaseChip">v${short} · ${RELEASE.label}<`), 'startReleaseChip');
});

test('built artifact banner and the README / release notes name this release', () => {
  const dist = path.join(root, 'dist/index.html');
  if (fs.existsSync(dist)) assert.ok(fs.readFileSync(dist, 'utf8').includes(`INAD: 제12조 v${pkg.version} — GENERATED FILE`), 'dist banner');
  assert.ok(read('README.md').includes(`v${short}`), 'README mentions the current release');
  assert.ok(fs.existsSync(path.join(root, `RELEASE_NOTES_v${short}.md`)), `RELEASE_NOTES_v${short}.md exists`);
  assert.ok(read(`RELEASE_NOTES_v${short}.md`).includes(pkg.version), 'release notes carry the full version');
});

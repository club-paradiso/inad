// The English UI table must track the Korean UI: every exact-match key has to occur in the sources (a key that
// no longer occurs is a leftover of a removed screen), and no key may be listed twice (the later one silently wins).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { translateString } from '../../src/js/services/i18n.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const src = fs.readFileSync(path.join(root, 'src/js/services/i18n.js'), 'utf8');
const start = src.indexOf('const EXACT'), end = src.indexOf('\n]);', start);
const keys = [...src.slice(start, end).matchAll(/^\s*\[('(?:[^'\\]|\\.)*')\s*,/gm)].map((m) => m[1].slice(1, -1).replace(/\\'/g, "'"));
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|html)$/.test(f) && !p.endsWith('i18n.js')) files.push(p); } };
walk(path.join(root, 'src'));
const corpus = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

test('exact-match keys are unique', () => {
  assert.ok(keys.length > 300, 'parsed the EXACT table');
  assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), []);
});

test('every exact-match key still occurs in the Korean sources', () => {
  assert.deepEqual(keys.filter((k) => !corpus.includes(k)), []);
});

test('count patterns only rewrite numbers, never Korean words that end in 회/건', () => {
  assert.equal(translateString('3회'), '3 times');
  assert.equal(translateString('12건'), '12 cases');
  for (const word of ['출입국기록 미조회', '긴급체포 요건', '캠페인 연계사건', '재조회']) assert.equal(translateString(word).includes(' times') || translateString(word).includes(' cases'), false, word);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { poolBuildStrings } from '../../scripts/pool-build-strings.js';

test('build string pooling preserves literal values, closures, directives, keys and fetch targets', () => {
  const source = '"use strict";(()=>{"use strict";const _$0="reserved";const obj={"repeated long value":"repeated long value",["repeated long value"]:"repeated long value"};function f(){return"repeated long value"}globalThis.result=[obj,f(),_$0,"quotes\\\" and slash\\\\","quotes\\\" and slash\\\\"];fetch("/api/npc");fetch("/api/npc");})();';
  const run = code => { const context = { fetch: () => {} }; vm.runInNewContext(code, context); return JSON.stringify(context.result); };
  const compact = poolBuildStrings(source);
  assert.equal(run(compact), run(source));
  assert.match(compact, /fetch\("\/api\/npc"\)/);
  assert.match(compact, /\(\)=>\{"use strict";/);
  assert.match(compact, /"repeated long value":/);
  assert.ok(compact.length < source.length);
});
test('build string pooling leaves non-IIFE and non-repeating input intact', () => {
  for (const source of ['const a="unique";', '(()=>{return "unique"})();']) assert.equal(poolBuildStrings(source), source);
});

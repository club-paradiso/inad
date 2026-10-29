// Lossless build-only string interning. References stay inside esbuild's IIFE;
// source modules, property keys, directives and network call targets stay intact.
import { parse } from 'acorn';

export function poolBuildStrings(source) {
  const tree = parse(source, { ecmaVersion: 'latest' });
  const identifiers = new Set(), groups = new Map();
  const visit = (node, parent, key) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Identifier') identifiers.add(node.name);
    if (node.type === 'Literal' && typeof node.value === 'string' &&
        !(parent?.type === 'Property' && key === 'key' && !parent.computed) &&
        !parent?.directive && !(parent?.type === 'CallExpression' && parent.callee?.name === 'fetch')) {
      const group = groups.get(node.value) || [];
      group.push({ start: node.start, end: node.end }); groups.set(node.value, group);
    }
    for (const [k, v] of Object.entries(node)) {
      if (Array.isArray(v)) v.forEach((child) => visit(child, node, k));
      else if (v && typeof v === 'object') visit(v, node, k);
    }
  };
  visit(tree);
  const call = tree.body.find((n) => n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.type === 'ArrowFunctionExpression');
  if (!call || call.expression.callee.body.type !== 'BlockStatement') return source;
  const body = call.expression.callee.body, edits = [], declarations = [];
  let serial = 0;
  for (const [value, nodes] of groups) {
    if (nodes.length < 2 || nodes.some((n) => n.start < body.start || n.end > body.end)) continue;
    let name; do { name = `_$${(serial++).toString(36)}`; } while (identifiers.has(name));
    const literal = JSON.stringify(value);
    const before = nodes.reduce((sum, n) => sum + Buffer.byteLength(source.slice(n.start, n.end)), 0);
    if (before <= Buffer.byteLength(literal) + (name.length + 2) * nodes.length + name.length + 3) continue;
    declarations.push(`${name}=${literal}`);
    nodes.forEach((n) => edits.push({ ...n, text: `(${name})` }));
  }
  if (!declarations.length) return source;
  // Insert after any directive prologue, so a local strict directive keeps its meaning.
  let insert = body.start + 1;
  for (const n of body.body) { if (!n.directive) break; insert = n.end; }
  edits.push({ start: insert, end: insert, text: `const ${declarations.join(',')};` });
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return source;
}

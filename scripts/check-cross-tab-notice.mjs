import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync('src/components/local/local-workbench-page.tsx', 'utf8');
assert.match(source, /addEventListener\('storage', notifyExternalChange\)/);
assert.match(source, /removeEventListener\('storage', notifyExternalChange\)/);
assert.match(source, /latest\.revision !== revision/);
assert.match(source, /Seus dados nesta tela foram preservados/);
assert.doesNotMatch(source.split('function notifyExternalChange')[1].split('function save')[0], /setModel\(/);
console.log('PASS static: cross-tab warning preserves local edits and cleans listener');

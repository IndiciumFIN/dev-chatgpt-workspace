import fs from 'node:fs';
import assert from 'node:assert/strict';
const r=JSON.parse(fs.readFileSync(new URL('../registers/i18n/focus-color-locale-register.v1.json',import.meta.url)));
const src=fs.readFileSync(new URL('../src/components/site/shell.tsx',import.meta.url),'utf8');
const locales=fs.readFileSync(new URL('../src/lib/locale-registry.ts',import.meta.url),'utf8');
assert.equal(Object.keys(r.colors).length,19);
for(const [locale,names] of Object.entries(r.colors)){
  assert.match(locales,new RegExp('"'+locale+'"'));
  assert.equal(names.length,4);
  assert.ok(names.every(x=>typeof x==='string' && x.trim().length>0));
}
assert.match(src,/focusColorName\(chrome\.locale, color\.id\)/);
assert.doesNotMatch(src,/Foco amarelo|Foco verde|Foco ciano|Foco magenta/);
assert.equal(r.approval,'HOLD_HUMAN');
console.log('PASS: 19 locales / 76 labels / UI binding / no automatic approval');

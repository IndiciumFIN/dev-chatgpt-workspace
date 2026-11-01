import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
const paths=[
 'contracts/entities/design-tokens.v1.json',
 'src/styles/admin-console.css',
 'src/components/admin/commander-panel.tsx',
 'scripts/check-commander-ds-boundary.mjs'
];
function fixture(change){
 const root=mkdtempSync(join(tmpdir(),'ce-ds-boundary-'));
 for(const path of paths){const to=join(root,path);mkdirSync(dirname(to),{recursive:true});cpSync(path,to)}
 change?.(root);
 const result=spawnSync(process.execPath,['scripts/check-commander-ds-boundary.mjs'],{cwd:root,encoding:'utf8',timeout:10000});
 rmSync(root,{recursive:true,force:true});
 return {code:result.status,output:result.stdout+result.stderr};
}
function change(path,fn){let s=readFileSync(path,'utf8');writeFileSync(path,fn(s))}
test('baseline is structurally valid, not a palette homologation',()=>{
 const r=fixture();assert.equal(r.code,0,r.output);
 assert.match(r.output,/DS_BLACK_WHITE_OWNER_DIRECTION_NOT_REFLECTED_IN_FROZEN_NAVY_CONTRACT/);
 assert.match(r.output,/"promotion": "HOLD_HUMAN"/);
});
test('reject local color token',()=>{
 const r=fixture(root=>change(join(root,'src/styles/admin-console.css'),s=>s+'\n.ce-admin { --color-navy: red; }\n'));
 assert.notEqual(r.code,0);assert.match(r.output,/ADMIN_OVERRIDES_GLOBAL_DS_TOKENS|ADMIN_LOCAL_DS_DEFINITIONS/);
});
test('reject local radius token',()=>{
 const r=fixture(root=>change(join(root,'src/styles/admin-console.css'),s=>s+'\n.ce-admin { --radius-panel: 40px; }\n'));
 assert.notEqual(r.code,0);assert.match(r.output,/ADMIN_LOCAL_DS_DEFINITIONS/);
});
test('reject inline component style',()=>{
 const r=fixture(root=>change(join(root,'src/components/admin/commander-panel.tsx'),s=>s+'\nconst rogue = <div style={{color: "red"}} />;\n'));
 assert.notEqual(r.code,0);assert.match(r.output,/COMMANDER_INLINE_DESIGN_OVERRIDE/);
});
test('reject literal hex in component',()=>{
 const r=fixture(root=>change(join(root,'src/components/admin/commander-panel.tsx'),s=>s+'\n// #FF0000\n'));
 assert.notEqual(r.code,0);assert.match(r.output,/COMMANDER_LITERAL_HEX_COLOR/);
});
test('reject mutated frozen contract',()=>{
 const r=fixture(root=>change(join(root,'contracts/entities/design-tokens.v1.json'),s=>s.replace('"frozen": true','"frozen": false')));
 assert.notEqual(r.code,0);assert.match(r.output,/DS_CONTRACT_NOT_FROZEN/);
});
test('reject remote call in Commander',()=>{
 const r=fixture(root=>change(join(root,'src/components/admin/commander-panel.tsx'),s=>s+'\n// fetch("/endpoint")\n'));
 assert.notEqual(r.code,0);assert.match(r.output,/COMMANDER_REMOTE_CALL/);
});

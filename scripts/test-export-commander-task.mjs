import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const run=(args)=>spawnSync(process.execPath,['scripts/export-commander-task.mjs',...args],{encoding:'utf8',timeout:10000});
test('exports only allowed WO metadata with verifiable bytes',()=>{
 const d=mkdtempSync(join(tmpdir(),'ce-export-'));
 try {
  const o=join(d,'package');const r=run(['--wo','WO-ADM-001','--out',o]);
  assert.equal(r.status,0,r.stderr);
  assert.deepEqual(readdirSync(o).sort(),['manifest.json','task.json']);
  const raw=readFileSync(join(o,'task.json')),manifest=JSON.parse(readFileSync(join(o,'manifest.json'),'utf8')),body=JSON.parse(raw);
  assert.equal(hash(raw),manifest.sha256);assert.equal(raw.length,manifest.bytes);
  assert.equal(body.workOrder.id,'WO-ADM-001');assert.equal(body.restrictions.mayPublish,false);
  assert.ok(!('evidence' in body.workOrder));assert.ok(!('owner' in body.workOrder));
  assert.equal(run(['--wo','WO-ADM-001','--out',o]).status,1,'must not overwrite output');
 }finally{rmSync(d,{recursive:true,force:true})}
});
test('rejects unknown work orders',()=>{const d=mkdtempSync(join(tmpdir(),'ce-export-'));try{assert.notEqual(run(['--wo','WO-MISSING','--out',join(d,'x')]).status,0)}finally{rmSync(d,{recursive:true,force:true})}});
test('rejects malformed ids and absent output',()=>{assert.equal(run(['--wo','../../secret','--out','x']).status,2);assert.equal(run(['--wo','WO-ADM-001']).status,2)});

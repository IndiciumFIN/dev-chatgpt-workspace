import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex');
function run(mutate){
 const dir=mkdtempSync(join(tmpdir(),'commander-ai-')),pkg=join(dir,'packet'),report=join(dir,'receipt.json');
 mkdirSync(pkg);
 try{
  const contents={'findings.json':JSON.stringify({findings:[]}), 'validation.json':JSON.stringify({workOrderId:'WO-ADM-001',status:'CANDIDATE',admission:'NOT_VERIFIED'}),'handoff.md':'# Handoff\nCandidate only; no remote execution or promotion.'};
  for(const [name,value] of Object.entries(contents))writeFileSync(join(pkg,name),value);
  const manifest={schemaVersion:'1.0.0',workOrderId:'WO-ADM-001',status:'CANDIDATE',admission:'NOT_VERIFIED',files:Object.entries(contents).map(([path,value])=>({path,sha256:hash(Buffer.from(value)),bytes:Buffer.byteLength(value)}))};
  writeFileSync(join(pkg,'delivery-manifest.json'),JSON.stringify(manifest));
  mutate?.(pkg,manifest);
  const p=spawnSync(process.execPath,['scripts/check-agent-delivery.mjs','--package',pkg,'--report',report],{encoding:'utf8',timeout:10000});
  return {exit:p.status,receipt:JSON.parse(readFileSync(report,'utf8')),stderr:p.stderr};
 }finally{rmSync(dir,{recursive:true,force:true})}
}
test('valid packet is quarantined not approved',()=>{const x=run();assert.equal(x.exit,0,x.stderr);assert.equal(x.receipt.status,'QUARANTINED');assert.equal(x.receipt.executed,false)});
test('tampered artifact rejected',()=>{const x=run(pkg=>writeFileSync(join(pkg,'handoff.md'),'changed'));assert.equal(x.exit,1);assert.match(x.receipt.errors.join(','),/HASH_MISMATCH/)});
test('undeclared extra file rejected',()=>{const x=run(pkg=>writeFileSync(join(pkg,'payload.js'),'alert(1)'));assert.equal(x.exit,1);assert.match(x.receipt.errors.join(','),/UNDECLARED_FILE/)});
test('fake admission rejected',()=>{const x=run((pkg,m)=>{m.admission='APPROVED';writeFileSync(join(pkg,'delivery-manifest.json'),JSON.stringify(m))});assert.equal(x.exit,1);assert.match(x.receipt.errors.join(','),/UNAUTHORIZED_STATUS/)});
test('unknown WO rejected',()=>{const x=run((pkg,m)=>{m.workOrderId='WO-UNKNOWN';writeFileSync(join(pkg,'delivery-manifest.json'),JSON.stringify(m))});assert.equal(x.exit,1);assert.match(x.receipt.errors.join(','),/UNKNOWN_WO/)});

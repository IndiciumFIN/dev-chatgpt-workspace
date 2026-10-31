import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const run=id=>spawnSync(process.execPath,['scripts/rehearse-commander-handoff.mjs','--wo',id],{encoding:'utf8',timeout:20000});
test('full local handoff rehearsal is verifiable and fail closed',()=>{
 const x=run('WO-ADM-001');assert.equal(x.status,0,x.stderr);
 const report=JSON.parse(x.stdout);
 assert.equal(report.status,'PASS');assert.equal(report.receiptStatus,'CANDIDATE_VERIFIED');
 assert.equal(report.execution,'FORBIDDEN');assert.equal(report.remoteDispatch,false);
 assert.match(report.taskSha256,/^[a-f0-9]{64}$/);
});
test('invalid or missing work order fails safely',()=>{
 assert.equal(run('WO-DOES-NOT-EXIST').status,1);
 assert.equal(run('../unsafe').status,2);
});

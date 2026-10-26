import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('upstream admission audit exposes prerequisites and refuses inferred admissions',()=>{
 const p=spawnSync(process.execPath,['scripts/audit-commander-upstream.mjs'],{encoding:'utf8',timeout:10000});
 assert.equal(p.status,0,p.stderr);
 const x=JSON.parse(p.stdout);
 assert.equal(x.status,'HOLD_HUMAN');
 assert.equal(x.sequence[0],'DEMAND');
 assert.ok(x.sequence.indexOf('FIND')<x.sequence.indexOf('TASK'));
 assert.ok(x.sequence.indexOf('TASK')<x.sequence.indexOf('KERNEL'));
 assert.ok(x.counts.pmoQueueEntries>0);
 assert.equal(x.gaps.length,x.counts.pmoQueueEntries);
 assert.ok(x.gaps.every(w=>w.admitted===false));
 assert.ok(x.gaps.some(w=>w.missingFormalFields.length>0));
});

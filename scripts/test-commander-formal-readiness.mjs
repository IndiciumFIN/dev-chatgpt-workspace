import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectFormalWoEvidence} from '../src/lib/commander/formal-readiness.ts';
test('PMO-only record stays unadmitted',()=>{
 const r=inspectFormalWoEvidence({id:'WO-ADM-001',status:'DONE',dependencies:[]});
 assert.equal(r.executionAllowed,false);
 assert.equal(r.admission,'NOT_VERIFIED');
 assert.ok(r.missing.includes('policySet')&&r.missing.includes('approvals'));
});
test('even complete metadata never confers Kernel admission',()=>{
 const full={objective:'x',scope:'x',approver:'owner',sourceRef:'source',policySet:['p'],riskLevel:'low',dataClassification:'internal',securityImpact:'none',environment:'dev',manifestId:'m',approvals:['signed']};
 const r=inspectFormalWoEvidence(full);
 assert.deepEqual(r.missing,[]);
 assert.equal(r.executionAllowed,false);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate,gitBlobSha} from './verify-r80-evidence-chain.mjs';
const load=()=>({
 record:JSON.parse(readFileSync('registers/governance/r80-pending-evidence-chain-20261031.v1.json','utf8')),
 r79:JSON.parse(readFileSync('registers/governance/r79-domain-wo-mapping-20261031.v1.json','utf8')),
 findRegister:JSON.parse(readFileSync('registers/governance/find-register.v1.json','utf8')),
 policy:JSON.parse(readFileSync('registers/governance/audit-policy.v1.json','utf8'))
});
test('R80: 31 evidence anchors are complete but none is admitted',()=>{
 const r=validate(load());
 assert.equal(r.candidateRows,31);
 assert.equal(r.issueSnapshots,18);
 assert.equal(r.documentsPinned,13);
 assert.equal(r.registeredFindMatches,2);
 assert.equal(r.fullyAdmitted,0);
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('R80: fake Kernel admission is rejected',()=>{
 const p=load();p.record.rows[0].governance.kernelAdmission='APPROVED';
 assert.throws(()=>validate(p),/FALSE_AUTHORITY/);
});
test('R80: policy TODO cannot become validated implicitly',()=>{
 const p=load();p.record.rows[0].policy.applicability='VALIDATED';
 assert.throws(()=>validate(p),/UNVERIFIED_POLICY_PROMOTION/);
 const q=load();q.policy.populationStatus='POPULATED';
 assert.throws(()=>validate(q),/POLICY_ACTIVATION_REQUIRES_REVIEW/);
});
test('R80: source WO and issue authority cannot be forged',()=>{
 const p=load();p.record.rows[0].governance.sourceWo='WO-PMO-001';
 assert.throws(()=>validate(p),/FALSE_AUTHORITY/);
 const q=load();q.record.rows[0].source.bodyPresent=false;
 assert.throws(()=>validate(q),/ISSUE_METADATA_MISSING/);
});
test('R80: R79 task or WO collision vetoed',()=>{
 const p=load();p.record.rows[0].proposedWo='WO-OTHER';
 assert.throws(()=>validate(p),/R79_LINK_MISMATCH/);
 const q=load();q.record.rows.pop();
 assert.throws(()=>validate(q),/R80_INCOMPLETE_ROWS/);
});
test('R80: claimed FIND must actually exist in the canonical FIND register',()=>{
 const p=load();p.record.rows[0].source.findIdsInOfficialRegister=['FIND-NOT-IN-REGISTER'];
 assert.throws(()=>validate(p),/FALSE_REGISTERED_FIND/);
});
test('R80: source document tampering fails when bytes are supplied',()=>{
 const p=load(),doc=p.record.rows.find(x=>x.sourceId==='P0-04');
 const legitimate=Buffer.from('known data');
 doc.source.blobSha=gitBlobSha(legitimate);
 assert.throws(()=>validate({...p,sourceBytes:{[doc.source.path]:Buffer.from('altered data')}}),/SOURCE_DOCUMENT_BYTES_DRIFT/);
});
test('R80: P0-04 static validator source cannot disappear or be called E2E approved',()=>{
 const p=load(),item=p.record.rows.find(x=>x.sourceId==='P0-04');
 item.validator.status='PASS_E2E';assert.throws(()=>validate(p),/P004_STATIC_AUDITOR_EVIDENCE_MISSING/);
});

test('R81: draft FIND cannot be silently promoted by changing its status',()=>{
 const x=load();
 const item=x.findRegister.finds.find(f=>f.canonical_id==='FIND-PMO-COVERAGE-20261031');
 assert.ok(item);
 item.status='ADMITTED';
 assert.throws(()=>validate(x),/FALSE_FIND_ADMISSION/);
});
test('R81: draft FIND cannot mutate production',()=>{
 const x=load();
 const item=x.findRegister.finds.find(f=>f.canonical_id==='FIND-CKO-IMPORT-ROUTE');
 item.mutation_allowed=true;
 assert.throws(()=>validate(x),/FALSE_FIND_ADMISSION/);
});
test('R81: source declaration without registered FIND fails closed',()=>{
 const x=load();
 x.findRegister.finds=x.findRegister.finds.filter(f=>f.canonical_id!=='FIND-CKO-IMPORT-ROUTE');
 assert.throws(()=>validate(x),/FALSE_REGISTERED_FIND/);
});

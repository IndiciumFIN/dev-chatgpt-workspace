import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,validate} from './verify-r85-owner-assent.mjs';
const sample=()=>structuredClone(load());
test('R85 four recommended paths recorded as conversation assent, zero formal admission',()=>{
 const r=validate(load());
 assert.equal(r.conversationRecommendationsRecorded,4);
 assert.equal(r.authenticatedDecisions,0);
 assert.equal(r.kernelAdmissions,0);
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('R85 must reproduce actual word and not invent message ID or timestamp',()=>{
 const x=sample();x.assent.decisionSource.verbatim='signed and approved';assert.throws(()=>validate(x),/ASSENT_QUOTE_DRIFT/);
 const y=sample();y.assent.decisionSource.sourceMessageId='made-up';assert.throws(()=>validate(y),/INVENTED_MESSAGE_ID/);
 const z=sample();z.assent.timePrecision='EXACT_SECOND';assert.throws(()=>validate(z),/INVENTED_MESSAGE_TIMESTAMP/);
});
test('R85 rejects altered Git blob sources and fake original R84 signatures',()=>{
 const x=sample();x.pinnedBytes.intake=Buffer.from('tampered');assert.throws(()=>validate(x),/SOURCE_BLOB_DRIFT/);
 const y=sample();y.intake.decisions[0].selection='KEEP_REV18_PENDING_KERNEL';assert.throws(()=>validate(y),/R84_MUTATED_SELECTION/);
});
test('R85 original generic approval cannot substitute for verified authority',()=>{
 const x=sample();x.assent.decisionSource.identityVerification='PASS';assert.throws(()=>validate(x),/FALSE_IDENTITY/);
 const y=sample();y.priorApproval.decision='APPROVED_PRODUCTION';assert.throws(()=>validate(y),/OLD_APPROVAL_SCOPE_DRIFT/);
});
test('R85 user declaration does not authorize election or merge',()=>{
 const x=sample();x.assent.outcome.canonicalRevisionElected=true;assert.throws(()=>validate(x),/UNAUTHORIZED_ACTION/);
 const y=sample();y.assent.outcome.mergesAuthorized=true;assert.throws(()=>validate(y),/UNAUTHORIZED_ACTION/);
});
test('R85 only the four recommended choices can be recorded under this statement',()=>{
 const x=sample();x.assent.choices[0].selectedCode='PROPOSE_ANOTHER_BASELINE';assert.throws(()=>validate(x),/UNSUPPORTED_OWNER_CHOICE/);
 const y=sample();y.assent.choices.pop();assert.throws(()=>validate(y),/DECISION_COUNT_DRIFT/);
});
test('R85 checker and Kernel gates remain unverified',()=>{
 const x=sample();x.assent.choices[1].checkerDecision='PASS';assert.throws(()=>validate(x),/FAKE_CHECKER/);
 const y=sample();y.assent.outcome.kernelAdmissionsVerified=1;assert.throws(()=>validate(y),/FALSE_COMPLETION/);
});
test('R85 may not activate Commander remote calls or clinical release',()=>{
 const x=sample();x.assent.outcome.commander.scope='EXTERNAL_EXECUTION';assert.throws(()=>validate(x),/COMMANDER_SCOPE_BYPASS/);
 const y=sample();y.assent.outcome.cko.statusBaseline='IN_PROGRESS';assert.throws(()=>validate(y),/CKO_CLINICAL_APPROVAL/);
});
test('R85 additional WOs stay candidates and event count must remain zero',()=>{
 const x=sample();x.assent.outcome.additionalWos.admittedCount=2;assert.throws(()=>validate(x),/NEW_WOS_ADMITTED/);
 const y=sample();y.assent.outcome.eventsReplayed=8;assert.throws(()=>validate(y),/FALSE_COMPLETION/);
});

#!/usr/bin/env node
/** R81: deny false promotion of original-archive security FIND.
 * CI can verify candidate dossier against pinned historical W11; ZIP itself
 * was read-only scanned through authenticated Drive access outside CI.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const SHA='5cf346be3e823b192395ad898a7798b6375b23077714353d2817a8697fe59f47';
const ID='FIND-SPE-RPC-ANSWER-EXPOSURE-20261031';
const expected={
 '0024_api_functions.sql':'471c7cdab35b904a84dfc66f431daa831ec72c702b1134a7dce07e96815f46d8',
 '0031_cms_working_copies_option_lifecycle.sql':'a61a54a9d5fd98ddc918f73ca429cc6557e96384a4d5d57245d293dc8d0bed0a',
 '0038_api_assessment_runtime.sql':'7dddd92f3deaed898aed1cde47a2d5c940824a7cd7e5e671230ddfd2190bc638'
};
export function validate({findingRegister,report,r80,w11}){
 const find=findingRegister?.finds?.find(x=>x.canonical_id===ID);
 assert(find,'R81_FIND_MISSING');
 assert.equal(findingRegister.finds.filter(x=>x.canonical_id===ID).length,1,'DUPLICATE_P004_FIND');
 assert.equal(find.status,'DRAFT_FOR_GOVERNED_REVIEW','UNAUTHORIZED_FIND_STATUS');
 assert.equal(find.work_order,'NOT_ADMITTED','UNAUTHORIZED_WO');
 assert.equal(find.mutation_allowed,false,'UNAUTHORIZED_MUTATION');
 assert.equal(find.policy_ref,'PENDING_APPLICABILITY_REVIEW','UNVERIFIED_POLICY');
 assert.equal(find.validator_ref,'PENDING_ADMISSION','UNVERIFIED_VALIDATOR');
 assert.deepEqual(find.remediation_task_refs,['TASK-PLAN-080','TASK-PLAN-034']);
 assert.equal(report?.artifactType,'SOURCE_ARCHIVE_STATIC_REPRODUCTION','UNVERIFIED_REPORT');
 assert.equal(report.source?.archiveSha256,SHA,'SOURCE_CHECKSUM_DRIFT');
 assert.equal(report.source?.zipCrc,'PASS','SOURCE_ARCHIVE_BAD_CRC');
 assert.equal(report.source?.redistributedToPublicRepository,false,'ORIGINAL_ZIP_PUBLICATION');
 assert.equal(report.inventory?.originalMigrationFiles,47,'MIGRATION_COUNT_DRIFT');
 assert.equal(report.inventory?.sequenceComplete,true,'MIGRATION_ORDER_NOT_PROVEN');
 assert.equal(report.inventory?.originalDatabaseTestFiles,17,'DATABASE_TEST_COUNT_DRIFT');
 assert.equal(report.inventory?.migrationExecuted,0,'FALSE_SQL_EXECUTION');
 assert.equal(report.inventory?.databaseTestsExecuted,0,'FALSE_PGTAP_EXECUTION');
 assert.equal(report.check?.riskObserved,'PUBLIC_GRADING_ANSWER_EXPOSURE_STATIC','FIND_RISK_NOT_CLASSIFIED');
 assert.equal(report.reviewMode,'READ_ONLY_NO_DB_EXECUTION','DATABASE_WRITE_NOT_AUTHORIZED');
 assert.equal(report.migrations?.length,3,'INCOMPLETE_RPC_MIGRATIONS');
 const seen=new Set();
 for (const m of report.migrations){
   assert(Object.hasOwn(expected,m.file),'UNEXPECTED_MIGRATION');
   assert(!seen.has(m.file),'DUPLICATE_MIGRATION');
   seen.add(m.file);
   assert.equal(m.sha256,expected[m.file],'MIGRATION_SHA_DRIFT');
   assert.equal(m.hasRpc,true,'RPC_MISSING');
   assert.deepEqual(m.executeGrantedTo,['anon','authenticated'],'PUBLIC_ROLE_GRANT_NOT_REPRODUCED');
   assert.equal(m.staticExposure,true,'FALSE_STATIC_NEGATIVE');
   if(m.file.startsWith('0038'))assert.equal(m.callsEvaluateQuestion,true,'CONSUMER_CHAIN_MISSING');
   else assert.equal(m.containsCorrectOptionIds,true,'ANSWER_EXPOSURE_MISSING');
 }
 assert.equal(report.traceability?.existingTask,'TASK-PLAN-080','TASK_NOT_MATCHED');
 assert.equal(report.traceability?.workOrderCandidate,'WO-SEC-001','WO_NOT_MATCHED');
 assert.equal(report.release?.status,'HOLD_HUMAN','FALSE_RELEASE_GATE');
 assert.equal(report.release?.kernelAdmission,'NOT_VERIFIED','UNAUTHORIZED_KERNEL');
 for (const key of ['postgresqlDisposableReplay','anonAuthenticatedDirectRpcTests']) assert.equal(report.release?.[key],'NOT_RUN','FALSE_E2E_SUCCESS');
 assert.equal(report.release?.mergeOrDeployAllowed,false,'UNAUTHORIZED_DEPLOY');
 const r80row=r80?.rows?.find(x=>x.sourceId==='P0-04');
 assert(r80row && r80row.relatedSecurityFindCandidate===ID,'MISSING_R80_FIND_MAPPING');
 assert.equal(r80.r81OriginalArchive?.sourceSha256,SHA,'R80_SOURCE_DRIFT');
 assert.equal(r80.r81OriginalArchive?.dbApply,'NOT_RUN','R80_FALSE_DB_EXECUTION');
 assert.equal(r80.releaseGate,'HOLD_HUMAN','R80_RELEASE_GATE');
 assert.equal(w11?.original_zip_sha256,SHA,'W11_ARCHIVE_MISMATCH');
 assert.equal(w11.checks?.migration_files,47,'W11_MIGRATION_MISMATCH');
 assert.equal(w11.checks?.database_test_files,17,'W11_PGTAP_MISMATCH');
 for(const key of ['migration_apply','pgtap_runtime','security_e2e'])assert.equal(w11.execution?.[key],'NOT_RUN','W11_FALSE_RUNTIME');
 return {originalMigrationFiles:47,originalDatabaseTestFiles:17,staticExposureMigrations:seen.size,candidateFIND:ID,admitted:false,releaseGate:'HOLD_HUMAN'};
}
export function load(root,speRoot){
 const read=(base,p)=>JSON.parse(readFileSync(join(base,p),'utf8'));
 const findingRegister=read(root,'registers/governance/find-register.v1.json');
 const report=read(root,'registers/governance/r81-simulados-original-rpc-static-20261031.v1.json');
 const r80=read(root,'registers/governance/r80-pending-evidence-chain-20261031.v1.json');
 const w11=read(speRoot,'docs/simulados-enfermagem/W11_EXECUTION_EVIDENCE_v0.1.0.json');
 return {findingRegister,report,r80,w11};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=resolve(process.argv[2]??'.'),speRoot=resolve(process.argv[3]??'.');
 const result=validate(load(root,speRoot));
 console.log('[R81-original-rpc] PASS '+JSON.stringify(result));
 console.log('[R81-original-rpc] STATIC ONLY; actual source ZIP remains outside CI, PostgreSQL test NOT_RUN');
}

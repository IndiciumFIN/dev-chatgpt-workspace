import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from './check-r81-original-rpc-find.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const load=()=>({
 findingRegister:read('registers/governance/find-register.v1.json'),
 report:read('registers/governance/r81-simulados-original-rpc-static-20261031.v1.json'),
 r80:read('registers/governance/r80-pending-evidence-chain-20261031.v1.json'),
 w11:{original_zip_sha256:'5cf346be3e823b192395ad898a7798b6375b23077714353d2817a8697fe59f47',
  checks:{migration_files:47,database_test_files:17},
  execution:{migration_apply:'NOT_RUN',pgtap_runtime:'NOT_RUN',security_e2e:'NOT_RUN'}}
});
const find=x=>x.findingRegister.finds.find(f=>f.canonical_id==='FIND-SPE-RPC-ANSWER-EXPOSURE-20261031');
test('R81 original ZIP evidence is a documented static finding, not an approval',()=>{
 const r=validate(load());assert.equal(r.staticExposureMigrations,3);assert.equal(r.admitted,false);assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('R81 cannot elevate FIND or work order or mutation flag',()=>{
 let a=load();find(a).status='ADMITTED';assert.throws(()=>validate(a),/UNAUTHORIZED_FIND_STATUS/);
 a=load();find(a).work_order='WO-SEC-001';assert.throws(()=>validate(a),/UNAUTHORIZED_WO/);
 a=load();find(a).mutation_allowed=true;assert.throws(()=>validate(a),/UNAUTHORIZED_MUTATION/);
});
test('R81 rejects lost, changed or duplicated migration evidence',()=>{
 let a=load();a.report.migrations.pop();assert.throws(()=>validate(a),/INCOMPLETE_RPC_MIGRATIONS/);
 a=load();a.report.migrations[1].sha256='a'.repeat(64);assert.throws(()=>validate(a),/MIGRATION_SHA_DRIFT/);
 a=load();a.report.migrations[2].callsEvaluateQuestion=false;assert.throws(()=>validate(a),/CONSUMER_CHAIN_MISSING/);
});
test('R81 cannot claim live PostgreSQL or security E2E',()=>{
 let a=load();a.report.inventory.migrationExecuted=47;assert.throws(()=>validate(a),/FALSE_SQL_EXECUTION/);
 a=load();a.report.release.postgresqlDisposableReplay='PASS';assert.throws(()=>validate(a),/FALSE_E2E_SUCCESS/);
 a=load();a.w11.execution.security_e2e='PASS';assert.throws(()=>validate(a),/W11_FALSE_RUNTIME/);
});
test('R81 ZIP checksum and historical W11 must agree',()=>{
 let a=load();a.report.source.archiveSha256='0'.repeat(64);assert.throws(()=>validate(a),/SOURCE_CHECKSUM_DRIFT/);
 a=load();a.w11.original_zip_sha256='0'.repeat(64);assert.throws(()=>validate(a),/W11_ARCHIVE_MISMATCH/);
});
test('R81 prevents source re-distribution or unauthorized deployment',()=>{
 let a=load();a.report.source.redistributedToPublicRepository=true;assert.throws(()=>validate(a),/ORIGINAL_ZIP_PUBLICATION/);
 a=load();a.report.release.mergeOrDeployAllowed=true;assert.throws(()=>validate(a),/UNAUTHORIZED_DEPLOY/);
});
test('R81 must retain the link to P0-04 evidence row',()=>{
 const a=load();a.r80.rows.find(x=>x.sourceId==='P0-04').relatedSecurityFindCandidate='UNRELATED';
 assert.throws(()=>validate(a),/MISSING_R80_FIND_MAPPING/);
});

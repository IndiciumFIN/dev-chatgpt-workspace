import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const base=readFileSync('migrations/candidates/20261026_governed_admin_bulk_import.sql','utf8');
const reconciled=readFileSync('migrations/candidates/20261026_governed_import_reconciliation.sql','utf8');
const receipt=readFileSync('migrations/candidates/20261026_import_read_evidence_receipts.sql','utf8');
const h=(c:string)=>c.repeat(64);
const runId='00000000-0000-4000-8000-000000000001';
const nonce1='10000000-0000-4000-8000-000000000001';
const nonce2='10000000-0000-4000-8000-000000000002';
const put=(nonce:string,source=h('b'),snapshot='snapshot-1')=>
 "insert into cko_staging.import_read_evidence_receipts"+
 "(import_package_id,reconciliation_id,actor_ref,request_nonce,policy_decision_ref,"+
 "policy_bundle_sha256,source_sha256,mapping_sha256,comparison_sha256,catalog_snapshot_ref)"+
 " values('P1','"+runId+"','trusted-actor','"+nonce+"','OPA-DECISION-1','"+
 h('c')+"','"+source+"','"+h('d')+"','"+h('e')+"','"+snapshot+"');";
describe('candidate OPA/PG reconciliation evidence — isolated PostgreSQL only',()=>{
 it('applies FK/RLS and denies tampered snapshots, hash and history updates',{timeout:45000},async()=>{
  const db=new PGlite();
  try{
   await db.exec([
    'create role anon nologin','create role authenticated nologin',
    'create schema cko_staging','create schema cko_validation',
    'create schema cko_governance','create schema cko_evidence',
    'create table cko_staging.import_packages(import_package_id text primary key)',
    'create table cko_validation.validators(validator_id text primary key)',
    'create table cko_governance.decisions(decision_id text primary key)',
    'create table cko_evidence.evidence_bundles(evidence_bundle_id text primary key)',
   ].join(';')+';');
   await db.exec(base);
   await db.exec(reconciled);
   await db.exec(receipt);
   await db.exec("insert into cko_staging.import_profile_versions(profile_ref,profile_version,destination_schema,destination_table,contract_sha256,fields) values('sources','v1','cko_evidence','sources',repeat('a',64),'[\"source_id\"]');");
   await db.exec("insert into cko_staging.import_packages(import_package_id) values('P1');");
   await db.exec("insert into cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version,original_sha256,source_format) values('P1','sources','v1',repeat('b',64),'csv');");
   await db.exec("insert into cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id,profile_ref,profile_version,lookup_state,catalog_snapshot_ref,catalog_captured_at,completed_at) values('"+runId+"','P1','sources','v1','LOOKUP_COMPLETE_UNATTESTED','snapshot-1',now(),now());");
   const checks=await db.query<{relrowsecurity:boolean;relforcerowsecurity:boolean;anon_select:boolean}>(
    "select c.relrowsecurity,c.relforcerowsecurity,has_table_privilege('anon',c.oid,'SELECT') anon_select from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='cko_staging' and c.relname='import_read_evidence_receipts'"
   );
   assert.deepEqual(checks.rows,[{relrowsecurity:true,relforcerowsecurity:true,anon_select:false}]);
   await db.exec(put(nonce1));
   await assert.rejects(db.exec(put(nonce2,h('f'))),/does not match/);
   await assert.rejects(db.exec(put(nonce2,h('b'),'other-snapshot')) ,/does not match/);
   await assert.rejects(db.exec(put(nonce1)),/duplicate key/i);
   await assert.rejects(db.exec("update cko_staging.import_read_evidence_receipts set policy_decision_ref='FAKE'"),/append-only/i);
   await assert.rejects(db.exec("delete from cko_staging.import_read_evidence_receipts"),/append-only/i);
  }finally{await db.close();}
 });
});

import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const base=readFileSync('migrations/candidates/20261026_governed_admin_bulk_import.sql','utf8');
const changes=readFileSync('migrations/candidates/20261026_governed_import_reconciliation.sql','utf8');
const schemas=[
 'create role anon nologin',
 'create role authenticated nologin',
 'create schema cko_staging',
 'create schema cko_validation',
 'create schema cko_governance',
 'create schema cko_evidence',
 'create table cko_staging.import_packages(import_package_id text primary key)',
 'create table cko_validation.validators(validator_id text primary key)',
 'create table cko_governance.decisions(decision_id text primary key)',
 'create table cko_evidence.evidence_bundles(evidence_bundle_id text primary key)',
].join(';')+';';
describe('import reconciliation SQL — isolated PGlite',()=>{
 it('migrates with RLS, FKs, append-only history; rejects cross-package rows', {timeout:45000}, async()=>{
   const db=new PGlite();
   try {
     await db.exec(schemas);
     await db.exec(base);
     await db.exec(changes);
     const targets=['import_reconciliation_runs','import_reconciliation_rows','import_lifecycle_events'];
     const rows=await db.query<{relname:string;relrowsecurity:boolean;relforcerowsecurity:boolean}>(
       "select c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='cko_staging' and c.relname in ('import_reconciliation_runs','import_reconciliation_rows','import_lifecycle_events')"
     );
     assert.equal(rows.rows.length,targets.length);
     assert.ok(rows.rows.every(x=>x.relrowsecurity&&x.relforcerowsecurity));
     await db.exec("insert into cko_staging.import_profile_versions(profile_ref,profile_version,destination_schema,destination_table,contract_sha256,fields) values('sources','v1','cko_evidence','sources',repeat('a',64),'[\"source_id\"]');");
     await db.exec("insert into cko_staging.import_packages(import_package_id) values('P1'),('P2');");
     await db.exec("insert into cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version,original_sha256,source_format) values('P1','sources','v1',repeat('b',64),'csv'),('P2','sources','v1',repeat('c',64),'csv');");
     await db.exec("insert into cko_staging.import_chunks(import_package_id,chunk_index,first_row,last_row,chunk_sha256) values('P1',0,1,1,repeat('d',64));");
     await db.exec("insert into cko_staging.import_row_candidates(import_package_id,chunk_index,row_number,row_sha256,profile_ref,profile_version,candidate_payload) values('P1',0,1,repeat('e',64),'sources','v1','{}');");
     await db.exec("insert into cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id,profile_ref,profile_version,lookup_state) values('00000000-0000-4000-8000-000000000001','P1','sources','v1','NOT_RUN');");
     await assert.rejects(db.exec("insert into cko_staging.import_reconciliation_rows(reconciliation_id,import_package_id,row_number,classification) values('00000000-0000-4000-8000-000000000001','P1',1,'NEW_CANDIDATE')"),/requires complete lookup/i);
     await db.exec("insert into cko_staging.import_reconciliation_rows(reconciliation_id,import_package_id,row_number,classification) values('00000000-0000-4000-8000-000000000001','P1',1,'HOLD_NO_CATALOG');");
     await db.exec("insert into cko_staging.import_lifecycle_events(import_package_id,reconciliation_id,event_type,actor_ref,event_evidence_ref) values('P1','00000000-0000-4000-8000-000000000001','RECONCILED','tester','evidence://test');");
     await assert.rejects(db.exec("update cko_staging.import_reconciliation_rows set classification='NEW_CANDIDATE' where row_number=1"),/append-only/);
     await assert.rejects(db.exec("delete from cko_staging.import_lifecycle_events"),/append-only/);
     await db.exec("insert into cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id,profile_ref,profile_version,lookup_state) values('00000000-0000-4000-8000-000000000002','P2','sources','v1','NOT_RUN');");
     await assert.rejects(db.exec("insert into cko_staging.import_reconciliation_rows(reconciliation_id,import_package_id,row_number,classification) values('00000000-0000-4000-8000-000000000002','P1',1,'NEW_CANDIDATE')"),/foreign key/i);
     await assert.rejects(db.exec("insert into cko_staging.import_reconciliation_runs(import_package_id,profile_ref,profile_version,lookup_state) values('P1','sources','v1','LOOKUP_COMPLETE_UNATTESTED')"),/check constraint/i);
   } finally {await db.close();}
 });
});

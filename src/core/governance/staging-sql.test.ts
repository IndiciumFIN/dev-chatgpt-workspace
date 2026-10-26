import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const migration=readFileSync('migrations/candidates/20261026_governed_admin_bulk_import.sql','utf8');
const setup=String.raw`
create role anon nologin;
create role authenticated nologin;
create schema cko_staging;
create schema cko_validation;
create schema cko_governance;
create schema cko_evidence;
create table cko_staging.import_packages(import_package_id text primary key);
create table cko_validation.validators(validator_id text primary key);
create table cko_governance.decisions(decision_id text primary key);
create table cko_evidence.evidence_bundles(evidence_bundle_id text primary key);
`;

describe('staging import migration — in-memory PostgreSQL only',()=>{
 it('creates seven unique private tables and the expected foreign keys',async()=>{
   const db=new PGlite();
   try{
     await db.exec(setup);
     await db.exec(migration);
     const tables=await db.query<{relname:string;relrowsecurity:boolean;relforcerowsecurity:boolean}>(
       "select c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='cko_staging' and c.relkind='r' and c.relname like 'import_%' order by c.relname"
     );
     const children=tables.rows.filter(x=>x.relname!=='import_packages');
     assert.equal(children.length,7);
     assert.ok(children.every(x=>x.relrowsecurity && x.relforcerowsecurity));
     const fk=await db.query<{n:number}>("select count(*)::int as n from pg_constraint co join pg_class c on c.oid=co.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='cko_staging' and co.contype='f'");
     assert.ok(fk.rows[0].n>=9,'expected cross-schema source and stage foreign keys');
     await db.exec("insert into cko_staging.import_profile_versions(profile_ref,profile_version,destination_schema,destination_table,contract_sha256,fields) values('sources','v1','cko_evidence','sources',repeat('a',64),'[\"source_id\"]');");
     await db.exec("insert into cko_staging.import_packages(import_package_id) values('P1');");
     await db.exec("insert into cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version,original_sha256,source_format) values('P1','sources','v1',repeat('b',64),'csv');");
     await assert.rejects(db.exec("insert into cko_staging.import_column_mappings(import_package_id,profile_ref,profile_version,destination_field,source_column) values('P1','sources','WRONG','source_id','id');"),/foreign key/i);
   }finally{await db.close();}
 },{timeout:45000});
});

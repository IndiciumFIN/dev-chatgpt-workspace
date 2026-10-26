import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const candidate=readFileSync('migrations/candidates/20261026_import_readonly_role.sql','utf8');
const schema=String.raw`
create schema cko_evidence;
create schema cko_orch;
create schema cko_validation;
create table cko_evidence.sources(
 source_id text,source_type text,title text,publisher text,official_uri text,
 host text,jurisdiction text,authority_level text,accreditation_status text,
 accepted_for jsonb,review_due date,attributes jsonb,created_at timestamptz,
 restricted_secret text
);
create table cko_orch.policy_registry(
 policy_id text,version text,category text,description text,
 severity_on_violation text,action_on_violation text,rule_json jsonb,
 active boolean,created_at timestamptz
);
create table cko_validation.validators(
 validator_id text,name text,domain text,version text,blocking boolean,
 input_types jsonb,requirements jsonb,severity_policy jsonb,
 owner_function text,status text,current_version_ref text
);
create table cko_orch.unrelated_protected_records(id text);
insert into cko_evidence.sources(source_id,title,restricted_secret)
 values('S1','Source','DO_NOT_REVEAL');
`;
describe('candidate read-only database role — isolated PostgreSQL',()=>{
 it('grants only allowlisted field reads; forbids writes and unrelated objects',{timeout:45000},async()=>{
   const db=new PGlite();
   try{
     await db.exec(schema);
     await db.exec(candidate);
     const state=await db.query<{
       rolname:string;rolcanlogin:boolean;rolsuper:boolean;
       rolcreatedb:boolean;rolcreaterole:boolean;rolbypassrls:boolean;
     }>("select rolname,rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls from pg_roles where rolname='cko_import_reader'");
     assert.equal(state.rows.length,1);
     const role=state.rows[0];
     assert.equal(role.rolcanlogin,true);
     assert.equal(role.rolsuper,false);
     assert.equal(role.rolcreatedb,false);
     assert.equal(role.rolcreaterole,false);
     assert.equal(role.rolbypassrls,false);
     await db.exec('SET ROLE cko_import_reader');
     assert.equal((await db.query<{role_name:string}>('select current_user::text as role_name')).rows[0].role_name,'cko_import_reader');
     assert.deepEqual((await db.query<{source_id:string}>('select source_id from cko_evidence.sources')).rows,[{source_id:'S1'}]);
     await assert.rejects(db.query('select restricted_secret from cko_evidence.sources'),/permission denied/i);
     await assert.rejects(db.query('select * from cko_orch.unrelated_protected_records'),/permission denied/i);
     await assert.rejects(db.exec("insert into cko_evidence.sources(source_id) values('S2')"),/permission denied|read-only/i);
     await assert.rejects(db.exec('create table cko_orch.unauthorized(id text)'),/permission denied|read-only/i);
     await db.exec('RESET ROLE');
   }finally{await db.close();}
 });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {auditMigrationSources,assertRelease} from './migration-preflight.mjs';
function fixture(rows,fn){
 const root=mkdtempSync(join(tmpdir(),'migration-test-'));
 try{
  for(const [f,data] of Object.entries(rows)){mkdirSync(dirname(join(root,f)),{recursive:true});writeFileSync(join(root,f),data);}
  fn(auditMigrationSources(root));
 }finally{rmSync(root,{recursive:true,force:true});}
}
test('exact duplicate SQL and basename are quarantined before DB connection',()=>{
 fixture({'0001_auth.sql':'create table t(id int);','auth/0001_auth.sql':'create table t(id int);'},x=>{
  assert.equal(x.activeCount,1);assert.equal(x.candidateCount,1);
  assert.equal(x.duplicateBytes.length,1);assert.equal(x.duplicateNames.length,1);
  assert.throws(()=>assertRelease(x,{},'postgres://u:p@db.example.org/db'),/HOLD_SOURCE_DUPLICATION/);
 });
});
test('same name with different content also blocked',()=>{
 fixture({'0001_a.sql':'select 1;','candidates/0001_a.sql':'select 2;'},x=>{
  assert.equal(x.duplicateNames.length,1);
  assert.equal(x.duplicateBytes.length,0);
  assert.ok(x.holds.includes('DUPLICATE_SQL'));
 });
});
test('sequence gap is a hold, not a falsely green migration plan',()=>{
 fixture({'0001_a.sql':'select 1;','0003_b.sql':'select 3;'},x=>assert.deepEqual(x.gaps,[2]));
});
test('human, hash and database host are independent mandatory gates',()=>{
 fixture({'0001_a.sql':'select 1;'},x=>{
  assert.deepEqual(x.holds,[]);
  assert.throws(()=>assertRelease(x,{},'postgres://u:p@db.example.org/db'),/HOLD_HUMAN/);
  const e={CE_MIGRATION_HUMAN_RELEASE:'APPROVED',CE_MIGRATION_WO_ID:'WO_CE_20261115',CE_MIGRATION_PLAN_SHA256:x.planSha256,CE_MIGRATION_EXPECTED_HOST:'db.example.org'};
  assert.equal(assertRelease(x,e,'postgres://u:p@db.example.org/db').host,'db.example.org');
  assert.throws(()=>assertRelease(x,{...e,CE_MIGRATION_PLAN_SHA256:'bad'},'postgres://u:p@db.example.org/db'),/HASH_DRIFT/);
  assert.throws(()=>assertRelease(x,{...e,CE_MIGRATION_EXPECTED_HOST:'wrong.org'},'postgres://u:p@db.example.org/db'),/TARGET_IDENTITY/);
  assert.throws(()=>assertRelease(x,{...e,CE_MIGRATION_EXPECTED_HOST:'db.project.supabase.co'},'postgres://u:p@db.project.supabase.co/db'),/SEPARATE_MIGRATOR/);
 });
});
test('current repository inventory exposes auth SQL overlap and holds execution',()=>{
 const x=auditMigrationSources();
 assert.ok(x.activeCount>=58);
 assert.ok(x.candidateCount>=10);
 assert.ok(x.duplicateNames.some(v=>v.key==='0001_auth.sql'));
 assert.ok(x.duplicateBytes.length>=1);
 assert.ok(x.holds.includes('DUPLICATE_SQL'));
});

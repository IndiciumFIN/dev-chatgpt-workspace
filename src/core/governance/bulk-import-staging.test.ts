import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ddl=readFileSync('migrations/candidates/20261026_governed_admin_bulk_import.sql','utf8');
const ui=readFileSync('src/components/admin/admin-bulk-import.tsx','utf8');
const moduleTree=readFileSync('src/lib/admin-module-registry.ts','utf8');
const sources=[
 'import_profile_versions','import_package_contracts','import_column_mappings','import_chunks',
 'import_row_candidates','import_row_findings','import_review_events'
];
describe('candidate import staging and admin entry — fail closed',()=>{
 it('reuses CKO staging package registry rather than creating a duplicate',()=>{
  assert.match(ddl,/references cko_staging\.import_packages\(import_package_id\)/);
  assert.equal([...ddl.matchAll(/create table cko_staging\.(\w+)/g)].length,7,'exactly seven tables');
  assert.equal([...ddl.matchAll(/^commit;$/gm)].length,1,'one atomic transaction');
  assert.match(ddl,/references cko_staging\.import_package_contracts\(import_package_id,profile_ref,profile_version\)/);
  assert.ok(!ddl.includes('create table cko_staging.import_packages'));
 });
 it('declares RLS and denies public, anonymous and authenticated direct access',()=>{
  for(const t of sources){
   assert.ok(ddl.includes('create table cko_staging.'+t+' ('),t);
   assert.ok(ddl.includes('alter table cko_staging.'+t+' enable row level security'),t);
   assert.ok(ddl.includes('alter table cko_staging.'+t+' force row level security'),t);
  }
  assert.match(ddl,/from public, anon, authenticated/);
  assert.ok(!/\bgrant\s+(select|update|insert|delete|all)\b/i.test(ddl));
 });
 it('does not create agent grants or bypass Kernel',()=>{
  assert.match(ddl,/PROPOSE_FOR_WO/);
  assert.match(ddl,/human_decision_ref is not null and evidence_bundle_id is not null/);
  assert.ok(!/\bdrop\s+table\b/i.test(ddl));
  assert.ok(!/security definer/i.test(ddl));
 });
 it('offers single-source module navigation and forbids direct writes in UI',()=>{
  assert.match(moduleTree,/Importação em lote/);
  assert.match(ui,/parseBulkImport/);
  assert.match(ui,/reviewBulkImport/);
  assert.match(ui,/CKO_STAGING_IMPORT_CANDIDATE/);
  assert.match(ui,/has_remote_write:false/);
  assert.ok(!/\bfetch\s*\(/.test(ui));
  assert.ok(!/\.from\(.+\)\.(insert|upsert|delete|update)/.test(ui));
 });
});

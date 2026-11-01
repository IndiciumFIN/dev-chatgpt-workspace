import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../scripts/ce-reconcile-supabase-catalog.mjs';

const catalog = () => ({
  schema_version:'ce-db-catalog.v1',
  observed_at_utc:'2026-11-01T19:00:00Z',
  database_name:'testdb',
  method:'PG_CATALOG_METADATA_ONLY_READ_ONLY',
  schemas:['cko_governance'],
  tables:[{schema:'cko_governance',name:'decisions',kind:'r',rls_enabled:true}],
  columns:[{schema:'cko_governance',table:'decisions',column:'id',type:'text'}],
  constraints:[],policies:[],functions:[],
});
const registry = () => ({
  scope:'CE_PUBLIC_BACKUP_ONLY',approval_state:'HOLD_HUMAN',
  existing_reused:[{table:'cko_governance.decisions'},{table:'cko_orch.policy_registry'}],
  candidates:[{table:'cko_orch.work_order_admission_requests'}],
});
const migrations = () => ({
  migrationFiles:2,collidingNumbers:1,collisions:[{number:'0040'}],
});

test('reports only inventory, never approval or kernel admission',()=>{
  const r=reconcile(catalog(),registry(),migrations());
  assert.equal(r.assessment.status,'INVENTORIED_ONLY');
  assert.equal(r.assessment.releaseGate,'HOLD_HUMAN');
  assert.equal(r.assessment.kernelAdmission,false);
  assert.equal(r.assessment.authorizationToWrite,false);
  assert.deepEqual(r.migrations.localCollisionNumbers,['0040']);
});
test('identifies reused references missing without inventing migrations',()=>{
  const r=reconcile(catalog(),registry(),migrations());
  assert.deepEqual(r.comparison.reusedMissingOrRenamed,['cko_orch.policy_registry']);
  assert.deepEqual(r.comparison.candidatesNotFoundInRemote,['cko_orch.work_order_admission_requests']);
  assert.equal(r.migrations.appliedRemoteHistory,'NOT_VERIFIED');
});
test('does not equate the application PGLite index with remote Supabase',()=>{
  const r=reconcile(catalog(),registry(),migrations(),['user','decisions']);
  assert.equal(r.comparison.localAppIndexNames,2);
  assert.deepEqual(r.comparison.localAppNamesAlsoInRemote,['cko_governance.decisions']);
  assert.match(r.comparison.note,/NOT drift/);
});
test('fails closed on missing metadata and invalid tables',()=>{
  assert.throws(()=>reconcile({},registry(),migrations()),/fail closed/);
  const invalid=catalog();invalid.tables=[{schema:'public',name:'example'}];
  assert.throws(()=>reconcile(invalid,registry(),migrations()),/fail closed/);
});

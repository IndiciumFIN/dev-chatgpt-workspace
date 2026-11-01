import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('migrations/candidates/20261026_governance_kernel_opa_agents.sql','utf8');
const rego=readFileSync('contracts/cko-governance/opa/kernel_admission.rego','utf8');
const kernel=readFileSync('src/core/governance/kernel.ts','utf8');
const agent=readFileSync('src/core/governance/agent-authorization.ts','utf8');
const tables=[
 'cko_orch.work_order_admission_requests',
 'cko_orch.work_order_policy_bindings',
 'cko_orch.policy_bundle_artifacts',
 'cko_orch.work_order_policy_evaluations',
 'cko_orch.work_order_required_validators',
 'cko_orch.work_order_validator_results',
 'cko_orch.kernel_admission_decisions',
 'cko_governance.agent_tool_scopes',
];
test('eight candidate structural tables have primary keys and RLS',()=>{
 for(const table of tables){
  assert.match(sql,new RegExp('create table '+table.replaceAll('.','\\.')+' \\('));
  assert.match(sql,new RegExp('alter table '+table.replaceAll('.','\\.')+' enable row level security'));
  assert.match(sql,new RegExp('alter table '+table.replaceAll('.','\\.')+' force row level security'));
 }
 assert.equal([...sql.matchAll(/create table cko_(?:orch|governance)\./g)].length,tables.length);
 assert.equal([...sql.matchAll(/primary key(?:\s*\(|\s)/g)].length,tables.length);
});
test('all existing structural sources are foreign keyed, no new master registries',()=>{
 for(const table of [
 'cko_orch.workflow_instances','cko_orch.policy_registry',
 'cko_validation.findings','cko_validation.validators',
 'cko_governance.decisions','cko_governance.agent_registry',
 'cko_evidence.evidence_bundles',
 ])assert.ok(sql.includes('references '+table+'('),table+' missing FK');
 assert.ok(!sql.includes('create table cko_orch.policy_registry'));
 assert.ok(!sql.includes('create table cko_governance.agent_registry'));
});
test('no privilege escalation or destructive DDL in candidate',()=>{
 assert.ok(sql.includes('from public, anon, authenticated'));
 assert.ok(!/\bgrant\s+(?:all|select|insert|update|delete)\b/i.test(sql));
 assert.ok(!/\bdrop\s+(?:schema|table)\b/i.test(sql));
 assert.ok(!/security\s+definer/i.test(sql));
 assert.match(sql,/security invoker/);
});
test('DB admissions check human review, policy and full validator bindings',()=>{
 for(const required of [
  'candidate_kernel_admission_gate',
  "new.outcome <> 'ADMITTED'",
  "d.human_status = 'APPROVED'",
  "d.scope_ref = new.work_order_id",
  "e.allow is true and e.verified is true",
  'a.signature_verified is true',
  'required_validator_count < 1',
  'validated_count <> required_validator_count',
  'invalid_validator_count > 0',
 ])assert.ok(sql.includes(required),required);
});
test('OPA defaults deny and agent preflight cannot execute or escalate',()=>{
 assert.match(rego,/default allow := false/);
 assert.match(rego,/input\.execution\.requested == false/);
 assert.match(rego,/input\.approval\.human_status == "APPROVED"/);
 assert.match(kernel,/policy-evaluation-unavailable/);
 assert.match(agent,/preflight-only-never-execute-without-server/);
 assert.match(agent,/agent-grant-expired/);
});

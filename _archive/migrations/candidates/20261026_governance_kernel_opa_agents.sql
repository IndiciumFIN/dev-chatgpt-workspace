-- CANDIDATE / NOT APPLIED
-- Reconciled against Calculadoras-Smart (read-only catalog) on 2026-10-26.
-- These are ADMISSION EVIDENCE tables, not replacements for existing sources:
-- cko_orch.policy_registry, workflow_instances, idempotency_keys, outbox_events;
-- cko_governance.decisions, agent_registry, control_framework_mappings;
-- cko_validation.findings, validators; cko_evidence.evidence_bundles.
-- Review existing migration history, ownership, permissions and naming before applying.
-- NO public exposure; NO anon/authenticated grants; NO remote mutations authorized.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table cko_orch.work_order_admission_requests (
  work_order_id text primary key check (length(trim(work_order_id)) > 0),
  workflow_id text not null references cko_orch.workflow_instances(workflow_id) on delete restrict,
  find_id text not null references cko_validation.findings(finding_id) on delete restrict,
  evidence_bundle_id text not null references cko_evidence.evidence_bundles(evidence_bundle_id) on delete restrict,
  source_ref text not null check (length(trim(source_ref)) > 0),
  task_ref text not null check (length(trim(task_ref)) > 0),
  maker_actor text not null check (length(trim(maker_actor)) > 0),
  checker_actor text not null check (length(trim(checker_actor)) > 0),
  scope jsonb not null check (jsonb_typeof(scope) = 'array'),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  admission_status text not null default 'PENDING'
    check (admission_status in ('NOT_SUBMITTED','PENDING','ADMITTED','REJECTED')),
  requested_at timestamptz not null default now(),
  constraint admission_segregation check (maker_actor <> checker_actor)
);

create table cko_orch.work_order_policy_bindings (
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  policy_id text not null references cko_orch.policy_registry(policy_id) on delete restrict,
  pinned_version text not null check (length(trim(pinned_version)) > 0),
  primary key (work_order_id,policy_id)
);

create table cko_orch.policy_bundle_artifacts (
  bundle_ref text primary key check (length(trim(bundle_ref)) > 0),
  policy_id text not null references cko_orch.policy_registry(policy_id) on delete restrict,
  policy_version text not null check (length(trim(policy_version)) > 0),
  bundle_sha256 text not null check (bundle_sha256 ~ '^[0-9a-f]{64}$'),
  source_uri text not null check (length(trim(source_uri)) > 0),
  signature_verified boolean not null default false,
  verification_evidence_ref text,
  created_at timestamptz not null default now(),
  constraint bundle_verification_evidence check
    (not signature_verified or length(trim(coalesce(verification_evidence_ref,''))) > 0),
  unique (policy_id,policy_version,bundle_sha256)
);

create table cko_orch.work_order_policy_evaluations (
  decision_ref text primary key check (length(trim(decision_ref)) > 0),
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  bundle_ref text not null references cko_orch.policy_bundle_artifacts(bundle_ref) on delete restrict,
  input_sha256 text not null check (input_sha256 ~ '^[0-9a-f]{64}$'),
  allow boolean not null default false,
  evaluator_ref text not null check (length(trim(evaluator_ref)) > 0),
  decision_evidence_ref text not null check (length(trim(decision_evidence_ref)) > 0),
  verified boolean not null default false,
  verified_by text,
  evaluated_at timestamptz not null default now(),
  constraint verified_policy_evidence check (not verified or length(trim(coalesce(verified_by,''))) > 0),
  unique (work_order_id,decision_ref)
);

create table cko_orch.work_order_required_validators (
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  validator_id text not null references cko_validation.validators(validator_id) on delete restrict,
  pinned_version text not null check (length(trim(pinned_version)) > 0),
  primary key(work_order_id,validator_id)
);

create table cko_orch.work_order_validator_results (
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  validator_id text not null references cko_validation.validators(validator_id) on delete restrict,
  run_ref text not null check (length(trim(run_ref)) > 0),
  result text not null check (result in ('PASS','FAIL','HOLD')),
  evidence_bundle_id text not null references cko_evidence.evidence_bundles(evidence_bundle_id) on delete restrict,
  input_sha256 text not null check (input_sha256 ~ '^[0-9a-f]{64}$'),
  result_sha256 text not null check (result_sha256 ~ '^[0-9a-f]{64}$'),
  tested_at timestamptz not null default now(),
  primary key (work_order_id,validator_id,run_ref)
);

create table cko_orch.kernel_admission_decisions (
  decision_id text primary key check (length(trim(decision_id)) > 0),
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  policy_decision_ref text references cko_orch.work_order_policy_evaluations(decision_ref) on delete restrict,
  human_decision_id text references cko_governance.decisions(decision_id) on delete restrict,
  admission_evidence_bundle_id text references cko_evidence.evidence_bundles(evidence_bundle_id) on delete restrict,
  outcome text not null default 'PENDING'
    check (outcome in ('NOT_SUBMITTED','PENDING','ADMITTED','REJECTED')),
  reason text not null check (length(trim(reason)) > 0),
  decided_at timestamptz not null default now(),
  constraint admitted_only_with_refs check
    (outcome <> 'ADMITTED' or
      (policy_decision_ref is not null and human_decision_id is not null and
       admission_evidence_bundle_id is not null)),
  unique (work_order_id,decision_id)
);

-- Narrow agent tool scopes, not live grants. The runtime enforcement point
-- MUST re-evaluate policy and Kernel admission before invoking any tool.
create table cko_governance.agent_tool_scopes (
  agent_id text not null references cko_governance.agent_registry(agent_id) on delete restrict,
  tool_ref text not null check (length(trim(tool_ref)) > 0),
  policy_id text not null references cko_orch.policy_registry(policy_id) on delete restrict,
  work_order_id text not null references cko_orch.work_order_admission_requests(work_order_id) on delete restrict,
  read_allowed boolean not null default false,
  write_allowed boolean not null default false,
  enabled boolean not null default false,
  expires_at timestamptz not null,
  approval_decision_id text not null references cko_governance.decisions(decision_id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (agent_id,tool_ref,policy_id,work_order_id),
  constraint agent_scope_restricted check (not enabled or read_allowed or write_allowed),
  constraint agent_scope_no_unbounded_time check (expires_at > created_at)
);

-- Stronger DB gate for the recorded ADMITTED assertion; do not assume a row
-- authorizes execution, as authorization still belongs to the runtime/Kernel.
create function cko_orch.check_candidate_kernel_admission()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  record_maker text;
  record_checker text;
  approved_human boolean;
  evaluated_allow boolean;
  validated_count bigint;
  required_validator_count bigint;
  invalid_validator_count bigint;
  policy_count bigint;
  missing_policies bigint;
begin
  if new.outcome <> 'ADMITTED' then
    return new;
  end if;

  select maker_actor,checker_actor
    into record_maker,record_checker
    from cko_orch.work_order_admission_requests
   where work_order_id = new.work_order_id;

  select (e.allow is true and e.verified is true and
          a.signature_verified is true and e.work_order_id = new.work_order_id)
    into evaluated_allow
    from cko_orch.work_order_policy_evaluations e
    join cko_orch.policy_bundle_artifacts a on a.bundle_ref = e.bundle_ref
   where e.decision_ref = new.policy_decision_ref;

  select (d.human_required is true and d.human_status = 'APPROVED'
          and d.decided_at is not null and d.scope_ref = new.work_order_id)
    into approved_human
    from cko_governance.decisions d
   where d.decision_id = new.human_decision_id;

  select count(*) into required_validator_count
    from cko_orch.work_order_required_validators v
   where v.work_order_id = new.work_order_id;

  select count(distinct r.validator_id) filter (where r.result = 'PASS'),
         count(*) filter (where r.result <> 'PASS' or v.validator_id is null)
    into validated_count,invalid_validator_count
    from cko_orch.work_order_validator_results r
    left join cko_orch.work_order_required_validators v
      on v.work_order_id = r.work_order_id and v.validator_id = r.validator_id
   where r.work_order_id = new.work_order_id;

  select count(*),count(*) filter(where p.active is not true or p.version <> b.pinned_version)
    into policy_count,missing_policies
    from cko_orch.work_order_policy_bindings b
    join cko_orch.policy_registry p on p.policy_id = b.policy_id
   where b.work_order_id = new.work_order_id;

  if evaluated_allow is distinct from true or approved_human is distinct from true
     or policy_count < 1 or missing_policies > 0 or required_validator_count < 1 or validated_count <> required_validator_count
     or invalid_validator_count > 0
     or record_maker is null or record_checker is null or record_maker = record_checker
     or new.admission_evidence_bundle_id is null then
    raise check_violation using message = 'Candidate admission fails closed: policy, validators, reviewer or evidence missing';
  end if;

  return new;
end;
$$;

create trigger candidate_kernel_admission_gate
  before insert or update on cko_orch.kernel_admission_decisions
  for each row execute function cko_orch.check_candidate_kernel_admission();

-- Existing private schemas remain private; RLS is additional defense in depth.
alter table cko_orch.work_order_admission_requests enable row level security;
alter table cko_orch.work_order_admission_requests force row level security;
alter table cko_orch.work_order_policy_bindings enable row level security;
alter table cko_orch.work_order_policy_bindings force row level security;
alter table cko_orch.policy_bundle_artifacts enable row level security;
alter table cko_orch.policy_bundle_artifacts force row level security;
alter table cko_orch.work_order_policy_evaluations enable row level security;
alter table cko_orch.work_order_policy_evaluations force row level security;
alter table cko_orch.work_order_required_validators enable row level security;
alter table cko_orch.work_order_required_validators force row level security;
alter table cko_orch.work_order_validator_results enable row level security;
alter table cko_orch.work_order_validator_results force row level security;
alter table cko_orch.kernel_admission_decisions enable row level security;
alter table cko_orch.kernel_admission_decisions force row level security;
alter table cko_governance.agent_tool_scopes enable row level security;
alter table cko_governance.agent_tool_scopes force row level security;

revoke all on cko_orch.work_order_admission_requests,
  cko_orch.work_order_policy_bindings, cko_orch.policy_bundle_artifacts,
  cko_orch.work_order_policy_evaluations, cko_orch.work_order_required_validators,
  cko_orch.work_order_validator_results,
  cko_orch.kernel_admission_decisions, cko_governance.agent_tool_scopes
  from public, anon, authenticated;
revoke all on function cko_orch.check_candidate_kernel_admission() from public, anon, authenticated;

create index wo_admission_by_workflow on cko_orch.work_order_admission_requests(workflow_id);
create index wo_admission_by_finding on cko_orch.work_order_admission_requests(find_id);
create index wo_admission_by_evidence on cko_orch.work_order_admission_requests(evidence_bundle_id);
create index wo_policy_by_policy on cko_orch.work_order_policy_bindings(policy_id);
create index policy_bundle_by_policy on cko_orch.policy_bundle_artifacts(policy_id);
create index policy_evaluation_by_request on cko_orch.work_order_policy_evaluations(work_order_id,evaluated_at desc);
create index policy_evaluation_by_bundle on cko_orch.work_order_policy_evaluations(bundle_ref);
create index wo_required_validator_by_validator on cko_orch.work_order_required_validators(validator_id);
create index wo_validator_by_validator on cko_orch.work_order_validator_results(validator_id);
create index wo_validator_by_evidence on cko_orch.work_order_validator_results(evidence_bundle_id);
create index admission_decision_by_request on cko_orch.kernel_admission_decisions(work_order_id,decided_at desc);
create index agent_tool_scope_by_policy on cko_governance.agent_tool_scopes(policy_id,work_order_id);
create index agent_tool_scope_by_work_order on cko_governance.agent_tool_scopes(work_order_id);

comment on table cko_orch.work_order_admission_requests is 'CANDIDATE: canonical WO admission envelope, not an execution command';
comment on table cko_orch.kernel_admission_decisions is 'CANDIDATE: admission evidence, not a runtime authorization token';
comment on table cko_governance.agent_tool_scopes is 'CANDIDATE: scoped, expiring agent capability bindings; no direct grants';
commit;

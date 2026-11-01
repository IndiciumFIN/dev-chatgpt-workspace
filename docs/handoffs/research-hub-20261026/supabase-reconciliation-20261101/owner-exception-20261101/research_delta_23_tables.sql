-- Owner-requested candidate-only exception, 2026-11-01. No Kernel admission or canonical promotion.

-- Existing ce_platform/cko_* relations referenced only. No DDL or DML on them.

create schema ce_research_candidate;

revoke all on schema ce_research_candidate from public, anon, authenticated, service_role;

comment on schema ce_research_candidate is 'Research domain candidate; not released or Kernel admitted; 2026-11-01 owner exception.';

create table ce_research_candidate.hypotheses (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 hypothesis_kind text not null default 'DESCRIPTIVE',
 statement text not null check(length(trim(statement))>0),
 null_hypothesis text,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.hypotheses enable row level security;

alter table ce_research_candidate.hypotheses force row level security;

create index idx_rh_hypotheses_project on ce_research_candidate.hypotheses(project_id);

create table ce_research_candidate.sampling_plans (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 population_definition text not null,
 sampling_method text not null,
 target_size integer check(target_size>0),
 inclusion_criteria jsonb not null default '[]'::jsonb,
 exclusion_criteria jsonb not null default '[]'::jsonb,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.sampling_plans enable row level security;

alter table ce_research_candidate.sampling_plans force row level security;

create index idx_rh_sampling_plans_project on ce_research_candidate.sampling_plans(project_id);

create table ce_research_candidate.retention_rules (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 data_class text not null,
 purpose text not null,
 retention_days integer not null check(retention_days>=0),
 disposal_method text not null,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.retention_rules enable row level security;

alter table ce_research_candidate.retention_rules force row level security;

create index idx_rh_retention_rules_project on ce_research_candidate.retention_rules(project_id);

create table ce_research_candidate.recruitment_campaigns (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 title text not null,
 channel text,
 eligibility_criteria jsonb not null default '{}'::jsonb,
 opens_at timestamptz,
 closes_at timestamptz,
 check(closes_at is null or opens_at is null or closes_at>=opens_at),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.recruitment_campaigns enable row level security;

alter table ce_research_candidate.recruitment_campaigns force row level security;

create index idx_rh_recruitment_campaigns_project on ce_research_candidate.recruitment_campaigns(project_id);

create table ce_research_candidate.source_search_hits (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 search_id uuid references ce_platform.saved_searches(saved_search_id) on delete restrict,
 source_ref text,
 source_uri text,
 result_rank integer check(result_rank>=1),
 retrieved_at timestamptz not null default now(),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.source_search_hits enable row level security;

alter table ce_research_candidate.source_search_hits force row level security;

create index idx_rh_source_search_hits_project on ce_research_candidate.source_search_hits(project_id);

create table ce_research_candidate.instrument_responses (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 instrument_id text not null references ce_platform.research_instruments(canonical_id) on delete restrict,
 anonymous_token_digest text check(anonymous_token_digest is null or anonymous_token_digest ~ '^[0-9a-f]{64}$'),
 form_version_ref text,
 response_payload jsonb not null default '{}'::jsonb check(jsonb_typeof(response_payload)='object'),
 submitted_at timestamptz,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.instrument_responses enable row level security;

alter table ce_research_candidate.instrument_responses force row level security;

create index idx_rh_instrument_responses_project on ce_research_candidate.instrument_responses(project_id);

create table ce_research_candidate.response_items (
 record_id uuid primary key default gen_random_uuid(),
 response_id uuid not null references ce_research_candidate.instrument_responses(record_id) on delete restrict,
 field_ref text not null,
 response_value jsonb not null default 'null'::jsonb,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.response_items enable row level security;

alter table ce_research_candidate.response_items force row level security;

create table ce_research_candidate.data_quality_findings (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 response_id uuid references ce_research_candidate.instrument_responses(record_id) on delete restrict,
 rule_ref text not null,
 severity text not null check(severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
 finding_summary text not null,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.data_quality_findings enable row level security;

alter table ce_research_candidate.data_quality_findings force row level security;

create index idx_rh_data_quality_findings_project on ce_research_candidate.data_quality_findings(project_id);

create table ce_research_candidate.analysis_runs (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 method_ref text,
 parameters jsonb not null default '{}'::jsonb check(jsonb_typeof(parameters)='object'),
 result_ref text,
 started_at timestamptz,
 completed_at timestamptz,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.analysis_runs enable row level security;

alter table ce_research_candidate.analysis_runs force row level security;

create index idx_rh_analysis_runs_project on ce_research_candidate.analysis_runs(project_id);

create table ce_research_candidate.research_metrics (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 metric_key text not null,
 metric_name text not null,
 unit text,
 definition jsonb not null default '{}'::jsonb,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.research_metrics enable row level security;

alter table ce_research_candidate.research_metrics force row level security;

create index idx_rh_research_metrics_project on ce_research_candidate.research_metrics(project_id);

create table ce_research_candidate.metric_observations (
 record_id uuid primary key default gen_random_uuid(),
 metric_id uuid not null references ce_research_candidate.research_metrics(record_id) on delete restrict,
 observed_at timestamptz not null default now(),
 observed_value numeric,
 observation_payload jsonb not null default '{}'::jsonb,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.metric_observations enable row level security;

alter table ce_research_candidate.metric_observations force row level security;

create table ce_research_candidate.editorial_reviews (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 output_canonical_ref text references ce_platform.canonical_objects(canonical_id) on delete restrict,
 review_kind text not null,
 review_summary text not null,
 reviewer_ref text,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.editorial_reviews enable row level security;

alter table ce_research_candidate.editorial_reviews force row level security;

create index idx_rh_editorial_reviews_project on ce_research_candidate.editorial_reviews(project_id);

create table ce_research_candidate.calls_for_proposals (
 record_id uuid primary key default gen_random_uuid(),
 organization_ref text references ce_platform.organizations(canonical_id) on delete restrict,
 title text not null,
 description text not null default '',
 opens_at timestamptz,
 closes_at timestamptz,
 check(closes_at is null or opens_at is null or closes_at>=opens_at),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.calls_for_proposals enable row level security;

alter table ce_research_candidate.calls_for_proposals force row level security;

create table ce_research_candidate.proposal_applications (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 call_id uuid not null references ce_research_candidate.calls_for_proposals(record_id) on delete restrict,
 application_summary text not null default '',
 submitted_at timestamptz,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.proposal_applications enable row level security;

alter table ce_research_candidate.proposal_applications force row level security;

create index idx_rh_proposal_applications_project on ce_research_candidate.proposal_applications(project_id);

create table ce_research_candidate.research_portfolio_items (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 portfolio_ref text not null,
 ordinal integer not null default 0,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.research_portfolio_items enable row level security;

alter table ce_research_candidate.research_portfolio_items force row level security;

create index idx_rh_research_portfolio_items_project on ce_research_candidate.research_portfolio_items(project_id);

create table ce_research_candidate.budget_lines (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 budget_category text not null,
 period_label text,
 budgeted_amount numeric(18,2) not null default 0 check(budgeted_amount>=0),
 currency_code text not null default 'BRL' check(currency_code ~ '^[A-Z]{3}$'),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.budget_lines enable row level security;

alter table ce_research_candidate.budget_lines force row level security;

create index idx_rh_budget_lines_project on ce_research_candidate.budget_lines(project_id);

create table ce_research_candidate.funding_transactions (
 record_id uuid primary key default gen_random_uuid(),
 budget_line_id uuid not null references ce_research_candidate.budget_lines(record_id) on delete restrict,
 amount numeric(18,2) not null,
 currency_code text not null default 'BRL' check(currency_code ~ '^[A-Z]{3}$'),
 transaction_date date,
 source_evidence_ref text,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.funding_transactions enable row level security;

alter table ce_research_candidate.funding_transactions force row level security;

create table ce_research_candidate.research_training_assignments (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 skill_canonical_ref text references ce_platform.skills(canonical_id) on delete restrict,
 assignee_ref text,
 training_resource_ref text,
 due_at timestamptz,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.research_training_assignments enable row level security;

alter table ce_research_candidate.research_training_assignments force row level security;

create index idx_rh_research_training_assignments_project on ce_research_candidate.research_training_assignments(project_id);

create table ce_research_candidate.impact_observations (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 impact_category text not null,
 indicator_ref text,
 observed_value numeric,
 unit text,
 observed_on date,
 evidence_ref text,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.impact_observations enable row level security;

alter table ce_research_candidate.impact_observations force row level security;

create index idx_rh_impact_observations_project on ce_research_candidate.impact_observations(project_id);

create table ce_research_candidate.risk_scenarios (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 risk_ref text references cko_risk.risks(risk_id) on delete restrict,
 scenario_summary text not null,
 assumptions jsonb not null default '{}'::jsonb,
 proposed_response text,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.risk_scenarios enable row level security;

alter table ce_research_candidate.risk_scenarios force row level security;

create index idx_rh_risk_scenarios_project on ce_research_candidate.risk_scenarios(project_id);

create table ce_research_candidate.participation_statements (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 process_ref text,
 statement text not null check(length(trim(statement))>0),
 display_order int not null default 0,
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.participation_statements enable row level security;

alter table ce_research_candidate.participation_statements force row level security;

create index idx_rh_participation_statements_project on ce_research_candidate.participation_statements(project_id);

create table ce_research_candidate.consensus_votes (
 record_id uuid primary key default gen_random_uuid(),
 statement_id uuid not null references ce_research_candidate.participation_statements(record_id) on delete restrict,
 participant_token_digest text not null check(participant_token_digest ~ '^[0-9a-f]{64}$'),
 position text not null check(position in ('AGREE','DISAGREE','UNSURE')),
 unique(statement_id,participant_token_digest),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.consensus_votes enable row level security;

alter table ce_research_candidate.consensus_votes force row level security;

create table ce_research_candidate.participation_outcomes (
 record_id uuid primary key default gen_random_uuid(),
 project_id text not null references ce_platform.research_projects(canonical_id) on delete restrict,
 process_ref text,
 outcome_summary text not null,
 evidence_ref text,
 is_official boolean not null default false check(is_official=false),
 lifecycle_state text not null default 'CANDIDATE' check (lifecycle_state in ('CANDIDATE','HOLD_REVIEW')),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object')
);

alter table ce_research_candidate.participation_outcomes enable row level security;

alter table ce_research_candidate.participation_outcomes force row level security;

create index idx_rh_participation_outcomes_project on ce_research_candidate.participation_outcomes(project_id);

create index idx_rh_source_search_hits_search_id on ce_research_candidate.source_search_hits(search_id);

create index idx_rh_instrument_responses_instrument_id on ce_research_candidate.instrument_responses(instrument_id);

create index idx_rh_response_items_response_id on ce_research_candidate.response_items(response_id);

create index idx_rh_data_quality_findings_response_id on ce_research_candidate.data_quality_findings(response_id);

create index idx_rh_metric_observations_metric_id on ce_research_candidate.metric_observations(metric_id);

create index idx_rh_proposal_applications_call_id on ce_research_candidate.proposal_applications(call_id);

create index idx_rh_funding_transactions_budget_line_id on ce_research_candidate.funding_transactions(budget_line_id);

create index idx_rh_consensus_votes_statement_id on ce_research_candidate.consensus_votes(statement_id);

revoke all on all tables in schema ce_research_candidate from public, anon, authenticated, service_role;

revoke all on all sequences in schema ce_research_candidate from public, anon, authenticated, service_role;

alter default privileges in schema ce_research_candidate revoke all on tables from public, anon, authenticated, service_role;

do $$ declare n int; m int; begin
select count(*) into n from pg_class c join pg_namespace s on s.oid=c.relnamespace where s.nspname='ce_research_candidate' and c.relkind in ('r','p');
if n<>23 then raise exception 'Candidate expected 23 relations, got %',n; end if;
select count(*) into m from pg_class c join pg_namespace s on s.oid=c.relnamespace where s.nspname='ce_research_candidate' and c.relkind in ('r','p') and c.relrowsecurity and c.relforcerowsecurity;
if m<>23 then raise exception 'Candidate expected forced RLS on 23 relations, got %',m; end if;
end $$;

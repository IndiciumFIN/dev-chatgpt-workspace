-- CANDIDATE / NOT APPLIED / NO PRODUCTION WRITE
-- Reconciled READ_ONLY on 2026-10-26 against cko_staging.import_packages.
-- No duplicate master import_packages table: these are child staging facts.
-- Package activation/migration requires independent approval, OPA and Kernel.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table cko_staging.import_profile_versions (
 profile_ref text not null,
 profile_version text not null,
 destination_schema text not null check (destination_schema in ('cko_evidence','cko_orch','cko_validation')),
 destination_table text not null,
 contract_sha256 text not null check (contract_sha256 ~ '^[0-9a-f]{64}$'),
 fields jsonb not null check (jsonb_typeof(fields) = 'array' and jsonb_array_length(fields) > 0),
 allowed_format text[] not null default array['csv','tsv','json']::text[],
 enabled boolean not null default false,
 created_at timestamptz not null default now(),
 primary key (profile_ref,profile_version)
);

create table cko_staging.import_package_contracts (
 import_package_id text primary key references cko_staging.import_packages(import_package_id) on delete restrict,
 profile_ref text not null,
 profile_version text not null,
 original_sha256 text not null check (original_sha256 ~ '^[0-9a-f]{64}
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 profile_ref text not null,
 profile_version text not null,
 destination_field text not null check (length(trim(destination_field)) > 0),
 source_column text not null check (length(trim(source_column)) > 0),
 created_at timestamptz not null default now(),
 primary key (import_package_id,destination_field),
 unique (import_package_id,source_column),
 foreign key (profile_ref,profile_version)
    references cko_staging.import_profile_versions(profile_ref,profile_version) on delete restrict
);

create table cko_staging.import_chunks (
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 chunk_index int not null check (chunk_index >= 0),
 first_row int not null check (first_row >= 1),
 last_row int not null check (last_row >= first_row),
 chunk_sha256 text not null check (chunk_sha256 ~ '^[0-9a-f]{64}$'),
 status text not null default 'CANDIDATE'
   check (status in ('CANDIDATE','VALIDATED','HOLD')),
 created_at timestamptz not null default now(),
 primary key (import_package_id,chunk_index),
 unique (import_package_id,chunk_sha256)
);

create table cko_staging.import_row_candidates (
 candidate_id uuid primary key default gen_random_uuid(),
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 chunk_index int not null,
 row_number int not null check (row_number >= 1),
 record_identifier text,
 row_sha256 text not null check (row_sha256 ~ '^[0-9a-f]{64}$'),
 profile_ref text not null,
 profile_version text not null,
 candidate_payload jsonb not null check (jsonb_typeof(candidate_payload) = 'object'),
 status text not null default 'CANDIDATE' check (status in ('CANDIDATE','HOLD','REJECTED')),
 created_at timestamptz not null default now(),
 unique (import_package_id,row_number),
 foreign key (import_package_id,chunk_index)
   references cko_staging.import_chunks(import_package_id,chunk_index) on delete restrict,
 foreign key (import_package_id,profile_ref,profile_version)
   references cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version) on delete restrict
);

create table cko_staging.import_row_findings (
 finding_id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references cko_staging.import_row_candidates(candidate_id) on delete restrict,
 field_path text not null,
 reason_code text not null check (length(trim(reason_code)) > 0),
 message text not null check (length(trim(message)) > 0),
 severity text not null default 'HOLD' check (severity in ('WARN','HOLD','BLOCK')),
 validator_id text references cko_validation.validators(validator_id) on delete restrict,
 evidence_ref text,
 created_at timestamptz not null default now()
);

create table cko_staging.import_review_events (
 review_id uuid primary key default gen_random_uuid(),
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 candidate_id uuid references cko_staging.import_row_candidates(candidate_id) on delete restrict,
 reviewer_ref text not null check (length(trim(reviewer_ref)) > 0),
 decision text not null check (decision in ('HOLD','REJECTED','PROPOSE_FOR_WO')),
 human_decision_ref text references cko_governance.decisions(decision_id) on delete restrict,
 evidence_bundle_id text references cko_evidence.evidence_bundles(evidence_bundle_id) on delete restrict,
 created_at timestamptz not null default now(),
 constraint import_human_evidence_for_wo check (
  decision <> 'PROPOSE_FOR_WO'
  or (human_decision_ref is not null and evidence_bundle_id is not null)
 )
);

-- Guard structural lifecycle; review records are NOT Kernel admission and
-- cannot cause implicit canonical upserts or agent grants.
create index import_mappings_profile_idx on cko_staging.import_column_mappings(profile_ref,profile_version);
create index import_chunks_status_idx on cko_staging.import_chunks(import_package_id,status);
create index import_rows_profile_idx on cko_staging.import_row_candidates(profile_ref,profile_version);
create index import_rows_status_idx on cko_staging.import_row_candidates(import_package_id,status);
create index import_rows_record_idx on cko_staging.import_row_candidates(profile_ref,record_identifier);
create index import_row_findings_idx on cko_staging.import_row_findings(candidate_id,severity);
create index import_row_validator_idx on cko_staging.import_row_findings(validator_id);
create index import_reviews_package_idx on cko_staging.import_review_events(import_package_id,created_at desc);
create index import_reviews_human_idx on cko_staging.import_review_events(human_decision_ref);
create index import_reviews_evidence_idx on cko_staging.import_review_events(evidence_bundle_id);

alter table cko_staging.import_profile_versions enable row level security;
alter table cko_staging.import_profile_versions force row level security;
alter table cko_staging.import_package_contracts enable row level security;
alter table cko_staging.import_package_contracts force row level security;
alter table cko_staging.import_column_mappings enable row level security;
alter table cko_staging.import_column_mappings force row level security;
alter table cko_staging.import_chunks enable row level security;
alter table cko_staging.import_chunks force row level security;
alter table cko_staging.import_row_candidates enable row level security;
alter table cko_staging.import_row_candidates force row level security;
alter table cko_staging.import_row_findings enable row level security;
alter table cko_staging.import_row_findings force row level security;
alter table cko_staging.import_review_events enable row level security;
alter table cko_staging.import_review_events force row level security;

revoke all on cko_staging.import_profile_versions,
 cko_staging.import_package_contracts,
 cko_staging.import_column_mappings,
 cko_staging.import_chunks,
 cko_staging.import_row_candidates,
 cko_staging.import_row_findings,
 cko_staging.import_review_events from public, anon, authenticated;

comment on table cko_staging.import_profile_versions is 'CANDIDATE: contract version for controlled import mapping, disabled by default';
comment on table cko_staging.import_package_contracts is 'CANDIDATE: fixed source hash and profile per existing staging package';
comment on table cko_staging.import_column_mappings is 'CANDIDATE: one-to-one source-to-target mapping for an existing staging import package';
comment on table cko_staging.import_chunks is 'CANDIDATE: deterministic chunk checkpoints, no canonical writes';
comment on table cko_staging.import_row_candidates is 'CANDIDATE: line-oriented quarantine/validation only; no upserts';
comment on table cko_staging.import_row_findings is 'CANDIDATE: explicit per-line validation findings';
comment on table cko_staging.import_review_events is 'CANDIDATE: review proposals, never admission or promotion';
commit;
),
 source_format text not null check (source_format in ('csv','tsv','json')),
 created_at timestamptz not null default now(),
 foreign key (profile_ref,profile_version)
   references cko_staging.import_profile_versions(profile_ref,profile_version) on delete restrict,
 unique (import_package_id,profile_ref,profile_version)
);

create table cko_staging.import_column_mappings (
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 profile_ref text not null,
 profile_version text not null,
 destination_field text not null check (length(trim(destination_field)) > 0),
 source_column text not null check (length(trim(source_column)) > 0),
 created_at timestamptz not null default now(),
 primary key (import_package_id,destination_field),
 unique (import_package_id,source_column),
 foreign key (import_package_id,profile_ref,profile_version)
    references cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version) on delete restrict
);

create table cko_staging.import_chunks (
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 chunk_index int not null check (chunk_index >= 0),
 first_row int not null check (first_row >= 1),
 last_row int not null check (last_row >= first_row),
 chunk_sha256 text not null check (chunk_sha256 ~ '^[0-9a-f]{64}$'),
 status text not null default 'CANDIDATE'
   check (status in ('CANDIDATE','VALIDATED','HOLD')),
 created_at timestamptz not null default now(),
 primary key (import_package_id,chunk_index),
 unique (import_package_id,chunk_sha256)
);

create table cko_staging.import_row_candidates (
 candidate_id uuid primary key default gen_random_uuid(),
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 chunk_index int not null,
 row_number int not null check (row_number >= 1),
 record_identifier text,
 row_sha256 text not null check (row_sha256 ~ '^[0-9a-f]{64}$'),
 profile_ref text not null,
 profile_version text not null,
 candidate_payload jsonb not null check (jsonb_typeof(candidate_payload) = 'object'),
 status text not null default 'CANDIDATE' check (status in ('CANDIDATE','HOLD','REJECTED')),
 created_at timestamptz not null default now(),
 unique (import_package_id,row_number),
 foreign key (import_package_id,chunk_index)
   references cko_staging.import_chunks(import_package_id,chunk_index) on delete restrict,
 foreign key (profile_ref,profile_version)
   references cko_staging.import_profile_versions(profile_ref,profile_version) on delete restrict
);

create table cko_staging.import_row_findings (
 finding_id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references cko_staging.import_row_candidates(candidate_id) on delete restrict,
 field_path text not null,
 reason_code text not null check (length(trim(reason_code)) > 0),
 message text not null check (length(trim(message)) > 0),
 severity text not null default 'HOLD' check (severity in ('WARN','HOLD','BLOCK')),
 validator_id text references cko_validation.validators(validator_id) on delete restrict,
 evidence_ref text,
 created_at timestamptz not null default now()
);

create table cko_staging.import_review_events (
 review_id uuid primary key default gen_random_uuid(),
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 candidate_id uuid references cko_staging.import_row_candidates(candidate_id) on delete restrict,
 reviewer_ref text not null check (length(trim(reviewer_ref)) > 0),
 decision text not null check (decision in ('HOLD','REJECTED','PROPOSE_FOR_WO')),
 human_decision_ref text references cko_governance.decisions(decision_id) on delete restrict,
 evidence_bundle_id text references cko_evidence.evidence_bundles(evidence_bundle_id) on delete restrict,
 created_at timestamptz not null default now(),
 constraint import_human_evidence_for_wo check (
  decision <> 'PROPOSE_FOR_WO'
  or (human_decision_ref is not null and evidence_bundle_id is not null)
 )
);

-- Guard structural lifecycle; review records are NOT Kernel admission and
-- cannot cause implicit canonical upserts or agent grants.
create index import_mappings_profile_idx on cko_staging.import_column_mappings(profile_ref,profile_version);
create index import_chunks_status_idx on cko_staging.import_chunks(import_package_id,status);
create index import_rows_profile_idx on cko_staging.import_row_candidates(profile_ref,profile_version);
create index import_rows_status_idx on cko_staging.import_row_candidates(import_package_id,status);
create index import_rows_record_idx on cko_staging.import_row_candidates(profile_ref,record_identifier);
create index import_row_findings_idx on cko_staging.import_row_findings(candidate_id,severity);
create index import_row_validator_idx on cko_staging.import_row_findings(validator_id);
create index import_reviews_package_idx on cko_staging.import_review_events(import_package_id,created_at desc);
create index import_reviews_human_idx on cko_staging.import_review_events(human_decision_ref);
create index import_reviews_evidence_idx on cko_staging.import_review_events(evidence_bundle_id);

alter table cko_staging.import_profile_versions enable row level security;
alter table cko_staging.import_profile_versions force row level security;
alter table cko_staging.import_column_mappings enable row level security;
alter table cko_staging.import_column_mappings force row level security;
alter table cko_staging.import_chunks enable row level security;
alter table cko_staging.import_chunks force row level security;
alter table cko_staging.import_row_candidates enable row level security;
alter table cko_staging.import_row_candidates force row level security;
alter table cko_staging.import_row_findings enable row level security;
alter table cko_staging.import_row_findings force row level security;
alter table cko_staging.import_review_events enable row level security;
alter table cko_staging.import_review_events force row level security;

revoke all on cko_staging.import_profile_versions,
 cko_staging.import_column_mappings,
 cko_staging.import_chunks,
 cko_staging.import_row_candidates,
 cko_staging.import_row_findings,
 cko_staging.import_review_events from public, anon, authenticated;

comment on table cko_staging.import_profile_versions is 'CANDIDATE: contract version for controlled import mapping, disabled by default';
comment on table cko_staging.import_column_mappings is 'CANDIDATE: one-to-one source-to-target mapping for an existing staging import package';
comment on table cko_staging.import_chunks is 'CANDIDATE: deterministic chunk checkpoints, no canonical writes';
comment on table cko_staging.import_row_candidates is 'CANDIDATE: line-oriented quarantine/validation only; no upserts';
comment on table cko_staging.import_row_findings is 'CANDIDATE: explicit per-line validation findings';
comment on table cko_staging.import_review_events is 'CANDIDATE: review proposals, never admission or promotion';
commit;

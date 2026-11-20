-- CANDIDATE / NOT APPLIED / NO CANONICAL WRITES
-- Requires first applying/reviewing 20261026_governed_admin_bulk_import.sql
-- No new canonical source/policy/validator registry. History only.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';

create table cko_staging.import_reconciliation_runs (
 reconciliation_id uuid primary key default gen_random_uuid(),
 import_package_id text not null,
 profile_ref text not null,
 profile_version text not null,
 catalog_snapshot_ref text,
 catalog_captured_at timestamptz,
 lookup_state text not null default 'NOT_RUN'
   check (lookup_state in ('NOT_RUN','LOOKUP_FAILED','LOOKUP_INCOMPLETE','LOOKUP_COMPLETE_UNATTESTED')),
 result_summary jsonb not null default '{}'::jsonb
   check (jsonb_typeof(result_summary) = 'object'),
 requested_identifiers integer not null default 0 check (requested_identifiers >= 0),
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 unique (reconciliation_id,import_package_id),
 foreign key (import_package_id,profile_ref,profile_version)
   references cko_staging.import_package_contracts(import_package_id,profile_ref,profile_version) on delete restrict,
 constraint reconciliation_catalog_fields check
   (lookup_state <> 'LOOKUP_COMPLETE_UNATTESTED'
      or (catalog_snapshot_ref is not null and catalog_captured_at is not null
          and completed_at is not null))
);

create table cko_staging.import_reconciliation_rows (
 reconciliation_id uuid not null,
 import_package_id text not null,
 row_number int not null check (row_number >= 1),
 classification text not null
  check (classification in ('HOLD_INVALID_ROW','HOLD_NO_CATALOG','HOLD_INCOMPLETE_LOOKUP',
        'NEW_CANDIDATE','UNCHANGED_CANDIDATE','CONFLICT_HOLD')),
 existing_version_ref text,
 differing_fields jsonb not null default '[]'::jsonb
   check (jsonb_typeof(differing_fields) = 'array'),
 observed_at timestamptz not null default now(),
 primary key (reconciliation_id,row_number),
 foreign key(reconciliation_id,import_package_id)
   references cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id) on delete restrict,
 foreign key(import_package_id,row_number)
   references cko_staging.import_row_candidates(import_package_id,row_number) on delete restrict
);

create table cko_staging.import_lifecycle_events (
 event_id uuid primary key default gen_random_uuid(),
 import_package_id text not null references cko_staging.import_packages(import_package_id) on delete restrict,
 reconciliation_id uuid,
 event_type text not null
   check (event_type in ('RECEIVED','MAPPED','VALIDATED','RECONCILED',
      'HOLD','REJECTED','PROPOSED_FOR_WO')),
 actor_ref text not null check(length(trim(actor_ref)) > 0),
 event_evidence_ref text not null check(length(trim(event_evidence_ref)) > 0),
 event_payload jsonb not null default '{}'::jsonb
   check(jsonb_typeof(event_payload) = 'object'),
 occurred_at timestamptz not null default now(),
 foreign key (reconciliation_id,import_package_id)
   references cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id) on delete restrict
);

-- An asserted new/unchanged/conflict comparison must point to a completed
-- (but still UNATTESTED) lookup and a non-held candidate row.
-- This remains a validation of structured claims, not authorization.
create function cko_staging.validate_import_reconciliation_row()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
  run_state text;
  candidate_state text;
begin
  select lookup_state into run_state from cko_staging.import_reconciliation_runs
    where reconciliation_id = new.reconciliation_id
      and import_package_id = new.import_package_id;
  select status into candidate_state from cko_staging.import_row_candidates
    where import_package_id = new.import_package_id
      and row_number = new.row_number;

  if new.classification in ('NEW_CANDIDATE','UNCHANGED_CANDIDATE','CONFLICT_HOLD')
    and (run_state is distinct from 'LOOKUP_COMPLETE_UNATTESTED'
         or candidate_state is distinct from 'CANDIDATE') then
    raise check_violation using message =
      'Comparison classification requires complete lookup and valid candidate';
  end if;
  return new;
end;
$$;

create trigger import_reconciliation_row_gate
 before insert on cko_staging.import_reconciliation_rows
 for each row execute function cko_staging.validate_import_reconciliation_row();

-- This guard prevents ordinary UPDATE/DELETE of the event history. Elevated
-- maintenance actors can bypass triggers: do not claim cryptographic immutability.
create function cko_staging.reject_import_history_mutation()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  raise exception 'Staging reconciliation/event history is append-only';
end;
$$;

create trigger import_reconciliation_runs_append_only
 before update or delete on cko_staging.import_reconciliation_runs
 for each row execute function cko_staging.reject_import_history_mutation();
create trigger import_reconciliation_rows_append_only
 before update or delete on cko_staging.import_reconciliation_rows
 for each row execute function cko_staging.reject_import_history_mutation();
create trigger import_lifecycle_events_append_only
 before update or delete on cko_staging.import_lifecycle_events
 for each row execute function cko_staging.reject_import_history_mutation();

create index import_reconciliation_by_package
  on cko_staging.import_reconciliation_runs(import_package_id,created_at desc);
create index import_reconciliation_rows_classification
  on cko_staging.import_reconciliation_rows(import_package_id,classification);
create index import_lifecycle_events_by_package
  on cko_staging.import_lifecycle_events(import_package_id,occurred_at desc);
create index import_lifecycle_events_by_reconciliation
  on cko_staging.import_lifecycle_events(reconciliation_id);

alter table cko_staging.import_reconciliation_runs enable row level security;
alter table cko_staging.import_reconciliation_runs force row level security;
alter table cko_staging.import_reconciliation_rows enable row level security;
alter table cko_staging.import_reconciliation_rows force row level security;
alter table cko_staging.import_lifecycle_events enable row level security;
alter table cko_staging.import_lifecycle_events force row level security;

revoke all on
  cko_staging.import_reconciliation_runs,
  cko_staging.import_reconciliation_rows,
  cko_staging.import_lifecycle_events
  from public, anon, authenticated;
revoke all on function cko_staging.validate_import_reconciliation_row() from public, anon, authenticated;
revoke all on function cko_staging.reject_import_history_mutation()
  from public, anon, authenticated;

comment on table cko_staging.import_reconciliation_runs is
  'CANDIDATE: read-only catalog comparison, never authorization or admission';
comment on table cko_staging.import_reconciliation_rows is
  'CANDIDATE: per-row diff/HOLD, append-only evidence';
comment on table cko_staging.import_lifecycle_events is
  'CANDIDATE: import process events; NOT a canonical write audit or Kernel decision';
commit;

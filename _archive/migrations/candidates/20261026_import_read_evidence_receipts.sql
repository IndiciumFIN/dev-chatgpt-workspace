-- CANDIDATE / NOT APPLIED; only records UNATTESTED read evidence.
-- Dependencies (already candidates): governed_admin_bulk_import.sql then
-- governed_import_reconciliation.sql. Not an OPA grant or Kernel admission.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';

create table cko_staging.import_read_evidence_receipts (
  receipt_id uuid primary key default gen_random_uuid(),
  import_package_id text not null,
  reconciliation_id uuid not null,
  actor_ref text not null check (length(trim(actor_ref)) > 0),
  request_nonce uuid not null,
  policy_decision_ref text not null check (length(trim(policy_decision_ref)) > 0),
  policy_bundle_sha256 text not null check (policy_bundle_sha256 ~ '^[a-f0-9]{64}$'),
  source_sha256 text not null check (source_sha256 ~ '^[a-f0-9]{64}$'),
  mapping_sha256 text not null check (mapping_sha256 ~ '^[a-f0-9]{64}$'),
  comparison_sha256 text not null check (comparison_sha256 ~ '^[a-f0-9]{64}$'),
  catalog_snapshot_ref text not null check (length(trim(catalog_snapshot_ref)) > 0),
  state text not null default 'CANDIDATE_UNATTESTED'
    check (state = 'CANDIDATE_UNATTESTED'),
  recorded_at timestamptz not null default now(),
  unique (import_package_id,request_nonce),
  foreign key (reconciliation_id,import_package_id)
    references cko_staging.import_reconciliation_runs(reconciliation_id,import_package_id)
    on delete restrict
);

-- A receipt about a successful catalog read cannot be filed against an
-- incomplete/different snapshot or an unmatched source/package checksum.
-- This DOES NOT attest remote OPA authenticity.
create function cko_staging.verify_import_read_receipt_candidate()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
  run_lookup text;
  run_snapshot text;
  expected_source_hash text;
begin
  select r.lookup_state,r.catalog_snapshot_ref,c.original_sha256
    into run_lookup,run_snapshot,expected_source_hash
    from cko_staging.import_reconciliation_runs r
    join cko_staging.import_package_contracts c
      on c.import_package_id=r.import_package_id
     and c.profile_ref=r.profile_ref
     and c.profile_version=r.profile_version
   where r.reconciliation_id=new.reconciliation_id
     and r.import_package_id=new.import_package_id;
  if run_lookup is distinct from 'LOOKUP_COMPLETE_UNATTESTED'
     or run_snapshot is distinct from new.catalog_snapshot_ref
     or expected_source_hash is distinct from new.source_sha256 then
    raise check_violation using message='Candidate receipt does not match completed catalog snapshot and source';
  end if;
  return new;
end;
$$;

create trigger import_read_receipt_scope
 before insert on cko_staging.import_read_evidence_receipts
 for each row execute function cko_staging.verify_import_read_receipt_candidate();

create trigger import_read_receipt_append_only
 before update or delete on cko_staging.import_read_evidence_receipts
 for each row execute function cko_staging.reject_import_history_mutation();

create index import_read_receipts_by_package
  on cko_staging.import_read_evidence_receipts(import_package_id,recorded_at desc);
create index import_read_receipts_by_policy
  on cko_staging.import_read_evidence_receipts(policy_decision_ref);

alter table cko_staging.import_read_evidence_receipts enable row level security;
alter table cko_staging.import_read_evidence_receipts force row level security;
revoke all on cko_staging.import_read_evidence_receipts from public, anon, authenticated;
revoke all on function cko_staging.verify_import_read_receipt_candidate()
  from public, anon, authenticated;
comment on table cko_staging.import_read_evidence_receipts is
  'CANDIDATE/UNATTESTED read-only evidence. No user or agent authority; no canonical writes.';
commit;

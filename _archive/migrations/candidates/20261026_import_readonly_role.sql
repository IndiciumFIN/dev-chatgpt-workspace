-- CANDIDATE / NOT APPLIED / FOR ISOLATED TEST ONLY
-- Dedicated PostgreSQL LOGIN role, no password; do NOT activate before
-- deployment secrets, IAM, grants audit, HOLD_HUMAN and approved WO.
--
-- Columns verified by READ_ONLY information_schema inspection of
-- Calculadoras-Smart on 2026-10-26.
-- No grants to anon/authenticated, no schema changes, no canonical writes.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';

create role cko_import_reader
  LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  PASSWORD NULL
  CONNECTION LIMIT 2;

grant usage on schema cko_evidence, cko_orch, cko_validation to cko_import_reader;

-- Grant only the fields actually required by catalogLookupSql(), not
-- whole-table SELECT or grants on all present/future tables.
grant select (
  source_id,source_type,title,publisher,official_uri,host,jurisdiction,
  authority_level,accreditation_status,accepted_for,review_due,attributes,created_at
) on cko_evidence.sources to cko_import_reader;

grant select (
  policy_id,version,category,description,severity_on_violation,
  action_on_violation,rule_json,active,created_at
) on cko_orch.policy_registry to cko_import_reader;

grant select (
  validator_id,name,domain,version,blocking,input_types,requirements,
  severity_policy,owner_function,status,current_version_ref
) on cko_validation.validators to cko_import_reader;

-- Even if a future service forgets the transaction settings, the login
-- session defaults to read-only. Client code MUST also begin READ ONLY.
alter role cko_import_reader set default_transaction_read_only=on;
alter role cko_import_reader set statement_timeout='3000ms';
alter role cko_import_reader set idle_in_transaction_session_timeout='10000ms';
alter role cko_import_reader set lock_timeout='1000ms';
alter role cko_import_reader set search_path='pg_catalog';

comment on role cko_import_reader is
  'CANDIDATE: import catalog-only, column-scoped, no password until separately provisioned';

-- Only a separately audited administrative identity may set a new
-- password out-of-band in a controlled secret workflow. NEVER add it here.
-- Pre-promotion check: inspect roles, PUBLIC grants, memberships, RLS,
-- default privileges, tables/function EXECUTE permissions and Data API.
commit;

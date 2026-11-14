-- Ancoras locais para o Kernel candidato.
-- So entram colunas citadas por migrations/candidates/20261026_governance_kernel_opa_agents.sql
-- e pela trigger desse arquivo. Nao e copia do Supabase Calculadoras-Smart.

create schema if not exists cko_orch;
create schema if not exists cko_governance;
create schema if not exists cko_validation;
create schema if not exists cko_evidence;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
end $$;

create table if not exists cko_orch.workflow_instances (
  workflow_id text primary key
);

create table if not exists cko_validation.findings (
  finding_id text primary key
);

create table if not exists cko_evidence.evidence_bundles (
  evidence_bundle_id text primary key
);

create table if not exists cko_validation.validators (
  validator_id text primary key
);

create table if not exists cko_governance.agent_registry (
  agent_id text primary key
);

create table if not exists cko_orch.policy_registry (
  policy_id text primary key,
  active boolean not null default false,
  version text not null
);

create table if not exists cko_governance.decisions (
  decision_id text primary key,
  human_required boolean not null default true,
  human_status text not null default 'PENDING',
  decided_at timestamptz,
  scope_ref text
);

comment on table cko_orch.policy_registry is
  'Ancora local. Colunas active e version existem porque a trigger do Kernel as le. Nao reproduz o catalogo do Supabase.';

insert into canonical_divergence (code, classe, detalhe) values
  ('D03', 'corrigida_local', 'Ancoras criadas com as colunas citadas pelo SQL candidato. As oito tabelas do Kernel passam a poder ser criadas neste banco. O Supabase nao foi alterado.');

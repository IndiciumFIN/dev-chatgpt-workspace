-- PROPOSAL ONLY. DO NOT APPLY. Requires approved ADR, human rights owner and RLS review.
-- SOT-10-09-2026: this table does NOT exist in the inspected deployed schema.
begin;
create table if not exists public.corpus_external_ai_permissions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.corpus_sources(id) on delete restrict,
  document_id uuid not null references public.corpus_documents(id) on delete restrict,
  fragment_id uuid not null references public.corpus_fragments(id) on delete restrict,
  origin_sha256_hex text not null check (origin_sha256_hex ~ '^[0-9a-f]{64}$'),
  text_sha256_hex text not null check (text_sha256_hex ~ '^[0-9a-f]{64}$'),
  operation text not null check (operation = 'EXTERNAL_AI_TDM'),
  provider text not null check (provider = 'deepseek'),
  purpose text not null check (purpose = 'clinical_education_atomization'),
  rights_status text not null default 'HOLD' check (rights_status in ('HOLD','APPROVED','REVOKED')),
  privacy_status text not null default 'HOLD' check (privacy_status in ('HOLD','APPROVED','REVOKED')),
  pii_review_status text not null default 'PENDING' check (pii_review_status in ('PENDING','CLEARED','REJECTED')),
  admission_status text not null default 'NOT_ADMITTED' check (admission_status in ('NOT_ADMITTED','ADMITTED','REVOKED')),
  rights_evidence_ref text,
  privacy_evidence_ref text,
  approved_by uuid,
  approved_at timestamptz,
  valid_from timestamptz not null,
  expires_at timestamptz not null,
  is_revoked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint permission_valid_window check (valid_from < expires_at),
  constraint permission_approval_evidence check (
    rights_status <> 'APPROVED' or
    (approved_by is not null and approved_at is not null and nullif(rights_evidence_ref,'') is not null)
  ),
  constraint permission_unique_scope unique (fragment_id,provider,operation,origin_sha256_hex,text_sha256_hex)
);
create index if not exists corpus_external_ai_permissions_doc_idx on public.corpus_external_ai_permissions(document_id);
alter table public.corpus_external_ai_permissions enable row level security;
revoke all on public.corpus_external_ai_permissions from anon, authenticated, public;
-- Deliberately no user-facing policies and no auto-admission trigger.
-- Service-role access still bypasses RLS; application-layer preflight is mandatory.
commit;

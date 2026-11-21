-- CANDIDATE v0.2.0: DO NOT APPLY TO SOT. Not a migration authorized for production.
-- Corroborated 2026-11-14 against live metadata of SOT public.corpus_*.
-- This proposal supersedes the earlier stand-alone draft SQL; requires isolated ADR and review.
begin;
-- These constraints explicitly join the physical source -> document -> fragment chain.
alter table public.corpus_documents
  add constraint corpus_documents_id_source_id_unique unique (id,source_id);
alter table public.corpus_fragments
  add constraint corpus_fragments_id_document_origin_unique unique (id,document_id,origin_sha256_hex);
-- Every atomized fragment's origin SHA must be a captured file of its document.
alter table public.corpus_fragments
  add constraint corpus_fragments_origin_is_document_file
  foreign key (document_id,origin_sha256_hex)
  references public.corpus_document_files(document_id,sha256_hex)
  on update restrict on delete restrict;
-- This operation-specific approval record may not be reused for a different fragment/provider.
create table public.corpus_external_ai_permissions (
 id uuid primary key default gen_random_uuid(),
 source_id uuid not null,
 document_id uuid not null,
 fragment_id uuid not null,
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
 approved_by uuid references auth.users(id) on delete restrict,
 approved_at timestamptz,
 valid_from timestamptz not null,
 expires_at timestamptz not null,
 is_revoked boolean not null default false,
 revision bigint not null default 1 check (revision > 0),
 created_at timestamptz not null default now(),
 constraint external_ai_rights_valid_window check (valid_from < expires_at),
 constraint external_ai_rights_source_doc_fk foreign key (document_id,source_id)
   references public.corpus_documents(id,source_id) on update restrict on delete restrict,
 constraint external_ai_rights_fragment_doc_hash_fk foreign key (fragment_id,document_id,origin_sha256_hex)
   references public.corpus_fragments(id,document_id,origin_sha256_hex) on update restrict on delete restrict,
 constraint external_ai_rights_approval_evidence check (
  rights_status <> 'APPROVED' or
  (approved_by is not null and approved_at is not null
   and nullif(rights_evidence_ref,'') is not null
   and nullif(privacy_evidence_ref,'') is not null)
 )
);
-- Prevent simultaneous active grants for same fragment+provider+operation, regardless of hash.
create unique index external_ai_one_active_grant_per_fragment
 on public.corpus_external_ai_permissions(fragment_id,provider,operation)
 where is_revoked=false and admission_status='ADMITTED';
create index external_ai_rights_doc_idx on public.corpus_external_ai_permissions(document_id);
alter table public.corpus_external_ai_permissions enable row level security;
revoke all on public.corpus_external_ai_permissions from public,anon,authenticated;
-- No user-facing RLS policy. Service-role bypasses RLS: only protected server code may use this.
-- Do not treat this proposal as an atomic reservation. A separate transactional DB claim/revoke
-- protocol, independently tested under concurrent sessions, is required before deployment.
commit;

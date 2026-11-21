-- Disposable Postgres 16 only. Fail CI on unexpected acceptance.
do $$
begin
 if (select count(*) from pg_constraint where conname in
 ('external_ai_rights_source_doc_fk','external_ai_rights_fragment_doc_hash_fk','corpus_fragments_origin_is_document_file'))<>3 then
 raise exception 'Missing composite FKs'; end if;
 if exists(select 1 from pg_policies where tablename='corpus_external_ai_permissions')
 or has_table_privilege('anon','public.corpus_external_ai_permissions','SELECT')
 or has_table_privilege('authenticated','public.corpus_external_ai_permissions','SELECT')
 then raise exception 'Unexpected public permissions';end if;
end $$;
insert into public.corpus_external_ai_permissions (
 source_id,document_id,fragment_id,origin_sha256_hex,text_sha256_hex,
 operation,provider,purpose,rights_status,privacy_status,pii_review_status,
 admission_status,approved_by,approved_at,rights_evidence_ref,privacy_evidence_ref,valid_from,expires_at
) values (
 '11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221',
 '33333333-3333-4333-8333-333333333331',repeat('a',64),repeat('c',64),
 'EXTERNAL_AI_TDM','deepseek','clinical_education_atomization','APPROVED',
 'APPROVED','CLEARED','ADMITTED','99999999-9999-4999-8999-999999999999',
 '2026-11-13 12:00:00+00','synthetic-rights','synthetic-privacy',
 '2026-11-13','2026-12-01'
);
do $$
begin
 begin
 insert into public.corpus_external_ai_permissions
 (source_id,document_id,fragment_id,origin_sha256_hex,text_sha256_hex,operation,provider,purpose,valid_from,expires_at)
 values ('11111111-1111-4111-8111-111111111112','22222222-2222-4222-8222-222222222221',
 '33333333-3333-4333-8333-333333333331',repeat('a',64),repeat('d',64),
 'EXTERNAL_AI_TDM','deepseek','clinical_education_atomization','2026-11-13','2026-12-01');
 raise exception 'SOURCE_DOC_FK_BYPASS';
 exception when foreign_key_violation then null; end;
 begin
 insert into public.corpus_external_ai_permissions
 (source_id,document_id,fragment_id,origin_sha256_hex,text_sha256_hex,operation,provider,purpose,valid_from,expires_at)
 values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221',
 '33333333-3333-4333-8333-333333333332',repeat('a',64),repeat('e',64),
 'EXTERNAL_AI_TDM','deepseek','clinical_education_atomization','2026-11-13','2026-12-01');
 raise exception 'FRAGMENT_DOC_FK_BYPASS';
 exception when foreign_key_violation then null; end;
 begin
 insert into public.corpus_fragments values ('33333333-3333-4333-8333-333333333333',
 '22222222-2222-4222-8222-222222222221',repeat('f',64));
 raise exception 'ORIGIN_FILE_SHA_FK_BYPASS';
 exception when foreign_key_violation then null; end;
 begin
 insert into public.corpus_external_ai_permissions
 (source_id,document_id,fragment_id,origin_sha256_hex,text_sha256_hex,operation,provider,purpose,valid_from,expires_at,admission_status)
 values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221',
 '33333333-3333-4333-8333-333333333331',repeat('a',64),repeat('f',64),
 'EXTERNAL_AI_TDM','deepseek','clinical_education_atomization','2026-11-13','2026-12-01','ADMITTED');
 raise exception 'ACTIVE_UNIQUE_BYPASS';
 exception when unique_violation then null; end;
 update public.corpus_external_ai_permissions set is_revoked=true,admission_status='REVOKED',rights_status='REVOKED'
 where fragment_id='33333333-3333-4333-8333-333333333331';
 insert into public.corpus_external_ai_permissions
 (source_id,document_id,fragment_id,origin_sha256_hex,text_sha256_hex,operation,provider,purpose,valid_from,expires_at,admission_status)
 values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221',
 '33333333-3333-4333-8333-333333333331',repeat('a',64),repeat('f',64),
 'EXTERNAL_AI_TDM','deepseek','clinical_education_atomization','2026-11-13','2026-12-01','NOT_ADMITTED');
 if (select count(*) from public.corpus_external_ai_permissions)<>2 then
 raise exception 'REVOCATION_HISTORY_ERROR';end if;
 raise notice 'PASS: synthetic cross-table FKs, file SHA, single active grant, RLS grants, revocation history';
end $$;

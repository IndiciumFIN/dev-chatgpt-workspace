-- Synthetic Postgres schema. NO SOT data or credentials.
create schema auth;
create table auth.users(id uuid primary key);
create role anon nologin;
create role authenticated nologin;
create table public.corpus_sources(id uuid primary key);
create table public.corpus_documents(id uuid primary key,source_id uuid not null references public.corpus_sources(id));
create table public.corpus_document_files(document_id uuid not null references public.corpus_documents(id),sha256_hex text not null,unique(document_id,sha256_hex));
create table public.corpus_fragments(id uuid primary key,document_id uuid not null references public.corpus_documents(id),origin_sha256_hex text not null);
insert into auth.users values ('99999999-9999-4999-8999-999999999999');
insert into public.corpus_sources values ('11111111-1111-4111-8111-111111111111'),('11111111-1111-4111-8111-111111111112');
insert into public.corpus_documents values
 ('22222222-2222-4222-8222-222222222221','11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111112');
insert into public.corpus_document_files values
 ('22222222-2222-4222-8222-222222222221',repeat('a',64)),
 ('22222222-2222-4222-8222-222222222222',repeat('b',64));
insert into public.corpus_fragments values
 ('33333333-3333-4333-8333-333333333331','22222222-2222-4222-8222-222222222221',repeat('a',64)),
 ('33333333-3333-4333-8333-333333333332','22222222-2222-4222-8222-222222222222',repeat('b',64));

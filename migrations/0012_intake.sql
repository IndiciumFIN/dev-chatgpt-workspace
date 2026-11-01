-- Linha de entrada. O arquivo homologado vira uma linha classificada. O texto do instrumento só existe em tool_text, uma chave para todos os idiomas.

create table if not exists locale (
  id text primary key,
  label text not null,
  source boolean not null default false
);

insert into locale (id, label, source)
values
  ('pt-BR', 'Português do Brasil', true),
  ('en', 'Inglês', false),
  ('es', 'Espanhol', false)
on conflict (id) do nothing;

create table if not exists intake_batch (
  id text primary key,
  source text not null,
  taken_at timestamptz not null default now()
);

create table if not exists intake_file (
  batch_id text not null references intake_batch (id),
  path text not null,
  locale text not null,
  module text not null,
  verdict text not null check (verdict in ('admitir', 'espera', 'recusar')),
  reason text not null,
  primary key (batch_id, path)
);

create table if not exists tool_text (
  slug text not null references source_tool (slug),
  locale text not null references locale (id),
  title text not null,
  lead text not null,
  primary key (slug, locale)
);

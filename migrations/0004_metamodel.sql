-- Metamodelo inicial. Não recria user, session, account, verification, member,
-- subscription, community_post nem source_tool. A fórmula continua em
-- src/lib/tools/formulas.ts. Dado de paciente não tem coluna.

alter table source_tool add column if not exists category text;
alter table source_tool add column if not exists nanda_mode text;
alter table source_tool add column if not exists band_from text;
alter table source_tool add column if not exists evidence text;
alter table source_tool add column if not exists version text;
alter table source_tool add column if not exists updated_by text;

create table if not exists process (
  id text primary key,
  enabled boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists piece (
  id text primary key,
  kind text not null,
  title text not null,
  body text not null default '',
  published boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists page (
  slug text primary key,
  kind text not null check (kind in (
    'secao', 'artigo', 'guia', 'biblioteca', 'norma',
    'institucional', 'editorial', 'formulario', 'laudo'
  )),
  title text not null,
  lead text not null default '',
  published boolean not null default false,
  piece_id text references piece (id) on delete set null,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists block (
  page_slug text not null references page (slug) on delete cascade,
  position integer not null check (position > 0),
  title text not null,
  body text not null,
  primary key (page_slug, position)
);

create table if not exists media (
  id text primary key,
  path text not null unique,
  alt text not null,
  caption text not null default '',
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists media_layer (
  media_id text not null references media (id) on delete cascade,
  position integer not null check (position between 1 and 4),
  kind text not null check (kind in ('fundo', 'marca', 'titulo', 'legenda')),
  value text not null,
  primary key (media_id, position)
);

create table if not exists page_media (
  page_slug text not null references page (slug) on delete cascade,
  media_id text not null references media (id) on delete cascade,
  position integer not null check (position > 0),
  primary key (page_slug, media_id)
);

create table if not exists tool_criterion (
  tool_slug text not null references source_tool (slug) on delete cascade,
  id text not null,
  label text not null,
  help text not null default '',
  position integer not null check (position > 0),
  primary key (tool_slug, id)
);

create table if not exists tool_choice (
  tool_slug text not null,
  criterion_id text not null,
  value integer not null,
  label text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, criterion_id, value),
  foreign key (tool_slug, criterion_id) references tool_criterion (tool_slug, id) on delete cascade
);

create table if not exists tool_field (
  tool_slug text not null references source_tool (slug) on delete cascade,
  id text not null,
  label text not null,
  unit text not null,
  min_value numeric not null,
  max_value numeric not null,
  step numeric not null,
  position integer not null check (position > 0),
  primary key (tool_slug, id),
  check (min_value <= max_value)
);

create table if not exists tool_select (
  tool_slug text not null references source_tool (slug) on delete cascade,
  id text not null,
  label text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, id)
);

create table if not exists tool_select_option (
  tool_slug text not null,
  select_id text not null,
  value integer not null,
  label text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, select_id, value),
  foreign key (tool_slug, select_id) references tool_select (tool_slug, id) on delete cascade
);

create table if not exists tool_meta (
  tool_slug text not null references source_tool (slug) on delete cascade,
  id text not null,
  label text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, id)
);

create table if not exists tool_meta_option (
  tool_slug text not null,
  meta_id text not null,
  value text not null,
  label text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, meta_id, value),
  foreign key (tool_slug, meta_id) references tool_meta (tool_slug, id) on delete cascade
);

create table if not exists tool_output (
  tool_slug text not null references source_tool (slug) on delete cascade,
  id text not null,
  label text not null,
  unit text not null,
  digits integer not null check (digits between 0 and 6),
  position integer not null check (position > 0),
  primary key (tool_slug, id)
);

create table if not exists tool_band (
  tool_slug text not null references source_tool (slug) on delete cascade,
  min_score numeric not null,
  max_score numeric not null,
  label text not null,
  tone text not null check (tone in ('ok', 'info', 'warn', 'danger')),
  note text not null,
  primary key (tool_slug, min_score),
  check (min_score <= max_score)
);

create table if not exists tool_band_nanda (
  tool_slug text not null,
  min_score numeric not null,
  label text not null,
  primary key (tool_slug, min_score, label),
  foreign key (tool_slug, min_score) references tool_band (tool_slug, min_score) on delete cascade
);

create table if not exists tool_reference (
  tool_slug text not null references source_tool (slug) on delete cascade,
  position integer not null check (position > 0),
  citation text not null,
  primary key (tool_slug, position)
);

create table if not exists tool_step (
  tool_slug text not null references source_tool (slug) on delete cascade,
  position integer not null check (position > 0),
  body text not null,
  primary key (tool_slug, position)
);

create table if not exists tool_faq (
  tool_slug text not null references source_tool (slug) on delete cascade,
  position integer not null check (position > 0),
  question text not null,
  answer text not null,
  primary key (tool_slug, position)
);

create table if not exists tool_related (
  tool_slug text not null references source_tool (slug) on delete cascade,
  related_slug text not null,
  position integer not null check (position > 0),
  primary key (tool_slug, related_slug)
);

create table if not exists tool_specific (
  tool_slug text not null references source_tool (slug) on delete cascade,
  position integer not null check (position > 0),
  body text not null,
  primary key (tool_slug, position)
);

insert into process (id, enabled)
values
  ('publicar_ferramenta', true),
  ('assinatura', true),
  ('comunidade', true)
on conflict (id) do nothing;

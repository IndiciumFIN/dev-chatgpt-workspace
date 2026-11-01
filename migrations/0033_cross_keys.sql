-- Liga as famílias que ainda eram texto. Paciente e escore da visita continuam fora.

create table if not exists content_place (
  id text primary key,
  object_slug text,
  section_slug text references section_page (slug),
  inst_path text references inst_page (path),
  check (object_slug is not null or section_slug is not null or inst_path is not null)
);

create unique index if not exists content_place_object_slug on content_place (object_slug) where object_slug is not null;
create unique index if not exists content_place_section_slug on content_place (section_slug) where section_slug is not null;
create unique index if not exists content_place_inst_path on content_place (inst_path) where inst_path is not null;

insert into content_place (id, section_slug)
select slug, slug from section_page
on conflict (id) do update set section_slug = excluded.section_slug
where content_place.section_slug is null;

update content_place as place
set inst_path = page.path
from inst_page as page
where place.inst_path is null
  and page.path = place.id
  and not exists (select 1 from content_place as other where other.inst_path = page.path);

insert into content_place (id, inst_path)
select regexp_replace(path, '^.*/', ''), path
from inst_page
where path <> ''
  and not exists (select 1 from content_place as place where place.id = regexp_replace(inst_page.path, '^.*/', ''))
  and not exists (select 1 from content_place as place where place.inst_path = inst_page.path)
on conflict (id) do nothing;

update content_place as place
set inst_path = page.path
from inst_page as page
where place.inst_path is null
  and page.path <> ''
  and place.id = regexp_replace(page.path, '^.*/', '')
  and not exists (select 1 from content_place as other where other.inst_path = page.path);

create table if not exists screen_dest (
  id text primary key,
  kind text not null check (kind in ('home', 'section', 'tool', 'page', 'model')),
  place_id text references content_place (id),
  tool_slug text,
  hash text not null default '',
  page_to text not null default '',
  model_id text not null default '',
  check (
    (kind = 'home' and place_id is null and tool_slug is null and hash = '' and page_to = '' and model_id = '')
    or (kind = 'section' and place_id is not null and tool_slug is null and page_to = '' and model_id = '')
    or (kind = 'tool' and tool_slug is not null and place_id is null and hash = '' and page_to = '' and model_id = '')
    or (kind = 'page' and page_to <> '' and place_id is null and tool_slug is null and hash = '' and model_id = '' and page_to in ('/sistema', '/pacote', '/login', '/conta', '/blog/mary-eliza-mahoney'))
    or (kind = 'model' and model_id <> '' and place_id is null and tool_slug is null and page_to = '' and model_id in ('biblioteca', 'slides', 'guia', 'laudo'))
  )
);

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id)
select
  shaped.id,
  shaped.kind,
  shaped.place_id,
  shaped.tool_slug,
  shaped.hash,
  shaped.page_to,
  shaped.model_id
from (
  select distinct
    case dest.dest_kind
      when 'home' then 'home'
      when 'section' then 'section:' || dest.dest_slug || case when coalesce(dest.dest_hash, '') = '' then '' else ':' || dest.dest_hash end
      when 'tool' then 'tool:' || dest.dest_slug
      when 'page' then 'page:' || dest.dest_to
      when 'model' then 'model:' || dest.dest_model || case when coalesce(dest.dest_hash, '') = '' then '' else ':' || dest.dest_hash end
    end as id,
    dest.dest_kind as kind,
    case when dest.dest_kind = 'section' then dest.dest_slug else null end as place_id,
    case when dest.dest_kind = 'tool' then dest.dest_slug else null end as tool_slug,
    case when dest.dest_kind in ('section', 'model') then coalesce(dest.dest_hash, '') else '' end as hash,
    case when dest.dest_kind = 'page' then coalesce(dest.dest_to, '') else '' end as page_to,
    case when dest.dest_kind = 'model' then coalesce(dest.dest_model, '') else '' end as model_id
  from (
    select dest_kind, dest_slug, dest_hash, dest_to, dest_model from nav_item where dest_kind is not null
    union
    select dest_kind, dest_slug, dest_hash, dest_to, dest_model from section_link where dest_kind is not null
    union
    select 'tool', slug, null, null, null from catalog_item where slug is not null
    union
    select 'section', section, hash, null, null from catalog_item where section is not null
  ) as dest
) as shaped
where shaped.id is not null
on conflict (id) do nothing;

alter table nav_item add column if not exists dest_id text;
alter table section_link add column if not exists dest_id text;
alter table catalog_item add column if not exists dest_id text;

update nav_item
set dest_id = case dest_kind
  when 'home' then 'home'
  when 'section' then 'section:' || dest_slug || case when coalesce(dest_hash, '') = '' then '' else ':' || dest_hash end
  when 'tool' then 'tool:' || dest_slug
  when 'page' then 'page:' || dest_to
  when 'model' then 'model:' || dest_model || case when coalesce(dest_hash, '') = '' then '' else ':' || dest_hash end
end
where dest_kind is not null and dest_id is null;

update section_link
set dest_id = case dest_kind
  when 'home' then 'home'
  when 'section' then 'section:' || dest_slug || case when coalesce(dest_hash, '') = '' then '' else ':' || dest_hash end
  when 'tool' then 'tool:' || dest_slug
  when 'page' then 'page:' || dest_to
  when 'model' then 'model:' || dest_model || case when coalesce(dest_hash, '') = '' then '' else ':' || dest_hash end
end
where dest_kind is not null and dest_id is null;

update catalog_item
set dest_id = 'tool:' || slug
where slug is not null and dest_id is null;

update catalog_item
set dest_id = 'section:' || section || case when coalesce(hash, '') = '' then '' else ':' || hash end
where section is not null and dest_id is null;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('content_place', 'conteudo', 'id', 'A mesma página nas três famílias.', 'section_slug → section_page.slug; inst_path → inst_page.path; object_slug → content_object.slug'),
  ('screen_dest', 'conteudo', 'id', 'Destino de menu, card e item.', 'place_id → content_place.id; tool_slug → source_tool.slug')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('content_place', 'id', 'texto', true, true, null, 'Identidade do lugar.', 'texto', null),
  ('content_place', 'object_slug', 'texto', false, false, 'content_object', 'Objeto canônico deste lugar.', 'slug de content_object', null),
  ('content_place', 'section_slug', 'texto', false, false, 'section_page', 'Seção de tela deste lugar.', 'slug de section_page', null),
  ('content_place', 'inst_path', 'texto', false, false, 'inst_page', 'Página institucional deste lugar.', 'path de inst_page', null),
  ('screen_dest', 'id', 'texto', true, true, null, 'Identidade do destino.', 'texto', null),
  ('screen_dest', 'kind', 'texto', true, false, null, 'Tipo do destino.', 'home, section, tool, page ou model', null),
  ('screen_dest', 'place_id', 'texto', false, false, 'content_place', 'Lugar quando o destino é seção.', 'id de content_place', null),
  ('screen_dest', 'tool_slug', 'texto', false, false, 'source_tool', 'Ferramenta quando o destino é instrumento.', 'slug de source_tool', null)
on conflict (entity, name) do nothing;

insert into schema_relation (from_entity, name, to_entity, cardinality, from_column, to_column, definition)
values
  ('section_page', 'lugar', 'content_place', '1:1', 'slug', 'section_slug', 'Uma seção de tela tem no máximo um lugar.'),
  ('inst_page', 'lugar', 'content_place', '1:1', 'path', 'inst_path', 'Uma página institucional tem no máximo um lugar.'),
  ('content_object', 'lugar', 'content_place', '1:1', 'slug', 'object_slug', 'Um objeto canônico tem no máximo um lugar.'),
  ('content_place', 'destinos', 'screen_dest', '1:N', 'id', 'place_id', 'Um lugar abre vários destinos de seção, inclusive com âncora.'),
  ('screen_dest', 'menus', 'nav_item', '1:N', 'id', 'dest_id', 'Um destino é usado por vários itens de menu.'),
  ('screen_dest', 'itens', 'section_link', '1:N', 'id', 'dest_id', 'Um destino é usado por vários itens de seção.'),
  ('screen_dest', 'cards', 'catalog_item', '1:N', 'id', 'dest_id', 'Um destino é usado por vários cards.'),
  ('nav_item', 'filhos', 'nav_item', '1:N', 'id', 'parent_id', 'Um item de menu contém outros itens.'),
  ('source_tool', 'conta', 'tool_formula', '1:1', 'slug', 'tool_slug', 'A capa da ferramenta é dona do método da conta.'),
  ('locale', 'rotulos', 'chrome_label', '1:N', 'id', 'locale', 'Um idioma tem vários rótulos.'),
  ('locale', 'textos', 'content_text', '1:N', 'id', 'locale', 'Um idioma tem vários textos de objeto.')
on conflict (from_entity, name) do nothing;

insert into business_rule (id, from_entity, to_entity, statement, enforcement)
values
  ('br-lugar-objeto', 'content_place', 'content_object', 'O lugar aponta para o objeto, a seção ou a página institucional que existem.', 'foreign key content_place'),
  ('br-destino-menu', 'nav_item', 'screen_dest', 'Menu, card e item de seção apontam para um destino, não para texto solto.', 'foreign key dest_id'),
  ('br-formula-capa', 'tool_formula', 'source_tool', 'O método da conta aponta para a capa da ferramenta.', 'foreign key tool_formula'),
  ('br-locale-rotulo', 'chrome_label', 'locale', 'Rótulo traduzido aponta para um idioma cadastrado.', 'foreign key chrome_label.locale'),
  ('br-locale-texto', 'content_text', 'locale', 'Texto de objeto aponta para um idioma cadastrado.', 'foreign key content_text.locale')
on conflict (id) do nothing;

insert into policy_rule (package_id, id, subject_role, action, effect, reason)
values
  ('acesso', 'admin-grava-governanca', 'admin', 'gravar_governanca', 'allow', 'O administrador grava rascunho de governança.'),
  ('acesso', 'admin-muda-papel', 'admin', 'mudar_papel', 'allow', 'O administrador muda o papel de uma pessoa.'),
  ('acesso', 'admin-assume', 'admin', 'assumir_politica', 'allow', 'O administrador assume a política vigente.'),
  ('acesso', 'admin-restaura', 'admin', 'restaurar_conteudo', 'allow', 'O administrador restaura uma cópia da fonte.'),
  ('acesso', 'agente-nao-governa', 'agente', 'gravar_governanca', 'deny', 'Agente não grava governança.'),
  ('acesso', 'agente-nao-papel', 'agente', 'mudar_papel', 'deny', 'Agente não muda papel.'),
  ('acesso', 'agente-nao-restaura', 'agente', 'restaurar_conteudo', 'deny', 'Agente não restaura a fonte.'),
  ('acesso', 'assinante-nao-grava', 'assinante', 'gravar_ficha', 'deny', 'Assinante não grava a fonte.')
on conflict (package_id, id) do nothing;

do $$
declare
  orphans integer;
begin
  if to_regclass('public.locale') is not null and to_regclass('public.chrome_label') is not null then
    insert into locale (id, label, source)
    select distinct locale,
      case locale
        when 'pt-BR' then 'Português do Brasil'
        when 'pt' then 'Português'
        when 'en' then 'Inglês'
        when 'es' then 'Espanhol'
        when 'fr' then 'Francês'
        else locale
      end,
      locale = 'pt-BR'
    from chrome_label
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.locale') is not null and to_regclass('public.content_text') is not null then
    insert into locale (id, label, source)
    select distinct locale, locale, locale = 'pt-BR'
    from content_text
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.locale') is not null and to_regclass('public.content_alias') is not null then
    insert into locale (id, label, source)
    select distinct locale, locale, locale = 'pt-BR'
    from content_alias
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.locale') is not null and to_regclass('public.intake_file') is not null then
    insert into locale (id, label, source)
    select distinct locale, locale, false
    from intake_file
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.content_object') is not null then
    update content_place as place
    set object_slug = object.slug
    from content_object as object
    where place.object_slug is null
      and object.slug = place.id
      and not exists (select 1 from content_place as other where other.object_slug = object.slug);

    insert into content_place (id, object_slug)
    select slug, slug
    from content_object
    where not exists (select 1 from content_place as place where place.object_slug = content_object.slug or place.id = content_object.slug)
    on conflict (id) do update set object_slug = excluded.object_slug
    where content_place.object_slug is null;
  end if;

  if to_regclass('public.content_object') is not null
     and not exists (select 1 from pg_constraint where conname = 'content_place_object_fkey') then
    alter table content_place
      add constraint content_place_object_fkey foreign key (object_slug) references content_object (slug);
  end if;

  if to_regclass('public.source_tool') is not null
     and not exists (select 1 from pg_constraint where conname = 'screen_dest_tool_fkey') then
    select count(*) into orphans
    from screen_dest as dest
    where dest.tool_slug is not null
      and not exists (select 1 from source_tool as tool where tool.slug = dest.tool_slug);
    if orphans = 0 then
      alter table screen_dest
        add constraint screen_dest_tool_fkey foreign key (tool_slug) references source_tool (slug);
    end if;
  end if;

  if to_regclass('public.source_tool') is not null
     and not exists (select 1 from pg_constraint where conname = 'tool_formula_tool_fkey') then
    select count(*) into orphans
    from tool_formula as formula
    where not exists (select 1 from source_tool as tool where tool.slug = formula.tool_slug);
    if orphans = 0 then
      alter table tool_formula
        add constraint tool_formula_tool_fkey foreign key (tool_slug) references source_tool (slug);
    end if;
  end if;

  if to_regclass('public.locale') is not null
     and to_regclass('public.chrome_label') is not null
     and not exists (select 1 from pg_constraint where conname = 'chrome_label_locale_fkey') then
    alter table chrome_label
      add constraint chrome_label_locale_fkey foreign key (locale) references locale (id);
  end if;

  if to_regclass('public.locale') is not null
     and to_regclass('public.content_text') is not null
     and not exists (select 1 from pg_constraint where conname = 'content_text_locale_fkey') then
    alter table content_text
      add constraint content_text_locale_fkey foreign key (locale) references locale (id);
  end if;

  if to_regclass('public.locale') is not null
     and to_regclass('public.content_alias') is not null
     and not exists (select 1 from pg_constraint where conname = 'content_alias_locale_fkey') then
    alter table content_alias
      add constraint content_alias_locale_fkey foreign key (locale) references locale (id);
  end if;

  if to_regclass('public.locale') is not null
     and to_regclass('public.intake_file') is not null
     and not exists (select 1 from pg_constraint where conname = 'intake_file_locale_fkey') then
    select count(*) into orphans
    from intake_file as file
    where not exists (select 1 from locale where locale.id = file.locale);
    if orphans = 0 then
      alter table intake_file
        add constraint intake_file_locale_fkey foreign key (locale) references locale (id);
    end if;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nav_item_parent_fkey') then
    alter table nav_item
      add constraint nav_item_parent_fkey foreign key (parent_id) references nav_item (id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nav_item_dest_fkey') then
    alter table nav_item
      add constraint nav_item_dest_fkey foreign key (dest_id) references screen_dest (id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'section_link_dest_fkey') then
    alter table section_link
      add constraint section_link_dest_fkey foreign key (dest_id) references screen_dest (id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'catalog_item_dest_fkey') then
    alter table catalog_item
      add constraint catalog_item_dest_fkey foreign key (dest_id) references screen_dest (id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inst_child_child_fkey') then
    alter table inst_child
      add constraint inst_child_child_fkey foreign key (child_path) references inst_page (path);
  end if;

  if to_regclass('public.user') is not null and to_regclass('public.member') is not null
     and not exists (select 1 from pg_constraint where conname = 'member_user_fkey') then
    select count(*) into orphans from member where not exists (select 1 from "user" where "user".id = member.user_id);
    if orphans = 0 then
      alter table member
        add constraint member_user_fkey foreign key (user_id) references "user" (id);
    end if;
  end if;

  if to_regclass('public.user') is not null and to_regclass('public.subscription') is not null
     and not exists (select 1 from pg_constraint where conname = 'subscription_user_fkey') then
    select count(*) into orphans from subscription where not exists (select 1 from "user" where "user".id = subscription.user_id);
    if orphans = 0 then
      alter table subscription
        add constraint subscription_user_fkey foreign key (user_id) references "user" (id);
    end if;
  end if;

  if to_regclass('public.user') is not null and to_regclass('public.community_post') is not null
     and not exists (select 1 from pg_constraint where conname = 'community_post_user_fkey') then
    select count(*) into orphans from community_post where not exists (select 1 from "user" where "user".id = community_post.user_id);
    if orphans = 0 then
      alter table community_post
        add constraint community_post_user_fkey foreign key (user_id) references "user" (id);
    end if;
  end if;
end $$;

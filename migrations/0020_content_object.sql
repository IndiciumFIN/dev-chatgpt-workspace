-- O objeto é a fonte. O endereço é um apelido. Tradução que não foi publicada não abre.

create table if not exists content_object (
  slug text primary key,
  kind text not null check (kind in ('instrumento', 'biblioteca', 'guia', 'editorial', 'norma', 'institucional', 'pagina')),
  origin_path text not null unique
);

create table if not exists content_text (
  slug text not null references content_object (slug),
  locale text not null,
  view text not null check (view in ('leitura', 'calculadora', 'formulario', 'impressao')),
  title text not null,
  lead text not null,
  body text not null default '',
  status text not null check (status in ('rascunho', 'publicado')),
  primary key (slug, locale, view)
);

create table if not exists content_alias (
  path text primary key,
  slug text not null references content_object (slug),
  locale text not null,
  view text not null check (view in ('leitura', 'calculadora', 'formulario', 'impressao'))
);

insert into content_object (slug, kind, origin_path)
select
  regexp_replace(substring(path from 2), '\.html$', ''),
  case
    when regexp_replace(substring(path from 2), '\.html$', '') in ('apgar', 'braden', 'gotejamento', 'imc', 'morse') then 'instrumento'
    when kind = 'biblioteca' then 'biblioteca'
    when kind = 'guia' then 'guia'
    when kind = 'editorial' then 'editorial'
    when kind = 'norma' then 'norma'
    when path like '%institucional%' or path like '/secao/%' then 'institucional'
    else 'pagina'
  end,
  path
from site_route
where locale = 'pt-BR'
  and path = canonical_path
  and path !~ '^/conta/'
  and path !~ '^/partials/'
  and path <> '/index.html'
  and path <> '/formulario_morse.html'
  and path !~ '/footer\.html$'
  and path !~ '/menu-global\.html$'
  and path !~ '/global-body-elements\.html$'
  and not exists (
    select 1 from information_schema.columns
    where table_name = 'content_object' and column_name = 'tool_slug'
  )
on conflict (slug) do nothing;

insert into content_alias (path, slug, locale, view)
select
  origin_path,
  slug,
  'pt-BR',
  case
    when kind = 'instrumento' then 'calculadora'
    when origin_path like '/formulario%' then 'formulario'
    else 'leitura'
  end
from content_object
on conflict (path) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
select a.slug, 'pt-BR', a.view, r.title, r.lead, r.body, 'publicado'
from content_alias a
join site_route r on r.path = a.path
where a.locale = 'pt-BR'
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view)
select r.path, o.slug, r.locale, a.view
from site_route r
join content_object o on o.origin_path = r.canonical_path
join content_alias a on a.path = o.origin_path
where r.path <> o.origin_path
  and r.locale <> 'pt-BR'
on conflict (path) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
select a.slug, a.locale, a.view, r.title, r.lead, r.body, 'rascunho'
from content_alias a
join site_route r on r.path = a.path
where a.locale <> 'pt-BR'
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view)
select '/formulario_morse.html', 'morse', 'pt-BR', 'formulario'
where exists (select 1 from content_object where slug = 'morse')
on conflict (path) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
select 'morse', 'pt-BR', 'formulario', title, lead, body, 'publicado'
from site_route
where path = '/formulario_morse.html'
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view)
select r.path, map.slug, r.locale, 'formulario'
from site_route r
join (
  values
    ('formulario_escala_de_bishop.html', 'formulario_bishop'),
    ('formulario_escala_de_bps.html', 'formulario_bps'),
    ('formulario_escala_de_cam.html', 'formulario_cam'),
    ('formulario_escala_de_capurro.html', 'formulario_capurro'),
    ('formulario_escala_de_cincinnati.html', 'formulario_escala_cincinnati'),
    ('formulario_escala_de_curb-65.html', 'formulario_escala_curb65'),
    ('formulario_escala_de_fugulin.html', 'formulario_de_fugulin'),
    ('formulario_escala_de_meem.html', 'formulario_meem'),
    ('formulario_escala_de_morse.html', 'morse')
) as map(file, slug) on r.path like ('%/' || map.file)
where exists (select 1 from content_object o where o.slug = map.slug)
on conflict (path) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
select a.slug, a.locale, a.view, r.title, r.lead, r.body, 'rascunho'
from content_alias a
join site_route r on r.path = a.path
where a.view = 'formulario'
  and a.locale <> 'pt-BR'
on conflict (slug, locale, view) do nothing;

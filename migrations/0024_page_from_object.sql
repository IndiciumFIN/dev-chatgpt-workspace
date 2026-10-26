-- Página, peça e bloco passam a ser projeção do objeto.
-- Um texto publicado em português por objeto. Rascunho e outra vista não viram página.

alter table page drop constraint if exists page_kind_check;

alter table page add constraint page_kind_check
  check (kind in (
    'secao', 'artigo', 'guia', 'biblioteca', 'norma',
    'institucional', 'editorial', 'formulario', 'laudo',
    'instrumento', 'simulado', 'pagina'
  ));

insert into piece (id, kind, title, body, published)
select
  object.slug,
  object.kind,
  copy.title,
  copy.body,
  true
from content_object as object
join lateral (
  select title, body
  from content_text
  where slug = object.slug
    and locale = 'pt-BR'
    and status = 'publicado'
  order by case view
    when 'leitura' then 0
    when 'calculadora' then 1
    when 'formulario' then 2
    else 3
  end,
  view
  limit 1
) as copy on true
on conflict (id) do nothing;

insert into page (slug, kind, title, lead, published, piece_id)
select
  object.slug,
  case object.kind
    when 'biblioteca' then 'biblioteca'
    when 'guia' then 'guia'
    when 'norma' then 'norma'
    when 'institucional' then 'institucional'
    when 'editorial' then 'editorial'
    when 'instrumento' then 'instrumento'
    when 'simulado' then 'simulado'
    when 'pagina' then 'pagina'
    else 'secao'
  end,
  copy.title,
  copy.lead,
  true,
  object.slug
from content_object as object
join lateral (
  select title, lead
  from content_text
  where slug = object.slug
    and locale = 'pt-BR'
    and status = 'publicado'
  order by case view
    when 'leitura' then 0
    when 'calculadora' then 1
    when 'formulario' then 2
    else 3
  end,
  view
  limit 1
) as copy on true
on conflict (slug) do nothing;

insert into block (page_slug, position, title, body)
select
  object.slug,
  1,
  copy.title,
  copy.body
from content_object as object
join lateral (
  select title, body
  from content_text
  where slug = object.slug
    and locale = 'pt-BR'
    and status = 'publicado'
  order by case view
    when 'leitura' then 0
    when 'calculadora' then 1
    when 'formulario' then 2
    else 3
  end,
  view
  limit 1
) as copy on true
on conflict do nothing;

-- Todo instrumento tem capa em source_tool. Só abre como cálculo quem tem fórmula.
-- Os outros ficam com a capa e a página, sem ficha de campo.

insert into source_tool (slug, kind, title, lead, published)
select
  object.slug,
  case
    when object.slug in (
      'adicional-noturno', 'balancohidrico', 'calculo-de-ferias', 'calculo-hora-extra', 'calculo-rescisao',
      'dimensionamento', 'dimensionamento-cofen', 'exames_laboratoriais', 'gasometria', 'gestacional',
      'gotejamento', 'imc', 'insulina', 'matriz-de-risco', 'medicacao', 'medicamentos'
    ) then 'calculadora'
    else 'escala'
  end,
  copy.title,
  copy.lead,
  object.slug in ('apgar', 'braden', 'gotejamento', 'imc', 'morse')
from content_object as object
join lateral (
  select title, lead
  from content_text
  where slug = object.slug and locale = 'pt-BR' and status = 'publicado'
  order by case view when 'calculadora' then 0 when 'leitura' then 1 else 2 end
  limit 1
) as copy on true
where object.kind = 'instrumento'
on conflict (slug) do nothing;

insert into tool_text (slug, locale, title, lead)
select slug, 'pt-BR', title, lead
from source_tool
on conflict (slug, locale) do nothing;

alter table content_object add column if not exists tool_slug text references source_tool (slug);

update content_object
set tool_slug = slug
where kind = 'instrumento'
  and tool_slug is null
  and exists (select 1 from source_tool where source_tool.slug = content_object.slug);

alter table content_object drop constraint if exists content_object_tool_link;
alter table content_object add constraint content_object_tool_link
  check (kind <> 'instrumento' or tool_slug is not null);

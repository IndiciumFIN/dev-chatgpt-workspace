-- A biblioteca deixa o desenho genérico e a ficha repetida. Cada prateleira lista a página publicada, uma vez por título.

delete from library_item
where shelf_id in ('anatomia', 'seringas', 'imagens', 'thumbnails', 'pdfs', 'slides', 'infograficos');

update library_shelf
set kind = 'thumbs', lead = 'Fichas de anatomia já publicadas. A cópia com o mesmo título não entra de novo.'
where id = 'anatomia';

update library_shelf
set kind = 'thumbs', lead = 'Fichas de seringa e agulha já publicadas, sem repetir o mesmo título.'
where id = 'seringas';

update library_shelf
set kind = 'thumbs', lead = 'Fichas de imagem já publicadas. A marca do site não é item desta prateleira.'
where id = 'imagens';

update library_shelf
set kind = 'pdfs', lead = 'Ficha cujo material publicado é um PDF.'
where id = 'pdfs';

update library_shelf
set kind = 'thumbs', lead = 'Infográficos já publicados, um endereço por título.'
where id = 'infograficos';

insert into library_item (shelf_id, position, title, text, href)
select picked.shelf_id, row_number() over (partition by picked.shelf_id order by picked.title), picked.title, '', picked.path
from (
  select distinct on (bucket.shelf_id, regexp_replace(lower(copy.title), '^[0-9]{4}[[:space:]]+', ''))
    bucket.shelf_id,
    copy.title,
    alias.path
  from content_object as object
  join content_text as copy on copy.slug = object.slug and copy.locale = 'pt-BR' and copy.view = 'leitura' and copy.status = 'publicado'
  join content_alias as alias on alias.slug = object.slug and alias.locale = 'pt-BR' and alias.view = 'leitura'
  join lateral (
    select case
      when object.slug ~ 'infograf' then 'infograficos'
      when object.slug ~ 'pdf' then 'pdfs'
      when object.slug ~ 'imagem' then 'imagens'
      when object.slug ~ 'seringa|agulha' then 'seringas'
      when object.slug ~ 'anatom' and object.slug !~ 'pinca-anatomica' then 'anatomia'
    end as shelf_id
  ) as bucket on bucket.shelf_id is not null
  where object.kind = 'biblioteca'
  order by bucket.shelf_id, regexp_replace(lower(copy.title), '^[0-9]{4}[[:space:]]+', ''), (object.slug ~ '-2$' or object.slug ~ '/[0-9]{4}-'), object.slug
) as picked;

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id)
values ('model:slides', 'model', null, null, '', '', 'slides')
on conflict (id) do nothing;

update nav_item
set dest_hash = null, dest_model = 'slides', dest_id = 'model:slides'
where id = 'slides';

update section_link
set dest_hash = null, dest_model = 'slides', dest_id = 'model:slides'
where item_id = 'slides';

delete from section_link
where slug = 'biblioteca' and item_id = 'thumbnails';

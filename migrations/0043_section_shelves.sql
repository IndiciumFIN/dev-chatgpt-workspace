-- As prateleiras publicadas abrem na seção Biblioteca. O modelo fica só com a amostra.

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id)
select 'section:biblioteca:' || shelf.id, 'section', 'biblioteca', null, shelf.id, '', ''
from (values ('anatomia'), ('seringas'), ('imagens'), ('pdfs'), ('infograficos')) as shelf (id)
on conflict (id) do nothing;

update nav_item
set dest_kind = 'section', dest_slug = 'biblioteca', dest_hash = id, dest_model = null, dest_id = 'section:biblioteca:' || id
where id in ('anatomia', 'seringas', 'imagens', 'pdfs', 'infograficos');

update section_link
set dest_kind = 'section', dest_slug = 'biblioteca', dest_hash = item_id, dest_model = null, dest_id = 'section:biblioteca:' || item_id
where slug = 'biblioteca' and item_id in ('anatomia', 'seringas', 'imagens', 'pdfs', 'infograficos');

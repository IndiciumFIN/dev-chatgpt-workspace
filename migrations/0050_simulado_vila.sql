-- Os cards da home abrem o simulado que está no ar, não um endereço vazio.
update catalog_item
set section = 'simulados', hash = 'treino'
where list_id = 'simulados';

update section_page
set lead = 'Treino dos instrumentos que já estão no ar, com cronômetro. O mesmo banco abre no estúdio. A Vila do Cuidado é outro projeto. Os cadernos de 50 questões não estão neste repositório.'
where slug = 'simulados';

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id) values
('page:/estudo', 'page', null, null, '', '/estudo', ''),
('page:/viladocuidado', 'page', null, null, '', '/viladocuidado', '')
on conflict (id) do nothing;

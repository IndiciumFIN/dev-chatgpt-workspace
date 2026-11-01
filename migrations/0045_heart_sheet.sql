-- A prateleira de anatomia deixa o hub de figuras. A ficha é a do coração humano.

insert into content_object (slug, kind, origin_path)
values ('coracao-humano', 'biblioteca', '/secao/coracao-humano')
on conflict (slug) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
values (
  'coracao-humano',
  'pt-BR',
  'leitura',
  'Coração humano',
  'Órgão muscular central do sistema cardiovascular, responsável pelo bombeamento do sangue para a circulação pulmonar e sistêmica.',
  'O coração humano é um órgão muscular oco, situado no mediastino, entre os pulmões. Sua organização inclui quatro câmaras: dois átrios e dois ventrículos. As quatro principais valvas cardíacas orientam o fluxo sanguíneo: tricúspide, pulmonar, mitral e aórtica. As artérias coronárias irrigam o miocárdio. A drenagem venosa retorna principalmente pelo seio coronário. A regulação cardíaca envolve o sistema nervoso autônomo e o sistema de condução. Tópicos de estudo não são orientação diagnóstica ou terapêutica. Referências bibliográficas clínicas ainda não foram fornecidas para homologação.',
  'publicado'
)
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view)
values ('/secao/coracao-humano', 'coracao-humano', 'pt-BR', 'leitura')
on conflict (path) do nothing;

insert into section_page (slug, kicker, title, lead, kind)
values (
  'coracao-humano',
  'Biblioteca',
  'Coração humano',
  'Órgão muscular central do sistema cardiovascular, responsável pelo bombeamento do sangue para a circulação pulmonar e sistêmica.',
  'pages'
)
on conflict (slug) do nothing;

insert into content_place (id, section_slug)
values ('coracao-humano', 'coracao-humano')
on conflict (id) do nothing;

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id)
values ('section:coracao-humano', 'section', 'coracao-humano', null, '', '', '')
on conflict (id) do nothing;

update nav_item
set dest_kind = 'section', dest_slug = 'coracao-humano', dest_hash = null, dest_model = null, dest_id = 'section:coracao-humano'
where id = 'anatomia';

update section_link
set dest_kind = 'section', dest_slug = 'coracao-humano', dest_hash = null, dest_model = null, dest_id = 'section:coracao-humano',
    title = 'Coração humano', text = 'Ficha do órgão, não o hub de figuras.'
where item_id = 'anatomia';

delete from library_item where shelf_id = 'anatomia';

update library_shelf
set kind = 'thumbs',
    lead = 'A ficha publicada é a do coração humano. As outras estruturas ainda não têm ficha própria.'
where id = 'anatomia';

insert into library_item (shelf_id, position, title, text, href)
values ('anatomia', 1, 'Coração humano', 'Resumo, estruturas, vascularização, inervação e relações de estudo.', '/secao/coracao-humano')
on conflict (shelf_id, position) do nothing;

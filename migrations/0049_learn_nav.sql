-- As páginas migradas entram no menu. O destino de página aceita esses endereços.

do $$
declare item record;
begin
  for item in
    select conname from pg_constraint
    where conrelid = 'screen_dest'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%page_to%'
  loop
    execute format('alter table screen_dest drop constraint %I', item.conname);
  end loop;
end $$;

alter table screen_dest add constraint screen_dest_shape_check check (
  (kind = 'home' and place_id is null and tool_slug is null and hash = '' and page_to = '' and model_id = '')
  or (kind = 'section' and place_id is not null and tool_slug is null and page_to = '' and model_id = '')
  or (kind = 'tool' and tool_slug is not null and place_id is null and hash = '' and page_to = '' and model_id = '')
  or (kind = 'page' and page_to <> '' and place_id is null and tool_slug is null and hash = '' and model_id = '' and page_to in (
    '/sistema', '/pacote', '/login', '/conta', '/blog/mary-eliza-mahoney',
    '/estudo', '/ferramentas-pesquisa', '/concurso', '/sbar', '/album', '/forum', '/curiosidades',
    '/exames-laboratoriais', '/doencas-compulsorias', '/calculadoras-trabalhistas', '/viladocuidado', '/bibliotecas'
  ))
  or (kind = 'model' and model_id <> '' and place_id is null and tool_slug is null and page_to = '' and model_id in ('biblioteca', 'slides', 'guia', 'laudo'))
);

insert into screen_dest (id, kind, place_id, tool_slug, hash, page_to, model_id) values
('page:/estudo', 'page', null, null, '', '/estudo', ''),
('page:/ferramentas-pesquisa', 'page', null, null, '', '/ferramentas-pesquisa', ''),
('page:/concurso', 'page', null, null, '', '/concurso', ''),
('page:/sbar', 'page', null, null, '', '/sbar', ''),
('page:/album', 'page', null, null, '', '/album', ''),
('page:/forum', 'page', null, null, '', '/forum', ''),
('page:/curiosidades', 'page', null, null, '', '/curiosidades', ''),
('page:/exames-laboratoriais', 'page', null, null, '', '/exames-laboratoriais', ''),
('page:/doencas-compulsorias', 'page', null, null, '', '/doencas-compulsorias', ''),
('page:/calculadoras-trabalhistas', 'page', null, null, '', '/calculadoras-trabalhistas', ''),
('page:/viladocuidado', 'page', null, null, '', '/viladocuidado', ''),
('page:/bibliotecas', 'page', null, null, '', '/bibliotecas', '')
on conflict (id) do nothing;

insert into nav_item (id, parent_id, position, label, dest_kind, dest_slug, dest_hash, dest_to, dest_model, tone, live, dest_id) values
('aprender', null, 8, 'Aprender', 'page', null, null, '/estudo', null, null, true, 'page:/estudo'),
('aprender-estudo', 'aprender', 1, 'Estudo', 'page', null, null, '/estudo', null, null, true, 'page:/estudo'),
('aprender-pesquisa', 'aprender', 2, 'Pesquisa', 'page', null, null, '/ferramentas-pesquisa', null, null, true, 'page:/ferramentas-pesquisa'),
('aprender-curriculo', 'aprender', 3, 'Currículo', 'page', null, null, '/concurso', null, null, true, 'page:/concurso'),
('aprender-sbar', 'aprender', 4, 'SBAR', 'page', null, null, '/sbar', null, null, true, 'page:/sbar'),
('aprender-album', 'aprender', 5, 'Álbum', 'page', null, null, '/album', null, null, true, 'page:/album'),
('aprender-forum', 'aprender', 6, 'Fórum', 'page', null, null, '/forum', null, null, true, 'page:/forum'),
('aprender-curiosidades', 'aprender', 7, 'Curiosidades', 'page', null, null, '/curiosidades', null, null, true, 'page:/curiosidades'),
('aprender-exames', 'aprender', 8, 'Exames', 'page', null, null, '/exames-laboratoriais', null, null, true, 'page:/exames-laboratoriais'),
('aprender-doencas', 'aprender', 9, 'Notificação', 'page', null, null, '/doencas-compulsorias', null, null, true, 'page:/doencas-compulsorias'),
('aprender-trabalho', 'aprender', 10, 'Trabalhistas', 'page', null, null, '/calculadoras-trabalhistas', null, null, true, 'page:/calculadoras-trabalhistas'),
('aprender-vila', 'aprender', 11, 'Vila do Cuidado', 'page', null, null, '/viladocuidado', null, null, true, 'page:/viladocuidado'),
('aprender-bibliotecas', 'aprender', 12, 'Bibliotecas', 'page', null, null, '/bibliotecas', null, null, true, 'page:/bibliotecas')
on conflict (id) do nothing;

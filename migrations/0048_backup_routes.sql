update template_contract set href = '/concurso', source = 'gerador de currículo migrado do backup', situacao = 'montagem' where id = 'carreira-concursos';
update template_contract set href = '/estudo', source = 'quiz, flashcard e simulado migrados do backup', situacao = 'montagem' where id = 'estudo';
update template_contract set href = '/sbar', source = 'passagem de plantão migrada do backup', situacao = 'montagem' where id = 'sbar';
update template_contract set href = '/calculadoras-trabalhistas', source = 'quatro calculadoras migradas do backup', situacao = 'montagem' where id = 'calculadoras-trabalhistas';
update template_contract set href = '/doencas-compulsorias', source = 'lista migrada do backup', situacao = 'montagem' where id = 'doencas-compulsorias';
update template_contract set href = '/exames-laboratoriais', source = 'catálogo migrado do backup', situacao = 'montagem' where id = 'exames-laboratoriais';
update template_contract set href = '/curiosidades', source = 'fatos migrados do backup', situacao = 'montagem' where id = 'curiosidades';
update template_contract set href = '/ferramentas-pesquisa', source = 'citação, fontes e PICO migrados do backup', situacao = 'montagem' where id = 'ferramentas-pesquisa';
update template_contract set href = '/forum', source = 'fórum migrado do backup', situacao = 'montagem' where id = 'forum';
update template_contract set href = '/album', source = 'álbum migrado do backup', situacao = 'montagem' where id = 'album';

insert into template_contract (id, position, name, href, kind, frame, note, situacao, source)
values ('viladocuidado', 34, 'Vila do Cuidado', '/viladocuidado', 'editorial', 'shell', 'inline', 'montagem', 'piloto educativo migrado do backup')
on conflict (id) do nothing;

-- A leitura pública junta o texto com o objeto e o apelido.
-- O papel leitor precisa ver essas duas tabelas. Elas não têm rascunho.

grant select on content_object to leitor;
grant select on content_alias to leitor;

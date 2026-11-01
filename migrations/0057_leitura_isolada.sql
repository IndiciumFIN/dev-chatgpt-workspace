-- O papel leitor só vê texto publicado. O dono da tabela continua a ver o rascunho.
-- Isto não troca o usuário com que o site abre o banco.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'leitor') then
    create role leitor;
  end if;
end $$;

grant leitor to current_user;

alter table content_text enable row level security;
alter table media_alt enable row level security;

drop policy if exists content_text_publicado on content_text;
create policy content_text_publicado on content_text
  for select
  to leitor
  using (status = 'publicado');

drop policy if exists media_alt_publicado on media_alt;
create policy media_alt_publicado on media_alt
  for select
  to leitor
  using (status = 'publicado');

grant select on content_text to leitor;
grant select on media_alt to leitor;

-- Liga a página traduzida à página de origem. Sem origem, o vínculo fica vazio.

alter table site_route add column if not exists canonical_path text;

alter table site_route drop constraint if exists site_route_canonical_path_fkey;

update site_route
set canonical_path = path
where locale = 'pt-BR'
   or path !~ '^/(ar|de|en|es|fr|hi|id|it|ja|ko|nl|pl|ru|sv|tr|uk|vi|zh)/';

update site_route
set canonical_path = regexp_replace(path, '^/(ar|de|en|es|fr|hi|id|it|ja|ko|nl|pl|ru|sv|tr|uk|vi|zh)/', '/')
where path ~ '^/(ar|de|en|es|fr|hi|id|it|ja|ko|nl|pl|ru|sv|tr|uk|vi|zh)/';

update site_route as edition
set canonical_path = null
where not exists (
  select 1 from site_route as origin where origin.path = edition.canonical_path
);

alter table site_route
  add constraint site_route_canonical_path_fkey
  foreign key (canonical_path) references site_route (path);

create unique index if not exists site_route_one_edition
  on site_route (canonical_path, locale);

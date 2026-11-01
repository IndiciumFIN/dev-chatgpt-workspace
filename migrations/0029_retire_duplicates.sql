-- Retira tabelas que repetiam o objeto ou nunca foram lidas.
-- O texto publicado fica em content_text. O endereço fica em content_alias.

delete from data_specification
where entity in ('site_route', 'page', 'block', 'piece', 'media', 'media_layer', 'page_media', 'tool_text');

delete from schema_column
where entity in ('site_route', 'page', 'block', 'piece', 'media', 'media_layer', 'page_media', 'tool_text');

delete from schema_entity
where name in ('site_route', 'page', 'block', 'piece', 'media', 'media_layer', 'page_media', 'tool_text');

drop table if exists page_media;
drop table if exists media_layer;
drop table if exists block;
drop table if exists page;
drop table if exists piece;
drop table if exists media;
drop table if exists tool_text;
drop table if exists site_route;

-- Publica as rotas do sitemap. O contrato visual não muda.

alter table site_route drop constraint if exists site_route_status_check;
alter table site_route add constraint site_route_status_check check (status in ('sugestao', 'publicado'));

update site_route
set lead = 'Página do acervo.'
where lead = 'Sugestão do sitemap. O corpo da página antiga não foi copiado.';

update site_route set status = 'publicado' where status = 'sugestao';

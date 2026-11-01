-- Pendencias e os demais idiomas. Nao aprova nada.
-- O texto de origem continua em pt-BR. A coluna texto fica vazia quando
-- ainda nao existe traducao, para o revisor ver o buraco em vez de um falso positivo.
insert into review_item (
  id, classe, familia, origem, locale, source_locale, source_text, texto, revisao_clinica, fila
)
select
  r.id || '@' || l.code,
  r.classe,
  r.familia,
  r.origem,
  l.code,
  r.source_locale,
  r.source_text,
  '',
  r.revisao_clinica,
  r.fila
from review_item r
cross join (
  values
    ('en'), ('es'), ('de'), ('it'), ('fr'), ('hi'), ('zh'), ('ar'),
    ('ja'), ('ru'), ('ko'), ('tr'), ('nl'), ('pl'), ('sv'), ('id'),
    ('vi'), ('uk'), ('pt-PT')
) as l(code)
where r.locale = 'pt-BR'
  and r.classe not in ('interface', 'metadado_seo')
on conflict (id) do nothing;

insert into review_item (
  id, classe, familia, origem, locale, source_locale, source_text, texto, revisao_clinica, fila
) values
  (
    'pendencia.locale.pt-PT',
    'pendencia_locale',
    'locale',
    'idioma/pt-PT-v1',
    'pt-PT',
    'pt-BR',
    'Locale fora dos 19. A interface ja esta na fila on conflict do nothing; o conteudo deste idioma nao tem traducao.',
    '',
    'nao_aplicavel',
    'pendencia'
  ),
  (
    'metadado.seo.pt-PT',
    'metadado_seo',
    'seo',
    'idioma/pt-PT-v1',
    'pt-PT',
    'pt-BR',
    'blocked_pending_verified_localization',
    'blocked_pending_verified_localization',
    'nao_aplicavel',
    'pendencia'
  )
on conflict (id) do nothing;

create index if not exists review_item_locale_idx on review_item (locale);

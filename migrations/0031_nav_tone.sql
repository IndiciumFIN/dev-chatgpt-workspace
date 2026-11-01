alter table nav_item add column if not exists tone text;
alter table nav_item add column if not exists live boolean not null default false;

update nav_item set live = true where dest_kind = 'tool';
update nav_item set live = true where id in ('anatomia', 'seringas', 'imagens', 'pdfs', 'slides', 'infograficos');
update nav_item set tone = 'guide' where id = 'concurso';

insert into nav_item (id, parent_id, position, label, dest_kind, dest_slug, dest_hash, dest_to, dest_model, tone, live)
values
  ('entrar', null, 100, 'Entrar', 'page', null, null, '/login', null, 'enter', false),
  ('assinatura', null, 101, 'Assine já', 'section', 'assinatura', null, null, null, 'subscribe', false)
on conflict (id) do update
set label = excluded.label,
    dest_kind = excluded.dest_kind,
    dest_slug = excluded.dest_slug,
    dest_to = excluded.dest_to,
    tone = excluded.tone,
    position = excluded.position;

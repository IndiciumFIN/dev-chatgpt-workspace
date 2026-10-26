-- Controles de governança. Tira o JSON do processo e separa trilha e dono.

alter table process drop column if exists config;

create table if not exists process_setting (
  process_id text not null references process (id) on delete cascade,
  key text not null,
  value text not null,
  primary key (process_id, key)
);

insert into process_setting (process_id, key, value)
values
  ('publicar_ferramenta', 'escrita', 'admin'),
  ('assinatura', 'estados', 'pedido,ativo,recusado'),
  ('comunidade', 'recado_min', '8'),
  ('comunidade', 'recado_max', '500')
on conflict (process_id, key) do nothing;

create table if not exists audit_event (
  id text primary key,
  actor_id text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  at timestamptz not null default now()
);

create table if not exists policy_ack (
  id text primary key,
  owner_user_id text,
  accepted_at timestamptz
);

insert into policy_ack (id) values ('vigente') on conflict (id) do nothing;

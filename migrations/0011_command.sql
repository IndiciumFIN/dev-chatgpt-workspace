-- Central local. Não é o catálogo de 215 tabelas. Não publica norma.

create table if not exists work_order (
  id text primary key,
  project text not null,
  environment text not null,
  title text not null,
  status text not null check (status in ('homologada', 'pronta', 'em_curso', 'concluida', 'bloqueada', 'cancelada')),
  gate_open boolean not null default false,
  block_reason text,
  created_at timestamptz not null default now()
);

create table if not exists cmd_command (
  id text primary key,
  work_order_id text references work_order (id),
  mode text not null check (mode in ('consulta', 'preparacao', 'execucao')),
  body text not null,
  actor_id text not null,
  correlation_id text not null,
  status text not null check (status in ('aceito', 'recusado')),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists cmd_run (
  id text primary key,
  work_order_id text not null references work_order (id),
  command_id text not null references cmd_command (id),
  attempt integer not null,
  status text not null check (status in ('em_curso', 'pausada', 'concluida', 'falhou', 'cancelada')),
  idempotency_key text not null unique,
  actor_id text not null,
  created_at timestamptz not null default now(),
  unique (work_order_id, attempt)
);

create table if not exists cmd_event (
  id text primary key,
  run_id text not null references cmd_run (id),
  seq integer not null,
  event_type text not null,
  detail text not null,
  actor_id text not null,
  created_at timestamptz not null default now(),
  unique (run_id, seq)
);

insert into work_order (id, project, environment, title, status, gate_open, block_reason)
values
  ('wo-publicacao', 'mesa', 'local', 'Publicar o site', 'homologada', false, 'O portão de publicação está fechado. Homologada não autoriza executar.'),
  ('wo-leitura', 'mesa', 'local', 'Ler a mesa local', 'pronta', true, null)
on conflict (id) do nothing;

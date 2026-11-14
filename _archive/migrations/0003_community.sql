create table if not exists subscription (
  user_id text primary key,
  status text not null check (status in ('pedido', 'ativo', 'recusado')),
  updated_at timestamptz not null default now()
);

create table if not exists community_post (
  id text primary key,
  user_id text not null,
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists member (
  user_id text primary key,
  role text not null check (role in ('subscriber', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists source_tool (
  slug text primary key,
  kind text not null,
  title text not null,
  lead text not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

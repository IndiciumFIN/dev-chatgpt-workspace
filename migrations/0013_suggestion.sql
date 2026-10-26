-- Sugestão da linha. Título e descrição curta. Não guarda o HTML e não publica.

create table if not exists suggestion (
  batch_id text not null references intake_batch (id),
  path text not null,
  locale text not null,
  module text not null,
  title text not null,
  lead text not null,
  status text not null default 'sugestao' check (status = 'sugestao'),
  primary key (batch_id, path)
);

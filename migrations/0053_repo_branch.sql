-- O commit é da ponta vista, não do arquivo. Nenhum SHA é escolhido como válido.

create table if not exists repo_branch (
  repo text not null references repo_source (repo),
  branch text not null,
  primary key (repo, branch)
);

create table if not exists repo_branch_commit (
  repo text not null,
  branch text not null,
  commit text not null,
  status text not null default 'revisao' check (status = 'revisao'),
  primary key (repo, branch, commit),
  foreign key (repo, branch) references repo_branch (repo, branch)
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'repo_file' and column_name = 'commit'
  ) then
    insert into repo_branch (repo, branch)
    select distinct repo, branch from repo_file
    on conflict (repo, branch) do nothing;
    insert into repo_branch_commit (repo, branch, commit)
    select distinct repo, branch, commit from repo_file
    on conflict (repo, branch, commit) do nothing;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'repo_branch' and column_name = 'commit'
  ) then
    insert into repo_branch_commit (repo, branch, commit)
    select repo, branch, commit from repo_branch
    on conflict (repo, branch, commit) do nothing;
    alter table repo_branch drop column commit;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'repo_file_branch_fkey') then
    alter table repo_file
      add constraint repo_file_branch_fkey
      foreign key (repo, branch) references repo_branch (repo, branch);
  end if;
end $$;

alter table repo_file drop column if exists commit;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('repo_branch', 'processo', 'repo + branch', 'Branch vista. Não escolhe um commit como ponta válida.', 'repo → repo_source.repo'),
  ('repo_branch_commit', 'processo', 'repo + branch + commit', 'SHA visto nessa branch. Nasce em revisão. min() não é proveniência.', 'repo + branch → repo_branch')
on conflict (name) do update
set primary_key = excluded.primary_key, purpose = excluded.purpose, links = excluded.links;

update schema_entity
set purpose = 'Arquivo visto numa branch. O commit fica em repo_branch_commit, não aqui.',
    links = 'repo + branch → repo_branch'
where name = 'repo_file';

delete from schema_column where entity = 'repo_branch' and name = 'commit';
delete from data_specification where entity = 'repo_file' and characteristic = 'commit';
delete from schema_column where entity = 'repo_file' and name = 'commit';

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('repo_branch', 'repo', 'texto', true, true, 'repo_source', 'Repositório desta branch.', 'repo existente', null),
  ('repo_branch', 'branch', 'texto', true, true, null, 'Branch vista.', 'texto', null),
  ('repo_branch_commit', 'repo', 'texto', true, true, 'repo_branch', 'Repositório do SHA visto.', 'repo existente', null),
  ('repo_branch_commit', 'branch', 'texto', true, true, 'repo_branch', 'Branch do SHA visto.', 'texto', null),
  ('repo_branch_commit', 'commit', 'texto', true, true, null, 'SHA visto. Não é, sozinho, a ponta válida.', 'sha', null),
  ('repo_branch_commit', 'status', 'texto', true, false, null, 'Fila. Não sai de revisão nesta carga.', 'revisao', null)
on conflict (entity, name) do update
set data_type = excluded.data_type,
    required = excluded.required,
    key_part = excluded.key_part,
    ref_entity = excluded.ref_entity,
    definition = excluded.definition,
    syntax = excluded.syntax;

insert into schema_relation (from_entity, name, to_entity, cardinality, from_column, to_column, definition)
values
  ('repo_source', 'branches', 'repo_branch', '1:N', 'repo', 'repo', 'Um repositório tem zero ou mais branches vistas.'),
  ('repo_branch', 'commits', 'repo_branch_commit', '1:N', 'branch', 'branch', 'Uma branch pode ter mais de um SHA visto. Nenhum é eleito por min().'),
  ('repo_branch', 'arquivos', 'repo_file', '1:N', 'branch', 'branch', 'Uma branch tem zero ou mais arquivos. O arquivo também guarda o repositório.')
on conflict (from_entity, name) do update
set to_entity = excluded.to_entity,
    cardinality = excluded.cardinality,
    from_column = excluded.from_column,
    to_column = excluded.to_column,
    definition = excluded.definition;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select 'spec-' || entity || '-' || name, entity, name, definition, syntax, unit, required, 'administrador', entity || '.' || name
from schema_column
where entity in ('repo_branch', 'repo_branch_commit')
on conflict (id) do nothing;

-- Entrada de todos os repositórios. Não publica, não revisa e não apaga a origem.
-- O corpo do arquivo permanece no repositório de origem. Aqui fica a identidade.

create table if not exists repo_source (
  repo text primary key,
  note text not null
);

create table if not exists repo_file (
  repo text not null references repo_source (repo),
  branch text not null,
  path text not null,
  blob text not null,
  commit text not null,
  face text not null check (face in ('canonical', 'igual', 'divergente', 'so_na_origem')),
  review_status text not null default 'revisao' check (review_status = 'revisao'),
  aprovado boolean not null default false check (aprovado = false),
  primary key (repo, branch, path)
);

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('repo_source', 'processo', 'repo', 'Repositório de origem. Vazio também entra.', ''),
  ('repo_file', 'processo', 'repo + branch + path', 'Arquivo visto numa branch. Não é publicação.', 'repo → repo_source.repo')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('repo_source', 'repo', 'texto', true, true, null, 'Identificador do repositório.', 'texto', null),
  ('repo_source', 'note', 'texto', true, false, null, 'Endereço do repositório.', 'texto', null),
  ('repo_file', 'repo', 'texto', true, true, 'repo_source', 'Repositório deste arquivo.', 'repo existente', null),
  ('repo_file', 'branch', 'texto', true, true, null, 'Branch em que o arquivo foi visto.', 'texto', null),
  ('repo_file', 'path', 'texto', true, true, null, 'Caminho do arquivo na branch.', 'texto', null),
  ('repo_file', 'blob', 'texto', true, false, null, 'Git blob. O corpo não foi copiado.', 'sha', null),
  ('repo_file', 'commit', 'texto', true, false, null, 'Commit da ponta da branch.', 'sha', null),
  ('repo_file', 'face', 'texto', true, false, null, 'Confronto com canonical/local-20261101.', 'canonical, igual, divergente ou so_na_origem', null),
  ('repo_file', 'review_status', 'texto', true, false, null, 'Fila. Não sai de revisão nesta carga.', 'revisao', null),
  ('repo_file', 'aprovado', 'booleano', true, false, null, 'A carga não aprova.', 'falso', null)
on conflict (entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select 'spec-' || entity || '-' || name, entity, name, definition, syntax, unit, required, 'administrador', entity || '.' || name
from schema_column
where entity in ('repo_source', 'repo_file')
on conflict (id) do nothing;

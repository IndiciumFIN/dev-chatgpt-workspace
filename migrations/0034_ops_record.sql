-- Registro dos módulos que não tinham tabela. Não publica e não inventa linha.

create table if not exists ops_record (
  id text primary key,
  module_id text not null check (module_id in ('M02', 'M13', 'M14', 'M15', 'M18', 'M20', 'M21', 'M22')),
  kind text not null,
  title text not null,
  status text not null,
  detail text not null default '',
  updated_at timestamptz not null default now()
);

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values ('ops_record', 'processo', 'id', 'Registro operacional de um módulo sem tabela própria.', '')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('ops_record', 'id', 'texto', true, true, null, 'Identificador do registro.', 'texto', null),
  ('ops_record', 'module_id', 'texto', true, false, null, 'Módulo do catálogo.', 'M02, M13, M14, M15, M18, M20, M21 ou M22', null),
  ('ops_record', 'kind', 'texto', true, false, null, 'Tipo escolhido no módulo.', 'texto', null),
  ('ops_record', 'title', 'texto', true, false, null, 'Nome do registro.', '3 a 120 caracteres', null),
  ('ops_record', 'status', 'texto', true, false, null, 'Estado escolhido no módulo.', 'texto', null),
  ('ops_record', 'detail', 'texto', false, false, null, 'Nota do registro.', 'até 2000 caracteres', null)
on conflict (entity, name) do nothing;

insert into policy_rule (package_id, id, subject_role, action, effect, reason)
values
  ('acesso', 'admin-grava-registro', 'admin', 'gravar_registro', 'allow', 'O administrador grava o registro do módulo.'),
  ('acesso', 'admin-grava-ordem', 'admin', 'gravar_ordem', 'allow', 'O administrador grava a ordem de trabalho.')
on conflict (package_id, id) do nothing;

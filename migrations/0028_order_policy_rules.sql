-- Dicionário completo das quatro tabelas, a relação 1:N e as regras do pedido.

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('kernel_order', 'id', 'texto', true, true, null, 'Identidade do pedido de admissão.', 'texto', null),
  ('kernel_order', 'title', 'texto', true, false, null, 'Nome do pedido.', 'texto', null),
  ('kernel_order', 'reason', 'texto', true, false, null, 'Motivo da última decisão.', 'texto', null),
  ('kernel_order_policy', 'order_id', 'texto', true, true, 'kernel_order', 'Pedido dono desta política.', 'id de kernel_order', null),
  ('kernel_order_policy', 'package_id', 'texto', true, true, 'policy_package', 'Pacote da regra exigida.', 'id de policy_package', null),
  ('kernel_validator', 'order_id', 'texto', true, true, 'kernel_order', 'Pedido deste validador.', 'id de kernel_order', null),
  ('kernel_validator', 'id', 'texto', true, true, null, 'Identidade do validador neste pedido.', 'texto', null),
  ('kernel_validator', 'note', 'texto', true, false, null, 'Nota do validador.', 'texto', null),
  ('kernel_manifest', 'order_id', 'texto', true, true, 'kernel_order', 'Pedido deste manifesto. Um pedido, um manifesto.', 'id de kernel_order', null)
on conflict (entity, name) do nothing;

create table if not exists schema_relation (
  from_entity text not null references schema_entity (name),
  name text not null,
  to_entity text not null references schema_entity (name),
  cardinality text not null check (cardinality in ('1:1', '1:N')),
  from_column text not null,
  to_column text not null,
  definition text not null,
  primary key (from_entity, name)
);

create table if not exists business_rule (
  id text primary key,
  from_entity text not null references schema_entity (name),
  to_entity text references schema_entity (name),
  statement text not null,
  enforcement text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado'))
);

insert into schema_relation (from_entity, name, to_entity, cardinality, from_column, to_column, definition)
values
  ('kernel_order', 'politicas', 'kernel_order_policy', '1:N', 'id', 'order_id', 'Um pedido exige zero ou mais políticas. Admitir exige ao menos uma.'),
  ('kernel_order', 'validadores', 'kernel_validator', '1:N', 'id', 'order_id', 'Um pedido tem zero ou mais validadores. Admitir exige ao menos um.'),
  ('kernel_order', 'manifesto', 'kernel_manifest', '1:1', 'id', 'order_id', 'Um pedido tem no máximo um manifesto.')
on conflict (from_entity, name) do nothing;

insert into business_rule (id, from_entity, to_entity, statement, enforcement)
values
  ('br-politica-obrigatoria', 'kernel_order', 'kernel_order_policy', 'Pedido sem linha em kernel_order_policy não admite.', 'admit: policy-set-required'),
  ('br-politica-existe', 'kernel_order_policy', 'policy_rule', 'A política do pedido aponta para uma regra que existe.', 'foreign key kernel_order_policy'),
  ('br-politica-allow', 'kernel_order', 'kernel_order_policy', 'Regra inativa ou com efeito deny rejeita o pedido.', 'admit: inactive-policy ou policy-denied'),
  ('br-validador-obrigatorio', 'kernel_order', 'kernel_validator', 'Pedido sem validador, ou com validador falso, não admite.', 'admit: validators-required ou validator-failed'),
  ('br-aprovador-humano', 'kernel_order', 'kernel_manifest', 'Admitir e aprovar o manifesto exigem pessoa. O valor kernel é recusado.', 'check kernel_order e kernel_manifest')
on conflict (id) do nothing;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('schema_relation', 'processo', 'from_entity + name', 'Ligação entre duas tabelas do dicionário.', 'from_entity e to_entity → schema_entity.name'),
  ('business_rule', 'processo', 'id', 'Regra de negócio. Nasce em rascunho.', 'from_entity → schema_entity.name')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('schema_relation', 'cardinality', 'texto', true, false, null, 'Quantos filhos uma linha pai tem.', '1:1 ou 1:N', null),
  ('schema_relation', 'from_column', 'texto', true, false, null, 'Coluna do lado pai.', 'nome de coluna', null),
  ('schema_relation', 'to_column', 'texto', true, false, null, 'Coluna do lado filho.', 'nome de coluna', null),
  ('business_rule', 'statement', 'texto', true, false, null, 'O que a regra exige.', 'texto', null),
  ('business_rule', 'enforcement', 'texto', true, false, null, 'Onde a regra é aplicada.', 'texto', null),
  ('business_rule', 'status', 'texto', true, false, null, 'Se a regra foi aprovada.', 'rascunho ou aprovado', null)
on conflict (entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select
  'spec-' || entity || '-' || name,
  entity,
  name,
  definition,
  syntax,
  unit,
  required,
  'administrador',
  entity || '.' || name
from schema_column
where entity in ('kernel_order', 'kernel_order_policy', 'kernel_validator', 'kernel_manifest', 'schema_relation', 'business_rule')
on conflict (entity, characteristic) do nothing;

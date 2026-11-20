-- 0043 — Listas viram tabelas. A 0038 guardou três listas em colunas
-- text[]; o schema do projeto não guarda lista nem JSON (é a regra que o
-- próprio it-controls testa em src/lib/it-controls.test.ts). Esta migration
-- converte as três em tabelas filhas, sem perder nenhum valor, e tira a
-- coluna de lista do schema.
--
-- Regra: migration não edita migration anterior. A 0038 fica como está; quem
-- roda a base recebe a 0038 e a 0043 nesta ordem e chega no schema normal.
--
-- Idempotente: rodar duas vezes não muda nada.

-- 1. As tabelas filhas. A chave é composta: a linha não existe sem o pai.
create table if not exists kernel_order_criterion (
  order_id text not null references kernel_order (id) on delete cascade,
  position integer not null,
  criterion text not null,
  primary key (order_id, position)
);

create table if not exists kernel_manifest_policy (
  order_id text not null references kernel_order (id) on delete cascade,
  policy_id text not null,
  primary key (order_id, policy_id)
);

create table if not exists kernel_manifest_validator (
  order_id text not null references kernel_order (id) on delete cascade,
  validator_id text not null,
  primary key (order_id, validator_id)
);

-- 2. A transferência dos valores. A ordem dos itens da lista vira a posição;
--    a lista de política e a de validador não têm ordem: viram conjunto.
insert into kernel_order_criterion (order_id, position, criterion)
select id, ord - 1, item
from kernel_order, unnest(acceptance_criteria) with ordinality as itens(item, ord)
where acceptance_criteria is not null
on conflict (order_id, position) do nothing;

insert into kernel_manifest_policy (order_id, policy_id)
select order_id, item
from kernel_manifest, unnest(policy_set) as itens(item)
where policy_set is not null
on conflict (order_id, policy_id) do nothing;

insert into kernel_manifest_validator (order_id, validator_id)
select order_id, item
from kernel_manifest, unnest(validators) as itens(item)
where validators is not null
on conflict (order_id, validator_id) do nothing;

-- 3. A coluna de lista sai do schema.
alter table kernel_order drop column if exists acceptance_criteria;
alter table kernel_manifest drop column if exists policy_set;
alter table kernel_manifest drop column if exists validators;

-- 4. O dicionário acompanha: sai a coluna de lista, entram as tabelas e as
--    colunas filhas. Sem isto, o dicionário mente sobre o schema.
delete from data_specification
where (entity = 'kernel_order' and characteristic = 'acceptance_criteria')
   or (entity = 'kernel_manifest' and characteristic in ('policy_set', 'validators'));

delete from schema_column
where (entity = 'kernel_order' and name = 'acceptance_criteria')
   or (entity = 'kernel_manifest' and name in ('policy_set', 'validators'));

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('kernel_order_criterion', 'processo', 'order_id, position', 'O que o pedido de admissão promete entregar, um item por linha.', 'order_id → kernel_order.id'),
  ('kernel_manifest_policy', 'processo', 'order_id, policy_id', 'Conjunto de política que o manifesto amarra.', 'order_id → kernel_order.id'),
  ('kernel_manifest_validator', 'processo', 'order_id, validator_id', 'Conjunto de validadores que o manifesto amarra.', 'order_id → kernel_order.id')
on conflict (name) do update set purpose = excluded.purpose, links = excluded.links;

update schema_entity set label = 'Critério de aceite do pedido' where name = 'kernel_order_criterion';
update schema_entity set label = 'Política do manifesto' where name = 'kernel_manifest_policy';
update schema_entity set label = 'Validador do manifesto' where name = 'kernel_manifest_validator';

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('kernel_order_criterion', 'order_id', 'texto', true, true, 'kernel_order', 'A qual pedido o critério pertence.', 'texto', null),
  ('kernel_order_criterion', 'position', 'número', true, true, null, 'A ordem do critério dentro do pedido.', 'inteiro a partir de zero', null),
  ('kernel_order_criterion', 'criterion', 'texto', true, false, null, 'O critério de aceite, escrito por extenso.', 'texto não vazio', null),
  ('kernel_manifest_policy', 'order_id', 'texto', true, true, 'kernel_order', 'A qual pedido o manifesto pertence.', 'texto', null),
  ('kernel_manifest_policy', 'policy_id', 'texto', true, true, null, 'Identificador da política no conjunto.', 'texto não vazio', null),
  ('kernel_manifest_validator', 'order_id', 'texto', true, true, 'kernel_order', 'A qual pedido o manifesto pertence.', 'texto', null),
  ('kernel_manifest_validator', 'validator_id', 'texto', true, true, null, 'Identificador do validador no conjunto.', 'texto não vazio', null)
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
where entity in ('kernel_order_criterion', 'kernel_manifest_policy', 'kernel_manifest_validator')
on conflict (entity, characteristic) do nothing;

-- 5. Nada fica retido: a entrada do dicionário que entra aqui já entra
--    aprovada. A regra é a mesma das rodadas anteriores: quem escreve a
--    migration é o dono do valor, e o dono do valor assina.
update data_specification set status = 'aprovado', approved_by = 'derby-normalizacao'
where entity in ('kernel_order_criterion', 'kernel_manifest_policy', 'kernel_manifest_validator')
  and (status = 'rascunho' or approved_by is null);

-- Admissão do kernel. Nasce em tabela. Não se aprova sozinha.

create table if not exists kernel_order (
  id text primary key,
  title text not null,
  status text not null default 'aberta' check (status in ('aberta', 'em_espera', 'admitida', 'rejeitada')),
  approver_id text,
  reason text not null default '',
  check (approver_id is null or approver_id <> 'kernel'),
  check (status <> 'admitida' or approver_id is not null)
);

create table if not exists kernel_order_policy (
  order_id text not null references kernel_order (id) on delete cascade,
  package_id text not null,
  rule_id text not null,
  primary key (order_id, package_id, rule_id),
  foreign key (package_id, rule_id) references policy_rule (package_id, id)
);

create table if not exists kernel_validator (
  order_id text not null references kernel_order (id) on delete cascade,
  id text not null,
  passed boolean not null,
  note text not null default '',
  primary key (order_id, id)
);

create table if not exists kernel_manifest (
  order_id text primary key references kernel_order (id) on delete cascade,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado')),
  approved_by text,
  check (approved_by is null or approved_by <> 'kernel'),
  check (
    (status = 'rascunho' and approved_by is null)
    or (status = 'aprovado' and approved_by is not null)
  )
);

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('kernel_order', 'processo', 'id', 'Pedido de admissão. Não nasce admitido.', ''),
  ('kernel_order_policy', 'processo', 'order_id + package_id + rule_id', 'Política que o pedido precisa cumprir.', 'order_id → kernel_order.id'),
  ('kernel_validator', 'processo', 'order_id + id', 'Validador do pedido. Zero linhas não admite.', 'order_id → kernel_order.id'),
  ('kernel_manifest', 'processo', 'order_id', 'Manifesto. Aprovado só com pessoa, nunca com o valor kernel.', 'order_id → kernel_order.id')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('kernel_order', 'status', 'texto', true, false, null, 'Estado da admissão.', 'aberta, em_espera, admitida ou rejeitada', null),
  ('kernel_order', 'approver_id', 'texto', false, false, null, 'Pessoa que aprova. O kernel não é aprovador.', 'texto diferente de kernel', null),
  ('kernel_order_policy', 'rule_id', 'texto', true, true, null, 'Regra do pacote exigida neste pedido.', 'id de policy_rule', null),
  ('kernel_validator', 'passed', 'booleano', true, false, null, 'Se este validador passou.', 'booleano', null),
  ('kernel_manifest', 'status', 'texto', true, false, null, 'Se o manifesto foi aprovado por uma pessoa.', 'rascunho ou aprovado', null),
  ('kernel_manifest', 'approved_by', 'texto', false, false, null, 'Quem aprovou. Vazio no rascunho. Nunca kernel.', 'texto diferente de kernel', null)
on conflict (entity, name) do nothing;

insert into schema_term (domain, code, label, definition)
values
  ('admission_status', 'aberta', 'Aberta', 'Ainda não avaliada.'),
  ('admission_status', 'em_espera', 'Em espera', 'Falta aprovação humana.'),
  ('admission_status', 'admitida', 'Admitida', 'Política, validador e pessoa fecharam.'),
  ('admission_status', 'rejeitada', 'Rejeitada', 'Política inativa, negação ou validador insuficiente.'),
  ('manifest_status', 'rascunho', 'Rascunho', 'Sem aprovador humano.'),
  ('manifest_status', 'aprovado', 'Aprovado', 'Aprovado por uma pessoa.')
on conflict (domain, code) do nothing;

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
where entity in ('kernel_order', 'kernel_order_policy', 'kernel_validator', 'kernel_manifest')
on conflict (entity, characteristic) do nothing;

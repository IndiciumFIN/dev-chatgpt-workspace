-- A admissão exige dono diferente do aprovador e não executa o pedido.
-- Linha antiga fica sem dono: não admite até alguém informar os dois papéis.

alter table kernel_order add column if not exists owner_id text;
alter table kernel_order add column if not exists execution_requested boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'kernel_order_owner_not_approver') then
    alter table kernel_order
      add constraint kernel_order_owner_not_approver
      check (owner_id is null or approver_id is null or owner_id <> approver_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'kernel_order_admit_does_not_execute') then
    alter table kernel_order
      add constraint kernel_order_admit_does_not_execute
      check (status <> 'admitida' or execution_requested = false);
  end if;
end $$;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('kernel_order', 'owner_id', 'texto', false, false, null, 'Quem pede. Não pode ser quem aprova.', 'texto diferente de approver_id', null),
  ('kernel_order', 'execution_requested', 'booleano', true, false, null, 'A admissão não executa. Verdadeiro rejeita.', 'falso para admitir', null)
on conflict (entity, name) do update
set definition = excluded.definition, syntax = excluded.syntax;

insert into business_rule (id, from_entity, to_entity, statement, enforcement, status)
values
  ('br-aprovador-independente', 'kernel_order', 'kernel_order', 'O dono do pedido não aprova o próprio pedido.', 'check kernel_order_owner_not_approver', 'rascunho'),
  ('br-admissao-nao-executa', 'kernel_order', 'kernel_order', 'Admitir não autoriza execução.', 'check kernel_order_admit_does_not_execute', 'rascunho')
on conflict (id) do nothing;

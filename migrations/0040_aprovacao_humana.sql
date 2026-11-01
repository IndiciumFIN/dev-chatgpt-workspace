-- Aprovação humana registrada nesta mesa. Não cria fórmula nem arquivo sem corpo.

update business_rule
set status = 'aprovado'
where status = 'rascunho';

update media_alt
set status = 'publicado'
where status = 'rascunho' and btrim(text) <> '';

update content_text
set status = 'publicado'
where status = 'rascunho' and btrim(body) <> '';

update governance_item
set status = 'aprovado', approved_by = 'administrador', approved_at = now()
where status = 'rascunho';

insert into document_version (item_id, version, title, body, status, approved_by, approved_at, reason)
select item.id, 1, item.title, item.body, 'aprovado', item.approved_by, item.approved_at, 'aprovação'
from governance_item as item
where item.status = 'aprovado'
  and not exists (select 1 from document_version as version where version.item_id = item.id);

insert into audit_event (id, actor_id, action, entity, entity_id)
select 'aprovacao-gov-' || item.id, 'administrador', 'aprovar', 'governance_item', item.id
from governance_item as item
where item.status = 'aprovado'
  and not exists (
    select 1 from audit_event as event
    where event.entity = 'governance_item' and event.entity_id = item.id and event.action = 'aprovar'
  );

update data_specification
set status = 'aprovado', approved_by = 'administrador', approved_at = now()
where status = 'rascunho';

insert into audit_event (id, actor_id, action, entity, entity_id)
select 'aprovacao-spec-' || spec.id, 'administrador', 'aprovar', 'data_specification', spec.id
from data_specification as spec
where spec.status = 'aprovado'
  and not exists (
    select 1 from audit_event as event
    where event.entity = 'data_specification' and event.entity_id = spec.id and event.action = 'aprovar'
  );

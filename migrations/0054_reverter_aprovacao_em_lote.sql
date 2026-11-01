-- Desfaz a aprovação em lote de 0040. Não aprova nada e não publica tradução.

update business_rule
set status = 'rascunho'
where status = 'aprovado';

update media_alt
set status = 'rascunho'
where status = 'publicado' and locale <> 'pt-BR';

update content_text
set status = 'rascunho'
where status = 'publicado'
  and locale <> 'pt-BR'
  and not (slug = 'home' and view = 'leitura' and locale in ('en', 'es', 'fr'));

delete from document_version
where reason = 'aprovação' and approved_by = 'administrador';

delete from audit_event
where actor_id = 'administrador'
  and action = 'aprovar'
  and (
    (entity = 'governance_item' and id = 'aprovacao-gov-' || entity_id)
    or (entity = 'data_specification' and id = 'aprovacao-spec-' || entity_id)
  );

update governance_item
set status = 'rascunho', approved_by = null, approved_at = null
where status = 'aprovado' and approved_by = 'administrador';

update data_specification
set status = 'rascunho', approved_by = null, approved_at = null
where status = 'aprovado' and approved_by = 'administrador';

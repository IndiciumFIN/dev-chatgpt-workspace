-- Read-only governed metadata export for the two clinical pilot instruments.
-- Projections are CANDIDATE ONLY; rights/clinical approval and Kernel remain in HOLD.
-- TEMPLATE: replace array values with canonical tool slugs from cko_closure.tool_dossiers;
-- never join to patient records and never run DML/DDL with this template.
WITH target AS (
  SELECT d.tool_slug,d.human_id,d.publication_state,d.canonical_promotion,d.clinical_state,d.review_state,d.rights_state,
         e.entity_type_id,e.status AS entity_status,e.source_of_truth,e.version AS entity_version,
         b.field_binding_status,b.reg_binding_status,b.evidence_binding_status,b.object_engine_ref,b.rule_pack_ref,
         b.object_validator_ref,b.object_engine_status,b.rule_pack_status,b.object_validator_status,b.clinical_review_status,
         b.deployment_status,b.runtime_status
  FROM cko_closure.tool_dossiers d
  JOIN cko_master.entities e ON e.canonical_id=d.human_id
  LEFT JOIN cko_governance.b6_clinical_train_v1_candidate b ON b.canonical_object_id=d.human_id
  WHERE d.tool_slug = ANY(ARRAY['apgar','fugulin']::text[])
)
SELECT jsonb_build_object(
  'canonical_id',t.human_id,
  'tool_slug',t.tool_slug,
  'candidate_only',true,
  'tool_state',jsonb_build_object(
    'entity_type_id',t.entity_type_id,'entity_status',t.entity_status,'entity_version',t.entity_version,
    'source_of_truth',t.source_of_truth,'publication_state',t.publication_state,
    'canonical_promotion',t.canonical_promotion,'clinical_state',t.clinical_state,'rights_state',t.rights_state,
    'clinical_review_status',t.clinical_review_status,'deployment_status',t.deployment_status
  ),
  'object_versions',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'version_id',v.object_version_id,'version',v.version,'state',v.state,'content_hash',v.content_hash)
    ORDER BY v.object_version_id),'[]'::jsonb)
    FROM cko_governance.object_versions v WHERE v.object_ref=t.human_id),
  'fields',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'field_id',f.field_id,'source_field_id',f.source_field_id,'field_name',f.field_name,
    'datatype',f.datatype,'required_status',f.required_status,'enum_values',f.enum_values,
    'validation_completeness_status',f.validation_completeness_status) ORDER BY f.ordinal),'[]'::jsonb)
    FROM cko_governance.md_tool_field_contract_v2_candidate f WHERE f.tool_slug=t.tool_slug),
  'claims',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'claim_id',c.claim_id,'claim_type',c.claim_type,'status',c.status,'human_review_required',c.human_review_required,
    'evidence_refs',c.evidence_refs) ORDER BY c.claim_id),'[]'::jsonb)
    FROM cko_evidence.claims c WHERE c.subject_ref=t.human_id),
  'normative_roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('normative_ref',n.normative_ref,'binding_role',n.binding_role,
    'requirement_ref',n.requirement_ref,'count',n.bindings) ORDER BY n.normative_ref),'[]'::jsonb)
    FROM (SELECT b.normative_ref,b.binding_role,b.requirement_ref,count(*) bindings
      FROM cko_governance.field_normative_bindings b
      JOIN cko_governance.md_tool_field_contract_v2_candidate f ON b.field_id=f.field_id
      WHERE f.tool_slug=t.tool_slug AND b.status='ACTIVE'
      GROUP BY b.normative_ref,b.binding_role,b.requirement_ref) n),
  'runtime_control',jsonb_build_object(
      'field_binding_status',t.field_binding_status,'reg_binding_status',t.reg_binding_status,
      'evidence_binding_status',t.evidence_binding_status,'object_engine_ref',t.object_engine_ref,
      'rule_pack_ref',t.rule_pack_ref,'object_validator_ref',t.object_validator_ref,
      'object_engine_status',t.object_engine_status,'rule_pack_status',t.rule_pack_status,
      'object_validator_status',t.object_validator_status,'runtime_status',t.runtime_status),
  'requirement_bridges',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'claim_id',c.claim_id,'evidence_ref',x.value,
    'extraction_id',d.extraction_id,'requirement_id',req.item->>'requirement_id',
    'extraction_status',d.extraction_status,'requirement_status',req.item->>'status',
    'checker_recorded',d.checker_agent IS NOT NULL AND d.checked_at IS NOT NULL)
    ORDER BY c.claim_id,x.value),'[]'::jsonb)
    FROM cko_evidence.claims c CROSS JOIN LATERAL jsonb_array_elements_text(c.evidence_refs) x(value)
    LEFT JOIN cko_governance.normative_document_extractions d ON d.extraction_id=split_part(x.value,':',1)
    LEFT JOIN LATERAL jsonb_array_elements(coalesce(d.extracted_requirements->'requirements','[]'::jsonb)) req(item)
       ON req.item->>'requirement_id'=split_part(x.value,':',2)
    WHERE c.subject_ref=t.human_id)
) AS candidate_manifest FROM target t ORDER BY t.tool_slug;

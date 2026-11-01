-- Teste vertical read-only: identificadores, vínculos por chave direta, gates fail-closed.
-- Consulta analítica, NÃO avaliação clínica nem decisão de produção.
-- O nome de teste é filtro de descoberta; zero não prova que não existam testes indiretos.
-- A saída ELIGIBILITY_CHECK_ONLY não é permissão de executar/publicar.
WITH cohort AS (
 SELECT d.tool_slug,d.human_id,d.publication_state,d.clinical_state,d.review_state,d.rights_state,d.canonical_promotion,
        e.status AS master_status,e.source_of_truth,v.state AS version_state,
        t.field_binding_status,t.reg_binding_status,t.evidence_binding_status,t.object_validator_status,
        t.object_engine_ref,t.object_engine_status,t.rule_pack_ref,t.rule_pack_status,
        t.renderer_status,t.runtime_status,t.deployment_status,t.clinical_review_status,t.publication_status AS train_publication_status
 FROM cko_closure.tool_dossiers d
 LEFT JOIN cko_master.entities e ON e.canonical_id=d.human_id
 LEFT JOIN LATERAL (
   SELECT state FROM cko_governance.object_versions
   WHERE object_ref=d.human_id ORDER BY created_at DESC,object_version_id DESC LIMIT 1
 ) v ON TRUE
 LEFT JOIN cko_governance.b6_clinical_train_v1_candidate t ON t.canonical_object_id=d.human_id
 WHERE d.tool_slug IN ('apgar','fugulin')
), counts AS (
 SELECT c.*,
 (SELECT count(*) FROM cko_governance.md_tool_field_contract_v2_candidate f WHERE f.tool_slug=c.tool_slug) AS field_count,
 (SELECT count(*) FROM cko_evidence.claims cl WHERE cl.subject_ref=c.human_id) AS claim_count,
 (SELECT count(*) FROM cko_evidence.claims cl WHERE cl.subject_ref=c.human_id AND cl.status NOT IN ('APPROVED','ASSURED','RELEASED')) AS pending_claim_count,
 (SELECT count(*) FROM cko_evidence.claims cl CROSS JOIN LATERAL jsonb_array_elements_text(cl.evidence_refs) ev(ref)
      WHERE cl.subject_ref=c.human_id
        AND NOT EXISTS (SELECT 1 FROM cko_evidence.fragments f WHERE f.fragment_id=ev.ref)
        AND NOT EXISTS (SELECT 1 FROM cko_evidence.sources s WHERE s.source_id=ev.ref)
        AND NOT EXISTS (SELECT 1 FROM cko_evidence.snapshots n WHERE n.snapshot_id=ev.ref)) AS evidence_refs_unresolved_in_cko,
 (SELECT count(*) FROM cko_governance.field_normative_bindings b JOIN cko_governance.md_tool_field_contract_v2_candidate f ON f.field_id=b.field_id WHERE f.tool_slug=c.tool_slug AND b.status='ACTIVE') AS field_normative_count,
 (SELECT count(*) FROM cko_validation.test_catalog tc WHERE lower(tc.test_id) LIKE '%'||c.tool_slug||'%' OR lower(tc.name) LIKE '%'||c.tool_slug||'%') AS named_test_count,
 (SELECT count(*) FROM cko_validation.test_runs tr WHERE lower(tr.test_id) LIKE '%'||c.tool_slug||'%' OR lower(coalesce(tr.execution_ref,'')) LIKE '%'||c.tool_slug||'%') AS named_run_count
 FROM cohort c
)
SELECT tool_slug,human_id,master_status,source_of_truth,version_state,
 field_count,claim_count,pending_claim_count,evidence_refs_unresolved_in_cko,
 field_normative_count,named_test_count,named_run_count,
 field_binding_status,reg_binding_status,evidence_binding_status,
 object_validator_status,object_engine_ref,object_engine_status,rule_pack_ref,rule_pack_status,
 renderer_status,runtime_status,deployment_status,clinical_review_status,
 train_publication_status,rights_state,publication_state,canonical_promotion,
 CASE WHEN source_of_truth IS TRUE AND canonical_promotion IS TRUE
      AND claim_count>0 AND pending_claim_count=0
      AND evidence_refs_unresolved_in_cko=0
      AND object_engine_ref IS NOT NULL AND rule_pack_ref IS NOT NULL
      AND named_run_count>0 AND upper(coalesce(clinical_review_status,'')) IN ('PASS','APPROVED')
      AND upper(coalesce(rights_state,'')) IN ('PASS','APPROVED','PERMITTED')
      AND upper(coalesce(publication_state,'')) IN ('RELEASED','APPROVED')
      THEN 'ELIGIBILITY_CHECK_ONLY_NEEDS_INDEPENDENT_EXECUTION_AND_GATES'
      ELSE 'HOLD_INCOMPLETE_GRAPH'
 END AS diagnostic_gate
FROM counts ORDER BY tool_slug;

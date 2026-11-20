-- CKO | Conteúdo canônico de ferramenta | diagnóstico read-only
-- Executado por SELECT em 2026-10-26 no projeto Supabase Calculadoras-Smart.
-- Válido apenas para observabilidade de chaves diretas: contagens NÃO validam escala, score ou direito de publicação.
-- Não requer extensões, DDL, DML, importação ou segredos. Não processa dados de pacientes.
-- O banco do workspace público permanece desativado por política.
WITH cohort AS (
 SELECT d.tool_slug,
        d.human_id,
        d.publication_state,
        d.clinical_state,
        d.review_state,
        d.rights_state,
        d.canonical_promotion,
        COALESCE(jsonb_array_length(d.source_refs), 0) AS source_pointer_count
 FROM cko_closure.tool_dossiers d
 WHERE d.tool_slug IN ('apgar', 'fugulin', 'insulina', 'gotejamento', 'dimensionamento')
)
SELECT c.tool_slug,
       c.human_id,
       c.publication_state,
       c.clinical_state,
       c.review_state,
       c.rights_state,
       c.canonical_promotion,
       c.source_pointer_count,
       (SELECT COUNT(*) FROM cko_governance.md_tool_field_contract_v2_candidate f
        WHERE f.tool_slug = c.tool_slug) AS candidate_fields,
       (SELECT COUNT(*) FROM cko_governance.md_tool_field_contract_v2_candidate f
        WHERE f.tool_slug = c.tool_slug
          AND f.validation_completeness_status LIKE 'PASS%') AS fields_structurally_passed,
       (SELECT COUNT(*) FROM cko_evidence.claims cl
        WHERE cl.subject_ref = c.human_id) AS claims,
       (SELECT COUNT(*) FROM cko_evidence.claims cl
        WHERE cl.subject_ref = c.human_id
          AND cl.human_review_required) AS claims_requiring_human_review,
       (SELECT COUNT(*) FROM cko_governance.field_normative_bindings b
        JOIN cko_governance.md_tool_field_contract_v2_candidate f
          ON f.field_id = b.field_id
        WHERE f.tool_slug = c.tool_slug) AS field_normative_overlays,
       (SELECT COUNT(*) FROM cko_governance.artifact_normative_bindings b
        JOIN cko_governance.controlled_artifacts a
          ON a.artifact_id = b.artifact_id
        WHERE a.master_entity_ref = c.human_id) AS artifact_normative_bindings,
       (SELECT COUNT(*) FROM cko_governance.object_versions v
        WHERE v.object_ref = c.human_id) AS object_versions,
       (SELECT COUNT(*) FROM cko_master.relationships r
        WHERE r.source_id = c.human_id OR r.target_id = c.human_id) AS master_relationships
FROM cohort c
ORDER BY c.tool_slug;

-- CONSIDERAÇÕES:
-- 1. field_normative_overlays = vinculações transversais de normativos; NÃO prova fonte de score.
-- 2. PASS estrutural de campo inclui campo legado classificado, NÃO comprova mecanismo clínico.
-- 3. claims = registros encontrados com subject_ref exato, NÃO inventário exaustivo de corpus externo.
-- 4. master_relationships=0 não exclui outras relações fora da chave do dossiê.
-- 5. direitos, evidência clínica, variants e cálculos exigem verificação individual.
-- 6. Nunca transformar essa auditoria em gate PASS de conteúdo clínico.

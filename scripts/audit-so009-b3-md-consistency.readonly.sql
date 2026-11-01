-- SO-009: deterministic B3/MD registry reconciliation
-- READ ONLY, no DDL/DML. A HOLD is never auto-promoted.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout='15000ms';

-- One row per identity status: avoid inflating counts through non-unique joins.
SELECT m.identity_status, count(*)::bigint AS records,
 count(*) FILTER (WHERE m.canonical_uuid IS NULL)::bigint AS missing_uuid,
 count(*) FILTER (WHERE m.route IS NULL)::bigint AS missing_route,
 count(*) FILTER (WHERE m.field_count=0)::bigint AS zero_fields,
 count(*) FILTER (WHERE m.source_dossier_ref IS NULL)::bigint AS missing_dossier
FROM cko_governance.md_tool_registry_v2_candidate m
GROUP BY m.identity_status ORDER BY m.identity_status;

-- B3 materialization and release prerequisites.
SELECT b.classification_state, b.field_binding_status,
 count(*)::bigint AS records,
 count(*) FILTER (WHERE b.is_master_materialized IS NOT TRUE)::bigint AS master_not_materialized,
 count(*) FILTER (WHERE b.canonical_uuid IS NULL)::bigint AS uuid_missing,
 count(*) FILTER (WHERE b.canonical_object_ref IS NULL)::bigint AS canonical_object_missing,
 count(*) FILTER (WHERE b.route IS NULL)::bigint AS route_missing,
 count(*) FILTER (WHERE b.version_ref IS NULL)::bigint AS version_missing
FROM cko_governance.b3_object_crosswalk_v1_candidate b
GROUP BY b.classification_state,b.field_binding_status ORDER BY 1,2;

-- A many-to-many or duplicate slug association must be separately investigated.
SELECT 'B3_DUPLICATE_SLUG' AS check_id, count(*)::bigint AS groups_affected
FROM (SELECT source_tool_slug FROM cko_governance.b3_object_crosswalk_v1_candidate
      GROUP BY source_tool_slug HAVING count(*)>1) x;

SELECT 'MD_DUPLICATE_SLUG' AS check_id, count(*)::bigint AS groups_affected
FROM (SELECT tool_slug FROM cko_governance.md_tool_registry_v2_candidate
      GROUP BY tool_slug HAVING count(*)>1) x;

SELECT 'MD_WITHOUT_B3' AS check_id, count(*)::bigint AS rows_affected
FROM cko_governance.md_tool_registry_v2_candidate m
WHERE NOT EXISTS (SELECT 1 FROM cko_governance.b3_object_crosswalk_v1_candidate b WHERE b.source_tool_slug=m.tool_slug);

SELECT 'B3_WITHOUT_MD' AS check_id, count(*)::bigint AS rows_affected
FROM cko_governance.b3_object_crosswalk_v1_candidate b
WHERE NOT EXISTS (SELECT 1 FROM cko_governance.md_tool_registry_v2_candidate m WHERE m.tool_slug=b.source_tool_slug);

-- An identity mismatch cannot be repaired by fabricating IDs.
SELECT 'B3_MD_UUID_MISMATCH' AS check_id, count(*)::bigint AS rows_affected
FROM cko_governance.b3_object_crosswalk_v1_candidate b
JOIN cko_governance.md_tool_registry_v2_candidate m ON m.tool_slug=b.source_tool_slug
WHERE b.canonical_uuid IS NOT NULL AND m.canonical_uuid IS NOT NULL
AND b.canonical_uuid <> m.canonical_uuid;

COMMIT;

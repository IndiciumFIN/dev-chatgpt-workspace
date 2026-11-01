-- WO-CKO-ID-009 · Closure dossier reconciliation · 2026-10-26
-- SELECT only. A matching slug is not a validated identity.
SELECT m.identity_status,
 count(*)::bigint AS registry_records,
 count(*) FILTER (WHERE d.tool_slug IS NOT NULL)::bigint AS dossier_matches,
 count(*) FILTER (WHERE d.canonical_uuid IS NOT NULL)::bigint AS dossier_uuid_present,
 count(*) FILTER (WHERE d.route IS NOT NULL)::bigint AS dossier_route_present,
 count(*) FILTER (WHERE d.tool_slug IS NULL)::bigint AS missing_dossier
FROM cko_governance.md_tool_registry_v2_candidate m
LEFT JOIN cko_closure.tool_dossiers d ON d.tool_slug=m.tool_slug
GROUP BY m.identity_status ORDER BY m.identity_status;

-- Inspect missing identity source one at a time, do not auto-create a master.
SELECT m.tool_slug,m.source_dossier_ref,m.identity_status,m.field_count
FROM cko_governance.md_tool_registry_v2_candidate m
WHERE m.identity_status='IDENTITY_RECOVERED_FIELD_REGISTRY_RUN032_CANONICAL_ID_HOLD'
AND NOT EXISTS (SELECT 1 FROM cko_closure.tool_dossiers d WHERE d.tool_slug=m.tool_slug)
ORDER BY m.tool_slug;

-- Explicitly detect non-null UUID mismatches where a dossier exists.
SELECT m.tool_slug,m.canonical_uuid AS registry_uuid,d.canonical_uuid AS dossier_uuid
FROM cko_governance.md_tool_registry_v2_candidate m
JOIN cko_closure.tool_dossiers d ON d.tool_slug=m.tool_slug
WHERE m.canonical_uuid IS NOT NULL AND d.canonical_uuid IS NOT NULL
AND m.canonical_uuid <> d.canonical_uuid ORDER BY m.tool_slug;

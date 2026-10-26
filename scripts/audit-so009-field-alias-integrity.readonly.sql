-- SO-009 field alias integrity: READ ONLY; no automatic alias admission
SELECT count(*) AS total_fields,
 count(DISTINCT source_field_id) AS unique_source_identifiers,
 count(*) FILTER (WHERE source_field_id <> tool_slug || '::' || field_name) AS proposed_aliases
FROM cko_governance.md_tool_field_contract_v2_candidate;

SELECT tool_slug,source_field_id,field_name,source_artifact,source_catalog_ref
FROM cko_governance.md_tool_field_contract_v2_candidate
WHERE source_field_id <> tool_slug || '::' || field_name
ORDER BY tool_slug,source_field_id;

SELECT tool_slug,field_name,count(*) AS duplicates
FROM cko_governance.md_tool_field_contract_v2_candidate
GROUP BY tool_slug,field_name HAVING count(*)>1 ORDER BY 1,2;

-- Important: different names do not prove aliases. Await evidence and validation.

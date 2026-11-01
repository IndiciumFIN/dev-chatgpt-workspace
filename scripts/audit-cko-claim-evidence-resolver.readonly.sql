-- CKO claim evidence reference resolver (READ ONLY)
-- Source of truth: cko_evidence.sources/snapshots/fragments/assertions.
-- External citations MUST be reviewed as external locator bindings; do not
-- silently classify URLs, PMID or professional opinions as orphaned IDs.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '10000ms';

WITH refs AS (
 SELECT c.claim_id, e.value AS ref
 FROM cko_evidence.claims c
 CROSS JOIN LATERAL jsonb_array_elements_text(c.evidence_refs) e
), resolved AS (
 SELECT r.claim_id,r.ref,
 CASE WHEN so.source_id IS NOT NULL THEN 'SOURCE'
      WHEN sn.snapshot_id IS NOT NULL THEN 'SNAPSHOT'
      WHEN fr.fragment_id IS NOT NULL THEN 'FRAGMENT'
      WHEN r.ref ~* '^https?://' THEN 'EXTERNAL_URI_UNVERIFIED'
      WHEN r.ref ~* '^(PMID:|NCBI_)' THEN 'EXTERNAL_BIBLIOGRAPHIC_UNVERIFIED'
      ELSE 'UNRESOLVED_REVIEW_REQUIRED' END AS binding_status
 FROM refs r
 LEFT JOIN cko_evidence.sources so ON so.source_id=r.ref
 LEFT JOIN cko_evidence.snapshots sn ON sn.snapshot_id=r.ref
 LEFT JOIN cko_evidence.fragments fr ON fr.fragment_id=r.ref
)
SELECT binding_status,count(*)::bigint AS references,count(DISTINCT claim_id)::bigint AS claims
FROM resolved GROUP BY binding_status ORDER BY binding_status;

SELECT 'CLAIM_ASSERTION_REF_UNRESOLVED' check_id,count(*)::bigint AS unresolved
FROM cko_evidence.claims c
CROSS JOIN LATERAL jsonb_array_elements_text(c.assertion_refs) e
WHERE NOT EXISTS (SELECT 1 FROM cko_evidence.assertions a WHERE a.assertion_id=e.value);

SELECT 'SNAPSHOT_SOURCE_UNRESOLVED' check_id,count(*)::bigint AS unresolved
FROM cko_evidence.snapshots sn
WHERE NOT EXISTS (SELECT 1 FROM cko_evidence.sources so WHERE so.source_id=sn.source_id);

COMMIT;

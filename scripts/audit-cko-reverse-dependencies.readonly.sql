-- CKO reverse dependency and typed evidence audit
-- Candidate READ ONLY; no production DDL, no promotion.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout='10000ms';

-- Every claim evidence reference is classified against actual canonical keys.
WITH evidence_edges AS (
 SELECT c.claim_id, e.value AS target_ref
 FROM cko_evidence.claims c
 CROSS JOIN LATERAL jsonb_array_elements_text(c.evidence_refs) e
), typed AS (
 SELECT x.claim_id,x.target_ref,
 CASE WHEN s.source_id IS NOT NULL THEN 'SOURCE'
 WHEN sn.snapshot_id IS NOT NULL THEN 'SNAPSHOT'
 WHEN f.fragment_id IS NOT NULL THEN 'FRAGMENT'
 WHEN x.target_ref ~* '^https?://' THEN 'EXTERNAL_URL_HOLD'
 WHEN x.target_ref ~* '^(PMID:|NCBI_)' THEN 'BIBLIOGRAPHIC_HOLD'
 ELSE 'UNRESOLVED_HOLD' END AS target_type
 FROM evidence_edges x
 LEFT JOIN cko_evidence.sources s ON s.source_id=x.target_ref
 LEFT JOIN cko_evidence.snapshots sn ON sn.snapshot_id=x.target_ref
 LEFT JOIN cko_evidence.fragments f ON f.fragment_id=x.target_ref
)
SELECT target_type, count(*)::bigint AS reference_count,
 count(DISTINCT claim_id)::bigint AS impacted_claims
FROM typed GROUP BY target_type ORDER BY target_type;

-- Trace known normalized links from source to dependent fragments and assertions.
SELECT s.source_id, count(DISTINCT sn.snapshot_id)::bigint AS snapshots,
 count(DISTINCT f.fragment_id)::bigint AS fragments,
 count(DISTINCT a.assertion_id)::bigint AS assertions
FROM cko_evidence.sources s
LEFT JOIN cko_evidence.snapshots sn ON sn.source_id=s.source_id
LEFT JOIN cko_evidence.fragments f ON f.snapshot_id=sn.snapshot_id
LEFT JOIN cko_evidence.assertions a ON a.source_fragment_id=f.fragment_id
GROUP BY s.source_id ORDER BY s.source_id;

-- All 3 canonical levels must preserve referential integrity.
SELECT 'FRAGMENT_WITHOUT_SNAPSHOT' AS check_id,count(*)::bigint AS violations
FROM cko_evidence.fragments f WHERE NOT EXISTS
 (SELECT 1 FROM cko_evidence.snapshots s WHERE s.snapshot_id=f.snapshot_id);

SELECT 'ASSERTION_WITHOUT_FRAGMENT' AS check_id,count(*)::bigint AS violations
FROM cko_evidence.assertions a WHERE a.source_fragment_id IS NOT NULL AND NOT EXISTS
 (SELECT 1 FROM cko_evidence.fragments f WHERE f.fragment_id=a.source_fragment_id);

COMMIT;

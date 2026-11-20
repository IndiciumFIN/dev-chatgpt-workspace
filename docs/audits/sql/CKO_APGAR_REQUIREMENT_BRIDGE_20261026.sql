-- Read-only reference bridge: Claim JSONB ID extraction:requirement -> normative_document_extractions.requirements[]
-- Deterministic locator reconciliation; DOES NOT qualify the scientific source or permit clinical use.
WITH refs AS (
 SELECT c.claim_id, e.value AS evidence_ref,
        split_part(e.value,':',1) AS extraction_id,
        split_part(e.value,':',2) AS requirement_id,
        c.status AS claim_status,c.human_review_required
 FROM cko_evidence.claims c
 CROSS JOIN LATERAL jsonb_array_elements_text(c.evidence_refs) e(value)
 WHERE c.subject_ref='cko:tool:clinical:apgar@1'
),
resolved AS (
 SELECT r.*, d.extraction_status,d.checker_agent,d.checked_at,
        req.item->>'status' AS requirement_status,
        (req.item->>'requirement_id' IS NOT NULL) AS requirement_found
 FROM refs r
 LEFT JOIN cko_governance.normative_document_extractions d
   ON d.extraction_id=r.extraction_id
 LEFT JOIN LATERAL jsonb_array_elements(COALESCE(d.extracted_requirements->'requirements','[]'::jsonb)) req(item)
   ON req.item->>'requirement_id'=r.requirement_id
)
SELECT count(*) AS references_total,
 count(*) filter(where requirement_found) AS resolved_in_normative_extraction,
 count(*) filter(where NOT coalesce(requirement_found,false)) AS unresolved_with_bridge,
 count(*) filter(where extraction_status='CANDIDATE_UNCHECKED') AS extraction_unchecked,
 count(*) filter(where requirement_status='CANDIDATE') AS candidate_requirements,
 count(*) filter(where checker_agent IS NULL OR checked_at IS NULL) AS not_checked,
 count(*) filter(where claim_status='CANDIDATE' and human_review_required) AS refs_to_unreviewed_claims,
 CASE WHEN count(*)=6
 AND count(*) filter(where requirement_found)=6
 AND count(*) filter(where extraction_status='CANDIDATE_UNCHECKED')=6
 THEN 'REFERENCE_PATH_FOUND_BUT_NOT_APPROVED' ELSE 'HOLD_BRIDGE_INCOMPLETE' END AS diagnostic
FROM resolved;

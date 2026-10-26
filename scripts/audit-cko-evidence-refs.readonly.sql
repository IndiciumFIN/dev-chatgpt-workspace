-- CKO evidence-reference shape audit (READ ONLY; HOLD_HUMAN)
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '10000ms';
SELECT count(*) AS malformed_evidence_arrays FROM cko_evidence.claims WHERE jsonb_typeof(evidence_refs) IS DISTINCT FROM 'array';
SELECT count(*) AS malformed_assertion_arrays FROM cko_evidence.claims WHERE jsonb_typeof(assertion_refs) IS DISTINCT FROM 'array';
SELECT count(*) AS missing_evidence_refs FROM cko_evidence.claims WHERE jsonb_typeof(evidence_refs)='array' AND jsonb_array_length(evidence_refs)=0;
SELECT claim_type,status,count(*) AS assertionless_claims FROM cko_evidence.claims WHERE jsonb_typeof(assertion_refs)='array' AND jsonb_array_length(assertion_refs)=0 GROUP BY claim_type,status;
SELECT jsonb_typeof(evidence_refs) AS evidence_kind,jsonb_typeof(validator_run_refs) AS validator_kind,jsonb_typeof(decision_refs) AS decision_kind,count(*) AS rows FROM cko_evidence.evidence_bundles GROUP BY 1,2,3;
COMMIT;

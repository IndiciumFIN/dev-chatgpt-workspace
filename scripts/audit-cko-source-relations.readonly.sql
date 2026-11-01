-- CKO Source/Knowledge Referential Audit — READ ONLY
-- CANDIDATE / HOLD_HUMAN / NEVER A MIGRATION
-- Run only with a read-only DB identity on an authorized environment.
-- No DDL, DML, privileges, or production writes.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '10000ms';

-- R01: snapshot -> source foreign key must eventually be enforced.
SELECT 'R01_SNAPSHOT_MISSING_SOURCE' AS check_id, count(*)::bigint AS violations
FROM cko_evidence.snapshots s
WHERE NOT EXISTS (SELECT 1 FROM cko_evidence.sources x WHERE x.source_id=s.source_id);

-- R02: supersedes must refer to an existing snapshot.
SELECT 'R02_MISSING_SUPERSEDED_SNAPSHOT' AS check_id, count(*)::bigint AS violations
FROM cko_evidence.snapshots s
WHERE s.supersedes_snapshot_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM cko_evidence.snapshots x
    WHERE x.snapshot_id=s.supersedes_snapshot_id);

-- R03: missing snapshot when snapshot_required is true.
-- Projection is a CANDIDATE, so verify its freshness and coverage separately.
SELECT 'R03_REQUIRED_SNAPSHOT_ABSENT' AS check_id, count(*)::bigint AS violations
FROM cko_governance.b2_source_fanin_v1_candidate f
WHERE f.snapshot_required IS TRUE AND f.snapshot_count=0;

-- R04: explicitly unclassified source policy, to be reviewed by owner.
SELECT 'R04_SNAPSHOT_POLICY_UNCLASSIFIED' AS check_id, count(*)::bigint AS violations
FROM cko_evidence.sources s
WHERE NOT EXISTS (
  SELECT 1 FROM cko_governance.b2_source_fanin_v1_candidate f
  WHERE f.source_id=s.source_id
);

-- R05: compare projected snapshot count against canonical snapshots.
SELECT 'R05_STALE_SNAPSHOT_PROJECTION' AS check_id, count(*)::bigint AS violations
FROM cko_governance.b2_source_fanin_v1_candidate f
WHERE f.snapshot_count <> (
  SELECT count(*)::int FROM cko_evidence.snapshots s
  WHERE s.source_id=f.source_id
);

-- R06: identify claims with no assertion edges; not automatically a failure.
SELECT 'R06_CLAIMS_WITHOUT_ASSERTION_REFS' AS check_id,
       count(*)::bigint AS candidates_for_review
FROM cko_evidence.claims
WHERE jsonb_typeof(assertion_refs)='array' AND jsonb_array_length(assertion_refs)=0;

-- R07: non-array JSON references must fail the contract.
SELECT 'R07_MALFORMED_CLAIM_REFS' AS check_id, count(*)::bigint AS violations
FROM cko_evidence.claims
WHERE jsonb_typeof(assertion_refs) IS DISTINCT FROM 'array'
   OR jsonb_typeof(evidence_refs) IS DISTINCT FROM 'array';

-- R08: catalog constraint presence; a zero here requires a governed proposal.
SELECT 'R08_SNAPSHOT_SOURCE_FK_MISSING' AS check_id,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint k
    WHERE k.conrelid='cko_evidence.snapshots'::regclass
      AND k.confrelid='cko_evidence.sources'::regclass
      AND k.contype='f'
  ) THEN 0 ELSE 1 END::bigint AS violations;

-- R09: baseline counts; not a promotion gate.
SELECT
 (SELECT count(*) FROM cko_evidence.sources) AS source_count,
 (SELECT count(*) FROM cko_evidence.snapshots) AS snapshot_count,
 (SELECT count(*) FROM cko_evidence.claims) AS claim_count,
 (SELECT count(*) FROM cko_governance.b2_source_fanin_v1_candidate) AS projected_sources;

COMMIT;

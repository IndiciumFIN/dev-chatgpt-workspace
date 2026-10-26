-- Deterministic specialist: Source integrity. READ ONLY.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout='10000ms';
SELECT 'MISSING_SNAPSHOT' finding, count(*)::bigint total FROM cko_governance.b2_source_fanin_v1_candidate WHERE snapshot_required AND snapshot_count=0;
SELECT 'PROJECTION_DRIFT' finding,count(*)::bigint total FROM cko_governance.b2_source_fanin_v1_candidate f WHERE f.snapshot_count <> (SELECT count(*) FROM cko_evidence.snapshots s WHERE s.source_id=f.source_id);
SELECT 'MISSING_SOURCE' finding,count(*)::bigint total FROM cko_evidence.snapshots s WHERE NOT EXISTS(SELECT 1 FROM cko_evidence.sources x WHERE x.source_id=s.source_id);
SELECT 'MISSING_FRAGMENT' finding,count(*)::bigint total FROM cko_evidence.assertions a WHERE a.source_fragment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM cko_evidence.fragments f WHERE f.fragment_id=a.source_fragment_id);
COMMIT;

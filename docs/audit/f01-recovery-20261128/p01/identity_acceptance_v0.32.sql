-- F01/P01 read-only acceptance checks, PostgreSQL 17. Candidate, not executed.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
DO $$
BEGIN
 IF (SELECT count(*) FROM cko_governance.layer_catalog) <> 44 OR
    (SELECT count(*) FROM cko_master.entities WHERE entity_type_id='LAYER') <> 44 THEN
    RAISE EXCEPTION 'P01 population drift'; END IF;
 IF EXISTS (
 SELECT 1 FROM cko_governance.layer_catalog l
 FULL JOIN (SELECT * FROM cko_master.entities WHERE entity_type_id='LAYER') e ON e.canonical_id=l.layer_id
 LEFT JOIN cko_governance.object_versions v ON v.object_version_id=e.current_version_ref
 WHERE l.layer_id IS NULL OR e.canonical_id IS NULL OR
 v.object_ref IS DISTINCT FROM e.canonical_id OR v.object_class IS DISTINCT FROM 'LAYER' OR
 l.layer_uuid IS NULL OR e.object_uuid IS NULL OR
 substring(l.layer_uuid::text,15,1) <> '7' OR substring(e.object_uuid::text,15,1) <> '7' OR
 substring(l.layer_uuid::text,20,1) NOT IN ('8','9','a','b') OR
 substring(e.object_uuid::text,20,1) NOT IN ('8','9','a','b')
 ) THEN RAISE EXCEPTION 'P01 identity or version mismatch'; END IF;
 IF (SELECT count(DISTINCT layer_uuid) FROM cko_governance.layer_catalog) <> 44 OR
 (SELECT count(DISTINCT object_uuid) FROM cko_master.entities) <> (SELECT count(*) FROM cko_master.entities)
 THEN RAISE EXCEPTION 'P01 duplicate identity'; END IF;
 IF (SELECT array_agg(flow_sequence::integer ORDER BY flow_sequence::integer) FROM cko_governance.layer_catalog)
 IS DISTINCT FROM ARRAY(SELECT generate_series(10,440,10))
 THEN RAISE EXCEPTION 'P01 sequence mismatch'; END IF;
END $$;
SELECT count(*) AS matched_layers,
 count(*) FILTER (WHERE l.layer_uuid <> e.object_uuid) AS distinct_identity_roles
 FROM cko_governance.layer_catalog l JOIN cko_master.entities e ON e.canonical_id=l.layer_id
 WHERE e.entity_type_id='LAYER';
ROLLBACK;

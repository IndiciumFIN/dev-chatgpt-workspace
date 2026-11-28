-- Candidate rehearsal ONLY. Run on isolated restored database, never production.
-- Reuses original 20260822001744 policy template. No commit or authority granted.
BEGIN;
SET LOCAL lock_timeout = '5s';
LOCK TABLE cko_master.entity_types, cko_master.entities, cko_master.id_policies IN SHARE ROW EXCLUSIVE MODE;
DO $$
BEGIN
 IF (SELECT count(*) FROM cko_master.entity_types WHERE active AND ((entity_type_id='LABOR_TOOL' AND id_pattern='^WK-[0-9]{3}$') OR (entity_type_id='DEVICE_COHORT' AND id_pattern='^COHORT-[A-Z0-9-]+$')) ) <> 2 THEN RAISE EXCEPTION 'type contract drift'; END IF;
 IF EXISTS (SELECT 1 FROM cko_master.id_policies WHERE entity_type_id IN ('LABOR_TOOL','DEVICE_COHORT') OR id_policy_id IN ('IDPOL-AUTO-LABOR-TOOL','IDPOL-AUTO-DEVICE-COHORT')) THEN RAISE EXCEPTION 'policy exists or ID collision'; END IF;
 IF (SELECT count(*) FROM cko_master.entities WHERE entity_type_id='LABOR_TOOL') <> 7 OR EXISTS (SELECT 1 FROM cko_master.entities WHERE entity_type_id='DEVICE_COHORT') THEN RAISE EXCEPTION 'population drift'; END IF;
 IF EXISTS (SELECT 1 FROM cko_master.entities e JOIN cko_master.entity_types t USING(entity_type_id) WHERE t.entity_type_id IN ('LABOR_TOOL','DEVICE_COHORT') AND (e.canonical_id IS NULL OR e.canonical_id !~ t.id_pattern)) THEN RAISE EXCEPTION 'identity pattern mismatch'; END IF;
END $$;
INSERT INTO cko_master.id_policies(id_policy_id,entity_type_id,namespace,deterministic_rule,legacy_preservation_rule,reuse_forbidden,status,strategy_code,strategy_config)
SELECT 'IDPOL-AUTO-'||replace(t.entity_type_id,'_','-'),t.entity_type_id,lower(replace(t.entity_type_id,'_','-')),
'Resolve existing canonical identity by exact canonical_id, business_key or governed alias. If no existing identity is found and no class-specific generator is configured, return NEW_ID_RULE_UNDEFINED; never invent or reuse an ID.',
'Existing IDs are immutable identities; merges/splits create explicit versioned governance events and aliases; no silent replacement.',true,'ACTIVE','EXISTING_OR_FAIL_CLOSED','{"new_identity":"HOLD_NO_GENERATOR","merge_split":"EXCEPTION_GOVERNANCE"}'::jsonb
FROM cko_master.entity_types t WHERE t.active AND t.entity_type_id IN ('LABOR_TOOL','DEVICE_COHORT');
DO $$ BEGIN
 IF (SELECT count(*) FROM cko_master.id_policies WHERE entity_type_id IN ('LABOR_TOOL','DEVICE_COHORT') AND status='ACTIVE' AND reuse_forbidden AND strategy_code='EXISTING_OR_FAIL_CLOSED') <> 2 THEN RAISE EXCEPTION 'postcondition failed'; END IF;
END $$;
SELECT count(*) FILTER (WHERE EXISTS (SELECT 1 FROM cko_master.id_policies p WHERE p.entity_type_id=t.entity_type_id AND p.status='ACTIVE')) AS covered, count(*) AS total FROM cko_master.entity_types t WHERE t.active;
ROLLBACK;

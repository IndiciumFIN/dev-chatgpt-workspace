-- Candidate rehearsal ONLY. Run on isolated restored database, never production.
-- Reuses original 20260822001744 policy template. No commit or authority granted.
BEGIN;
SET LOCAL statement_timeout = '60s';
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


-- Enforce at most one active policy per type; reject pre-existing duplicates.
CREATE UNIQUE INDEX p04_one_active_policy_per_type ON cko_master.id_policies(entity_type_id) WHERE status='ACTIVE';
DO $$ BEGIN
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid=to_regprocedure('cko_master.resolve_master_candidate_v2(jsonb)')) IS DISTINCT FROM '8abb3bcffa4a2551fea6d8c89ad96cc6' THEN RAISE EXCEPTION 'resolver drift'; END IF;
END $$;
CREATE OR REPLACE FUNCTION cko_master.resolve_master_candidate_v2(p_candidate jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE t text; bk text; cid text; e cko_master.entities%rowtype; pol cko_master.id_policies%rowtype; ids text[]; reason text;
BEGIN
 t:=nullif(btrim(p_candidate->>'entity_type_id'),''); bk:=nullif(btrim(p_candidate->>'business_key'),''); cid:=nullif(btrim(p_candidate->>'canonical_id'),'');
 IF t IS NULL OR NOT EXISTS(SELECT 1 FROM cko_master.entity_types x WHERE x.entity_type_id=t AND x.active) THEN
 RETURN jsonb_build_object('ok',false,'status','REJECTED','reason',CASE WHEN t IS NULL THEN 'ENTITY_TYPE_REQUIRED' ELSE 'UNKNOWN_ENTITY_TYPE' END,'canonical_promotion',false); END IF;
 IF cid IS NOT NULL AND EXISTS(SELECT 1 FROM cko_master.entities x WHERE x.canonical_id=cid AND x.entity_type_id<>t) THEN reason:='ENTITY_TYPE_MISMATCH';
 ELSE
 SELECT array_agg(DISTINCT x.canonical_id) INTO ids FROM cko_master.entities x WHERE x.entity_type_id=t AND (x.canonical_id=cid OR x.business_key=bk);
 IF cardinality(ids)>1 THEN reason:='IDENTITY_INPUT_CONFLICT';
 ELSIF cardinality(ids)=1 THEN
 SELECT * INTO e FROM cko_master.entities x WHERE x.canonical_id=ids[1];
 IF (cid IS NOT NULL AND cid IS DISTINCT FROM e.canonical_id) OR (bk IS NOT NULL AND bk IS DISTINCT FROM e.business_key) THEN reason:='IDENTITY_INPUT_CONFLICT';
 ELSE RETURN jsonb_build_object('ok',true,'status','RESOLVED_EXISTING','canonical_id',e.canonical_id,'version_ref',e.current_version_ref,'canonical_promotion',false); END IF;
 ELSE
 SELECT array_agg(DISTINCT x.canonical_id) INTO ids FROM cko_master.aliases a JOIN cko_master.entities x ON x.canonical_id=a.canonical_id WHERE x.entity_type_id=t AND (a.alias=cid OR a.alias=bk);
 IF cardinality(ids)>1 THEN reason:='ALIAS_AMBIGUOUS';
 ELSIF cardinality(ids)=1 THEN reason:='ALIAS_AUTHORITY_UNVERIFIED';
 ELSIF (SELECT count(*) FROM cko_master.id_policies p WHERE p.entity_type_id=t AND p.status='ACTIVE')<>1 THEN reason:='ID_POLICY_MISSING_OR_AMBIGUOUS';
 ELSE SELECT * INTO pol FROM cko_master.id_policies p WHERE p.entity_type_id=t AND p.status='ACTIVE';
 RETURN jsonb_build_object('ok',false,'status','HOLD','reason','NEW_ID_RULE_UNDEFINED','entity_type_id',t,'strategy_code',pol.strategy_code,'policy_id',pol.id_policy_id,'canonical_promotion',false); END IF;
 END IF; END IF;
 RETURN jsonb_build_object('ok',false,'status','HOLD','reason',reason,'entity_type_id',t,'canonical_promotion',false);
END $$;


-- No silent coverage gaps. This assertion is not a permanent admission gate.
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM cko_master.entity_types t WHERE t.active AND NOT EXISTS (SELECT 1 FROM cko_master.id_policies p WHERE p.entity_type_id=t.entity_type_id AND p.status='ACTIVE')) THEN RAISE EXCEPTION 'active type missing policy'; END IF;
 IF EXISTS (SELECT 1 FROM cko_master.entities e WHERE e.entity_type_id IN ('LABOR_TOOL','DEVICE_COHORT') AND (cko_master.resolve_master_candidate_v2(jsonb_build_object('entity_type_id',e.entity_type_id,'canonical_id',e.canonical_id))->>'canonical_id') IS DISTINCT FROM e.canonical_id) THEN RAISE EXCEPTION 'identity regression'; END IF;
 IF EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE p.oid=to_regprocedure('cko_master.resolve_master_candidate_v2(jsonb)') AND a.grantee=0 AND a.privilege_type='EXECUTE') THEN RAISE EXCEPTION 'PUBLIC execute privilege'; END IF;
END $$;
ROLLBACK;

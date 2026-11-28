-- Candidate only. Isolated database rehearsal. No persisted changes.
BEGIN;
DO $$ BEGIN
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid=to_regprocedure('cko_master.resolve_master_candidate_v2(jsonb)')) IS DISTINCT FROM '8abb3bcffa4a2551fea6d8c89ad96cc6' THEN RAISE EXCEPTION 'resolver drift'; END IF;
END $$;
CREATE OR REPLACE FUNCTION cko_master.resolve_master_candidate_v2(p_candidate jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,cko_master AS $$
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
ROLLBACK;

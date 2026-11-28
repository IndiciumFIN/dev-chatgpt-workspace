-- P01 candidate rehearsal. Isolated PostgreSQL only. No durable changes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
LOCK TABLE cko_governance.layer_catalog, cko_master.entities IN SHARE ROW EXCLUSIVE MODE;
-- Restrict this candidate to layer identity, not unrelated MD entity classes.
CREATE FUNCTION cko_governance.p01_guard_layer_identity_candidate() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
 IF TG_TABLE_SCHEMA='cko_governance' AND TG_TABLE_NAME='layer_catalog' THEN
   IF NEW.layer_id IS DISTINCT FROM OLD.layer_id OR NEW.layer_uuid IS DISTINCT FROM OLD.layer_uuid THEN
     RAISE EXCEPTION 'P01 immutable layer catalog identity' USING ERRCODE='23514';
   END IF;
 ELSIF TG_TABLE_SCHEMA='cko_master' AND TG_TABLE_NAME='entities' THEN
   IF OLD.entity_type_id='LAYER' OR NEW.entity_type_id='LAYER' THEN
     IF NEW.canonical_id IS DISTINCT FROM OLD.canonical_id OR NEW.object_uuid IS DISTINCT FROM OLD.object_uuid OR NEW.entity_type_id IS DISTINCT FROM OLD.entity_type_id THEN
       RAISE EXCEPTION 'P01 immutable master layer identity' USING ERRCODE='23514';
     END IF;
   END IF;
 ELSE
   RAISE EXCEPTION 'P01 unexpected trigger target';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER p01_guard_layer_catalog_identity BEFORE UPDATE ON cko_governance.layer_catalog
FOR EACH ROW EXECUTE FUNCTION cko_governance.p01_guard_layer_identity_candidate();
CREATE TRIGGER p01_guard_master_layer_identity BEFORE UPDATE ON cko_master.entities
FOR EACH ROW EXECUTE FUNCTION cko_governance.p01_guard_layer_identity_candidate();
-- Test actual trigger execution without retaining changes.
DO $$
DECLARE k text; n integer;
BEGIN
 SELECT layer_id INTO STRICT k FROM cko_governance.layer_catalog ORDER BY layer_id LIMIT 1;
 BEGIN
   UPDATE cko_governance.layer_catalog SET layer_id=layer_id||'-P01-REHEARSAL' WHERE layer_id=k;
   RAISE EXCEPTION 'catalog mutation was not blocked';
 EXCEPTION WHEN check_violation THEN
   IF SQLERRM <> 'P01 immutable layer catalog identity' THEN RAISE; END IF;
 END;
 BEGIN
   UPDATE cko_master.entities SET canonical_id=canonical_id||'-P01-REHEARSAL' WHERE canonical_id=k AND entity_type_id='LAYER';
   RAISE EXCEPTION 'master mutation was not blocked';
 EXCEPTION WHEN check_violation THEN
   IF SQLERRM <> 'P01 immutable master layer identity' THEN RAISE; END IF;
 END;
 UPDATE cko_governance.layer_catalog SET layer_uuid=layer_uuid WHERE layer_id=k;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'catalog nonchanging update failed'; END IF;
 UPDATE cko_master.entities SET object_uuid=object_uuid WHERE canonical_id=k AND entity_type_id='LAYER';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'master nonchanging update failed'; END IF;
END $$;
ROLLBACK;

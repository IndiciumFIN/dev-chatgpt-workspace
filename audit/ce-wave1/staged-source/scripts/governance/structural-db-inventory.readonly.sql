-- CE | structural base inventory | READ ONLY
-- Run with a role authorized to read pg_catalog. This never mutates application data.
-- JSON result describes the live DB at execution time; it is NOT a Kernel admission.
BEGIN TRANSACTION READ ONLY;
WITH db_tables AS (
  SELECT ns.nspname AS schema_name, cl.relname AS table_name,
         cl.oid AS table_oid, cl.relrowsecurity AS rls_enabled,
         cl.relforcerowsecurity AS rls_forced,
         has_table_privilege('anon',cl.oid,'SELECT') AS anon_select,
         has_table_privilege('anon',cl.oid,'INSERT') AS anon_insert,
         has_table_privilege('anon',cl.oid,'UPDATE') AS anon_update,
         has_table_privilege('anon',cl.oid,'DELETE') AS anon_delete,
         has_table_privilege('authenticated',cl.oid,'SELECT') AS authenticated_select,
         has_table_privilege('authenticated',cl.oid,'INSERT') AS authenticated_insert,
         has_table_privilege('authenticated',cl.oid,'UPDATE') AS authenticated_update,
         has_table_privilege('authenticated',cl.oid,'DELETE') AS authenticated_delete
  FROM pg_class cl JOIN pg_namespace ns ON ns.oid=cl.relnamespace
  WHERE ns.nspname IN ('cko_ai','cko_evidence','cko_governance','cko_orch','cko_validation')
    AND cl.relkind IN ('r','p')
),
details AS (
  SELECT t.*,
    (SELECT jsonb_agg(jsonb_build_object('column',a.attname,'type',format_type(a.atttypid,a.atttypmod),
        'not_null',a.attnotnull,'position',a.attnum) ORDER BY a.attnum)
     FROM pg_attribute a WHERE a.attrelid=t.table_oid AND a.attnum>0 AND NOT a.attisdropped) AS columns,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('constraint',k.conname,'type',k.contype,
      'definition',pg_get_constraintdef(k.oid,true)) ORDER BY k.conname),'[]'::jsonb)
     FROM pg_constraint k WHERE k.conrelid=t.table_oid) AS constraints
  FROM db_tables t
)
SELECT jsonb_build_object(
    'status','EVIDENCE_ONLY',
    'releaseGate','HOLD_HUMAN',
    'schemaVersion','1.0.0',
    'exposedSchemasSetting',current_setting('pgrst.db_schemas',true),
    'capturedAt',now(),
    'tableCount',count(*),
    'tables',COALESCE(jsonb_agg(to_jsonb(d) - 'table_oid' ORDER BY schema_name,table_name),'[]'::jsonb)
  ) AS inventory
FROM details d;
COMMIT;

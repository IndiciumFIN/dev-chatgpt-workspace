-- CE Best Excellence: inventario SOMENTE METADADOS do catalogo PostgreSQL.
-- Sem dados de tabelas, corpos de funcoes, segredos ou textos normativos.
-- Executar via psql -X -q -A -t -v ON_ERROR_STOP=1 -f ...
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '30000ms';

WITH scoped AS (
  SELECT oid, nspname
  FROM pg_catalog.pg_namespace
  WHERE nspname NOT IN (
    'pg_catalog','information_schema','auth','storage','realtime',
    'extensions','graphql','graphql_public','vault','pgsodium',
    'supabase_functions','net','cron'
  )
    AND nspname NOT LIKE 'pg_toast%'
    AND nspname NOT LIKE 'pg_temp_%'
),
objects AS (
  SELECT n.nspname AS schema_name, c.relname AS object_name,
         c.relkind AS object_kind, c.relrowsecurity AS rls_enabled,
         c.relforcerowsecurity AS rls_forced,
         c.oid AS object_oid
  FROM pg_catalog.pg_class c
  JOIN scoped n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r','p','v','m','f')
),
catalog AS (
  SELECT jsonb_build_object(
    'schema_version', 'ce-db-catalog.v1',
    'observed_at_utc', to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'database_name', current_database(),
    'server_version', current_setting('server_version'),
    'method', 'PG_CATALOG_METADATA_ONLY_READ_ONLY',
    'schemas', COALESCE((
      SELECT jsonb_agg(s.nspname ORDER BY s.nspname)
      FROM scoped s
    ), '[]'::jsonb),
    'tables', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'schema',o.schema_name,'name',o.object_name,
        'kind',o.object_kind,'rls_enabled',o.rls_enabled,
        'rls_forced',o.rls_forced
      ) ORDER BY o.schema_name,o.object_name)
      FROM objects o
    ), '[]'::jsonb),
    'columns', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'schema',o.schema_name,'table',o.object_name,
        'column',a.attname,'type',pg_catalog.format_type(a.atttypid,a.atttypmod),
        'nullable',NOT a.attnotnull,'has_default',d.oid IS NOT NULL
      ) ORDER BY o.schema_name,o.object_name,a.attnum)
      FROM objects o
      JOIN pg_catalog.pg_attribute a ON a.attrelid=o.object_oid
      LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
      WHERE a.attnum>0 AND NOT a.attisdropped
    ), '[]'::jsonb),
    'constraints', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'schema',o.schema_name,'table',o.object_name,
        'name',con.conname,'type',con.contype,
        'referenced_table',CASE WHEN con.confrelid<>0 THEN
          (SELECT rn.nspname||'.'||rc.relname
           FROM pg_catalog.pg_class rc
           JOIN pg_catalog.pg_namespace rn ON rn.oid=rc.relnamespace
           WHERE rc.oid=con.confrelid) ELSE NULL END
      ) ORDER BY o.schema_name,o.object_name,con.conname)
      FROM objects o JOIN pg_catalog.pg_constraint con ON con.conrelid=o.object_oid
    ), '[]'::jsonb),
    'policies', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'schema',o.schema_name,'table',o.object_name,
        'name',p.polname,'command',p.polcmd,'permissive',p.polpermissive
      ) ORDER BY o.schema_name,o.object_name,p.polname)
      FROM objects o JOIN pg_catalog.pg_policy p ON p.polrelid=o.object_oid
    ), '[]'::jsonb),
    'functions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'schema',n.nspname,'name',p.proname,
        'kind',p.prokind,'security_definer',p.prosecdef,
        'identity_arguments',pg_catalog.pg_get_function_identity_arguments(p.oid)
      ) ORDER BY n.nspname,p.proname,p.oid)
      FROM pg_catalog.pg_proc p JOIN scoped n ON n.oid=p.pronamespace
    ), '[]'::jsonb)
  ) AS payload
)
SELECT jsonb_pretty(payload) FROM catalog;
COMMIT;

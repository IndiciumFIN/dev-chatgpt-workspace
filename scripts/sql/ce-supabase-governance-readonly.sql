-- CE Best Excellence: agregados de governanca e aquisicao; sem texto nem linhas identificaveis.
-- Somente contagens por status; nenhuma claim de homologacao ou aplicabilidade.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '30000ms';

WITH rls AS (
  SELECT n.nspname schema_name,
         COUNT(*) FILTER (WHERE c.relkind IN ('r','p'))::int tables,
         COUNT(*) FILTER (WHERE c.relkind IN ('r','p') AND c.relrowsecurity)::int rls_enabled,
         COUNT(*) FILTER (WHERE c.relkind IN ('r','p') AND NOT c.relrowsecurity)::int rls_disabled
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname IN ('public','calculadoras_de_enfermagem','cko_evidence','cko_governance','cko_orch','cko_regulatory','cko_validation')
    AND c.relkind IN ('r','p')
  GROUP BY n.nspname
),
counts AS (
  SELECT 'normative_references' AS metric, COUNT(*)::int n FROM cko_governance.normative_reference_catalog
  UNION ALL SELECT 'field_normative_bindings', COUNT(*)::int FROM cko_governance.field_normative_bindings
  UNION ALL SELECT 'normative_extractions', COUNT(*)::int FROM cko_governance.normative_document_extractions
  UNION ALL SELECT 'acquisition_queue', COUNT(*)::int FROM cko_regulatory.acquisition_queue
  UNION ALL SELECT 'evidence_sources', COUNT(*)::int FROM cko_evidence.sources
  UNION ALL SELECT 'validators', COUNT(*)::int FROM cko_validation.validators
  UNION ALL SELECT 'validator_executors', COUNT(*)::int FROM cko_validation.validator_executors
  UNION ALL SELECT 'policy_registry', COUNT(*)::int FROM cko_orch.policy_registry
  UNION ALL SELECT 'migration_ledger_entries', COUNT(*)::int FROM supabase_migrations.schema_migrations
),
statuses AS (
  SELECT 'acquisition_queue' AS source, COALESCE(status,'<NULL>') AS status, COUNT(*)::int n
    FROM cko_regulatory.acquisition_queue GROUP BY 1,2
  UNION ALL SELECT 'normative_extractions', COALESCE(extraction_status,'<NULL>'), COUNT(*)::int
    FROM cko_governance.normative_document_extractions GROUP BY 1,2
  UNION ALL SELECT 'source_accreditations', COALESCE(accreditation_status,'<NULL>'), COUNT(*)::int
    FROM cko_evidence.sources GROUP BY 1,2
  UNION ALL SELECT 'validator_implementations', COALESCE(implementation_status,'<NULL>'), COUNT(*)::int
    FROM cko_validation.validator_executors GROUP BY 1,2
  UNION ALL SELECT 'validator_registry', COALESCE(status,'<NULL>'), COUNT(*)::int
    FROM cko_validation.validators GROUP BY 1,2
)
SELECT jsonb_pretty(jsonb_build_object(
  'schema_version','ce-live-governance-aggregate.v1',
  'observed_at_utc',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'scope','METADATA_AGGREGATES_ONLY',
  'counts',(SELECT COALESCE(jsonb_object_agg(metric,n),'{}'::jsonb) FROM counts),
  'rls_posture',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
     'schema',schema_name,'tables',tables,'enabled',rls_enabled,'disabled',rls_disabled
     ) ORDER BY schema_name),'[]'::jsonb) FROM rls),
  'status_groups',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
     'source',source,'status',status,'count',n
     ) ORDER BY source,status),'[]'::jsonb) FROM statuses),
  'interpretation','INVENTORY_ONLY_NO_APPROVAL_NO_MIGRATION'
));
COMMIT;

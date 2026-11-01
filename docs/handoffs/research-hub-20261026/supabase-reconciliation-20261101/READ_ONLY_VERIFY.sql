-- Calculadoras-Smart • verification only; no DDL or DML
select mode,destructive_writes_blocked,require_backup_ref,require_rollback_plan,baseline_promotion_guard,incident_ref
from cko_governance.change_control_state;
select table_name,table_type from information_schema.tables
where table_schema='ce_platform' and (table_name like 'research_%' or table_name='capabilities')
order by table_name;
select table_name from information_schema.tables where table_schema='ce_research_candidate';
select 'projects' as entity,count(*) from ce_platform.research_projects union all
select 'methods',count(*) from ce_platform.research_methods union all
select 'instruments',count(*) from ce_platform.research_instruments union all
select 'artifacts',count(*) from ce_platform.research_artifacts union all
select 'participation',count(*) from ce_platform.research_participation;

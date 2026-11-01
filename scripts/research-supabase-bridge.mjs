/**
 * Supabase Calculadoras-Smart • read-only schema reconciliation.
 * Candidate-only. Never binds remote data to UI or enables DB permissions.
 */
export const PROJECT_REF = "pgsybzggewhinaniybiy";
export const ROOT_TABLES = ["research_projects","research_methods","research_instruments","research_artifacts","research_participation"];
export const DELTA_TABLES = ["analysis_runs","budget_lines","calls_for_proposals","consensus_votes","data_quality_findings","editorial_reviews","funding_transactions","hypotheses","impact_observations","instrument_responses","metric_observations","participation_outcomes","participation_statements","proposal_applications","recruitment_campaigns","research_metrics","research_portfolio_items","research_training_assignments","response_items","retention_rules","risk_scenarios","sampling_plans","source_search_hits"];
export const PUBLICATION_AUTHORIZED = false;
export const TABLE_SQL = [
 "select n.nspname as schema_name,c.relname as table_name,",
 "c.relrowsecurity as rls_enabled,c.relforcerowsecurity as rls_forced,",
 "(select count(*)::int from pg_policies p where p.schemaname=n.nspname and p.tablename=c.relname) as policy_count",
 "from pg_class c join pg_namespace n on n.oid=c.relnamespace",
 "where c.relkind='r' and ((n.nspname='ce_platform' and c.relname in ('research_projects','research_methods','research_instruments','research_artifacts','research_participation'))",
 "or n.nspname='ce_research_candidate') order by schema_name,table_name"
].join(" ");
export const ACCESS_SQL = [
 "select (select count(*)::int from information_schema.role_table_grants",
 "where table_schema='ce_research_candidate' and grantee in ('anon','authenticated','service_role','PUBLIC')) as grants,",
 "has_schema_privilege('anon','ce_research_candidate','USAGE') as anon_usage,",
 "has_schema_privilege('authenticated','ce_research_candidate','USAGE') as authenticated_usage,",
 "has_schema_privilege('service_role','ce_research_candidate','USAGE') as service_usage"
].join(" ");
export const LOCK_SQL = "select mode,baseline_promotion_guard from cko_governance.change_control_state limit 2";
/**
 * @param {{tables:Array<{schema_name:string,table_name:string,rls_enabled:boolean,rls_forced:boolean,policy_count:number}>,access:{grants:number,anon_usage:boolean,authenticated_usage:boolean,service_usage:boolean},lock:{mode:string,baseline_promotion_guard:boolean}}} observation
 */
export function assessResearchTopology({tables,access,lock}) {
 const expected=new Set(DELTA_TABLES);
 const keys=tables.map(x=>x.schema_name+"."+x.table_name);
 const names=new Set(keys);
 const missingRoots=ROOT_TABLES.map(x=>"ce_platform."+x).filter(x=>!names.has(x));
 const missingDelta=DELTA_TABLES.map(x=>"ce_research_candidate."+x).filter(x=>!names.has(x));
 const delta=tables.filter(x=>x.schema_name==="ce_research_candidate");
 const extra=delta.filter(x=>!expected.has(x.table_name)).map(x=>x.table_name);
 const unsafeRls=delta.filter(x=>x.rls_enabled!==true||x.rls_forced!==true).map(x=>x.table_name);
 const unexpectedPolicies=delta.filter(x=>x.policy_count!==0).map(x=>x.table_name);
 const duplicateKeys=keys.filter((x,i)=>keys.indexOf(x)!==i);
 const publicAccess=access.grants!==0||access.anon_usage||access.authenticated_usage||access.service_usage;
 const missingLock=lock.mode!=="EMERGENCY_LOCKDOWN"||lock.baseline_promotion_guard!==true;
 const safe=!missingRoots.length&&!missingDelta.length&&!extra.length&&!unsafeRls.length&&!unexpectedPolicies.length&&!duplicateKeys.length&&!publicAccess&&!missingLock;
 return {status:safe?"PRIVATE_CANDIDATE_HOLD":"DRIFT_OR_ACCESS_RISK_HOLD",
  releaseAuthorized:false,remoteWritesAuthorized:false,missingRoots,missingDelta,extra,unsafeRls,unexpectedPolicies,duplicateKeys,publicAccess,missingLock};
}
/**
 * Only an independently authenticated/authorized server service may supply
 * a restricted SQL reader. No credentials, connection setup, HTTP endpoint,
 * data rows, service role or dynamic SQL are implemented here.
 * @param {{query:(sql:string)=>Promise<{rows:Array<any>}>}} client
 */
export async function inspectResearchSchemaWithAuthorizedReader(client) {
 if(typeof window!=="undefined")throw Error("RESEARCH_SERVER_ONLY");
 const tables=await client.query(TABLE_SQL);
 const access=await client.query(ACCESS_SQL);
 const lock=await client.query(LOCK_SQL);
 if(access.rows.length!==1||lock.rows.length!==1)throw Error("RESEARCH_READ_CONTROL_INCOMPLETE_HOLD");
 return assessResearchTopology({tables:tables.rows,access:access.rows[0],lock:lock.rows[0]});
}

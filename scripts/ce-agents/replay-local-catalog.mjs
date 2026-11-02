#!/usr/bin/env node
/** Stage 1: deterministic metadata replay in isolated LOCAL Supabase. Never original schema parity. */
import { createHash } from 'node:crypto';
import { readdirSync,readFileSync,mkdirSync,writeFileSync } from 'node:fs';
import { join,resolve,dirname } from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const input=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const output=join(root,'artifacts/ce-agents/local-catalog-replay.json');
const expected={schemas:45,tables:606,columns:6486,views:49};
if(process.env.CE_LOCAL_ONLY!=='YES')throw Error('LOCAL_ONLY_GUARD_REQUIRED');
if(!process.env.CE_DB_LOCAL_URL)throw Error('LOCAL_DB_URL_REQUIRED');
const u=new URL(process.env.CE_DB_LOCAL_URL);
if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DB_PROHIBITED');
const files=readdirSync(input).filter(x=>x.endsWith('.json')).sort();
if(files.length!==45)throw Error('SCHEMA_FILES_INCOMPLETE:'+files.length);
const docs=files.map(name=>{
  const raw=readFileSync(join(input,name));
  const o=JSON.parse(raw);
  if(name!==o.origin?.schema+'.json'||o.origin.projectRef!=='pgsybzggewhinaniybiy'||o.recordType!=='READ_ONLY_SCHEMA_SNAPSHOT_NOT_MIGRATION')throw Error('PROVENANCE_OR_TYPE_MISMATCH:'+name);
  if(o.tables.length!==o.integrity.tables||o.tables.some(t=>!Array.isArray(t.columns)||!Array.isArray(t.constraints)||!Array.isArray(t.indexes)))throw Error('INCOMPLETE_TABLE_META:'+name);
  return {o,sha:createHash('sha256').update(raw).digest('hex')};
});
const totals={schemas:docs.length,tables:docs.reduce((n,x)=>n+x.o.tables.length,0),
columns:docs.reduce((n,x)=>n+x.o.tables.reduce((m,t)=>m+t.columns.length,0),0),
views:docs.reduce((n,x)=>n+x.o.integrity.viewsObserved,0)};
for(const k of Object.keys(expected))if(totals[k]!==expected[k])throw Error('COUNT_MISMATCH_'+k+':'+totals[k]);
const db=new pg.Client({connectionString:process.env.CE_DB_LOCAL_URL,application_name:'ce_local_metadata_replay'});
await db.connect();
try{
  await db.query('BEGIN');
  await db.query('CREATE SCHEMA IF NOT EXISTS ce_local_catalog');
  await db.query('CREATE TABLE IF NOT EXISTS ce_local_catalog.schema_snapshot (schema_name text PRIMARY KEY, source_project_ref text NOT NULL, managed_by_supabase boolean NOT NULL, views_observed integer NOT NULL, snapshot_sha256 text NOT NULL)');
  await db.query('CREATE TABLE IF NOT EXISTS ce_local_catalog.table_snapshot (schema_name text NOT NULL REFERENCES ce_local_catalog.schema_snapshot(schema_name), table_name text NOT NULL, metadata jsonb NOT NULL, columns_observed integer NOT NULL, PRIMARY KEY(schema_name,table_name))');
  for(const {o,sha} of docs){
    await db.query('INSERT INTO ce_local_catalog.schema_snapshot (schema_name,source_project_ref,managed_by_supabase,views_observed,snapshot_sha256) VALUES($1,$2,$3,$4,$5) ON CONFLICT(schema_name) DO UPDATE SET source_project_ref=excluded.source_project_ref,managed_by_supabase=excluded.managed_by_supabase,views_observed=excluded.views_observed,snapshot_sha256=excluded.snapshot_sha256',
      [o.origin.schema,o.origin.projectRef,o.isManagedSchema,o.integrity.viewsObserved,sha]);
    for(const t of o.tables)await db.query('INSERT INTO ce_local_catalog.table_snapshot (schema_name,table_name,metadata,columns_observed) VALUES($1,$2,$3,$4) ON CONFLICT(schema_name,table_name) DO UPDATE SET metadata=excluded.metadata,columns_observed=excluded.columns_observed',
      [o.origin.schema,t.name,JSON.stringify(t),t.columns.length]);
  }
  const result=await db.query('SELECT (SELECT COUNT(*)::integer FROM ce_local_catalog.schema_snapshot) schemas, (SELECT COUNT(*)::integer FROM ce_local_catalog.table_snapshot) tables, (SELECT COALESCE(SUM(columns_observed),0)::integer FROM ce_local_catalog.table_snapshot) columns, (SELECT COALESCE(SUM(views_observed),0)::integer FROM ce_local_catalog.schema_snapshot) views');
  for(const k of Object.keys(expected))if(result.rows[0][k]!==expected[k])throw Error('LOCAL_READBACK_MISMATCH:'+k);
  await db.query('COMMIT');
  const report={recordType:'LOCAL_CATALOG_METADATA_REPLAY_NOT_SCHEMA_PARITY',workOrder:'WO-CE-DB-SKELETON-001',sourceProjectRef:'pgsybzggewhinaniybiy',counts:result.rows[0],snapshots:docs.map(x=>({schema:x.o.origin.schema,sha256:x.sha})),noProductionWrites:true,noBusinessRows:true,actualApplicationTablesCreated:false,nextGate:'FULL_DDL_WITH_TYPES_FUNCTIONS_RLS_POLICIES_DEPENDENCY_REVIEW',release:'HOLD_HUMAN'};
  mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:'LOCAL_CATALOG_REPLAY_OK',counts:report.counts,release:report.release}));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

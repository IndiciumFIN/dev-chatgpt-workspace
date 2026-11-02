#!/usr/bin/env node
/**
 * CE independent deterministic LOCAL schema checker.
 * Validates exactly each application table and ordered column name, type,
 * nullability and RLS flag from the pinned pg_catalog snapshots.
 * This is not full DDL/behavior/security parity.
 */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const dir=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const out=join(root,'artifacts/ce-agents/full-ddl-parity-summary.json');
if(process.env.CE_LOCAL_ONLY!=='YES')throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const url=process.env.CE_DB_LOCAL_URL;
if(!url)throw Error('LOCAL_DB_URL_REQUIRED');
const uri=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(uri.hostname)||uri.pathname!=='/postgres'||!['postgres:','postgresql:'].includes(uri.protocol))
  throw Error('REMOTE_DATABASE_PROHIBITED');
const sources=readdirSync(dir).filter(x=>x.endsWith('.json')).sort().map(f=>JSON.parse(readFileSync(join(dir,f),'utf8')));
if(sources.length!==45)throw Error('SOURCE_SCHEMA_COUNT_MISMATCH');
const app=sources.filter(s=>!s.isManagedSchema);
if(app.length!==35)throw Error('APPLICATION_SCHEMA_COUNT_MISMATCH');
const expected=new Map(app.map(s=>[s.origin.schema,new Map(s.tables.map(t=>[t.name,t]))]));
const expectedTables=app.reduce((n,s)=>n+s.tables.length,0);
const expectedColumns=app.reduce((n,s)=>n+s.tables.reduce((m,t)=>m+t.columns.length,0),0);
if(expectedTables!==562||expectedColumns!==6074)throw Error('SOURCE_COUNT_DRIFT');
const db=new pg.Client({connectionString:url,application_name:'ce_local_independent_schema_checker'});
await db.connect();
try{
  const query="SELECT n.nspname AS schema_name,c.relname AS table_name,c.relrowsecurity AS rls,"+
   "COALESCE((SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'nullable',NOT a.attnotnull) ORDER BY a.attnum) FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped),'[]'::jsonb) AS columns "+
   "FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "+
   "WHERE n.nspname=ANY($1::text[]) AND c.relkind IN ('r','p') ORDER BY 1,2";
  const rows=(await db.query(query,[...expected.keys()])).rows;
  const found=new Map();
  const differences=[];
  for(const local of rows){
    const id=local.schema_name+'.'+local.table_name;
    found.set(id,local);
    const want=expected.get(local.schema_name)?.get(local.table_name);
    if(!want){differences.push({key:id,problem:'UNEXPECTED_LOCAL_TABLE'});continue;}
    if(!!local.rls!==!!want.rls)differences.push({key:id,problem:'RLS_FLAG_MISMATCH',local:local.rls,source:want.rls});
    if(local.columns.length!==want.columns.length)differences.push({key:id,problem:'COLUMN_COUNT_MISMATCH',local:local.columns.length,source:want.columns.length});
    const max=Math.max(local.columns.length,want.columns.length);
    for(let i=0;i<max;i++){
      const a=local.columns[i];
      const b=want.columns[i];
      if(!a||!b)continue;
      for(const field of ['name','type','nullable']){
        if(a[field]!==b[field])differences.push({key:id,ordinal:i+1,field,problem:'COLUMN_METADATA_MISMATCH',local:a[field],source:b[field]});
      }
    }
  }
  for(const [schema,tables] of expected)for(const name of tables.keys())
    if(!found.has(schema+'.'+name))differences.push({key:schema+'.'+name,problem:'MISSING_LOCAL_TABLE'});
  const localColumns=rows.reduce((n,t)=>n+t.columns.length,0);
  const matched=differences.length===0&&rows.length===expectedTables&&localColumns===expectedColumns;
  const report={workOrder:'WO-CE-DB-SKELETON-001',recordType:'LOCAL_APPLICATION_TABLE_COLUMN_TYPE_NULLABILITY_RLS_PARITY',
    applicationSchemas:app.length,expectedTables,expectedColumns,actualTables:rows.length,actualColumns:localColumns,
    diffCount:differences.length,differences,tableColumnParity:matched,
    fullSchemaParity:false,remoteProductionMutated:false,
    unverified:['Defaults','Identity attributes','Constraints','Indexes','Policies and grants','Views','Functions','Triggers','Extensions','Content','Kernel admission'],
    releaseGate:'HOLD_HUMAN'};
  mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({appSchemas:app.length,tables:rows.length,columns:localColumns,exactColumnParity:matched,diffCount:differences.length,releaseGate:report.releaseGate}));
  if(!matched)process.exitCode=2;
}finally{await db.end();}

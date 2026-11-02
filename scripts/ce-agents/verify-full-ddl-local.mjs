#!/usr/bin/env node
/** Local-only structural gate for schema-only pg_dump restoration.
 * Never claims grants, RLS behavior, clinical content, or Kernel approval.
 */
import { readFileSync,readdirSync,mkdirSync,writeFileSync } from 'node:fs';
import { join,resolve,dirname } from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const dir=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const out=join(root,'artifacts/ce-agents/full-ddl-parity-summary.json');
if(process.env.CE_LOCAL_ONLY!=='YES')throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const url=process.env.CE_DB_LOCAL_URL;
if(!url)throw Error('LOCAL_DB_URL_REQUIRED');
const uri=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(uri.hostname)||uri.pathname!=='/postgres')
  throw Error('REMOTE_WRITE_PROHIBITED');
const snapshots=readdirSync(dir).filter(x=>x.endsWith('.json')).sort().map(x=>JSON.parse(readFileSync(join(dir,x),'utf8')));
if(snapshots.length!==45)throw Error('INCOMPLETE_SNAPSHOTS');
const app=snapshots.filter(s=>!s.isManagedSchema);
const expected=new Map(app.map(s=>[s.origin.schema,new Map(s.tables.map(t=>[t.name,t.columns.length]))]));
const expectedCount=[...expected.values()].reduce((k,t)=>k+t.size,0);
const expectedColumns=[...expected.values()].reduce((k,t)=>k+[...t.values()].reduce((a,b)=>a+b,0),0);
if(expectedCount!==562)throw Error('APP_SOURCE_TABLE_COUNT_MISMATCH');
const db=new pg.Client({connectionString:url,application_name:'ce_full_schema_local_gate'});
await db.connect();
try{
  const namespaces=[...expected.keys()];
  const q=await db.query("SELECT n.nspname AS schema_name,c.relname AS table_name, "+
    "(SELECT count(*)::integer FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped) AS columns "+
    "FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "+
    "WHERE n.nspname=ANY($1::text[]) AND c.relkind IN ('r','p') ORDER BY 1,2",[namespaces]);
  const found=new Map();
  const diff=[];
  for (const t of q.rows){
    const key=t.schema_name+'.'+t.table_name;
    found.set(key,Number(t.columns));
    const want=expected.get(t.schema_name)?.get(t.table_name);
    if(want===undefined)diff.push({key,problem:'UNEXPECTED_LOCAL_TABLE'});
    else if(want!==Number(t.columns))diff.push({key,problem:'COLUMN_COUNT_MISMATCH',local:t.columns,remote:want});
  }
  for(const [schema,tables] of expected)for(const name of tables.keys())
    if(!found.has(schema+'.'+name))diff.push({key:schema+'.'+name,problem:'MISSING_LOCAL_TABLE'});
  const result={workOrder:'WO-CE-DB-SKELETON-001',
    type:'LOCAL_DDL_TABLE_COLUMN_PARITY_ONLY',
    applicationSchemas:app.length,expectedTables:expectedCount,expectedColumns,
    actualTables:q.rows.length,actualColumns:q.rows.reduce((n,x)=>n+Number(x.columns),0),
    diffCount:diff.length,differences:diff,remoteProductionMutated:false,
    fullSchemaParity:false,undetermined:['Views','Functions','Triggers','RLS policy semantics','Grants','Extensions','Runtime behavior','Content','Owner/Kernel approvals'],
    releaseGate:'HOLD_HUMAN'};
  result.tableColumnParity=diff.length===0 && result.actualColumns===expectedColumns;
  mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({appSchemas:result.applicationSchemas,
    tables:result.actualTables,columns:result.actualColumns,
    tableColumnParity:result.tableColumnParity,diffCount:result.diffCount,
    releaseGate:result.releaseGate}));
  if(!result.tableColumnParity)process.exitCode=2;
} finally {await db.end()}

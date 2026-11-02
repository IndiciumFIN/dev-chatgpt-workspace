#!/usr/bin/env node
/**
 * CE local-only physical-DDL enrichment from pinned pg_catalog snapshots.
 * Replays safe defaults, PK/UNIQUE/CHECK/FK constraints and indexes in isolated
 * PostgreSQL; records every skipped/failed item. NEVER claims full parity.
 * Does not touch functions, views, RLS policy bodies, grants, or user rows.
 */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const input=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const output=join(root,'artifacts/ce-agents/local-physical-ddl.json');
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const u=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DATABASE_PROHIBITED');
const qid=s=>{if(typeof s!=='string'||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s))throw Error('UNSAFE_NAME');return '"'+s+'"';};
const sources=readdirSync(input).filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(readFileSync(join(input,f),'utf8')));
if(sources.length!==45||sources.reduce((x,d)=>x+d.tables.length,0)!==606)throw Error('SOURCE_BASELINE_DRIFT');
const app=sources.filter(d=>!d.isManagedSchema);
const all=app.flatMap(d=>d.tables.map(t=>({schema:d.origin.schema,table:t.name,t})));
if(app.length!==35||all.length!==562)throw Error('APPLICATION_BASELINE_DRIFT');
const count={defaults:0,identities:0,constraints:0,indexes:0};
const applied={defaults:0,constraints:0,indexes:0};
const satisfied={indexes:0}, skipped=[];
const client=new pg.Client({connectionString:url,application_name:'ce_physical_ddl_local_enrichment'});
await client.connect();
async function attempt(kind,key,sql){
  await client.query('SAVEPOINT ce_physical_item');
  try{
    await client.query(sql);
    await client.query('RELEASE SAVEPOINT ce_physical_item');
    applied[kind]++;
  }catch(e){
    await client.query('ROLLBACK TO SAVEPOINT ce_physical_item');
    await client.query('RELEASE SAVEPOINT ce_physical_item');
    skipped.push({kind,key,reason:'LOCAL_DDL_FAILED',sqlstate:e.code||'UNKNOWN',detail:String(e.message||'').slice(0,240)});
  }
}
const safeDefault=e=>{
  const s=e.trim();
  return !/[;]|--|\/\*|\*\//.test(s)&&(
    /^(?:true|false|-?\d+(?:\.\d+)?|now\(\)|CURRENT_TIMESTAMP|gen_random_uuid\(\)|uuid_generate_v4\(\))$/i.test(s)||
    /^'(?:[^']|'')*'::(?:text|jsonb|json|uuid|date|bigint|integer|smallint|boolean|numeric|character varying|timestamp with time zone|text\[\]|uuid\[\])$/i.test(s)
  );
};
const safeConstraint=(k,def)=>{
  if(/[;]|--|\/\*|\*\//.test(def))return false;
  if(k==='p')return /^PRIMARY KEY\s*\(/i.test(def);
  if(k==='u')return /^UNIQUE\s*\(/i.test(def);
  if(k==='f')return /^FOREIGN KEY\s*\(/i.test(def)&&/\sREFERENCES\s/i.test(def);
  if(k==='c')return /^CHECK\s*\(/i.test(def);
  return false;
};
try{
 await client.query('BEGIN');
 // Stage 1: safe, expression-bounded column defaults.
 for(const {schema,table,t} of all){
   for(const col of t.columns){
     if(col.identity){count.identities++;skipped.push({kind:'identity',key:schema+'.'+table+'.'+col.name,reason:'IDENTITY_NOT_REPLAYED'});}
     if(col.default===null)continue;
     count.defaults++;
     const key=schema+'.'+table+'.'+col.name;
     if(!safeDefault(col.default)){skipped.push({kind:'defaults',key,reason:'COMPLEX_DEFAULT_NOT_AUTHORIZED'});continue;}
     await attempt('defaults',key,'ALTER TABLE '+qid(schema)+'.'+qid(table)+' ALTER COLUMN '+qid(col.name)+' SET DEFAULT '+col.default);
   }
 }
 // Stage 2: PK/UNIQUE first for FK dependencies; CHECK second; FK last.
 for(const kind of ['p','u','c','f'])for(const {schema,table,t} of all){
  for(const con of t.constraints.filter(x=>x.type===kind)){
   count.constraints++;
   const key=schema+'.'+table+'.'+con.name;
   if(!safeConstraint(kind,con.definition)){skipped.push({kind:'constraints',key,reason:'UNSAFE_OR_UNSUPPORTED_CONSTRAINT'});continue;}
   await attempt('constraints',key,'ALTER TABLE '+qid(schema)+'.'+qid(table)+' ADD CONSTRAINT '+qid(con.name)+' '+con.definition);
  }
 }
 // Stage 3: exact index definitions from catalog, without multiple SQL statements.
 for(const {schema,table,t} of all)for(const idx of t.indexes){
  count.indexes++;
  const key=schema+'.'+table+'.'+idx.name;
  const existing=await client.query('SELECT to_regclass($1)::text AS name',[schema+'.'+idx.name]);
  if(existing.rows[0].name!==null){satisfied.indexes++;continue;}
  if(!/^CREATE\s+(?:UNIQUE\s+)?INDEX\s+/i.test(idx.definition)||/[;]|--|\/\*|\*\//.test(idx.definition)||
    !idx.definition.includes(' ON '+schema+'.'+table+' ')){
   skipped.push({kind:'indexes',key,reason:'INDEX_DEFINITION_REQUIRES_REVIEW'});continue;
  }
  await attempt('indexes',key,idx.definition);
 }
 await client.query('COMMIT');
 const report={recordType:'PARTIAL_LOCAL_PHYSICAL_DDL_REPLAY_NOT_FULL_PARITY',workOrder:'WO-CE-DB-SKELETON-001',
  sources:45,applicationTables:562,expected:count,applied,satisfied,skippedCount:skipped.length,
  skipped,release:'HOLD_HUMAN',noProductionWrites:true,
  unknownOrMissing:['views','function bodies','triggers','RLS policy predicates','GRANTs and roles','extension dependencies','identity/sequence behavior','data and behavioral parity']};
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:'LOCAL_PHYSICAL_DDL_PARTIAL_REPLAY',expected:count,applied,satisfied,skipped:skipped.length,release:'HOLD_HUMAN'}));
}catch(e){await client.query('ROLLBACK').catch(()=>{});throw e;}finally{await client.end();}

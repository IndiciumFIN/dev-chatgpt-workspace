#!/usr/bin/env node
/** Independent, fail-closed LOCAL physical catalog checker; evidence of partial parity only. */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..'),dir=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const reportPath=join(root,'artifacts/ce-agents/local-physical-ddl-parity.json');
const previous=JSON.parse(readFileSync(join(root,'artifacts/ce-agents/local-physical-ddl.json'),'utf8'));
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const u=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DATABASE_PROHIBITED');
const docs=readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(join(dir,f),'utf8'))).filter(d=>!d.isManagedSchema);
if(docs.length!==35)throw Error('APP_SCHEMA_COUNT_INVALID');
const source=docs.flatMap(d=>d.tables.map(t=>({schema:d.origin.schema,table:t.name,t})));
if(source.length!==562)throw Error('APP_TABLE_COUNT_INVALID');
const constraints=new Map(),indexes=new Map(),defaults=new Set();
for(const x of source){
 const p=x.schema+'.'+x.table;
 for(const c of x.t.constraints)constraints.set(p+'.'+c.name,c.type);
 for(const idx of x.t.indexes)indexes.set(p+'.'+idx.name,true);
 for(const col of x.t.columns)if(col.default!==null)defaults.add(p+'.'+col.name);
}
const expected={constraints:constraints.size,indexes:indexes.size,defaults:defaults.size};
if(expected.constraints!==1834||expected.indexes!==1111||expected.defaults!==2234)throw Error('SOURCE_PHYSICAL_COUNTS_DRIFT');
const db=new pg.Client({connectionString:url,application_name:'ce_independent_physical_checker'});
await db.connect();const differences=[],counts={constraints:0,indexes:0,defaults:0};
try{
 const schemas=docs.map(d=>d.origin.schema);
 const cc=(await db.query(`SELECT n.nspname AS schema_name,c.relname AS table_name,con.conname AS constraint_name,con.contype AS constraint_type
  FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=ANY($1::text[]) ORDER BY 1,2,3`,[schemas])).rows;
 counts.constraints=cc.length;
 const seenConstraints=new Set();
 for(const x of cc){
   const key=x.schema_name+'.'+x.table_name+'.'+x.constraint_name;seenConstraints.add(key);
   if(!constraints.has(key))differences.push({kind:'unexpected_constraint',key});
   else if(constraints.get(key)!==x.constraint_type)differences.push({kind:'constraint_type_mismatch',key});
 }
 for(const key of constraints.keys())if(!seenConstraints.has(key))differences.push({kind:'missing_constraint',key});
 const ii=(await db.query(`SELECT n.nspname AS schema_name,t.relname AS table_name,c.relname AS index_name
  FROM pg_index x JOIN pg_class t ON t.oid=x.indrelid JOIN pg_namespace n ON n.oid=t.relnamespace
  JOIN pg_class c ON c.oid=x.indexrelid WHERE n.nspname=ANY($1::text[]) ORDER BY 1,2,3`,[schemas])).rows;
 counts.indexes=ii.length;const seenIndexes=new Set();
 for(const x of ii){const key=x.schema_name+'.'+x.table_name+'.'+x.index_name;seenIndexes.add(key);if(!indexes.has(key))differences.push({kind:'unexpected_index',key});}
 for(const key of indexes.keys())if(!seenIndexes.has(key))differences.push({kind:'missing_index',key});
 const dd=(await db.query(`SELECT n.nspname AS schema_name,c.relname AS table_name,a.attname AS column_name
  FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum
  JOIN pg_class c ON c.oid=d.adrelid JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname=ANY($1::text[]) ORDER BY 1,2,3`,[schemas])).rows;
 counts.defaults=dd.length;const foundDefaults=new Set();
 for(const x of dd){const key=x.schema_name+'.'+x.table_name+'.'+x.column_name;foundDefaults.add(key);if(!defaults.has(key))differences.push({kind:'unexpected_default',key});}
 const missingDefaults=[...defaults].filter(key=>!foundDefaults.has(key));
 const skippedDefaults=new Set(previous.skipped.filter(x=>x.kind==='defaults').map(x=>x.key));
 for(const key of missingDefaults)if(!skippedDefaults.has(key))differences.push({kind:'unapproved_missing_default',key});
 for(const key of skippedDefaults)if(foundDefaults.has(key))differences.push({kind:'skipped_but_present_default',key});
 const summary={
  recordType:'INDEPENDENT_LOCAL_PG_CATALOG_PHYSICAL_PARITY_WITH_EXPLICIT_OMISSIONS',
  workOrder:'WO-CE-DB-SKELETON-001',expected,readback:counts,
  constraintsExactNameAndType:!differences.some(x=>x.kind.includes('constraint')),
  indexesExactName:!differences.some(x=>x.kind.includes('index')),
  missingDefaults:missingDefaults.length,explicitlySkippedDefaults:skippedDefaults.size,
  missingIdentityAttributes:previous.expected.identities,observedUnexpectedDifferences:differences,
  status:differences.length?'FAIL':'PARTIAL_PARITY_CONFIRMED',release:'HOLD_HUMAN',productionWrite:false,
  caveats:['Constraint/index *existence and type only*: expressions/semantic equivalence not proved','Default expressions not independently compared','Identity/sequence behavior not reproduced','No views, functions, triggers, policies, grants, business data or clinical tests']
 };
 mkdirSync(dirname(reportPath),{recursive:true});writeFileSync(reportPath,JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify({status:summary.status,expected,readback:counts,missingDefaults:missingDefaults.length,missingIdentity:summary.missingIdentityAttributes,diffCount:differences.length,release:'HOLD_HUMAN'}));
 if(differences.length)process.exitCode=2;
}finally{await db.end();}

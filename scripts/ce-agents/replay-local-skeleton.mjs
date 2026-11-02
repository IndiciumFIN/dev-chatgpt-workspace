#!/usr/bin/env node
/**
 * CE stage-2 structural skeleton Maker: source = 45 pinned pg_catalog snapshots.
 * Creates only 562 application tables in a disposable loopback Supabase.
 * NEVER performs remote SQL, real data import, or production promotion.
 * Not complete DDL parity: constraints/defaults/indexes/policies/functions/views pending.
 */
import { readFileSync,readdirSync,mkdirSync,writeFileSync } from 'node:fs';
import { join,resolve,dirname } from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const input=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const output=join(root,'artifacts/ce-agents/local-app-skeleton.json');
const expected={schemas:45,tables:606,columns:6486,views:49,applicationSchemas:35,applicationTables:562};
const qid=x=>{if(typeof x!=='string'||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(x))throw Error('UNSAFE_IDENTIFIER:'+x);return '"'+x+'"';};
const types=/^(?:text(?:\[\])?|jsonb|uuid|boolean|integer|bigint|smallint|date|timestamp with time zone|double precision(?:\[\])?|numeric(?:\([0-9]+,[0-9]+\))?|character(?:\([0-9]+\))?|character varying(?:\([0-9]+\))?|real|bytea|json|time without time zone|timestamp without time zone)$/;
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_MODE_REQUIRED');
const u=new URL(url);
if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DATABASE_PROHIBITED');
const files=readdirSync(input).filter(n=>n.endsWith('.json')).sort();
if(files.length!==45)throw Error('INCOMPLETE_SNAPSHOT_POPULATION:'+files.length);
const docs=files.map(n=>{
  const raw=readFileSync(join(input,n));const d=JSON.parse(raw);
  if(n!==d.origin?.schema+'.json'||d.recordType!=='READ_ONLY_SCHEMA_SNAPSHOT_NOT_MIGRATION'||d.origin.projectRef!=='pgsybzggewhinaniybiy')throw Error('PROVENANCE_MISMATCH:'+n);
  if(!Array.isArray(d.tables)||d.tables.length!==d.integrity.tables)throw Error('TABLE_COUNT_DRIFT:'+n);
  return {d,hash:createHash('sha256').update(raw).digest('hex')};
});
const summary={schemas:docs.length,tables:docs.reduce((n,x)=>n+x.d.tables.length,0),
  columns:docs.reduce((n,x)=>n+x.d.tables.reduce((m,t)=>m+t.columns.length,0),0),
  views:docs.reduce((n,x)=>n+x.d.integrity.viewsObserved,0),
  applicationSchemas:docs.filter(x=>!x.d.isManagedSchema).length,
  applicationTables:docs.filter(x=>!x.d.isManagedSchema).reduce((n,x)=>n+x.d.tables.length,0)};
for(const [k,target] of Object.entries(expected))if(summary[k]!==target)throw Error('BASELINE_MISMATCH:'+k+':'+summary[k]+'/'+target);
const app=docs.filter(x=>!x.d.isManagedSchema);
const omitted={defaults:0,identity:0,generated:0,constraints:0,indexes:0,policies:0,views:summary.views};
for(const {d} of app)for(const t of d.tables){
  if(t.kind!=='r')throw Error('UNSUPPORTED_PARTITIONED_APPLICATION_TABLE:'+d.origin.schema+'.'+t.name);
  qid(d.origin.schema);qid(t.name);
  if(!t.columns.length)throw Error('TABLE_WITHOUT_COLUMNS');
  for(const col of t.columns){
    qid(col.name);
    if(!types.test(col.type))throw Error('UNSUPPORTED_TYPE:'+d.origin.schema+'.'+t.name+'.'+col.name+':'+col.type);
    if(col.default!==null)omitted.defaults++;
    if(col.identity)omitted.identity++;
    if(col.generated)omitted.generated++;
  }
  omitted.constraints+=t.constraints.length;
  omitted.indexes+=t.indexes.length;
  omitted.policies+=t.policy_names.length;
}
const db=new pg.Client({connectionString:url,application_name:'ce_deterministic_app_skeleton_maker'});
await db.connect();
let made=0,secured=0;
try{
  await db.query('BEGIN');
  for(const {d} of app) {
    const schema=qid(d.origin.schema);
    await db.query('CREATE SCHEMA IF NOT EXISTS '+schema);
    for(const t of d.tables){
      const name=schema+'.'+qid(t.name);
      const coll=await db.query('SELECT to_regclass($1)::text AS existing',[d.origin.schema+'.'+t.name]);
      if(coll.rows[0].existing!==null)throw Error('EXISTING_TABLE_WOULD_BE_OVERWRITTEN:'+name);
      const fields=t.columns.map(c=>qid(c.name)+' '+c.type+(c.nullable?'':' NOT NULL'));
      await db.query('CREATE TABLE '+name+' ('+fields.join(', ')+')');
      await db.query('REVOKE ALL ON TABLE '+name+' FROM PUBLIC, anon, authenticated');
      if(t.rls) {await db.query('ALTER TABLE '+name+' ENABLE ROW LEVEL SECURITY');secured++;}
      made++;
    }
  }
  if(made!==expected.applicationTables)throw Error('CREATED_COUNT_INCOMPLETE:'+made);
  await db.query('COMMIT');
  const report={recordType:'ISOLATED_LOCAL_APPLICATION_SKELETON_NOT_FULL_DDL_PARITY',
    workOrder:'WO-CE-DB-SKELETON-001',sourceProjectRef:'pgsybzggewhinaniybiy',
    baseline:summary,actualCreatedTables:made,localRlsEnabledTables:secured,
    intentionallyOmitted:omitted,tableAndColumnTypesFromCatalog:true,
    sourceHashes:app.map(x=>({schema:x.d.origin.schema,sha256:x.hash})),
    noBusinessRows:true,noProductionWrites:true,release:'HOLD_HUMAN',
    limitations:['No PK, FK or CHECK constraints','No indexes or defaults','No policies or grant parity','No functions/views/triggers','Not a clinical or Kernel homologation']};
  mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({result:'LOCAL_APP_SKELETON_CREATED',tables:made,rlsEnabled:secured,omitted,release:report.release}));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

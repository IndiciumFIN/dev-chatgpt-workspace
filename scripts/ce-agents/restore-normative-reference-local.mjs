#!/usr/bin/env node
/** Local-only metadata restoration of 362 real normative registry rows from read-only source snapshot. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const file=join(root,'audit-evidence/mof-foundation-recovery/20261102/read-only-live-registers/normative-reference-catalog.json');
const out=join(root,'artifacts/ce-agents/local-normative-metadata-replay.json');
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const u=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DATABASE_PROHIBITED');
const snapshot=JSON.parse(readFileSync(file,'utf8'));
if(snapshot.recordType!=='FULL_NORMATIVE_REFERENCE_METADATA_NOT_LICENSED_TEXT'||snapshot.sourceProject!=='pgsybzggewhinaniybiy'||snapshot.sourceTable!=='cko_governance.normative_reference_catalog')throw Error('PROVENANCE_UNBOUND');
if(!Array.isArray(snapshot.rows)||snapshot.rows.length!==362||new Set(snapshot.rows.map(x=>x.normative_ref)).size!==362)throw Error('NORMATIVE_SNAPSHOT_INCOMPLETE');
const db=new pg.Client({connectionString:url,application_name:'ce_local_normative_reference_recovery'});
await db.connect();
try{
  await db.query('BEGIN');
  const current=await db.query('SELECT count(*)::int AS n FROM cko_governance.normative_reference_catalog');
  if(current.rows[0].n!==0)throw Error('TARGET_NOT_EMPTY_TO_PREVENT_SILENT_MERGE');
  for(const r of snapshot.rows){
    await db.query(`INSERT INTO cko_governance.normative_reference_catalog
      (normative_ref,title,authority,authority_class,official_uri,applicability,binding_status,full_text_storage_policy,verified_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [r.normative_ref,r.title,r.authority,r.authority_class,r.official_uri,r.applicability,r.binding_status,r.full_text_storage_policy,r.verified_at]);
  }
  const local=await db.query('SELECT normative_ref,title,authority,authority_class,official_uri,applicability,binding_status,full_text_storage_policy,verified_at FROM cko_governance.normative_reference_catalog ORDER BY normative_ref');
  const src=[...snapshot.rows].sort((a,b)=>a.normative_ref.localeCompare(b.normative_ref));
  if(local.rows.length!==362)throw Error('LOCAL_ROW_COUNT_MISMATCH');
  const m=new Map(local.rows.map(x=>[x.normative_ref,x]));
  const mismatches=[];
  for(const r of src){
    const l=m.get(r.normative_ref);
    if(!l){mismatches.push({key:r.normative_ref,kind:'missing'});continue;}
    for(const f of ['title','authority','authority_class','official_uri','applicability','binding_status','full_text_storage_policy']){
      if(l[f]!==r[f])mismatches.push({key:r.normative_ref,field:f});
    }
    const dt=x=>x===null?null:new Date(x).toISOString();
    if(dt(l.verified_at)!==dt(r.verified_at))mismatches.push({key:r.normative_ref,field:'verified_at'});
  }
  if(mismatches.length)throw Error('LOCAL_NORMATIVE_METADATA_DIVERGENCE:'+JSON.stringify(mismatches.slice(0,6)));
  await db.query('COMMIT');
  const report={recordType:'REDACTED_NORMATIVE_REFERENCE_METADATA_REPLAY',workOrder:'WO-CE-DB-SKELETON-001',
    restoredRows:local.rows.length,fieldsMatched:9,verifiedMismatchCount:0,release:'HOLD_HUMAN',
    omittedFields:['attributes','full licensed normative texts'],notFullDataReplica:true,productionWrites:false};
  mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:'LOCAL_NORMATIVE_SOURCE_METADATA_MATCHED',rows:local.rows.length,fields:9,mismatchCount:0,release:'HOLD_HUMAN'}));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

#!/usr/bin/env node
/** LOCAL ONLY; seed recovered official source metadata into existing canonical registry. NO production writes. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const out=join(root,'artifacts/ce-agents/mof-normative-local-seed.json');
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD_REQUIRED');
const u=new URL(url);
if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DATABASE_PROHIBITED');
const reg=JSON.parse(readFileSync(join(root,'audit-evidence/mof-foundation-recovery/20261102/sources/SOURCE_REGISTRY.json'),'utf8'));
const official={
 'SRC-OMG-MOF-2.5.1':['https://www.omg.org/spec/MOF/2.5.1','REFERENCE_ONLY'],
 'SRC-ISO-11179-3-2023':['https://www.iso.org/standard/78915.html','PARTIAL'],
 'SRC-ISO-11179-35-2023':['https://www.iso.org/standard/81727.html','PARTIAL'],
 'SRC-ISO-11179-3-2023-AMD1-2026':['https://www.iso.org/standard/89914.html','PARTIAL'],
 'SRC-JSON-SCHEMA-2020-12':['https://json-schema.org/draft/2020-12','IMPLEMENTATION_STANDARD'],
 'SRC-W3C-PROV-O':['https://www.w3.org/TR/prov-o/','REFERENCE_ONLY']
};
const db=new pg.Client({connectionString:url,application_name:'ce_mof_normative_local_only'});
await db.connect();
const imported=[],missing=[],conflicts=[];
try{
 await db.query('BEGIN');
 for(const [sourceId,[uri,level]] of Object.entries(official)){
  const source=reg.find(x=>x.source_id===sourceId);
  if(!source){missing.push(sourceId);continue;}
  const got=await db.query('SELECT title, official_uri FROM cko_governance.normative_reference_catalog WHERE normative_ref=$1 FOR UPDATE',[sourceId]);
  if(got.rows.length){
    if(got.rows[0].title!==source.title||got.rows[0].official_uri!==uri)conflicts.push(sourceId);
    continue;
  }
  await db.query('INSERT INTO cko_governance.normative_reference_catalog (normative_ref,title,authority,authority_class,official_uri,applicability,binding_status,full_text_storage_policy,attributes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)',[
    sourceId,source.title,sourceId.startsWith('SRC-ISO')?'ISO/IEC':sourceId.startsWith('SRC-OMG')?'OMG':sourceId.startsWith('SRC-W3C')?'W3C':'JSON Schema',
    'OFFICIAL_REFERENCE_METADATA',uri,'CKO_M3_M2_M1_M0_RECONCILIATION','PRE_CANONICAL_REFERENCE','METADATA_ONLY_NO_LICENSED_TEXT',
    JSON.stringify({source_registry_id:sourceId,claim_level:level,source_license_state:source.license_state,work_order:'WO-CE-DB-SKELETON-001',verified_official_metadata:true})
  ]);
  imported.push(sourceId);
 }
 if(missing.length||conflicts.length)throw Error('CANDIDATE_SOURCE_GAP:'+JSON.stringify({missing,conflicts}));
 const check=await db.query('SELECT normative_ref,official_uri FROM cko_governance.normative_reference_catalog WHERE normative_ref=ANY($1::text[])',[Object.keys(official)]);
 if(check.rows.length!==Object.keys(official).length)throw Error('LOCAL_SEED_READBACK_COUNT_MISMATCH');
 await db.query('COMMIT');
 const report={recordType:'RECOVERED_NORMATIVE_REFERENCES_LOCAL_ONLY',workOrder:'WO-CE-DB-SKELETON-001',registered:check.rows.length,inserted:imported,sourceIDs:Object.keys(official),referenceOnly:true,licensedFullTextStored:false,release:'HOLD_HUMAN',productionWrites:false};
 mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:'LOCAL_NORMATIVE_REFERENCES_VALIDATED',registered:check.rows.length,inserted:imported.length,release:'HOLD_HUMAN'}));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

#!/usr/bin/env node
/** Deterministic local-only field dictionary replay from 10 redacted read-only source batches. */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const dir=join(root,'audit-evidence/mof-foundation-recovery/20261102/read-only-live-registers/field-catalog');
const dest=join(root,'artifacts/ce-agents/local-field-catalog-replay.json');
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD');
const u=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DB_FORBIDDEN');
const manifest=JSON.parse(readFileSync(join(dir,'manifest.json'),'utf8'));
if(manifest.sourceRows!==2496||manifest.recordType!=='CANONICAL_FIELD_DICTIONARY_2496_MANIFEST')throw Error('SOURCE_MANIFEST_INVALID');
const parts=readdirSync(dir).filter(x=>/^part-\d\d\.json$/.test(x)).sort();
if(parts.length!==10)throw Error('EXPECTED_TEN_BATCHES');
const batches=parts.map(n=>JSON.parse(readFileSync(join(dir,n),'utf8')));
const src=batches.flatMap(x=>x.rows);
if(src.length!==2496||new Set(src.map(x=>x.field_id)).size!==2496)throw Error('SOURCE_INCOMPLETE');
const keys=['field_id','domain','entity_family','field_name','definition','datatype','required_status','jurisdiction',
'code_system_ref','unit_system_ref','i18n_policy','sensitivity_class','persistence_policy','user_visibility',
'gate_effect','status','created_at','updated_at','required_authority_classes','required_normative_refs'];
const sql=`INSERT INTO cko_governance.field_catalog (${keys.join(',')})
SELECT ${keys.map(x=>'j.'+x).join(',')}
FROM jsonb_to_recordset($1::jsonb) AS j (
${keys.map(x=>x+' '+(['created_at','updated_at'].includes(x)?'timestamptz':x.startsWith('required_')&&x.endsWith('_refs')||x==='required_authority_classes'?'text[]':'text')).join(',\n')}
)`;
const db=new pg.Client({connectionString:url,application_name:'ce_local_dictionary_restore'});
await db.connect();
try{
 await db.query('BEGIN');
 const baseline=await db.query('SELECT count(*)::int n FROM cko_governance.field_catalog');
 if(baseline.rows[0].n!==0)throw Error('TARGET_NOT_EMPTY');
 for(const part of batches){
   if(part.recordType!=='CANONICAL_FIELD_DICTIONARY_REDACTED_SOURCE_METADATA')throw Error('PART_PROVENANCE_INVALID');
   await db.query(sql,[JSON.stringify(part.rows)]);
 }
 const got=(await db.query('SELECT '+keys.join(',')+' FROM cko_governance.field_catalog')).rows;
 const index=new Map(got.map(x=>[x.field_id,x]));
 const mismatches=[];
 const normDate=x=>x==null?null:new Date(x).getTime();
 for(const item of src){
   const row=index.get(item.field_id);
   if(!row){mismatches.push({field_id:item.field_id,type:'missing'});continue;}
   for(const key of keys){
     const a=item[key],b=row[key];
     if(key==='created_at'||key==='updated_at'){
       if(normDate(a)!==normDate(b))mismatches.push({field_id:item.field_id,key});
     }else if(JSON.stringify(a)!==JSON.stringify(b))mismatches.push({field_id:item.field_id,key});
   }
 }
 if(index.size!==2496||mismatches.length)throw Error('DICTIONARY_READBACK_FAILURE:'+JSON.stringify({size:index.size,mismatches:mismatches.slice(0,6)}));
 await db.query('COMMIT');
 const missed=src.filter(x=>!x.required_normative_refs?.length);
 const out={status:'LOCAL_FIELD_DICTIONARY_2496_MATCHED',workOrder:'WO-CE-DB-SKELETON-001',
   restored:got.length,fieldsCompared:keys.length,rawAttributeColumnExcluded:true,
   sourceNormativeRefsMissing:missed.length,sourceFieldsWithNormativeRefs:2496-missed.length,
   diffCount:0,release:'HOLD_HUMAN',productionWrite:false,
   caveat:'Timestamp parity checked to JavaScript millisecond precision; complete JSONB attributes intentionally excluded'};
 mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify(out));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

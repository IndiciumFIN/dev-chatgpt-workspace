#!/usr/bin/env node
/** Restore exact existing process metadata into isolated LOCAL PostgreSQL only. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import pg from 'pg';
const root=resolve(import.meta.dirname,'../..');
const src=JSON.parse(readFileSync(join(root,'audit-evidence/mof-foundation-recovery/20261102/read-only-live-registers/processes-full.json'),'utf8'));
const out=join(root,'artifacts/ce-agents/local-process-recovery.json');
const url=process.env.CE_DB_LOCAL_URL;
if(process.env.CE_LOCAL_ONLY!=='YES'||!url)throw Error('LOCAL_ONLY_GUARD');
const u=new URL(url);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['postgres:','postgresql:'].includes(u.protocol)||u.pathname!=='/postgres')throw Error('REMOTE_DB_FORBIDDEN');
if(src.recordType!=='FULL_CKO_PROCESS_GOVERNANCE_ROWS'||src.sourceTable!=='cko_flow.processes'||src.sourceProject!=='pgsybzggewhinaniybiy'||src.rows.length!==12)throw Error('PROCESS_PROVENANCE_INVALID');
const db=new pg.Client({connectionString:url,application_name:'ce_process_local_replay'});await db.connect();
try{
 await db.query('BEGIN');
 const existing=await db.query('SELECT count(*)::int AS n FROM cko_flow.processes');
 if(existing.rows[0].n!==0)throw Error('LOCAL_PROCESSES_NOT_EMPTY');
 for(const x of src.rows){
   await db.query('INSERT INTO cko_flow.processes (process_id,sequence_no,name,purpose,owner_function,input_contract,output_contract,control_refs,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)',
    [x.process_id,x.sequence_no,x.name,x.purpose,x.owner_function,x.input_contract,x.output_contract,JSON.stringify(x.control_refs),x.status]);
 }
 const check=(await db.query('SELECT process_id,sequence_no,name,purpose,owner_function,input_contract,output_contract,control_refs,status FROM cko_flow.processes ORDER BY process_id')).rows;
 const sorted=[...src.rows].sort((a,b)=>a.process_id.localeCompare(b.process_id));
 let errors=0;
 for(let i=0;i<check.length;i++){
  const a=check[i],b=sorted[i];
  for(const k of Object.keys(b)){
   if(JSON.stringify(a[k])!==JSON.stringify(b[k]))errors++;
  }
 }
 if(check.length!==12||errors)throw Error('PROCESS_METADATA_READBACK_MISMATCH:'+errors);
 await db.query('COMMIT');
 const report={status:'LOCAL_PROCESSES_12_RESTORED',workOrder:'WO-CE-DB-SKELETON-001',rows:12,fieldDiffs:0,release:'HOLD_HUMAN',productionWrite:false};
 mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}

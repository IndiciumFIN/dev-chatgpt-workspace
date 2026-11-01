#!/usr/bin/env node
/** Fail closed on synthetic approvals; preserve the exact historical migration 0037. */
import {readFileSync,existsSync} from 'node:fs';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
const HISTORICAL='0037_preencher_derby.sql';
const HISTORICAL_GIT_BLOB='485fed72feeefe931f77a7334581f90c532a0417';
const REPAIR='0048_governance_placeholder_quarantine.sql';
const highRisk=['kernel_atom','kernel_claim','business_rule','ai_control','governance_item','data_specification','policy_ack','content_text'];
const withoutComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/--[^\r\n]*/g,'');
function shaGit(s){const b=Buffer.from(s);return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
export function auditMigrationFiles(files,{expectedHistoricalBlob=HISTORICAL_GIT_BLOB}={}){
 const violations=[],list=[...files].sort();
 const historic=list.find(p=>basename(p)===HISTORICAL);
 const repair=list.find(p=>basename(p)===REPAIR);
 if(!historic)violations.push('MISSING_HISTORICAL_0037');
 if(!repair)violations.push('MISSING_CORRECTIVE_0048');
 for(const file of list)if(!existsSync(file))violations.push('MISSING_FILE:'+file);
 if(historic&&existsSync(historic)&&shaGit(readFileSync(historic))!==expectedHistoricalBlob)violations.push('HISTORICAL_0037_MODIFIED');
 if(repair&&existsSync(repair)){
  const s=withoutComments(readFileSync(repair,'utf8')).toLowerCase();
  for(const table of highRisk){
   if(!new RegExp('\\bupdate\\s+'+table+'\\s+set\\b','i').test(s))violations.push('REPAIR_MISSING_'+table.toUpperCase());
  }
  for(const table of highRisk.filter(t=>t!=='content_text')){
   if(!new RegExp('\\bupdate\\s+'+table+'\\s+set\\b[^;]*\\bwhere\\b[^;]*derby-normalizacao','i').test(s))violations.push('REPAIR_UNSCOPED_'+table.toUpperCase());
  }
 }
 for(const file of list){
  if(!existsSync(file)||basename(file)===HISTORICAL||basename(file)===REPAIR)continue;
  for(const [i,sql] of withoutComments(readFileSync(file,'utf8')).split(';').entries()){
   if(!/\bupdate\s+(kernel_atom|kernel_claim|business_rule|ai_control|governance_item|data_specification|policy_ack|content_text)\s+set\b/i.test(sql))continue;
   if(/(?:'derby-normalizacao'|'DERBY')/i.test(sql)&&/\b(?:approved_by|approved_at|admitted_by|admitted_at|accepted_at|owner_user_id|status)\s*=/i.test(sql))
    violations.push('SYNTHETIC_AUTHORITY:'+basename(file)+':'+(i+1));
  }
 }
 return {files:list.length,violations,gate:violations.length?'HOLD_HUMAN':'STATIC_PASS_NOT_AUTHORIZATION'};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const files=process.argv.slice(2);
 if(!files.length){console.error('Provide migration SQL paths');process.exit(2);}
 const result=auditMigrationFiles(files);
 console.log(JSON.stringify(result));
 if(result.violations.length)process.exitCode=1;
}

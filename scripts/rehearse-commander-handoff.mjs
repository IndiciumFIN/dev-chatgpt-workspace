#!/usr/bin/env node
/** End-to-end, read-only WO handoff rehearsal with isolated temporary artifacts. */
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2),idx=args.indexOf('--wo'),wo=idx>=0?args[idx+1]:null;
if(!/^WO-[A-Z0-9-]+$/.test(wo||'')){console.error('Usage: node scripts/rehearse-commander-handoff.mjs --wo WO-ID');process.exit(2)}
const temp=mkdtempSync(join(tmpdir(),'ce-handoff-rehearsal-'));
const run=(script,options)=>{
 const p=spawnSync(process.execPath,[script,...options],{encoding:'utf8',timeout:15000});
 if(p.status!==0)throw Error(script+' rejected: '+p.stderr+' '+p.stdout);
 return p;
};
try{
 const dir=join(temp,'task'),report=join(temp,'receipt.json');
 run('scripts/export-commander-task.mjs',['--wo',wo,'--out',dir]);
 run('scripts/check-commander-delivery.mjs',['--package',dir,'--report',report]);
 const receipt=JSON.parse(readFileSync(report,'utf8'));
 const manifest=JSON.parse(readFileSync(join(dir,'manifest.json'),'utf8'));
 const data=readFileSync(join(dir,'task.json'));
 if(receipt.status!=='CANDIDATE_VERIFIED'||receipt.execution!=='FORBIDDEN'||receipt.imported!==false||manifest.sha256!==createHash('sha256').update(data).digest('hex'))throw Error('BAD_RECEIPT');
 console.log(JSON.stringify({status:'PASS',workOrderId:wo,steps:['EXPORT','VERIFY_INTEGRITY','ISSUE_READ_ONLY_RECEIPT','CLEAN_UP'],execution:'FORBIDDEN',remoteDispatch:false,repositoryMutation:false,receiptStatus:receipt.status,taskSha256:manifest.sha256},null,2));
}catch(e){console.error(JSON.stringify({status:'FAIL',workOrderId:wo,error:String(e.message)}));process.exitCode=1}
finally{rmSync(temp,{recursive:true,force:true})}

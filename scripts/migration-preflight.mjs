#!/usr/bin/env node
/** Migration preflight: deterministic local source scan, no network, no DB writes. */
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const digest=x=>createHash('sha256').update(x).digest('hex');
const HERE=resolve(fileURLToPath(new URL('../migrations/',import.meta.url)));
function collect(dir,root){
  const out=[];
  for(const d of readdirSync(dir,{withFileTypes:true})){
    const full=join(dir,d.name);
    if(d.isSymbolicLink())throw Error('HOLD_SYMLINK:'+relative(root,full));
    if(d.isDirectory())out.push(...collect(full,root));
    else if(d.isFile()&&d.name.endsWith('.sql')){
      const buf=readFileSync(full);
      out.push({name:d.name,path:relative(root,full).split(sep).join('/'),bytes:buf.length,sha256:digest(buf)});
    }
  }
  return out.sort((a,b)=>a.path.localeCompare(b.path));
}
export function auditMigrationSources(root=HERE){
  const files=collect(root,root);
  const active=files.filter(x=>!x.path.includes('/'));
  const candidates=files.filter(x=>x.path.includes('/'));
  const repeated=field=>{
    const grouped=new Map();
    for(const f of files){const items=grouped.get(f[field])??[];items.push(f.path);grouped.set(f[field],items);}
    return [...grouped].filter(([,v])=>v.length>1).map(([key,paths])=>({key,paths}));
  };
  const versions=active.map(f=>Number(f.name.slice(0,4)));
  const gaps=Array.from({length:active.length},(_,i)=>i+1).filter(n=>!versions.includes(n));
  const invalid=active.filter(f=>!/^\d{4}_[a-zA-Z0-9_-]+\.sql$/.test(f.name)).map(f=>f.path);
  const duplicateNames=repeated('name'),duplicateBytes=repeated('sha256');
  const holds=[];
  if(!active.length)holds.push('EMPTY_ACTIVE_MIGRATIONS');
  if(invalid.length)holds.push('INVALID_ROOT_FILE');
  if(gaps.length||new Set(versions).size!==versions.length)holds.push('VERSION_CONFLICT');
  if(duplicateNames.length||duplicateBytes.length)holds.push('DUPLICATE_SQL');
  const planSha256=digest(JSON.stringify(active.map(f=>[f.path,f.sha256])));
  return {mode:'READ_ONLY',version:1,activeCount:active.length,candidateCount:candidates.length,active,candidates,duplicateNames,duplicateBytes,gaps,invalid,planSha256,holds,
    release:'HOLD_HUMAN'};
}
export function assertRelease(plan,env,dbUrl){
  if(plan?.mode!=='READ_ONLY'||!Array.isArray(plan.holds))throw Error('HOLD_INVALID_MIGRATION_PLAN');
  if(plan.holds.length)throw Error('HOLD_SOURCE_DUPLICATION:'+plan.holds.join(','));
  if(env.CE_MIGRATION_HUMAN_RELEASE!=='APPROVED'||!/^[A-Za-z0-9_-]{8,100}$/.test(env.CE_MIGRATION_WO_ID??''))throw Error('HOLD_HUMAN_WORK_ORDER');
  if(env.CE_MIGRATION_PLAN_SHA256!==plan.planSha256)throw Error('HOLD_PLAN_HASH_DRIFT');
  let u;try{u=new URL(dbUrl);if(!['postgres:','postgresql:'].includes(u.protocol))throw Error();}catch{throw Error('HOLD_INVALID_DATABASE_URL');}
  const host=u.hostname.toLowerCase();
  if(!host||env.CE_MIGRATION_EXPECTED_HOST?.toLowerCase()!==host)throw Error('HOLD_DATABASE_TARGET_IDENTITY');
  if(host.endsWith('.supabase.co'))throw Error('HOLD_CE_SUPABASE_REQUIRES_SEPARATE_MIGRATOR');
  return {host,planSha256:plan.planSha256,workOrder:env.CE_MIGRATION_WO_ID};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv[2]!=='--report'||process.argv.length!==3)throw Error('USAGE: --report');
  const x=auditMigrationSources();
  console.log(JSON.stringify(x,null,2));
  process.exitCode=x.holds.length?2:0;
 }catch(e){console.error(e.message);process.exitCode=2;}
}

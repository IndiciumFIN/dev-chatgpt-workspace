import {createHash} from 'node:crypto';
import {normalizeDemoSubmission,DemoContractError} from '../src/demo-persistence-contract.js';

const PROJECT_URL='https://hcqukuotfwflmebjygam.supabase.co';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DIGEST=/^[0-9a-f]{64}$/;
const ORG=/^[A-Z][A-Z0-9_-]{2,31}$/;
const JWT=/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function respond(res,status,body){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Vary','Authorization, X-WUTRIB-Org');
 return res.status(status).json(body);
}

async function confirmIdentity(url,publishable,jwt){
 const r=await fetch(url+'/auth/v1/user',{
  method:'GET',headers:{apikey:publishable,Authorization:'Bearer '+jwt,Accept:'application/json'},
  cache:'no-store',signal:AbortSignal.timeout(10000)
 });
 if(r.status===401||r.status===403)return null;
 if(!r.ok)throw new Error('Identity provider unavailable');
 const user=await r.json();
 if(!UUID.test(String(user?.id||'')))throw new Error('Unverified user identity');
 if(user.is_anonymous===true||(!user.email_confirmed_at&&!user.phone_confirmed_at))
  return null;
 return {id:user.id};
}

async function rpc(url,key,method,args){
 const r=await fetch(url+'/rest/v1/rpc/'+method,{
  method:'POST',
  headers:{'Content-Type':'application/json',apikey:key,Authorization:'Bearer '+key},
  body:JSON.stringify(args),signal:AbortSignal.timeout(10000)
 });
 if(!r.ok)throw new Error('Privileged RPC unavailable');
 return r.json();
}

export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)){
  res.setHeader('Allow','GET, POST');
  return respond(res,405,{error:'METHOD_NOT_ALLOWED'});
 }
 const url=process.env.WUTRIB_SUPABASE_URL;
 const key=process.env.WUTRIB_SUPABASE_SERVICE_ROLE_KEY;
 const publishable=process.env.WUTRIB_SUPABASE_PUBLISHABLE_KEY;
 if(process.env.WUTRIB_DEMO_AUTH_ENABLED!=='true'||url!==PROJECT_URL||!key||!publishable)
  return respond(res,503,{error:'DEMO_PERSISTENCE_DISABLED'});

 const bearer=/^Bearer ([^\s]+)$/.exec(String(req.headers?.authorization||''))?.[1];
 if(!bearer||bearer.length>8192||!JWT.test(bearer)){
  res.setHeader('WWW-Authenticate','Bearer');
  return respond(res,401,{error:'UNAUTHORIZED'});
 }
 const org=req.headers?.['x-wutrib-org'];
 if(typeof org!=='string'||!ORG.test(org))
  return respond(res,400,{error:'INVALID_ORGANIZATION'});

 try{
  const user=await confirmIdentity(url,publishable,bearer);
  if(!user){
   res.setHeader('WWW-Authenticate','Bearer');
   return respond(res,401,{error:'UNAUTHORIZED'});
  }
  const operation=req.method==='POST'?'SAVE':'READ';
  const grant=await rpc(url,key,'wutrib_demo_org_authorize_v1',{
   p_actor:user.id,p_org:org,p_operation:operation
  });
  if(typeof grant?.allowed!=='boolean')throw new Error('Authorization contract unavailable');
  if(!grant.allowed)return respond(res,403,{error:'ORG_ACCESS_DENIED'});

  let dossier=null,id=null;
  if(req.method==='POST'){
   if(!/^application\/json(?:\s*;|$)/i.test(String(req.headers?.['content-type']||'')))
    return respond(res,415,{error:'JSON_REQUIRED'});
   const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
   if(typeof raw!=='string'||Buffer.byteLength(raw,'utf8')>16384)
    return respond(res,413,{error:'PAYLOAD_TOO_LARGE'});
   let input;try{input=JSON.parse(raw);}catch{return respond(res,400,{error:'INVALID_JSON'});}
   dossier=normalizeDemoSubmission(input);
  }else{
   id=typeof req.query?.id==='string'?req.query.id:new URL(req.url,'http://localhost').searchParams.get('id');
   if(!id||!UUID.test(id))return respond(res,400,{error:'INVALID_CASEFILE_ID'});
  }

  // Shared durable per-identity/per-organization quota; legacy global token is not used.
  const operatorSha=createHash('sha256').update('wutrib:demo:v042:'+org+':'+user.id).digest('hex');
  const quota=await rpc(url,key,'wutrib_demo_request_gate_v1',{p_operator_sha:operatorSha});
  if(typeof quota?.allowed!=='boolean')throw new Error('Rate limit unavailable');
  if(!quota.allowed){
   res.setHeader('Retry-After','60');
   return respond(res,429,{error:'DEMO_RATE_LIMITED'});
  }

  if(req.method==='POST'){
   const stored=await rpc(url,key,'wutrib_demo_org_casefile_save_v1',{
    p_actor:user.id,p_org:org,p_dossier:dossier
   });
   if(!UUID.test(String(stored?.id||''))||!DIGEST.test(String(stored?.digest||'')))
    throw new Error('Casefile storage unavailable');
   return respond(res,201,{
    id:stored.id,digest:stored.digest,organizationCode:org,
    approval:'NOT_APPROVED',taxConformity:'NOT_EVALUATED'
   });
  }

  const result=await rpc(url,key,'wutrib_demo_org_casefile_get_v1',{
   p_actor:user.id,p_org:org,p_id:id
  });
  if(!result?.id)return respond(res,404,{error:'CASEFILE_NOT_FOUND'});
  if(result.id!==id)throw new Error('Casefile identity mismatch');
  return respond(res,200,{...result,organizationCode:org});
 }catch(e){
  if(e instanceof DemoContractError)
   return respond(res,422,{error:'SYNTHETIC_CONTRACT_REJECTED'});
  return respond(res,502,{error:'PERSISTENCE_BACKEND_UNAVAILABLE'});
 }
}

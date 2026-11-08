import {createHash,timingSafeEqual} from 'node:crypto';
import {normalizeDemoSubmission,DemoContractError} from '../src/demo-persistence-contract.js';
const PROJECT_URL='https://hcqukuotfwflmebjygam.supabase.co';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function respond(res,s,d){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Authorization');return res.status(s).json(d);}
function validOperator(header,secret){
 const value=/^Bearer ([^\s]+)$/.exec(String(header||''))?.[1];
 if(!value||!secret||secret.length<32)return false;
 return timingSafeEqual(createHash('sha256').update(value).digest(),createHash('sha256').update(secret).digest());
}
async function rpc(url,key,method,args){
 const res=await fetch(url+'/rest/v1/rpc/'+method,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:'Bearer '+key},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw new Error('RPC unavailable');
 return res.json();
}
export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return respond(res,405,{error:'METHOD_NOT_ALLOWED'});}
 const token=process.env.WUTRIB_OPERATOR_TOKEN,key=process.env.WUTRIB_SUPABASE_SERVICE_ROLE_KEY,url=process.env.WUTRIB_SUPABASE_URL;
 if(!token||token.length<32||!key||url!==PROJECT_URL)return respond(res,503,{error:'DEMO_PERSISTENCE_DISABLED'});
 if(!validOperator(req.headers?.authorization,token)){res.setHeader('WWW-Authenticate','Bearer');return respond(res,401,{error:'UNAUTHORIZED'});}
 try{
  if(req.method==='POST'){
   if(!/^application\/json(?:\s*;|$)/i.test(String(req.headers?.['content-type']||'')))return respond(res,415,{error:'JSON_REQUIRED'});
   const content=typeof req.body==='string'?req.body:JSON.stringify(req.body);
   if(typeof content!=='string'||Buffer.byteLength(content,'utf8')>16384)return respond(res,413,{error:'PAYLOAD_TOO_LARGE'});
   let input;try{input=JSON.parse(content);}catch{return respond(res,400,{error:'INVALID_JSON'});}
   const dossier=normalizeDemoSubmission(input);
   const digest=createHash('sha256').update(JSON.stringify(dossier)).digest('hex');
   const stored=await rpc(url,key,'wutrib_demo_casefile_save_v1',{p_sha:digest,p_dossier:dossier});
   if(!UUID.test(String(stored?.id||'')))throw new Error('Invalid backend response');
   return respond(res,201,{id:stored.id,digest,approval:'NOT_APPROVED',taxConformity:'NOT_EVALUATED'});
  }
  const id=typeof req.query?.id==='string'?req.query.id:new URL(req.url,'http://localhost').searchParams.get('id');
  if(!id||!UUID.test(id))return respond(res,400,{error:'INVALID_CASEFILE_ID'});
  const result=await rpc(url,key,'wutrib_demo_casefile_get_v1',{p_id:id});
  if(!result?.id)return respond(res,404,{error:'CASEFILE_NOT_FOUND'});
  return respond(res,200,result);
 }catch(e){return e instanceof DemoContractError?respond(res,422,{error:'SYNTHETIC_CONTRACT_REJECTED'}):respond(res,502,{error:'PERSISTENCE_BACKEND_UNAVAILABLE'});}
}

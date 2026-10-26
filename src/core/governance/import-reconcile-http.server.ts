/** Authenticated, READ-ONLY HTTP reconciliation boundary.
 * Feature OFF by default. Requires actual Better Auth session, OPA PDP, and a
 * separately provisioned readonly PostgreSQL role. Never accepts a client
 * identity, authz verdict, "current state", or raw SQL.
 */
import {createHash} from 'node:crypto';
import {importProfiles,parseBulkImport,reviewBulkImport,type ImportProfile} from './bulk-import';
import type {ReadPolicyDecision,ReadPolicyRequest} from './import-opa-read.server';
import type {ReconciliationReport} from './bulk-import-reconciliation';

const MAX_BODY=7*1024*1024;
type AuthenticatedActor={id:string};
export type HttpDependencies={
 enabled:boolean;
 authenticate:(request:Request)=>Promise<AuthenticatedActor|null>;
 authorize:(request:ReadPolicyRequest)=>Promise<ReadPolicyDecision>;
 reconcile:(actorId:string,profile:ImportProfile,review:ReturnType<typeof reviewBulkImport>)=>Promise<ReconciliationReport>;
};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
function reply(status:number,body:Record<string,unknown>):Response{
 return new Response(JSON.stringify(body),{status,headers});
}
function forbid(status:number,code:string):Response{return reply(status,{ok:false,code});}
async function boundedJson(request:Request):Promise<unknown>{
 const declared=Number(request.headers.get('content-length'));
 if(Number.isFinite(declared)&&declared>MAX_BODY)throw Error('TOO_LARGE');
 const reader=request.body?.getReader();if(!reader)throw Error('EMPTY');
 const parts:Uint8Array[]=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>MAX_BODY)throw Error('TOO_LARGE');
   parts.push(value);
  }
 }finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;
 for(const part of parts){bytes.set(part,offset);offset+=part.length;}
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
function isSameOrigin(request:Request):boolean{
 const site=request.headers.get('sec-fetch-site');
 const origin=request.headers.get('origin');
 if(site&&site!=='same-origin')return false;
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(request.url).origin;}
 catch{return false;}
}
/** Injectable for tests; default dependencies are created only in the server
 * implementation below. Never call this from the browser.
 */
export async function executeImportReconcileHttp(
 request:Request,dependencies:HttpDependencies,
):Promise<Response>{
 if(!dependencies.enabled)return forbid(503,'IMPORT_RECONCILIATION_DISABLED');
 if(request.method!=='POST')return forbid(405,'METHOD_NOT_ALLOWED');
 if(!isSameOrigin(request))return forbid(403,'CROSS_ORIGIN_DENIED');
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
   return forbid(415,'JSON_REQUIRED');
 let actor:AuthenticatedActor|null;
 try{actor=await dependencies.authenticate(request);}
 catch{return forbid(401,'AUTHENTICATION_FAILED');}
 if(!actor?.id||actor.id==='dev-user')return forbid(401,'AUTHENTICATION_REQUIRED');
 let payload:unknown;
 try{payload=await boundedJson(request);}
 catch(e){return forbid(e instanceof Error&&e.message==='TOO_LARGE'?413:400,'INVALID_IMPORT_PAYLOAD');}
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return forbid(400,'INVALID_IMPORT_PAYLOAD');
 const body=payload as Record<string,unknown>;
 const profile=importProfiles.find(p=>p.id===body.profileId);
 if(!profile||typeof body.filename!=='string'||typeof body.content!=='string'||
    !body.mapping||typeof body.mapping!=='object'||Array.isArray(body.mapping))
   return forbid(400,'INVALID_IMPORT_PAYLOAD');
 const submittedMapping=body.mapping as Record<string,unknown>;
 if(Object.values(submittedMapping).some(v=>typeof v!=='string')||
    Object.keys(submittedMapping).some(k=>!profile.fields.some(f=>f.key===k)))
   return forbid(400,'INVALID_IMPORT_MAPPING');
 let reviewed:ReturnType<typeof reviewBulkImport>;
 try{
   const parsed=parseBulkImport(body.filename,body.content);
   reviewed=reviewBulkImport(parsed,profile,submittedMapping as Record<string,string>);
 }catch{return forbid(422,'IMPORT_PREVALIDATION_FAILED');}
 const sha256=createHash('sha256').update(body.content,'utf8').digest('hex');
 let grant:ReadPolicyDecision;
 try{
  grant=await dependencies.authorize({
   actorId:actor.id,profileId:profile.id,destination:profile.destination,
   sourceSha256:sha256,recordCount:reviewed.total,
  });
 }catch{return forbid(503,'OPA_UNAVAILABLE');}
 if(grant.allowed!==true)return forbid(403,'POLICY_DENIED');
 let report:ReconciliationReport;
 try{report=await dependencies.reconcile(actor.id,profile,reviewed);}
 catch{return forbid(503,'CATALOG_UNAVAILABLE');}
 return reply(200,{
   ok:true,operation:'READ_ONLY_RECONCILIATION',
   source_sha256:sha256,
   policy_decision_ref:grant.decisionId,
   bundle_sha256:grant.bundleSha256,
   result:report,
   submitted:false,canonical_writes:0,kernel_admitted:false,
 });
}
/** Real dependencies: both feature and auth must be deliberately enabled.
 * Route handler imports this function dynamically server-side.
 */
export async function handleImportReconcileRequest(request:Request):Promise<Response>{
 const enabled=process.env.CKO_IMPORT_READ_ENABLED==='true' &&
   process.env.VITE_AUTH_ENABLED==='true';
 if(!enabled)return forbid(503,'IMPORT_RECONCILIATION_DISABLED');
 const [{auth,authConfigured},{createOpaImportReadEvaluator},{importDbSettings,withImportReadOnlySnapshot}]=await Promise.all([
  import('@/lib/auth/server'),
  import('./import-opa-read.server'),
  import('./import-read-db.server'),
 ]);
 const settings=importDbSettings();
 if(!authConfigured||!settings)return forbid(503,'REQUIRED_SECURITY_CONFIGURATION_MISSING');
 let evaluator:ReturnType<typeof createOpaImportReadEvaluator>;
 try{
  evaluator=createOpaImportReadEvaluator({
   endpoint:process.env.CKO_OPA_IMPORT_READ_URL??'',
   bearerToken:process.env.CKO_OPA_IMPORT_READ_TOKEN??'',
   expectedBundleSha256:process.env.CKO_OPA_IMPORT_BUNDLE_SHA256??'',
  });
 }catch{return forbid(503,'OPA_NOT_CONFIGURED');}
 return executeImportReconcileHttp(request,{
  enabled:true,
  authenticate:async req=>{
    const session=await auth.api.getSession({headers:req.headers});
    return session?.user?.id ? {id:session.user.id} : null;
  },
  authorize:evaluator,
  reconcile:async(actorId,profile,review)=>withImportReadOnlySnapshot({
   actorId,authentication:'SERVER_SESSION_VERIFIED',
   permissions:['governance:imports:reconcile'], // Granted by verified OPA decision in this handler.
  },profile,review,settings),
 });
}

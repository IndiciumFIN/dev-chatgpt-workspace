/** Server-side OPA PDP adapter for import reconciliation.
 * Positive OPA decisions authorize ONLY a catalog read; never import writes.
 * OPA must be deployed with independently verified/signed bundles. Matching
 * a bundle SHA-256 field is a pin, NOT signature verification by this code.
 */
import { randomUUID } from 'node:crypto';

export type ReadPolicyRequest={
  actorId:string;profileId:string;destination:string;
  sourceSha256:string;recordCount:number;
};
export type ReadPolicyGrant={
  allowed:true;decisionId:string;bundleSha256:string;requestNonce:string;
};
export type ReadPolicyDecision={allowed:false;reason:string}|ReadPolicyGrant;
export type PolicyPost=(url:string,init:RequestInit)=>Promise<Response>;
const DENIED:ReadPolicyDecision={allowed:false,reason:'policy-denied-or-unverified'};
export type OpaReadPolicyConfig={
  endpoint:string;
  bearerToken:string;
  expectedBundleSha256:string;
  timeoutMs?:number;
};
function validSha(v:string):boolean{return /^[a-f0-9]{64}$/.test(v);}
function validateEndpoint(raw:string):string{
  let url:URL;
  try{url=new URL(raw);}catch{throw Error('OPA URL inválida.');}
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||
     url.pathname!=='/v1/data/cko/import_read')
    throw Error('OPA exige URL HTTPS fixa para a política de leitura.');
  return url.toString();
}
export function createOpaImportReadEvaluator(
  config:OpaReadPolicyConfig,
  post:PolicyPost=fetch,
):(request:ReadPolicyRequest)=>Promise<ReadPolicyDecision>{
  const endpoint=validateEndpoint(config.endpoint);
  if(!config.bearerToken?.trim()||!validSha(config.expectedBundleSha256))
    throw Error('OPA sem credencial e hash de bundle fixado.');
  return async (request)=>{
    if(!request.actorId?.trim()||!['sources','policies','validators'].includes(request.profileId)||
       !validSha(request.sourceSha256)||!Number.isInteger(request.recordCount)||
       request.recordCount<1||request.recordCount>10000)return DENIED;
    const expectedDestinations:Record<string,string>={
      sources:'cko_evidence.sources',policies:'cko_orch.policy_registry',
      validators:'cko_validation.validators',
    };
    if(expectedDestinations[request.profileId]!==request.destination)return DENIED;
    const requestNonce=randomUUID();
    const controller=new AbortController();
    const maxTimeout=Number.isFinite(config.timeoutMs) ? Math.min(5000,Math.max(500,config.timeoutMs!)) : 2500;
    const timeout=setTimeout(()=>controller.abort(),maxTimeout);
    try{
      const response=await post(endpoint,{
        method:'POST',redirect:'error',signal:controller.signal,
        headers:{
          'content-type':'application/json','accept':'application/json',
          'authorization':'Bearer '+config.bearerToken,
        },
        body:JSON.stringify({input:{
          actor_id:request.actorId,action:'imports.reconcile.read',
          profile_id:request.profileId,destination:request.destination,
          source_sha256:request.sourceSha256,record_count:request.recordCount,
          request_nonce:requestNonce,
        }}),
      });
      if(!response.ok)return DENIED;
      const payload=await response.json() as {
        decision_id?:unknown;
        result?:{allow?:unknown;bundle_sha256?:unknown;context?:Record<string,unknown>};
      };
      if(payload?.result?.allow!==true||
         typeof payload.decision_id!=='string'||!payload.decision_id.trim()||
         payload.result.bundle_sha256!==config.expectedBundleSha256||
         payload.result.context?.request_nonce!==requestNonce||
         payload.result.context?.actor_id!==request.actorId||
         payload.result.context?.profile_id!==request.profileId||
         payload.result.context?.destination!==request.destination||
         payload.result.context?.source_sha256!==request.sourceSha256||
         payload.result.context?.record_count!==request.recordCount)return DENIED;
      return {allowed:true,decisionId:payload.decision_id,bundleSha256:config.expectedBundleSha256,requestNonce};
    }catch{return DENIED;}
    finally{clearTimeout(timeout);}
  };
}

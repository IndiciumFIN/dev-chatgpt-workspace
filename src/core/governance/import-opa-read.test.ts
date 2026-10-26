import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {createOpaImportReadEvaluator} from './import-opa-read.server.ts';

const digest='a'.repeat(64), bundle='b'.repeat(64);
const request={actorId:'verified-user',profileId:'policies',destination:'cko_orch.policy_registry',sourceSha256:digest,recordCount:2};
const config={endpoint:'https://opa.example.test/v1/data/cko/import_read',bearerToken:'test-token-only',expectedBundleSha256:bundle};
type RequestContext={input:Record<string,unknown>};
function resultFrom(init:RequestInit, overrides:Record<string,unknown>={}, top:Record<string,unknown>={}):Response{
 const body=JSON.parse(String(init.body)) as RequestContext;
 const input=body.input;
 const context={
  request_nonce:input.request_nonce,
  actor_id:input.actor_id,profile_id:input.profile_id,destination:input.destination,
  source_sha256:input.source_sha256,record_count:input.record_count,
 };
 return new Response(JSON.stringify({decision_id:'OPA-READ-001',result:{allow:true,bundle_sha256:bundle,context,...overrides},...top}),{status:200});
}
describe('OPA import reconciliation boundary',()=>{
 it('rejects an insecure, dynamic or credential-bearing endpoint',()=>{
  for(const endpoint of ['http://opa.example.test/v1/data/cko/import_read','https://a.test/v1/data/other','https://u:p@a.test/v1/data/cko/import_read','https://a.test/v1/data/cko/import_read?deny=false']){
   assert.throws(()=>createOpaImportReadEvaluator({...config,endpoint},async()=>new Response()),/OPA/);
  }
 });
 it('fails closed if bundle pin or auth token is not configured',()=>{
  assert.throws(()=>createOpaImportReadEvaluator({...config,expectedBundleSha256:'not-a-hash'}),/OPA/);
  assert.throws(()=>createOpaImportReadEvaluator({...config,bearerToken:''}),/OPA/);
 });
 it('accepts only positive decision with exact pinned bundle, context, nonce and trace id',async()=>{
  let method='',body:RequestContext={input:{}};
  const evaluator=createOpaImportReadEvaluator(config,async(_url,init)=>{
   method=init.method??'';body=JSON.parse(String(init.body));return resultFrom(init);
  });
  const result=await evaluator(request);
  assert.equal(result.allowed,true);
  if(result.allowed){assert.equal(result.decisionId,'OPA-READ-001');assert.equal(result.bundleSha256,bundle);assert.equal(result.requestNonce,body.input.request_nonce);}
  assert.equal(method,'POST');
  assert.equal(body.input.action,'imports.reconcile.read');
  assert.match(String(body.input.request_nonce),/^[0-9a-f]{8}-[0-9a-f-]{27}$/);
 });
 it('denies missing decision ID, changed bundle pin, denied access and HTTP error',async()=>{
  for(const handler of [
   async (_url:string,init:RequestInit)=>resultFrom(init,{}, {decision_id:undefined}),
   async (_url:string,init:RequestInit)=>resultFrom(init,{bundle_sha256:'c'.repeat(64)}),
   async (_url:string,init:RequestInit)=>resultFrom(init,{allow:false}),
   async ()=>new Response('error',{status:503}),
  ]){
   const result=await createOpaImportReadEvaluator(config,handler)(request);
   assert.equal(result.allowed,false);
  }
 });
 it('denies replayed nonce and cross-actor/source/profile/count decision context',async()=>{
  const changes=[
   {request_nonce:'00000000-0000-4000-8000-000000000000'},
   {actor_id:'other-user'},
   {source_sha256:'c'.repeat(64)},
   {profile_id:'sources'},
   {destination:'cko_evidence.sources'},
   {record_count:3},
  ];
  for(const update of changes){
   const result=await createOpaImportReadEvaluator(config,async(_url,init)=>{
    const body=JSON.parse(String(init.body)) as RequestContext;
    const i=body.input;
    return resultFrom(init,{
      context:{request_nonce:i.request_nonce,actor_id:i.actor_id,profile_id:i.profile_id,destination:i.destination,source_sha256:i.source_sha256,record_count:i.record_count,...update},
    });
   })(request);
   assert.equal(result.allowed,false,JSON.stringify(update));
  }
  const missing=await createOpaImportReadEvaluator(config,async(_url,init)=>resultFrom(init,{context:undefined}))(request);
  assert.equal(missing.allowed,false);
 });
 it('denies unsupported destination, missing actor, invalid hash and excessive record counts before contacting OPA',async()=>{
  let calls=0;const evaluator=createOpaImportReadEvaluator(config,async(_url,init)=>{calls++;return resultFrom(init);});
  assert.equal((await evaluator({...request,destination:'public.users'})).allowed,false);
  assert.equal((await evaluator({...request,actorId:''})).allowed,false);
  assert.equal((await evaluator({...request,sourceSha256:'oops'})).allowed,false);
  assert.equal((await evaluator({...request,recordCount:20000})).allowed,false);
  assert.equal(calls,0);
 });
 it('denies offline OPA and malformed JSON',async()=>{
  assert.equal((await createOpaImportReadEvaluator(config,async()=>{throw Error('offline');})(request)).allowed,false);
  assert.equal((await createOpaImportReadEvaluator(config,async()=>new Response('{bad'))(request)).allowed,false);
 });
});

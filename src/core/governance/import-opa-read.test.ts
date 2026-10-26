import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {createOpaImportReadEvaluator} from './import-opa-read.server.ts';
const digest='a'.repeat(64), bundle='b'.repeat(64);
const request={actorId:'verified-user',profileId:'policies',destination:'cko_orch.policy_registry',sourceSha256:digest,recordCount:2};
const config={endpoint:'https://opa.example.test/v1/data/cko/import_read',bearerToken:'test-token-only',expectedBundleSha256:bundle};
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
 it('accepts only positive decision with exact pinned bundle digest and trace id',async()=>{
   let method='',body:Record<string,unknown>={};
   const evalPolicy=createOpaImportReadEvaluator(config,async(_url,init)=>{
     method=init.method??'';body=JSON.parse(String(init.body));
     return new Response(JSON.stringify({decision_id:'OPA-READ-001',result:{allow:true,bundle_sha256:bundle}}),{status:200});
   });
   const result=await evalPolicy(request);
   assert.deepEqual(result,{allowed:true,decisionId:'OPA-READ-001',bundleSha256:bundle});
   assert.equal(method,'POST');
   assert.equal((body.input as Record<string,unknown>).action,'imports.reconcile.read');
 });
 it('denies missing decision id, mismatched digest, explicit deny and HTTP error',async()=>{
   const replies=[
     new Response(JSON.stringify({result:{allow:true,bundle_sha256:bundle}})),
     new Response(JSON.stringify({decision_id:'ok',result:{allow:true,bundle_sha256:'c'.repeat(64)}})),
     new Response(JSON.stringify({decision_id:'ok',result:{allow:false,bundle_sha256:bundle}})),
     new Response('error',{status:503}),
   ];
   for(const response of replies){
     const result=await createOpaImportReadEvaluator(config,async()=>response)(request);
     assert.equal(result.allowed,false);
   }
 });
 it('denies unsupported destination, write-like action, empty actor and invalid hash',async()=>{
   let calls=0;
   const evaluator=createOpaImportReadEvaluator(config,async()=>{
     calls++;return new Response(JSON.stringify({decision_id:'ok',result:{allow:true,bundle_sha256:bundle}}));
   });
   assert.equal((await evaluator({...request,destination:'public.users'})).allowed,false);
   assert.equal((await evaluator({...request,actorId:''})).allowed,false);
   assert.equal((await evaluator({...request,sourceSha256:'oops'})).allowed,false);
   assert.equal((await evaluator({...request,recordCount:20000})).allowed,false);
   assert.equal(calls,0);
 });
 it('denies network exceptions and malformed JSON',async()=>{
   const offline=createOpaImportReadEvaluator(config,async()=>{throw Error('no network')});
   assert.equal((await offline(request)).allowed,false);
   const malformed=createOpaImportReadEvaluator(config,async()=>new Response('{not-json'));
   assert.equal((await malformed(request)).allowed,false);
 });
});

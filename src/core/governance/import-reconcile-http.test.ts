import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {executeImportReconcileHttp,type HttpDependencies} from './import-reconcile-http.server.ts';
import {reconcileImportReview} from './bulk-import-reconciliation.ts';
const bundle='b'.repeat(64);
const csv='policy_id;version;category;description;severity_on_violation;action_on_violation;rule_json;active\nPOL-1;1.0.0;governance;Description;D2;BLOCK;"{""allow"":false}";false\n';
const mapping={policy_id:'policy_id',version:'version',category:'category',description:'description',severity_on_violation:'severity_on_violation',action_on_violation:'action_on_violation',rule_json:'rule_json',active:'active'};
const body={profileId:'policies',filename:'policies.csv',content:csv,mapping};
const url='https://admin.example.test/api/admin/import/reconcile';
const req=(payload:unknown=body,opts:{origin?:string;contentType?:string;fetchSite?:string}={})=>new Request(url,{
 method:'POST',headers:{'origin':opts.origin??'https://admin.example.test','content-type':opts.contentType??'application/json','sec-fetch-site':opts.fetchSite??'same-origin'},
 body:JSON.stringify(payload),
});
let calls:{auth:number;opa:number;db:number};
function deps():HttpDependencies{
 calls={auth:0,opa:0,db:0};
 return {
  enabled:true,
  authenticate:async()=>{calls.auth++;return{id:'user-1'}},
  authorize:async()=>{calls.opa++;return{allowed:true,decisionId:'OPA-REF',bundleSha256:bundle}},
  reconcile:async(_actor,profile,review)=>{
   calls.db++;
   return reconcileImportReview(review,profile,async ids=>({
    ...ids,rows:[],snapshotRef:'tested-transaction',capturedAt:'2026-10-26T12:00:00Z',
   }));
  },
 };
}
describe('POST import reconcile — no canonical mutations',()=>{
 it('fails closed before authentication if feature switch disabled',async()=>{
   const d=deps();d.enabled=false;
   const res=await executeImportReconcileHttp(req(),d);
   assert.equal(res.status,503);
   assert.deepEqual(calls,{auth:0,opa:0,db:0});
 });
 it('rejects cross-origin and absent Origin before session lookup',async()=>{
   const d=deps();
   assert.equal((await executeImportReconcileHttp(req(body,{origin:'https://evil.test'}),d)).status,403);
   assert.equal((await executeImportReconcileHttp(req(body,{fetchSite:'same-site'}),d)).status,403);
   assert.deepEqual(calls,{auth:0,opa:0,db:0});
 });
 it('rejects unauthenticated and dev sessions',async()=>{
   const d=deps();d.authenticate=async()=>null;
   assert.equal((await executeImportReconcileHttp(req(),d)).status,401);
   d.authenticate=async()=>({id:'dev-user'});
   assert.equal((await executeImportReconcileHttp(req(),d)).status,401);
   assert.equal(calls.db,0);
 });
 it('rejects missing/malformed content and unsafe profiles',async()=>{
   const d=deps();
   assert.equal((await executeImportReconcileHttp(req({...body,profileId:'public.users'}),d)).status,400);
   assert.equal((await executeImportReconcileHttp(req({...body,filename:'bad.xlsx'}),d)).status,422);
   assert.equal((await executeImportReconcileHttp(req({...body,mapping:{...mapping,id:'policy_id'}}),d)).status,400);
   assert.equal(calls.opa,0);
 });
 it('never queries the catalog when OPA denies, is unavailable or unsigned',async()=>{
   const d=deps();
   d.authorize=async()=>({allowed:false,reason:'no role'});
   assert.equal((await executeImportReconcileHttp(req(),d)).status,403);
   d.authorize=async()=>{throw Error('offline')};
   assert.equal((await executeImportReconcileHttp(req(),d)).status,503);
   assert.equal(calls.db,0);
 });
 it('returns read-only candidate report after OPA read authorization',async()=>{
   const d=deps();
   const res=await executeImportReconcileHttp(req(),d);
   assert.equal(res.status,200);
   const json=await res.json();
   assert.equal(json.ok,true);assert.equal(json.operation,'READ_ONLY_RECONCILIATION');
   assert.equal(json.result.rows[0].classification,'NEW_CANDIDATE');
   assert.equal(json.canonical_writes,0);assert.equal(json.kernel_admitted,false);
   assert.equal(json.result.databaseMutation,false);
   assert.equal(res.headers.get('cache-control'),'no-store');
   assert.deepEqual(calls,{auth:1,opa:1,db:1});
 });
 it('fails closed if snapshot connection fails after OPA authorization',async()=>{
   const d=deps();d.reconcile=async()=>{throw Error('db offline')};
   const res=await executeImportReconcileHttp(req(),d);
   assert.equal(res.status,503);
   assert.equal((await res.json()).code,'CATALOG_UNAVAILABLE');
 });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/demo-casefiles.js';
import {normalizeDemoSubmission,DemoContractError,ALLOWED_FINDINGS,DEMO_FIXTURE_CODE} from '../src/demo-persistence-contract.js';

const USER='11111111-1111-4111-8111-111111111111';
const CASE='12345678-1234-4234-8234-123456789abc';
const SHA='b'.repeat(64);
const ORG='WUTRIB_DEMO';
const JWT=['eyJhbGciOiJIUzI1NiJ9','eyJzdWIiOiIxMTEifQ','dGVzdFNpZ25hdHVyZQ'].join('.');
const authUser={id:USER,is_anonymous:false,email_confirmed_at:'2026-11-08T12:00:00Z'};
const config={
 WUTRIB_DEMO_AUTH_ENABLED:'true',
 WUTRIB_SUPABASE_URL:'https://hcqukuotfwflmebjygam.supabase.co',
 WUTRIB_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fake_test_only',
 WUTRIB_SUPABASE_SERVICE_ROLE_KEY:'fake-service-key-test-only'
};
const envKeys=Object.keys(config);
const review=(status='INVESTIGATING',note='Revisar documento fictício.')=>({
 findingId:ALLOWED_FINDINGS[0],status,note
});
const submission=(reviews=[review()])=>({fixtureCode:DEMO_FIXTURE_CODE,reviews});
function response(){
 return {statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;},
  status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};
}
const request=(method='POST',body=submission(),org=ORG,jwt=JWT)=>({
 method,headers:{
  authorization:'Bearer '+jwt,
  'x-wutrib-org':org,
  'content-type':'application/json'
 },
 body,query:{id:CASE}
});
async function withEnv(values,fn){
 const before=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
 const fetchBefore=globalThis.fetch;
 try{
  for(const k of envKeys){
   if(k in values)process.env[k]=values[k];
   else delete process.env[k];
  }
  await fn();
 }finally{
  for(const k of envKeys){
   if(before[k]===undefined)delete process.env[k];
   else process.env[k]=before[k];
  }
  globalThis.fetch=fetchBefore;
 }
}
function mockedBackend({identity=authUser,authStatus=200,allowed=true,quota=true,save=true,getResult=null}={}){
 const calls=[];
 globalThis.fetch=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/auth/v1/user')){
   return {ok:authStatus===200,status:authStatus,json:async()=>identity};
  }
  const suffix=url.split('/').at(-1);
  const outputs={
   wutrib_demo_org_authorize_v1:{allowed},
   wutrib_demo_request_gate_v1:{allowed:quota,remaining:28},
   wutrib_demo_org_casefile_save_v1:save?{id:CASE,digest:SHA}:null,
   wutrib_demo_org_casefile_get_v1:getResult
  };
  if(!(suffix in outputs))throw new Error('Unexpected backend endpoint '+url);
  return {ok:true,status:200,json:async()=>outputs[suffix]};
 };
 return calls;
}

test('synthetic invariants cannot be overridden',()=>{
 const d=normalizeDemoSubmission(submission());
 assert.equal(d.approval,'NOT_APPROVED');
 assert.equal(d.taxConformity,'NOT_EVALUATED');
 assert.equal(d.reviews[0].causeStatus,'HYPOTHESIS_NOT_CONFIRMED');
});
test('rejects unknown fixtures, extra fields and claimed approval',()=>{
 for(const x of [{...submission(),approved:true},
  {...submission(),fixtureCode:'REAL'},{...submission(),rawXml:'<NFe/>'}])
  assert.throws(()=>normalizeDemoSubmission(x),DemoContractError);
});
test('rejects invalid findings, duplicate, illegal state and oversized note',()=>{
 for(const a of [[{...review(),findingId:'REAL'}],
  [review(),review()],[review('APPROVED')],
  [review('NEEDS_EVIDENCE',' ')],[review('PENDING','x'.repeat(1201))]])
  assert.throws(()=>normalizeDemoSubmission(submission(a)),DemoContractError);
});
test('canonical order stabilizes backend digest input',()=>{
 const a=normalizeDemoSubmission(submission([
  review(),{findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''}]));
 const b=normalizeDemoSubmission(submission([
  {findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''},review()]));
 assert.equal(JSON.stringify(a),JSON.stringify(b));
});

test('API disabled without explicit feature flag even when backend variables exist',async()=>{
 await withEnv({...config,WUTRIB_DEMO_AUTH_ENABLED:'false'},async()=>{
  globalThis.fetch=async()=>{throw new Error('disabled endpoint called fetch');};
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,503);
  assert.equal(r.body.error,'DEMO_PERSISTENCE_DISABLED');
 });
});
test('API disabled without Supabase publishable key and private backend key',async()=>{
 for(const key of ['WUTRIB_SUPABASE_PUBLISHABLE_KEY','WUTRIB_SUPABASE_SERVICE_ROLE_KEY']){
  await withEnv(Object.fromEntries(Object.entries(config).filter(([k])=>k!==key)),async()=>{
   const r=response();await handler(request(),r);assert.equal(r.statusCode,503);
  });
 }
});
test('legacy shared token cannot authenticate as Supabase JWT',async()=>{
 await withEnv(config,async()=>{
  let count=0;globalThis.fetch=async()=>{count++;throw Error('must not fetch');};
  const r=response();await handler(request('POST',submission(),ORG,'A'.repeat(64)),r);
  assert.equal(r.statusCode,401);assert.equal(count,0);
 });
});
test('missing Authorization returns 401 without any network calls',async()=>{
 await withEnv(config,async()=>{
  let count=0;globalThis.fetch=async()=>{count++;throw Error('must not fetch');};
  const req=request();delete req.headers.authorization;
  const r=response();await handler(req,r);assert.equal(r.statusCode,401);assert.equal(count,0);
 });
});
test('invalid tenant header rejected before Auth',async()=>{
 await withEnv(config,async()=>{
  let count=0;globalThis.fetch=async()=>{count++;throw Error('must not fetch');};
  for(const org of ['other','../../ADMIN','A','',undefined]){
   const req=request('POST',submission(),org);
   if(org===undefined)delete req.headers['x-wutrib-org'];
   const r=response();await handler(req,r);
   assert.equal(r.statusCode,400);
  }
  assert.equal(count,0);
 });
});
test('Supabase Auth JWT verified remotely; no service-role key sent to Auth',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend();
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,201);
  assert.equal(calls[0].url,config.WUTRIB_SUPABASE_URL+'/auth/v1/user');
  assert.equal(calls[0].options.headers.Authorization,'Bearer '+JWT);
  assert.equal(calls[0].options.headers.apikey,config.WUTRIB_SUPABASE_PUBLISHABLE_KEY);
  assert.notEqual(calls[0].options.headers.apikey,config.WUTRIB_SUPABASE_SERVICE_ROLE_KEY);
 });
});
test('rejected identity, anonymous Auth session or unconfirmed account returns 401',async()=>{
 for(const args of [{authStatus:401},{identity:{...authUser,is_anonymous:true}},
  {identity:{...authUser,email_confirmed_at:null,phone_confirmed_at:null}}]){
  await withEnv(config,async()=>{
   const calls=mockedBackend(args);
   const r=response();await handler(request(),r);
   assert.equal(r.statusCode,401);assert.equal(calls.length,1);
  });
 }
});
test('tenant grant absent returns 403 without store RPC',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend({allowed:false});
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,403);assert.equal(r.body.error,'ORG_ACCESS_DENIED');
  assert.equal(calls.length,2);
 });
});
test('read-only membership cannot post when backend declines SAVE',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend({allowed:false});
  const r=response();await handler(request('POST'),r);
  assert.equal(r.statusCode,403);
  assert.ok(!calls.some(x=>x.url.endsWith('/wutrib_demo_org_casefile_save_v1')));
 });
});
test('POST scoped casefile includes verified actor, tenant and server-derived digest',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend();
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,201);assert.equal(r.body.digest,SHA);
  assert.equal(r.body.organizationCode,ORG);
  assert.deepEqual(calls.map(x=>x.url.split('/').at(-1)),
   ['user','wutrib_demo_org_authorize_v1','wutrib_demo_request_gate_v1','wutrib_demo_org_casefile_save_v1']);
  const args=JSON.parse(calls[3].options.body);
  assert.equal(args.p_actor,USER);assert.equal(args.p_org,ORG);
  assert.equal(args.p_dossier.approval,'NOT_APPROVED');
  assert.ok(!Object.hasOwn(args,'p_sha'));
  assert.ok(!JSON.stringify(r.body).includes(config.WUTRIB_SUPABASE_SERVICE_ROLE_KEY));
 });
});
test('forged identity and organization in payload are rejected, not trusted',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend();
  const r=response();
  await handler(request('POST',{...submission(),actorId:'another',org:'OTHER'}),r);
  assert.equal(r.statusCode,422);
  assert.equal(calls.length,2);
 });
});
test('per-user quota returns 429 and never writes casefile',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend({quota:false});
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,429);assert.equal(r.headers['Retry-After'],'60');
  assert.equal(calls.length,3);
 });
});
test('GET reads only requested tenant scoped by verified actor',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend({getResult:{id:CASE,casefile:{approval:'NOT_APPROVED'},createdAt:'2026-11-08'}});
  const r=response();await handler(request('GET'),r);
  assert.equal(r.statusCode,200);assert.equal(r.body.organizationCode,ORG);
  const args=JSON.parse(calls[3].options.body);
  assert.deepEqual(args,{p_actor:USER,p_org:ORG,p_id:CASE});
 });
});
test('cross-tenant GET rejected by membership before dossier query',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend({allowed:false});
  const r=response();await handler(request('GET',undefined,'ANOTHER_ORG'),r);
  assert.equal(r.statusCode,403);
  assert.ok(!calls.some(x=>x.url.endsWith('/wutrib_demo_org_casefile_get_v1')));
 });
});
test('GET unknown casefile returns 404 without leaking tenant data',async()=>{
 await withEnv(config,async()=>{
  mockBackendPlaceholder();
  function mockBackendPlaceholder(){mockedBackend({getResult:null});}
  const r=response();await handler(request('GET'),r);
  assert.equal(r.statusCode,404);
 });
});
test('invalid GET UUID returns 400 and never calls read RPC',async()=>{
 await withEnv(config,async()=>{
  const calls=mockedBackend();
  const req=request('GET');req.query.id='bad';
  const r=response();await handler(req,r);
  assert.equal(r.statusCode,400);assert.equal(calls.length,2);
 });
});
test('backend 5xx fails closed instead of returning successful operation',async()=>{
 await withEnv(config,async()=>{
  globalThis.fetch=async(url)=>url.endsWith('/auth/v1/user')
   ?{ok:true,status:200,json:async()=>authUser}
   :{ok:false,status:503};
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,502);
 });
});
test('Auth service 503 fails closed rather than treating JWT as verified',async()=>{
 await withEnv(config,async()=>{
  globalThis.fetch=async()=>({ok:false,status:503});
  const r=response();await handler(request(),r);
  assert.equal(r.statusCode,502);
 });
});
test('unknown authorization and rate response fail closed',async()=>{
 await withEnv(config,async()=>{
  for(const blocked of ['grant','quota']){
   let calls=0;
   globalThis.fetch=async url=>{
    calls++;
    if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>authUser};
    if(url.endsWith('/wutrib_demo_org_authorize_v1'))
     return {ok:true,json:async()=>blocked==='grant'?{}:{allowed:true}};
    if(url.endsWith('/wutrib_demo_request_gate_v1'))
     return {ok:true,json:async()=>({})};
    throw Error('Unexpected store call');
   };
   const r=response();await handler(request(),r);
   assert.equal(r.statusCode,502);
   assert.equal(calls,blocked==='grant'?2:3);
  }
 });
});

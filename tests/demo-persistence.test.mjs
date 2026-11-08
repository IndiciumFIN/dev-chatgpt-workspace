import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/demo-casefiles.js';
import {normalizeDemoSubmission,DemoContractError,ALLOWED_FINDINGS,DEMO_FIXTURE_CODE} from '../src/demo-persistence-contract.js';
const review=(status='INVESTIGATING',note='Revisar documento fictício.')=>({findingId:ALLOWED_FINDINGS[0],status,note});
const submission=(reviews=[review()])=>({fixtureCode:DEMO_FIXTURE_CODE,reviews});
const response=()=>({statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}});
const envKeys=['WUTRIB_OPERATOR_TOKEN','WUTRIB_SUPABASE_URL','WUTRIB_SUPABASE_SERVICE_ROLE_KEY'];
async function withEnv(values,fn){
 const before=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));const fetchBefore=globalThis.fetch;
 try{for(const k of envKeys){if(k in values)process.env[k]=values[k];else delete process.env[k];}await fn();}
 finally{for(const k of envKeys){if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];}globalThis.fetch=fetchBefore;}
}
const config={WUTRIB_OPERATOR_TOKEN:'A'.repeat(64),WUTRIB_SUPABASE_URL:'https://hcqukuotfwflmebjygam.supabase.co',WUTRIB_SUPABASE_SERVICE_ROLE_KEY:'mocked-testing-nonsecret'};
const request=(body,authorization='Bearer '+'A'.repeat(64))=>({method:'POST',headers:{authorization,'content-type':'application/json'},body});
const testId='12345678-1234-4234-8234-123456789abc',testDigest='a'.repeat(64);
test('synthetic invariants cannot be overridden',()=>{
 const d=normalizeDemoSubmission(submission());
 assert.equal(d.approval,'NOT_APPROVED');
 assert.equal(d.taxConformity,'NOT_EVALUATED');
 assert.equal(d.reviews[0].causeStatus,'HYPOTHESIS_NOT_CONFIRMED');
});
test('rejects unknown fixtures, extra fields and claimed approval',()=>{
 for(const x of [{...submission(),approved:true},{...submission(),fixtureCode:'REAL'},{...submission(),rawXml:'<NFe/>'}])
  assert.throws(()=>normalizeDemoSubmission(x),DemoContractError);
});
test('rejects invalid findings, duplicate, illegal state and oversized note',()=>{
 for(const a of [[{...review(),findingId:'REAL'}],[review(),review()],[review('APPROVED')],
  [review('NEEDS_EVIDENCE',' ')],[review('PENDING','x'.repeat(1201))]])
  assert.throws(()=>normalizeDemoSubmission(submission(a)),DemoContractError);
});
test('canonical order stabilizes backend idempotency input',()=>{
 const a=normalizeDemoSubmission(submission([review(),{findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''}]));
 const b=normalizeDemoSubmission(submission([{findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''},review()]));
 assert.equal(JSON.stringify(a),JSON.stringify(b));
});
test('disabled without server credentials',async()=>{
 await withEnv({},async()=>{const r=response();await handler(request(submission()),r);assert.equal(r.statusCode,503);});
});
test('anonymous and invalid credentials rejected before DB access',async()=>{
 await withEnv(config,async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('should never fetch');};
  for(const h of [undefined,'Bearer wrong','Bearer '+'B'.repeat(64)]){
   const req=request(submission(),h);if(h===undefined)delete req.headers.authorization;
   const r=response();await handler(req,r);assert.equal(r.statusCode,401);
  }
  assert.equal(calls,0);
 });
});
test('declines arbitrary corporate payload without contacting backend',async()=>{
 await withEnv(config,async()=>{
  globalThis.fetch=async()=>{throw new Error('must not fetch');};
  const r=response();await handler(request({...submission(),rawXml:'<NFe/>'}),r);assert.equal(r.statusCode,422);
 });
});
test('POST rate-limits via service-only RPC and uses server-computed digest',async()=>{
 await withEnv(config,async()=>{
  const calls=[];
  globalThis.fetch=async(url,opts)=>{
   calls.push({url,opts});
   const body=url.endsWith('/wutrib_demo_request_gate_v1')?{allowed:true,remaining:29}:{id:testId,digest:testDigest};
   return {ok:true,json:async()=>body};
  };
  const r=response();await handler(request(submission()),r);
  assert.equal(r.statusCode,201);assert.equal(r.body.digest,testDigest);
  assert.equal(calls.length,2);
  assert.match(calls[0].url,/rpc\/wutrib_demo_request_gate_v1$/);
  assert.match(calls[1].url,/rpc\/wutrib_demo_casefile_save_v2$/);
  assert.equal(JSON.parse(calls[1].opts.body).p_dossier.approval,'NOT_APPROVED');
  assert.equal(Object.hasOwn(JSON.parse(calls[1].opts.body),'p_sha'),false);
  assert.ok(!JSON.stringify(r.body).includes(config.WUTRIB_SUPABASE_SERVICE_ROLE_KEY));
 });
});
test('global quota rejects an authenticated operator with HTTP 429 and no save',async()=>{
 await withEnv(config,async()=>{
  let called=0;
  globalThis.fetch=async()=>{
   called++;return {ok:true,json:async()=>({allowed:false,retryAfterSeconds:60})};
  };
  const r=response();await handler(request(submission()),r);
  assert.equal(r.statusCode,429);assert.equal(r.headers['Retry-After'],'60');
  assert.equal(called,1);
 });
});
test('GET rejects invalid UUID before rate gate, then reads after authorization',async()=>{
 await withEnv(config,async()=>{
  const h={authorization:'Bearer '+'A'.repeat(64)};
  const invalid=response();
  await handler({method:'GET',headers:h,query:{id:'invalid'}},invalid);
  assert.equal(invalid.statusCode,400);
  let called=0;globalThis.fetch=async(url)=>{
   called++;return {ok:true,json:async()=>url.endsWith('/wutrib_demo_request_gate_v1')?{allowed:true}:null};
  };
  const missing=response();
  await handler({method:'GET',headers:h,query:{id:testId}},missing);
  assert.equal(missing.statusCode,404);assert.equal(called,2);
 });
});
test('backend unavailable always fails closed, not success',async()=>{
 await withEnv(config,async()=>{
  globalThis.fetch=async()=>({ok:false,status:503});
  const r=response();await handler(request(submission()),r);
  assert.equal(r.statusCode,502);assert.equal(r.body.error,'PERSISTENCE_BACKEND_UNAVAILABLE');
 });
});
test('unknown gate response cannot bypass limiter',async()=>{
 await withEnv(config,async()=>{
  let called=0;
  globalThis.fetch=async()=>{called++;return {ok:true,json:async()=>({})};};
  const r=response();await handler(request(submission()),r);
  assert.equal(r.statusCode,502);assert.equal(called,1);
 });
});

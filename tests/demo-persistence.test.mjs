import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/demo-casefiles.js';
import {normalizeDemoSubmission,DemoContractError,ALLOWED_FINDINGS,DEMO_FIXTURE_CODE} from '../src/demo-persistence-contract.js';
const review=(status='INVESTIGATING',note='Revisar documento fictício.')=>({findingId:ALLOWED_FINDINGS[0],status,note});
const submission=(reviews=[review()])=>({fixtureCode:DEMO_FIXTURE_CODE,reviews});
const response=()=>({statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}});
const envKeys=['WUTRIB_OPERATOR_TOKEN','WUTRIB_SUPABASE_URL','WUTRIB_SUPABASE_SERVICE_ROLE_KEY'];
async function withEnv(values,fn){const before=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));const fetchBefore=globalThis.fetch;
 try{for(const k of envKeys){if(k in values)process.env[k]=values[k];else delete process.env[k];}await fn();}
 finally{for(const k of envKeys){if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];}globalThis.fetch=fetchBefore;}}
const config={WUTRIB_OPERATOR_TOKEN:'A'.repeat(64),WUTRIB_SUPABASE_URL:'https://hcqukuotfwflmebjygam.supabase.co',WUTRIB_SUPABASE_SERVICE_ROLE_KEY:'dummy-for-mocked-test'};
const request=(body,authorization='Bearer '+'A'.repeat(64))=>({method:'POST',headers:{authorization,'content-type':'application/json'},body});
test('synthetic invariants cannot be overridden',()=>{const d=normalizeDemoSubmission(submission());assert.equal(d.approval,'NOT_APPROVED');assert.equal(d.taxConformity,'NOT_EVALUATED');assert.equal(d.reviews[0].causeStatus,'HYPOTHESIS_NOT_CONFIRMED');});
test('rejects unknown fixtures, extra fields and claimed approval',()=>{for(const x of [{...submission(),approved:true},{...submission(),fixtureCode:'REAL'},{...submission(),rawXml:'<NFe/>'}])assert.throws(()=>normalizeDemoSubmission(x),DemoContractError);});
test('rejects invalid findings, duplicate, illegal state and oversized note',()=>{for(const a of [[{...review(),findingId:'REAL'}],[review(),review()],[review('APPROVED')],[review('NEEDS_EVIDENCE',' ')],[review('PENDING','x'.repeat(1201))]])assert.throws(()=>normalizeDemoSubmission(submission(a)),DemoContractError);});
test('canonical order stabilizes idempotency digest input',()=>{const a=normalizeDemoSubmission(submission([review(),{findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''}]));const b=normalizeDemoSubmission(submission([{findingId:ALLOWED_FINDINGS[1],status:'PENDING',note:''},review()]));assert.equal(JSON.stringify(a),JSON.stringify(b));});
test('disabled without server credentials',async()=>{await withEnv({},async()=>{const r=response();await handler(request(submission()),r);assert.equal(r.statusCode,503);});});
test('anonymous and invalid credentials rejected',async()=>{await withEnv(config,async()=>{for(const h of [undefined,'Bearer wrong','Bearer '+'B'.repeat(64)]){const req=request(submission(),h);if(h===undefined)delete req.headers.authorization;const r=response();await handler(req,r);assert.equal(r.statusCode,401);}});});
test('declines arbitrary corporate payload',async()=>{await withEnv(config,async()=>{const r=response();await handler(request({...submission(),rawXml:'<NFe/>'}),r);assert.equal(r.statusCode,422);});});
test('POST only uses protected RPC with no secret in response',async()=>{await withEnv(config,async()=>{let sent;globalThis.fetch=async(url,opt)=>{sent={url,opt};return {ok:true,json:async()=>({id:'12345678-1234-4234-8234-123456789abc'})};};const r=response();await handler(request(submission()),r);assert.equal(r.statusCode,201);assert.match(sent.url,/rpc\/wutrib_demo_casefile_save_v1$/);assert.equal(JSON.parse(sent.opt.body).p_dossier.approval,'NOT_APPROVED');assert.ok(!JSON.stringify(r.body).includes(config.WUTRIB_SUPABASE_SERVICE_ROLE_KEY));});});
test('GET rejects invalid ID and responds 404 for missing casefile',async()=>{await withEnv(config,async()=>{const h={authorization:'Bearer '+'A'.repeat(64)};const invalid=response();await handler({method:'GET',headers:h,query:{id:'invalid'}},invalid);assert.equal(invalid.statusCode,400);globalThis.fetch=async()=>({ok:true,json:async()=>null});const r=response();await handler({method:'GET',headers:h,query:{id:'12345678-1234-4234-8234-123456789abc'}},r);assert.equal(r.statusCode,404);});});

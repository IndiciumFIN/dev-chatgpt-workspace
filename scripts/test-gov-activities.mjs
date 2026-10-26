import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePmo,buildActivityView,parseCli,run,safeDeepSeekRequest} from './gov-activities.mjs';

function fixture(){return {readOnly:true,canonicalSource:'registers/pmo/queue.v1.json',revision:2,
 items:[
 {id:'WO-PMO-001',order:0,status:'DONE',priority:'P0',dependencies:[],evidence:['https://github.com/example/1'],title:'A completed task',criteria:'Validated',next:'no',owner:'QA'},
 {id:'WO-ADM-001',order:1,status:'IN_PROGRESS',priority:'P0',dependencies:['WO-PMO-001'],evidence:[],title:'Admin review work',criteria:'Owner approved local preview',next:'Audit',owner:'QA'},
 {id:'WO-DS-001',order:2,status:'QUEUED',priority:'P1',dependencies:['WO-ADM-001'],evidence:[],title:'DS check',criteria:'Visual review',next:'Audit',owner:'QA'},
 {id:'WO-HOM-001',order:3,status:'HOLD_HUMAN',priority:'P0',dependencies:['WO-DS-001'],evidence:[],title:'Release',criteria:'Manual approval',next:'Hold',owner:'QA'}
 ],events:[{seq:1,workId:'WO-PMO-001',to:'DONE'}, {seq:2,workId:'WO-ADM-001',to:'IN_PROGRESS'}, {seq:3,workId:'WO-DS-001',to:'QUEUED'}, {seq:4,workId:'WO-HOM-001',to:'HOLD_HUMAN'}]};}
const io=(q)=>({read:()=>JSON.stringify(q),env:{},transport:()=>{throw Error('No network allowed')}});
test('source registry validates and derives truthful dispositions',()=>{const q=fixture();assert.deepEqual(validatePmo(q),[]);const p=buildActivityView(q,'sha');assert.deepEqual(p.activities.map(x=>x.disposition),['CLOSED','ACTIVE_WITH_SCOPE_LIMITS','WAITING_DEPENDENCIES','HOLD_HUMAN']);assert.equal(p.remoteWriteAuthorized,false)});
test('no approval borrowed from a completed predecessor',()=>{const p=buildActivityView(fixture(),'sha');assert.equal(p.activities[2].unmetDependencies[0],'WO-ADM-001');assert.equal(p.activities[3].deniedActions.includes('publish'),true)});
test('event sequence is append-only and checked',()=>{const q=fixture();q.events[1].seq=9;assert.match(validatePmo(q).join(' '),/Invalid PMO event/)});
test('cycles and unknown dependencies fail closed',()=>{const q=fixture();q.items[0].dependencies=['WO-HOM-001'];assert.match(validatePmo(q).join(' '),/Dependency cycle/);q.items[0].dependencies=['WO-NOT-FOUND'];assert.match(validatePmo(q).join(' '),/Invalid dependency/)});
test('DONE with no evidence fails',()=>{const q=fixture();q.items[0].evidence=[];assert.match(validatePmo(q).join(' '),/DONE without evidence/)});
test('plan never authorizes execution',async()=>{let p=await run(['plan','--wo=WO-ADM-001'],io(fixture()));assert.equal(p.executionAllowed,false);assert.equal(p.publishAllowed,false);assert.equal(p.candidateTasks.length,3)});
test('CLI unknown options and IDs rejected',async()=>{assert.throws(()=>parseCli(['report','--out=/tmp/evil']),/Unknown option/);await assert.rejects(run(['plan','--wo=WO-WRONG'],io(fixture())),/Unknown WO/)});
test('DeepSeek by default transfers nothing',async()=>{let p=await run(['assist','--wo=WO-ADM-001'],io(fixture()));assert.equal(p.apiCall,false);assert.deepEqual(Object.keys(p.request),['work_order_id','priority','disposition','pending_dependency_count','task']);assert.equal(JSON.stringify(p.request).includes('Owner approved'),false)});
test('DeepSeek send without explicit opt-in or API key fails',async()=>{await assert.rejects(run(['assist','--wo=WO-ADM-001','--send'],io(fixture())),/confirm/);await assert.rejects(run(['assist','--wo=WO-ADM-001','--send','--confirm-public-metadata'],io(fixture())),/DEEPSEEK_API_KEY/)});
test('DeepSeek response is untrusted candidate only',async()=>{const f=io(fixture());f.env.DEEPSEEK_API_KEY='test-key';f.transport=async(url,options)=>{assert.equal(url,'https://api.deepseek.com/chat/completions');const sent=JSON.parse(options.body);assert(!JSON.stringify(sent).includes('Owner approved'));return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({microtasks:[{description:'Check evidence',verification:'Read source index'}]})}}]})}};const x=await run(['assist','--wo=WO-ADM-001','--send','--confirm-public-metadata'],f);assert.equal(x.status,'UNTRUSTED_CANDIDATE_ONLY');assert.equal(x.approved,false);assert.equal(x.remoteWrites,0)});
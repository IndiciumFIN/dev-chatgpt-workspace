import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,symlinkSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {ROOT,PATHS,sha256,guardedPath,expectedItems,validateBoard,reconcile,appendEvent,transition,acknowledgeDrift,summarize,reportMd,loadInputs} from '../agent/pmo-controller.mjs';

const read=rel=>JSON.parse(readFileSync(resolve(ROOT,rel),'utf8'));
const board=read(PATHS.board),journal=read(PATHS.events),inputs=loadInputs();
const hashes=inputs.fingerprints;
const cloned=x=>JSON.parse(JSON.stringify(x));

test('PMO seed tracks every PR49 gap, PR48 test and gate once',()=>{
  assert.equal(board.activities.length,63+board.activities.filter(x=>x.type==='DEV').length);
  assert.equal(expectedItems(inputs.gaps,inputs.tests,inputs.development).length,72);
  assert.equal(new Set(board.activities.map(x=>x.id)).size,board.activities.length);
  assert.deepEqual({g:board.activities.filter(x=>x.type==='GAP').length,t:board.activities.filter(x=>x.type==='TEST').length,v:board.activities.filter(x=>x.type==='GATE').length},{g:26,t:30,v:7});
});
test('Initial state cannot claim approval, executed tests or release',()=>{
  assert.equal(validateBoard(board,journal).ok,true);
  assert.equal(board.policy.agentCanApprove,false);
  assert.equal(board.policy.agentCanDeploy,false);
  assert.equal(board.policy.testExecutionAuthorized,false);
  assert.equal(board.activities.filter(x=>x.type==='TEST').every(x=>x.status==='NOT_RUN'),true);
  assert.equal(board.activities.filter(x=>x.type==='GATE').every(x=>x.status==='HOLD_HUMAN'),true);
});
test('Sync verifies real fingerprints without closing any activity, even on a reconciled board',()=>{
  const r=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development);
  const unbaselined=board.activities.filter(x=>x.sourceFingerprint===null).length;
  assert.equal(r.changes.filter(x=>x.action==='SOURCE_BASELINED').length,unbaselined);
  assert.equal(r.board.activities.filter(x=>x.sourceFingerprint===null).length,0);
  assert.equal(r.board.activities.filter(x=>x.type==='GAP'&&x.status==='OPEN').length,26);
  assert.equal(r.board.activities.filter(x=>x.type==='DEV').length,9);
  assert.equal(r.board.activities.filter(x=>x.status==='NOT_RUN').length,30);
});
test('Reconciliation is idempotent after first sync',()=>{
  const one=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development);
  const two=reconcile(one.board,inputs.gaps,inputs.tests,hashes,inputs.development);
  assert.equal(two.changes.length,0);
  assert.deepEqual(two.board,one.board);
});
test('Source change creates drift and preserves activity status and case identity',()=>{
  const original=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development).board;
  original.activities.find(x=>x.id==='WUTRIB-PMO-GAP-001').status='IN_PROGRESS';
  const changed=cloned(inputs.gaps);
  changed.items.find(x=>x.id==='GAP-001').finding='Revisto com fonte oficial — pendente validação';
  const newHashes={...hashes,[PATHS.gaps]:sha256('new source file')};
  const out=reconcile(original,changed,inputs.tests,newHashes,inputs.development);
  const a=out.board.activities.find(x=>x.id==='WUTRIB-PMO-GAP-001');
  assert.equal(a.status,'IN_PROGRESS');
  assert.equal(a.drift,true);
  assert.equal(a.title,changed.items[0].finding);
  assert.equal(out.board.activities.filter(x=>x.type==='GATE').every(x=>x.status==='HOLD_HUMAN'),true);
});
test('Removed source task remains stored and becomes review-required',()=>{
  const initial=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development).board;
  const stripped=cloned(inputs.gaps);stripped.items.pop();
  const out=reconcile(initial,stripped,inputs.tests,{...hashes,[PATHS.gaps]:sha256('source-removal')},inputs.development);
  assert.equal(out.board.activities.length,72);
  assert.equal(out.board.activities.filter(x=>x.sourceRemoved).length,1);
  assert.equal(out.board.activities.find(x=>x.id==='WUTRIB-PMO-GAP-026').drift,true);
});
test('Unknown and duplicated source keys fail closed',()=>{
  const modified=cloned(inputs.gaps);modified.items.push(cloned(modified.items[0]));
  assert.throws(()=>expectedItems(modified,inputs.tests,inputs.development),/duplicado|duplicate|ID inválido/i);
});
test('Agent cannot approve, close or mark PASS',()=>{
  for(const to of ['APPROVED','DONE','CLOSED','PASS','VERIFIED']){
    assert.throws(()=>transition(board,journal,{id:'WUTRIB-PMO-GAP-001',to,actor:'human',reason:'Tentativa indevida'},ROOT),/não permitida/i);
  }
});
test('Human gates remain in HOLD and may not be transitioned by CLI',()=>{
  assert.throws(()=>transition(board,journal,{id:'WUTRIB-PMO-GV1-06',to:'IN_PROGRESS',actor:'human',reason:'Tentar promover'},ROOT),/Gates/i);
});
test('Tests remain NOT_RUN until admitted execution policy changes externally',()=>{
  assert.throws(()=>transition(board,journal,{id:'WUTRIB-PMO-T01',to:'IN_PROGRESS',actor:'qa',reason:'Executar o teste'},ROOT),/não admitida/i);
});
test('Transition to review requires materialized evidence with real file SHA',()=>{
  assert.throws(()=>transition(board,journal,{id:'WUTRIB-PMO-GAP-001',to:'READY_FOR_REVIEW',actor:'human',reason:'Documento revisado'},ROOT),/evidência/i);
  const result=transition(board,journal,{id:'WUTRIB-PMO-GAP-001',to:'READY_FOR_REVIEW',actor:'analyst',reason:'Avaliar o documento com revisão independente',evidence:PATHS.gaps},ROOT,'2026-11-08T15:00:00.000Z');
  const task=result.board.activities.find(x=>x.id==='WUTRIB-PMO-GAP-001');
  assert.equal(task.status,'READY_FOR_REVIEW');
  assert.equal(task.evidence.length,1);
  assert.match(task.evidence[0].sha256,/^[a-f0-9]{64}$/);
  assert.equal(validateBoard(result.board,result.journal).ok,true);
});
test('Transition records a chained event preserving former status',()=>{
  const x=transition(board,journal,{id:'WUTRIB-PMO-GAP-002',to:'IN_PROGRESS',actor:'engineer',reason:'Preparação de matriz de requisitos'},ROOT,'2026-11-08T16:00:00.000Z');
  const y=transition(x.board,x.journal,{id:'WUTRIB-PMO-GAP-002',to:'BLOCKED',actor:'engineer',reason:'Aguardando corpus normativo oficial'},ROOT,'2026-11-08T17:00:00.000Z');
  assert.equal(y.journal.events.length,journal.events.length+2);
  assert.equal(y.journal.events.at(-1).previousHash,y.journal.events.at(-2).eventHash);
  assert.equal(validateBoard(y.board,y.journal).ok,true);
});
test('Journal tampering is detected, including descriptive reason change',()=>{
  const event=appendEvent(journal,'qa','CHECK',{reason:'Verificação manual'},'2026-11-08T00:00:00.000Z');
  assert.equal(validateBoard(board,event).ok,true);
  event.events[0].details.reason='alterado';
  assert.equal(validateBoard(board,event).ok,false);
});
test('Review of drift is explicit and never changes technical status',()=>{
  const next=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development).board;
  next.activities[0].drift=true;
  const x=acknowledgeDrift(next,journal,{id:next.activities[0].id,actor:'reviewer',reason:'Conferência da alteração de fonte'},'2026-11-08T00:00:00.000Z');
  assert.equal(x.board.activities[0].drift,false);
  assert.equal(x.board.activities[0].status,next.activities[0].status);
  assert.equal(validateBoard(x.board,x.journal).ok,true);
});
test('Path traversal and missing evidence are denied',()=>{
  assert.throws(()=>guardedPath(ROOT,'../../etc/passwd'),/fora/i);
  assert.throws(()=>transition(board,journal,{id:'WUTRIB-PMO-GAP-001',to:'READY_FOR_REVIEW',actor:'qa',reason:'Documentar a evidência',evidence:'PMO/WUTRIB/no-evidence.json'},ROOT),/ausente/i);
});
test('Reports remain explicit about zero tests and no production permission',()=>{
  const summary=summarize(board,journal);
  const markdown=reportMd(summary,board);
  assert.equal(summary.totals.total,board.activities.length);
  assert.equal(summary.totals.criticalOpen,16);
  assert.equal(summary.testsExecutedByAgent,0);
  assert.equal(summary.productionAuthorized,false);
  assert.match(markdown,/NO-GO/);
  assert.match(markdown,/WUTRIB-PMO-GAP-001/);
});

test('Symlinks cannot escape repository when evidence is attached',()=>{
 const dir=mkdtempSync(resolve(tmpdir(),'wutrib-pmo-'));
 try{
  symlinkSync('/etc/passwd',resolve(dir,'external-proof'));
  assert.throws(()=>guardedPath(dir,'external-proof'),/Symlink fora/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('Development workstream is preserved as distinct WO020 tasks',()=>{
 const items=expectedItems(inputs.gaps,inputs.tests,inputs.development);
 const dev=items.filter(x=>x.type==='DEV');
 assert.equal(dev.length,9);
 assert.equal(dev.every(x=>x.sourcePath===PATHS.dev),true);
 assert.equal(dev.some(x=>x.id==='WUTRIB-PMO-DEV-009'),true);
});
test('Development activities can be staged for review but never closed',()=>{
 const seeded=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development).board;
 const id='WUTRIB-PMO-DEV-005';
 const item=seeded.activities.find(x=>x.id===id);
 const boardForTest=cloned(seeded);
 boardForTest.activities.find(x=>x.id===id).status='OPEN';
 const x=transition(boardForTest,journal,{id,to:'READY_FOR_REVIEW',actor:'qa_agent',reason:'Demonstração sintética submetida à revisão',evidence:'docs/wutrib/v1-development-20261108/INCREMENTO_001.md'},ROOT,'2026-11-08T22:00:00.000Z');
 assert.equal(x.board.activities.find(y=>y.id===id).status,'READY_FOR_REVIEW');
 assert.equal(x.board.activities.find(y=>y.id===id).manualDecision,null);
 assert.equal(validateBoard(x.board,x.journal).ok,true);
 for(const forbidden of ['APPROVED','DONE','PASS','CLOSED']) {
  assert.throws(()=>transition(boardForTest,journal,{id,to:forbidden,actor:'qa',reason:'Proibir aprovação automática'},ROOT),/não permitida/i);
 }
});
test('Development source deletion never silently deletes PMO work items',()=>{
 const seeded=reconcile(board,inputs.gaps,inputs.tests,hashes,inputs.development).board;
 const dev=cloned(inputs.development);
 dev.items.pop();
 const out=reconcile(seeded,inputs.gaps,inputs.tests,{...hashes,[PATHS.dev]:sha256('new dev workstream')},dev);
 assert.equal(out.board.activities.length,72);
 assert.equal(out.board.activities.find(x=>x.id==='WUTRIB-PMO-DEV-009').sourceRemoved,true);
});

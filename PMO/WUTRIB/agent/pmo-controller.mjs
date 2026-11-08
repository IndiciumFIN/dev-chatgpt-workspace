/**
 * WU-TRIB PMO — agente determinístico e auditável.
 * Atualiza atividades, mas não concede aprovação, homologação nem autorização de produção.
 */
import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,dirname,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
export const PATHS=Object.freeze({
 board:'PMO/WUTRIB/data/activities.v1.json',events:'PMO/WUTRIB/data/events.v1.json',
 gaps:'docs/wutrib/v1-assurance-20261108/MATRIZ_LACUNAS_E_CORRECOES_V1.json',
 tests:'docs/wutrib/v1-baseline-20261108/MATRIZ_DE_TESTES_E_GATES_V1.json',
 dev:'PMO/WUTRIB/data/development-workstream.v1.json',
 summary:'PMO/WUTRIB/reports/summary.v1.json',report:'PMO/WUTRIB/reports/STATUS.md'
});
export const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
export function guardedPath(root,path){
 if(typeof path!=='string'||!path||isAbsolute(path)||path.includes('\0'))throw Error('Caminho inválido');
 const rootReal=realpathSync(root),file=resolve(root,path),rel=relative(rootReal,file);
 if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)||rel==='')throw Error('Arquivo fora do repositório');
 let closest=file;
 while(!existsSync(closest)){
  const parent=dirname(closest);
  if(parent===closest)throw Error('Caminho inválido');
  closest=parent;
 }
 const real=realpathSync(closest),actual=relative(rootReal,real);
 if(actual==='..'||actual.startsWith('..'+sep)||isAbsolute(actual))throw Error('Symlink fora do repositório');
 return file;
}
const readJSON=(root,path)=>JSON.parse(readFileSync(guardedPath(root,path),'utf8'));
function atomic(root,path,data){
 const file=guardedPath(root,path),body=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n';
 mkdirSync(dirname(file),{recursive:true});
 if(existsSync(file)&&readFileSync(file,'utf8')===body)return false;
 const temp=file+'.pmo-tmp-'+process.pid;
 writeFileSync(temp,body,{mode:0o600});renameSync(temp,file);
 return true;
}
export function expectedItems(gaps,plan,development={items:[]}){
 if(!Array.isArray(development.items))throw Error('WO desenvolvimento sem lista de tarefas');
 if(!Array.isArray(gaps.items)||!Array.isArray(plan.tests)||!Array.isArray(plan.gates))throw Error('Fontes incompletas');
 const list=[
 ...gaps.items.map(x=>({id:'WUTRIB-PMO-'+x.id,sourceId:x.id,type:'GAP',title:x.finding,
  description:x.correctiveAction,sourcePath:PATHS.gaps,ownerRole:x.ownerRole,priority:x.priority,
  phase:x.blockingType==='SCOPE_FREEZE_BLOCKER'?'SCOPE_REVIEW':'PRE_RELEASE',
  gate:x.blockingType,requiredEvidence:['CORRECTED_SPEC','INDEPENDENT_REVIEW'],initialStatus:'OPEN',origin:'IMPORT_FROM_ISSUE_REGISTER'})),
 ...plan.tests.map(x=>({id:'WUTRIB-PMO-'+x.id,sourceId:x.id,type:'TEST',title:x.group,
  description:x.scenario+' | Aceite: '+x.acceptance,sourcePath:PATHS.tests,
  ownerRole:'QA_INDEPENDENT',priority:'P1',phase:'VALIDATION',gate:'GV1-02..05',
  requiredEvidence:['TEST_CASE','FIXTURE','INDEPENDENT_ORACLE','EXECUTION_LOG','REVIEW'],
  initialStatus:'NOT_RUN',origin:'IMPORT_FROM_TEST_PLAN'})),
 ...plan.gates.map(x=>({id:'WUTRIB-PMO-'+x.id,sourceId:x.id,type:'GATE',title:x.name,
  description:x.required.join('; '),sourcePath:PATHS.tests,
  ownerRole:x.id==='GV1-06'?'CHANGE_AUTHORITY':'PMO_AND_DOMAIN_OWNER',
  priority:'P0',phase:'GOVERNANCE',gate:x.id,requiredEvidence:x.required,
  initialStatus:'HOLD_HUMAN',origin:'IMPORT_FROM_GATE_REGISTER'})),
 ...development.items.map(x=>({id:'WUTRIB-PMO-'+x.id,sourceId:x.id,type:'DEV',title:x.title,
  description:x.description,sourcePath:PATHS.dev,ownerRole:x.ownerRole,priority:x.priority,
  phase:x.phase,gate:x.gate,requiredEvidence:x.requiredEvidence,
  initialStatus:'OPEN',origin:'IMPORT_FROM_DEV_WO020'}))
 ];
 const ids=new Set();
 for(const x of list){
  if(ids.has(x.id)||!/^WUTRIB-PMO-(GAP-\d{3}|T\d{2}|GV1-\d{2}|DEV-\d{3})$/.test(x.id))throw Error('ID inválido ou duplicado: '+x.id);
  ids.add(x.id);
 }
 return list;
}
export function validateBoard(board,journal){
 const errors=[],ids=new Set();
 if(board.schemaVersion!=='wutrib.pmo.activity-board.v1'||board.project!=='WU-TRIB'||board.woId!=='WUTRIB-WO-PLAN-019')errors.push('Projeto/WO inválidos');
 if(!Array.isArray(board.activities))errors.push('Falta a lista de atividades');
 for(const a of (board.activities||[])){
  if(ids.has(a.id))errors.push('ID duplicado: '+a.id);ids.add(a.id);
  const choices=['GAP','DEV'].includes(a.type)?['OPEN','IN_PROGRESS','BLOCKED','READY_FOR_REVIEW']:
   a.type==='TEST'?['NOT_RUN','BLOCKED','IN_PROGRESS','READY_FOR_REVIEW']:
   a.type==='GATE'?['HOLD_HUMAN']:[];
  if(!choices.includes(a.status))errors.push('Estado proibido: '+a.id+':'+a.status);
  if(!a.id.startsWith('WUTRIB-PMO-')||![PATHS.gaps,PATHS.tests,PATHS.dev].includes(a.sourcePath))errors.push('Fonte/ID externo: '+a.id);
  if(a.manualDecision!==null)errors.push('Agente não pode assinar decisão: '+a.id);
  if(!Array.isArray(a.evidence)||(a.evidence||[]).some(e=>!e.path||!/^[a-f0-9]{64}$/.test(e.sha256||'')))errors.push('Evidência inválida: '+a.id);
 }
 if(board.policy?.agentCanApprove!==false||board.policy?.agentCanClose!==false||board.policy?.agentCanDeploy!==false||board.policy?.testExecutionAuthorized!==false)errors.push('Política de autoridade não fail-closed');
 if(journal.schemaVersion!=='wutrib.pmo.events.v1'||!Array.isArray(journal.events))errors.push('Diário inválido');
 let previous='GENESIS';
 for(let i=0;i<(journal.events||[]).length;i++){
  const e=journal.events[i],{eventHash,...payload}=e;
  if(e.seq!==i+1||e.previousHash!==previous||eventHash!==sha256(JSON.stringify(payload)))errors.push('Diário adulterado na sequência '+(i+1));
  previous=eventHash;
 }
 return {ok:errors.length===0,errors};
}
export function reconcile(board,gaps,plan,fingerprints,development={items:[]}){
 const next=clone(board),changes=[],byId=new Map(next.activities.map(x=>[x.id,x]));
 const expected=expectedItems(gaps,plan,development);
 for(const source of expected){
  const fingerprint=fingerprints[source.sourcePath];
  if(!/^[a-f0-9]{64}$/.test(fingerprint||''))throw Error('Falta SHA-256 real: '+source.sourcePath);
  const prev=byId.get(source.id);
  if(!prev){
   const {initialStatus,...fields}=source;
   next.activities.push({...fields,status:initialStatus,evidence:[],manualDecision:null,
    dependencies:[],sourceFingerprint:fingerprint,sourceRemoved:false,drift:false});
   changes.push({id:source.id,action:'SOURCE_NEW'});continue;
  }
  if(prev.type!==source.type||prev.sourceId!==source.sourceId||prev.sourcePath!==source.sourcePath)throw Error('Identidade da origem alterada: '+source.id);
  if(prev.sourceFingerprint===null){
   prev.sourceFingerprint=fingerprint;changes.push({id:source.id,action:'SOURCE_BASELINED'});
  }else if(prev.sourceFingerprint!==fingerprint){
   prev.sourceFingerprint=fingerprint;prev.drift=true;
   changes.push({id:source.id,action:'SOURCE_CHANGED_NEEDS_HUMAN_REVIEW'});
  }
  if(prev.sourceRemoved){
   prev.sourceRemoved=false;prev.drift=true;
   changes.push({id:source.id,action:'SOURCE_RESTORED_NEEDS_HUMAN_REVIEW'});
  }
  for(const key of ['title','description','ownerRole','priority','phase','gate','requiredEvidence']){
   if(JSON.stringify(prev[key])!==JSON.stringify(source[key])){
    prev[key]=source[key];prev.drift=true;
    changes.push({id:source.id,action:'METADATA_CHANGED_NEEDS_HUMAN_REVIEW',field:key});
   }
  }
 }
 const present=new Set(expected.map(x=>x.id));
 for(const a of next.activities){
  if(!present.has(a.id)&&!a.sourceRemoved){
   a.sourceRemoved=true;a.drift=true;
   changes.push({id:a.id,action:'SOURCE_REMOVED_TASK_RETAINED'});
  }
 }
 next.activities.sort((a,b)=>a.id.localeCompare(b.id,'en'));
 return {board:next,changes};
}
export function appendEvent(journal,actor,action,details,at=new Date().toISOString()){
 if(!actor||actor.length>120||/[\r\n]/.test(actor))throw Error('Ator inválido');
 const updated=clone(journal),previousHash=updated.events.at(-1)?.eventHash||'GENESIS';
 const payload={seq:updated.events.length+1,previousHash,at,actor,action,details};
 updated.events.push({...payload,eventHash:sha256(JSON.stringify(payload))});
 return updated;
}
export function transition(board,journal,{id,to,actor,reason,evidence},root=ROOT,at=new Date().toISOString()){
 const next=clone(board),item=next.activities.find(x=>x.id===id);
 if(!item)throw Error('Atividade não localizada');
 if(item.type==='GATE')throw Error('Gates exigem aceite humano fora deste agente');
 if(item.type==='TEST'&&['IN_PROGRESS','READY_FOR_REVIEW'].includes(to)&&!next.policy.testExecutionAuthorized)throw Error('Execução de testes não admitida pelo Kernel');
 const choices=['GAP','DEV'].includes(item.type)?['OPEN','IN_PROGRESS','BLOCKED','READY_FOR_REVIEW']:
  ['NOT_RUN','BLOCKED','IN_PROGRESS','READY_FOR_REVIEW'];
 if(!choices.includes(to)||to===item.status)throw Error('Transição não permitida');
 if(!actor||!reason||reason.trim().length<8||/[\r\n]/.test(actor))throw Error('Identidade declarada e motivo significativo obrigatórios');
 if(to==='READY_FOR_REVIEW'&&!evidence)throw Error('Revisão precisa de evidência materializada');
 let artifact=null;
 if(evidence){
  const path=guardedPath(root,evidence);
  if(!existsSync(path))throw Error('Evidência ausente');
  artifact={path:evidence,sha256:sha256(readFileSync(path)),observedAt:at};
  if(!item.evidence.some(x=>x.path===artifact.path&&x.sha256===artifact.sha256))item.evidence.push(artifact);
 }
 const from=item.status;item.status=to;
 return {board:next,journal:appendEvent(journal,actor,'STATUS_TRANSITION',{id,from,to,reason,evidence:artifact},at)};
}
export function acknowledgeDrift(board,journal,{id,actor,reason},at=new Date().toISOString()){
 const next=clone(board),item=next.activities.find(x=>x.id===id);
 if(!item||!item.drift||item.sourceRemoved)throw Error('Não há drift resolvível');
 if(!actor||!reason||reason.trim().length<8)throw Error('Ator e justificativa obrigatórios');
 item.drift=false;
 return {board:next,journal:appendEvent(journal,actor,'SOURCE_DRIFT_ACKNOWLEDGED',{id,reason},at)};
}
export function summarize(board,journal){
 const t={total:board.activities.length,gaps:0,tests:0,gates:0,development:0,criticalOpen:0,drift:0,sourceRemoved:0,byStatus:{}};
 for(const x of board.activities){
  if(x.type==='GAP')t.gaps++;if(x.type==='TEST')t.tests++;if(x.type==='GATE')t.gates++;if(x.type==='DEV')t.development++;
  if(x.type==='GAP'&&x.priority==='P0'&&x.status!=='READY_FOR_REVIEW')t.criticalOpen++;
  if(x.drift)t.drift++;if(x.sourceRemoved)t.sourceRemoved++;
  t.byStatus[x.status]=(t.byStatus[x.status]||0)+1;
 }
 return {schemaVersion:'wutrib.pmo.summary.v1',project:board.project,woId:board.woId,
  release:'NO_GO',humanApproval:'NOT_GRANTED',productionAuthorized:false,testsExecutedByAgent:0,
  totals:t,sources:board.sourceBaselines.map(x=>x.path),lastEventHash:journal.events.at(-1)?.eventHash||null};
}
export function reportMd(summary,board){
 const t=summary.totals;
 const lines=['# PMO WU-TRIB — situação da V1','',
  '**Natureza:** acompanhamento de planejamento, sem homologação ou aprovação pelo agente.',
  '**WO:** '+summary.woId+' — admissão pelo Kernel pendente.',
  '**Produção:** NO-GO.','',
  '| Indicador | Quantidade |','|---|---:|',
  '| Total de atividades | '+t.total+' |','| Lacunas | '+t.gaps+' |',
  '| Grupos de testes | '+t.tests+' |','| Gates humanos | '+t.gates+' |',
  '| Tarefas de desenvolvimento WO020 | '+t.development+' |',
  '| Lacunas P0 não prontas para revisão | '+t.criticalOpen+' |',
  '| Mudanças de origem aguardando revisão | '+t.drift+' |',
  '| Origens removidas, atividades preservadas | '+t.sourceRemoved+' |','',
  '## Estados','','| Estado | Itens |','|---|---:|'];
 for(const [s,n] of Object.entries(t.byStatus).sort())lines.push('| '+s+' | '+n+' |');
 lines.push('','## Lacunas P0','', '| ID | Responsável | Status |','|---|---|---|');
 for(const x of board.activities.filter(x=>x.type==='GAP'&&x.priority==='P0'&&x.status!=='READY_FOR_REVIEW').sort((a,b)=>a.id.localeCompare(b.id))){
  lines.push('| '+x.id+' | '+x.ownerRole+' | '+x.status+(x.drift?' (DRIFT)':'')+' |');
 }
 lines.push('','## Limites e fontes','','- Fontes: '+PATHS.gaps+' e '+PATHS.tests+'.',
  '- Desenvolvimento: '+PATHS.dev+' (WO-DEV-020) com acompanhamento separado dos testes de homologação.',
  '- Sem acesso por este agente a dados do ERP, Supabase, Vercel ou projeto de Enfermagem.',
  '- Estados OPEN, IN_PROGRESS e READY_FOR_REVIEW não significam aprovação, teste PASS ou trabalho homologado.',
  '- O histórico encadeado registra operações, mas o nome informado em --actor não é assinatura de identidade.',
  '- Somente aprovação humana fora deste agente pode encerrar WOs, aceitar riscos ou autorizar produção.','');
 return lines.join('\n');
}
export function loadInputs(root=ROOT){
 const g=readFileSync(guardedPath(root,PATHS.gaps)),t=readFileSync(guardedPath(root,PATHS.tests)),d=readFileSync(guardedPath(root,PATHS.dev));
 return {gaps:JSON.parse(g),tests:JSON.parse(t),development:JSON.parse(d),fingerprints:{[PATHS.gaps]:sha256(g),[PATHS.tests]:sha256(t),[PATHS.dev]:sha256(d)}};
}
function flagsParse(xs){
 const f={};
 for(let i=0;i<xs.length;i++){
  const a=xs[i];if(!a.startsWith('--'))throw Error('Argumento inválido: '+a);
  const k=a.slice(2);if(!['write','id','to','actor','reason','evidence'].includes(k))throw Error('Parâmetro desconhecido: '+k);
  if(k==='write'){f.write=true;continue;}
  if(!xs[i+1]||xs[i+1].startsWith('--'))throw Error('Falta valor para '+k);
  f[k]=xs[++i];
 }
 return f;
}
export function main(argv=process.argv.slice(2),root=ROOT){
 const cmd=argv[0]||'status',args=flagsParse(argv.slice(1));
 const board=readJSON(root,PATHS.board),journal=readJSON(root,PATHS.events);
 const before=validateBoard(board,journal);
 if(!before.ok)throw Error('Integridade comprometida: '+before.errors.join('; '));
 let next=board,events=journal,changes=[],mode='READ_ONLY';
 if(cmd==='sync'){
  const inputs=loadInputs(root),out=reconcile(board,inputs.gaps,inputs.tests,inputs.fingerprints,inputs.development);
  next=out.board;changes=out.changes;
  if(changes.length)events=appendEvent(journal,'PMO_DETERMINISTIC_AGENT','SOURCE_RECONCILIATION',{
   changes:changes.length,items:[...new Set(changes.map(x=>x.id))].sort(),
   actions:changes.reduce((a,x)=>(a[x.action]=(a[x.action]||0)+1,a),{})});
  mode=args.write?'WRITE_RECONCILIATION':'DRY_RUN_RECONCILIATION';
 }else if(cmd==='transition'){
  if(!args.write)throw Error('Alteração exige --write');
  const result=transition(board,journal,args,root);
  next=result.board;events=result.journal;mode='WRITE_OPERATOR_TRANSITION';
 }else if(cmd==='ack'){
  if(!args.write)throw Error('Reconhecimento exige --write');
  const result=acknowledgeDrift(board,journal,args);
  next=result.board;events=result.journal;mode='WRITE_SOURCE_REVIEW';
 }else if(!['check','report','status'].includes(cmd))throw Error('Comando desconhecido: '+cmd);
 const valid=validateBoard(next,events);if(!valid.ok)throw Error('Saída inválida: '+valid.errors.join('; '));
 const summary=summarize(next,events);
 if(args.write){
  atomic(root,PATHS.board,next);atomic(root,PATHS.events,events);
  atomic(root,PATHS.summary,summary);atomic(root,PATHS.report,reportMd(summary,next));
 }
 const result={controller:'wutrib-pmo-deterministic-v1',mode,written:!!args.write,changes:changes.length,
  state:'HOLD_HUMAN_NO_GO',check:'STRUCTURE_AND_AUDIT_CHAIN_ONLY',summary};
 console.log(JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main();}catch(e){console.error('PMO FAIL-CLOSED: '+e.message);process.exitCode=1;}
}

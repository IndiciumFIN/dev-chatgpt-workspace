/**
 * CI-only proposal of operational work status. No approval / signoff.
 * Execute only after the V1 synthetic CI tests pass on the isolated branch.
 * Any human changes, non-OPEN states or drift are preserved, never overridden.
 */
import {readFileSync} from 'node:fs';
import {ROOT,PATHS,main} from './pmo-controller.mjs';
import {resolve} from 'node:path';
const boardPath=resolve(ROOT,PATHS.board);
const document='docs/wutrib/v1-development-20261108/INCREMENTO_001.md';
const steps=[
 ['DEV-002','IN_PROGRESS','Contrato sintético submetido para revisão independente'],
 ['DEV-003','IN_PROGRESS','Parser parcial EFD em desenvolvimento, sem homologação fiscal'],
 ['DEV-004','IN_PROGRESS','Rastreamento sintético IDTRIB submetido para revisão TOTVS'],
 ['DEV-005','READY_FOR_REVIEW','Conciliação sintética passou no CI e requer revisão humana'],
 ['DEV-006','READY_FOR_REVIEW','Testes automatizados sintéticos executados; homologação pendente']
];
for(const [task,to,reason] of steps){
 const id='WUTRIB-PMO-'+task;
 const board=JSON.parse(readFileSync(boardPath,'utf8'));
 const item=board.activities.find(x=>x.id===id);
 if(!item)throw Error('Atividade faltante no PMO: '+id);
 if(item.drift||item.sourceRemoved)throw Error('Fonte alterada sem revisão: '+id);
 if(item.status===to)continue;
 if(item.status!=='OPEN')throw Error('Não sobrescrever transição humana: '+id+' '+item.status);
 const args=['transition','--id',id,'--to',to,'--actor','github-actions[bot]','--reason',reason];
 if(to==='READY_FOR_REVIEW')args.push('--evidence',document);
 args.push('--write');
 main(args);
}
const final=JSON.parse(readFileSync(boardPath,'utf8'));
if(final.activities.some(x=>x.type==='GATE'&&x.status!=='HOLD_HUMAN')||
   final.activities.some(x=>x.type==='TEST'&&x.status!=='NOT_RUN')){
 throw Error('CI não pode alterar gates ou resultados de testes de homologação.');
}

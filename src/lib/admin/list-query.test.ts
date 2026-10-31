import {test} from 'node:test';
import assert from 'node:assert/strict';
import {queryPmo, type PmoListItem} from './list-query.ts';
const base:PmoListItem[]=[
 {id:'WO-ADM-001',title:'Configuração de execução',order:3,status:'IN_PROGRESS',priority:'P1',owner:'PMO',criteria:'Checklist técnico',next:'Verificar controlos'},
 {id:'WO-CKO-001',title:'Revisão clínica',order:2,status:'QUEUED',priority:'P0',owner:'Enfermeiro',criteria:'Evidência revisada',next:'Revisão humana'},
 {id:'WO-HOM-001',title:'Homologação',order:1,status:'HOLD_HUMAN',priority:'P0',owner:'Aprovador',criteria:'Gate humano',next:'Assinatura'},
 {id:'WO-SEC-001',title:'Segurança',order:4,status:'PAUSED',priority:'P2',owner:'Security',criteria:'Proteção',next:'Rever credenciais'},
 {id:'WO-E2E-001',title:'Testes e2e',order:5,status:'QUEUED',priority:'P1',owner:'QA',criteria:'Evidências',next:'Executar testes'},
 {id:'WO-GOV-001',title:'Governança',order:6,status:'IN_PROGRESS',priority:'P3',owner:'Auditor',criteria:'Normativos',next:'Verificar políticas'}
];
const q=(params:Partial<Parameters<typeof queryPmo>[1]>={})=>queryPmo(base,{search:'',filter:'all',sort:'order',page:1,pageSize:5,...params});
test('R87: stable order is independent of original source order and does not mutate it',()=>{
 const before=base.map(x=>x.id); const result=q();
 assert.deepEqual(result.items.map(x=>x.order),[1,2,3,4,5]);
 assert.deepEqual(base.map(x=>x.id),before);
});
test('R87: Unicode/diacritics normalization matches clinical status without case sensitivity',()=>{
 assert.deepEqual(q({search:'REVISAO CLINICA'}).items.map(x=>x.id),['WO-CKO-001']);
});
test('R87: ID search is exact substring even with mixed case',()=>{
 assert.deepEqual(q({search:'wo-hom'}).items.map(x=>x.id),['WO-HOM-001']);
});
test('R87: search includes owner, criterion and next action',()=>{
 assert.equal(q({search:'Enfermeiro'}).total,1);
 assert.equal(q({search:'normativos'}).total,1);
 assert.equal(q({search:'credenciais'}).total,1);
});
test('R87: active means precisely QUEUED or IN_PROGRESS',()=>{
 const r=q({filter:'active'});
 assert.equal(r.total,4);
 assert(!r.items.some(x=>x.status==='HOLD_HUMAN'||x.status==='PAUSED'));
});
test('R87: hold means precisely PAUSED or HOLD_HUMAN',()=>{
 const r=q({filter:'holds'});
 assert.deepEqual(r.items.map(x=>x.status),['HOLD_HUMAN','PAUSED']);
});
test('R87: priority sorting gives P0 then P1 with stable order for ties',()=>{
 const r=q({sort:'priority',pageSize:10});
 assert.deepEqual(r.items.map(x=>x.id),['WO-HOM-001','WO-CKO-001','WO-ADM-001','WO-E2E-001','WO-SEC-001','WO-GOV-001']);
});
test('R87: title sorting uses pt-BR collator',()=>{
 const r=q({sort:'title',pageSize:10});
 assert.deepEqual(r.items.map(x=>x.title),['Configuração de execução','Governança','Homologação','Revisão clínica','Segurança','Testes e2e']);
});
test('R87: pagination uses deterministic indices, including last page',()=>{
 const r=q({page:2,pageSize:5});
 assert.equal(r.total,6);assert.equal(r.pages,2);assert.equal(r.page,2);
 assert.equal(r.start,6);assert.equal(r.end,6);assert.equal(r.items.length,1);
});
test('R87: page past end clamps to final page without fabricating results',()=>{
 const r=q({page:30,pageSize:5});assert.equal(r.page,2);assert.equal(r.items.length,1);
});
test('R87: zero matches produces empty result and safe page metadata',()=>{
 const r=q({search:'nao existe'});assert.equal(r.total,0);assert.equal(r.items.length,0);
 assert.equal(r.start,0);assert.equal(r.end,0);assert.equal(r.page,1);assert.equal(r.pages,1);
});
test('R87: filter and search compose before sorting/pagination',()=>{
 const r=q({filter:'active',search:'QA',sort:'priority'});assert.equal(r.total,1);assert.equal(r.items[0].id,'WO-E2E-001');
});
test('R87: rejects unknown status filters, sort order and invalid pagination',()=>{
 assert.throws(()=>q({filter:'APPROVED' as never}),/INVALID_PMO_FILTER/);
 assert.throws(()=>q({sort:'remote' as never}),/INVALID_PMO_SORT/);
 assert.throws(()=>q({page:0}),/INVALID_PMO_PAGE/);
 assert.throws(()=>q({pageSize:1000}),/INVALID_PMO_PAGE_SIZE/);
});
test('R87: rejects duplicate IDs and oversized searches rather than hiding errors',()=>{
 const d=[base[0],base[0]];
 assert.throws(()=>queryPmo(d,{search:'',filter:'all',sort:'order',page:1,pageSize:5}),/DUPLICATE_PMO_ID/);
 assert.throws(()=>q({search:'a'.repeat(151)}),/PMO_QUERY_TOO_LONG/);
});

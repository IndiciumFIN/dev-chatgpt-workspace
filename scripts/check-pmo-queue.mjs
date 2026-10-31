import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const q = JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const statuses = new Set(['PAUSED','IN_PROGRESS','QUEUED','HOLD_HUMAN','DONE','BLOCKED']);
const priorities = new Set(['P0','P1','P2']);
assert.equal(q.schemaVersion,1);
assert.equal(q.registryId,'CE-PMO-001');
assert.equal(q.canonicalSource,'registers/pmo/queue.v1.json');
assert.equal(q.readOnly,true);
assert.equal(q.scope,'IndiciumFIN/dev-chatgpt-workspace');
assert(Number.isSafeInteger(q.revision)&&q.revision>=1);
assert.match(q.updatedOn,/^\d{4}-\d{2}-\d{2}$/);
assert(Array.isArray(q.items)&&q.items.length>0);
const ids = new Set(q.items.map(x=>x.id));
assert.equal(ids.size,q.items.length,'ID duplicado');
for(const [i,item] of q.items.entries()){
  assert.equal(item.order,i,'Ordem deve ser explícita e contínua');
  assert.match(item.id,/^WO-[A-Z0-9-]+$/);
  assert(statuses.has(item.status),'Status inválido: '+item.id);
  assert(priorities.has(item.priority),'Prioridade inválida: '+item.id);
  for(const field of ['title','owner','criteria','next']) {
    const minimum = field === 'owner' ? 4 : 12;
    assert(typeof item[field] === 'string' && item[field].trim().length >= minimum, item.id+' sem '+field);
  }
  assert(Array.isArray(item.dependencies));
  assert(item.dependencies.every(dep=>ids.has(dep)&&dep!==item.id),'Dependência inválida: '+item.id);
  assert(Array.isArray(item.evidence));
  assert(item.evidence.every(url=>/^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\//.test(url)),'Evidência de origem não autorizada');
  if(item.status==='DONE') {
    assert(item.evidence.length>0,'DONE sem evidência: '+item.id);
    assert(item.dependencies.every(dep=>q.items.find(x=>x.id===dep)?.status==='DONE'),
      'DONE com dependência pendente: '+item.id);
  }
}
const visiting = new Set();
const visited = new Set();
const byId = new Map(q.items.map(item => [item.id, item]));
function visit(id) {
  assert(!visiting.has(id), 'Ciclo de dependências: '+id);
  if (visited.has(id)) return;
  visiting.add(id);
  for (const dep of byId.get(id).dependencies) visit(dep);
  visiting.delete(id);
  visited.add(id);
}
for (const item of q.items) {
  assert.equal(new Set(item.evidence).size, item.evidence.length, 'Evidência duplicada: '+item.id);
  visit(item.id);
}
// Allow exactly the owner's documented LOCAL Commander preparation; no remote execution.
const adm=q.items.find(item=>item.id==='WO-ADM-001');
assert(adm&&['PAUSED','IN_PROGRESS'].includes(adm.status),'Unauthorized prototype state');
if(adm.status==='IN_PROGRESS'){
  const transition=[...q.events].reverse().find(ev=>ev.workId==='WO-ADM-001');
  assert(transition?.to==='IN_PROGRESS' &&
    /Proprietário autorizou/.test(transition.reason) &&
    /Commander local/.test(transition.reason) &&
    /sem execução externa/.test(transition.reason) &&
    /autenticação ou banco/.test(transition.reason),
    'Owner-approved local scope is missing');
  assert(adm.evidence.some(url=>/\/commit\//.test(url)),'Active ADM WO without commit evidence');
  const commander=readFileSync('src/components/admin/commander-panel.tsx','utf8');
  assert(commander.includes('Nenhum agente ou serviço foi acionado.') &&
    !/\b(fetch|axios|supabase)\s*\(/.test(commander),
    'Commander exceeded local-only scope');
}
assert(q.items.find(item=>item.id==='WO-HOM-001')?.status==='HOLD_HUMAN','Release HOLD bypassed');
assert(Array.isArray(q.events)&&q.events.length>0);
for(const [i,event] of q.events.entries()){
  assert.equal(event.seq,i+1,'Lacuna na sequência de eventos');
  assert(ids.has(event.workId),'Evento sem WO');
  assert(statuses.has(event.to),'Evento com estado inválido');
  assert(event.reason?.length>15,'Evento sem justificativa');
}
const last = new Map(q.events.map(ev=>[ev.workId,ev.to]));
for(const item of q.items)if(last.has(item.id))assert.equal(item.status,last.get(item.id),'Estado diverge do último evento: '+item.id);
const ui=readFileSync('src/components/admin/admin-console.tsx','utf8');
const panel=readFileSync('src/components/admin/pmo-panel.tsx','utf8');
assert(ui.includes("<PmoPanel />")&&ui.includes("'pmo'"),'Painel não integrado à navegação');
assert(panel.includes("../../../registers/pmo/queue.v1.json"),'Fonte PMO duplicada ou divergente');
console.log('PASS PMO: '+q.items.length+' ordens, '+q.events.length+' eventos, dependências, evidências e renderização canônica.');

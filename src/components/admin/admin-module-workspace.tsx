import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Boxes, ChevronRight, ClipboardList, Download, FilePlus2, FolderTree, LayoutGrid, ListFilter, LockKeyhole, Search, Table2 } from 'lucide-react';
import { adminGroups, getAdminModule, type AdminModuleId } from '@/lib/admin-module-registry';
import { templateCatalogo } from '@/lib/template-catalog';
import { tools } from '@/lib/tools/catalog';
import { AdminSchemaEditor } from '@/components/admin/admin-schema-editor';
import { getSubmoduleTemplates } from '@/lib/admin-form-template-registry';
import pmo from '../../../registers/pmo/queue.v1.json';
import findings from '../../../registers/governance/find-register.v1.json';
import norms from '../../../registers/governance/transversal-standards-candidates.v1.json';
import '@/styles/admin-module-workspace.css';

type Mode = 'records'|'form'|'reports'|'flows';
type Layout = 'cards'|'table';
type RecordView = {id:string; name:string; kind:string; status:string; note:string; link?:string};
const noop:readonly RecordView[]=[];
const localEditors:Partial<Record<AdminModuleId,Record<string,'pmo'|'governance'|'content'|'templates'|'sources'|'publication'|'command'>>> = {
 M03:{'Work Orders':'pmo'},
 M04:{'Governança corporativa':'governance'},
 M06:{'Fontes e licenças':'sources'},
 M08:{'Calculadoras':'content'},
 M10:{'Templates e slots':'templates'},
 M15:{'Publicação':'publication'},
 M16:{'Filas e execuções':'command','Telemetria':'command'},
 M17:{'Normativos e versões':'governance'},
};
export type ExistingArea = 'pmo'|'governance'|'content'|'templates'|'sources'|'publication';
function listFor(module:AdminModuleId,submodule:string):readonly RecordView[] {
 if(module==='M08' && submodule==='Calculadoras')return tools.map(x=>({
  id:x.slug,name:x.title,kind:x.category??'Ferramenta',status:String(x.status??'REGISTRADO'),note:String(x.publicacao??'Catálogo do código')
 }));
 if(module==='M10'&&submodule==='Templates e slots')return templateCatalogo.map(x=>({
  id:x.id,name:x.nome,kind:x.kind,status:x.url?'COM ROTA':'SEM ROTA',note:x.materiaPrima,link:x.url??undefined
 }));
 if(module==='M03'&&submodule==='Work Orders')return pmo.items.map(x=>({
  id:x.id,name:x.title,kind:x.priority,status:x.status,note:x.owner
 }));
 if((module==='M04'&&submodule==='Governança corporativa')||(module==='M21'&&submodule==='Achados e pareceres'))return findings.finds.map(x=>({
  id:x.canonical_id,name:x.fact,kind:x.severity,status:x.status,note:'Registro versionado · sem validação executável'
 }));
 if(module==='M17'&&submodule==='Normativos e versões')return norms.standards.map(x=>({
  id:x.id,name:x.name,kind:x.family,status:x.kernelAdmission,note:x.authority+' · '+x.edition
 }));
 if(module==='M06'&&submodule==='Fontes e licenças') {
  const refs=new Set(tools.flatMap(x=>x.sourceIds??[]));
  return [...refs].map(x=>({id:x,name:x,kind:'Fonte declarada',status:'NÃO QUALIFICADA AQUI',note:'Referência do catálogo; licença e vigência não verificadas'}));
 }
 return noop;
}
function saveCsv(name:string,items:readonly RecordView[]){
 const quote=(s:string)=>{const raw=String(s);const safe=/^[\s]*[=+@\-]/.test(raw)?"'"+raw:raw;return '"'+safe.replaceAll('"','""')+'"';};
 const content='\uFEFF'+['ID','Título','Tipo','Estado','Observação'].map(quote).join(';')+'\r\n'+items.map(x=>[x.id,x.name,x.kind,x.status,x.note].map(quote).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='relatorio-'+name.toLowerCase()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function AdminModuleWorkspace({moduleId,onOpenExisting,onEditRecord}:{moduleId:AdminModuleId;onOpenExisting:(view:ExistingArea)=>void;onEditRecord:(id:string)=>void}){
 const module=getAdminModule(moduleId);
 const group=adminGroups.find(x=>x.id===module.group);
 const [sub,setSub]=useState(module.submodules[0]);
 const [mode,setMode]=useState<Mode>('records');
 const [layout,setLayout]=useState<Layout>('cards');
 const [search,setSearch]=useState('');
 const [status,setStatus]=useState('all');
 const [sort,setSort]=useState('name');
 const [limit,setLimit]=useState(12);
 useEffect(()=>{setSub(getAdminModule(moduleId).submodules[0]);setMode('records');setSearch('');setStatus('all');setLimit(12)},[moduleId]);
 const available=useMemo(()=>listFor(moduleId,sub),[moduleId,sub]);
 const states=useMemo(()=>[...new Set(available.map(x=>x.status))].sort(),[available]);
 const filtered=useMemo(()=>available.filter(x=>
  (status==='all'||x.status===status)&&[x.id,x.name,x.kind,x.note].join(' ').toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
 ).sort((a,b)=>sort==='id'?a.id.localeCompare(b.id,'pt-BR'):sort==='name'?a.name.localeCompare(b.name,'pt-BR'):a.status.localeCompare(b.status,'pt-BR')),[available,search,status,sort]);
 const totals=useMemo(()=>[...new Set(available.map(x=>x.status))].map(state=>({state,count:available.filter(x=>x.status===state).length})).sort((a,b)=>b.count-a.count),[available]);
 const existing=localEditors[moduleId]?.[sub];
 function changeSub(s:string){setSub(s);setMode('records');setSearch('');setStatus('all');setLimit(12);}
 return <section className="ce-workspace" aria-labelledby="ce-workspace-title">
   <header className="ce-workspace-head">
     <div><span className="ce-workspace-eyebrow">{module.group} · {group?.title} / {moduleId}</span><h3 id="ce-workspace-title">{module.title}</h3><p>{module.purpose}</p></div>
     <span className="ce-workspace-state"><LockKeyhole size={15}/> Preview · acesso restrito</span>
   </header>
   <div className="ce-workspace-nav">
     <strong><FolderTree size={16}/> Submódulos</strong>
     <nav aria-label={'Submódulos de '+module.title} className="ce-workspace-submodules">
       {module.submodules.map(s=><button type="button" key={s} aria-current={sub===s?'page':undefined} onClick={()=>changeSub(s)}>{s}</button>)}
     </nav>
   </div>
   <div className="ce-workspace-main">
     <header className="ce-workspace-current">
       <div><span className="ce-workspace-eyebrow">ÁREA DE TRABALHO</span><h4>{sub}</h4></div>
       <span>{available.length?available.length+' registro(s) indexado(s)':'Sem registros indexados nesta fonte'}</span>
     </header>
     <div className="ce-workspace-views" role="tablist" aria-label="Visualizações do submódulo">
       {([['records','Registros',Table2],['form','Formulários',FilePlus2],['reports','Relatórios',BarChart3],['flows','Relacionamentos',Boxes]] as const).map(([key,name,Icon])=><button key={key} type="button" role="tab" aria-selected={mode===key} onClick={()=>setMode(key)}><Icon size={16}/>{name}</button>)}
     </div>
     {mode==='records' && <div className="ce-workspace-panel" role="tabpanel">
       {available.length ? <>
         <div className="ce-workspace-controls">
           <label className="ce-workspace-search"><Search size={16}/><span className="sr-only">Pesquisar registros</span><input type="search" value={search} placeholder="Buscar por título, ID ou tipo" onChange={e=>{setSearch(e.target.value);setLimit(12)}}/></label>
           <label>Estado<select value={status} onChange={e=>{setStatus(e.target.value);setLimit(12)}}><option value="all">Todos</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
           <label>Ordenar<select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Nome</option><option value="id">ID</option><option value="status">Estado</option></select></label>
           <div className="ce-workspace-layout" aria-label="Apresentação dos registros">
             <button type="button" aria-pressed={layout==='cards'} onClick={()=>setLayout('cards')} aria-label="Visualizar cartões"><LayoutGrid size={17}/></button>
             <button type="button" aria-pressed={layout==='table'} onClick={()=>setLayout('table')} aria-label="Visualizar tabela"><Table2 size={17}/></button>
           </div>
         </div>
         <p className="ce-workspace-counter">{filtered.length} de {available.length} registros · dados provenientes dos catálogos versionados</p>
         {layout==='cards'?<div className="ce-workspace-cards">{filtered.slice(0,limit).map(item=><article key={item.id} className="ce-workspace-record"><span className="ce-workspace-record-type">{item.kind}</span><h5>{item.name}</h5><code>{item.id}</code><p>{item.note}</p><span className="ce-workspace-record-status">{item.status}</span>{moduleId==='M08'&&sub==='Calculadoras'&&<button type="button" className="ce-workspace-edit-record" onClick={()=>onEditRecord(item.id)}>Editar metadados</button>}{item.link&&<a href={item.link} className="ce-workspace-link">Consultar página <ChevronRight size={15}/></a>}</article>)}</div>
           :<div className="ce-workspace-table-scroll"><table><thead><tr><th>ID</th><th>Registro</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>{filtered.slice(0,limit).map(item=><tr key={item.id}><td data-label="ID">{item.id}</td><td data-label="Registro">{item.name}</td><td data-label="Tipo">{item.kind}</td><td data-label="Estado">{item.status}</td></tr>)}</tbody></table></div>}
         {filtered.length===0&&<p className="ce-workspace-empty">Nenhum registro corresponde aos filtros.</p>}
         {filtered.length>limit&&<button type="button" className="ce-workspace-more" onClick={()=>setLimit(n=>n+12)}>Mostrar mais registros ({Math.min(limit,filtered.length)} de {filtered.length})</button>}
       </>:<div className="ce-workspace-empty"><ClipboardList size={22}/><strong>Não há coleção canônica consultável para este submódulo.</strong><p>O catálogo de módulos descreve seu escopo, mas não comprova cadastro existente. Não foram fabricados registros ou habilitado CRUD remoto.</p></div>}
       {existing==='command'?<Link to="/central-comando" className="ce-workspace-action">Abrir Central de Comando <ArrowRight size={16}/></Link>
         :existing && !(moduleId==='M08'&&sub==='Calculadoras')&&<button type="button" className="ce-workspace-action" onClick={()=>onOpenExisting(existing)}>Abrir funcionalidade existente de {sub} <ArrowRight size={16}/></button>}
     </div>}
     {mode==='form'&&<div className="ce-workspace-panel" role="tabpanel">{getSubmoduleTemplates(moduleId,sub).length?<AdminSchemaEditor key={moduleId+':'+sub} moduleId={moduleId} submodule={sub} templateKeys={getSubmoduleTemplates(moduleId,sub).map(x=>x.key)}/>:<div className="ce-workspace-empty"><LockKeyhole size={22}/><strong>Sem contrato de formulário específico para {sub}.</strong><p>Não reutilizamos um schema de outra função como se fosse um cadastro homologado. Este submódulo exige dicionário de campos, fontes autorizadas, CRUD, relações e validadores próprios.</p></div>}</div>}
     {mode==='reports'&&<div className="ce-workspace-panel" role="tabpanel">
       <div className="ce-workspace-report-top"><div><span className="ce-workspace-eyebrow">RELATÓRIO DO CATÁLOGO</span><strong>{available.length} registro(s)</strong><p>Apenas contagem dos registros disponíveis nesta versão. Sem análise de conformidade, execução ou datas em tempo real.</p></div><button type="button" disabled={!available.length} onClick={()=>saveCsv(moduleId+'-'+sub.replace(/\W/g,'-'),filtered)}><Download size={17}/> Exportar CSV</button></div>
       {totals.length?totals.map(x=><div className="ce-workspace-report-row" key={x.state}><span>{x.state}</span><div aria-hidden="true"><span style={{width:(x.count/Math.max(1,available.length)*100)+'%'}}/></div><strong>{x.count}</strong></div>):<p className="ce-workspace-empty">Não há métricas reais para este submódulo. Não exibimos valores simulados.</p>}
     </div>}
     {mode==='flows'&&<div className="ce-workspace-panel" role="tabpanel"><p className="ce-workspace-flow-note">Relacionamentos arquiteturais planejados, não integrações executadas. Nenhum vínculo concede permissão de escrita.</p>
       <div className="ce-workspace-flows"><div><h5>Entradas</h5>{module.receives.map(id=><span key={id}>{id} · {getAdminModule(id).title}</span>)}{!module.receives.length&&<p>Sem entrada catalogada.</p>}</div>
       <div><h5>Saídas</h5>{module.sends.map(id=><span key={id}>{id} · {getAdminModule(id).title}</span>)}{!module.sends.length&&<p>Sem saída catalogada.</p>}</div></div>
     </div>}
   </div>
 </section>;
}

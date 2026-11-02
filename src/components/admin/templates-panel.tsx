import {useMemo,useState} from 'react';
import {Eye,Search} from 'lucide-react';
import {templateCatalogo} from '@/lib/template-catalog';
import {templateContracts} from '@/lib/template-contract';
import {AdminReadOnlyDialog} from './admin-readonly-dialog';

/** Read-only catalogue, from the single canonical source; no template CRUD. */
export function TemplatesPanel(){
 const [search,setSearch]=useState('');
 const [situation,setSituation]=useState('all');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const choices=useMemo(()=>Array.from(new Set(templateCatalogo.map(x=>x.situacao))).sort(),[]);
 const visible=useMemo(()=>templateCatalogo.filter(item=>{
  const q=search.trim().toLocaleLowerCase('pt-BR');
  return (situation==='all'||item.situacao===situation)&&(!q||[item.id,item.nome,item.kind,item.materiaPrima].join(' ').toLocaleLowerCase('pt-BR').includes(q));
 }),[search,situation]);
 const selected=templateCatalogo.find(x=>x.id===selectedId);
 return <section className="ce-admin-panel" data-testid="admin-templates" aria-labelledby="ce-admin-templates-title">
  <div className="ce-admin-panel-heading"><div><h2 id="ce-admin-templates-title">Templates canônicos</h2>
   <p>Consulta ao catálogo versionado. Direitos, conteúdo clínico e promoção não são aprovados nesta interface.</p></div></div>
  <div className="ce-admin-filterbar">
   <label className="ce-admin-search" htmlFor="ce-template-search"><Search size={17} aria-hidden="true"/><span className="sr-only">Pesquisar templates</span>
    <input id="ce-template-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome, identificador ou família"/></label>
   <label className="ce-admin-select" htmlFor="ce-template-status"><span className="sr-only">Filtrar situação</span>
    <select id="ce-template-status" value={situation} onChange={e=>setSituation(e.target.value)}><option value="all">Todas as situações</option>
     {choices.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   <button className="ce-admin-btn" type="button" onClick={()=>{setSearch('');setSituation('all')}}>Limpar filtros</button>
  </div>
  <p role="status" aria-live="polite">{visible.length} de {templateCatalogo.length} templates · fonte: template-catalog.ts</p>
  <div className="ce-admin-table-scroll"><table className="ce-admin-table">
   <caption className="sr-only">Templates canônicos, contratos e situação</caption>
   <thead><tr><th scope="col">Template</th><th scope="col">Contrato</th><th scope="col">Origem</th><th scope="col">Situação</th><th scope="col">Detalhes</th></tr></thead>
   <tbody>{visible.map(item=><tr key={item.id}>
    <td data-label="Template"><strong>{item.nome}</strong><small>{item.id}</small></td>
    <td data-label="Contrato">{item.kind}<small>Frame: {item.frame}</small></td>
    <td data-label="Origem">{item.materiaPrima}</td>
    <td data-label="Situação">{item.situacao}<small>{item.url?'Com rota':'Sem página'}</small></td>
    <td data-label="Detalhes"><button className="ce-admin-btn" type="button" onClick={()=>setSelectedId(item.id)}><Eye size={16} aria-hidden="true"/>Ver detalhes de {item.nome}</button></td>
   </tr>)}</tbody></table></div>
  {visible.length===0&&<p className="ce-admin-empty">Nenhum template encontrado para os filtros.</p>}
  <p className="ce-admin-detail-note">Contrato administrativo: hero {templateContracts.area.hero}; breadcrumbs {String(templateContracts.area.crumbs)}. Uma rota não comprova homologação.</p>
  <AdminReadOnlyDialog open={Boolean(selected)} onOpenChange={open=>{if(!open)setSelectedId(null)}} title={selected?.nome??'Detalhes do template'}
    description="Inventário somente leitura, derivado do catálogo canônico.">
   {selected&&<dl><dt>ID</dt><dd><code>{selected.id}</code></dd><dt>Família</dt><dd>{selected.kind}</dd>
     <dt>Frame</dt><dd>{selected.frame}</dd><dt>Fonte declarada</dt><dd>{selected.materiaPrima}</dd>
     <dt>Situação</dt><dd>{selected.situacao}</dd><dt>Página</dt><dd>{selected.url?<a href={selected.url}>Abrir página registrada</a>:'Não há página registrada'}</dd></dl>}
  </AdminReadOnlyDialog>
 </section>;
}

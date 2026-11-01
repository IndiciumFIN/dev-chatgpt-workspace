import {useMemo,useState} from 'react';
import {Eye,Search} from 'lucide-react';
import {tools} from '@/lib/tools/catalog';
import {AdminReadOnlyDialog} from './admin-readonly-dialog';

type Provenance='all'|'identified'|'missing';
/** Source identifiers are declarations, not license or clinical validation. */
export function SourcesPanel(){
 const [search,setSearch]=useState('');
 const [provenance,setProvenance]=useState<Provenance>('all');
 const [selectedSlug,setSelectedSlug]=useState<string|null>(null);
 const visible=useMemo(()=>tools.filter(item=>{
  const q=search.trim().toLocaleLowerCase('pt-BR');
  const identified=Boolean(item.sourceIds?.length);
  const value=[item.slug,item.title,item.status,...(item.sourceIds??[]),...(item.references??[])].join(' ').toLocaleLowerCase('pt-BR');
  return (!q||value.includes(q))&&(provenance==='all'||(provenance==='identified'?identified:!identified));
 }),[search,provenance]);
 const selected=tools.find(x=>x.slug===selectedSlug);
 return <section className="ce-admin-panel" data-testid="admin-sources" aria-labelledby="ce-admin-sources-title">
  <div className="ce-admin-panel-heading"><div><h2 id="ce-admin-sources-title">Fontes e rastreabilidade declarada</h2>
    <p>Identificadores e referências existentes no código; não comprovam licença, vigência ou validação clínica.</p></div></div>
  <div className="ce-admin-filterbar">
   <label className="ce-admin-search" htmlFor="ce-source-search"><Search size={17} aria-hidden="true"/><span className="sr-only">Pesquisar fontes</span>
    <input id="ce-source-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ferramenta, ID ou referência"/></label>
   <label className="ce-admin-select" htmlFor="ce-source-filter"><span className="sr-only">Filtrar identificadores de fonte</span>
    <select id="ce-source-filter" value={provenance} onChange={e=>setProvenance(e.target.value as Provenance)}>
     <option value="all">Todas as ferramentas</option><option value="identified">Com ID de fonte</option><option value="missing">Sem ID de fonte</option>
    </select></label>
   <button className="ce-admin-btn" type="button" onClick={()=>{setSearch('');setProvenance('all')}}>Limpar filtros</button>
  </div>
  <p role="status" aria-live="polite">{visible.length} de {tools.length} instrumentos · fonte: tools/catalog</p>
  <div className="ce-admin-table-scroll"><table className="ce-admin-table">
   <caption className="sr-only">Ferramentas e respectivos identificadores de fonte</caption>
   <thead><tr><th scope="col">Ferramenta</th><th scope="col">Identificadores</th><th scope="col">Referências</th><th scope="col">Situação</th><th scope="col">Detalhes</th></tr></thead>
   <tbody>{visible.map(item=><tr key={item.slug}>
    <td data-label="Ferramenta"><strong>{item.title}</strong><small>{item.slug}</small></td>
    <td data-label="Identificadores">{item.sourceIds?.length?item.sourceIds.map(id=><code key={id} className="ce-admin-source-chip">{id}</code>):'Não declarados'}</td>
    <td data-label="Referências">{item.references?.length??0}</td>
    <td data-label="Situação">{item.status}<small>{item.publicacao}</small></td>
    <td data-label="Detalhes"><button className="ce-admin-btn" type="button" onClick={()=>setSelectedSlug(item.slug)}><Eye size={16} aria-hidden="true"/>Ver detalhes de {item.title}</button></td>
   </tr>)}</tbody>
  </table></div>
  {visible.length===0&&<p className="ce-admin-empty">Nenhum registro encontrado para os filtros.</p>}
  <AdminReadOnlyDialog open={Boolean(selected)} onOpenChange={open=>{if(!open)setSelectedSlug(null)}} title={selected?.title??'Detalhes da fonte'}
   description="Referências declaradas, sem chancela de evidência ou autorização clínica.">
   {selected&&<dl><dt>Slug</dt><dd><code>{selected.slug}</code></dd>
    <dt>Estado</dt><dd>{selected.status}</dd><dt>Publicação declarada</dt><dd>{selected.publicacao}</dd>
    <dt>IDs das fontes</dt><dd>{selected.sourceIds?.length?<ul>{selected.sourceIds.map(id=><li key={id}><code>{id}</code></li>)}</ul>:'Não declarados'}</dd>
    <dt>Referências</dt><dd>{selected.references?.length?<ul>{selected.references.map((x,i)=><li key={i}>{x}</li>)}</ul>:'Não declaradas'}</dd></dl>}
  </AdminReadOnlyDialog>
 </section>;
}

import { Link } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Boxes, CheckCircle2, ChevronRight, Database, Info, Network, Search, ShieldAlert } from 'lucide-react';
import { adminGroups, adminModules, getAdminModule, isAdminModulePreview, type AdminGroupId, type AdminModuleId, type AdminSurface } from '@/lib/admin-module-registry';
import '@/styles/admin-module-directory.css';

type GroupFilter = AdminGroupId|'all';
type OpenLocalSurface = Exclude<AdminSurface,'command'>;
const sortModules=(a:{id:string},b:{id:string})=>a.id.localeCompare(b.id,'pt-BR');

export function AdminModuleDirectory({openSurface}:{openSurface:(surface:OpenLocalSurface)=>void}) {
  const [group,setGroup]=useState<GroupFilter>('G02');
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState<AdminModuleId>('M03');
  const detailRef=useRef<HTMLElement>(null);
  const visible=useMemo(()=>{
    const term=query.trim().toLocaleLowerCase('pt-BR');
    return adminModules.filter(item=>(group==='all'||item.group===group)&&(
      term.length===0||[item.id,item.title,item.purpose,...item.submodules].join(' ').toLocaleLowerCase('pt-BR').includes(term)
    )).sort(sortModules);
  },[group,query]);
  const selected=visible.find(item=>item.id===selectedId)??visible[0];
  const selectedGroup=selected?adminGroups.find(item=>item.id===selected.group):undefined;
  const available=adminModules.filter(isAdminModulePreview).length;
  function changeModule(id:AdminModuleId) {
    const item=getAdminModule(id);
    setGroup(item.group);
    setQuery('');
    setSelectedId(id);
    window.requestAnimationFrame(()=>detailRef.current?.focus({preventScroll:false}));
  }
  return <section className="ce-modules" aria-labelledby="ce-modules-title">
    <div className="ce-modules-head">
      <div><span className="ce-modules-eyebrow">ARQUITETURA ADMINISTRATIVA · CATÁLOGO FUNCIONAL</span><h3 id="ce-modules-title">Macrogrupos e módulos</h3>
        <p>Explore os vínculos, responsabilidades e submódulos planejados. O catálogo não cria tabelas nem habilita sistemas.</p>
      </div>
      <span className="ce-modules-readonly"><Info size={16} aria-hidden="true"/> Visão de planejamento</span>
    </div>

    <div className="ce-modules-kpis" aria-label="Resumo do escopo planejado">
      <div><Network aria-hidden="true" size={18}/><strong>{adminGroups.length}</strong><span>Macrogrupos</span></div>
      <div><Boxes aria-hidden="true" size={18}/><strong>{adminModules.length}</strong><span>Módulos definidos</span></div>
      <div><CheckCircle2 aria-hidden="true" size={18}/><strong>{available}</strong><span>Com prévia parcial</span></div>
    </div>

    <div className="ce-modules-filters">
      <label htmlFor="ce-modules-group">Macrogrupo
        <select id="ce-modules-group" value={group} onChange={event=>setGroup(event.target.value as GroupFilter)}>
          <option value="all">Todos os macrogrupos</option>
          {adminGroups.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
        </select>
      </label>
      <label htmlFor="ce-modules-search">Localizar módulo ou submódulo
        <span className="ce-modules-searchbox"><Search size={17} aria-hidden="true"/><input id="ce-modules-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ex.: governança clínica, validação, agentes"/></span>
      </label>
    </div>
    {group!=='all' && <p className="ce-modules-filter-hint">{adminGroups.find(x=>x.id===group)?.description}</p>}

    <div className="ce-modules-grid">
      <div className="ce-modules-list" role="group" aria-label="Seleção de módulos">
        <div className="ce-modules-list-meta"><strong>{visible.length} módulo(s)</strong><span>Selecione para detalhar</span></div>
        {visible.map(item=><button key={item.id} type="button" className={'ce-module-option'+(selected?.id===item.id?' is-current':'')}
          aria-pressed={selected?.id===item.id} aria-controls="ce-module-detail"
          onClick={()=>changeModule(item.id)}>
          <span className="ce-module-id">{item.id}</span>
          <span className="ce-module-summary"><strong>{item.title}</strong><small>{item.purpose}</small>
            {item.surface && <em>Prévia parcial disponível</em>}
          </span>
          <ChevronRight size={18} aria-hidden="true"/>
        </button>)}
        {visible.length===0 && <div className="ce-modules-empty">Nenhum módulo atende à pesquisa neste macrogrupo. Selecione outro filtro.</div>}
      </div>
      <section className="ce-module-detail" ref={detailRef} id="ce-module-detail" tabIndex={-1} aria-label="Detalhamento do módulo selecionado">
        {selected ? <>
          <div className="ce-module-detail-top">
            <div><span className="ce-modules-eyebrow">{selected.group} · {selectedGroup?.title}</span><h4>{selected.id} — {selected.title}</h4></div>
            <span className={'ce-module-status'+(selected.surface?' is-partial':'')}>{selected.surface?'Prévia parcial':'Planejado'}</span>
          </div>
          <p className="ce-module-purpose">{selected.purpose}</p>
          <div className="ce-module-scope"><ShieldAlert size={17} aria-hidden="true"/><span>{selected.previewScope??'Módulo documentado na arquitetura, sem tela operacional ou backend integrado nesta prévia.'}</span></div>
          <h5>Submódulos</h5>
          <ul className="ce-module-submodules">{selected.submodules.map(text=><li key={text}><CheckCircle2 size={16} aria-hidden="true"/>{text}</li>)}</ul>
          <h5>Fluxo de informações entre módulos</h5>
          <div className="ce-module-flows">
            <div><div className="ce-module-flow-head"><Database size={16} aria-hidden="true"/> Recebe dados e eventos de</div>
              <div className="ce-module-flow-refs">{selected.receives.length?selected.receives.map(id=><button type="button" key={id} onClick={()=>changeModule(id)} title={'Abrir '+getAdminModule(id).title}>{id} · {getAdminModule(id).title}</button>):<span>Sem relação registrada neste estágio</span>}</div>
            </div>
            <div><div className="ce-module-flow-head"><ArrowRight size={16} aria-hidden="true"/> Encaminha informações para</div>
              <div className="ce-module-flow-refs">{selected.sends.length?selected.sends.map(id=><button type="button" key={id} onClick={()=>changeModule(id)} title={'Abrir '+getAdminModule(id).title}>{id} · {getAdminModule(id).title}</button>):<span>Sem relação registrada neste estágio</span>}</div>
            </div>
          </div>
          <div className="ce-module-detail-actions">
            {selected.surface==='command'?<Link to="/central-comando" className="ce-module-open">Abrir prévia da Central <ArrowUpRight size={16} aria-hidden="true"/></Link>:
              selected.surface?<button type="button" className="ce-module-open" onClick={()=>openSurface(selected.surface as OpenLocalSurface)}>Abrir prévia parcial <ArrowUpRight size={16} aria-hidden="true"/></button>:
                <p className="ce-module-no-action">Operação indisponível: sem contratos de execução e homologação aplicáveis.</p>}
          </div>
        </>:<div className="ce-modules-empty">Selecione um módulo para visualizar suas responsabilidades e relações.</div>}
      </section>
    </div>
    <p className="ce-modules-footer">Relações conceituais, não mensagens executadas. O Kernel, o PMO, as políticas e os controles permanecem em suas fontes de autoridade; nenhuma alteração é realizada por este catálogo.</p>
  </section>;
}

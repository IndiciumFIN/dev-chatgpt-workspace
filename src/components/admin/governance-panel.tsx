import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpenCheck, ChevronDown, ClipboardList, FileWarning, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import findRegistry from '../../../registers/governance/find-register.v1.json';
import standardsRegistry from '../../../registers/governance/transversal-standards-candidates.v1.json';
import '@/styles/admin-governance.css';

type View = 'finds'|'norms';
type Find = {canonical_id:string;severity:string;status:string;fact:string;updated_at:string;evidence_refs?:string[];blocking_policy_refs?:string[];mutation_allowed?:boolean;work_order?:string};
type Norm = {id:string;name:string;authority:string;edition:string;family:string;applicability:string;complianceStatus:string;kernelAdmission:string;officialMetadataUrl:string;textLicensedOrVerified:boolean;sourceEvidence:string};
const findings = findRegistry.finds as Find[];
const normatives = standardsRegistry.standards as Norm[];
const severityOrder = ['CRITICAL','HIGH','MEDIUM','LOW'];
const readLabel=(s:string)=>({CANDIDATE:'Candidato',DRAFT_FOR_GOVERNED_REVIEW:'Revisão governada pendente',TO_ASSESS:'A avaliar',NOT_ASSESSED:'Não avaliado',NOT_ADMITTED:'Não admitido'} as Record<string,string>)[s]??s;

export function GovernancePanel() {
  const [view,setView]=useState<View>('finds');
  const [search,setSearch]=useState('');
  const [severity,setSeverity]=useState('all');
  const [limit,setLimit]=useState(8);
  const findingsFiltered=useMemo(()=>findings.filter(item=>(severity==='all'||item.severity===severity)&&[item.canonical_id,item.fact,item.status].join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())).sort((a,b)=>severityOrder.indexOf(a.severity)-severityOrder.indexOf(b.severity)),[search,severity]);
  const normFiltered=useMemo(()=>normatives.filter(item=>[item.id,item.name,item.edition,item.family].join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())),[search]);
  const relevant=view==='finds'?findingsFiltered.length:normFiltered.length;
  return <section className="ce-gov" aria-labelledby="ce-gov-title">
    <div className="ce-gov-heading">
      <div><span className="ce-modules-eyebrow">CONTROLES · SOMENTE LEITURA</span><h3 id="ce-gov-title">Governança e evidências</h3><p>Registros versionados no GitHub. Inspecionar um achado ou normativo não concede autorização para alteração.</p></div>
      <span className="ce-gov-chip"><ShieldCheck size={16} aria-hidden="true"/> Consulta isolada</span>
    </div>
    <div className="ce-gov-metrics">
      <div><FileWarning size={18} aria-hidden="true"/><strong>{findings.length}</strong><span>FINDs registrados</span></div>
      <div><ShieldAlert size={18} aria-hidden="true"/><strong>{findings.filter(x=>x.severity==='CRITICAL'||x.severity==='HIGH').length}</strong><span>Críticos / altos</span></div>
      <div><BookOpenCheck size={18} aria-hidden="true"/><strong>{normatives.length}</strong><span>Normas candidatas</span></div>
      <div><ClipboardList size={18} aria-hidden="true"/><strong>{standardsRegistry.summary.complianceAssessed}</strong><span>Conformidade avaliada</span></div>
    </div>
    <div className="ce-gov-warning" role="note"><AlertTriangle size={19} aria-hidden="true"/><div><strong>Sem admissão ou conformidade presumida.</strong>
      <p>As normas listadas são candidatas, em grande parte com metadados públicos. Não representam texto integral licenciado, análise de cláusulas, aprovação clínica ou implantação no Kernel.</p></div></div>
    <div className="ce-gov-controls">
      <div role="tablist" aria-label="Tipo de registro">
        <button type="button" role="tab" aria-selected={view==='finds'} onClick={()=>{setView('finds');setLimit(8);setSearch('')}}><FileWarning size={16}/> Achados</button>
        <button type="button" role="tab" aria-selected={view==='norms'} onClick={()=>{setView('norms');setLimit(8);setSearch('')}}><BookOpenCheck size={16}/> Normativos</button>
      </div>
      <label htmlFor="ce-gov-search">Pesquisar registro
        <span><Search size={17} aria-hidden="true"/><input type="search" id="ce-gov-search" value={search} onChange={event=>{setSearch(event.target.value);setLimit(8)}} placeholder={view==='finds'?'ID, evidência ou descrição':'Norma, edição ou família'}/></span>
      </label>
      {view==='finds'&&<label htmlFor="ce-gov-severity">Severidade
        <select id="ce-gov-severity" value={severity} onChange={event=>{setSeverity(event.target.value);setLimit(8)}}><option value="all">Todas</option>{severityOrder.map(value=><option key={value} value={value}>{value}</option>)}</select>
      </label>}
    </div>
    <div className="ce-gov-list-heading"><strong>{relevant} registro(s) encontrado(s)</strong><span>Snapshot: {view==='finds'?findRegistry.as_of:standardsRegistry.asOf}</span></div>
    <div className="ce-gov-list" role="tabpanel">
      {view==='finds'&&findingsFiltered.slice(0,limit).map(item=><details key={item.canonical_id} className="ce-gov-item">
        <summary><span className="ce-gov-id">{item.canonical_id}</span><span className="ce-gov-item-meta"><strong>{item.severity}</strong><small>{readLabel(item.status)}</small></span><ChevronDown size={19} aria-hidden="true"/></summary>
        <div className="ce-gov-item-content"><p>{item.fact}</p>
          <dl><div><dt>Atualizado</dt><dd>{item.updated_at}</dd></div><div><dt>Políticas relacionadas</dt><dd>{item.blocking_policy_refs?.join(', ')||'Sem referência explícita'}</dd></div><div><dt>Autorização de mutação</dt><dd>{item.mutation_allowed===true?'Declarada no registro, sujeita a gates':'Não comprovada'}</dd></div></dl>
          <strong>Evidências referenciadas</strong><ul>{(item.evidence_refs??[]).slice(0,8).map((ref,i)=><li key={i}><code>{ref}</code></li>)}</ul>
        </div>
      </details>)}
      {view==='norms'&&normFiltered.slice(0,limit).map(item=><details key={item.id} className="ce-gov-item">
        <summary><span className="ce-gov-id">{item.id} · {item.authority} {item.edition}</span><span className="ce-gov-item-meta"><strong>{item.name}</strong><small>{readLabel(item.applicability)}</small></span><ChevronDown size={19} aria-hidden="true"/></summary>
        <div className="ce-gov-item-content"><dl>
          <div><dt>Família</dt><dd>{item.family}</dd></div>
          <div><dt>Avaliação</dt><dd>{readLabel(item.complianceStatus)}</dd></div>
          <div><dt>Admissão no Kernel</dt><dd>{readLabel(item.kernelAdmission)}</dd></div>
          <div><dt>Texto normativo licenciado/verificado</dt><dd>{item.textLicensedOrVerified?'Declarado como verificado':'Não'}</dd></div>
          <div><dt>Evidência</dt><dd>{item.sourceEvidence}</dd></div>
        </dl>
          <a href={item.officialMetadataUrl} rel="noopener noreferrer" target="_blank">Consultar referência de metadados oficiais</a>
        </div>
      </details>)}
      {relevant===0&&<p className="ce-gov-empty">Nenhum registro corresponde aos filtros.</p>}
    </div>
    {relevant>limit&&<button className="ce-gov-more" type="button" onClick={()=>setLimit(n=>n+8)}>Mostrar mais 8 ({Math.min(limit,relevant)} de {relevant})</button>}
    <p className="ce-gov-footer">Fonte: <code>registers/governance/find-register.v1.json</code> e <code>registers/governance/transversal-standards-candidates.v1.json</code>. Estado datado, sem sincronização em tempo real.</p>
  </section>;
}

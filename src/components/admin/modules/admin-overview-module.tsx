import {ArrowUpRight,BookOpenCheck,ChevronRight,Eye,FileClock,Layers3} from 'lucide-react';
import {type ReactNode} from 'react';
import {templateCatalogo} from '@/lib/template-catalog';
import {type LocalWorkbench} from '@/lib/local-workbench-store';

type Props={
 model:LocalWorkbench;
 published:LocalWorkbench;
 revision:number;
 onOpenContent:()=>void;
 onOpenSources:()=>void;
 onSelectPublished:(slug:string)=>void;
};
function Metric({label,value,note,icon:Icon}:{
 label:string;value:number;note:string;icon:typeof BookOpenCheck
}){
 return <div className="ce-admin-stat"><span className="ce-admin-stat-icon"><Icon size={19} aria-hidden="true"/></span>
 <span className="ce-admin-stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div>;
}
function Section({title,subtitle,children}:{
 title:string;subtitle:string;children:ReactNode
}){
 return <section className="ce-admin-panel"><div className="ce-admin-panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section>;
}
/** Registry-backed overview, independent from the local publication editor state machine. */
export function AdminOverviewModule({model,published,revision,onOpenContent,onOpenSources,onSelectPublished}:Props){
 const publishedTools=published.tools.filter(x=>x.published);
 const noPage=templateCatalogo.filter(x=>x.url===null);
 return <>
  <div className="ce-admin-stats">
   <Metric label="Instrumentos" value={model.tools.length} note="Catálogo existente" icon={BookOpenCheck}/>
   <Metric label="Publicados aqui" value={publishedTools.length} note="Projeção do navegador" icon={Eye}/>
   <Metric label="Templates" value={templateCatalogo.length} note={noPage.length+' ainda sem página'} icon={Layers3}/>
   <Metric label="Revisões" value={revision} note="Histórico local" icon={FileClock}/>
  </div>
  <Section title="Sua próxima ação" subtitle="Trabalhe por etapas, sem precisar abrir dezenas de campos.">
   <div className="ce-admin-next">
    <div><h3>1. Revise o conteúdo existente</h3><p>Selecione um instrumento, ajuste somente os metadados editoriais e compare o rascunho com a visão de quem acessa o site.</p>
     <button className="ce-admin-btn ce-admin-btn--primary" type="button" onClick={onOpenContent}>Abrir editor <ChevronRight size={16}/></button></div>
    <div><h3>2. Verifique os contratos</h3><p>Confira templates, fontes identificadas e pendências. Conteúdo clínico depende de revisão qualificada e autorização.</p>
     <button className="ce-admin-btn" type="button" onClick={onOpenSources}>Conferir fontes <ChevronRight size={16}/></button></div>
   </div>
  </Section>
  <Section title="Visão do usuário final" subtitle="Cartões derivados da projeção local; não simulam o cálculo de cada instrumento.">
   <div className="ce-admin-cards">
    {publishedTools.slice(0,4).map(item=><button className="ce-admin-consumer-card" type="button" key={item.slug} onClick={()=>onSelectPublished(item.slug)}>
      <span className="ce-admin-card-kicker">Instrumento · {item.slug}</span>
      <strong>{item.title}</strong><span>{item.lead}</span><span className="ce-admin-card-link">Ver e editar <ArrowUpRight size={14}/></span>
    </button>)}
    {publishedTools.length===0&&<p>Nenhum instrumento está habilitado na projeção deste navegador.</p>}
   </div>
  </Section>
 </>;
}

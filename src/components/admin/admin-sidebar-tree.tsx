import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, LockKeyhole, Network, ShieldCheck } from 'lucide-react';
import { adminGroups, adminModules, getAdminModule, type AdminGroupId, type AdminModuleId } from '@/lib/admin-module-registry';
import { AdminSchemaEditor } from '@/components/admin/admin-schema-editor';
import '@/styles/admin-hierarchy.css';

type Props={selectedId:AdminModuleId;onSelect:(id:AdminModuleId)=>void;onOverview:()=>void;overviewActive:boolean;idPrefix:'desktop'|'mobile'};

export function AdminSidebarTree({selectedId,onSelect,onOverview,overviewActive,idPrefix}:Props){
  const currentGroup=getAdminModule(selectedId).group;
  const [openGroups,setOpenGroups]=useState<AdminGroupId[]>([currentGroup]);
  useEffect(()=>setOpenGroups(old=>old.includes(currentGroup)?old:[...old,currentGroup]),[currentGroup]);
  return <nav className="ce-admin-tree" aria-label={idPrefix==='desktop'?'Módulos da administração':'Módulos da administração — mobile'}>
    <button className="ce-admin-tree-overview" type="button" aria-current={overviewActive?'page':undefined} onClick={onOverview}>Visão geral <span>Painel global</span></button>
    <div className="ce-admin-tree-heading"><Network size={16} aria-hidden="true"/><strong>MACROGRUPOS</strong><span>7 áreas · 21 módulos</span></div>
    {adminGroups.map(group=>{
      const items=adminModules.filter(item=>item.group===group.id).sort((a,b)=>a.id.localeCompare(b.id));
      const expanded=openGroups.includes(group.id);
      const childId='ce-nav-'+idPrefix+'-'+group.id;
      return <section key={group.id} data-admin-group={group.id} className={'ce-admin-tree-group'+(group.id===currentGroup?' is-active':'')}>
        <h3><button type="button" className="ce-admin-tree-group-button" aria-controls={childId} aria-expanded={expanded} onClick={()=>setOpenGroups(old=>expanded?old.filter(id=>id!==group.id):[...old,group.id])}>
          <span className="ce-admin-tree-group-number">{group.id.slice(1)}</span>
          <span className="ce-admin-tree-group-title">{group.title}<small>{items.length} módulos</small></span>
          <ChevronDown size={16} aria-hidden="true"/>
        </button></h3>
        {expanded && <div id={childId} className="ce-admin-tree-children">
          {items.map(module=>{
            const isActive=selectedId===module.id;
            const contents=<><span className="ce-admin-tree-module-number">{module.id}</span>
              <span className="ce-admin-tree-module-name">{module.title}</span>
              {module.surface?<span className="ce-admin-tree-available" title="Prévia parcial disponível"><span className="sr-only">Prévia parcial</span></span>:null}
              <ChevronRight size={14} aria-hidden="true"/></>;
            return module.surface==='command'
              ? <Link key={module.id} to="/central-comando" className="ce-admin-tree-module" onClick={()=>onSelect(module.id)}>{contents}</Link>
              : <button key={module.id} type="button" data-admin-module={module.id} aria-current={isActive?'page':undefined} className={'ce-admin-tree-module'+(isActive?' is-selected':'')} onClick={()=>onSelect(module.id)}>{contents}</button>;
          })}
        </div>}
      </section>;
    })}
    <div className="ce-admin-tree-foot"><ShieldCheck size={16} aria-hidden="true"/><span>Prévias e módulos planejados seguem políticas e gates de homologação.</span></div>
  </nav>;
}

export function AdminModuleFallback({moduleId}:{moduleId:AdminModuleId}){
  const module=getAdminModule(moduleId);
  const group=adminGroups.find(g=>g.id===module.group);
  return <section className="ce-admin-module-fallback" aria-labelledby="ce-module-fallback-title">
    <p className="ce-admin-module-eyebrow">{module.group} · {group?.title} / {module.id}</p>
    <h3 id="ce-module-fallback-title">{module.title}</h3>
    <p>{module.purpose}</p>
    <div className="ce-admin-module-hold"><LockKeyhole size={19} aria-hidden="true"/><div><strong>Módulo definido, operação não implementada.</strong>
      <p>Não há acesso a backend, gravação de dados, homologação de controles nem permissão para execução nesta prévia.</p></div></div>
    <h4>Submódulos previstos</h4>
    <ul className="ce-admin-module-submodules">{module.submodules.map(name=><li key={name}>{name}</li>)}</ul>
    <h4>Integrações previstas</h4>
    <div className="ce-admin-module-edges">
      <div><strong>Recebe informações de</strong>{module.receives.length?<ul>{module.receives.map(id=><li key={id}>{id} · {getAdminModule(id).title}</li>)}</ul>:<p>Não identificado</p>}</div>
      <div><strong>Encaminha informações para</strong>{module.sends.length?<ul>{module.sends.map(id=><li key={id}>{id} · {getAdminModule(id).title}</li>)}</ul>:<p>Não identificado</p>}</div>
    </div>
    <p className="ce-admin-module-note">Fluxos documentais propostos: não correspondem a integrações executadas. Consulte as políticas e o PMO antes de promover qualquer implementação.</p>
    <AdminSchemaEditor key={moduleId} moduleId={moduleId}/>
  </section>;
}

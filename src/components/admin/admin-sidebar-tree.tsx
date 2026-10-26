import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { adminGroups, adminModules, getAdminModule, type AdminGroupId, type AdminModuleId } from '@/lib/admin-module-registry';
import '@/styles/admin-hierarchy.css';

type Props={selectedId:AdminModuleId;onSelect:(id:AdminModuleId)=>void;onOverview:()=>void;overviewActive:boolean;idPrefix:'desktop'|'mobile'};

export function AdminSidebarTree({selectedId,onSelect,onOverview,overviewActive,idPrefix}:Props){
  const currentGroup=getAdminModule(selectedId).group;
  const [openGroups,setOpenGroups]=useState<AdminGroupId[]>([currentGroup]);
  useEffect(()=>setOpenGroups(old=>old.includes(currentGroup)?old:[...old,currentGroup]),[currentGroup]);
  return <nav className="ce-admin-tree" aria-label={idPrefix==='desktop'?'Módulos da administração':'Módulos da administração — mobile'}>
    <button className="ce-admin-tree-overview" type="button" aria-current={overviewActive?'page':undefined} onClick={onOverview}>Visão geral</button>
    {adminGroups.map(group=>{
      const items=adminModules.filter(item=>item.group===group.id).sort((a,b)=>a.id.localeCompare(b.id));
      const expanded=openGroups.includes(group.id);
      const childId='ce-nav-'+idPrefix+'-'+group.id;
      return <section key={group.id} data-admin-group={group.id} className={'ce-admin-tree-group'+(group.id===currentGroup?' is-active':'')}>
        <h3><button type="button" className="ce-admin-tree-group-button" aria-controls={childId} aria-expanded={expanded} onClick={()=>setOpenGroups(old=>expanded?old.filter(id=>id!==group.id):[...old,group.id])}>
          <span className="ce-admin-tree-group-title">{group.title}</span>
          <ChevronDown size={16} aria-hidden="true"/>
        </button></h3>
        {expanded && <div id={childId} className="ce-admin-tree-children">
          {items.map(module=>{
            const isActive=selectedId===module.id;
            const contents=<><span className="ce-admin-tree-module-name">{module.title}</span><ChevronRight size={14} aria-hidden="true"/></>;
            return module.surface==='command'
              ? <Link key={module.id} to="/central-comando" className="ce-admin-tree-module" onClick={()=>onSelect(module.id)}>{contents}</Link>
              : <button key={module.id} type="button" data-admin-module={module.id} aria-current={isActive?'page':undefined} className={'ce-admin-tree-module'+(isActive?' is-selected':'')} onClick={()=>onSelect(module.id)}>{contents}</button>;
          })}
        </div>}
      </section>;
    })}
  </nav>;
}

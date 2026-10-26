import { Status } from "@/components/admin/admin-layout";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminModule, type AdminModuleId, type AdminPick } from "@/lib/admin-catalog";

export function ModuleDirectory({ onOpen }: { onOpen: (id: AdminPick) => void }) {
  const live = adminModules.filter((item) => item.desk).length;
  return (
    <section className="mod-board" aria-label="Catálogo dos módulos">
      <p className="tool-help">A branch de auditoria repetia quatro abas em todo módulo. Aqui cada código abre só a mesa que existe. {live} de {adminModules.length} têm mesa. O restante fica planejado, sem registro inventado.</p>
      <div className="kpi-strip" aria-label="Resumo">
        <p className="kpi"><span>Macrogrupos</span><b>{adminGroups.length}</b></p>
        <p className="kpi"><span>Módulos</span><b>{adminModules.length}</b></p>
        <p className="kpi"><span>Com mesa</span><b>{live}</b></p>
        <p className="kpi"><span>Planejados</span><b>{adminModules.length - live}</b></p>
      </div>
      {adminGroups.map((group) => (
        <section key={group.id} aria-labelledby={`grupo-${group.id}`}>
          <h3 id={`grupo-${group.id}`}>{group.id} · {group.title}</h3>
          <p className="tool-help">{group.description}</p>
          <div className="mod-grid">
            {adminModules.filter((item) => item.group === group.id).map((item) => (
              <button key={item.id} type="button" className="mod-card" onClick={() => onOpen(item.id)}>
                <b>{item.id} · {item.title}</b>
                <span>{item.purpose}</span>
                <Status value={item.desk ? "Na mesa" : "Planejado"} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

export function PlannedModule({ module, onOpen }: { module: AdminModule; onOpen: (id: AdminModuleId) => void }) {
  const group = adminGroup(module.group);
  return (
    <section className="mod-board" aria-label={module.title}>
      <p className="next-act">{module.screen}</p>
      <h3>Submódulos</h3>
      <ul className="cmd-list">{module.submodules.map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="gov-split">
        <div>
          <h3>Recebe</h3>
          <Flow ids={module.receives} onOpen={onOpen} />
        </div>
        <div>
          <h3>Encaminha</h3>
          <Flow ids={module.sends} onOpen={onOpen} />
        </div>
      </div>
      <p className="tool-help">{group.title}. Relação de catálogo, não uma chamada executada.</p>
    </section>
  );
}

function Flow({ ids, onOpen }: { ids: readonly AdminModuleId[]; onOpen: (id: AdminModuleId) => void }) {
  if (!ids.length) return <p className="tool-help">Nenhum módulo ligado.</p>;
  return (
    <div className="cmd-actions">
      {ids.map((id) => {
        const item = adminModule(id);
        return <button key={id} className="btn-ghost btn-sm" type="button" onClick={() => onOpen(id)}>{id} · {item.title}</button>;
      })}
    </div>
  );
}

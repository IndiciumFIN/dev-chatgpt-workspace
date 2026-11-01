import { Status } from "@/components/admin/admin-layout";
import { Panel } from "@/components/tools/interface";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminModule, type AdminModuleId, type AdminPick } from "@/lib/admin-catalog";

export function ModuleDirectory({ onOpen }: { onOpen: (id: AdminPick) => void }) {
  const live = adminModules.filter((item) => item.desk || item.ops || item.orders).length;
  return (
    <div>
      <ul className="admin-counts" aria-label="Resumo">
        <li><span>Macrogrupos</span><b>{adminGroups.length}</b></li>
        <li><span>Módulos</span><b>{adminModules.length}</b></li>
        <li><span>Com mesa</span><b>{live}</b></li>
      </ul>
      {adminGroups.map((group) => (
        <section key={group.id} aria-labelledby={`grupo-${group.id}`}>
          <h2 id={`grupo-${group.id}`} className="admin-group">{group.title}</h2>
          <p className="admin-lead">{group.description}</p>
          <div className="mod-grid">
            {adminModules.filter((item) => item.group === group.id).map((item) => (
              <button key={item.id} type="button" className="mod-card" onClick={() => onOpen(item.id)}>
                <span>{item.title}</span>
                <Status value={item.desk || item.ops || item.orders ? "Na mesa" : "Planejado"} />
                <span>{item.purpose}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PlannedModule({ module, onOpen }: { module: AdminModule; onOpen: (id: AdminModuleId) => void }) {
  const group = adminGroup(module.group);
  return (
    <section className="mod-board" aria-label={module.title}>
      <p className="next-act">{module.screen}</p>
      <Panel title="Submódulos" note={<p className="tool-help">Não há coleção consultável. Os nomes são escopo do catálogo, não registros.</p>}>
        <ul className="cmd-list">{module.submodules.map((item) => <li key={item}>{item}</li>)}</ul>
      </Panel>
      <div className="gov-split">
        <Panel title="Recebe"><Flow ids={module.receives} onOpen={onOpen} /></Panel>
        <Panel title="Encaminha"><Flow ids={module.sends} onOpen={onOpen} /></Panel>
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

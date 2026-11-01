import { Status } from "@/components/admin/admin-layout";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminModule, type AdminModuleId, type AdminPick } from "@/lib/admin-catalog";

export function ModuleDirectory({ onOpen }: { onOpen: (id: AdminPick) => void }) {
  const live = adminModules.filter((item) => item.desk || item.ops || item.orders).length;
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Resumo">
        <Kpi title="Macrogrupos" value={String(adminGroups.length)} hint="Os sete grupos da mesa" />
        <Kpi title="Módulos" value={String(adminModules.length)} hint="Um cartão por atividade" />
        <Kpi title="Com mesa" value={String(live)} hint="Leem ou gravam o banco" />
      </section>
      {adminGroups.map((group) => (
        <section key={group.id} aria-labelledby={`grupo-${group.id}`}>
          <h2 id={`grupo-${group.id}`} className="mb-3 text-lg font-medium text-ink">{group.title}</h2>
          <p className="mb-3 text-sm text-muted">{group.description}</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {adminModules.filter((item) => item.group === group.id).map((item) => (
              <button key={item.id} type="button" className="rounded-lg border border-line bg-paper p-4 text-left hover:border-navy" onClick={() => onOpen(item.id)}>
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium text-ink">{item.title}</span>
                  <Status value={item.desk || item.ops || item.orders ? "Na mesa" : "Planejado"} />
                </span>
                <span className="mt-1 block text-sm text-muted">{item.purpose}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="text-xs tracking-wide text-muted uppercase">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
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

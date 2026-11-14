import type { ReactNode } from "react";
import { adminContract, type AdminRegion } from "@/lib/admin-contract";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminPick } from "@/lib/admin-catalog";
import { statusTone, type DeskModule } from "@/lib/normative-desk";

export function Status({ value }: { value: string }) {
  const tone = statusTone(value);
  const color = tone === "ok" ? "text-ok" : tone === "stop" ? "text-danger" : tone === "wait" ? "text-warn" : "text-muted";
  return <span className={`inline-flex items-center rounded-md border border-line bg-canvas px-2 py-1 text-xs font-medium whitespace-nowrap ${color}`}>{value}</span>;
}

export function RecordToolbar({
  search,
  onSearch,
  searchLabel,
  filters = [],
  sort,
  sorts,
  onSort,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchLabel: string;
  filters?: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }[];
  sort: string;
  sorts: { value: string; label: string }[];
  onSort: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-paper p-3 md:flex-row md:items-end">
      <label className="field min-w-0 flex-1">
        <span className="sr-only">{searchLabel}</span>
        <input type="search" value={search} placeholder={searchLabel} aria-label={searchLabel} onChange={(event) => onSearch(event.target.value)} />
      </label>
      {filters.map((filter) => (
        <label key={filter.id} className="field w-full md:w-48">
          <span className="sr-only">{filter.label}</span>
          <select aria-label={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
            {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
      <label className="field w-full md:w-40">
        <span className="sr-only">Ordenar</span>
        <select aria-label="Ordenar" value={sort} onChange={(event) => onSort(event.target.value)}>
          {sorts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>
  );
}

export function ModuleFrame({
  id,
  toolbar,
  list,
  detail,
  form,
}: {
  id: DeskModule | "registro";
  toolbar?: ReactNode;
  list: ReactNode;
  detail?: ReactNode;
  form?: ReactNode;
}) {
  const contract: { layout: "central" | "registro"; regions: readonly AdminRegion[] } = id === "registro"
    ? { layout: "registro", regions: ["toolbar", "list", "form"] }
    : adminContract(id);
  if (contract.layout === "central") return <>{list}</>;
  const show = (region: AdminRegion, node: ReactNode) => (contract.regions.includes(region) ? node : null);
  return (
    <section className="admin-module" data-module={id}>
      {show("toolbar", toolbar)}
      <div className={contract.regions.includes("detail") ? "gov-split" : undefined}>
        <div>{list}</div>
        {show("detail", <aside className="gov-detail" aria-label="Detalhe">{detail ?? <p className="tool-help">Selecione um registro.</p>}</aside>)}
      </div>
      {show("form", form)}
    </section>
  );
}

export function AdminShell({
  selection,
  onSelect,
  error,
  ready,
  children,
}: {
  selection: AdminPick;
  onSelect: (id: AdminPick) => void;
  error: string;
  ready: boolean;
  children: ReactNode;
}) {
  const current = selection === "overview" ? null : adminModule(selection);
  const group = current ? adminGroup(current.group) : null;
  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-lg border border-line bg-paper md:flex-row">
      <aside className="flex flex-col border-b border-line md:w-56 md:border-r md:border-b-0">
        <div className="border-b border-line p-4">
          <p className="font-semibold text-ink">Admin</p>
          <p className="text-xs text-muted">Calculadoras de Enfermagem</p>
        </div>
        <nav className="max-h-64 flex-1 space-y-1 overflow-auto p-2 md:max-h-[calc(100vh-180px)]" aria-label="Administração">
          <NavButton current={selection === "overview"} onClick={() => onSelect("overview")}>Visão geral</NavButton>
          {adminGroups.map((item) => (
            <div key={item.id} className="pt-2">
              <p className="px-3 py-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{item.title}</p>
              {adminModules.filter((module) => module.group === item.id).map((module) => (
                <NavButton key={module.id} current={selection === module.id} onClick={() => onSelect(module.id)}>
                  {module.title}
                </NavButton>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-wide text-navy uppercase">{group ? group.title : "Painel"}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{current ? current.title : "Visão geral"}</h1>
          <p className="mt-1 text-sm text-muted">{current ? current.purpose : "Conteúdo canônico desta mesa. Cada módulo abre o que o banco já guarda."}</p>
          {current ? <p className="mt-2 text-sm text-slate">{current.screen}</p> : null}
        </header>
        {error ? <p className="err">{error}</p> : null}
        {!ready ? <p className="text-sm text-muted">Lendo o banco…</p> : children}
      </main>
    </div>
  );
}

function NavButton({ current, onClick, children }: { current: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-current={current ? "page" : undefined}
      className={`block w-full rounded px-3 py-2 text-left text-sm ${current ? "bg-navy font-medium text-white" : "text-ink hover:bg-canvas"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

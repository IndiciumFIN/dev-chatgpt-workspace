import type { ReactNode } from "react";
import { adminContract, type AdminRegion } from "@/lib/admin-contract";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminPick } from "@/lib/admin-catalog";
import { statusTone, type DeskModule } from "@/lib/normative-desk";

export function Status({ value }: { value: string }) {
  return <span className={`status-${statusTone(value)}`}>{value}</span>;
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
    <div className="admin-toolbar">
      <label className="field">{searchLabel}
        <input className="admin-search" type="search" value={search} onChange={(event) => onSearch(event.target.value)} />
      </label>
      {filters.map((filter) => (
        <label key={filter.id} className="field">{filter.label}
          <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
            {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
      <label className="field">Ordenar
        <select value={sort} onChange={(event) => onSort(event.target.value)}>
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
  id: DeskModule;
  toolbar?: ReactNode;
  list: ReactNode;
  detail?: ReactNode;
  form?: ReactNode;
}) {
  const contract = adminContract(id);
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
  const title = current ? `${current.id} · ${current.title}` : "Visão geral";
  return (
    <div className="admin-shell">
      <label className="admin-jump">
        <span className="sr-only">Módulo</span>
        <select aria-label="Módulo da administração" value={selection} onChange={(event) => onSelect(event.target.value as AdminPick)}>
          <option value="overview">Visão geral</option>
          {adminGroups.map((item) => (
            <optgroup key={item.id} label={`${item.id} · ${item.title}`}>
              {adminModules.filter((module) => module.group === item.id).map((module) => (
                <option key={module.id} value={module.id}>{module.id} · {module.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <nav className="admin-side" aria-label="Administração">
        <button type="button" aria-current={selection === "overview" ? "page" : undefined} onClick={() => onSelect("overview")}>Visão geral</button>
        {adminGroups.map((item) => (
          <section key={item.id}>
            <p className="admin-group">{item.id} · {item.title}</p>
            {adminModules.filter((module) => module.group === item.id).map((module) => (
              <button key={module.id} type="button" aria-current={selection === module.id ? "page" : undefined} onClick={() => onSelect(module.id)}>
                {module.id} {module.title}
              </button>
            ))}
          </section>
        ))}
      </nav>
      <div className="admin-main">
        <p className="admin-kicker">{group ? `${group.id} · ${group.title}` : "Sete macrogrupos"}</p>
        <h2>{title}</h2>
        <p className="admin-lead">{current ? current.purpose : "Escolha o módulo. A mesa abre só quando o conteúdo já está no banco."}</p>
        {current ? <p className="tool-help">{current.screen}</p> : null}
        {error ? <p className="err">{error}</p> : null}
        {!ready ? <p className="tool-help">Lendo o banco…</p> : children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { adminContract, type AdminRegion } from "@/lib/admin-contract";
import { deskModules, statusTone, type DeskModule } from "@/lib/normative-desk";

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
  module,
  onModule,
  error,
  ready,
  children,
}: {
  module: DeskModule;
  onModule: (id: DeskModule) => void;
  error: string;
  ready: boolean;
  children: ReactNode;
}) {
  const title = deskModules.find((item) => item.id === module)?.label ?? "Administração";
  return (
    <div className="admin-shell">
      <label className="admin-jump">
        <span className="sr-only">Seção</span>
        <select aria-label="Seção da administração" value={module} onChange={(event) => onModule(event.target.value as DeskModule)}>
          {deskModules.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <nav className="admin-side" aria-label="Administração">
        {deskModules.map((item) => (
          <button key={item.id} type="button" aria-current={module === item.id ? "page" : undefined} onClick={() => onModule(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="admin-main">
        <h2>{title}</h2>
        {error ? <p className="err">{error}</p> : null}
        {!ready ? <p className="tool-help">Lendo o banco…</p> : children}
      </div>
    </div>
  );
}

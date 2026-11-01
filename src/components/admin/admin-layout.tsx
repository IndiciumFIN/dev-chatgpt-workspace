import { useRef, type ReactNode } from "react";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { PageHero } from "@/components/site/page-hero";
import { adminContract, type AdminRegion } from "@/lib/admin-contract";
import { adminGroup, adminGroups, adminModule, adminModules, type AdminPick } from "@/lib/admin-catalog";
import { statusTone, type DeskModule } from "@/lib/normative-desk";

export function Status({ value }: { value: string }) {
  const tone = statusTone(value);
  const badge = tone === "ok" ? "badge badge-ok" : tone === "stop" ? "badge badge-danger" : tone === "wait" ? "badge badge-warn" : "badge";
  return <span className={badge}>{value}</span>;
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
      <label className="field">
        <span className="sr-only">{searchLabel}</span>
        <input type="search" value={search} placeholder={searchLabel} aria-label={searchLabel} onChange={(event) => onSearch(event.target.value)} />
      </label>
      {filters.map((filter) => (
        <label key={filter.id} className="field">
          <span className="sr-only">{filter.label}</span>
          <select aria-label={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
            {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
      <label className="field">
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
        {show("detail", <aside className="paper" aria-label="Detalhe">{detail ?? <p className="tool-help">Selecione um registro.</p>}</aside>)}
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
  const menu = useRef<HTMLDialogElement>(null);
  function choose(id: AdminPick) {
    onSelect(id);
    menu.current?.close();
  }
  return (
    <div className="admin-shell">
      <button className="admin-launch" type="button" onClick={() => menu.current?.showModal()}>
        {current ? current.title : "Visão geral"}
      </button>
      <dialog className="admin-dialog" ref={menu} aria-label="Módulos" onClose={() => menu.current?.close()}>
        <div className="admin-dialog-head">
          <strong>Módulos</strong>
          <button type="button" onClick={() => menu.current?.close()}>Fechar</button>
        </div>
        <AdminTree selection={selection} onSelect={choose} />
      </dialog>
      <aside className="admin-side">
        <AdminTree selection={selection} onSelect={onSelect} />
      </aside>
      <div className="admin-main">
        <Breadcrumb items={current ? [{ label: "Início", to: "/" }, { label: "Administração", to: "/admin" }, { label: current.title }] : [{ label: "Início", to: "/" }, { label: "Administração" }]} />
        <PageHero eyebrow={group ? group.title : "Administração"} title={current ? current.title : "Visão geral"} lead={current ? current.purpose : "Catálogo dos 22 módulos. A mesa só abre o que este banco já guarda."} titleId="admin-module-title" />
        {current ? <p className="lede">{current.screen}</p> : null}
        {error ? <p className="err">{error}</p> : null}
        {!ready ? <p className="text-sm text-muted">Lendo o banco…</p> : children}
      </div>
    </div>
  );
}

function AdminTree({ selection, onSelect }: { selection: AdminPick; onSelect: (id: AdminPick) => void }) {
  return (
    <nav className="admin-tree" aria-label="Administração">
      <button type="button" className="admin-tree-home" aria-current={selection === "overview" ? "page" : undefined} onClick={() => onSelect("overview")}>Visão geral</button>
      {adminGroups.map((item) => (
        <section key={item.id}>
          <h2 className="admin-group">{item.title}</h2>
          {adminModules.filter((module) => module.group === item.id).map((module) => (
            <button key={module.id} type="button" className="admin-tree-item" aria-current={selection === module.id ? "page" : undefined} onClick={() => onSelect(module.id)}>
              {module.title}
            </button>
          ))}
        </section>
      ))}
    </nav>
  );
}

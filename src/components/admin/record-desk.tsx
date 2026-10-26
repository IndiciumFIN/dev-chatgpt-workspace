import { useEffect, useState } from "react";
import { ModuleFrame, RecordToolbar, Status } from "@/components/admin/admin-layout";
import type { AdminModuleId } from "@/lib/admin-catalog";
import { readFormulas, readOps, readOrders, removeOps, saveOps, saveOrder, type OpsRow, type OrderRow } from "@/lib/ops.functions";

const orderStatuses = ["homologada", "pronta", "em_curso", "concluida", "bloqueada", "cancelada"];

const pageSize = 10;

function pageOf<T>(rows: T[], page: number) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  return { pages, current, slice: rows.slice((current - 1) * pageSize, current * pageSize) };
}

function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-slate">
      <p>{total} registro{total === 1 ? "" : "s"}</p>
      <div className="flex gap-2">
        <button className="btn-line btn-sm" type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
        <span>{page} / {pages}</span>
        <button className="btn-line btn-sm" type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export function RecordDesk({
  moduleId,
  kinds,
  statuses,
  onError,
}: {
  moduleId: AdminModuleId;
  kinds: readonly string[];
  statuses: readonly string[];
  onError: (message: string) => void;
}) {
  const [rows, setRows] = useState<OpsRow[]>([]);
  const [formulas, setFormulas] = useState<{ tool_slug: string; method: string; statement: string }[]>([]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("nome");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<OpsRow | null>(null);
  const [drop, setDrop] = useState<OpsRow | null>(null);
  const [pending, setPending] = useState(false);

  function reload() {
    return readOps({ data: { moduleId } }).then(setRows).catch((err: Error) => onError(err.message));
  }

  useEffect(() => {
    void reload();
    if (moduleId === "M18") {
      void readFormulas().then(setFormulas).catch((err: Error) => onError(err.message));
    }
  }, [moduleId]);

  const needle = search.trim().toLowerCase();
  const visible = rows
    .filter((row) => `${row.title} ${row.kind} ${row.status} ${row.detail}`.toLowerCase().includes(needle))
    .filter((row) => kind === "" || row.kind === kind)
    .filter((row) => status === "" || row.status === status)
    .sort((a, b) => (sort === "estado" ? a.status.localeCompare(b.status, "pt") : a.title.localeCompare(b.title, "pt")));
  const shownFormulas = formulas.filter((row) => `${row.tool_slug} ${row.method}`.toLowerCase().includes(needle));
  const list = pageOf(visible, page);

  function blank(): OpsRow {
    return { id: "", moduleId, kind: kind || kinds[0] || "", title: "", status: statuses[0] ?? "", detail: "" };
  }

  return (
    <ModuleFrame
      id="registro"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar registro"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Nome" }, { value: "estado", label: "Estado" }]}
          filters={[{ id: "tipo", label: "Tipo", value: kind, onChange: (value) => { setKind(value); setPage(1); }, options: [{ value: "", label: "Todos os tipos" }, ...kinds.map((item) => ({ value: item, label: item }))] }, { id: "estado", label: "Estado", value: status, onChange: (value) => { setStatus(value); setPage(1); }, options: [{ value: "", label: "Todos os estados" }, ...statuses.map((item) => ({ value: item, label: item }))] }]}
        />
      )}
      list={(
        <>
          {moduleId === "M18" ? (
            <table className="admin-table">
              <thead><tr><th>Fórmula</th><th>Método</th><th>Enunciado</th></tr></thead>
              <tbody>
                {shownFormulas.map((row) => (
                  <tr key={row.tool_slug}>
                    <td data-label="Fórmula">{row.tool_slug}</td>
                    <td data-label="Método">{row.method}</td>
                    <td data-label="Enunciado">{row.statement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <div className="mb-3 flex justify-end">
            <button className="btn-navy btn-sm" type="button" onClick={() => setOpen(blank())}>Novo registro</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Registro</th><th>Tipo</th><th>Estado</th><th>Ação</th></tr></thead>
            <tbody>
              {list.slice.map((row) => (
                <tr key={row.id}>
                  <td data-label="Registro">{row.title}</td>
                  <td data-label="Tipo">{row.kind}</td>
                  <td data-label="Estado"><Status value={row.status} /></td>
                  <td data-label="Ação">
                    <button className="row-link" type="button" onClick={() => setOpen(row)}>Editar</button>
                    <button className="row-link" type="button" onClick={() => setDrop(row)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length ? <p className="mt-3 text-sm text-muted">Nenhum registro neste filtro. A lista começa vazia.</p> : <Pager page={list.current} pages={list.pages} total={visible.length} onPage={setPage} />}
          {drop ? (
            <div className="mt-3 rounded-lg border border-line bg-canvas p-4" role="alertdialog" aria-labelledby="excluir-registro">
              <h3 id="excluir-registro" className="text-base font-semibold text-ink">Excluir {drop.title}?</h3>
              <p className="mt-1 text-sm text-slate">O registro sai desta mesa. A trilha fica no evento de auditoria.</p>
              <div className="cmd-actions">
                <button className="btn-danger btn-sm" type="button" disabled={pending} onClick={() => {
                  setPending(true);
                  void removeOps({ data: { id: drop.id, moduleId } })
                    .then(() => reload())
                    .then(() => { setDrop(null); if (open?.id === drop.id) setOpen(null); })
                    .catch((err: Error) => onError(err.message))
                    .finally(() => setPending(false));
                }}>Excluir</button>
                <button className="btn-line btn-sm" type="button" onClick={() => setDrop(null)}>Cancelar</button>
              </div>
            </div>
          ) : null}
        </>
      )}
      form={open ? (
        <form className="cmd-band" onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          void saveOps({ data: { ...open, kinds: [...kinds], statuses: [...statuses] } })
            .then(() => reload())
            .then(() => setOpen(null))
            .catch((err: Error) => onError(err.message))
            .finally(() => setPending(false));
        }}>
          <h3>{open.id ? "Editar" : "Novo"} · {moduleId}</h3>
          <label className="field">Tipo
            <select value={open.kind} onChange={(event) => setOpen({ ...open, kind: event.target.value })}>
              {kinds.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">Nome
            <input value={open.title} onChange={(event) => setOpen({ ...open, title: event.target.value })} required minLength={3} maxLength={120} />
          </label>
          <label className="field">Estado
            <select value={open.status} onChange={(event) => setOpen({ ...open, status: event.target.value })}>
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">Nota
            <textarea value={open.detail} rows={4} maxLength={2000} onChange={(event) => setOpen({ ...open, detail: event.target.value })} />
          </label>
          <div className="cmd-actions">
            <button className="btn-navy btn-sm" type="submit" disabled={pending}>Gravar</button>
            {open.id ? <button className="btn-line btn-sm" type="button" onClick={() => setDrop(open)}>Excluir</button> : null}
          </div>
        </form>
      ) : null}
    />
  );
}

export function OrderDesk({ onError }: { onError: (message: string) => void }) {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("nome");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<OrderRow | null>(null);
  const [pending, setPending] = useState(false);

  function reload() {
    return readOrders().then(setRows).catch((err: Error) => onError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  const needle = search.trim().toLowerCase();
  const visible = rows
    .filter((row) => `${row.title} ${row.project} ${row.environment}`.toLowerCase().includes(needle))
    .filter((row) => status === "" || row.status === status)
    .sort((a, b) => (sort === "estado" ? a.status.localeCompare(b.status, "pt") : a.title.localeCompare(b.title, "pt")));
  const list = pageOf(visible, page);

  return (
    <ModuleFrame
      id="registro"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar ordem"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Nome" }, { value: "estado", label: "Estado" }]}
          filters={[{ id: "estado", label: "Estado", value: status, onChange: (value) => { setStatus(value); setPage(1); }, options: [{ value: "", label: "Todos os estados" }, ...orderStatuses.map((item) => ({ value: item, label: item }))] }]}
        />
      )}
      list={(
        <>
          <div className="mb-3 flex justify-end">
            <button className="btn-navy btn-sm" type="button" onClick={() => setOpen({ id: "", project: "mesa", environment: "local", title: "", status: "homologada", gateOpen: false, blockReason: "" })}>Nova ordem</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Ordem</th><th>Projeto</th><th>Estado</th><th>Ação</th></tr></thead>
            <tbody>
              {list.slice.map((row) => (
                <tr key={row.id}>
                  <td data-label="Ordem">{row.title}</td>
                  <td data-label="Projeto">{row.project} · {row.environment}</td>
                  <td data-label="Estado"><Status value={row.status} /></td>
                  <td data-label="Ação"><button className="row-link" type="button" onClick={() => setOpen(row)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length ? <p className="mt-3 text-sm text-muted">Nenhuma ordem neste filtro.</p> : <Pager page={list.current} pages={list.pages} total={visible.length} onPage={setPage} />}
        </>
      )}
      form={open ? (
        <form className="cmd-band" onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          void saveOrder({ data: open })
            .then(() => reload())
            .then(() => setOpen(null))
            .catch((err: Error) => onError(err.message))
            .finally(() => setPending(false));
        }}>
          <h3>{open.id || "Nova ordem"}</h3>
          <label className="field">Nome
            <input value={open.title} required minLength={3} maxLength={120} onChange={(event) => setOpen({ ...open, title: event.target.value })} />
          </label>
          <label className="field">Projeto
            <input value={open.project} required pattern="[a-z0-9-]{1,40}" onChange={(event) => setOpen({ ...open, project: event.target.value })} />
          </label>
          <label className="field">Ambiente
            <input value={open.environment} required pattern="[a-z0-9-]{1,40}" onChange={(event) => setOpen({ ...open, environment: event.target.value })} />
          </label>
          <label className="field">Estado
            <select value={open.status} onChange={(event) => setOpen({ ...open, status: event.target.value })}>
              {orderStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={open.gateOpen} onChange={(event) => setOpen({ ...open, gateOpen: event.target.checked })} />
            Portão aberto
          </label>
          <label className="field">Motivo do bloqueio
            <textarea value={open.blockReason} rows={3} maxLength={400} onChange={(event) => setOpen({ ...open, blockReason: event.target.value })} />
          </label>
          <button className="btn-navy btn-sm" type="submit" disabled={pending}>Gravar</button>
        </form>
      ) : null}
    />
  );
}

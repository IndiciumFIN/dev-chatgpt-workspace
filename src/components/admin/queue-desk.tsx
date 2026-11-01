import { useState } from "react";
import { ModuleFrame, RecordToolbar, Status } from "@/components/admin/admin-layout";
import { atomQueue, extractionQueue, lineageSteps } from "@/lib/normative-desk";

const source = [
  ...extractionQueue.map((item) => ({ id: item.id, etapa: "Extração", title: item.title, state: item.state, detail: item.next })),
  ...lineageSteps.map((item) => ({ id: item.id, etapa: "Linhagem", title: item.title, state: item.state, detail: item.detail })),
  ...atomQueue.map((item) => ({ id: item.id, etapa: "Átomo", title: item.id, state: item.state, detail: item.detail })),
];

export function QueueDesk() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [sort, setSort] = useState("etapa");
  const [open, setOpen] = useState(source[0]?.id ?? "");
  const rows = source
    .filter((row) => `${row.id} ${row.title} ${row.state}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((row) => stage === "" || row.etapa === stage)
    .sort((a, b) => (sort === "item" ? a.title.localeCompare(b.title, "pt") : a.etapa.localeCompare(b.etapa, "pt") || a.title.localeCompare(b.title, "pt")));
  const current = source.find((row) => row.id === open) ?? null;

  return (
    <ModuleFrame
      id="fila"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar item"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "etapa", label: "Etapa" }, { value: "item", label: "Item" }]}
          filters={[{ id: "etapa", label: "Etapa", value: stage, onChange: setStage, options: [{ value: "", label: "Todas" }, { value: "Extração", label: "Extração" }, { value: "Linhagem", label: "Linhagem" }, { value: "Átomo", label: "Átomo" }] }]}
        />
      )}
      list={(
        <table className="admin-table">
          <thead><tr><th>Etapa</th><th>Item</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={open === row.id ? "is-open" : undefined}>
                <td data-label="Etapa">{row.etapa}</td>
                <td data-label="Item"><button className="row-link" type="button" onClick={() => setOpen(row.id)}>{row.title}</button></td>
                <td data-label="Estado"><Status value={row.state} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      detail={current ? <><h3>{current.title}</h3><p><Status value={current.state} /></p><p>{current.detail}</p></> : null}
    />
  );
}

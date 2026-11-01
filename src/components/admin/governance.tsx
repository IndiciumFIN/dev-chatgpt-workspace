import { useEffect, useState } from "react";
import { ModuleFrame, RecordToolbar, Status } from "@/components/admin/admin-layout";
import { PolicySheet } from "@/components/admin/policy-sheet";
import { useStored } from "@/lib/stored";
import { emptyPolicy, parsePolicyBody, policyGaps, writePolicyBody, type PolicySections } from "@/lib/policy-document";
import { approveGovernanceItem, approveSpecification, assumePolicy, readGovernance, saveGovernanceDraft } from "@/lib/source.functions";

type Item = { id: string; kind: string; title: string; body: string; status: string; approved_by: string | null; approved_at: string | null };
type Version = { item_id: string; version: number; title: string; body: string; approved_by: string | null; approved_at: string | null; reason: string };
type Spec = { id: string; entity: string; characteristic: string; definition: string; syntax: string; required: boolean; source: string; status: string; approved_by: string | null };
type EventRow = { id: string; actor_id: string; action: string; entity: string; entity_id: string; at: string };

const kindLabel: Record<string, string> = { objetivo: "Objetivo", escopo: "Escopo", risco: "Risco", politica: "Política" };

function useGovernance(onError: (message: string) => void) {
  const [owner, setOwner] = useState("ainda ninguém");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);

  function reload() {
    return readGovernance()
      .then((row) => {
        setOwner(row.ownerUserId ? `${row.ownerUserId} · ${row.acceptedAt ?? ""}` : "ainda ninguém");
        setEvents(row.events);
        setItems(row.items);
        setVersions(row.versions);
        setSpecs(row.specifications);
      })
      .catch((err: Error) => onError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  return { owner, events, items, versions, specs, reload };
}

function compare(sort: string, left: string, right: string) {
  return sort.endsWith("-desc") ? right.localeCompare(left, "pt") : left.localeCompare(right, "pt");
}

export function NormsModule() {
  const { normas, packSha } = useStored();
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [sort, setSort] = useState("nome");
  const [selected, setSelected] = useState(normas[0]?.id ?? "");
  const domains = [...new Set(normas.map((norma) => norma.domain))];
  const rows = normas
    .filter((norma) => `${norma.id} ${norma.name} ${norma.domain}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((norma) => domain === "" || norma.domain === domain)
    .sort((a, b) => compare(sort, sort.startsWith("dominio") ? a.domain : a.name, sort.startsWith("dominio") ? b.domain : b.name));
  const current = normas.find((norma) => norma.id === selected) ?? null;

  return (
    <ModuleFrame
      id="normas"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar norma"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Nome" }, { value: "dominio", label: "Domínio" }]}
          filters={[{ id: "dominio", label: "Domínio", value: domain, onChange: setDomain, options: [{ value: "", label: "Todos" }, ...domains.map((item) => ({ value: item, label: item }))] }]}
        />
      )}
      list={(
        <>
          <p className="tool-help">Metadado do documento 0.1.0. Hash {packSha.slice(0, 12)}…. {rows.length} de {normas.length}. Não certifica.</p>
          <table className="admin-table">
            <thead><tr><th>Norma</th><th>Domínio</th><th>Direito</th></tr></thead>
            <tbody>
              {rows.map((norma) => (
                <tr key={norma.id} className={selected === norma.id ? "is-open" : undefined}>
                  <td data-label="Norma"><button className="row-link" type="button" onClick={() => setSelected(norma.id)}>{norma.name}</button></td>
                  <td data-label="Domínio">{norma.domain}</td>
                  <td data-label="Direito"><Status value={norma.right} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      detail={current ? (
        <>
          <h3>{current.name}</h3>
          <p>{current.id}</p>
          <p>Domínio: {current.domain}</p>
          <p>Prioridade: {current.priority}</p>
          <p><Status value={current.right} /></p>
          <p className="tool-help">O texto da cláusula não está nesta mesa. Aqui só existe o metadado.</p>
        </>
      ) : null}
    />
  );
}

export function PoliciesModule({ onError }: { onError: (message: string) => void }) {
  const desk = useGovernance(onError);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("titulo");
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState("");
  const [draftId, setDraftId] = useState("");
  const [draftKind, setDraftKind] = useState("politica");
  const [draftTitle, setDraftTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSections, setEditSections] = useState<PolicySections>(emptyPolicy());
  const [legacy, setLegacy] = useState("");
  const [newSections, setNewSections] = useState<PolicySections>(emptyPolicy());
  const rows = desk.items
    .filter((item) => `${item.id} ${item.title}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((item) => kind === "" || item.kind === kind)
    .filter((item) => status === "" || item.status === status)
    .sort((a, b) => compare(sort, sort.startsWith("tipo") ? a.kind : a.title, sort.startsWith("tipo") ? b.kind : b.title));
  const current = desk.items.find((item) => item.id === selected) ?? null;
  const version = desk.versions.find((item) => item.item_id === current?.id) ?? null;
  const trail = desk.events.filter((event) => event.entity_id === current?.id);
  const shown = current
    ? current.status === "aprovado"
      ? parsePolicyBody(version?.body ?? current.body)
      : { sections: editSections, legacy }
    : null;

  function openItem(item: Item) {
    const parsed = parsePolicyBody(item.body);
    setSelected(item.id);
    setEditTitle(item.title);
    setEditSections(parsed.sections);
    setLegacy(parsed.legacy);
  }

  function save(id: string, nextKind: string, title: string, body: string) {
    setPending(id || "novo");
    void saveGovernanceDraft({ data: { id, kind: nextKind, title, body } })
      .then(() => desk.reload())
      .catch((err: Error) => onError(err.message))
      .finally(() => setPending(""));
  }

  return (
    <ModuleFrame
      id="politicas"
      toolbar={(
        <>
          <p className="tool-help">Dono: {desk.owner}. A forma segue o núcleo público das cláusulas 5.2 e o ciclo do controle 5.1. Preencher não certifica e não publica.</p>
          <button className="btn-line btn-sm" type="button" onClick={() => void assumePolicy().then(() => desk.reload()).catch((err: Error) => onError(err.message))}>Assumir a política</button>
          <RecordToolbar
            search={search}
            onSearch={setSearch}
            searchLabel="Buscar política"
            sort={sort}
            onSort={setSort}
            sorts={[{ value: "titulo", label: "Título" }, { value: "tipo", label: "Tipo" }]}
            filters={[
              { id: "tipo", label: "Tipo", value: kind, onChange: setKind, options: [{ value: "", label: "Todos" }, ...Object.entries(kindLabel).map(([value, label]) => ({ value, label }))] },
              { id: "estado", label: "Estado", value: status, onChange: setStatus, options: [{ value: "", label: "Todos" }, { value: "rascunho", label: "Rascunho" }, { value: "aprovado", label: "Aprovado" }] },
            ]}
          />
        </>
      )}
      list={(
        <table className="admin-table">
          <thead><tr><th>Item</th><th>Tipo</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className={selected === item.id ? "is-open" : undefined}>
                <td data-label="Item"><button className="row-link" type="button" onClick={() => openItem(item)}>{item.title}</button></td>
                <td data-label="Tipo">{kindLabel[item.kind] ?? item.kind}</td>
                <td data-label="Estado"><Status value={item.status === "aprovado" ? "Aprovado" : "Rascunho"} /> {policyGaps(parsePolicyBody(item.body).sections).length} lacunas</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      detail={current ? (
        <>
          <h3>{version?.title ?? current.title}</h3>
          <p>{current.id} · {kindLabel[current.kind] ?? current.kind}</p>
          <p><Status value={current.status === "aprovado" ? "Aprovado" : "Rascunho"} /></p>
          {current.approved_by ? <p>Aprovado por {current.approved_by} em {current.approved_at ?? "data não registrada"}.</p> : <p>Ainda sem aprovador.</p>}
          {current.status === "rascunho" ? <label className="field">Título<input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label> : null}
          {shown ? (
            <PolicySheet
              sections={shown.sections}
              legacy={shown.legacy}
              approved={current.status === "aprovado"}
              onChange={current.status === "rascunho" ? (id, value) => setEditSections({ ...editSections, [id]: value }) : undefined}
            />
          ) : null}
          {version ? <p className="tool-help">Versão {version.version} congelada. Motivo: {version.reason}.</p> : null}
          {trail.length ? <ul className="tool-help">{trail.map((event) => <li key={event.id}>{event.action} · {event.actor_id} · {event.at}</li>)}</ul> : <p className="tool-help">Sem trilha deste item.</p>}
          {current.status === "rascunho" ? (
            <div className="cmd-actions">
              <button className="btn-line btn-sm" type="button" disabled={pending === current.id} onClick={() => save(current.id, current.kind, editTitle, writePolicyBody(editSections))}>Gravar</button>
              <button className="btn-navy btn-sm" type="button" disabled={pending === current.id || policyGaps(editSections).length > 0} onClick={() => {
                setPending(current.id);
                void saveGovernanceDraft({ data: { id: current.id, kind: current.kind, title: editTitle, body: writePolicyBody(editSections) } })
                  .then(() => approveGovernanceItem({ data: { id: current.id } }))
                  .then(() => desk.reload())
                  .catch((err: Error) => onError(err.message))
                  .finally(() => setPending(""));
              }}>Aprovar só sem lacuna</button>
            </div>
          ) : null}
        </>
      ) : null}
      form={(
        <form className="cmd-band" onSubmit={(event) => { event.preventDefault(); save(draftId, draftKind, draftTitle, writePolicyBody(newSections)); }}>
          <h3>Novo rascunho</h3>
          <label className="field">Identificador<input value={draftId} onChange={(event) => setDraftId(event.target.value)} /></label>
          <label className="field">Tipo
            <select value={draftKind} onChange={(event) => setDraftKind(event.target.value)}>
              {Object.entries(kindLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">Título<input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></label>
          <PolicySheet sections={newSections} legacy="" approved={false} onChange={(id, value) => setNewSections({ ...newSections, [id]: value })} />
          <button className="btn-navy btn-sm" type="submit" disabled={pending === "novo"}>{pending === "novo" ? "Gravando…" : "Gravar rascunho"}</button>
        </form>
      )}
    />
  );
}

export function DataModule({ onError }: { onError: (message: string) => void }) {
  const desk = useGovernance(onError);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("nome");
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState("");
  const rows = desk.specs
    .filter((spec) => `${spec.entity} ${spec.characteristic} ${spec.definition}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((spec) => status === "" || spec.status === status)
    .sort((a, b) => compare(sort, `${a.entity}.${a.characteristic}`, `${b.entity}.${b.characteristic}`));
  const current = desk.specs.find((spec) => spec.id === selected) ?? null;

  return (
    <ModuleFrame
      id="dados"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar característica"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Característica" }]}
          filters={[{ id: "estado", label: "Estado", value: status, onChange: setStatus, options: [{ value: "", label: "Todos" }, { value: "rascunho", label: "Rascunho" }, { value: "aprovado", label: "Aprovado" }] }]}
        />
      )}
      list={(
        <table className="admin-table">
          <thead><tr><th>Característica</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((spec) => (
              <tr key={spec.id} className={selected === spec.id ? "is-open" : undefined}>
                <td data-label="Característica"><button className="row-link" type="button" onClick={() => setSelected(spec.id)}>{spec.entity}.{spec.characteristic}</button></td>
                <td data-label="Estado"><Status value={spec.status === "aprovado" ? "Aprovado" : "Rascunho"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      detail={current ? (
        <>
          <h3>{current.entity}.{current.characteristic}</h3>
          <p>{current.definition}</p>
          <p>Sintaxe: {current.syntax}</p>
          <p>Fonte: {current.source}</p>
          <p>{current.required ? "Obrigatório" : "Opcional"}</p>
          <p><Status value={current.status === "aprovado" ? "Aprovado" : "Rascunho"} /></p>
          {current.approved_by ? <p>Aprovado por {current.approved_by}.</p> : null}
          {current.status === "rascunho" ? (
            <button className="btn-navy btn-sm" type="button" disabled={pending === current.id} onClick={() => {
              setPending(current.id);
              void approveSpecification({ data: { id: current.id } }).then(() => desk.reload()).catch((err: Error) => onError(err.message)).finally(() => setPending(""));
            }}>{pending === current.id ? "Aprovando…" : "Aprovar"}</button>
          ) : <p className="tool-help">Característica aprovada não se reescreve nesta tela.</p>}
        </>
      ) : null}
    />
  );
}

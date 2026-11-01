import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ModuleFrame, RecordToolbar, Status } from "@/components/admin/admin-layout";
import { AgentRoster } from "@/components/site/agent-roster";
import { CommunityBoard, PlanQueue } from "@/components/site/community";
import { listMedia, saveClinicalSheet, saveTool, setMemberRole, type SourcePerson, type SourceRole, type SourceTool } from "@/lib/source.functions";
import { LocaleDesk } from "@/components/admin/locale-desk";
import { useStored } from "@/lib/stored";
import { templateContracts } from "@/lib/template-contract";
import { tools } from "@/lib/tools/catalog";

export function ContentModule({ desk, tab: forced = "paginas" }: { desk: SourceTool[]; tab?: string }) {
  const { templates, families, pages: storedPages } = useStored();
  const [tab, setTab] = useState(forced);
  const [search, setSearch] = useState("");
  const [localeError, setLocaleError] = useState("");
  const published = new Map(desk.map((tool) => [tool.slug, tool]));
  const needle = search.trim().toLowerCase();
  const pages = storedPages.filter((page) => page.title.toLowerCase().includes(needle));
  const pieces = templates.filter((piece) => `${piece.name} ${piece.id}`.toLowerCase().includes(needle));

  return (
    <ModuleFrame
      id="conteudo"
      toolbar={<RecordToolbar search={search} onSearch={setSearch} searchLabel="Buscar conteúdo" sort="nome" onSort={() => undefined} sorts={[{ value: "nome", label: "Nome" }]} />}
      list={(
        <>
          <div className="admin-tabs" role="tablist" aria-label="Conteúdo">
            {[["paginas", "Páginas"], ["idiomas", "Idiomas"], ["templates", "Templates"], ["pecas", "Peças"]].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          {tab === "paginas" ? (
            <table className="admin-table">
              <thead><tr><th>Página</th><th>Rota</th><th>Estado</th></tr></thead>
              <tbody>
                {pages.map((page) => <tr key={page.slug}><td data-label="Página"><Link to="/secao/$slug" params={{ slug: page.slug }}>{page.title}</Link></td><td data-label="Rota">/secao/{page.slug}</td><td data-label="Estado"><Status value="Na seção" /></td></tr>)}
                {tools.filter((tool) => tool.title.toLowerCase().includes(needle)).map((tool) => {
                  const row = published.get(tool.slug);
                  const state = !row ? "Fora do banco" : row.published ? "Publicado" : "Oculto na fonte";
                  return <tr key={tool.slug}><td data-label="Página"><Link to="/ferramentas/$slug" params={{ slug: tool.slug }}>{row?.title ?? tool.title}</Link></td><td data-label="Rota">/ferramentas/{tool.slug}</td><td data-label="Estado"><Status value={state} /></td></tr>;
                })}
              </tbody>
            </table>
          ) : null}
          {tab === "idiomas" ? (
            <>
              {localeError ? <p className="tool-help">{localeError}</p> : null}
              <LocaleDesk search={needle} onError={setLocaleError} />
            </>
          ) : null}
          {tab === "templates" ? (
            <table className="admin-table">
              <thead><tr><th>Template</th><th>Nota</th></tr></thead>
              <tbody>
                {families.filter((family) => family.name.toLowerCase().includes(needle)).map((family) => (
                  <tr key={family.id}>
                    <td data-label="Template">{family.id === "ferramenta" ? <Link to="/ferramentas/$slug" params={{ slug: "braden" }}>{family.name}</Link> : <Link to="/modelos/$id" params={{ id: family.id === "editorial" ? "TPL-001" : family.id }}>{family.name}</Link>}</td>
                    <td data-label="Nota">{family.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {tab === "pecas" ? (
            <table className="admin-table">
              <thead><tr><th>Peça</th><th>Código</th><th>Categoria</th></tr></thead>
              <tbody>{pieces.map((piece) => <tr key={piece.id}><td data-label="Peça"><Link to="/modelos/$id" params={{ id: piece.id }}>{piece.name}</Link></td><td data-label="Código">{piece.id}</td><td data-label="Categoria">{piece.category}</td></tr>)}</tbody>
            </table>
          ) : null}
        </>
      )}
    />
  );
}

export function SystemModule({ tab: forced = "visual" }: { tab?: string }) {
  const { tokens } = useStored();
  const [tab, setTab] = useState(forced);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<{ path: string; locale: string; alt: string; status: string }[]>([]);
  const [mediaError, setMediaError] = useState("");
  const needle = search.trim().toLowerCase();

  useEffect(() => {
    void listMedia().then(setFiles).catch((err: Error) => setMediaError(err.message));
  }, []);

  return (
    <ModuleFrame
      id="sistema"
      toolbar={<RecordToolbar search={search} onSearch={setSearch} searchLabel="Buscar no sistema" sort="nome" onSort={() => undefined} sorts={[{ value: "nome", label: "Nome" }]} />}
      list={(
        <>
          <div className="admin-tabs" role="tablist" aria-label="Sistema">
            {[["visual", "Visual"], ["arquivos", "Arquivos"], ["agentes", "Agentes"]].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          {mediaError ? <p className="err">{mediaError}</p> : null}
          {tab === "visual" ? (
            <table className="admin-table">
              <thead><tr><th>Contrato ou token</th><th>Uso</th></tr></thead>
              <tbody>
                {Object.entries(templateContracts).filter(([kind]) => kind.includes(needle)).map(([kind, contract]) => (
                  <tr key={kind}><td data-label="Contrato">{kind}</td><td data-label="Uso">{contract.frame} · {contract.hero} · {contract.toc === "sidebar" ? "índice" : "sem índice"}</td></tr>
                ))}
                {tokens.filter((token) => token.name.toLowerCase().includes(needle)).map((token) => <tr key={token.name}><td data-label="Token">{token.name}</td><td data-label="Uso">{token.hex} · {token.role}</td></tr>)}
              </tbody>
            </table>
          ) : null}
          {tab === "arquivos" ? (
            <table className="admin-table">
              <thead><tr><th>Arquivo</th><th>Idioma</th><th>Texto alternativo</th></tr></thead>
              <tbody>{files.filter((file) => `${file.path} ${file.locale} ${file.alt}`.toLowerCase().includes(needle)).map((file) => <tr key={`${file.path}-${file.locale}`}><td data-label="Arquivo"><a href={file.path}>{file.path.split("/").pop()}</a></td><td data-label="Idioma">{file.locale} · {file.status}</td><td data-label="Texto alternativo">{file.alt || "Sem texto"}</td></tr>)}</tbody>
            </table>
          ) : null}
          {tab === "agentes" ? <AgentRoster /> : null}
        </>
      )}
    />
  );
}

export function InstrumentModule({ tools: rows, onSaved, onError }: { tools: SourceTool[]; onSaved: () => Promise<void>; onError: (message: string) => void }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [sort, setSort] = useState("nome");
  const [open, setOpen] = useState<string | null>(null);
  const visible = rows
    .filter((tool) => tool.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((tool) => kind === "" || tool.kind === kind)
    .sort((a, b) => (sort === "tipo" ? a.kind.localeCompare(b.kind, "pt") : a.title.localeCompare(b.title, "pt")));
  const current = rows.find((tool) => tool.slug === open) ?? null;

  return (
    <ModuleFrame
      id="instrumentos"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar instrumento"
          sort={sort}
          onSort={setSort}
          sorts={[{ value: "nome", label: "Nome" }, { value: "tipo", label: "Tipo" }]}
          filters={[{ id: "tipo", label: "Tipo", value: kind, onChange: setKind, options: [{ value: "", label: "Todos" }, { value: "escala", label: "Escala" }, { value: "calculadora", label: "Calculadora" }] }]}
        />
      )}
      list={(
        <table className="admin-table">
          <thead><tr><th>Instrumento</th><th>Tipo</th></tr></thead>
          <tbody>
            {visible.map((tool) => (
              <tr key={tool.slug} className={open === tool.slug ? "is-open" : undefined}>
                <td data-label="Instrumento"><button className="row-link" type="button" onClick={() => setOpen(open === tool.slug ? null : tool.slug)}>{tool.title}</button></td>
                <td data-label="Tipo">{tool.kind === "escala" ? "Escala" : "Calculadora"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      form={current ? <ToolEditor key={current.slug} tool={current} onSaved={onSaved} onError={onError} /> : null}
    />
  );
}

function ToolEditor({ tool, onSaved, onError }: { tool: SourceTool; onSaved: () => Promise<void>; onError: (message: string) => void }) {
  const [title, setTitle] = useState(tool.title);
  const [lead, setLead] = useState(tool.lead);
  const [published, setPublished] = useState(tool.published);
  const [pending, setPending] = useState(false);

  return (
    <form className="cmd-band" onSubmit={(event) => {
      event.preventDefault();
      setPending(true);
      void saveTool({ data: { slug: tool.slug, title, lead, published } }).then(() => onSaved()).catch((err: Error) => onError(err.message)).finally(() => setPending(false));
    }}>
      <h3>{tool.kind === "escala" ? "Escala" : "Calculadora"} · <Link to="/ferramentas/$slug" params={{ slug: tool.slug }}>{tool.slug}</Link></h3>
      <label className="field"><span>Título</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className="field"><span>Texto</span><textarea value={lead} onChange={(event) => setLead(event.target.value)} /></label>
      <label className="choice"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /><span>Publicado na fonte</span></label>
      <button className="btn-navy btn-sm" type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar capa"}</button>
      <button className="btn-line btn-sm" type="button" disabled={pending} onClick={() => {
        setPending(true);
        void saveClinicalSheet({ data: { slug: tool.slug, title, lead, published } }).then(() => onSaved()).catch((err: Error) => onError(err.message)).finally(() => setPending(false));
      }}>Gravar ficha do código</button>
    </form>
  );
}

export function PeopleModule({ people, onSaved, onError }: { people: SourcePerson[]; onSaved: () => Promise<void>; onError: (message: string) => void }) {
  const [tab, setTab] = useState<"papeis" | "casa">("papeis");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const visible = people
    .filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((person) => role === "" || person.role === role);

  return (
    <ModuleFrame
      id="pessoas"
      toolbar={(
        <RecordToolbar
          search={search}
          onSearch={setSearch}
          searchLabel="Buscar pessoa"
          sort="nome"
          onSort={() => undefined}
          sorts={[{ value: "nome", label: "Nome" }]}
          filters={[{ id: "papel", label: "Papel", value: role, onChange: setRole, options: [{ value: "", label: "Todos" }, { value: "admin", label: "Administrador" }, { value: "subscriber", label: "Assinante" }] }]}
        />
      )}
      list={(
        <>
          <div className="admin-tabs" role="tablist" aria-label="Pessoas">
            <button type="button" role="tab" aria-selected={tab === "papeis"} onClick={() => setTab("papeis")}>Papéis</button>
            <button type="button" role="tab" aria-selected={tab === "casa"} onClick={() => setTab("casa")}>Comunidade</button>
          </div>
          {tab === "papeis" ? (
            <table className="admin-table">
              <thead><tr><th>Pessoa</th><th>Papel</th></tr></thead>
              <tbody>
                {visible.map((person) => (
                  <PersonRow key={person.userId} person={person} onSaved={onSaved} onError={onError} />
                ))}
              </tbody>
            </table>
          ) : <><PlanQueue /><CommunityBoard moderate /></>}
        </>
      )}
    />
  );
}

function PersonRow({ person, onSaved, onError }: { person: SourcePerson; onSaved: () => Promise<void>; onError: (message: string) => void }) {
  const [role, setRole] = useState<SourceRole>(person.role);
  const [pending, setPending] = useState(false);
  return (
    <tr>
      <td data-label="Pessoa">{person.name}<br /><span className="tool-help">{person.email}</span></td>
      <td data-label="Papel">
        <select value={role} aria-label={`Papel de ${person.name}`} onChange={(event) => setRole(event.target.value as SourceRole)}>
          <option value="admin">Administrador</option>
          <option value="subscriber">Assinante</option>
        </select>
        <button className="btn-ghost btn-sm" type="button" disabled={pending} onClick={() => {
          setPending(true);
          void setMemberRole({ data: { userId: person.userId, role } }).then(() => onSaved()).catch((err: Error) => onError(err.message)).finally(() => setPending(false));
        }}>{pending ? "Salvando…" : "Atualizar"}</button>
      </td>
    </tr>
  );
}

import { ArticlePage } from "@/components/article/article-page";
import { ReferenceList } from "@/components/article/pieces";
import { RelatedContent } from "@/components/site/related-content";
import { LibraryShelves } from "@/components/templates/library-shelves";
import { useStored, unflatten } from "@/lib/stored";

type Item = {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  sequence?: number | null;
  attributes?: { unit?: string; format?: string };
};

type Group = { tone?: string; title?: string; items?: string[] };
type Column = { key: string; label: string };

const labels: Record<string, string> = {
  Parameter: "Parâmetro",
  Reference: "Referência",
  "Clinical State": "Situação clínica",
  Frequency: "Frequência",
};

export function LibraryView() {
  const { shelves, specimens } = useStored();
  const specimen = specimens.find((item) => item.id === "biblioteca");
  if (!specimen) return null;
  return (
    <ArticlePage
      kind="biblioteca"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: specimen.title }]}
      eyebrow="Biblioteca de enfermagem"
      title={specimen.title}
      lead={specimen.lead}
      toc={[
        ...specimen.modules.map((module) => ({ id: module.title, label: module.title })),
        ...shelves.map((shelf) => ({ id: shelf.id, label: shelf.title })),
      ]}
      related={
        <RelatedContent
          items={[
            { to: "/modelos/$id", params: { id: "guia" }, title: "Guia", text: "Página longa de urgência." },
            { to: "/modelos/$id", params: { id: "norma" }, title: "Norma", text: "Leitura contínua com índice." },
          ]}
        />
      }
    >
      {specimen.modules.map((module) => (
        <section key={module.title} className="inst-sec" id={module.title}>
          <h2>{module.title}</h2>
          <ModuleBody type={module.type} payload={unflatten(module.lines.map((line) => ({ key: line.path, text: line.text }))) as { items?: Item[]; groups?: Group[]; columns?: Column[]; rows?: Record<string, string>[] }} />
        </section>
      ))}
      <LibraryShelves />
    </ArticlePage>
  );
}

function ModuleBody({ type, payload }: { type: string; payload: { items?: Item[]; groups?: Group[]; columns?: Column[]; rows?: Record<string, string>[] } }) {
  if (type === "reference_list") {
    return <ReferenceList items={(payload.items ?? []).map((item) => [item.title, item.subtitle].filter(Boolean).join(". "))} />;
  }
  if (type === "table") {
    const columns = payload.columns ?? [];
    return (
      <div className="table-scroll">
        <table className="calc-table">
          <thead>
            <tr>{columns.map((column) => <th key={column.key}>{labels[column.label] ?? column.label}</th>)}</tr>
          </thead>
          <tbody>
            {(payload.rows ?? []).map((row) => (
              <tr key={Object.values(row).join("|")}>{columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (type === "status_panel") {
    return (
      <div className="tpl-stack">
        {(payload.groups ?? []).map((group) => (
          <div key={group.title} className="tpl-note">
            {group.title && group.title !== "Items" ? <b>{group.title}</b> : null}
            <ul className="plain-list">{(group.items ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className="guide-cards">
      {(payload.items ?? []).map((item) => (
        <li key={item.id ?? item.title}>
          <b>{item.sequence ? `${item.sequence}. ` : ""}{item.title}</b>
          <span>{item.description || item.subtitle}{item.attributes?.unit ? ` (${item.attributes.unit})` : ""}{item.attributes?.format ? ` · ${item.attributes.format}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

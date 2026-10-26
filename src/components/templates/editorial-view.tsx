import { useState } from "react";
import type { EditorialTemplate } from "@/lib/templates";

function asList(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function Note({ children }: { children: string }) {
  if (!children) return null;
  return <p className="tpl-note">{children}</p>;
}

function Brand() {
  return <p className="tpl-brand">Calculadoras de Enfermagem</p>;
}

function Checks({ sections }: { sections: { title: string; items: string[] }[] }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (
    <div className="tpl-stack">
      {sections.map((section) => (
        <section key={section.title}>
          <h3>{section.title}</h3>
          <ul className="tpl-checks">
            {section.items.map((item) => {
              const key = `${section.title}:${item}`;
              return (
                <li key={key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(on[key])}
                      onChange={() => setOn((current) => ({ ...current, [key]: !current[key] }))}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Body({ template }: { template: EditorialTemplate }) {
  const data = template.data;
  switch (template.type) {
    case "medication-safety":
      return (
        <>
          <p className="tpl-kicker">{asText(data.subtitle)}</p>
          <h2>{asText(data.title)}</h2>
          <ol className="tpl-nums">{asList(data.items).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ol>
          <Note>{asText(data.note)}</Note>
        </>
      );
    case "pharmacology":
      return (
        <>
          <p className="tpl-kicker">{asText(data.tag)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          {asList(data.sections).map((section) => {
            const row = section as { title?: string; text?: string };
            return (
              <div key={row.title} className="tpl-row">
                <b>{row.title}</b>
                <p>{row.text}</p>
              </div>
            );
          })}
        </>
      );
    case "vital-signs":
      return (
        <>
          <p className="tpl-kicker">{asText(data.tag)}</p>
          <h2>{asText(data.title)}</h2>
          <ul className="tpl-grid">
            {asList(data.items).map((item) => {
              const row = item as { title?: string; value?: string };
              return <li key={row.title}><b>{row.title}</b><span>{row.value}</span></li>;
            })}
          </ul>
        </>
      );
    case "mind-map":
      return (
        <>
          <h2 className="tpl-center">{asText(data.center)}</h2>
          <ul className="tpl-grid">
            {asList(data.branches).map((branch) => {
              const row = branch as { title?: string; text?: string; items?: string[] };
              return (
                <li key={row.title}>
                  <b>{row.title}</b>
                  {row.text ? <span>{row.text}</span> : null}
                  {row.items ? <span>{row.items.join(" · ")}</span> : null}
                </li>
              );
            })}
          </ul>
        </>
      );
    case "clinical-case":
      return (
        <>
          <p className="tpl-kicker">{asText(data.tag)}</p>
          <h2>{asText(data.title)}</h2>
          <p>{asText(data.context)}</p>
          <h3>Dados relevantes</h3>
          <ul className="plain-list">{asList(data.relevant).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <h3>Condutas</h3>
          <ol className="tpl-nums">{asList(data.actions).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ol>
          <h3>Atenção</h3>
          <ul className="plain-list">{asList(data.attention).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
        </>
      );
    case "checklist":
      return (
        <>
          <p className="tpl-kicker">{asText(data.route)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <Checks sections={asList(data.sections) as { title: string; items: string[] }[]} />
          <Note>{asText(data.noteTitle) ? `${asText(data.noteTitle)}. ${asText(data.note)}` : asText(data.note)}</Note>
        </>
      );
    case "protocol":
      return (
        <>
          <p className="tpl-kicker">{asText(data.kicker)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <p>{asText(data.objective)}</p>
          <ol className="tpl-blocks">
            {asList(data.blocks).map((block) => {
              const row = block as { n?: string; title?: string; items?: string[] };
              return (
                <li key={row.title}>
                  <b><span>{row.n}</span>{row.title}</b>
                  <span>{(row.items ?? []).join(" · ")}</span>
                </li>
              );
            })}
          </ol>
          <Note>{asText(data.summary)}</Note>
        </>
      );
    case "pocket-guide":
      return (
        <>
          <p className="tpl-kicker">{asText(data.audience)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <ol className="tpl-abc">
            {asList(data.abcde).map((item) => {
              const row = item as { letter?: string; term?: string; text?: string };
              return <li key={row.letter}><b>{row.letter}</b><span><strong>{row.term}.</strong> {row.text}</span></li>;
            })}
          </ol>
          <h3>Prioridade</h3>
          <ul className="plain-list">{asList(data.priority).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <h3>Conduta</h3>
          <ul className="plain-list">{asList(data.actions).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <Note>{asList(data.safety).map((item) => asText(item)).join(" · ")}</Note>
        </>
      );
    case "infographic":
      return (
        <>
          <p className="tpl-kicker">{asText(data.kicker)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <p>{asText(data.recognition)}</p>
          <ul className="plain-list">{asList(data.alerts).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <ol className="tpl-nums">{asList(data.steps).map((step) => {
            const row = step as { title?: string; text?: string };
            return <li key={row.title}><b>{row.title}.</b> {row.text}</li>;
          })}</ol>
          <Note>{asText(data.summary)}</Note>
        </>
      );
    case "article-card":
      return (
        <div className="tpl-split">
          <div>
            <p className="tpl-kicker">{asText(data.tag)}</p>
            <h2>{asText(data.title)}</h2>
            <p>{asText(data.description)}</p>
            <p className="tpl-cta">{asText(data.cta)}</p>
          </div>
          <div className="tpl-cover" aria-hidden="true">CE</div>
        </div>
      );
    case "quick-steps":
      return (
        <>
          <p className="tpl-kicker">{asText(data.tag)}</p>
          <h2>{asText(data.title)}</h2>
          <ol className="tpl-nums">{asList(data.steps).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ol>
          <Note>{asText(data.note)}</Note>
        </>
      );
    case "reference-table":
      return (
        <>
          <h2>{asText(data.title)}</h2>
          <div className="table-scroll">
            <table className="calc-table">
              <thead>
                <tr>{asList(data.headers).map((header) => <th key={asText(header)}>{asText(header)}</th>)}</tr>
              </thead>
              <tbody>
                {asList(data.rows).map((row) => (
                  <tr key={asList(row).join("|")}>{asList(row).map((cell) => <td key={asText(cell)}>{asText(cell)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>{asText(data.note)}</Note>
        </>
      );
    case "visual-synthesis":
      return (
        <>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <ul className="tpl-grid">
            {asList(data.modules).map((module) => {
              const row = module as { title?: string; items?: string[] };
              return <li key={row.title}><b>{row.title}</b><span>{(row.items ?? []).join(" · ")}</span></li>;
            })}
          </ul>
          <p className="tpl-sub">SBAR: {asList(data.sbar).map((pair) => asList(pair).join(" ")).join(" · ")}</p>
          <Note>{asList(data.reminders).map((item) => asText(item)).join(" · ")}</Note>
        </>
      );
    case "taxonomy":
      return (
        <>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <p>{asText(data.intro)}</p>
          <ul className="tpl-grid">
            {asList(data.domains).map((domain) => {
              const row = domain as [string, string, string[]];
              return <li key={row[0]}><b>{row[0]}. {row[1]}</b><span>{(row[2] ?? []).join(" · ")}</span></li>;
            })}
          </ul>
          <Note>{asText(data.footer)}</Note>
        </>
      );
    case "document-form":
    case "document-sheet":
      return (
        <>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <ul className="tpl-fields">
            {asList(data.fields ?? data.topFields).map((field) => <li key={asText(field)}>{asText(field)}</li>)}
          </ul>
          {asList(data.sections).map((section) => {
            const row = section as { title?: string; items?: string[] };
            return <div key={row.title}><h3>{row.title}</h3><ul className="plain-list">{(row.items ?? []).map((item) => <li key={item}>{item}</li>)}</ul></div>;
          })}
          {asList(data.blocks).map((block) => {
            const row = block as { title?: string; text?: string };
            return <div key={row.title} className="tpl-row"><b>{row.title}</b><p>{row.text}</p></div>;
          })}
          <Note>{asText(data.signature || data.footerNote)}</Note>
        </>
      );
    case "document-checklist":
      return (
        <>
          <p className="tpl-kicker">{asText(data.validationBadge)}</p>
          <h2>{asText(data.title)}</h2>
          <p className="tpl-sub">{asText(data.subtitle)}</p>
          <Note>{asText(data.notice)}</Note>
          <ul className="tpl-grid">
            {asList(data.identityFields).map((field) => {
              const row = field as { label?: string };
              return <li key={row.label}><b>{row.label}</b><span>Preenchimento local, nesta tela.</span></li>;
            })}
          </ul>
          <h3>Estrutura</h3>
          <ul className="plain-list">{asList(data.structureCriteria).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <h3>Equipamentos</h3>
          <ul className="plain-list">{asList(data.equipmentCriteria).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <h3>Medicamentos do modelo</h3>
          <ul className="plain-list">{asList(data.medications).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <p className="sheet-note">{asText(data.medicationsNote)}</p>
          <h3>Via aérea e materiais</h3>
          <ul className="plain-list">{[...asList(data.airway), ...asList(data.accessVascular), ...asList(data.misc)].map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ul>
          <Note>{asText(data.archiveNotice)}</Note>
        </>
      );
    case "social-post":
    case "carousel-cover":
      return (
        <>
          <p className="tpl-kicker">{asText(data.tag)}</p>
          <h2>{asText(data.title)}</h2>
          {asText(data.subtitle) ? <p className="tpl-sub">{asText(data.subtitle)}</p> : null}
          <ol className="tpl-nums">{asList(data.bullets).map((item) => <li key={asText(item)}>{asText(item)}</li>)}</ol>
          {asText(data.series) ? <p className="tpl-sub">{asText(data.series)}</p> : null}
          <p className="tpl-cta">{asText(data.cta)}</p>
        </>
      );
    case "share-image":
    case "thumbnail-card":
      return (
        <div className="tpl-split">
          <div>
            <p className="tpl-kicker">{asText(data.eyebrow || data.tag)}</p>
            <h2>{asText(data.title)}</h2>
            <p>{asText(data.subtitle)}</p>
            <p className="tpl-chips">{asList(data.chips).map((chip) => asText(chip)).join(" · ")}</p>
            {asText(data.badge) ? <p className="tpl-cta">{asText(data.badge)}</p> : null}
          </div>
          <div className="tpl-cover" aria-hidden="true">CE</div>
        </div>
      );
    default:
      return <p>Este tipo ainda não tem renderizador.</p>;
  }
}

export function EditorialView({ template }: { template: EditorialTemplate }) {
  const square = template.type === "social-post" || template.type === "carousel-cover";
  return (
    <article className={square ? "tpl-frame is-square" : "tpl-frame"} lang="pt-BR">
      <p className="tpl-meta">{template.id} · {template.category}</p>
      <Body template={template} />
      <Brand />
    </article>
  );
}

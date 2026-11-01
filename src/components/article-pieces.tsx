import { useState, type ReactNode } from "react";
import { Callout } from "@/components/callout";

export function Cite({ n }: { n: number[] }) {
  return (
    <>
      {n.map((item) => (
        <sup key={item} className="ce-citation">
          <a className="ce-cite-link" href={`#ref-${item}`} aria-label={`Referência ${item}`}>{item}</a>
        </sup>
      ))}
    </>
  );
}

export function Keyline({ children }: { children: ReactNode }) {
  return <Callout tone="note">{children}</Callout>;
}

export function ArticlePortrait({ src, alt, title, caption, fallbackHref }: { src: string; alt: string; title: string; caption: string; fallbackHref: string }) {
  const [ok, setOk] = useState(true);
  return (
    <figure className="inst-fig has-frame inst-portrait">
      <div className="inst-fig-title">{title}</div>
      {ok ? <img src={src} alt={alt} width={595} height={760} onError={() => setOk(false)} /> : <a href={fallbackHref} rel="noopener noreferrer" target="_blank">Abrir fotografia histórica</a>}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function ContextGrid({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="callouts-grid">
      {items.map((item) => (
        <div key={item.title} className="context-card">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export type ChronologyEvent = { year: string; kind: "life" | "legacy"; title: string; text: string; refs: number[] };

export function Chronology({ events, label }: { events: ChronologyEvent[]; label: string }) {
  const [filter, setFilter] = useState<"all" | "life" | "legacy">("all");
  return (
    <>
      <div className="inst-chronology-controls no-print" role="group" aria-label="Filtrar eventos históricos">
        {(["all", "life", "legacy"] as const).map((item) => (
          <button key={item} className="gt-tool" type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "Todos" : item === "life" ? "Em vida" : "Legado"}
          </button>
        ))}
      </div>
      <ol className="inst-chronology" aria-label={label}>
        {events.map((event) => (
          <li key={event.year + event.title} className="inst-chronology-item" hidden={filter !== "all" && filter !== event.kind}>
            <time className="ue-time">{event.year}</time>
            <div className="inst-chronology-content">
              <h3>{event.title}</h3>
              <p>{event.text}</p>
              <small className="inst-chronology-source">Fonte: <Cite n={event.refs} /></small>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export type ReferenceItem = string | { author?: string; title: string; href?: string; access?: string };

export function ReferenceList({ items }: { items: ReferenceItem[] }) {
  return (
    <ol className="inst-refs-list" aria-label="Referências">
      {items.map((item, index) => {
        if (typeof item === "string") return <li key={item} id={`ref-${index + 1}`}>{item}</li>;
        return (
          <li key={item.href ?? item.title} id={`ref-${index + 1}`}>
            {item.author ? <strong>{item.author} </strong> : null}
            <em>{item.title}</em>
            {item.href ? <> Disponível em: <a href={item.href} rel="noopener noreferrer" target="_blank">{item.href}</a>.</> : null}
            {item.access ? ` Acesso em: ${item.access}.` : null}
          </li>
        );
      })}
    </ol>
  );
}

export function ArticleFaq({ items }: { items: { question: string; answer: ReactNode }[] }) {
  return (
    <div className="inst-faq">
      {items.map((item) => (
        <details key={item.question} className="inst-faq-item">
          <summary>{item.question}</summary>
          <div className="inst-faq-a">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

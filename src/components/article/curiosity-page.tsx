
import { Link } from "@tanstack/react-router";
import { ArticlePage } from "@/components/article/article-page";
import { ArticleFaq } from "@/components/article/pieces";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";
import { curiosityCategoryLabels, findCuriosityMeta } from "@/lib/content/curiosidades/catalog";
import type { CuriosityComponent, CuriosityRecord, CuriositySource } from "@/lib/content/curiosidades/types";
import sourceRegistry from "@/lib/content/curiosidades/sources.json";

const bySourceId = new Map((sourceRegistry as CuriositySource[]).map((source) => [source.source_id, source]));

function EditorialComponent({ item }: { item: CuriosityComponent }) {
  const things = item.items ?? [];
  switch (item.type) {
    case "callout":
    case "evidence":
      return (
        <Callout tone={item.type === "evidence" ? "note" : item.variant === "warn" ? "warn" : "info"}>
          {item.label ? <strong>{item.label} </strong> : null}
          {item.text ?? ""}
        </Callout>
      );
    case "faq":
      return <ArticleFaq items={things.map((entry) => ({
        question: entry.q ?? "Pergunta",
        answer: <>{(entry.paragraphs ?? []).map((text, i) => <p key={i}>{text}</p>)}</>,
      }))} />;
    case "cards":
    case "pair":
    case "conflict":
    case "stats":
    case "checkgrid":
      return (
        <ul className={"inst-cards " + (item.type === "stats" ? "cols-3" : "cols-2")}>
          {things.map((entry, index) => (
            <li key={index} className="inst-card">
              <h3>{item.type === "stats" ? (entry.k ?? entry.title ?? "") : (entry.title ?? "")}</h3>
              {entry.text ? <p>{entry.text}</p> : null}
              {entry.f ? <p>{entry.f}</p> : null}
              {entry.bullets?.length ? <ul className="inst-list">{entry.bullets.map((text, i) => <li key={i}>{text}</li>)}</ul> : null}
            </li>
          ))}
        </ul>
      );
    case "timeline":
      return (
        <ol className="inst-chronology">
          {things.map((entry, index) => (
            <li key={index} className="inst-chronology-item">
              {entry.time ? <time className="ue-time">{entry.time}</time> : null}
              <div className="inst-chronology-content">
                <h3>{entry.title}</h3>
                {entry.text || entry.f ? <p>{entry.text ?? entry.f}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="inst-callout is-info">
          <div>
            <p>{item.text}</p>
            {item.cite ? <cite>{item.cite}</cite> : null}
          </div>
        </blockquote>
      );
    default: {
      // Falha visível: componentes não mapeados nunca somem silenciosamente.
      const neverType = (item as { type: string }).type;
      return <Callout tone="warn">Componente editorial sem renderizador: {neverType}.</Callout>;
    }
  }
}

export function CuriosityPage({ record }: { record: CuriosityRecord }) {
  const { content } = record;
  const sections = content.sections ?? [];
  const allSources = content.references ?? [];
  const related = (content.related_slugs ?? [])
    .map(findCuriosityMeta)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => item.slug !== record.slug)
    .map((item) => ({
      title: item.title,
      text: curiosityCategoryLabels[item.category] ?? item.category,
      to: "/blog/$slug" as const,
      params: { slug: item.slug },
    }));

  return (
    <ArticlePage
      kind="artigo"
      crumbs={[{ label: "Início", to: "/" }, { label: "Curiosidades", href: "/blog" }, { label: content.title }]}
      eyebrow={curiosityCategoryLabels[record.category] ?? "Curiosidades de Enfermagem"}
      title={content.title}
      lead={content.hero_lead || content.intro?.lead || ""}
      toc={[
        { id: "visao-geral", label: "Visão geral" },
        ...sections.map((section) => ({ id: section.id, label: section.title })),
        { id: "referencias", label: "Referências" },
      ]}
      related={<RelatedContent title="Leia também" items={related} />}
      footer={<p className="inst-note">Material de prévia editorial. A fonte de verdade continua sendo o banco governado. <Link to="/secao/$slug" params={{ slug: "contato" }}>Informar inconsistência</Link>.</p>}
    >
      <section className="inst-sec" id="visao-geral" aria-labelledby="curiosity-overview">
        <h2 id="curiosity-overview">Visão geral</h2>
        <Callout tone="warn">
          <strong>Prévia não homologada.</strong> Estado no banco: {record.content_status}.
          As informações e referências ainda exigem revisão; não utilizar como protocolo clínico nem publicação autorizada.
        </Callout>
        {content.subtitle ? <p><strong>{content.subtitle}</strong></p> : null}
        {content.intro?.lead ? <p>{content.intro.lead}</p> : null}
        {content.intro?.bullets?.length ? (
          <ul className="inst-list">{content.intro.bullets.map((line, i) => <li key={i}>{line}</li>)}</ul>
        ) : null}
        {content.intro?.context ? <p>{content.intro.context}</p> : null}
        {content.period || content.region ? <p className="inst-note">{[content.period, content.region].filter(Boolean).join(" · ")}</p> : null}
      </section>
      {sections.map((section) => (
        <section className="inst-sec" key={section.id} id={section.id} aria-labelledby={"curiosity-" + section.id}>
          <h2 id={"curiosity-" + section.id}>{section.title}</h2>
          {(section.paragraphs ?? []).map((text, i) => <p key={i}>{text}</p>)}
          {(section.components ?? []).map((item, i) => <EditorialComponent key={i} item={item} />)}
          {section.sources?.length ? (
            <p className="inst-note">
              Fontes declaradas: {section.sources.map((id) => {
                const source = bySourceId.get(id);
                return source ? source.organization || source.title || id : id + " (pendente de conciliação)";
              }).join(" · ")}
            </p>
          ) : null}
        </section>
      ))}
      <section className="inst-sec" id="referencias" aria-labelledby="curiosity-references">
        <h2 id="curiosity-references">Referências declaradas</h2>
        <p>Os vínculos abaixo reproduzem o cadastro do projeto; sua validação bibliográfica e os direitos permanecem sujeitos aos gates editoriais.</p>
        <ol className="inst-refs-list">
          {allSources.map((ref, i) => {
            const source = bySourceId.get(ref.id);
            const safeUrl = source?.url && /^https?:\/\//i.test(source.url) ? source.url : null;
            return (
              <li key={ref.id + "-" + i} id={"ref-" + (i + 1)}>
                {source ? (
                  <>
                    <strong>{source.organization || "Instituição não identificada"}. </strong>
                    {source.title || ref.id}. {source.source_year ? source.source_year + ". " : ""}
                    {safeUrl ? <a href={safeUrl} target="_blank" rel="noopener noreferrer">Consultar fonte original</a> : null}
                    <small> · {ref.id} · verificação: {source.web_status || "não informada"}</small>
                  </>
                ) : <span>{ref.id} — fonte não conciliada no registro.</span>}
              </li>
            );
          })}
        </ol>
      </section>
    </ArticlePage>
  );
}

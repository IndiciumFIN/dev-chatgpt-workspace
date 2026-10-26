import { ArticlePage } from "@/components/article/article-page";
import { ArticleFaq, Cite, ContextGrid, Keyline, ReferenceList } from "@/components/article/pieces";
import { RelatedContent } from "@/components/site/related-content";
import {
  curiosityReferenceNumbers, curiosityToc,
  type CuriosityBlock, type CuriosityContent, type CuriositySource,
} from "@/lib/content/curiosidades/model";

/**
 * Projeção de Curiosidades no MESMO frame de Mary Eliza Mahoney (MEM).
 * Mantém ArticlePage, Shell do chamador, pieces.tsx e article.css.
 * Não carrega banco, não muda flags e não decide publicação.
 * Só invocar após gate de autorização no servidor; conteúdo de HOLD não é público.
 */
export function CuriosityView({
  content, sources, publishedRelatedSlugs = [],
}: {
  content: CuriosityContent;
  sources: ReadonlyMap<string, CuriositySource>;
  publishedRelatedSlugs?: readonly string[];
}) {
  const citationNumbers = curiosityReferenceNumbers(content);
  const available = new Set(publishedRelatedSlugs);
  const related = (content.related_slugs ?? []).filter((slug) => available.has(slug));

  return (
    <ArticlePage
      kind="artigo"
      crumbs={[
        { label: "Início", to: "/" },
        { label: "Biblioteca", to: "/secao/$slug", params: { slug: "biblioteca" }, hash: "blog" },
        { label: content.title },
      ]}
      eyebrow={"História e curiosidades da enfermagem · " + content.category}
      title={content.title}
      lead={content.hero_lead}
      toc={curiosityToc(content)}
      related={related.length > 0
        ? <RelatedContent items={related.map((slug) => ({
            to: "/blog/$slug" as const, params: { slug }, title: slug.replace(/-/g, " "),
          }))} />
        : undefined}
      footer={<p className="inst-note">Conteúdo educativo com referências identificadas. Consulte as fontes originais e as respectivas datas de revisão.</p>}
    >
      <section className="inst-sec" id="introducao" aria-labelledby="curiosidade-intro-h">
        <h2 id="curiosidade-intro-h">Introdução</h2>
        {content.intro?.lead ? <p>{content.intro.lead}</p> : null}
        {content.intro?.bullets?.length ? (
          <ul className="inst-list">{content.intro.bullets.map((point, i) => <li key={i}>{point}</li>)}</ul>
        ) : null}
        {content.intro?.context ? <p>{content.intro.context}</p> : null}
      </section>
      {content.sections.map((section) => {
        const citations = section.sources
          .map((sourceId) => citationNumbers.get(sourceId))
          .filter((n): n is number => typeof n === "number");
        return (
          <section key={section.id} className="inst-sec" id={section.id} aria-labelledby={"curiosidade-" + section.id + "-h"}>
            <h2 id={"curiosidade-" + section.id + "-h"}>{section.title}</h2>
            {section.paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
            {section.components.map((block, idx) => <CuriosityBlockView block={block} key={section.id + "-" + idx} />)}
            {citations.length ? <p className="inst-note">Fontes desta seção: <Cite n={citations} /></p> : null}
          </section>
        );
      })}
      {content.summary_items?.length ? (
        <section className="inst-sec" aria-label="Síntese">
          <h2>Em síntese</h2>
          <ul className="inst-list">{content.summary_items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </section>
      ) : null}
      <section className="inst-sec inst-refs" id="referencias" aria-labelledby="curiosidade-referencias-h">
        <h2 id="curiosidade-referencias-h">Referências</h2>
        <ReferenceList items={content.references.map(({ id }) => {
          const source = sources.get(id);
          return source
            ? { author: source.organization, title: source.title, href: source.url || undefined }
            : { title: "Fonte pendente de identificação: " + id };
        })} />
      </section>
    </ArticlePage>
  );
}

function CuriosityBlockView({ block }: { block: CuriosityBlock }) {
  switch (block.type) {
    case "callout":
    case "evidence":
      return <Keyline>{block.label ? <strong>{block.label} </strong> : null}{block.text}</Keyline>;
    case "cards":
    case "stats":
      return (
        <ul className={"inst-cards cols-" + Math.min(4, Math.max(2, block.cols ?? (block.type === "stats" ? 4 : 3))) + (block.compact ? " is-compact" : "")}>
          {(block.items ?? []).map((item, idx) => (
            <li key={idx} className="inst-card">
              <h3>{block.type === "stats" ? (item.k ?? item.title ?? item.f) : item.title}</h3>
              {block.type === "stats" && item.f ? <strong>{item.f}</strong> : null}
              <p>{item.text ?? item.v ?? item.title}</p>
            </li>
          ))}
        </ul>
      );
    case "pair":
    case "conflict":
      return <ContextGrid items={(block.items ?? []).map((item) => ({
        title: item.title ?? "Comparação", text: item.text ?? "",
      }))} />;
    case "timeline":
      return (
        <ol className="inst-chronology" aria-label="Linha do tempo">
          {(block.items ?? []).map((item, idx) => (
            <li key={idx} className="inst-chronology-item">
              <time className="ue-time">{item.time ?? ""}</time>
              <div className="inst-chronology-content">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "faq":
      return <ArticleFaq items={(block.items ?? []).map((item) => ({
        question: item.q ?? "Pergunta",
        answer: <>{(item.paragraphs ?? []).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}</>,
      }))} />;
    case "checkgrid":
      return (
        <ul className="inst-cards cols-2">
          {(block.items ?? []).map((item, idx) => (
            <li className="inst-card" key={idx}>
              <h3>{item.title}</h3>
              <ul className="inst-list">{(item.bullets ?? []).map((v, j) => <li key={j}>{v}</li>)}</ul>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="inst-history">
          <p>“{block.text}”</p>
          {block.cite ? <footer><cite>{block.cite}</cite></footer> : null}
        </blockquote>
      );
    default:
      // Nunca inventar componentes nem omitir silenciosamente um bloco novo.
      throw new Error("MEM_UNSUPPORTED_COMPONENT:" + block.type);
  }
}

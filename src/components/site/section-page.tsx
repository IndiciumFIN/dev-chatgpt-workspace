import { useState, type FormEvent } from "react";
import { AppLink } from "@/components/site/app-link";
import { ArticlePage } from "@/components/article/article-page";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";
import { StudyDesk } from "@/components/site/study";
import { SubscriptionPanel } from "@/components/site/subscription";
import { Translated } from "@/components/site/translated";
import { imageAlt, useStored } from "@/lib/stored";
import { useChrome } from "@/lib/chrome";
import { navLabel } from "@/lib/translate";
import type { CatalogItem, Section } from "@/lib/sections";

const pageVisual: Record<string, { src: string; alt: string; caption: string }> = {
  "missao-visao-valores": {
    src: "/brand/enfermeira.webp",
    alt: "Profissional de enfermagem usada na página inicial.",
    caption: "Recurso visual da página inicial. Não descreve um caso clínico.",
  },
  "objetivos-do-site": {
    src: "/brand/livro.webp",
    alt: "Livro aberto usado na identidade do site.",
    caption: "Recurso visual da identidade do site.",
  },
  "equipe-e-autores": {
    src: "/brand/chapeu.webp",
    alt: "Chapéu de enfermagem da identidade do site.",
    caption: "Marca do site. Não é retrato da equipe.",
  },
  termos: {
    src: "/brand/livro.webp",
    alt: "Livro aberto usado na identidade do site.",
    caption: "Recurso visual da identidade do site.",
  },
  compromisso: {
    src: "/institucional/selo-sustentabilidade.webp",
    alt: "Selo de sustentabilidade digital.",
    caption: "Selo de sustentabilidade digital do site.",
  },
  "metodologia-de-medicao": {
    src: "/institucional/selo-sustentabilidade.webp",
    alt: "Selo de sustentabilidade digital.",
    caption: "Selo de sustentabilidade digital do site.",
  },
  "relatorios-de-sustentabilidade": {
    src: "/institucional/selo-sustentabilidade.webp",
    alt: "Selo de sustentabilidade digital.",
    caption: "Selo de sustentabilidade digital do site.",
  },
  acessibilidade: {
    src: "/institucional/selo-acessibilidade.webp",
    alt: "Selo de acessibilidade digital.",
    caption: "Selo de acessibilidade digital do site.",
  },
  politicas: {
    src: "/institucional/selo-lgpd.webp",
    alt: "Selo de proteção de dados.",
    caption: "Selo de proteção de dados do site.",
  },
};

function Card({ item }: { item: CatalogItem }) {
  const { locale } = useChrome();
  const body = (
    <>
      <h3>
        {item.title}
        {item.live ? <span className="live-pill">{navLabel("No ar", "No ar", locale)}</span> : null}
      </h3>
      <p>{item.text}</p>
      {!item.live && !item.dest ? (
        <p className="tool-help">
          <Translated text="Catalogado no menu. O cálculo ainda não entrou no template." />
        </p>
      ) : null}
    </>
  );
  if (!item.dest) {
    return (
      <article id={item.id} className="nav-card catalog-card">
        {body}
      </article>
    );
  }
  return (
    <AppLink dest={item.dest} className="nav-card catalog-card">
      {body}
    </AppLink>
  );
}

function matches(item: CatalogItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${item.title} ${item.text}`.toLowerCase().includes(q);
}

export function SectionPage({
  section,
  query,
  framed,
  trail,
  related,
}: {
  section: Section;
  query?: string;
  framed: boolean;
  trail: { label: string; slug?: string }[];
  related: { slug: string; label: string; text: string }[];
}) {
  const { locale, t } = useChrome();
  const { images } = useStored();
  const [sent, setSent] = useState(false);
  const q = query ?? "";

  function onContact(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  const notes = framed ? section.blocks.filter((block) => /transpar/i.test(block.title)) : [];
  const content = framed ? section.blocks.filter((block) => !/transpar/i.test(block.title)) : section.blocks;
  const shorts = framed ? content.filter((block) => (block.text?.length ?? 0) < 90 && block.items.length === 0) : [];
  const longs = framed ? content.filter((block) => !shorts.includes(block)) : content;
  const toc = [
    ...longs.filter((block) => block.title).map((block) => ({ id: block.id, label: block.title })),
    ...(shorts.length > 0 ? [{ id: "principios", label: "Princípios" }] : []),
  ];
  const visual = pageVisual[section.slug];
  const extras = (
    <>
      {section.kind === "subscribe" ? <SubscriptionPanel /> : null}
      {q ? <p className="tool-help">Busca: “{q}”.</p> : null}
      {section.slug === "simulados" && !q ? <StudyDesk /> : null}
    </>
  );
  const catalog = longs.map((block, index) => {
    const items = block.items.filter((item) => matches(item, q));
    if (q && items.length === 0 && block.items.length > 0) return null;
    const text = block.text ? <p><Translated text={block.text} /></p> : null;
    return (
      <section key={block.id} id={block.id} className={framed ? "inst-sec" : "tool-block section-anchor"} aria-labelledby={`${block.id}-h`}>
        <h2 id={`${block.id}-h`}>
          <Translated text={block.title} />
        </h2>
        {framed && index === 0 && visual ? (
          <div className="inst-split is-fig-esquerda">
            <figure className="inst-fig has-frame">
              <img src={visual.src} alt={imageAlt(images, visual.src, locale, visual.alt)} />
              <figcaption>{visual.caption}</figcaption>
            </figure>
            {text}
          </div>
        ) : text}
        {items.length > 0 ? (
          <ul className="related-grid">
            {items.map((item) => (
              <li key={item.id}>
                <Card item={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  });
  const principles = shorts.length > 0 ? (
    <section className="inst-sec" id="principios" aria-labelledby="principios-h">
      <h2 id="principios-h">Princípios</h2>
      <ul className="inst-cards cols-3">
        {shorts.map((block) => (
          <li key={block.id} className="inst-card">
            <h3><Translated text={block.title} /></h3>
            <p><Translated text={block.text ?? ""} /></p>
          </li>
        ))}
      </ul>
    </section>
  ) : null;
  const note = notes.map((block) => (
    <Callout key={block.id}>
      <Translated text={block.text ?? ""} />
    </Callout>
  ));

  if (!framed) {
    return (
      <ArticlePage
        kind="secao"
        crumbs={[{ label: t("home"), to: "/" }, { label: <Translated text={section.title} /> }]}
        eyebrow={<Translated text={section.kicker} />}
        title={<Translated text={section.title} />}
        lead={<Translated text={section.lead} />}
      >
        {extras}
        {catalog}
      </ArticlePage>
    );
  }

  return (
    <ArticlePage
      kind="artigo"
      crumbs={[
        { label: t("home"), to: "/" },
        ...trail.map((item) => (
          item.slug
            ? { label: item.label, to: "/secao/$slug" as const, params: { slug: item.slug } }
            : { label: item.label }
        )),
        { label: <Translated text={section.title} /> },
      ]}
      eyebrow={<Translated text={section.kicker} />}
      title={<Translated text={section.title} />}
      lead={<Translated text={section.lead} />}
      toc={[
        ...(section.kind === "contact" ? [{ id: "contato-form", label: "Mensagem" }] : []),
        ...toc,
      ]}
      related={
        <RelatedContent
          items={related.map((tab) => ({ title: tab.label, text: tab.text, to: "/secao/$slug" as const, params: { slug: tab.slug } }))}
        />
      }
    >
      {section.kind === "contact" ? (
        <section className="inst-sec" aria-labelledby="contato-form">
          <h2 id="contato-form">Mensagem</h2>
          {sent ? (
            <p>Mensagem anotada só nesta tela. Nada foi gravado nem enviado.</p>
          ) : (
            <form className="patient-grid" onSubmit={onContact}>
              <label className="field">
                <span>Nome</span>
                <input name="nome" required autoComplete="name" />
              </label>
              <label className="field">
                <span>E-mail</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className="field" style={{ gridColumn: "1 / -1" }}>
                <span>Mensagem</span>
                <textarea name="mensagem" required rows={4} />
              </label>
              <button className="btn-navy" type="submit">
                Registrar nesta tela
              </button>
            </form>
          )}
        </section>
      ) : null}
      {catalog}
      {principles}
      {note}
    </ArticlePage>
  );
}

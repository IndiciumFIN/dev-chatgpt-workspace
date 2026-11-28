import { createFileRoute, notFound as raiseNotFound, retainSearchParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { BiographyView } from "@/components/templates/biography-view";
import { ArticlePage } from "@/components/article/article-page";
import { RelatedContent } from "@/components/site/related-content";
import { findArticle, type ArticleSlug } from "@/lib/content/articles/index";
import { findCuriosityMeta } from "@/lib/content/curiosidades/catalog";
import { CuriosityPage } from "@/components/article/curiosity-page";
import { languageLinks } from "@/lib/seo";
import { parseLocale } from "@/lib/translate";

/**
 * Rota dinâmica `/blog/$slug` — serve todo o catálogo de artigo.
 *
 * Mesmo desenho do catálogo clínico: um arquivo de rota para N itens, em vez de
 * um arquivo por artigo. Um artigo novo é uma entrada em
 * `src/lib/content/articles/<slug>.ts` mais o corpo em `BODIES` abaixo.
 */

/**
 * Corpo de cada artigo. Vive na rota porque é JSX; o resto dos dados vive na
 * lib. Um artigo novo = uma entrada no catálogo + uma linha aqui.
 */
const BODIES: Record<ArticleSlug, () => React.ReactNode> = {
  "mary-eliza-mahoney": () => <BiographyView />,
};

export const Route = createFileRoute("/blog/$slug")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  loader: async ({ params }) => {
    const article = findArticle(params.slug);
    if (article) return { kind: "published" as const, slug: article.slug };
    // Drafts exist ONLY in explicitly opted-in localhost development/CI preview.
    // This branch is dead in a production build; the post-build gate scans for leaked bodies.
    if (import.meta.env.DEV && import.meta.env.VITE_CURIOSIDADES_MEM_PREVIEW === "true") {
      const { loadCuriosity } = await import("@/lib/content/curiosidades/load");
      const record = await loadCuriosity(params.slug);
      if (record) return { kind: "editorial-preview" as const, record };
    }
    throw raiseNotFound();
  },
  head: ({ match, params }) => {
    const article = findArticle(params.slug);
    if (!article) {
      const allowed = import.meta.env.DEV &&
        import.meta.env.VITE_CURIOSIDADES_MEM_PREVIEW === "true" &&
        Boolean(findCuriosityMeta(params.slug));
      return allowed ? { meta: [
        { title: "Prévia editorial não homologada · Calculadoras de Enfermagem" },
        { name: "robots", content: "noindex, nofollow, noarchive" },
      ] } : { meta: [{ name: "robots", content: "noindex, nofollow, noarchive" }] };
    }
    const lang = (match.search as { lang?: unknown }).lang;
    return {
      meta: [
        { title: `${article.seoTitle} · Calculadoras de Enfermagem` },
        { name: "description", content: article.description },
        { property: "og:type", content: "article" },
      ],
      links: languageLinks(`/blog/${article.slug}`, lang),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.seoTitle,
            description: article.description,
            inLanguage: typeof lang === "string" ? lang : "pt-BR",
            dateModified: article.dateModified,
            ...(article.schema ? { about: article.schema } : {}),
          }),
        },
      ],
    };
  },
  component: ArticleRouteView,
});

function ArticleRouteView() {
  const { slug } = Route.useParams();
  const loaded = Route.useLoaderData();
  if (loaded.kind === "editorial-preview") return <Shell><CuriosityPage record={loaded.record} /></Shell>;
  const article = findArticle(slug);
  // O loader já garantiu que existe; este guard cobre o render direto.
  if (!article) return <ArticleMissing />;
  const Body = BODIES[slug as ArticleSlug];
  if (!Body) return <ArticleMissing />;
  return (
    <Shell>
      <Body />
    </Shell>
  );
}

function ArticleMissing() {
  return (
    <Shell>
      <ArticlePage
        kind="artigo"
        crumbs={[{ label: "Início", to: "/" }, { label: "Artigo não encontrado" }]}
        eyebrow="Conteúdo"
        title="Artigo não encontrado"
        lead="O endereço acessado não corresponde a nenhum artigo do catálogo."
        toc={[]}
        related={
          <RelatedContent
            items={[
              { to: "/blog/mary-eliza-mahoney", title: "Mary Eliza Mahoney", text: "Biografia e linha do tempo." },
            ]}
          />
        }
        footer={
          <p className="inst-note">
            Se você esperava este conteúdo aqui, <Link to="/secao/$slug" params={{ slug: "contato" }}>avise</Link>.
          </p>
        }
      >
        <section className="inst-sec">
          <h2>Verifique o endereço</h2>
          <p>O catálogo editorial é fechado. Links antigos podem apontar para um artigo que ainda não foi publicado.</p>
        </section>
      </ArticlePage>
    </Shell>
  );
}
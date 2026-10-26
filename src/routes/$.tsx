import { createFileRoute, Link, notFound, redirect, retainSearchParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArticlePage } from "@/components/article/article-page";
import { HomePage } from "@/components/site/home-page";
import { Shell } from "@/components/site/shell";
import { readPublishedContent } from "@/lib/content-object.functions";
import { kindForSitemap, toolSlugForSitemap } from "@/lib/sitemap-kind";
import { absoluteUrl, languageLinks } from "@/lib/seo";
import { parseLocale } from "@/lib/translate";

const marker = /\[\[([^\]|]+)\|(\/[a-zA-Z0-9_./-]+\.html)\]\]/g;

export const Route = createFileRoute("/$")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  loader: async ({ params }) => {
    const path = `/${params._splat ?? ""}`;
    const slug = toolSlugForSitemap(path);
    if (slug) throw redirect({ to: "/ferramentas/$slug", params: { slug } });
    if (/^\/[a-z]{2}\/index\.html$/.test(path)) {
      return {
        path,
        locale: path.slice(1, 3),
        kind: "home" as const,
        title: "Calculadoras de Enfermagem",
        lead: "",
        body: "",
        status: "publicado" as const,
        canonical_path: "/",
        slug: "home",
        view: "leitura",
        editions: [],
      };
    }
    const row = await readPublishedContent({ data: path });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, params, match }) => {
    const origin = loaderData?.canonical_path || `/${params._splat ?? ""}`;
    return {
      meta: [
        { title: loaderData ? `${loaderData.title} · Calculadoras de Enfermagem` : "Página" },
        { name: "description", content: loaderData?.lead ?? "" },
      ],
      links: [
        { rel: "canonical", href: absoluteUrl(origin) },
        ...languageLinks(`/${params._splat ?? ""}`, (match.search as { lang?: unknown }).lang).filter((link) => link.rel !== "canonical"),
      ],
    };
  },
  component: SitemapRoute,
});

function SitemapRoute() {
  const row = Route.useLoaderData();
  const homeLocale = row.path.match(/^\/([a-z]{2})\/index\.html$/)?.[1];
  if (homeLocale) {
    return (
      <Shell editions={row.editions} currentPath={row.path}>
        <HomePage copyLocale={homeLocale} />
      </Shell>
    );
  }
  const kind = kindForSitemap(row.path);
  return (
    <Shell editions={row.editions} currentPath={row.path}>
      <ArticlePage
        kind={kind}
        crumbs={[{ label: "Início", to: "/" }, { label: row.title }]}
        eyebrow={kind}
        title={row.title}
        lead={row.lead || "Página do acervo."}
      >
        {row.canonical_path && row.canonical_path !== row.path ? (
          <p>
            <Link to="/$" params={{ _splat: row.canonical_path.slice(1) }}>{row.canonical_path}</Link>
          </p>
        ) : null}
        {row.body
          ? row.body.split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{renderParagraph(paragraph)}</p>)
          : <p>O texto desta página ainda não entrou.</p>}
      </ArticlePage>
    </Shell>
  );
}

function renderParagraph(paragraph: string) {
  const pieces: ReactNode[] = [];
  let last = 0;
  for (const match of paragraph.matchAll(marker)) {
    const index = match.index ?? 0;
    if (index > last) pieces.push(paragraph.slice(last, index));
    pieces.push(
      <Link key={`${match[2]}-${index}`} to="/$" params={{ _splat: match[2].slice(1) }}>
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  if (last < paragraph.length) pieces.push(paragraph.slice(last));
  return pieces.length ? pieces : paragraph;
}

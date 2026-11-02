import type { ArticleEntry } from "./types.ts";
import { article as maryElizaMahoney } from "./mary-eliza-mahoney.ts";

/**
 * Índice do catálogo de artigos.
 *
 * ESTE ARQUIVO É GERADO por `scripts/generate-article-index.mjs` a partir dos
 * arquivos em `src/lib/content/articles/`. Não edite à mão: o próximo run sobrescreve.
 *
 * Um artigo por arquivo (preferência do dono) e um índice por discovery. A
 * lista de imports NÃO é mantida à mão de propósito — um arquivo novo que
 * ninguém adicionou aqui é exatamente o artigo que não apareceria no sitemap,
 * e o gate de contratos não veria.
 */

export const ARTICLES = {
  "mary-eliza-mahoney": maryElizaMahoney,
} satisfies Record<string, ArticleEntry>;

export type ArticleSlug = keyof typeof ARTICLES;

export const articleSlugs = Object.keys(ARTICLES) as ArticleSlug[];

export function findArticle(slug: string): ArticleEntry | undefined {
  // `hasOwnProperty` e não um lookup direto: um slug como "constructor" ou
  // "toString" herdaria o método do prototype em vez de dar "não encontrado".
  return Object.prototype.hasOwnProperty.call(ARTICLES, slug)
    ? (ARTICLES[slug as ArticleSlug] as ArticleEntry)
    : undefined;
}

export type { ArticleEntry };

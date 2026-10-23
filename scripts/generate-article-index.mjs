#!/usr/bin/env node
/**
 * Gera `src/lib/content/articles/index.ts` a partir dos arquivos soltos.
 *
 * Um artigo por arquivo (preferência do dono), um índice por discovery. Se o
 * índice fosse escrito à mão, um artigo novo que ninguém adicionou ao índice
 * simplesmente não existiria para o sitemap, para os links e para o gate —
 * falha silenciosa, do tipo que a auditoria inteira veio remover.
 *
 *   node scripts/generate-article-index.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DIR = "src/lib/content/articles";
const OUT = `${DIR}/index.ts`;

const arquivos = readdirSync(DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
  .sort();

if (!arquivos.length) {
  console.error("BLOCKED: nenhum artigo em " + DIR);
  process.exit(1);
}

// o slug vem do proprio arquivo, extraindo `export const article: ArticleEntry = { slug: "..." }`
const slugs = new Map();
for (const f of arquivos) {
  const t = readFileSync(`${DIR}/${f}`, "utf8");
  const m = t.match(/slug:\s*"([^"]+)"/);
  if (!m) {
    console.error(`BLOCKED: ${f} não declara \`slug\`.`);
    process.exit(1);
  }
  if (slugs.has(m[1])) {
    console.error(`BLOCKED: slug duplicado "${m[1]}" em ${f} e ${slugs.get(m[1])}.`);
    process.exit(1);
  }
  slugs.set(m[1], { file: f, ident: f.replace(/\.ts$/, "").replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase()) });
}

const imports = [...slugs.values()].map((s) => `import { article as ${s.ident} } from "./${s.file}";`).join("\n");
const entradas = [...slugs.keys()].map((s) => `  ${JSON.stringify(s)}: ${slugs.get(s).ident},`).join("\n");

writeFileSync(OUT, `import type { ArticleEntry } from "./types.ts";
${imports}

/**
 * Índice do catálogo de artigos.
 *
 * ESTE ARQUIVO É GERADO por \`scripts/generate-article-index.mjs\` a partir dos
 * arquivos em \`${DIR}/\`. Não edite à mão: o próximo run sobrescreve.
 *
 * Um artigo por arquivo (preferência do dono) e um índice por discovery. A
 * lista de imports NÃO é mantida à mão de propósito — um arquivo novo que
 * ninguém adicionou aqui é exatamente o artigo que não apareceria no sitemap,
 * e o gate de contratos não veria.
 */

export const ARTICLES = {
${entradas}
} satisfies Record<string, ArticleEntry>;

export type ArticleSlug = keyof typeof ARTICLES;

export const articleSlugs = Object.keys(ARTICLES) as ArticleSlug[];

export function findArticle(slug: string): ArticleEntry | undefined {
  // \`hasOwnProperty\` e não um lookup direto: um slug como "constructor" ou
  // "toString" herdaria o método do prototype em vez de dar "não encontrado".
  return Object.prototype.hasOwnProperty.call(ARTICLES, slug)
    ? (ARTICLES[slug as ArticleSlug] as ArticleEntry)
    : undefined;
}

export type { ArticleEntry };
`);

console.log(`${OUT} gerado com ${slugs.size} artigo(s): ${[...slugs.keys()].join(", ")}`);

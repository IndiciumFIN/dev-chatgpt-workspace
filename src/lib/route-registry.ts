/**
 * Route Registry — a fonte unica de verdade de rota.
 *
 * UTC-051: "Rota/canonical vem do Route Registry; nenhum canonical hardcoded
 * em pagina."
 *
 * Antes desta conflito:
 *   - `src/lib/contract.ts` montava o sitemap a partir do catalogo;
 *   - `src/lib/seo.ts` montava canonical e hreflang a partir de uma lista
 *     propria de idiomas.
 * Duas listas, dois lugares, nenhuma verificacao de que concordam. Um caminho
 * pode estar no sitemap e nao ter canonical, ou ter canonical e nao estar no
 * sitemap — e nada ve.
 *
 * Aqui a rota e declarada UMA vez, com o que o buscador precisa saber dela:
 * o caminho canonico, o titulo, a descricao, se e indexavel, e o par de
 * idiomas. `publicPaths()` e `languageLinks()` passam a CONSUMIR este registro.
 */
import { listSections } from "@/lib/sections";
import { articleSlugs, findArticle } from "@/lib/content/articles/index";
import { tools } from "@/lib/tools/catalog";
import { localesWithInterface } from "@/lib/locale-registry";
import { siteOrigin } from "@/lib/site-origin";

export type RouteKind = "home" | "secao" | "artigo" | "ferramenta";

export type RouteEntry = {
  /** Caminho canonico, sem query string. */
  path: string;
  kind: RouteKind;
  title: string;
  description: string;
  /**
   * Entra no sitemap e pode ser indexada.
   *
   * `false` para o que e alcancavel mas nao indexavel — o padrao que o projeto
   * ja usava em `/modelos` e `/oficina-local`, e que a Aldrete (candidata,
   * com HOLDs em aberto) passou a usar.
   */
  indexavel: boolean;
};

function secoes(): RouteEntry[] {
  return listSections().map((section) => ({
    path: `/secao/${section.slug}`,
    kind: "secao" as const,
    title: section.title,
    description: section.lead,
    indexavel: true,
  }));
}

function artigos(): RouteEntry[] {
  return articleSlugs.map((slug) => {
    const article = findArticle(slug);
    return {
      path: `/blog/${slug}`,
      kind: "artigo" as const,
      title: article?.title ?? slug,
      description: article?.lead ?? "",
      indexavel: true,
    };
  });
}

function ferramentas(): RouteEntry[] {
  return tools.map((tool) => ({
    path: `/ferramentas/${tool.slug}`,
    kind: "ferramenta" as const,
    title: tool.title,
    description: tool.lead,
    // `publicacao: "candidata"` fica FORA do indice ate a homologacao humana
    // (CKO-POL-R-005, FIND-CTR-009). Ver `clinical-tools.v1.json`.
    indexavel: (tool.publicacao ?? "publicada") === "publicada",
  }));
}

/** O registro, na ordem em que as rotas aparecem no sitemap. */
export const routeRegistry: RouteEntry[] = [
  {
    path: "/",
    kind: "home",
    title: "Calculadoras de Enfermagem",
    description: "Escalas, protocolos e calculadoras clínicas de enfermagem.",
    indexavel: true,
  },
  ...artigos(),
  ...secoes(),
  ...ferramentas(),
];

export const registryByPath = new Map(routeRegistry.map((entry) => [entry.path, entry]));

/** Caminhos que entram no sitemap, na ordem do registro. */
export function indexablePaths(): string[] {
  return routeRegistry.filter((entry) => entry.indexavel).map((entry) => entry.path);
}

/** Todo caminho conhecido — indexavel ou nao. */
export function allPaths(): string[] {
  return routeRegistry.map((entry) => entry.path);
}

export function routeEntry(path: string): RouteEntry | undefined {
  return registryByPath.get(path);
}

/**
 * Os idiomas DECLARADOS como alternativa para uma rota.
 *
 * Sao os 4 que tem dicionario de interface (`localesWithInterface`), e nao os
 * 19 do registro de locales: os 15 restantes entregam o mesmo conteudo do
 * portugues, e declara-los como alternativa seria dizer ao buscador que sao
 * paginas diferentes.
 */
export function alternateLocales(): string[] {
  return localesWithInterface;
}

/**
 * O idioma canonico de uma rota, dado o idioma pedido.
 *
 * Um idioma sem dicionario nao tem pagina propria: o conteudo e o portugues, e
 * o endereco canonico e o mesmo da versao pt-BR.
 */
export function canonicalLocale(lang: unknown): string {
  return localesWithInterface.includes(lang as never) ? (lang as string) : "pt-BR";
}

export { siteOrigin };

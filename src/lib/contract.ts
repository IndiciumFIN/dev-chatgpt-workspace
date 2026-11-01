import { siteOrigin } from "@/lib/site-origin";
import { indexablePaths } from "@/lib/route-registry";
import { tools } from "@/lib/tools/catalog";
import { listSections } from "@/lib/sections";
import { articleSlugs } from "@/lib/content/articles/index";

export type ContractCheck = { id: string; ok: boolean; detail: string };

export function nandaLabels() {
  const labels = new Set<string>();
  for (const tool of tools) {
    for (const band of tool.bands ?? []) {
      for (const label of band.nanda) labels.add(label);
    }
  }
  return [...labels];
}

/**
 * Os caminhos que entram no sitemap.
 *
 * Deriva do ROUTE REGISTRY (UTC-051): a rota e declarada uma vez, com titulo,
 * descricao e se e indexavel. Nao ha mais lista de rotas parallelas — nao
 * existe mais como um caminho estar no sitemap e nao ter canonical, ou vice
 * versa.
 */
export function publicPaths() {
  return indexablePaths();
}

export function sitemapXml() {
  const body = publicPaths()
    .map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function contractReport(): ContractCheck[] {
  const checks: ContractCheck[] = [];
  const slugs = tools.map((tool) => tool.slug);
  checks.push({
    id: "slugs",
    ok: new Set(slugs).size === slugs.length && slugs.length > 0,
    detail: `${slugs.length} ferramentas com endereço único.`,
  });
  const titles = tools.map((tool) => tool.title);
  checks.push({
    id: "titulos",
    ok: new Set(titles).size === titles.length,
    detail: "Nenhuma ferramenta repete o título.",
  });
  for (const tool of tools) {
    const hasBody = tool.lead.length > 20 && tool.howTo.length > 0 && tool.faqs.length > 0 && tool.references.length > 0;
    const hasInput = tool.kind === "escala" ? (tool.criteria?.length ?? 0) > 0 : (tool.fields?.length ?? 0) > 0;
    checks.push({
      id: tool.slug,
      ok: hasBody && hasInput && tool.title.length > 3,
      detail: hasBody && hasInput ? `${tool.title}: texto, entrada e referência.` : `${tool.title}: falta conteúdo do contrato.`,
    });
  }
  const sections = listSections();
  const required = ["politicas", "mapa", "acessibilidade", "compromisso", "simulados", "nanda", "glossario"];
  checks.push({
    id: "secoes",
    ok: required.every((slug) => sections.some((section) => section.slug === slug)),
    detail: "Políticas, mapa, acessibilidade, compromisso, simulado, NANDA e glossário existem.",
  });
  const nanda = nandaLabels();
  const listed = new Set(
    sections.find((section) => section.slug === "nanda")?.blocks.flatMap((block) => block.items.map((item) => item.title)) ?? [],
  );
  checks.push({
    id: "nanda",
    ok: nanda.length > 0 && nanda.every((label) => listed.has(label)),
    detail: nanda.every((label) => listed.has(label))
      ? "Cada sugestão NANDA das escalas aparece no índice."
      : "Há sugestão NANDA sem página de índice.",
  });
  checks.push({
    id: "artigos",
    ok: articleSlugs.length > 0 && new Set(articleSlugs).size === articleSlugs.length,
    detail: `${articleSlugs.length} artigo(s) no catalogo, com endereço único.`,
  });
  checks.push({
    id: "mapa",
    ok: publicPaths().length >= tools.length + required.length,
    detail: `${publicPaths().length} endereços públicos no mapa para buscadores.`,
  });
  return checks;
}

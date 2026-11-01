import { siteOrigin } from "@/lib/seo";
import { indexablePaths } from "@/lib/route-registry";
import { tools } from "@/lib/tools/catalog";

export type ContractCheck = { id: string; ok: boolean; detail: string };
export type ContractPage = { slug: string; items: string[] };

export function nandaLabels() {
  const labels = new Set<string>();
  for (const tool of tools) {
    for (const band of tool.bands ?? []) {
      for (const label of band.nanda) labels.add(label);
    }
  }
  return [...labels];
}

export function publicPaths() {
  return indexablePaths();
}

export function sitemapXml() {
  const body = publicPaths()
    .map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function contractReport(pages: ContractPage[]): ContractCheck[] {
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
  const required = ["politicas", "mapa", "acessibilidade", "compromisso", "simulados", "nanda", "glossario"];
  checks.push({
    id: "secoes",
    ok: required.every((slug) => pages.some((page) => page.slug === slug)),
    detail: "Políticas, mapa, acessibilidade, compromisso, simulado, NANDA e glossário existem.",
  });
  const nanda = nandaLabels();
  const listed = new Set(pages.find((page) => page.slug === "nanda")?.items ?? []);
  checks.push({
    id: "nanda",
    ok: nanda.length > 0 && nanda.every((label) => listed.has(label)),
    detail: nanda.every((label) => listed.has(label))
      ? "Cada sugestão NANDA das escalas aparece no índice."
      : "Há sugestão NANDA sem página de índice.",
  });
  checks.push({
    id: "mapa",
    ok: publicPaths().length >= tools.length + required.length,
    detail: `${publicPaths().length} endereços públicos no mapa para buscadores.`,
  });
  return checks;
}

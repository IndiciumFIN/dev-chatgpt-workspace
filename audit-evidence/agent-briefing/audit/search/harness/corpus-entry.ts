// Entry point SOMENTE LEITURA: importa os módulos reais do projeto para que a
// medição de cobertura use os dados de verdade, não uma cópia reescrita.
import { primaryNav, accountNav, findByQuery, type NavNode } from "@/lib/nav";
import { listSections, getSection } from "@/lib/sections";
import { tools } from "@/lib/tools/catalog";
import { articleSlugs, ARTICLES } from "@/lib/content/articles/index";
import { calculators, scales, simulations } from "@/lib/site-data";

function walk(list: NavNode[], out: NavNode[] = []) {
  for (const node of list) {
    out.push(node);
    for (const group of node.groups ?? []) walk(group.items, out);
  }
  return out;
}

const nodes = walk([...primaryNav, ...accountNav]);
const sections = listSections();

// Reproduz `publicPaths()` de src/lib/contract.ts (mesma formula, sem importar
// o modulo para nao puxar env.server/SSR para o bundle de medicao).
const publicPaths = [
  "/",
  ...articleSlugs.map((slug) => `/blog/${slug}`),
  ...sections.map((section) => `/secao/${section.slug}`),
  ...tools.map((tool) => `/ferramentas/${tool.slug}`),
];

// O que o fallback `/secao/calculadoras?q=` filtra de verdade.
const fallbackCorpus = getSection("calculadoras")!.blocks.flatMap((block) => block.items);

function fallbackMatch(qRaw: string) {
  const q = qRaw.trim().toLowerCase();
  if (!q) return [];
  return fallbackCorpus.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(q));
}

export const REPORT = {
  counts: {
    navNodesWalked: nodes.length,
    navNodesWithLabel: nodes.filter((n) => !!n.label).length,
    navNodesWithDest: nodes.filter((n) => !!n.dest).length,
    navNodesLive: nodes.filter((n) => n.live).length,
    sections: sections.length,
    tools: tools.length,
    articles: articleSlugs.length,
    articleTitles: Object.values(ARTICLES).map((a) => (a as { title?: string }).title ?? ""),
    publicPaths: publicPaths.length,
    publicPathsList: publicPaths,
    fallbackCorpusItems: fallbackCorpus.length,
    tiles: { calculators: calculators.length, scales: scales.length, simulations: simulations.length },
  },
  labels: nodes.map((n) => ({ id: n.id, label: n.label, live: !!n.live, dest: n.dest ?? null })),
  sectionTitles: sections.map((s) => s.slug + " | " + s.title),
  toolTitles: tools.map((t) => ({ slug: t.slug, title: t.title, category: t.category })),
  fallbackCorpus: fallbackCorpus.map((i) => ({ id: i.id, title: i.title, text: i.text, live: !!i.live, dest: i.dest ?? null })),
};

// Probe: resolve 10 termos pelas DUAS maquinas reais (findByQuery e o filtro
// do fallback). Usado para prever destino; o DOM confirma depois.
const TERMS = [
  "braden",
  "gotejamento",
  "imc",
  "morse",
  "apgar",
  "índice",
  "indice",
  "mary",
  "fugulin",
  "zxqvbnm",
];

export const PROBE = TERMS.map((term) => {
  const dest = findByQuery(term);
  const fb = fallbackMatch(term);
  return {
    term,
    findByQuery: dest ?? null,
    fallbackPath: `/secao/calculadoras?q=${encodeURIComponent(term)}`,
    fallbackMatches: fb.map((i) => ({ title: i.title, live: !!i.live, dest: i.dest ?? null })),
    fallbackCount: fb.length,
  };
});
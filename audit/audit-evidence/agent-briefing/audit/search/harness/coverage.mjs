// Calcula a COBERTURA do indice de busca a partir do corpus.json (dados reais).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "out");
const corpus = JSON.parse(readFileSync(resolve(OUT, "corpus.json"), "utf8"));

/** Converte um Dest do contrato no path publico que ele representa. */
function destToPath(d) {
  if (!d) return null;
  if (d.kind === "home") return "/";
  if (d.kind === "section") return `/secao/${d.slug}`;
  if (d.kind === "tool") return `/ferramentas/${d.slug}`;
  if (d.kind === "model") return `/modelos/${d.id}`;
  if (d.kind === "page") return d.to?.startsWith("/blog/") ? d.to.replace("$slug", "?") : d.to;
  return null;
}

const publicPaths = corpus.counts.publicPathsList;

// --- Maquina 1: findByQuery. Conjunto de destinos que a busca consegue produzir.
const navPaths = new Set();
for (const n of corpus.labels) {
  const p = destToPath(n.dest);
  if (p) navPaths.add(p);
}

// --- Maquina 2: filtro do fallback em /secao/calculadoras.
const fallbackPaths = new Set();
for (const item of corpus.fallbackCorpus) {
  const p = destToPath(item.dest);
  if (p) fallbackPaths.add(p);
}

const reachable = new Set([...navPaths, ...fallbackPaths]);
const reachablePaths = [...reachable];
const missing = publicPaths.filter((p) => !reachable.has(p));

// Quantos itens do fallback realmenteNavigate (dest) vs so texto (sem dest)
const fallbackNav = corpus.fallbackCorpus.filter((i) => i.dest).length;

const byKind = {
  home: { total: publicPaths.filter((p) => p === "/").length, reachable: reachable.has("/") ? 1 : 0 },
  articles: {
    total: corpus.counts.articles,
    reachable: publicPaths.filter((p) => p.startsWith("/blog/")).filter((p) => reachable.has(p)).length,
  },
  sections: {
    total: corpus.counts.sections,
    reachable: publicPaths.filter((p) => p.startsWith("/secao/")).filter((p) => reachable.has(p)).length,
  },
  tools: {
    total: corpus.counts.tools,
    reachable: publicPaths.filter((p) => p.startsWith("/ferramentas/")).filter((p) => reachable.has(p)).length,
  },
};

const totalUniverse = 1 + byKind.articles.total + byKind.sections.total + byKind.tools.total;
const totalReachable = 1 && reachable.has("/") ? 1 : 0 + byKind.articles.reachable + byKind.sections.reachable + byKind.tools.reachable;

const report = {
  counts: corpus.counts,
  navPaths: [...navPaths].sort(),
  fallbackPaths: [...fallbackPaths].sort(),
  reachableCount: publicPaths.filter((p) => reachable.has(p)).length,
  universeCount: publicPaths.length,
  coveragePct: +((publicPaths.filter((p) => reachable.has(p)).length / publicPaths.length) * 100).toFixed(2),
  byKind,
  byKindPct: {
    articles: +((byKind.articles.reachable / byKind.articles.total) * 100).toFixed(2),
    sections: +((byKind.sections.reachable / byKind.sections.total) * 100).toFixed(2),
    tools: +((byKind.tools.reachable / byKind.tools.total) * 100).toFixed(2),
  },
  missingPaths: missing,
  fallbackCorpusItems: corpus.fallbackCorpus.length,
  fallbackItemsWithDest: fallbackNav,
  fallbackItemsNavigablePct: +((fallbackNav / corpus.fallbackCorpus.length) * 100).toFixed(2),
  labelCount: corpus.labels.length,
  labelMatchesPerQuery: corpus.labels.filter((n) => true).length,
};

console.log(JSON.stringify(report, null, 2));
void totalUniverse;
void totalReachable;
void reachablePaths;
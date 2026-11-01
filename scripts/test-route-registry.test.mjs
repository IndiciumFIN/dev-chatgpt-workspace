import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

/**
 * UTC-051 — rota, canonical e hreflang derivam do Route Registry.
 *
 * A prova nao e "o codigo mudou": e "o resultado OBSERVAVEL nao mudou, mas
 * deixou de ser montado a mao". As duas coisas importam — o buscador precisa
 * ver a mesma coisa, e ninguem pode mais acrescentar uma rota num lugar e
 * esquecer o outro.
 */

// As fontes INDEPENDENTES do registry, lidas direto do catalogo.
const direto = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e",
      `Promise.all([import('./src/lib/tools/catalog.ts'), import('./src/lib/sections.ts'), import('./src/lib/content/articles/index.ts')]).then(([t,s,a])=>process.stdout.write(JSON.stringify({
        ferramentas: t.tools, secoes: s.listSections(), artigos: a.articleSlugs,
      }))).catch(e=>{process.stderr.write(String(e));process.exit(1)})`,
    ],
    { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "inherit"] },
  ),
);
const ferramentasDiretas = direto.ferramentas;
const secoesDiretas = direto.secoes;
const artigosDiretas = direto.artigos;

const dump = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e",
      `Promise.all([import('./src/lib/route-registry.ts'), import('./src/lib/seo.ts'), import('./src/lib/contract.ts')]).then(([r,s,c])=>process.stdout.write(JSON.stringify({
        registry: r.routeRegistry,
        indexable: r.indexablePaths(),
        all: r.allPaths(),
        alternates: r.alternateLocales(),
        publicPaths: c.publicPaths(),
        links: Object.fromEntries(["pt-BR","en","es","fr","de","ja","ar"].map(l=>[l,s.languageLinks("/",l)])),
      }))).catch(e=>{process.stderr.write(String(e));process.exit(1)})`,
    ],
    { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "inherit"] },
  ),
);

test("o indice bate com o CATALOGO lido diretamente, nao com o registry", () => {
  // Ancorar no registry seria comparar a coisa com ela mesma: um path que
  // sumisse do registro e do indice passaria. Aqui a verdade vem do
  // catalogo e das secoes, lidos diretamente.
  const esperado = [
    "/",
    ...artigosDiretas.map((slug) => `/blog/${slug}`),
    ...secoesDiretas.filter((s) => (s.publicacao ?? "publicada") === "publicada").map((s) => `/secao/${s.slug}`),
    ...ferramentasDiretas.filter((t) => (t.publicacao ?? "publicada") === "publicada").map((t) => `/ferramentas/${t.slug}`),
  ];
  assert.deepEqual(dump.publicPaths, esperado);
  assert.ok(dump.publicPaths.includes("/"), "a home tem de ser indexavel");
  assert.ok(dump.publicPaths.length >= 40, `sitemap com apenas ${dump.publicPaths.length} rotas`);
});

test("toda secao publicada entra no indice e nenhuma candidata entra", () => {
  for (const s of secoesDiretas) {
    const caminho = `/secao/${s.slug}`;
    const noIndice = dump.publicPaths.includes(caminho);
    const deveEntrar = (s.publicacao ?? "publicada") === "publicada";
    assert.equal(noIndice, deveEntrar, `${caminho}: ${noIndice ? "esta" : "nao esta"} no indice, mas publicacao=${s.publicacao ?? "publicada"}`);
  }
});

test("toda ferramenta publicada entra no indice e nenhuma candidata entra", () => {
  for (const t of ferramentasDiretas) {
    const caminho = `/ferramentas/${t.slug}`;
    const noIndice = dump.publicPaths.includes(caminho);
    const deveEntrar = (t.publicacao ?? "publicada") === "publicada";
    assert.equal(noIndice, deveEntrar, `${caminho}: ${noIndice ? "esta" : "nao esta"} no indice, mas publicacao=${t.publicacao ?? "publicada"}`);
  }
});

test("todo path do sitemap existe no registry", () => {
  const conhecidos = new Set(dump.all);
  const fora = dump.publicPaths.filter((p) => !conhecidos.has(p));
  assert.equal(fora.length, 0, `paths no sitemap que o registry nao conhece: ${fora.join(", ")}`);
});

test("o sitemap e exatamente o subconjunto indexavel do registry", () => {
  const esperado = dump.registry.filter((r) => r.indexavel).map((r) => r.path);
  assert.deepEqual(dump.publicPaths, esperado);
});

test("o registry declara titulo e descricao para cada rota", () => {
  const semTitulo = dump.registry.filter((r) => !r.title);
  const semDescricao = dump.registry.filter((r) => !r.description);
  assert.equal(semTitulo.length, 0, `rotas sem titulo: ${semTitulo.map((r) => r.path).join(", ")}`);
  assert.equal(semDescricao.length, 0, `rotas sem descricao: ${semDescricao.map((r) => r.path).join(", ")}`);
});

test("canonical: os 4 com dicionario se auto-referenciam, os 15 apontam para pt-BR", () => {
  for (const id of ["en", "es", "fr"]) {
    const canon = dump.links[id].find((l) => l.rel === "canonical");
    assert.ok(canon.href.includes(`lang=${id}`), `${id} deveria canonicalizar para si mesmo: ${canon.href}`);
  }
  const pt = dump.links["pt-BR"].find((l) => l.rel === "canonical");
  assert.ok(!pt.href.includes("lang="), `pt-BR nao deveria carregar parametro: ${pt.href}`);
  for (const id of ["de", "ja", "ar"]) {
    const canon = dump.links[id].find((l) => l.rel === "canonical");
    assert.ok(!canon.href.includes("lang="), `${id} (sem dicionario) canonicalizou para si mesmo: ${canon.href}`);
  }
});

test("hreflang declara os 4 reais + x-default, em qualquer rota", () => {
  for (const [id, links] of Object.entries(dump.links)) {
    const alts = links.filter((l) => l.rel === "alternate");
    assert.equal(alts.length, 5, `${id}: esperado 5 alternates`);
    assert.deepEqual(alts.slice(0, 4).map((a) => a.hrefLang).sort(), ["en", "es", "fr", "pt-BR"]);
    assert.equal(alts[4].hrefLang, "x-default");
  }
});

test("a ferramenta candidata fica fora do indice", () => {
  const candidatas = dump.registry.filter((r) => r.kind === "ferramenta" && !r.indexavel);
  for (const c of candidatas) {
    assert.ok(!dump.publicPaths.includes(c.path), `candidata no sitemap: ${c.path}`);
  }
  // A Aldrete e a candidata conhecida: tem HOLDs em aberto e nao pode ser indexada.
  const aldrete = dump.registry.find((r) => r.path === "/ferramentas/aldrete");
  assert.ok(aldrete, "a Aldrete deveria estar no registry");
  assert.equal(aldrete.indexavel, false, "a Aldrete nao pode ser indexavel enquanto os HOLDs estiverem abertos");
});

test("o canonical nao e montado por literal em seo.ts", () => {
  // UTC-051: "nenhum canonical hardcoded em pagina". Nao pode haver URL de
  // dominio nem nome de rota escritos a mao onde o canonical e montado.
  const seo = readFileSync(resolve(root, "src/lib/seo.ts"), "utf8");
  const bloco = seo.slice(seo.indexOf("export function languageLinks"), seo.indexOf("export function canonicalPath"));
  assert.ok(!/calculadorasdeenfermagem\.com\.br/.test(bloco), "canonical com o dominio literal em seo.ts");
  assert.ok(!/\/secao\/|\/ferramentas\/|\/blog\//.test(bloco), "canonical com caminho de rota literal em seo.ts");
  assert.match(seo, /from "@\/lib\/route-registry"/, "seo.ts tem de consumir o Route Registry");
});

test("publicPaths() deriva do registry, nao de lista propria", () => {
  const contract = readFileSync(resolve(root, "src/lib/contract.ts"), "utf8");
  const bloco = contract.slice(contract.indexOf("export function publicPaths"), contract.indexOf("export function sitemapXml"));
  assert.match(bloco, /indexablePaths\(\)/, "publicPaths() tem de chamar o registry");
  assert.doesNotMatch(bloco, /listSections|articleSlugs|tools\.map/, "publicPaths() nao pode montar lista propria");
});

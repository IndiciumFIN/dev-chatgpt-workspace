#!/usr/bin/env node
/**
 * Varre as 41 rotas do sitemap e procura:
 *   - links internos quebrados (apontam para 404)
 *   - ancora quebrada (o #id nao existe na pagina de destino)
 *
 * "Prometer e nao entregar" e o tipo de defeito que o dono nao ve e que um
 * buscador tambem nao perdoa. Este script mede isso.
 */
import { chromium } from "playwright";

const BASE = process.env.MEASURE_BASE ?? "http://127.0.0.1:4190";
const urls = [
  "/", "/secao/concurso", "/secao/sobre", "/secao/calculadoras", "/secao/escalas",
  "/secao/conteudos", "/secao/emprego", "/secao/simulados", "/secao/biblioteca",
  "/secao/contato", "/secao/entrar", "/secao/assinatura", "/secao/politicas",
  "/secao/termos", "/secao/acessibilidade", "/secao/compromisso", "/secao/mapa",
  "/secao/glossario", "/secao/nanda", "/ferramentas/braden", "/ferramentas/morse",
  "/ferramentas/apgar", "/ferramentas/gotejamento", "/ferramentas/imc",
  "/blog/mary-eliza-mahoney", "/secao/cancelamento-e-reembolso",
  "/secao/condicoes-da-assinatura", "/secao/conta-e-exclusao-de-dados",
  "/secao/perguntas-frequentes", "/secao/planos", "/secao/auditoria-governanca-regulatoria",
  "/secao/aviso-clinico", "/secao/correcoes-e-erratas", "/secao/fontes-e-evidencias",
  "/secao/politica-editorial", "/secao/uso-responsavel-de-ia", "/secao/equipe-e-autores",
  "/secao/missao-visao-valores", "/secao/objetivos-do-site",
  "/secao/metodologia-de-medicao", "/secao/relatorios-de-sustentabilidade",
];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const quebrados = [];
const ancoras = [];
const visitados = new Map();

for (const u of urls) {
  await page.goto(`${BASE}${u}`, { waitUntil: "networkidle", timeout: 25000 });
  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => ({ href: a.getAttribute("href"), texto: (a.textContent || "").trim().slice(0, 46) }))
      .filter((x) => x.href && !x.href.startsWith("http") && !x.href.startsWith("mailto:") && !x.href.startsWith("tel:")),
  );
  for (const l of links) {
    const [caminho, hash] = l.href.split("#");
    if (!caminho || caminho === "/") {
      if (hash) {
        const tem = await page.evaluate((h) => !!document.getElementById(h), hash);
        if (!tem) ancoras.push({ de: u, href: l.href, texto: l.texto });
      }
      continue;
    }
    const alvo = caminho.startsWith("/") ? caminho : new URL(caminho, BASE).pathname;
    if (!visitados.has(alvo)) {
      const r = await page.goto(`${BASE}${alvo}`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null);
      visitados.set(alvo, r ? r.status() : 0);
      const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id));
      visitados.set(`${alvo}#ids`, ids);
      await page.goto(`${BASE}${u}`, { waitUntil: "domcontentloaded" });
    }
    const status = visitados.get(alvo);
    if (status !== 200) {
      quebrados.push({ de: u, href: l.href, status, texto: l.texto });
    } else if (hash) {
      const ids = visitados.get(`${alvo}#ids`) || [];
      if (!ids.includes(hash)) ancoras.push({ de: u, href: l.href, texto: l.texto });
    }
  }
}

await browser.close();

console.log(`\n=== LINKS INTERNOS QUEBRADOS (destino != 200) ===`);
console.log(`  ${quebrados.length}`);
for (const b of quebrados.slice(0, 30)) console.log(`   ${b.de.padEnd(32)} -> ${b.href.padEnd(42)} [${b.status}] "${b.texto}"`);

console.log(`\n=== ANCORAS QUEBRADAS (#id inexiste no destino) ===`);
console.log(`  ${ancoras.length}`);
for (const a of ancoras.slice(0, 30)) console.log(`   ${a.de.padEnd(32)} -> ${a.href.padEnd(42)} "${a.texto}"`);

console.log(`\n  paginas verificadas: ${urls.length}`);
process.exit(quebrados.length + ancoras.length ? 1 : 0);

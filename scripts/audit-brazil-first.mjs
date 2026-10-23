#!/usr/bin/env node
/**
 * Auditoria "100% no Brasil" — o que um visitante brasileiro encontra.
 *
 * Roda contra o build real, servido por um servidor SSR. Verifica, para TODA
 * rota do sitemap:
 *   - a rota abre (HTTP 200)
 *   - existe exatamente 1 `h1`
 *   - existe `title` nao vazio
 *   - nao vaza placeholder `PENDENTE` para o leitor
 *   - nao ha overflow horizontal
 * E, alem disso, para os 19 idiomas oficiais:
 *   - idioma COM dicionario de interface se auto-canonicaliza
 *   - idioma SEM dicionario canonicaliza para pt-BR e declara `lang="pt-BR"`
 *
 * POR QUE O DETECTOR DE PENDENTE E CASE-SENSITIVEL
 * A primeira versao casava `/PENDENTE/i` e acusou a pagina "Uso responsavel de
 * IA" por causa da palavra **"independentes"** — que contem "pendentes".
 * Placeholder e a palavra em caixa ALTA. `independentes` nao e placeholder.
 * Esse detector quase inventou um defeito que nao existe, o mesmo tipo de
 * erro que o briefing manda evitar: alarme falso treina a pessoa a ignorar o
 * instrumento.
 *
 * USO
 *   1. Build:  cd /workspace/project_audit/v271 && npm run build
 *   2. Servidor: node scripts/serve-measure.mjs &   (porta 4190)
 *   3. Este script.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = process.env.MEASURE_BASE ?? "http://127.0.0.1:4190";
const ROOT = new URL("../", import.meta.url).pathname;

const sm = readFileSync(`${ROOT}.vercel/output/static/sitemap.xml`, "utf8");
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://calculadorasdeenfermagem.com.br", "") || "/");

const COM_DICIONARIO = ["pt-BR", "en", "es", "fr"];
const TODOS_IDIOMAS = ["pt-BR", "en", "es", "fr", "de", "it", "hi", "zh", "ar", "ja", "ru", "ko", "tr", "nl", "pl", "sv", "id", "vi", "uk"];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const rotas = [];
for (const u of urls) {
  try {
    const r = await page.goto(`${BASE}${u}`, { waitUntil: "networkidle", timeout: 25000 });
    const m = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      title: document.title,
      pend: (document.body.innerText.match(/\bPENDENTE\b/g) || []).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    const problemas = [];
    if (r.status() !== 200) problemas.push(`HTTP ${r.status()}`);
    if (m.h1 !== 1) problemas.push(`h1=${m.h1}`);
    if (!m.title) problemas.push("sem title");
    if (m.pend) problemas.push(`${m.pend}x PENDENTE visivel`);
    if (m.overflow > 0) problemas.push(`overflow +${m.overflow}`);
    rotas.push({ rota: u, problemas, ...m });
  } catch (e) {
    rotas.push({ rota: u, problemas: [`ERRO ${String(e).slice(0, 60)}`] });
  }
}

const idiomas = [];
for (const id of TODOS_IDIOMAS) {
  await page.goto(`${BASE}/?lang=${id}`, { waitUntil: "networkidle", timeout: 25000 });
  const m = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    canonical: document.querySelector("link[rel=canonical]")?.href ?? "",
  }));
  const temDicionario = COM_DICIONARIO.includes(id);
  const problemas = [];
  if (id === "pt-BR") {
    // pt-BR e a URL BASE: o canonical nao leva parametro.
    if (m.canonical.includes("lang=")) problemas.push(`canonical de pt-BR nao deveria levar parametro: ${m.canonical}`);
    if (m.lang !== "pt-BR") problemas.push(`lang="${m.lang}" em vez de pt-BR`);
  } else if (temDicionario) {
    if (!m.canonical.includes(`lang=${id}`)) problemas.push(`canonical nao se auto-referencia: ${m.canonical}`);
    if (m.lang !== id) problemas.push(`lang="${m.lang}" em vez de ${id}`);
  } else {
    if (m.lang !== "pt-BR") problemas.push(`lang="${m.lang}" mas o texto esta em portugues`);
    if (m.canonical.includes("lang=")) problemas.push(`canonical aponta para si mesmo: ${m.canonical}`);
  }
  idiomas.push({ id, temDicionario, ...m, problemas });
}

await browser.close();

const comProblema = rotas.filter((r) => r.problemas.length);
const idiomasComProblema = idiomas.filter((i) => i.problemas.length);

console.log(`\n=== ROTAS DO SITEMAP (pt-BR) — ${rotas.length} rotas ===`);
console.log(`  com problema: ${comProblema.length}`);
for (const r of comProblema) console.log(`   ${r.rota.padEnd(38)} ${r.problemas.join(", ")}`);

console.log(`\n=== IDIOMAS — ${idiomas.length} ===`);
console.log(`  com problema: ${idiomasComProblema.length}`);
for (const i of idiomasComProblema) console.log(`   ${i.id.padEnd(6)} ${i.problemas.join(", ")}`);

const falhas = comProblema.length + idiomasComProblema.length;
console.log(`\n  ${falhas === 0 ? "BRASIL OK: nenhuma rota com problema, nenhum idioma mentindo." : `${falhas} problema(s).`}`);
process.exit(falhas === 0 ? 0 : 1);

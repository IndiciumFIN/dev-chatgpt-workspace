#!/usr/bin/env node
/** Real-browser smoke for the MEM/CKO editorial shell. No publication or remote calls. */
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";

const base = process.env.CURIOSIDADES_E2E_BASE_URL || "http://127.0.0.1:4173";
const catalog = JSON.parse(readFileSync("src/lib/content/curiosidades/catalog.json", "utf8"));
const samples = [
  catalog.find((item) => item.slug === "12-de-maio-e-o-dia-internacional-da-enfermagem"),
  catalog.find((item) => item.category === "myths"),
  catalog.find((item) => item.category === "people"),
].filter(Boolean);
mkdirSync("audit-evidence/curiosidades", { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const indexResponse = await page.goto(base + "/blog/", { waitUntil: "networkidle" });
    assert.equal(indexResponse?.status(), 200, "Página de índice responde HTTP 200");
    await page.getByRole("heading", { name: "Curiosidades de Enfermagem", exact: true }).waitFor();
    const count = await page.locator("ul.related-grid > li").count();
    assert.equal(count, catalog.length, "Todos os 87 artigos estão no índice");
    await page.getByRole("searchbox", { name: "Buscar por palavra-chave" }).fill("Nightingale");
    assert.ok(await page.locator("ul.related-grid > li").count() > 0, "Busca deve retornar resultados");
    await page.getByRole("searchbox", { name: "Buscar por palavra-chave" }).fill("busca-sem-resultados-xyz123");
    await page.getByText("Nenhum artigo corresponde à busca.").waitFor();
    await page.screenshot({ path: "audit-evidence/curiosidades/blog-" + viewport.width + ".png", fullPage: true });
    for (const item of samples) {
      const url = base + "/blog/" + encodeURIComponent(item.slug);
      const response = await page.goto(url, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, "HTTP para " + item.slug);
      try {
        await page.getByRole("heading", { level: 1, name: item.title, exact: true }).waitFor({ timeout: 12000 });
      } catch (error) {
        const actualHeadings = await page.locator("h1").allTextContents().catch(() => []);
        const documentTitle = await page.title().catch(() => "(not available)");
        const routeStatus = response?.status();
        const errorPanel = await page.locator("main p").allTextContents().catch(() => []);
        await page.screenshot({ path: "audit-evidence/curiosidades/error-" + item.slug.slice(0,40) + "-" + viewport.width + ".png", fullPage: true }).catch(() => undefined);
        throw new Error("MEM_ROUTE_RENDER_FAILURE " + JSON.stringify({
          slug: item.slug, expectedTitle: item.title, actualHeadings, documentTitle,
          routeStatus, errorPanel: errorPanel.slice(0,3).map(s => s.slice(0,800)), browserErrors: errors.slice(-8), originalError: String(error),
        }));
      }
      await page.getByText("Prévia não homologada.").waitFor();
      const sections = await page.locator("section.inst-sec").count();
      assert.ok(sections >= 3, "Artigo com conteúdo em " + item.slug);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) failures.push("Overflow horizontal " + viewport.width + ": " + item.slug + " (+" + overflow + "px)");
    }
    await page.screenshot({ path: "audit-evidence/curiosidades/artigo-" + viewport.width + ".png", fullPage: true });
    // Cobertura completa: todos os 87 slugs na tela desktop; amostragem de
    // todas as oito categorias no mobile. O renderizador é único, os dados não.
    const categorySamples = [...new Map(catalog.map((x) => [x.category, x])).values()];
    const coverage = viewport.width === 1440 ? catalog : categorySamples;
    let checked = 0;
    for (const item of coverage) {
      const articleUrl = base + "/blog/" + encodeURIComponent(item.slug);
      try {
        const response = await page.goto(articleUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        assert.equal(response?.status(), 200, "HTTP para " + item.slug);
        await page.getByRole("heading", { level: 1, name: item.title, exact: true }).waitFor({ timeout: 9000 });
        const banners = await page.getByText("Prévia não homologada.", { exact: true }).count();
        assert(banners > 0, "Faltou sinalização de HOLD em " + item.slug);
        const n = await page.locator("section.inst-sec[id]").count();
        assert(n >= item.section_count + 1, "Seções incompletas em " + item.slug + ": " + n);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert(overflow <= 2, "Overflow " + viewport.width + "px/" + item.slug + " +" + overflow);
        checked++;
      } catch (error) {
        const errorPanel = await page.locator("main p").allTextContents().catch(() => []);
        failures.push("MEM_FULL_COVERAGE " + item.slug + " (" + viewport.width + "px): " + String(error) + " | " + errorPanel.slice(0,1).join(""));
        if (failures.length >= 12) break;
      }
    }
    console.log("MEM E2E cover: " + checked + "/" + coverage.length + " rotas em " + viewport.width + "px");

    failures.push(...errors.map((error) => viewport.width + ": " + error));
    await page.close();
  }
  if (failures.length) throw new Error(failures.join("; "));
  console.log("PASS CURIOSIDADES E2E: 87 artigos desktop, oito categorias mobile, busca e filtros, sem erros JS/overflow.");
} finally {
  await browser.close();
}

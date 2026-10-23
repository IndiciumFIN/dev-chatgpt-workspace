#!/usr/bin/env node
/**
 * Impressao digital visual de cada rota — a PROVA de que a consistencia
 * visual nao foi alterada.
 *
 * Para cada rota captura:
 *   - screenshot PNG (bytes)
 *   - impressao do LAYOUT: caixa + cor computada de cada elemento, em ordem
 *   - impressao do TEXTO: conteudo textual
 *
 * Comparar antes/depois mostra exatamente o que mudou. Se a lista de rotas
 * ANTIGAS ficar identica, a consistencia visual esta intacta.
 *
 * USO
 *   node scripts/visual-fingerprint.mjs <saida.json> [porta]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const OUT = process.argv[2] ?? "/tmp/fingerprint.json";
const PORT = process.argv[3] ?? "4190";
const BASE = `http://127.0.0.1:${PORT}`;

const sm = readFileSync("/workspace/project_audit/branch-bibliotecas/.vercel/output/static/sitemap.xml", "utf8");
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://calculadorasdeenfermagem.com.br", "") || "/");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
// Sem isto, uma pagina que volta vazia por servidor quebrado vira "mudanca
// de layout" em 41 rotas e o relatorio mente. Ja aconteceu: 40 de 41 rotas
// "mudaram" porque o servidor devolvia 0 bytes.
const saude = await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
const corpo = (await page.content()) ?? "";
if (!saude || saude.status() !== 200 || corpo.length < 2000) {
  console.error(`\n  ✗ SERVIDOR NAO SAUDAVEL: HTTP ${saude?.status() ?? "?"}, ${corpo.length} bytes.`);
  console.error("    A medicao seria invalida. Reconstrói o build e levanta o servidor antes de medir.\n");
  process.exit(2);
}

const resultado = {};
for (const u of urls) {
  try {
    await page.goto(`${BASE}${u}`, { waitUntil: "networkidle", timeout: 25000 });
    const imp = await page.evaluate(() => {
      const partes = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const cs = getComputedStyle(el);
        partes.push(
          [
            el.tagName,
            (el.className && typeof el.className === "string" ? el.className : "").slice(0, 40),
            Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height),
            cs.color, cs.backgroundColor, cs.fontSize, cs.fontWeight, cs.borderTopWidth, cs.borderRadius,
          ].join("|"),
        );
      }
      return { layout: partes.join("\n"), texto: (document.body.innerText || "").replace(/\s+/g, " ").trim() };
    });
    const png = await page.screenshot({ fullPage: false });
    resultado[u] = {
      layout: createHash("sha256").update(imp.layout).digest("hex").slice(0, 16),
      texto: createHash("sha256").update(imp.texto).digest("hex").slice(0, 16),
      png: createHash("sha256").update(png).digest("hex").slice(0, 16),
      elementos: imp.layout.split("\n").length,
    };
    console.log(`${u.padEnd(38)} layout=${resultado[u].layout} png=${resultado[u].png}`);
  } catch (e) {
    resultado[u] = { erro: String(e).slice(0, 80) };
    console.log(`${u.padEnd(38)} ERRO ${resultado[u].erro}`);
  }
}

await browser.close();
writeFileSync(OUT, JSON.stringify(resultado, null, 2));
console.log(`\n-> ${OUT}  (${Object.keys(resultado).length} rotas)`);

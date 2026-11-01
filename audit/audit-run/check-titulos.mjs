// VIS-12 probe: crawl the real route set, read document.title on every route.
// Usage: node audit-run/check-titulos.mjs <label> [port]
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const label = process.argv[2] ?? "run";
const port = process.argv[3] ?? "4187";
const BASE = `http://127.0.0.1:${port}`;

const templates = Array.from({ length: 21 }, (_, i) => `/modelos/tpl-${String(i + 1).padStart(3, "0")}`);
const kinds = ["guia", "biblioteca", "norma", "formulario", "laudo", "institucional", "slides"];
const routes = [
  "/", "/modelos", ...kinds.map((k) => `/modelos/${k}`), ...templates,
  "/pacote", "/sistema", "/institucional", "/blog/mary-eliza-mahoney",
  "/ferramentas/braden", "/ferramentas/gotejamento",
  "/login", "/sessao", "/assinante", "/admin", "/oficina-local",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const rows = [];
for (const route of routes) {
  let title = null, h1 = null, h1Count = null, err = null;
  try {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 70) ?? null,
      h1Count: document.querySelectorAll("h1").length,
    }));
    title = m.title; h1 = m.h1; h1Count = m.h1Count;
  } catch (e) { err = String(e.message).slice(0, 80); }
  rows.push({ route, title, h1, h1Count, err });
}

const counts = {};
for (const r of rows) counts[r.title ?? "(erro)"] = (counts[r.title ?? "(erro)"] ?? 0) + 1;
const dupes = Object.entries(counts).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
const out = {
  label,
  totalRotas: rows.length,
  titulosDuplicados: dupes,
  ocorrenciasLiteralTemplate: rows.filter((r) => (r.title ?? "").startsWith("Template · ")).map((r) => r.route),
  ocorrenciasLiteralEntrar: rows.filter((r) => (r.title ?? "").startsWith("Entrar · ")).map((r) => r.route),
  h1ForaDeUm: rows.filter((r) => r.h1Count !== 1).map((r) => `${r.route} -> h1=${r.h1Count} (${r.h1})`),
  rows,
};
mkdirSync("/workspace/audit-out-prod/check", { recursive: true });
writeFileSync(`/workspace/audit-out-prod/check/titulos-${label}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  totalRotas: out.totalRotas,
  titulosDistintos: Object.keys(counts).length,
  duplicados: dupes,
  nTemplateLiteral: out.ocorrenciasLiteralTemplate.length,
  nEntrarLiteral: out.ocorrenciasLiteralEntrar.length,
  h1ForaDeUm: out.h1ForaDeUm,
}, null, 1));
await browser.close();
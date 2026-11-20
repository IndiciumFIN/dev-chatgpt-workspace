/**
 * Prints do estado atual — o que o dono pediu para ver.
 * Usa o Chromium que já vem com o Playwright; nada de serviço externo.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const OUT = "/workspace/screenshots";
mkdirSync(OUT, { recursive: true });

const alvos = [
  { nome: "1-home-desktop", url: "/", width: 1440, height: 900 },
  { nome: "2-ferramenta-braden", url: "/ferramentas/braden", width: 1440, height: 900 },
  { nome: "3-sistema-admin", url: "/sistema", width: 1440, height: 900 },
  { nome: "4-home-mobile", url: "/", width: 390, height: 844 },
];

const browser = await chromium.launch();
const relatorio = [];

for (const alvo of alvos) {
  const ctx = await browser.newContext({
    viewport: { width: alvo.width, height: alvo.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const erros = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text().slice(0, 160));
  });
  page.on("pageerror", (e) => erros.push(String(e).slice(0, 160)));
  const resposta = await page.goto(`${BASE}${alvo.url}`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.waitForTimeout(700);
  const titulo = await page.title();
  const h1 = await page.locator("h1").first().innerText().catch(() => "");
  const og = await page
    .locator('meta[property="og:title"]')
    .getAttribute("content")
    .catch(() => null);
  const texto = (await page.locator("body").innerText()).trim();
  const arquivo = `${OUT}/${alvo.nome}.png`;
  await page.screenshot({ path: arquivo, fullPage: false });
  relatorio.push({
    alvo: alvo.nome,
    url: alvo.url,
    status: resposta?.status() ?? 0,
    titulo,
    h1: h1.replace(/\s+/g, " ").slice(0, 90),
    ogTitle: og,
    caracteresVisiveis: texto.length,
    errosConsole: erros,
  });
  await ctx.close();
}

// o print do terminal: a prova em imagem
const terminal = `
const fs = require("fs");
const linhas = fs.readFileSync("/tmp/fulltest5.log", "utf8").split("\\n");
const blocos = linhas.filter((l) => /^# (tests|pass|fail|skipped)/.test(l) || /^not ok/.test(l) || /^EXIT=/.test(l));
`;
await browser.close();
writeFileSync(`${OUT}/relatorio.json`, JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify(relatorio, null, 2));

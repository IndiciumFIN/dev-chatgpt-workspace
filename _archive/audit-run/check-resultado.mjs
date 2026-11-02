// VIS-01 probe: measure the result column of a clinical tool page.
// Usage: node audit-run/check-resultado.mjs <label> [port]
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const label = process.argv[2] ?? "run";
const port = process.argv[3] ?? "4187";
const BASE = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const out = {};
for (const w of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(`${BASE}/ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("h1", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1800);
  out[w] = await page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
    const aside = box(".tool-result");
    const ph = box(".tool-result-placeholder");
    const stage = document.querySelector(".tool-result");
    // fill ratio: real content height of the aside vs its own column height
    const layout = box(".tool-layout");
    const stack = box(".tool-stack");
    return {
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      colunaLargura: aside ? Math.round(aside.width) : null,
      colunaAltura: aside ? Math.round(aside.height) : null,
      placeholderAltura: ph ? Math.round(ph.height) : null,
      // how much of the column the placeholder actually occupies
      ocupacaoPlaceholderPct: aside && ph ? Math.round((ph.height / aside.height) * 100) : null,
      // the 2169px column the audit complained about: grid column height
      alturaColunaGrid: layout ? Math.round(layout.height) : null,
      alturaEntrada: stack ? Math.round(stack.height) : null,
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60) ?? null,
      h1Count: document.querySelectorAll("h1").length,
      children: stage ? [...stage.children].map((c) => `${c.tagName.toLowerCase()}.${(c.className || "").toString().split(" ")[0]}`) : null,
      skeletonBars: document.querySelectorAll(".tool-result-skeleton > *").length,
      skeletonAltura: box(".tool-result-skeleton") ? Math.round(box(".tool-result-skeleton").height) : null,
      stepsRotulo: [...document.querySelectorAll(".tool-result-step")].map((e) => e.textContent.trim().slice(0, 40)),
    };
  });
  mkdirSync("/workspace/audit-out-prod/check", { recursive: true });
  await page.screenshot({ path: `/workspace/audit-out-prod/check/resultado-${label}-${w}.png`, fullPage: false });
  await page.close();
}

// vertical rhythm of the four surfaces
const rhythm = {};
const surfaces = [
  ["home", "/"], ["secao", "/secao/medicacao"],
  ["ferramenta", "/ferramentas/braden"], ["oficina", "/oficina-local"],
];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, route] of surfaces) {
  try {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1400);
    rhythm[name] = await page.evaluate(() => {
      const kids = [...document.querySelector(".site-main")?.children ?? []];
      const gaps = [];
      let prev = null;
      for (const k of kids) {
        const r = k.getBoundingClientRect();
        if (r.height > 0) { if (prev) gaps.push(Math.round(r.top - prev)); prev = r.bottom; }
      }
      return {
        blocos: kids.length,
        gapsUnicos: [...new Set(gaps)].sort((a, b) => a - b),
        headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName).join(","),
      };
    });
  } catch (e) { rhythm[name] = { erro: String(e.message).slice(0, 60) }; }
}
await page.close();

const full = { label, medidas: out, ritmoVertical: rhythm };
writeFileSync(`/workspace/audit-out-prod/check/resultado-${label}.json`, JSON.stringify(full, null, 1));
console.log(JSON.stringify(full, null, 1));
await browser.close();
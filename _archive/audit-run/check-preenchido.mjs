// VIS-01: estado preenchido — a coluna muda de hierarquia quando há resultado.
import { chromium } from "playwright";
const port = process.argv[2] ?? "4187";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
await p.goto(`http://127.0.0.1:${port}/ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 });
await p.waitForSelector(".tool-result-placeholder", { timeout: 30000 });
// preenche todos os critérios: primeiro radio de cada fieldset
await p.evaluate(() => {
  document.querySelectorAll(".criterion").forEach((fs) => {
    const r = fs.querySelector('input[type="radio"]');
    if (r) { r.click(); }
  });
});
await p.waitForTimeout(500);
await p.getByRole("button", { name: /Calcular/ }).first().click();
await p.waitForTimeout(1200);
const m = await p.evaluate(() => {
  const box = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  const aside = box(".tool-result");
  return {
    temPlaceholder: !!document.querySelector(".tool-result-placeholder"),
    children: [...document.querySelector(".tool-result").children].map((c) => `${c.tagName.toLowerCase()}.${(c.className || "").toString().split(" ")[0]}`),
    colunaAltura: aside ? Math.round(aside.height) : null,
    etapas: [...document.querySelectorAll(".tool-result-step")].map((e) => `${e.querySelector("b").textContent}:${e.className.replace("tool-result-step ", "")}`),
    estado: document.querySelector(".tool-result-state")?.textContent?.trim(),
    temScoreCard: !!document.querySelector(".score-card"),
    interpretacao: document.querySelector(".tool-result .tone-ok, .tool-result .tone-warn, .tool-result .tone-info, .tool-result .tone-danger")?.textContent?.slice(0, 70) ?? null,
    temMemoria: !!document.querySelector(".calc-table.memory"),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
});
console.log(JSON.stringify(m, null, 1));
await (await p.$(".tool-result")).screenshot({ path: "/workspace/audit-out-prod/check/coluna-resultado-preenchido-1440.png" });
await p.screenshot({ path: "/workspace/audit-out-prod/check/braden-preenchido-1440.png" });
await p.close();

const m390 = await b.newPage({ viewport: { width: 390, height: 844 } });
await m390.goto(`http://127.0.0.1:${port}/ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 });
await m390.waitForSelector(".tool-result-placeholder", { timeout: 30000 });
await m390.waitForTimeout(600);
await (await m390.$(".tool-result")).screenshot({ path: "/workspace/audit-out-prod/check/coluna-resultado-light-390.png" });
console.log("overflow390:", await m390.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
await m390.close();
await b.close();
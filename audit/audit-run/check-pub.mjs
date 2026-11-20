import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://127.0.0.1:4182/ferramentas/braden", { waitUntil: "domcontentloaded", timeout: 45000 });
await p.waitForTimeout(2500);
const m = await p.evaluate(() => {
  const txt = document.body.innerText;
  return {
    status: document.title,
    bloqueado: txt.includes("não publicada nesta base local"),
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60) ?? null,
    h1Count: document.querySelectorAll("h1").length,
    inputs: document.querySelectorAll("input").length,
    radios: document.querySelectorAll('input[type="radio"]').length,
    botoes: document.querySelectorAll("button").length,
    labels: [...document.querySelectorAll("label")].length,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    texto: txt.replace(/\s+/g, " ").slice(0, 180),
  };
});
console.log(JSON.stringify(m, null, 1));
await p.screenshot({ path: "/workspace/audit-out-prod/check/braden-publicada.png" });
await b.close();

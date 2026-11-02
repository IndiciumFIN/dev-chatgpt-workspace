import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:4185/", { waitUntil: "domcontentloaded", timeout: 45000 });
await p.waitForTimeout(1600);
console.log(JSON.stringify(await p.evaluate(() => {
  const e = [...document.querySelectorAll("a[href]")].find((a) => { const b = a.getBoundingClientRect(); return b.height > 0 && b.height < 44; });
  if (!e) return null;
  const cs = getComputedStyle(e);
  // link inline vive dentro de um bloco de texto: o pai é p/li/td e o link nao é o unico filho
  const pai = e.parentElement;
  return {
    texto: e.textContent.trim().slice(0, 40),
    pai: pai.tagName + "." + (pai.className || "").toString().slice(0, 30),
    display: cs.display,
    inlineNoBloco: cs.display === "inline" || cs.display === "inline",
    paiTemOutrosFilhos: pai ? pai.childElementCount > 1 : null,
    retangulo: `${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`,
  };
}), null, 1));
await p.screenshot({ path: "/workspace/audit-out-prod/check/header-final.png", clip: { x: 0, y: 0, width: 1440, height: 175 } });
await p.screenshot({ path: "/workspace/audit-out-prod/check/header-final-mobile.png", clip: { x: 0, y: 0, width: 390, height: 130 } });
await b.close();

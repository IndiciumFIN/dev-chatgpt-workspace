import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 140)));
p.on("pageerror", (e) => errs.push("PAGEERROR " + String(e).slice(0, 140)));
const st = await p.goto("http://127.0.0.1:8091/ferramentas/braden", { waitUntil: "domcontentloaded", timeout: 45000 }).then(r => r.status()).catch(e => 0);
await p.waitForTimeout(2500);
const info = await p.evaluate(() => ({
  title: document.title,
  h1: [...document.querySelectorAll("h1")].map(h => h.textContent?.trim().slice(0, 40)),
  h2: [...document.querySelectorAll("h2")].map(h => h.textContent?.trim().slice(0, 40)).slice(0, 8),
  bodyStart: document.body.innerText.trim().slice(0, 260),
  inputs: document.querySelectorAll("input").length,
  radios: document.querySelectorAll("input[type=radio]").length,
  error: document.querySelector('[role=alert], .error, .err')?.textContent?.slice(0, 120) ?? null,
}));
console.log("status", st);
console.log(JSON.stringify(info, null, 1));
console.log("erros:", errs.slice(0, 5));
await p.screenshot({ path: "/workspace/audit-out-prod/check/v271-braden.png" });
await b.close();

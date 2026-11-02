import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:8091/ferramentas/braden", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
await p.waitForTimeout(3000);
const t = await p.evaluate(() => document.body.innerText.replace(/\n+/g, " | ").slice(0, 1200));
console.log(t);
await b.close();

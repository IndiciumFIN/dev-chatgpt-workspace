import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "audit-evidence/visual";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const rows = [];

const SHOTS = [
  { name: "home-1440", url: "/", w: 1440, h: 900 },
  { name: "home-390", url: "/", w: 390, h: 844 },
  { name: "header-1440", url: "/", w: 1440, h: 175, clipH: 175 },
  { name: "header-390", url: "/", w: 390, h: 130, clipH: 130 },
  { name: "ferramentas-braden-1440", url: "/ferramentas/braden", w: 1440, h: 1000 },
  { name: "ferramentas-braden-390", url: "/ferramentas/braden", w: 390, h: 844 },
  { name: "oficina-local-390", url: "/oficina-local", w: 390, h: 844 },
  { name: "secao-sobre-390", url: "/secao/sobre", w: 390, h: 844 },
];

for (const s of SHOTS) {
  const p = await b.newPage({ viewport: { width: s.w, height: s.h } });
  const res = await p.goto(`http://127.0.0.1:4190${s.url}`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${OUT}/${s.name}.png`, clip: { x: 0, y: 0, width: s.w, height: s.clipH ?? s.h } });
  const m = await p.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
  }));
  rows.push({ ...s, ...m, http: res?.status() ?? null, capturedAt: new Date().toISOString() });
  await p.close();
}
await b.close();
console.log(JSON.stringify(rows, null, 1));

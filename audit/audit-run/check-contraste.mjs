// VIS-01 final: contraste do texto novo + recorte da coluna do resultado.
import { chromium } from "playwright";
const port = process.argv[2] ?? "4187";
const BASE = `http://127.0.0.1:${port}`;

function lum(rgb) {
  const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return +(((hi + 0.05) / (lo + 0.05)).toFixed(2)); }
function parse(s) { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x)); return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]]; }
function bgOf(el) {
  let n = el;
  while (n && n !== document.documentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c && c[3] > 0) return c;
    n = n.parentElement;
  }
  return [255, 255, 255, 1];
}
function over(fg, bg) {
  const a = fg[3] ?? 1;
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
}

const b = await chromium.launch();
const out = { claro: [], escuro: [] };
for (const theme of ["light", "dark"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(`${BASE}/ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForSelector(".tool-result-placeholder", { timeout: 30000 });
  await p.evaluate((t) => { document.documentElement.setAttribute("data-theme", t); }, theme);
  await p.waitForTimeout(500);
  const rows = await p.evaluate(() => {
    const sel = [".tool-result h2", ".tool-result-state", ".tool-result-step b", ".tool-result-step span",
      ".tool-result-step.is-done b", ".tool-result-placeholder .tool-help", ".tool-result-step::before"];
    return sel.map((s) => {
      const el = document.querySelector(s);
      return el ? { sel: s, fg: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, fontSize: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight, text: el.textContent.trim().slice(0, 40) } : { sel: s, ausente: true };
    });
  });
  for (const r of rows) {
    if (r.ausente) { out[theme === "light" ? "claro" : "escuro"].push({ ...r }); continue; }
    out[theme === "light" ? "claro" : "escuro"].push(r);
  }
  // contrast computed in Node
  const measured = await p.evaluate(() => {
    const bgOfEl = (el) => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const q = m[1].split(",").map(Number); if (q.length < 4 || q[3] > 0) return q; } n = n.parentElement; } return [255, 255, 255]; };
    const sel = [".tool-result h2", ".tool-result-state", ".tool-result-step b", ".tool-result-step span",
      ".tool-result-step.is-done b", ".tool-result-placeholder .tool-help"];
    return sel.map((s) => { const el = document.querySelector(s); if (!el) return { sel: s, ausente: true };
      return { sel: s, fg: getComputedStyle(el).color, bgOnResolved: bgOfEl(el).slice(0, 3), fontSize: getComputedStyle(el).fontSize, fontWeight: getComputedStyle(el).fontWeight }; });
  });
  console.log(`\n== tema ${theme} ==`);
  for (const r of measured) {
    if (r.ausente) { console.log(`  ${r.sel}: AUSENTE`); continue; }
    const fg = parse(r.fg); const ratio_ = ratio(over(fg, r.bgOnResolved), r.bgOnResolved);
    console.log(`  ${r.sel.padEnd(46)} ${ratio_}:1  ${r.fontSize}/${r.fontWeight}`);
  }
  await p.evaluate((t) => { document.documentElement.setAttribute("data-theme", t); }, "light");
  await p.waitForTimeout(300);
  const el = await p.$(".tool-result");
  await el.screenshot({ path: `/workspace/audit-out-prod/check/coluna-resultado-${theme}-1440.png` });
  await p.close();
}

const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(`${BASE}/ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 });
await m.waitForSelector(".tool-result-placeholder", { timeout: 30000 });
await m.waitForTimeout(800);
await (await m.$(".tool-result")).screenshot({ path: "/workspace/audit-out-prod/check/coluna-resultado-light-390.png" });
console.log("\noverflow390:", await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
await m.close();
await b.close();
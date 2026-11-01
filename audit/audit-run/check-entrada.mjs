// VIS-12 gate: rotas protegidas que terminam em /login carregam `de` no título.
// Usage: node audit-run/check-entrada.mjs [port]
import { chromium } from "playwright";

const port = process.argv[2] ?? "4187";
const BASE = `http://127.0.0.1:${port}`;
const routes = ["/login", "/login?de=admin", "/login?de=assinante", "/login?de=assinatura",
  "/login?de=inexistente", "/sessao", "/assinante", "/admin"];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const rows = [];
for (const r of routes) {
  await p.goto(BASE + r, { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForTimeout(1500);
  rows.push({ pedido: r, urlFinal: new URL(p.url()).pathname + new URL(p.url()).search, title: await p.title() });
}
console.log(JSON.stringify(rows, null, 1));
await b.close();
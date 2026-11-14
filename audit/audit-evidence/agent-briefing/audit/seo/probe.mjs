// Sonda de auditoria SEO. Le o head RENDERIZADO (pos-hidratacao) em cada rota.
// Nao escreve nada no repositorio: apenas le e imprime JSON.
import { chromium } from "/workspace/project_audit/v271/node_modules/playwright-core/index.mjs";

const SITE = process.env.SITE || "https://20itbcndi7b8r.space.minimax.io";

const ROUTES = [
  "/",
  "/blog/mary-eliza-mahoney",
  "/secao/sobre",
  "/secao/calculadoras",
  "/secao/escalas",
  "/secao/nanda",
  "/secao/glossario",
  "/secao/politicas",
  "/secao/fontes-e-evidencias",
  "/secao/aviso-clinico",
  "/ferramentas/braden",
  "/ferramentas/morse",
  "/ferramentas/apgar",
  "/ferramentas/gotejamento",
  "/ferramentas/imc",
  "/modelos",
  "/modelos/ferramenta",
  "/nao-existe",
];

const PROBE = () => {
  const q = (sel) => document.querySelector(sel);
  const all = (sel) => [...document.querySelectorAll(sel)];
  const jsonld = all('script[type="application/ld+json"]').map((s) => {
    try {
      const j = JSON.parse(s.textContent);
      const types = j["@graph"] ? j["@graph"].map((n) => n["@type"]) : [j["@type"]];
      return { types, valid: true };
    } catch (e) {
      return { types: ["PARSE_ERROR"], valid: false };
    }
  });
  const imgs = all("img").map((i) => ({
    src: (i.currentSrc || i.src || "").slice(-60),
    w: i.getAttribute("width"),
    h: i.getAttribute("height"),
    nw: i.naturalWidth,
    nh: i.naturalHeight,
    loading: i.getAttribute("loading"),
    complete: i.complete,
  }));
  const h1 = all("h1").map((e) => e.textContent.trim().slice(0, 70));
  return {
    title: document.title,
    description: q('meta[name="description"]')?.content ?? null,
    robots: q('meta[name="robots"]')?.content ?? null,
    googlebot: q('meta[name="googlebot"]')?.content ?? null,
    canonical: q('link[rel="canonical"]')?.href ?? null,
    alternates: all('link[rel="alternate"]').map((l) => `${l.getAttribute("hreflang")}=${l.href}`),
    og: Object.fromEntries(
      all("meta[property^='og:']").map((m) => [m.getAttribute("property"), m.content]),
    ),
    twitter: Object.fromEntries(
      all("meta[name^='twitter:']").map((m) => [m.getAttribute("name"), m.content]),
    ),
    jsonld,
    htmlLang: document.documentElement.lang,
    h1,
    h1Count: h1.length,
    imgs,
    imgCount: imgs.length,
    imgsNoDims: imgs.filter((i) => !i.w || !i.h).length,
    preloadLogo: all('link[rel="preload"],link[rel="preconnect"]').map((l) => `${l.getAttribute("rel")}:${l.getAttribute("as") ?? ""}:${(l.href || "").slice(-40)}`),
    bodyTextLen: (document.body.innerText || "").length,
    h1Preview: (document.body.innerText || "").slice(0, 120).replace(/\n/g, " "),
  };
};

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });
  const out = {};
  for (const r of ROUTES) {
    const page = await ctx.newPage();
    const resp = await page.goto(SITE + r, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => ({ status: () => "ERR:" + e.message }));
    const status = typeof resp?.status === "function" ? resp.status() : String(resp);
    const ct = resp?.headers ? resp.headers()["content-type"] : null;
    // mede LCP
    const lcp = await page
      .evaluate(
        () =>
          new Promise((resolve) => {
            let last = null;
            try {
              new PerformanceObserver((l) => {
                for (const e of l.getEntries()) last = { t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.className ? "." + String(e.element.className).slice(0, 40) : "") : "?" };
              }).observe({ type: "largest-contentful-paint", buffered: true });
            } catch {}
            setTimeout(() => resolve(last), 2500);
          }),
      )
      .catch(() => null);
    const data = await page.evaluate(PROBE).catch((e) => ({ error: String(e) }));
    out[r] = { status, contentType: ct, lcp, ...data };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
};
run();
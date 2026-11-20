import { chromium } from "playwright";
const b = await chromium.launch();
const VPS = [
  { n: "desktop", w: 1440, h: 900 },
  { n: "laptop", w: 1100, h: 800 },
  { n: "tablet", w: 834, h: 1112 },
  { n: "mobile", w: 390, h: 844 },
];
for (const v of VPS) {
  const p = await b.newPage({ viewport: { width: v.w, height: v.h } });
  await p.goto("http://127.0.0.1:8091/", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `/workspace/audit-out-prod/check/h271-${v.n}.png`, clip: { x: 0, y: 0, width: v.w, height: 300 } });
  const m = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const vis = (s) => { const e = q(s); if (!e) return false; const st = getComputedStyle(e); const b = e.getBoundingClientRect(); return st.display !== "none" && b.width > 0; };
    return {
      a11yBarVisible: vis(".a11y-bar"),
      a11yBtnVisible: vis(".hdr-a11y"),
      langVisible: vis(".lang-trigger"),
      searchVisible: vis(".hdr-search-toggle"),
      entrarVisible: vis(".hdr-enter"),
      assinarVisible: vis(".hdr-subscribe"),
      concursoInNav: !!q(".desktop-nav .nav-guide"),
      box: { header: r(q(".site-header")), u1: r(q(".header-utility")), u2: r(q(".site-header-inner")), logo: r(q(".brand img")), brandName: vis(".brand-name") },
      topChrome: (() => { const m = q(".site-main"); if (!m) return null; return Math.round(m.getBoundingClientRect().top + parseFloat(getComputedStyle(m).paddingTop)); })(),
      brandText: vis(".brand-name"),
      contaOffCanvas: !!q(".off-account"),
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
    };
  });
  console.log(v.n.padEnd(8), JSON.stringify(m));
  await p.close();
}
await b.close();

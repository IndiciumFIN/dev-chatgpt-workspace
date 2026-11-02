import { chromium } from "playwright";
const b = await chromium.launch();
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto("http://127.0.0.1:4183/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForTimeout(1800);
  const m = await p.evaluate(() => {
    const hdr = document.querySelector(".site-header");
    const hb = hdr.getBoundingClientRect();
    const main = document.querySelector(".site-main");
    const mb = main.getBoundingClientRect();
    // primeiro bloco visivel de conteudo
    const first = main.querySelector("h1, .hero, section, .section-hero");
    const fb = first ? first.getBoundingClientRect() : null;
    return {
      headerBottom: Math.round(hb.bottom),
      mainTop: Math.round(mb.top),
      mainPadTop: getComputedStyle(main).paddingTop,
      primeiroBloco: first ? (first.className || first.tagName) : null,
      primeiroTop: fb ? Math.round(fb.top) : null,
      COBERTO: fb ? fb.top < hb.bottom : null,
      brandNameVisivel: !!document.querySelector(".brand-name"),
    };
  });
  console.log(w + "px " + JSON.stringify(m));
  await p.screenshot({ path: `/workspace/audit-out-prod/check/chrome-${w}.png` });
  await p.close();
}
await b.close();

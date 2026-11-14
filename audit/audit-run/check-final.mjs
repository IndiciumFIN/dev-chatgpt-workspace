import { chromium } from "playwright";
const b = await chromium.launch();
const sel = 'a[href],button:not([disabled]),[role=button],input,select';
const out = {};
for (const w of [1440, 1024, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto("http://127.0.0.1:4185/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForTimeout(1800);
  out[w] = await p.evaluate((SEL) => {
    const r = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
    const u = r(".header-utility"), a = r(".a11y-bar"), h = r(".site-header");
    const main = document.querySelector(".site-main");
    const targets = [...document.querySelectorAll(SEL)].filter((e) => {
      const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return b.width > 0 && b.height > 0 && cs.visibility !== "hidden";
    });
    const bad = targets.filter((e) => { const b = e.getBoundingClientRect(); return b.width < 44 || b.height < 44; })
      .map((e) => `${(e.className || e.tagName).toString().slice(0, 26)}=${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
    return {
      faixas: [u && Math.round(u.height), a && Math.round(a.height), h && Math.round(h.height)],
      chromeTotal: h ? Math.round(h.bottom) : null,
      mainPadTop: getComputedStyle(main).paddingTop,
      sobreposto: (() => { const f = main.querySelector("h1,.hero-main"); const fb = f && f.getBoundingClientRect(); return fb && h ? fb.top < h.bottom : null; })(),
      wordmark: !!document.querySelector(".brand-name"),
      alvosTotal: targets.length, alvosSub44: bad.length, exemplosSub44: bad.slice(0, 6),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  }, sel);
  await p.screenshot({ path: `/workspace/audit-out-prod/check/final-${w}.png`, clip: { x: 0, y: 0, width: w, height: 210 } });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();

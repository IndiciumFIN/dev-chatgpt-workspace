import { chromium } from "playwright";
const b = await chromium.launch();
for (const v of [{n:"desktop",w:1440,h:900},{n:"mobile",w:390,h:844}]) {
  const p = await b.newPage({ viewport: { width: v.w, height: v.h } });
  await p.goto("http://127.0.0.1:8091/", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(2200);
  const r = await p.evaluate(() => {
    const eff=(el)=>{let n=el;for(let i=0;i<4&&n;i++,n=n.parentElement){const cs=getComputedStyle(n);if(cs.cursor==="pointer"||n.getAttribute("role")==="button")return n;}return el;};
    const ctrls=[...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button]")].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&!e.closest("[hidden],[aria-hidden='true']");});
    const bad=ctrls.map(e=>{const el=eff(e);const r=el.getBoundingClientRect();return{t:(e.textContent||e.getAttribute("aria-label")||e.tagName).trim().slice(0,22),cls:(e.className||"").toString().slice(0,26),w:Math.round(r.width),h:Math.round(r.height)};}).filter(x=>x.h<24||x.w<24);
    const cb=document.querySelector(".cookie-banner");
    const hdr=document.querySelector(".site-header");
    const main=document.querySelector(".site-main");
    return {
      chromeFixo: hdr ? Math.round(hdr.getBoundingClientRect().bottom) : null,
      bannerCookie: cb ? Math.round(cb.getBoundingClientRect().height) : 0,
      padReservado: main ? getComputedStyle(main).paddingBottom : null,
      mainPadTop: main ? parseFloat(getComputedStyle(main).paddingTop) : null,
      wordmark: !!document.querySelector(".brand-name") && getComputedStyle(document.querySelector(".brand-name")).display !== "none",
      logo: (()=>{const i=document.querySelector(".brand img"); return i?Math.round(i.getBoundingClientRect().width):null;})(),
      utilStrip: (()=>{const u=document.querySelector(".header-utility"); return u?Math.round(u.getBoundingClientRect().height):null;})(),
      alvos: ctrls.length, sob24: bad.length, amostra: bad.slice(0,4),
      overflowX: document.documentElement.scrollWidth > window.innerWidth+1,
    };
  });
  console.log(v.n, JSON.stringify(r, null, 1));
  await p.close();
}
await b.close();

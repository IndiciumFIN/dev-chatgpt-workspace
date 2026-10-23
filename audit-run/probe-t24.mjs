import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:390,height:844} });
await p.goto("http://127.0.0.1:8091/ferramentas/braden", { waitUntil:"domcontentloaded", timeout:45000 }).catch(()=>{});
await p.waitForTimeout(1800);
const r = await p.evaluate(() => {
  const eff=(el)=>{let n=el;for(let i=0;i<4&&n;i++,n=n.parentElement){const cs=getComputedStyle(n);if(cs.cursor==="pointer"||n.getAttribute("role")==="button")return n;}return el;};
  const ctrls=[...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button]")].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&!e.closest("[hidden],[aria-hidden='true']");});
  const bad=ctrls.map(e=>{const el=eff(e);const r=el.getBoundingClientRect();return {t:(e.textContent||e.getAttribute("aria-label")||e.getAttribute("name")||e.tagName).trim().slice(0,26),cls:(e.className||"").toString().slice(0,30)||"(sem classe)",w:Math.round(r.width),h:Math.round(r.height),expanded:el!==e};}).filter(x=>x.h<24||x.w<24);
  const byCls={}; for(const x of bad) byCls[x.cls||"(sem classe)"]=(byCls[x.cls||"(sem classe)"]||0)+1;
  return {total:ctrls.length, under24:bad.length, byCls, sample:bad.slice(0,10)};
});
console.log(JSON.stringify(r,null,1));
await b.close();

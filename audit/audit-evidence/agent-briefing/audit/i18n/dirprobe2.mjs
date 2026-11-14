import { chromium } from "playwright";
const b = await chromium.launch();
for (const id of ["pt-BR","ar"]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  const r = await p.goto(`http://127.0.0.1:4190/?lang=${id}`,{waitUntil:"networkidle",timeout:60000});
  const ssr = await p.evaluate(()=>document.documentElement.outerHTML.slice(0,300));
  await p.waitForTimeout(2500);
  const after = await p.evaluate(()=>({
    attrs: Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value),
    dirPropSet: (()=>{ document.documentElement.dir = "rtl"; return document.documentElement.getAttribute("dir"); })(),
    computedLangMenuDir: (()=>{const m=document.createElement("div");return null})(),
  }));
  console.log("=== ",id);
  console.log("SSR html tag:", ssr.slice(0,200));
  console.log("after attrs:", JSON.stringify(after.attrs));
  console.log("manual set dir ->", after.dirPropSet);
  await p.context().close();
}
await b.close();

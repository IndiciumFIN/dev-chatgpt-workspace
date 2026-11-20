import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.addInitScript(()=>{
  window.__log=[];
  const mo=new MutationObserver(()=>{ window.__log.push({t:Math.round(performance.now()), attrs:Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value).join(" ")}); });
  document.addEventListener("DOMContentLoaded",()=>mo.observe(document.documentElement,{attributes:true}));
});
await p.goto("http://127.0.0.1:4190/?lang=ar",{waitUntil:"domcontentloaded",timeout:60000});
await p.waitForTimeout(3000);
console.log("MUTATION LOG (html attrs):");
for (const l of await p.evaluate(()=>window.__log.slice(-25))) console.log(" ", l.t+"ms", l.attrs);
console.log("FINAL:", await p.evaluate(()=>Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value)));
console.log("routerState lang seen by app? trigger:", await p.evaluate(()=>document.querySelector(".lang-trigger")?.textContent?.trim()));
await b.close();

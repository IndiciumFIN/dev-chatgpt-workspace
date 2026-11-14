import { chromium } from "playwright";
const b = await chromium.launch();
for (const id of ["pt-BR","ar","he","en"]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(`http://127.0.0.1:4190/?lang=${id}`,{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(2000);
  console.log(id, JSON.stringify(await p.evaluate(()=>{
    const h=document.documentElement;
    return {lang:h.lang, dir:h.dir, dirAttr:h.getAttribute("dir"), attrs:Array.from(h.attributes).map(a=>a.name+"="+a.value).join(" "), bodyDir: document.body.getAttribute("dir"), rtlRuleHits: document.querySelectorAll('[dir="rtl"]').length};
  })));
  await p.context().close();
}
await b.close();

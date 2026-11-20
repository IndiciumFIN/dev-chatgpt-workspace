import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://127.0.0.1:4190/?lang=ar",{waitUntil:"networkidle",timeout:60000});
await p.waitForTimeout(2000);
console.log("before:", await p.evaluate(()=>Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value)));
// alterna modo escuro
await p.click('#header-accessibility-controls button[aria-pressed]');
await p.waitForTimeout(800);
console.log("after dark click:", await p.evaluate(()=>Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value)));
console.log("localStorage cde-theme:", await p.evaluate(()=>localStorage.getItem("cde-theme")));
await p.click('#header-accessibility-controls button[aria-pressed]');
// muda fonte via botao de glifo
await p.click('#header-accessibility-controls button:nth-child(2)');
await p.waitForTimeout(600);
console.log("after font click:", await p.evaluate(()=>({attrs:Array.from(document.documentElement.attributes).map(a=>a.name+"="+a.value), ls:localStorage.getItem("cde-font")})));
await b.close();

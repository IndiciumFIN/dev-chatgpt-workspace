import { chromium } from "playwright";
const b = await chromium.launch();
for (const v of [{n:"desktop",w:1440,h:900},{n:"mobile",w:390,h:844}]) {
  const p = await b.newPage({ viewport:{width:v.w,height:v.h} });
  await p.goto("http://127.0.0.1:8091/ferramentas/braden", { waitUntil:"domcontentloaded", timeout:45000 }).catch(()=>{});
  await p.waitForTimeout(1800);
  // rolar até o fim: com o banner fixo, o último campo tem de aparecer ACIMA dele
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const cb = document.querySelector(".cookie-banner");
    if (!cb) return { banner:null };
    const br = cb.getBoundingClientRect();
    const campos=[...document.querySelectorAll(".field input, .field select, .field textarea, .choice")];
    const cobertos=campos.filter(f=>{const r=f.getBoundingClientRect();return r.width>0&&r.bottom>br.top&&r.top<br.bottom&&r.right>br.left&&r.left<br.right;});
    const lib=document.documentElement.classList.contains("has-cookie-banner");
    return { bannerH:Math.round(br.height), padReservado:getComputedStyle(document.body).paddingBottom,
             hasClass:lib, scrollY:Math.round(scrollY), camposTotal:campos.length, camposCobertos:cobertos.length,
             ultimos:campos.slice(-3).map(f=>(f.textContent||f.tagName).trim().slice(0,18)) };
  });
  console.log(v.n, JSON.stringify(r));
  await p.screenshot({ path:`/workspace/audit-out-prod/check/cookie271-${v.n}.png` });
  await p.close();
}
await b.close();

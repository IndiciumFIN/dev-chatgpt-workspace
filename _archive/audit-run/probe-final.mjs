import { chromium } from "playwright";
const b = await chromium.launch();
const R = ["/","/ferramentas/braden","/oficina-local","/modelos/slides","/secao/entrar","/login","/secao/biblioteca"];
for (const v of [{n:"desktop",w:1440,h:900},{n:"mobile",w:390,h:844}]) {
  for (const r of R) {
    const p = await b.newPage({ viewport:{width:v.w,height:v.h} });
    const st = await p.goto("http://127.0.0.1:8091"+r, { waitUntil:"domcontentloaded", timeout:45000 }).then(x=>x.status()).catch(()=>0);
    await p.waitForTimeout(1600);
    const m = await p.evaluate(() => {
      const eff = (el) => { let n=el; for(let i=0;i<4&&n;i++,n=n.parentElement){const cs=getComputedStyle(n); if(cs.cursor==="pointer"||n.getAttribute("role")==="button") return n;} return el; };
      const ctrls=[...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button]")].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&!e.closest("[hidden],[aria-hidden='true']");});
      const bad=ctrls.filter(e=>{const b=eff(e).getBoundingClientRect();return b.width>0&&b.height>0&&(b.height<44||b.width<44);});
      const under24=ctrls.filter(e=>{const b=eff(e).getBoundingClientRect();return b.width>0&&b.height>0&&(b.height<24||b.width<24);});
      const rel=[...document.querySelectorAll(".related-grid")].map(g=>{const items=g.children.length; const cols=getComputedStyle(g).gridTemplateColumns.split(" ").length; const fr=g.getBoundingClientRect().width; const kids=[...g.children].reduce((a,k)=>a+k.getBoundingClientRect().width,0); return {items,cols,cheio:Math.round(kids/(fr||1)*100)};});
      return {
        overflowX: document.documentElement.scrollWidth > window.innerWidth+1,
        scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
        h1: document.querySelectorAll("h1").length,
        ctrls: ctrls.length, under44: bad.length, under24: under24.length,
        under24Sample: under24.slice(0,3).map(e=>(e.className||e.tagName).toString().slice(0,24)),
        title: document.title.slice(0,52),
        related: rel,
        skeleton: !!document.querySelector(".result-skeleton"),
      };
    });
    console.log(`${v.n.padEnd(8)} ${r.padEnd(22)} ${String(st).padEnd(4)} ovf=${m.overflowX?m.scrollW+">"+m.innerW:"no"} h1=${m.h1} <44:${m.under44}/${m.ctrls} <24:${m.under24}${m.under24.length?" ["+m.under24Sample.join(",")+"]":""} skel=${m.skeleton} rel=${JSON.stringify(m.related)} | ${m.title}`);
    await p.close();
  }
}
await b.close();

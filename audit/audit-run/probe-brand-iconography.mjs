/**
 * brand-iconography probe — measures the brand mark and the accessibility bar.
 * Usage: node probe-brand.mjs <tag>
 */
import { chromium } from "playwright";

const tag = process.argv[2] ?? "x";
const OUT = "/workspace/.mavis/plans/plan_416685a8/workspace";
const BASE = "http://127.0.0.1:4181/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
await page.waitForTimeout(1800);

const m = await page.evaluate(() => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const img = document.querySelector(".brand img, .brand svg");
  const intrinsic = img && img.tagName === "IMG" ? { nw: img.naturalWidth, nh: img.naturalHeight } : { nw: null, nh: null };
  const cs = img ? getComputedStyle(img) : null;

  // icon sizes present in the shell
  const iconSizes = {};
  const hosts = new Set();
  document.querySelectorAll("header *, .a11y-bar *, .site-footer *, .to-top").forEach((el) => {
    const svg = el.tagName === "svg" ? el : el.querySelector(":scope > svg");
    if (!svg) return;
    const b = svg.getBoundingClientRect();
    if (b.width < 4) return;
    const key = `${Math.round(b.width)}x${Math.round(b.height)}`;
    iconSizes[key] = (iconSizes[key] ?? 0) + 1;
    hosts.add(`${svg.getAttribute("class") ?? "(lucide)"}|${key}`);
  });

  // a11y bar controls
  const bar = document.querySelector(".a11y-bar");
  const controls = [...(bar?.querySelectorAll("button") ?? [])].map((b) => {
    const bx = b.getBoundingClientRect();
    const icon = b.querySelector("svg");
    return {
      cls: b.className,
      text: (b.textContent ?? "").trim().slice(0, 40),
      ariaLabel: b.getAttribute("aria-label"),
      ariaPressed: b.getAttribute("aria-pressed"),
      accessibleName: b.getAttribute("aria-label") ?? (b.textContent ?? "").trim(),
      hasIcon: !!icon,
      iconBox: icon ? r(icon) : null,
      hitW: +bx.width.toFixed(1),
      hitH: +bx.height.toFixed(1),
      bg: getComputedStyle(b).backgroundColor,
      border: getComputedStyle(b).borderColor,
      svgVisible: icon ? getComputedStyle(icon).display !== "none" && icon.getBoundingClientRect().width > 0 : false,
    };
  });

  const dots = [...(bar?.querySelectorAll(".focus-dot") ?? [])].map((b) => {
    const bx = b.getBoundingClientRect();
    const cs2 = getComputedStyle(b);
    return {
      label: b.getAttribute("aria-label"),
      pressed: b.getAttribute("aria-pressed"),
      dataOn: b.getAttribute("data-on"),
      bg: cs2.backgroundColor,
      borderColor: cs2.borderColor,
      borderWidth: cs2.borderWidth,
      boxShadow: cs2.boxShadow,
      w: +bx.width.toFixed(1),
      h: +bx.height.toFixed(1),
      hasIcon: !!b.querySelector("svg"),
    };
  });

  return {
    brandNode: img ? img.tagName + (img.getAttribute("src") || img.classList.contains("brand-logo") ? ` src=${img.getAttribute("src") ?? "(inline svg)"}` : "") : null,
    brandBox: r(img),
    brandIntrinsic: intrinsic,
    brandObjectFit: cs?.objectFit,
    brandRendering: img?.tagName === "IMG" ? getComputedStyle(img).imageRendering : "n/a (vector)",
    brandNameVisible: !!document.querySelector(".brand-name"),
    brandNameText: (document.querySelector(".brand-name")?.textContent ?? "").trim(),
    distortion: intrinsic.nw
      ? { vScale: +(r(img).w / intrinsic.nw).toFixed(3), hScale: +(r(img).h / intrinsic.nh).toFixed(3), ratio: +((r(img).h / intrinsic.nh) / (r(img).w / intrinsic.nw)).toFixed(3) }
      : null,
    upscaleFactor: intrinsic.nw ? +(r(img).w / intrinsic.nw).toFixed(2) : null,
    iconSizes,
    iconHosts: [...hosts].sort(),
    controls,
    dots,
    contrastHigh: document.documentElement.getAttribute("data-contrast"),
  };
});

console.log(`\n===== ${tag} =====`);
console.log(JSON.stringify(m, null, 1));

// screenshot of the header + a11y bar, and a zoomed crop
await page.screenshot({ path: `${OUT}/shot-${tag}-header.png`, clip: { x: 0, y: 0, width: 1440, height: 170 } });
await page.screenshot({ path: `${OUT}/shot-${tag}-bar.png`, clip: { x: 380, y: 44, width: 700, height: 52 } });
const brand = await page.$(".brand img, .brand svg");
if (brand) await brand.screenshot({ path: `${OUT}/shot-${tag}-brand.png` });
await page.close();

// ---- locale sweep on the a11y bar ----
const rows = [];
const LOCALES = ["pt-BR","en","es","de","it","fr","hi","zh","ar","ja","ru","ko","tr","nl","pl","sv","id","vi","uk"];
for (const loc of LOCALES) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${BASE}${loc === "pt-BR" ? "" : `/${loc}/`}`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const row = await p.evaluate(() => {
    const bar = document.querySelector(".a11y-bar");
    const btns = [...(bar?.querySelectorAll("button") ?? [])];
    const named = btns.filter((b) => (b.getAttribute("aria-label") || "").trim().length > 0).length;
    const withIcon = btns.filter((b) => { const s = b.querySelector("svg"); return s && s.getBoundingClientRect().width > 0; }).length;
    return {
      labels: btns.slice(0, 7).map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim()),
      total: btns.length,
      named,
      withIcon,
    };
  });
  rows.push({ loc, ...row });
  await p.close();
}
console.log("\n===== locales =====");
for (const r of rows) console.log(r.loc.padEnd(6), `btns=${r.total} named=${r.named} icon=${r.withIcon} | ${r.labels.slice(0,6).join(" / ")}`);

await browser.close();
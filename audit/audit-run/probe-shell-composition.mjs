/**
 * shell-composition probe — extends audit-run/probe-after.mjs (brand-iconography).
 * Same measurement contract (brandBox, distortion, iconSizes, controls, dots) plus:
 *  - fixed chrome strip geometry per viewport
 *  - full interactive-target sweep (chrome + nav + scale-chip + hint-btn)
 *  - focus-ring presence
 *
 * Usage: node probe-shell.mjs <tag> [--locales] [--hint]
 * Port is the BASE constant at the top.
 */
import { chromium } from "playwright";

const tag = process.argv[2] ?? "x";
const wantLocales = process.argv.includes("--locales");
const wantHint = process.argv.includes("--hint");
const OUT = "/workspace/.mavis/plans/plan_993b435a/workspace/shots";
const BASE = "http://127.0.0.1:4181/";
const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 1024, h: 900 },
  { w: 390, h: 844 },
];

const browser = await chromium.launch();
const out = { tag, viewports: {}, locales: null };

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // open the language menu so its rows are measurable too
  await page.click(".lang-trigger").catch(() => {});
  await page.waitForTimeout(350);

  const m = await page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    };
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];

    const strips = {};
    for (const sel of [".header-utility", ".a11y-bar", ".site-header"]) {
      const el = q(sel);
      if (!el) continue;
      const b = el.getBoundingClientRect();
      strips[sel] = { y: +b.y.toFixed(1), h: +b.height.toFixed(2), bottom: +b.bottom.toFixed(1), display: getComputedStyle(el).display };
    }
    const header = q(".site-header");
    strips.chromeTotal = header ? +header.getBoundingClientRect().bottom.toFixed(2) : null;
    const main = q(".site-main");
    const mainCs = main ? getComputedStyle(main) : null;
    strips.mainPaddingTop = mainCs ? parseFloat(mainCs.paddingTop) : null;
    strips.mainGapUnderChrome = header && mainCs
      ? +(parseFloat(mainCs.paddingTop) - header.getBoundingClientRect().bottom).toFixed(2)
      : null;

    // full interactive target sweep
    const TARGETS = [
      ".header-utility button, .header-utility a",
      ".a11y-bar button",
      ".desktop-nav a, .desktop-nav button",
      ".hamburger",
      ".lang-menu button",
      ".scale-chip",
      ".hint-btn",
      ".to-top",
      ".site-footer .social-row a",
      ".site-footer a, .site-footer button",
    ];
    const targets = [];
    for (const sel of TARGETS) {
      for (const el of qa(sel)) {
        const b = el.getBoundingClientRect();
        if (!b.width && !b.height) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        targets.push({
          sel,
          cls: (el.className || el.tagName.toLowerCase()).toString().slice(0, 44),
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 28),
          w: +b.width.toFixed(1),
          h: +b.height.toFixed(1),
          under24: b.width < 24 || b.height < 24,
          under44: b.width < 44 || b.height < 44,
          bg: cs.backgroundColor,
          border: cs.borderTopColor,
          radius: cs.borderTopLeftRadius,
        });
      }
    }

    // a11y bar controls, same shape as probe-after
    const bar = q(".a11y-bar");
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
        hitW: +bx.width.toFixed(1),
        hitH: +bx.height.toFixed(1),
        bg: getComputedStyle(b).backgroundColor,
        border: getComputedStyle(b).borderColor,
      };
    });
    const dots = [...(bar?.querySelectorAll(".focus-dot") ?? [])].map((b) => ({
      label: b.getAttribute("aria-label"),
      pressed: b.getAttribute("aria-pressed"),
      dataOn: b.getAttribute("data-on"),
      boxShadow: getComputedStyle(b).boxShadow,
      w: +b.getBoundingClientRect().width.toFixed(1),
      h: +b.getBoundingClientRect().height.toFixed(1),
    }));

    // button vocabulary inside the utility strip (bg / border / color) for unification check
    const vocab = qa(".header-utility button, .header-utility a").map((el) => {
      const cs = getComputedStyle(el);
      return {
        cls: el.className,
        bg: cs.backgroundColor,
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        color: cs.color,
      };
    });

    // focus ring presence on the first chrome control
    const first = q(".header-utility button, .a11y-bar button");
    let focusRing = null;
    if (first) {
      first.focus();
      const cs = getComputedStyle(first);
      focusRing = { outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineStyle: cs.outlineStyle };
    }

    const img = q(".brand img, .brand svg");
    return {
      strips,
      targetSummary: {
        total: targets.length,
        under24: targets.filter((t) => t.under24).length,
        under44: targets.filter((t) => t.under44).length,
        bySel: Object.fromEntries(
          TARGETS.map((s) => {
            const rows = targets.filter((t) => t.sel === s);
            return [s, { n: rows.length, u24: rows.filter((r) => r.under24).length, u44: rows.filter((r) => r.under44).length, minH: rows.length ? Math.min(...rows.map((r) => r.h)) : null, minW: rows.length ? Math.min(...rows.map((r) => r.w)) : null }];
          }).filter(([, v]) => v.n > 0),
        ),
      },
      targets,
      controls,
      dots,
      vocab,
      focusRing,
      brandNode: img ? img.tagName + ` src=${img.getAttribute("src") ?? "(inline)"}` : null,
      brandBox: rect(img),
      brandNameVisible: !!q(".brand-name"),
      brandNameText: (q(".brand-name")?.textContent ?? "").trim(),
      iconSizes: (() => {
        const acc = {};
        qa("header *, .a11y-bar *, .site-footer *, .to-top").forEach((el) => {
          const svg = el.tagName === "svg" ? el : el.querySelector(":scope > svg");
          if (!svg) return;
          const b = svg.getBoundingClientRect();
          if (b.width < 4) return;
          const k = `${Math.round(b.width)}x${Math.round(b.height)}`;
          acc[k] = (acc[k] ?? 0) + 1;
        });
        return acc;
      })(),
    };
  });

  out.viewports[vp.w] = m;
  await page.screenshot({ path: `${OUT}/${tag}-w${vp.w}.png`, clip: { x: 0, y: 0, width: vp.w, height: Math.min(220, vp.h) } });
  await page.screenshot({ path: `${OUT}/${tag}-w${vp.w}-full.png`, fullPage: false });
  await page.close();
}

if (wantHint) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${BASE}ferramentas/braden`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(1200);
  out.hint = await p.evaluate(() => {
    const el = document.querySelector(".hint-btn");
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const host = el.closest(".hint");
    return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), hostH: host ? +host.getBoundingClientRect().height.toFixed(1) : null };
  });
  await p.close();
}

if (wantLocales) {
  const rows = [];
  const LOCALES = ["pt-BR","en","es","de","it","fr","hi","zh","ar","ja","ru","ko","tr","nl","pl","sv","id","vi","uk"];
  for (const loc of LOCALES) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`${BASE}${loc === "pt-BR" ? "" : `/${loc}/`}`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(900);
    rows.push(await p.evaluate((l) => {
      const bar = document.querySelector(".a11y-bar");
      const btns = [...(bar?.querySelectorAll("button") ?? [])];
      return {
        loc: l,
        total: btns.length,
        named: btns.filter((b) => (b.getAttribute("aria-label") || "").trim().length > 0).length,
        allH44: btns.length > 0 && btns.every((b) => b.getBoundingClientRect().height >= 44),
        minH: btns.length ? Math.min(...btns.map((b) => +b.getBoundingClientRect().height.toFixed(1))) : null,
        labels: btns.map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim()).slice(0, 4),
      };
    }, loc));
    await p.close();
  }
  out.locales = rows;
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
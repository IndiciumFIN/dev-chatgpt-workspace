/**
 * i18n-header-audit — medicao, nao suposicao.
 * Carrega /?lang=<id> para os 19 idiomas oficiais e grava o que REALMENTE renderizou.
 * Nada aqui escreve em src/ ou scripts/.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4190";
const OUT = "/workspace/audit-evidence/agent-briefing/audit/i18n";

const IDS = ["pt-BR", "en", "es", "de", "it", "fr", "hi", "zh", "ar", "ja", "ru", "ko", "tr", "nl", "pl", "sv", "id", "vi", "uk"];

/** Extrai do DOM vivo tudo que e chrome de interface (nao conteudo clinico). */
const PROBE = () => {
  const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const langBtn = q(".lang-trigger");
  const a11yBar = q("#header-accessibility-controls");
  return {
    htmlLang: document.documentElement.lang,
    htmlDir: document.documentElement.dir,
    title: document.title,
    h1: t(q("h1")),
    langTrigger: {
      text: t(langBtn),
      ariaLabel: langBtn?.getAttribute("aria-label") ?? null,
      expanded: langBtn?.getAttribute("aria-expanded") ?? null,
      haspopup: langBtn?.getAttribute("aria-haspopup") ?? null,
      controls: langBtn?.getAttribute("aria-controls") ?? null,
    },
    utility: {
      search: t(q(".utility-search")),
      searchAria: q(".utility-search")?.getAttribute("aria-label") ?? null,
      subscribe: t(q(".utility-subscribe")),
      login: t(q(".utility-login")),
      a11yToggle: t(q(".a11y-mobile-toggle")),
      a11yToggleAria: q(".a11y-mobile-toggle")?.getAttribute("aria-label") ?? null,
      groupAria: q(".header-utility")?.getAttribute("aria-label") ?? null,
    },
    a11yBarAria: a11yBar?.getAttribute("aria-label") ?? null,
    a11yButtons: qa("#header-accessibility-controls > button").map((b) => ({
      aria: b.getAttribute("aria-label"),
      text: t(b),
      glyph: t(b.querySelector("span[aria-hidden='true']")),
      // alternativa textual: aria-label OU texto visivel
      alt: b.getAttribute("aria-label") ?? t(b.querySelector(".a11y-action-label")) ?? t(b),
    })),
    skip: t(q(".skip-link")),
    desktopNav: qa(".desktop-nav a").map((a) => t(a)),
    footerNav: qa(".site-footer a, footer a").map((a) => t(a)).filter(Boolean).slice(0, 30),
    menuBtn: t(q(".menu-toggle, .off-canvas-toggle, header button.menu")),
    langNote: t(q(".lang-note")),
    cookie: t(q(".cookie-banner")),
  };
};

const run = async () => {
  const browser = await chromium.launch();
  const results = {};

  // ---------- 1. os 19 idiomas ----------
  for (const id of IDS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
    let probe = null, status = null;
    try {
      const resp = await page.goto(`${BASE}/?lang=${encodeURIComponent(id)}`, { waitUntil: "networkidle", timeout: 45000 });
      status = resp?.status() ?? null;
      await page.waitForTimeout(900);
      probe = await page.evaluate(PROBE);
    } catch (e) {
      probe = { loadError: String(e).slice(0, 300) };
    }
    results[id] = { status, errors, probe };
    await ctx.close();
    console.log(`[${id}] status=${status} title="${probe?.title}" h1="${probe?.h1}" lang=${probe?.htmlLang} dir=${probe?.htmlDir} err=${errors.length}`);
  }

  // ---------- 2. troca deidioma sem estado anterior (critério 2) ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?lang=pt-BR`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const snapPt = await page.evaluate(PROBE);
  const flat = (p) => {
    const out = [];
    out.push(["langTrigger.text", p.langTrigger?.text]);
    out.push(["langTrigger.ariaLabel", p.langTrigger?.ariaLabel]);
    out.push(["utility.groupAria", p.utility?.groupAria]);
    out.push(["utility.search", p.utility?.search]);
    out.push(["utility.searchAria", p.utility?.searchAria]);
    out.push(["utility.subscribe", p.utility?.subscribe]);
    out.push(["utility.login", p.utility?.login]);
    out.push(["utility.a11yToggle", p.utility?.a11yToggle]);
    out.push(["a11yBarAria", p.a11yBarAria]);
    out.push(["skip", p.skip]);
    out.push(["cookie", p.cookie]);
    (p.a11yButtons ?? []).forEach((b, i) => {
      out.push([`a11y[${i}].aria`, b.aria]);
      out.push([`a11y[${i}].text`, b.text]);
    });
    (p.desktopNav ?? []).forEach((v, i) => out.push([`nav[${i}]`, v]));
    (p.footerNav ?? []).forEach((v, i) => out.push([`footer[${i}]`, v]));
    return out.filter(([, v]) => v !== null && v !== undefined && v !== "");
  };

  const switchResults = [];
  for (const target of ["en", "ja", "ar", "de"]) {
    await page.goto(`${BASE}/?lang=pt-BR`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/?lang=pt-BR`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const before = await page.evaluate(PROBE);
    // abre o menu de idioma e clica no alvo pelo botao real
    await page.click(".lang-trigger");
    await page.waitForTimeout(250);
    const opened = await page.evaluate(() => !!document.querySelector("#header-language-menu"));
    await page.click(`#header-language-menu button[lang="${target}"]`);
    await page.waitForTimeout(1200);
    const after = await page.evaluate(PROBE);
    const b = flat(before), a = flat(after);
    const bm = Object.fromEntries(b), am = Object.fromEntries(a);
    const stuck = Object.keys(bm).filter((k) => bm[k] === am[k] && !/\[0\]/.test(k));
    switchResults.push({ target, menuOpenedByClick: opened, url: page.url(), before: bm, after: am, unchangedKeys: stuck });
  }

  // ---------- 3. teclado no seletor ----------
  const kb = {};
  await page.goto(`${BASE}/?lang=pt-BR`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(() => { document.querySelector(".lang-trigger")?.focus(); });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  kb.enterOpens = await page.evaluate(() => ({
    menu: !!document.querySelector("#header-language-menu"),
    expanded: document.querySelector(".lang-trigger")?.getAttribute("aria-expanded"),
    focusInside: document.querySelector("#header-language-menu")?.contains(document.activeElement),
    activeEl: document.activeElement?.textContent?.replace(/\s+/g, " ").trim(),
    ariaCurrentCount: document.querySelectorAll("#header-language-menu button[aria-current]").length,
    ariaCurrentLabel: document.querySelector("#header-language-menu button[aria-current='true']")?.textContent,
  }));
  // Tab x 25: foco deve ficar preso no menu
  const trail = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    trail.push(await page.evaluate(() => {
      const a = document.activeElement;
      const inMenu = !!a?.closest("#header-language-menu");
      return { tag: a?.tagName, label: a?.textContent?.replace(/\s+/g, " ").trim(), inMenu };
    }));
  }
  kb.tabTrail = trail;
  kb.everEscaped = trail.some((x) => !x.inMenu);
  // Shift+Tab de volta
  const back = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Shift+Tab");
    back.push(await page.evaluate(() => ({ label: document.activeElement?.textContent?.replace(/\s+/g, " ").trim(), inMenu: !!document.activeElement?.closest("#header-language-menu") })));
  }
  kb.shiftTabBack = back;
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  kb.escCloses = await page.evaluate(() => ({
    menu: !!document.querySelector("#header-language-menu"),
    focusIsTrigger: document.activeElement === document.querySelector(".lang-trigger"),
    activeLabel: document.activeElement?.textContent?.replace(/\s+/g, " ").trim(),
    expanded: document.querySelector(".lang-trigger")?.getAttribute("aria-expanded"),
  }));
  // setas: nenhum handler?
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const preArrow = await page.evaluate(() => document.activeElement?.textContent?.replace(/\s+/g, " ").trim());
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  const postArrow = await page.evaluate(() => document.activeElement?.textContent?.replace(/\s+/g, " ").trim());
  kb.arrowNav = { preArrow, postArrow, moves: preArrow !== postArrow };
  // Space fecha?
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector(".lang-trigger")?.focus());
  await page.keyboard.press(" ");
  await page.waitForTimeout(250);
  kb.spaceOpens = await page.evaluate(() => !!document.querySelector("#header-language-menu"));

  // ---------- 4. preservacao de rota ----------
  const routes = ["/ferramentas/braden", "/secao/calculadoras", "/institucional", "/ferramentas/morse"];
  const routeProof = [];
  for (const r of routes) {
    for (const target of ["ja", "ar", "en"]) {
      await page.goto(`${BASE}${r}?lang=pt-BR`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const beforePath = await page.evaluate(() => location.pathname);
      const openOk = await page.evaluate(() => !!document.querySelector(".lang-trigger"));
      let switched = null;
      if (openOk) {
        await page.click(".lang-trigger");
        await page.waitForTimeout(200);
        const has = await page.evaluate((t) => !!document.querySelector(`#header-language-menu button[lang="${t}"]`), target);
        if (has) { await page.click(`#header-language-menu button[lang="${target}"]`); }
        await page.waitForTimeout(900);
        switched = await page.evaluate(() => ({ path: location.pathname, search: location.search, title: document.title, lang: document.documentElement.lang }));
      }
      routeProof.push({ route: r, target, beforePath, hasTrigger: openOk, after: switched });
      console.log(`ROTA ${r} -> ${target}: ${beforePath} => ${switched ? switched.path + switched.search : "SEM TROCA"}`);
    }
  }

  // ---------- 5. persistencia da escolha ----------
  const persist = {};
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.click(".lang-trigger");
  await page.waitForTimeout(200);
  await page.click('#header-language-menu button[lang="ja"]');
  await page.waitForTimeout(900);
  persist.afterPick = await page.evaluate(() => ({ url: location.href, stored: localStorage.getItem("cde-locale") }));
  await page.goto(`${BASE}/ferramentas/braden`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  persist.reloadSameRoute = await page.evaluate(() => ({ url: location.href, lang: document.documentElement.lang, trigger: document.querySelector(".lang-trigger")?.textContent?.trim() }));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  persist.reloadHome = await page.evaluate(() => ({ url: location.href, lang: document.documentElement.lang, trigger: document.querySelector(".lang-trigger")?.textContent?.trim() }));
  // e o caso en/es/fr (o unico que o codigo aceita no restore)
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.click(".lang-trigger");
  await page.waitForTimeout(200);
  await page.click('#header-language-menu button[lang="de"]');
  await page.waitForTimeout(800);
  persist.dePick = await page.evaluate(() => ({ url: location.href, stored: localStorage.getItem("cde-locale") }));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  persist.deReload = await page.evaluate(() => ({ url: location.href, lang: document.documentElement.lang }));

  // ---------- 6. eixo horizontal em ar ----------
  const axis = {};
  for (const id of ["pt-BR", "ar"]) {
    await page.goto(`${BASE}/?lang=${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.click(".lang-trigger");
    await page.waitForTimeout(400);
    axis[id] = await page.evaluate(() => {
      const box = (s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) };
      };
      const menu = document.querySelector("#header-language-menu");
      const cs = menu ? getComputedStyle(menu) : null;
      const body = document.documentElement;
      return {
        dir: body.dir,
        scrollW: body.scrollWidth,
        clientW: body.clientWidth,
        horizontalOverflow: body.scrollWidth - body.clientWidth,
        widestRight: Math.max(...Array.from(document.querySelectorAll("header *, .header-utility *")).map((e) => Math.round(e.getBoundingClientRect().right)).filter((n) => !Number.isNaN(n)), 0),
        langTrigger: box(".lang-trigger"),
        langMenu: box("#header-language-menu"),
        langMenuStyle: cs ? { left: cs.left, right: cs.right, insetInlineStart: cs.insetInlineStart, width: cs.width, position: cs.position, transformOrigin: cs.transformOrigin, maxHeight: cs.maxHeight, overflowY: cs.overflowY } : null,
        langMenuItems: menu ? Array.from(menu.querySelectorAll("button")).map((b) => b.textContent.trim()) : [],
        langMenuScrollable: menu ? { scrollH: menu.scrollHeight, clientH: menu.clientHeight, overflows: menu.scrollHeight > menu.clientHeight } : null,
        headerUtility: box(".header-utility"),
        a11yBar: box("#header-accessibility-controls"),
        subscribe: box(".utility-subscribe"),
        navFirst: box(".desktop-nav a"),
        firstItemVisualX: menu ? Math.round(menu.querySelector("button").getBoundingClientRect().x) : null,
      };
    });
  }

  // ordenacao visual do menu em ar (RTL deve inverter a ordem visual dos itens flex/grid)
  await page.goto(`${BASE}/?lang=ar`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.click(".lang-trigger");
  await page.waitForTimeout(400);
  axis.arItemOrder = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#header-language-menu button")).map((b) => ({ t: b.textContent.trim(), x: Math.round(b.getBoundingClientRect().x) }))
  );
  axis.arItemTextAlign = await page.evaluate(() => {
    const b = document.querySelector("#header-language-menu button");
    return b ? { textAlign: getComputedStyle(b).textAlign, direction: getComputedStyle(b).direction } : null;
  });

  // ---------- 7. glifos: alternativa textual ----------
  const glyphs = {};
  for (const id of IDS) {
    await page.goto(`${BASE}/?lang=${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(450);
    glyphs[id] = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#header-accessibility-controls > button")).map((b) => {
        const hiddenGlyph = b.querySelector("span[aria-hidden='true']");
        return {
          glyph: hiddenGlyph ? hiddenGlyph.textContent.trim() : null,
          ariaLabel: b.getAttribute("aria-label"),
          visibleText: (b.querySelector(".a11y-action-label")?.textContent ?? b.textContent).replace(/\s+/g, " ").trim(),
          hidden: !!hiddenGlyph,
        };
      })
    );
  }

  fs.writeFileSync(`${OUT}/raw-19-locales.json`, JSON.stringify({ results, switchResults, kb, routeProof, persist, axis, glyphs }, null, 2));
  console.log("\n=== GRAVADO raw-19-locales.json ===");
  await ctx.close();
  await browser.close();
};

run().catch((e) => { console.error("FALHOU:", e); process.exit(1); });
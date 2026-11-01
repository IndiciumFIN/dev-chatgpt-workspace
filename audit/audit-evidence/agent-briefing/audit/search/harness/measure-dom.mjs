// Auditoria de busca — medicao real no Chromium via Playwright.
// Nao escreve nada em src/ ou scripts/. Le a app rodando em http://127.0.0.1:4191
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "out");
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE ?? "http://127.0.0.1:4191";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const TERMS = [
  { q: "braden", expect: "/ferramentas/braden", kind: "clinico" },
  { q: "gotejamento", expect: "/ferramentas/gotejamento", kind: "clinico" },
  { q: "imc", expect: "/ferramentas/imc", kind: "clinico" },
  { q: "morse", expect: "/ferramentas/morse", kind: "clinico" },
  { q: "apgar", expect: "/ferramentas/apgar", kind: "clinico" },
  { q: "índice", expect: null, kind: "acento" },
  { q: "indice", expect: null, kind: "sem-acento" },
  { q: "mary", expect: null, kind: "artigo" },
  { q: "fugulin", expect: null, kind: "escala-nao-live" },
  { q: "zxqvbnm", expect: null, kind: "inexistente" },
];

const log = (...a) => console.log(...a);

/** Dismiss cookie banner if present (it is role=dialog and can swallow clicks). */
async function dismissCookies(page) {
  for (const re of [/rejeitar/i, /recusar/i, /reject/i, /decline/i]) {
    try {
      const btn = page.locator(".cookie-banner button, .cookie-dialog button").filter({ hasText: re });
      if (await btn.count()) {
        await btn.first().click({ timeout: 1200 });
        await page.waitForTimeout(200);
        return true;
      }
    } catch {
      /* banner ausente */
    }
  }
  return false;
}

/** Open the desktop search popover via the header trigger. */
async function openDesktopSearch(page) {
  await page.locator(".utility-search").click({ timeout: 5000 });
  await page.waitForSelector("#busca-menu input", { timeout: 5000 });
  await page.waitForTimeout(60);
}

/** Count anything that behaves like a search RESULT inside the open search UI. */
async function countInlineResults(page) {
  return page.evaluate(() => {
    const pop = document.querySelector("#busca-menu");
    if (!pop) return { found: false };
    const input = pop.querySelector("input");
    const kids = [...pop.children].filter((el) => el !== input);
    return {
      found: true,
      popTag: pop.tagName,
      popRole: pop.getAttribute("role"),
      totalChildElements: pop.querySelectorAll("*").length,
      nonInputChildren: kids.length,
      resultish: pop.querySelectorAll(
        '[role="option"], [role="listbox"], [role="menuitem"], a[href], li, .search-result, .result, [aria-live], [aria-activedescendant]',
      ).length,
      liveRegions: pop.querySelectorAll("[aria-live]").length,
      activedescendant: pop.querySelectorAll("[aria-activedescendant]").length,
    };
  });
}

async function ariaSnapshot(page) {
  return page.evaluate(() => {
    const pop = document.querySelector("#busca-menu");
    const trig = document.querySelector(".utility-search");
    const offSearch = document.querySelector(".off-search");
    const desc = (el) =>
      el
        ? {
            tag: el.tagName,
            role: el.getAttribute("role"),
            id: el.id || null,
            ariaLabel: el.getAttribute("aria-label"),
            ariaExpanded: el.getAttribute("aria-expanded"),
            ariaControls: el.getAttribute("aria-controls"),
            ariaModal: el.getAttribute("aria-modal"),
            ariaHasPopup: el.getAttribute("aria-haspopup"),
            ariaLive: el.getAttribute("aria-live"),
            autocomplete: el.getAttribute("autocomplete"),
            type: el.getAttribute("type"),
            hidden: el.hasAttribute("hidden"),
          }
        : null;
    return {
      trigger: desc(trig),
      desktopPop: desc(pop),
      desktopInput: desc(pop?.querySelector("input") ?? null),
      mobileForm: desc(offSearch),
      pageLiveRegions: [...document.querySelectorAll("[aria-live]")].map((el) => ({
        tag: el.tagName,
        cls: el.className || null,
        live: el.getAttribute("aria-live"),
        text: (el.textContent || "").trim().slice(0, 80),
      })),
      activeElementAtRest: document.activeElement?.tagName + "." + (document.activeElement?.className || ""),
      dialogsInDom: document.querySelectorAll('[role="dialog"]').length,
    };
  });
}

/** Runs one search term end to end on the desktop popover and measures. */
async function runTerm(page, term) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".utility-search", { timeout: 15000 });
  await dismissCookies(page);
  await openDesktopSearch(page);

  // Q1: does anything appear as the user TYPES (before submit)?
  const input = page.locator("#busca-menu input");
  await input.click();
  const tType0 = Date.now();
  await input.type(term.q, { delay: 12 });
  const typeMs = Date.now() - tType0;
  await page.waitForTimeout(180); // give any debounce a chance to fire
  const inline = await countInlineResults(page);

  // Q3/Q6: install in-page timer, then submit.
  await page.evaluate(() => {
    window.__m = { t0: performance.now(), done: 0, path: location.pathname };
    const mo = new MutationObserver(() => {
      const main = document.querySelector("main");
      const settled = location.pathname !== window.__m.path && main && main.querySelector("h1, h2");
      if (settled && !window.__m.done) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!window.__m.done) {
              window.__m.done = performance.now() - window.__m.t0;
              mo.disconnect();
            }
          }),
        );
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  await page.keyboard.press("Enter");
  await page
    .waitForFunction(() => window.__m && window.__m.done > 0, { timeout: 12000 })
    .catch(() => {});
  const ms = await page.evaluate(() => window.__m.done);
  await page.waitForTimeout(120);

  const landed = await page.evaluate(() => {
    const main = document.querySelector("main");
    const cards = main ? [...main.querySelectorAll(".related-grid li") ] : [];
    const items = main ? [...main.querySelectorAll("article.nav-card, .nav-card")] : [];
    return {
      path: location.pathname + location.search,
      h1: (main?.querySelector("h1")?.textContent || "").trim().slice(0, 90),
      searchEcho: (main?.querySelector(".tool-help")?.textContent || "").trim().slice(0, 90),
      resultCards: cards.length || items.length,
      resultTitles: (cards.length ? cards : items).map((li) => (li.querySelector("h3")?.textContent || "").trim().slice(0, 60)),
      mainTextLen: (main?.innerText || "").trim().length,
      mainTextHead: (main?.innerText || "").trim().slice(0, 420),
      hasNoResultMessage: /nenhum|sem result|nada foi|not found|não encontrado/i.test(main?.innerText || ""),
    };
  });

  const ok = term.expect ? landed.path.startsWith(term.expect) : null;
  return { term: term.q, kind: term.kind, expected: term.expect, typeMs, inline, ms, landed, ok };
}

const results = { base: BASE, when: new Date().toISOString(), terms: [], keyboard: {}, aria: {}, mobile: {}, lang: {}, empty: {} };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: DESKTOP, locale: "pt-BR" });
const page = await ctx.newPage();
page.on("pageerror", (e) => log("  [pageerror]", e.message));

log("== Q1/Q3: 10 termos, desktop ==");
for (const t of TERMS) {
  const r = await runTerm(page, t);
  results.terms.push(r);
  log(
    `  ${r.term.padEnd(12)} inline=${r.inline.resultish} cards=${r.landed.resultCards} ms=${Math.round(r.ms)} -> ${r.landed.path}`,
  );
}

// ---- Q4: empty state, visual + text ----
log("== Q4: estado vazio (zxqvbnm) ==");
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".utility-search");
await dismissCookies(page);
await openDesktopSearch(page);
await page.locator("#busca-menu input").type("zxqvbnm", { delay: 10 });
await page.keyboard.press("Enter");
await page.waitForTimeout(700);
results.empty.landing = await page.evaluate(() => {
  const main = document.querySelector("main");
  return {
    path: location.pathname + location.search,
    innerText: (main?.innerText || "").trim(),
    cards: main?.querySelectorAll(".related-grid li").length ?? -1,
    sections: main?.querySelectorAll("section").length ?? -1,
  };
});
await page.screenshot({ path: resolve(OUT, "empty-state.png"), fullPage: true });
log("  landing:", results.empty.landing.path, "cards=", results.empty.landing.cards);
log("  text:", JSON.stringify(results.empty.landing.innerText.slice(0, 300)));

// ---- Q5: keyboard ----
log("== Q5: teclado ==");
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".utility-search");
await dismissCookies(page);

const kb = {};
// Alt+3
await page.evaluate(() => document.body.focus());
await page.keyboard.press("Alt+3");
await page.waitForTimeout(300);
kb.alt3Opens = await page.locator("#busca-menu input").count();
kb.alt3FocusAfterOpen = await page.evaluate(() => document.activeElement?.tagName + "#" + (document.activeElement?.id || "") + "." + (document.activeElement?.className || ""));

// typing + Escape: does focus return to the trigger?
await page.locator("#busca-menu input").type("braden", { delay: 10 });
const beforeEsc = await page.evaluate(() => document.activeElement?.tagName);
await page.keyboard.press("Escape");
await page.waitForTimeout(250);
kb.popAfterEsc = await page.locator("#busca-menu").count();
kb.focusAfterEsc = await page.evaluate(() => ({
  tag: document.activeElement?.tagName,
  cls: document.activeElement?.className,
  isUtilitySearch: document.activeElement?.classList?.contains("utility-search"),
  ariaLabel: document.activeElement?.getAttribute("aria-label"),
}));
kb.typedBeforeEsc = beforeEsc;

// Focus containment: Tab from inside the popover — where does focus land?
await openDesktopSearch(page);
const tabTrail = [];
for (let i = 0; i < 6; i++) {
  await page.keyboard.press("Tab");
  tabTrail.push(
    await page.evaluate(() => {
      const a = document.activeElement;
      return `${a?.tagName}.${(a?.className || "").toString().split(" ")[0]}#${a?.id || "-"}[inPop=${!!a?.closest("#busca-menu")}]`;
    }),
  );
}
kb.tabTrailFromOpenInput = tabTrail;
kb.focusTrapped = tabTrail.every((t) => t.includes("inPop=true"));
kb.bgNotInert = await page.evaluate(() => document.querySelectorAll("#menu-principal a, #menu-principal button").length);

// Arrow keys / Enter navigation inside results?
kb.arrowKeysDoAnything = await page.evaluate(() => {
  const pop = document.querySelector("#busca-menu");
  return { hasListbox: !!pop?.querySelector('[role="listbox"]'), hasCombobox: !!document.querySelector('[role="combobox"]') };
});

// Alt+1 / Alt+4 / Alt+0 sanity
for (const [name, key] of [["alt1", "Alt+1"], ["alt4", "Alt+4"], ["alt0", "Alt+0"]]) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press(key);
  await page.waitForTimeout(250);
  kb[name] = await page.evaluate(() => ({
    focus: document.activeElement?.tagName + "#" + (document.activeElement?.id || ""),
    dialog: document.querySelectorAll('[role="dialog"]').length,
  }));
}
results.keyboard = kb;
log("  alt3Opens:", kb.alt3Opens, "| focusAfterEsc:", JSON.stringify(kb.focusAfterEsc), "| trapped:", kb.focusTrapped);
log("  tabTrail:", JSON.stringify(kb.tabTrailFromOpenInput));

// ---- Q6: ARIA ----
log("== Q6: ARIA ==");
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".utility-search");
await dismissCookies(page);
results.aria.closed = await ariaSnapshot(page);
await openDesktopSearch(page);
results.aria.open = await ariaSnapshot(page);
log("  trigger:", JSON.stringify(results.aria.open.trigger));
log("  pop:", JSON.stringify(results.aria.open.desktopPop));
log("  input:", JSON.stringify(results.aria.open.desktopInput));
log("  liveRegionsInPage:", results.aria.open.pageLiveRegions.length);

await browser.close();

// ---- Q7: mobile 390px ----
log("== Q7: 390px ==");
const b2 = await chromium.launch();
const mctx = await b2.newContext({ viewport: MOBILE, locale: "pt-BR", deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await mctx.newPage();
await mp.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await mp.waitForSelector(".utility-search", { timeout: 15000 });
await dismissCookies(mp);
await mp.waitForTimeout(300);

results.mobile.closedOverflow = await mp.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  bodyScrollW: document.body.scrollWidth,
}));
await mp.locator(".utility-search").click({ timeout: 5000 });
await mp.waitForTimeout(450);
await mp.locator(".off-search input").type("braden", { delay: 15 });
await mp.waitForTimeout(250);
results.mobile.open = await mp.evaluate(() => {
  const form = document.querySelector(".off-search");
  const inp = form?.querySelector("input");
  const r = inp?.getBoundingClientRect();
  return {
    offCanvasOpen: !!document.querySelector(".off-canvas"),
    formRect: form ? { w: Math.round(form.getBoundingClientRect().width), x: Math.round(form.getBoundingClientRect().left) } : null,
    inputRect: r ? { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) } : null,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflowing: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    resultish: form ? form.querySelectorAll('[role="option"],li,a[href],[aria-live]').length : -1,
    inputHeightBelow44: r ? Math.round(r.height) < 44 : null,
  };
});
await mp.screenshot({ path: resolve(OUT, "mobile-390-search.png"), fullPage: false });
await mp.keyboard.press("Enter");
await mp.waitForTimeout(700);
results.mobile.afterEnter = await mp.evaluate(() => ({
  path: location.pathname + location.search,
  offCanvasOpen: !!document.querySelector(".off-canvas"),
  cards: document.querySelectorAll("main .related-grid li").length,
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
await mp.screenshot({ path: resolve(OUT, "mobile-390-result.png"), fullPage: true });
log("  open:", JSON.stringify(results.mobile.open));
log("  afterEnter:", JSON.stringify(results.mobile.afterEnter));

// ---- Q8: ?lang= preservation ----
log("== Q8: ?lang= ==");
const langTests = [];
// (a) start with ?lang=en on the home page, search, see if lang survives
await mp.goto(BASE + "/?lang=en", { waitUntil: "domcontentloaded" });
await mp.waitForSelector(".utility-search", { timeout: 15000 });
await dismissCookies(mp);
await mp.waitForTimeout(300);
await mp.locator(".utility-search").click();
await mp.waitForTimeout(400);
await mp.locator(".off-search input").type("braden", { delay: 10 });
await mp.keyboard.press("Enter");
await mp.waitForTimeout(800);
langTests.push({ case: "mobile: /?lang=en -> busca braden", url: mp.url(), langKept: /[?&]lang=en/.test(mp.url()) });

// (b) desktop path (>=1180px) with ?lang=en
const dctx = await b2.newContext({ viewport: DESKTOP, locale: "en-US" });
const dp = await dctx.newPage();
await dp.goto(BASE + "/?lang=en", { waitUntil: "domcontentloaded" });
await dp.waitForSelector(".utility-search", { timeout: 15000 });
await dismissCookies(dp);
await dp.waitForTimeout(300);
await openDesktopSearch(dp);
await dp.locator("#busca-menu input").type("braden", { delay: 10 });
await dp.keyboard.press("Enter");
await dp.waitForTimeout(900);
langTests.push({ case: "desktop: /?lang=en -> busca braden", url: dp.url(), langKept: /[?&]lang=en/.test(dp.url()) });

// (c) no-match fallback path with ?lang=en
await dp.goto(BASE + "/?lang=en", { waitUntil: "domcontentloaded" });
await dp.waitForSelector(".utility-search", { timeout: 15000 });
await dismissCookies(dp);
await openDesktopSearch(dp);
await dp.locator("#busca-menu input").type("zxqvbnm", { delay: 10 });
await dp.keyboard.press("Enter");
await dp.waitForTimeout(900);
langTests.push({ case: "desktop: /?lang=en -> busca zxqvbnm (fallback)", url: dp.url(), langKept: /[?&]lang=en/.test(dp.url()) });

// (d) switch language from the header AFTER searching (pt -> en)
await dp.goto(BASE + "/secao/calculadoras", { waitUntil: "domcontentloaded" });
await dp.waitForSelector(".lang-trigger", { timeout: 15000 });
await dismissCookies(dp);
await dp.locator(".lang-trigger").click();
await dp.waitForTimeout(200);
const langButtons = dp.locator("#header-language-menu button");
const n = await langButtons.count();
for (let i = 0; i < n; i++) {
  const label = (await langButtons.nth(i).innerText()).trim();
  if (/^en/i.test(label)) {
    await langButtons.nth(i).click();
    break;
  }
}
await dp.waitForTimeout(600);
langTests.push({ case: "troca de idioma via header apos ?q=", url: dp.url(), langKept: /[?&]lang=en/.test(dp.url()) });

results.lang = { tests: langTests };
for (const t of langTests) log("  ", t.langKept ? "OK  " : "FALHA", t.case, "->", t.url);

await b2.close();
await ctx.close().catch(() => {});
await browser.close().catch(() => {});

writeFileSync(resolve(OUT, "dom-report.json"), JSON.stringify(results, null, 2));
log("\nOK -> ", resolve(OUT, "dom-report.json"));
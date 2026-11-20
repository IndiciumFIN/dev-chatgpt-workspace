/**
 * CONTRASTE DO SHELL por PIXEL REAL (WCAG 1.4.3 / 1.4.11).
 *
 * Metodo: recorta a caixa do elemento NA CAPTURA (deviceScaleFactor 2) e tira
 * a cor MODAL do fundo e a cor MODAL do glifo. O `color` do DOM entra so como
 * controle cruzado — veredito e sempre o pixel.
 *
 * Uso: node measure-contrast.mjs <phase> <from> <to>
 *      phase = light | mobile | high | dark | states
 * Writes incrementally to <phase>.jsonl so the run survives a chunked shell.
 */
import { chromium } from "playwright";
import { readFileSync, appendFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { decodePNG } from "./lib-png.mjs";
import { contrast, modalColor, glyphColor, hex, dist } from "./lib-contrast.mjs";

const BASE = process.env.A11Y_BASE || "https://20itbcndi7b8r.space.minimax.io";
const OUT = new URL("./", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const TARGETS = [
  [".header-utility .lang-trigger", "faixa utilidade / seletor de idioma (PT)"],
  [".header-utility .utility-search span", "faixa utilidade / 'Pesquisar'"],
  [".header-utility .utility-login", "faixa utilidade / 'Entrar'"],
  [".header-utility .utility-subscribe", "faixa utilidade / 'Assine ja'"],
  [".header-utility .a11y-mobile-toggle span", "faixa utilidade / alternador acessibilidade"],
  ["#header-language-menu button", "menu de idiomas / item"],
  ["#header-language-menu button[aria-current='true']", "menu de idiomas / item atual"],
  [".a11y-bar button:nth-of-type(1) .a11y-action-label", "barra a11y / 'Diminuir texto'"],
  [".a11y-bar button:nth-of-type(2) .a11y-action-label", "barra a11y / 'Aumentar texto'"],
  [".a11y-bar button:nth-of-type(3)", "barra a11y / 'Contraste'"],
  [".a11y-bar button:nth-of-type(4)", "barra a11y / 'Fonte para dislexia'"],
  [".a11y-bar button:nth-of-type(5)", "barra a11y / 'Modo escuro'"],
  [".a11y-bar button:nth-of-type(6)", "barra a11y / 'Atalhos de teclado'"],
  [".a11y-bar button:last-of-type", "barra a11y / 'Redefinir'"],
  [".desktop-nav a:not(.btn-assine):not(.is-current)", "nav / link neutro"],
  [".desktop-nav button:not(.btn-entrar)", "nav / botao com submenu"],
  [".desktop-nav .nav-guide", "nav / 'Guia'"],
  [".desktop-nav a.btn-assine", "nav / 'Assine ja'"],
  [".desktop-nav .btn-entrar a", "nav / 'Administracao local' (slot Entrar)"],
  [".desktop-nav a.is-current", "nav / item atual"],
  [".desktop-nav .live-pill", "nav / pilula 'No ar'"],
  [".skip-link", "skip link"],
  ["#busca-menu input", "busca / campo"],
  [".off-canvas header span", "off-canvas / cabecalho"],
  [".off-canvas .off-link", "off-canvas / link"],
  [".off-canvas .off-group", "off-canvas / grupo"],
  [".to-top", "botao 'voltar ao topo'"],
  [".shortcut-dialog dt", "dialogo atalhos / rotulo"],
  [".shortcut-dialog kbd", "dialogo atalhos / tecla"],
];

const PHASES = {
  light: { viewport: { width: 1440, height: 900 } },
  mobile: {
    viewport: { width: 390, height: 844 },
    setup: async (page) => {
      await page.locator(".hamburger").click();
      await page.waitForSelector(".off-canvas");
      await page.waitForTimeout(400);
    },
  },
  search: {
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await page.locator(".header-utility .utility-search").click();
      await page.waitForSelector("#busca-menu");
      await page.waitForTimeout(400);
    },
  },
  shortcuts: {
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await page.locator(".a11y-bar button:nth-of-type(6)").click();
      await page.waitForSelector(".shortcut-dialog");
      await page.waitForTimeout(400);
    },
  },
  high: {
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await page.evaluate(() => document.documentElement.setAttribute("data-contrast", "high"));
      await page.waitForTimeout(300);
    },
  },
  dark: {
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
      await page.waitForTimeout(300);
    },
  },
  states: {
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await page.locator(".a11y-bar button:nth-of-type(5)").hover();
      await page.waitForTimeout(400);
    },
  },
};

const jsonl = (phase) => OUT + `${phase}.jsonl`;
const shots = (phase) => OUT + `shot-${phase}`;

function threshold(cs) {
  const px = parseFloat(cs.fontSize);
  const bold = parseInt(cs.fontWeight, 10) >= 700;
  const large = px >= 24 || (bold && px >= 18.66);
  return { large, min: large ? 3 : 4.5 };
}

async function measure(page, sel, label, phase) {
  const loc = page.locator(sel).first();
  if ((await loc.count()) === 0) return { sel, label, status: "NOT_FOUND" };
  const info = await loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      display: cs.display, visibility: cs.visibility,
      text: (el.textContent || "").trim().slice(0, 60),
    };
  });
  if (!info.rect.w || !info.rect.h || info.display === "none" || info.visibility === "hidden")
    return { sel, label, status: "HIDDEN", display: info.display, rect: info.rect, text: info.text };
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  const box = await loc.boundingBox();
  if (!box || box.width < 1 || box.height < 1) return { sel, label, status: "NO_BOX", rect: info.rect };
  const vp = page.viewportSize();
  const clip = {
    x: Math.max(0, box.x), y: Math.max(0, box.y),
    width: Math.min(box.width, vp.width - Math.max(0, box.x)),
    height: Math.min(box.height, vp.height - Math.max(0, box.y)),
  };
  if (clip.width < 2 || clip.height < 2) return { sel, label, status: "OFFSCREEN", rect: box };
  const buf = await page.screenshot({ clip });
  const img = decodePNG(buf);
  const dpr = img.width / clip.width;
  const padX = Math.min(3, Math.floor(clip.width / 4));
  const padY = Math.min(3, Math.floor(clip.height / 4));
  const region = {
    x0: Math.round(padX * dpr), y0: Math.round(padY * dpr),
    x1: Math.round((clip.width - padX) * dpr), y1: Math.round((clip.height - padY) * dpr),
  };
  const bg = modalColor(img, region);
  const fg = bg ? glyphColor(img, bg.rgb, region) : null;
  const cs = await loc.evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight, opacity: s.opacity };
  });
  const th = threshold(cs);
  const ratioPx = fg ? contrast(fg.rgb, bg.rgb) : null;
  const cssRgb = cs.color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  const stack = await loc.evaluate((el) => {
    const out = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== "none") out.push("GRADIENTE");
      if (s.backgroundColor && s.backgroundColor !== "transparent" && !/rgba?\([^)]*,\s*0\)$/.test(s.backgroundColor)) out.push(s.backgroundColor);
      n = n.parentElement;
    }
    return out.slice(0, 3);
  });
  return {
    phase, sel, label, status: "OK", text: info.text,
    rect: { w: +box.width.toFixed(1), h: +box.height.toFixed(1), x: +box.x.toFixed(1), y: +box.y.toFixed(1) },
    fontSize: cs.fontSize, fontWeight: cs.fontWeight, isLargeText: th.large, minRequired: th.min,
    bgReal: bg.hex, bgShare: +bg.share.toFixed(3), bgFlatness: +bg.flatness.toFixed(2),
    fgReal: fg ? fg.hex : null, glyphPixels: fg ? fg.pixels : 0,
    contrastPixel: ratioPx ? +ratioPx.toFixed(2) : null,
    passPixel: ratioPx ? ratioPx >= th.min : null,
    cssColor: cs.color,
    cssVsRealDelta: cssRgb && fg ? +dist(cssRgb, fg.rgb).toFixed(1) : null,
    domBgStack: stack,
  };
}

const phase = process.argv[2];
const from = Number(process.argv[3] ?? 0);
const to = Number(process.argv[4] ?? TARGETS.length);
const cfg = PHASES[phase];
if (!cfg) { console.error("phase desconhecida:", phase, Object.keys(PHASES).join(",")); process.exit(2); }

mkdirSync(shots(phase), { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: cfg.viewport, deviceScaleFactor: 2, locale: "pt-BR" });
await ctx.addInitScript(() => {
  try { localStorage.setItem("cde-consent", JSON.stringify({ translation: false, audience: false })); } catch {}
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 25000 });
await page.waitForSelector(".header-utility", { timeout: 20000 });
await page.waitForTimeout(700);
if (cfg.setup) await cfg.setup(page);

const chunk = TARGETS.slice(from, to);
for (const [sel, label] of chunk) {
  let row;
  try { row = await measure(page, sel, label, phase); }
  catch (err) { row = { phase, sel, label, status: "ERROR", error: String(err.message).slice(0, 140) }; }
  appendFileSync(jsonl(phase), JSON.stringify(row) + "\n");
  if (row.status === "OK") {
    console.log(
      `${row.passPixel ? "PASS" : "FAIL"} ${String(row.contrastPixel).padStart(6)}:1  min ${row.minRequired}  ` +
      `${String(row.fontSize).padStart(6)} ${String(row.fontWeight).padStart(4)}  ${row.bgReal} sobre ${row.fgReal}  ${label}`
    );
  } else console.log(`  ${row.status.padEnd(9)} ${sel}`);
}
await browser.close();

// merge
if (existsSync(jsonl(phase))) {
  const rows = readFileSync(jsonl(phase), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const uniq = [...new Map(rows.map((r) => [r.sel, r])).values()];
  writeFileSync(OUT + `${phase}.json`, JSON.stringify(uniq, null, 2));
  const fails = uniq.filter((r) => r.status === "OK" && r.passPixel === false);
  console.log(`\n${phase}: ${uniq.length} alvos, ${fails.length} abaixo do minimo`);
  for (const f of fails) console.log(`  FAIL ${f.contrastPixel}:1 (min ${f.minRequired}) ${f.fgReal} sobre ${f.bgReal} — ${f.label}`);
}
process.exit(0);
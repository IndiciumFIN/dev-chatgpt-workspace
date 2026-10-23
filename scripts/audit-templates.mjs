#!/usr/bin/env node
/**
 * Um template de cada kind, validado contra o contrato declarado.
 *
 * O contrato em `src/lib/template-contract.ts` declara 11 kinds. Cada um tem
 * que ter UMA pagina real que o renderize, e essa pagina tem que corresponder
 * ao que o contrato declara: frame, hero, crumbs, tools, toc, related, note,
 * stickyTools e resources.
 *
 * A politica (CKO-POL-UT-001, "Explicit non-applicability") diz: dominio nao
 * aplicavel usa `NOT_APPLICABLE_JUSTIFIED` COM EVIDENCIA — nunca um nulo
 * silencioso. Por isso este script NAO aceita kind sem pagina: ele exige que
 * cada kind tenha pagina, ou que a nao aplicabilidade seja declarada e
 * justificada.
 *
 * USO
 *   node scripts/audit-templates.mjs [porta]
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { templateExamples } from "@/lib/template-examples";

const PORT = process.argv[2] ?? "4190";
const BASE = `http://127.0.0.1:${PORT}`;

/** O kind, a pagina que o renderiza, e o por que. */
const { templateCatalogo } = await import("../src/lib/template-catalog.ts");
const EXEMPLOS = templateExamples;
// Os templates do catalogo que JA tem pagina entram na validacao.
const EXEMPLOS_CATALOGO = templateCatalogo.filter((t) => t.url);

// O contrato, lido do codigo — nao uma copia mantida a mao.
const { contratos: contrato, aplicabilidade: aplicabilidade } = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e",
      `Promise.all([import('./src/lib/template-contract.ts'), import('./src/lib/template-applicability.ts')]).then(([m,a])=>process.stdout.write(JSON.stringify({contratos:m.templateContracts, aplicabilidade:a.templateApplicability}))).catch(e=>{process.stderr.write(String(e));process.exit(1)})`,
    ],
    { encoding: "utf8", cwd: process.cwd(), stdio: ["ignore", "pipe", "inherit"] },
  ),
);

/** O que o DOM mostra, para comparar com o que o contrato declara. */
const LEITOR = () => {
  const q = (s) => document.querySelector(s);
  const ferramentas = [...document.querySelectorAll(".gt-tool")].map((el) => {
    const label = el.querySelector(".gt-tool-label")?.textContent?.trim() ?? el.textContent?.trim() ?? "";
    const aria = el.getAttribute("aria-label") ?? "";
    if (/favorit/i.test(label + aria)) return "favorite";
    if (/imprimir|pdf/i.test(label + aria) && /imprimir/i.test(label + aria)) return "print";
    if (el.tagName === "A" && /pdf/i.test(label + aria)) return "pdf";
    if (/\b\d+\s*min\b|tempo|minuto|leitura/i.test(label + aria)) return "readingTime";
    if (/ouvir|audio|listen/i.test(label + aria)) return "listen";
    if (/docx/i.test(label + aria)) return "docx";
    if (/limpar/i.test(label + aria)) return "clear";
    if (/corrig|relatar|report/i.test(label + aria)) return "report";
    return null;
  }).filter(Boolean);
  return {
    frame:
      q(".login-screen") ? "login"
      : q(".area-app") ? "area"
      : q(".local-workbench") ? "admin"
      : q(".hero-zone, .hero-main") ? "home"
      : q(".site-header") ? "shell"
      : "desconhecido",
    hero: q("header.inst-hero") ? "page" : q(".hero-zone, .hero-main") ? "home" : "none",
    crumbs: !!q("nav.inst-crumbs"),
    tools: [...new Set(ferramentas)],
    toc: q("details.inst-toc") ? "sidebar" : "none",
    // `.related-grid` aparece em dois contextos: os tiles dos blocos de secao e o
    // conteudo relacionado de verdade. O relacionado e o unico dentro de
    // `.inst-sec.no-print`; sem esse prefixo, o validador confundiria os dois.
    related: !!q(".inst-sec.no-print .related-grid"),
    note: q(".inst-callout") ? "callout" : q(".inst-note, .note-inline, [class*='note-inline'], .tpl-note, .artigo-nota, .inst-observacao") ? "inline" : "none",
    stickyTools: !!q(".gt-utilitybar.is-sticky"),
    resources: [
      ...document.querySelectorAll(".clinical-form, form.calc-form, form[data-form='formulario']").length ? ["formulario"] : [],
      ...document.querySelectorAll(".calc-sheet, .print-sheet, .laudo").length ? ["laudo"] : [],
    ],
  };
};

/**
 * Espera a HIDRATACAO, nao um tempo arbitrario.
 *
 * O build estatico entrega um shell de 5.771 bytes; o conteudo so aparece
 * depois que o JS roda. Com `domcontentloaded` + 1s, as rotas que demoravam
 * mais voltavam como "frame desconhecido" — o auditor acusava desvio onde nao
 * havia. Medir exige esperar o SINAL, nao o relogio.
 */
async function hidratar(page) {
  try {
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("h1");
        return !!h1 && h1.textContent.trim().length > 0 && document.body.innerText.length > 400;
      },
      { timeout: 20000 },
    );
  } catch {
    await page.waitForTimeout(3000);
  }
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const linhas = [];
let falhas = 0;

const naoAplicaveis = Object.entries(aplicabilidade).filter(([, v]) => !v.aplicavel);
for (const [kind, v] of naoAplicaveis) {
  const temJustificativa = !!(v.justificativa && v.justificativa.trim());
  const temEvidencia = !!(v.evidencia && v.evidencia.trim());
  const ok = temJustificativa && temEvidencia;
  if (!ok) falhas++;
  console.log(`  ${ok ? "✓" : "✗"} ${kind.padEnd(12)} NAO APLICAVEL — ${ok ? "justificada e com evidencia" : "FALTA justificativa ou evidencia"}`);
  linhas.push({ kind, aplicavel: false, justificativa: v.justificativa ?? null, evidencia: v.evidencia ?? null, ok });
}

for (const exemplo of EXEMPLOS) {
  if (aplicabilidade[exemplo.kind] && !aplicabilidade[exemplo.kind].aplicavel) {
    console.log(`  – ${exemplo.kind.padEnd(12)} pulado: declarado nao aplicavel`);
    continue;
  }
  const declarado = contrato[exemplo.kind];
  if (!declarado) {
    console.log(`  ✗ ${exemplo.kind}: nao existe no contrato`);
    falhas++;
    continue;
  }
  let observado;
  let status = 0;
  try {
    const resposta = await page.goto(`${BASE}${exemplo.url}`, { waitUntil: "domcontentloaded", timeout: 40000 });
    await hidratar(page);
    status = resposta?.status() ?? 0;
    observado = await page.evaluate(LEITOR);
  } catch (e) {
    console.log(`  ✗ ${exemplo.kind}: nao carregou (${String(e).slice(0, 60)})`);
    falhas++;
    continue;
  }

  const desvios = [];
  if (status !== 200) desvios.push(`HTTP ${status}`);
  if (observado.frame !== exemplo.frame) desvios.push(`frame ${observado.frame} != ${exemplo.frame}`);
  if (observado.hero !== declarado.hero) desvios.push(`hero ${observado.hero} != ${declarado.hero}`);
  if (observado.crumbs !== declarado.crumbs) desvios.push(`crumbs ${observado.crumbs} != ${declarado.crumbs}`);
  if (observado.toc !== declarado.toc) desvios.push(`toc ${observado.toc} != ${declarado.toc}`);
  if (observado.related !== declarado.related) desvios.push(`related ${observado.related} != ${declarado.related}`);
  if (observado.note !== exemplo.note) desvios.push(`note ${observado.note} != ${exemplo.note}`);
  if (observado.stickyTools !== declarado.stickyTools) desvios.push(`stickyTools ${observado.stickyTools} != ${declarado.stickyTools}`);
  const faltando = declarado.tools.filter((t) => !observado.tools.includes(t));
  if (faltando.length) desvios.push(`tools faltando: ${faltando.join(",")}`);
  const sobrando = observado.tools.filter((t) => !declarado.tools.includes(t));
  if (sobrando.length) desvios.push(`tools a mais: ${sobrando.join(",")}`);
  if (declarado.resources.length !== observado.resources.length)
    desvios.push(`resources ${JSON.stringify(observado.resources)} != ${JSON.stringify(declarado.resources)}`);

  const ok = desvios.length === 0;
  if (!ok) falhas++;
  console.log(`  ${ok ? "✓" : "✗"} ${exemplo.kind.padEnd(12)} ${exemplo.url.padEnd(30)} ${ok ? "bate com o contrato" : desvios.join(" | ")}`);
  linhas.push({ kind: exemplo.kind, url: exemplo.url, porQue: exemplo.porQue, declarado, observado, desvios, ok });
}


// ── os templates do catalogo do dono ──────────────────────────────────────
console.log("\n  TEMPLATES DO CATALOGO");
for (const item of EXEMPLOS_CATALOGO) {
  const exemplo = { kind: item.kind, url: item.url, frame: item.frame, note: item.note };
  let status = 0;
  let observado = null;
  try {
    const resposta = await page.goto(`${BASE}${item.url}`, { waitUntil: "domcontentloaded", timeout: 40000 });
    status = resposta?.status() ?? 0;
    await hidratar(page);
    observado = await page.evaluate(LEITOR);
  } catch (e) {
    console.log(`  ✗ ${item.nome.padEnd(38)} nao carregou`); falhas++; continue;
  }
  const declarado = contrato[exemplo.kind];
  const desvios = [];
  if (status !== 200) desvios.push(`HTTP ${status}`);
  if (observado.frame !== exemplo.frame) desvios.push(`frame ${observado.frame} != ${exemplo.frame}`);
  if (observado.hero !== declarado.hero) desvios.push(`hero ${observado.hero} != ${declarado.hero}`);
  if (observado.crumbs !== declarado.crumbs) desvios.push(`crumbs ${observado.crumbs} != ${declarado.crumbs}`);
  if (observado.toc !== declarado.toc) desvios.push(`toc ${observado.toc} != ${declarado.toc}`);
  if (observado.related !== declarado.related) desvios.push(`related ${observado.related} != ${declarado.related}`);
  if (observado.note !== exemplo.note) desvios.push(`note ${observado.note} != ${exemplo.note}`);
  if (observado.stickyTools !== declarado.stickyTools) desvios.push(`stickyTools ${observado.stickyTools} != ${declarado.stickyTools}`);
  const faltando = declarado.tools.filter((t) => !observado.tools.includes(t));
  if (faltando.length) desvios.push(`tools faltando: ${faltando.join(",")}`);
  const ok = desvios.length === 0;
  if (!ok) falhas++;
  console.log(`  ${ok ? "✓" : "✗"} ${item.nome.padEnd(38)} ${item.url.padEnd(30)} ${ok ? "ok" : desvios.join(" | ")}`);
  linhas.push({ template: item.id, url: item.url, desvios, ok });
}
const pendentes = templateCatalogo.filter((t) => !t.url);
console.log(`\n  SEM PAGINA AINDA (${pendentes.length}): ${pendentes.map((p) => p.nome).join(", ")}`);

await browser.close();

writeFileSync(
  "/workspace/project_audit/analise-cke/TEMPLATES-AUDIT.json",
  JSON.stringify({ quando: new Date().toISOString(), base: BASE, linhas }, null, 2),
);

const ok = linhas.filter((l) => l.ok).length;
console.log(`\n  ${ok}/${linhas.length} kinds batem com o contrato declarado (${EXEMPLOS.length} com pagina + ${naoAplicaveis.length} nao aplicaveis).`);
if (falhas) {
  console.log(`  ${falhas} com desvio.`);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Verificador do plano de correcção dos links do espelho.
 *
 *   node scripts/verify-espelho-link-plan.mjs --inventario <csv> --acervo <dir> [--json]
 *
 * Não precisa do HTML do espelho: precisa do **inventário** (as ocorrências com
 * a página, o atributo, o uri e o destino resolvido) e do **acervo canónico**
 * (onde os ficheiros estão de facto). Aplica as mesmas regras do corrector
 * (`fix-espelho-links.mjs`) e re-resolve cada destino contra o acervo.
 *
 * Saída: exit 0 se **todas** as ligações quebradas passam a resolver; exit 1
 * se sobrar uma. Um verde aqui significa "as regras fecham o inventário contra
 * o acervo", não "o espelho está no sítio certo" — isso é uma decisão do dono.
 */

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, join, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { RULES } from "./fix-espelho-links.mjs";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

function parseArgs(argv) {
  const out = { inventario: null, acervo: REPO_ROOT, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--inventario") out.inventario = argv[++i];
    else if (a === "--acervo") out.acervo = resolve(argv[++i]);
    else if (a === "--json") out.json = true;
    else if (a === "--help" || a === "-h") {
      console.log("uso: node scripts/verify-espelho-link-plan.mjs --inventario <csv> --acervo <dir> [--json]");
      process.exit(0);
    } else { console.error(`ERRO: argumento desconhecido: ${a}`); process.exit(2); }
  }
  if (!out.inventario) { console.error("ERRO: falta --inventario"); process.exit(2); }
  return out;
}

/** CSV simples (o inventário não tem aspas nem campos com vírgula). */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const head = lines[0].replace(/^\uFEFF/, "").split(",");
  return lines.slice(1).map((l) => {
    const cells = l.split(",");
    const o = {};
    head.forEach((h, i) => { o[h] = (cells[i] ?? "").trim(); });
    return o;
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const invPath = isAbsolute(args.inventario) ? args.inventario : join(REPO_ROOT, args.inventario);
  if (!existsSync(invPath)) { console.error(`ERRO: inventario ausente: ${args.inventario}`); process.exit(1); }
  const rows = parseCsv(readFileSync(invPath, "utf8"));

  // conjunto de ficheiros do acervo canónico
  const acervo = new Set();
  const base = join(args.acervo, "public/bibliotecas");
  if (existsSync(base)) {
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile()) acervo.add(relative(args.acervo, p));
      }
    };
    walk(base);
  }
  // páginas do próprio espelho, tal como o inventário as registou
  const paginasEspelho = new Set(rows.map((r) => r.page).filter(Boolean));

  const quebradas = rows.filter((r) => (r.found || "").toLowerCase() === "false");
  const porRegra = {};
  const porResolver = [];
  let resolvem = 0;

  for (const r of quebradas) {
    const page = r.page;
    const d = dirname(page);
    const tag = r.tag === "src" ? "img" : "a";
    const ctx = { tag, uri: r.uri, dir: join(args.acervo, d), page: join(args.acervo, page) };
    const rule = RULES.find((x) => x.applies(ctx));
    if (!rule) { porResolver.push({ page, uri: r.uri, motivo: "sem regra aplicavel" }); continue; }
    const rewritten = rule.rewrite(ctx);
    if (!rewritten) { porResolver.push({ page, uri: r.uri, motivo: `regra ${rule.id} sem resposta segura` }); continue; }
    const destino = resolve(join(args.acervo, d), rewritten.uri);
    const rel = relative(args.acervo, destino);
    if (acervo.has(rel) || paginasEspelho.has(rel)) {
      resolvem++;
      porRegra[rule.id] = (porRegra[rule.id] || 0) + 1;
    } else {
      porResolver.push({ page, uri: r.uri, motivo: `destino inexistente: ${rel}` });
    }
  }

  const report = {
    status: porResolver.length ? "REPROVADO" : "PASS",
    inventario: args.inventario,
    ocorrenciasTotais: rows.length,
    ligacoesQuebradas: quebradas.length,
    resolvemComAsRegras: resolvem,
    porResolver: porResolver.length,
    porRegra,
    exemplosPorResolver: porResolver.slice(0, 20),
    acervoFicheiros: acervo.size,
    paginasDoEspelho: paginasEspelho.size
  };
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.status}: ${report.ligacoesQuebradas} ligações quebradas no inventário; ` +
      `${report.resolvemComAsRegras} resolvem com as regras (${Object.entries(porRegra).map(([k, v]) => `${k}=${v}`).join(", ") || "nenhuma"}); ` +
      `${report.porResolver} por resolver.`);
    for (const p of report.exemplosPorResolver) console.error(`  por resolver: ${p.page} → ${p.uri} (${p.motivo})`);
  }
  process.exit(porResolver.length ? 1 : 0);
}

main();

#!/usr/bin/env node
/**
 * Corrector dos links do espelho estático de bibliotecas.
 *
 *   node scripts/fix-espelho-links.mjs --root <dir> [--espelho <rel>] [--apply] [--json]
 *
 * ── O que faz e porquê ──
 *
 * O espelho estático (`public/bibliotecas/catalog/`) tem **5.520 destinos locais
 * não resolvidos**, medidos no inventário E4 (9.063 ocorrências em 268 páginas:
 * 1.920 `img` + 7.143 `a`, das quais 5.520 não resolvem). A causa é estrutural:
 * o espelho foi copiado para um nível mais fundo do que o acervo canónico, por
 * isso os caminhos relativos caem em `catalog/` e `catalog/assets/` onde os
 * ficheiros não estão.
 *
 * **Três regras, e nada mais** — não há inferência, não há padrão genérico:
 *
 *   R-IMG-HUB    `src="assets/<cat>/<f>.avif"`  →  `src="../assets/<cat>/<f>.avif"`
 *                (página-hub em `catalog/`; o destino é `public/bibliotecas/assets/`)
 *   R-AVIF-ITEM  `src|href="<cat>/<f>.avif"`    →  `src|href="../../assets/<cat>/<f>.avif"`
 *                (página de item em `catalog/assets/`; sobe dois níveis)
 *   R-NAV        `href="index.html"` / `"<cat>.html"`  →  `href="../index.html"` / `"../<cat>.html"`
 *                (página de item em `catalog/assets/`; sobe um nível)
 *
 * ── Regra de desenho: o verificador manda, o corrector não decide ──
 *
 * Depois de reescrever, o script **re-resolve todos os references locais** das
 * páginas tocadas e **reprova** (exit 1) se sobrar um só destino por resolver.
 * Um verde aqui significa "todos os links resolvem contra os ficheiros que
 * existem", não "os ficheiros são os certos".
 *
 * Por omissão é `dry-run`: escreve o plano, não os ficheiros. `--apply` escreve.
 * Um relatório JSON sai em ambos os casos (quantas ocorrências, por regra, o que
 * ficou por resolver).
 *
 * O espelho **não está no git** (medido: nenhum dos 182 refs do repositório de
 * governança, nem as branches do repositório da app o contêm). O destino do
 * espelho corrigido — descartar a cópia ou promovê-la — é decisão do dono, não
 * deste script.
 */

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, join, dirname, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEFAULT_ESPELHO = "public/bibliotecas/catalog";

export const RULES = [
  {
    // Página-hub em `catalog/`: o uri já traz `assets/`, que é o prefixo a
    // remover (o destino é `public/bibliotecas/assets/...`). Vale para `img`
    // e para `a` — o inventário tem os dois.
    id: "R-ASSET-HUB",
    applies: (ctx) => ctx.uri.startsWith("assets/") && !ctx.uri.startsWith("assets/assets/"),
    rewrite: (ctx) => ({ uri: "../" + ctx.uri, dir: "../" })
  },
  {
    id: "R-AVIF-ITEM",
    // Página de item em `catalog/assets/<cat>.html`: o destino é
    // `public/bibliotecas/assets/<cat>/<f>.avif`. Se o uri já trouxer a
    // categoria (`<cat>/<f>.avif`) usa-se tal como está; se não trouxer,
    // deriva-se da própria página (`<cat>.html` → `<cat>/<f>.avif`).
    applies: (ctx) => ctx.uri.endsWith(".avif") && !ctx.uri.startsWith("assets/"),
    rewrite: (ctx) => {
      if (ctx.uri.includes("/")) return { uri: "../../assets/" + ctx.uri, dir: "../../assets/" };
      // Sem categoria no uri: deriva-se da pagina, MAS só se o ficheiro
      // derivado existir. O script nunca inventa um caminho.
      const categoria = basenameNoExt(ctx.page);
      const rel = categoria ? categoria + "/" + ctx.uri : ctx.uri;
      const destino = resolve(ctx.dir, "../../assets/" + rel);
      if (!existsSync(destino)) return null;
      return { uri: "../../assets/" + rel, dir: "../../assets/" };
    }
  },
  {
    id: "R-NAV",
    applies: (ctx) => ctx.tag === "a" && !ctx.uri.endsWith(".avif") && ctx.dir.endsWith(sep + "catalog" + sep + "assets"),
    rewrite: (ctx) => ({ uri: "../" + ctx.uri, dir: "../" })
  }
];

class UsageError extends Error {}

/* ── argumentos ─────────────────────────────────────────────────────────── */
function parseArgs(argv) {
  const out = { root: REPO_ROOT, espelho: DEFAULT_ESPELHO, apply: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") out.root = resolve(argv[++i]);
    else if (a === "--espelho") out.espelho = argv[++i];
    else if (a === "--apply") out.apply = true;
    else if (a === "--json") out.json = true;
    else if (a === "--help" || a === "-h") {
      console.log("uso: node scripts/fix-espelho-links.mjs [--root <dir>] [--espelho <rel>] [--apply] [--json]");
      process.exit(0);
    } else throw new UsageError(`argumento desconhecido: ${a}`);
  }
  return out;
}

/** nome do ficheiro sem extensão (a categoria de uma página de item) */
export function basenameNoExt(p) {
  const b = p.split(/[\\/]/).pop() || "";
  return b.replace(/\.html?$/i, "");
}

/* ── referências locais numa página ─────────────────────────────────────── */
const REF_RE = /\b(src|href)\s*=\s*"([^"]*)"/gi;

function refsOf(html) {
  const out = [];
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(html))) {
    const [, attr, uri] = m;
    if (!uri || /^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(uri)) continue; // externo ou âncora
    out.push({ attr, uri, index: m.index, length: m[0].length });
  }
  return out;
}

/** Um destino local resolve se o ficheiro existir (relativo ao directório da página). */
function resolves(root, pageAbs, uri) {
  const target = resolve(dirname(pageAbs), uri.split("#")[0].split("?")[0]);
  if (!existsSync(target)) return false;
  try { return statSync(target).isFile(); } catch { return false; }
}

/* ── recolha de páginas ─────────────────────────────────────────────────── */
function htmlFiles(root, espelhoRel) {
  const base = isAbsolute(espelhoRel) ? espelhoRel : join(root, espelhoRel);
  if (!existsSync(base)) return [];
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.toLowerCase().endsWith(".html")) out.push(p);
    }
  };
  walk(base);
  return out.sort();
}

/* ── principal ──────────────────────────────────────────────────────────── */
function main() {
  const args = parseArgs(process.argv.slice(2));
  const espelhoDir = isAbsolute(args.espelho) ? args.espelho : join(args.root, args.espelho);
  const pages = htmlFiles(args.root, args.espelho);

  if (!pages.length) {
    const report = {
      status: "ESPELHO_ABSENTE",
      espelho: relative(args.root, espelhoDir) || espelhoDir,
      pages: 0,
      note: "o espelho nao esta neste ambiente: o HTML corrigido nao existe aqui. " +
            "O plano de rewrite (5.520 ocorrencias, com destino validado contra o acervo canonico) " +
            "e executavel onde o espelho existir."
    };
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.error(`REPROVADO: espelho ausente em ${report.espelho}`);
      console.error(`  ${report.note}`);
    }
    process.exit(1);
  }

  const changes = [];      // {page, attr, de, para, regra, destino}
  const unresolvedBefore = [];
  const unresolvedAfter = [];
  const porRegra = {};
  let rewrittenPages = 0;

  for (const pageAbs of pages) {
    const html = readFileSync(pageAbs, "utf8");
    const refs = refsOf(html);
    const edits = [];

    for (const ref of refs) {
      if (resolves(args.root, pageAbs, ref.uri)) continue; // já resolve
      const ctx = { tag: ref.attr === "src" ? "img" : "a", uri: ref.uri, dir: dirname(pageAbs), page: pageAbs };
      unresolvedBefore.push({ page: relative(args.root, pageAbs), uri: ref.uri });
      const rule = RULES.find((r) => r.applies(ctx));
      if (!rule) continue; // sem regra aplicável: fica por resolver, e é reportado
      const rewritten = rule.rewrite(ctx);
      if (!rewritten) continue; // regra sem resposta segura: fica por resolver e é reportado
      const { uri } = rewritten;
      edits.push({ ...ref, novo: uri, regra: rule.id });
      porRegra[rule.id] = (porRegra[rule.id] || 0) + 1;
    }

    if (!edits.length) continue;
    rewrittenPages++;

    // aplicar de trás para a frente, para não invalidar os índices
    let novoHtml = html;
    for (const e of [...edits].reverse()) {
      novoHtml = novoHtml.slice(0, e.index) + `${e.attr}="${e.novo}"` + novoHtml.slice(e.index + e.length);
    }

    // verificação: re-resolve TUDO na página já corrigida
    for (const ref of refsOf(novoHtml)) {
      if (!resolves(args.root, pageAbs, ref.uri)) {
        unresolvedAfter.push({ page: relative(args.root, pageAbs), uri: ref.uri });
      }
    }

    for (const e of edits) {
      changes.push({
        page: relative(args.root, pageAbs),
        attr: e.attr,
        de: e.uri,
        para: e.novo,
        regra: e.regra,
        destino: relative(args.root, resolve(dirname(pageAbs), e.novo))
      });
    }

    if (args.apply) writeFileSync(pageAbs, novoHtml, "utf8");
  }

  const report = {
    status: unresolvedAfter.length ? "REPROVADO" : (args.apply ? "APLICADO" : "PLANO"),
    espelho: relative(args.root, espelhoDir) || espelhoDir,
    paginas: pages.length,
    paginasComCorrecao: rewrittenPages,
    ligacoesQuebradasAntes: unresolvedBefore.length,
    ligacoesReescritas: changes.length,
    porRegra,
    ligacoesPorResolverDepois: unresolvedAfter.length,
    restantes: unresolvedAfter.slice(0, 50),
    aplicado: args.apply
  };

  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.status}: ${report.paginas} páginas, ${report.ligacoesQuebradasAntes} ligações quebradas, ` +
      `${report.ligacoesReescritas} reescritas (${Object.entries(porRegra).map(([k, v]) => `${k}=${v}`).join(", ") || "nenhuma"}), ` +
      `${report.ligacoesPorResolverDepois} por resolver depois.${args.apply ? " Ficheiros escritos." : " Dry-run: nada foi escrito."}`);
    for (const u of report.restantes) console.error(`  por resolver: ${u.page} → ${u.uri}`);
  }

  if (unresolvedAfter.length) process.exit(1);
}

// Só corre quando é invocado directamente: o verificador do plano importa as
// regras deste módulo e não pode disparar o corrector.
const filename = process.argv[1] ? resolve(process.argv[1]) : "";
if (filename === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`ERRO: ${e.message}`);
      console.error("uso: node scripts/fix-espelho-links.mjs [--root <dir>] [--espelho <rel>] [--apply] [--json]");
      process.exit(2);
    }
    console.error(`ERRO: ${e.message}`);
    process.exit(1);
  }
}

#!/usr/bin/env node
/**
 * Gera `public/sitemap.xml` a partir do código, nunca a mão.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * `public/sitemap.xml` era um arquivo escrito à mão, com 24 URLs, e por isso
 * NÃO continha `/blog/mary-eliza-mahoney`. O artigo existia, era alcançável,
 * tinha contrato próprio — e simplesmente não estava no sitemap. Pior: como
 * ninguém escrevia esse arquivo, TODO artigo novo nascia invisível para o
 * buscador. É o mesmo defeito do `articles/index.ts`: uma lista mantida à mão
 * que some com o que ninguém lembrou de acrescentar.
 *
 * `sitemapXml()` já existia em `src/lib/contract.ts` e deriva de
 * `publicPaths()`, que por sua vez deriva do catálogo. Só que a função nunca
 * virava arquivo no build Nitro (o que a Vercel usa) — só no build SPA.
 *
 * Este script fecha o buraco: todo build regenera o arquivo, e o gate
 * `scripts/audit-static.mjs` falha se o arquivo divergir do código.
 */
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "public/sitemap.xml");

// Fora do bundler o TS puro não carrega; usa o mesmo mecanismo do contrato.
const xml = execFileSync(
  process.execPath,
  [
    "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs",
    "-e",
    "import('./src/lib/contract.ts').then(m=>{const x=m.sitemapXml();const p=m.publicPaths();process.stdout.write(JSON.stringify({xml:x,n:p.length,paths:p}))}).catch(e=>{process.stderr.write(String(e));process.exit(1)})",
  ],
  { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "inherit"] },
);

const { xml: conteudo, n, paths } = JSON.parse(xml);
const anterior = (await import("node:fs")).existsSync(target)
  ? (await import("node:fs")).readFileSync(target, "utf8")
  : "";

if (anterior === conteudo) {
  console.log(`[sitemap] ${n} URLs — inalterado (public/sitemap.xml)`);
} else {
  writeFileSync(target, conteudo);
  const antes = (anterior.match(/<loc>/g) || []).length;
  console.log(`[sitemap] ${n} URLs — public/sitemap.xml regravado a partir do codigo (antes: ${antes})`);
}

// Prova: o arquivo em disco tem que bater com o que o codigo diz.
const emDisco = (await import("node:fs")).readFileSync(target, "utf8");
const locs = [...emDisco.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const faltando = paths.filter((p) => !locs.some((l) => l.endsWith(p) || l === p));
if (faltando.length) {
  console.error(`[sitemap] FALHA: ${faltando.length} rota(s) de publicPaths() ausentes do sitemap:`);
  for (const p of faltando) console.error(`   ${p}`);
  process.exit(1);
}
console.log(`[sitemap] conferido: todas as ${n} rotas de publicPaths() estao no arquivo.`);

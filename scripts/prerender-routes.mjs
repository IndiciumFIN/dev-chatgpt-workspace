// Lista de rotas para prerender, derivada do contrato de rotas.
//
// A lista NÃO é escrita à mão aqui. Se fosse, uma rota adicionada à aplicação e
// esquecida neste arquivo daria 404 num CDN sem nenhum gate reclamar — é a
// mesma deriva que os contratos vieram remover. `publicPaths()` sabe quem existe
// porque deriva das rotas, do catálogo de ferramentas e do catálogo de artigos.
//
// Rodar direto (`node scripts/prerender-routes.mjs`) imprime a lista, para
// conferir quantas rotas o contrato conhece sem abrir a aplicação.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function fromContract() {
  const out = execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--import",
      "./scripts/alias-hook.mjs",
      "-e",
      "import('./src/lib/contract.ts').then(m=>console.log(JSON.stringify(m.publicPaths())))",
    ],
    { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  return JSON.parse(out.trim().split("\n").pop());
}

export const publicPathsForPrerender = fromContract();

/**
 * Rotas alcançáveis que NÃO entram no sitemap.
 *
 * `publicPaths()` é a lista do sitemap: só o que pode ser indexado. Mas
 * `noindex` não significa "não existe" — `/modelos` e as famílias de template
 * são acessíveis pelo menu e marked `noindex` de propósito. Num site estático
 * sem rewrite, materializar só a lista do sitemap faria essas páginas
 * responderem 404 para quem chegasse nelas pelo menu.
 *
 * Ou seja: sitemap é o que o buscador deve ver; materializar é o que o visitante
 * pode encontrar. São listas diferentes por um motivo real.
 */
// `templates.ts` importa um JSON, que o Node puro não carrega sem atributo de
// import (o Vite carrega). Em vez de contornar o carregamento, lê-se o id das
// famílias direto do fonte — a mesma técnica que o gerador de contratos já usa
// para `catalog.ts` e `site-data.ts`.
const EXTRA = (() => {
  const src = readFileSync("src/lib/templates.ts", "utf8");
  const bloco = src.slice(src.indexOf("export const templateFamilies"));
  const ids = [...bloco.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
  if (!ids.length) throw new Error("templateFamilies não encontrado em src/lib/templates.ts");
  const curiositySlugs = JSON.parse(readFileSync("src/lib/content/curiosidades/catalog.json", "utf8")).map((x) => x.slug);
  return ["/blog", ...curiositySlugs.map((slug) => "/blog/" + slug), "/modelos", ...ids.map((id) => `/modelos/${id}`)];
})();

export const reachablePaths = [...publicPathsForPrerender, ...EXTRA.filter((p) => !publicPathsForPrerender.includes(p))];

if (process.argv[1] && process.argv[1].endsWith("prerender-routes.mjs")) {
  const extras = reachablePaths.filter((p) => !publicPathsForPrerender.includes(p));
  console.log(`${publicPathsForPrerender.length} rotas no sitemap + ${extras.length} alcancaveis-sem-index`);
  console.log(extras.map((p) => `  ${p}`).join("\n"));
}

/**
 * Materializa uma página por rota pública, a partir do HTML do shell.
 *
 * O build SPA gera um único `_shell.html`. Num CDN, `/secao/sobre` precisa do
 * próprio arquivo — não há rewrite configurado. Copiar o shell para cada
 * endereço é o que torna rota profunda funcionando em qualquer hospedagem
 * estática, sem depender de configuração do servidor.
 *
 * A lista vem do CONTRATO (`publicPaths()`), nunca de um array escrito à mão:
 * rota nova esquecida aqui daria 404 num CDN sem gate reclamar.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { publicPathsForPrerender, reachablePaths } from "./prerender-routes.mjs";

const STATIC = ".vercel/output/static";
const SHELL = join(STATIC, "_shell.html");

if (!existsSync(SHELL)) {
  console.error(`BLOCKED: ${SHELL} não existe. Rode o build SPA primeiro (SPA_BUILD=1 npm run build).`);
  process.exit(1);
}

let written = 0;
for (const route of reachablePaths) {
  // "/" já é a raiz; rotas com parametro dinâmico não são materializáveis.
  const target = route === "/" ? join(STATIC, "index.html") : join(STATIC, route.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(SHELL, target);
  written++;
}

// Materializa também o que hoje é função e não arquivo. `sitemapXml()` existia
// como função e nunca virava arquivo — num site estático, isso é sitemap
// inexistente, ou seja, um site publicado que o Google não consegue indexar.
const { sitemapXml } = await import("../src/lib/contract.ts").catch(async () => {
  // fora do bundler o TS puro não carrega; gera com o mesmo mecanismo do contrato
  const { execFileSync } = await import("node:child_process");
  const xml = execFileSync(process.execPath, [
    "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs",
    "-e", "import('./src/lib/contract.ts').then(m=>process.stdout.write(m.sitemapXml()))",
  ], { encoding: "utf8" });
  return { sitemapXml: () => xml };
});

writeFileSync(join(STATIC, "sitemap.xml"), sitemapXml());
writeFileSync(
  join(STATIC, "robots.txt"),
  ["User-agent: *", "Allow: /", "", "# Áreas autenticadas fora do índice", "Disallow: /admin", "Disallow: /conta", "Disallow: /sessao", "Disallow: /assinante", "Disallow: /login", "Disallow: /oficina-local", ""].join("\n"),
);
written += 2;

console.log(`${written} arquivos materializados a partir do contrato (${reachablePaths.length} rotas = ${publicPathsForPrerender.length} do sitemap + ${reachablePaths.length - publicPathsForPrerender.length} alcancaveis-sem-index, mais sitemap.xml e robots.txt)`);

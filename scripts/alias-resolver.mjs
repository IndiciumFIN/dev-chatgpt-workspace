/**
 * Resolver de alias para os testes do Node.
 *
 * O projeto usa o alias `@/*` → `src/*` (ver `paths` no tsconfig). O Vite
 * resolve isso em tempo de build, mas o `node --test` não — então qualquer
 * teste que importe o motor clínico quebrava em ERR_MODULE_NOT_FOUND.
 *
 * Este hook faz a mesma tradução que o Vite, e só isso: nada de stub, nada de
 * mock. O código sob teste é o mesmo que roda em produção.
 */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(here, "..", "src");

/** Resolve um caminho para o primeiro que existir na ordem que o Vite usa. */
function resolveFile(base) {
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = resolveFile(path.join(srcRoot, specifier.slice(2)));
    if (!file) {
      throw new Error(
        `Alias "${specifier}" não resolveu para nenhum arquivo sob ${srcRoot}. ` +
          `Procurei: ${specifier}.ts, ${specifier}.tsx e ${specifier}/index.ts.`,
      );
    }
    return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}
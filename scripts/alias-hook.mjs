import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// A raiz vem do próprio lugar do hook (…/scripts → …/src). Fixar "/workspace"
// quebra em qualquer checkout que não esteja neste caminho — o teste, o seed
// e o build têm de achar o mesmo `src` onde quer que a árvore esteja.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = join(ROOT, "src", specifier.slice(2));
    const file = existsSync(`${base}.ts`)
      ? `${base}.ts`
      : existsSync(`${base}.tsx`)
        ? `${base}.tsx`
        : base;
    return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}

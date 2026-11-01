import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = `/workspace/src/${specifier.slice(2)}`;
    const file = existsSync(`${base}.ts`) ? `${base}.ts` : existsSync(`${base}.tsx`) ? `${base}.tsx` : base;
    return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}

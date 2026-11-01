import { existsSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.CE_ALIAS_HOOK) {
  process.env.CE_ALIAS_HOOK = "1";
  register(import.meta.url);
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = join(root, "src", specifier.slice(2));
    const file = existsSync(`${base}.ts`) ? `${base}.ts` : existsSync(`${base}.tsx`) ? `${base}.tsx` : base;
    return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}
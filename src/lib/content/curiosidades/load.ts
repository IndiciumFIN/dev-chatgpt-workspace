
import { findCuriosityMeta } from "./catalog.ts";
import type { CuriosityRecord } from "./types.ts";

// Uma página por chunk. O JSON é snapshot somente leitura do banco, não autoridade editorial.
const pages = import.meta.glob<{ default: CuriosityRecord }>("./pages/*.json");

export async function loadCuriosity(slug: string): Promise<CuriosityRecord | undefined> {
  if (!findCuriosityMeta(slug)) return undefined;
  const load = pages["./pages/" + slug + ".json"];
  if (!load) throw new Error("Snapshot editorial ausente para " + slug);
  const module = await load();
  if (module.default.slug !== slug || module.default.content.slug !== slug) {
    throw new Error("Falha de integridade do snapshot " + slug);
  }
  return module.default;
}


import { findCuriosityMeta } from "./catalog.ts";
import type { CuriosityRecord } from "./types.ts";

// Uma página por chunk. O JSON é snapshot somente leitura do banco, não autoridade editorial.
// Apenas a sessão de desenvolvimento explicitamente autorizada pode carregar os rascunhos.
// O glob fica em um ramo morto do bundle de produção (ver gate anti-leak do build).

export async function loadCuriosity(slug: string): Promise<CuriosityRecord | undefined> {
  if (!import.meta.env.DEV || import.meta.env.VITE_CURIOSIDADES_MEM_PREVIEW !== "true") return undefined;
  if (!findCuriosityMeta(slug)) return undefined;
  const pages = import.meta.glob<{ default: CuriosityRecord }>("./pages/*.json");
  const load = pages["./pages/" + slug + ".json"];
  if (!load) throw new Error("Snapshot editorial ausente para " + slug);
  const module = await load();
  if (module.default.slug !== slug || module.default.content.slug !== slug) {
    throw new Error("Falha de integridade do snapshot " + slug);
  }
  return module.default;
}

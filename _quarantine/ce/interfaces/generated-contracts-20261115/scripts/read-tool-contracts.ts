/**
 * Le o catalogo de ferramentas e a governanca, e devolve JSON.
 *
 * Existe como script separado porque o `generate-entity-contracts.mjs` precisa
 * ler dados de runtime (status, sourceIds, faixa, bindings por campo) e nao
 * regex sobre texto. Fora do bundler o TS puro nao carrega — por isso este
 * arquivo roda com o mesmo mecanismo de alias do app.
 */
import { tools, candidateTools } from "@/lib/tools/catalog.ts";
import { FONTES, BINDINGS, CAMPOS, CAMPOS_CONTEXTO, PRIVACY_PROFILE } from "@/lib/tools/governance.ts";
import { POLITICA_FERRAMENTAS } from "@/lib/tools/contracts.ts";

import { writeFileSync } from "node:fs";

/**
 * Status EVIDENCE_BOUND aqui descreve exclusivamente os bindings do catálogo
 * técnico. Não constitui homologação clínica, direitos autorais ou publicação.
 * Nenhuma proveniência pode ser inventada no gerador.
 */
const sourcesById = new Map(FONTES.map((source) => [source.canonical_id, source]));
function bindingMetadata(slug: string) {
  const bindings = BINDINGS.filter((b) => b.field_path.startsWith(`tool.${slug}.`));
  const sourceIds = [...new Set(bindings.flatMap((b) => b.source_ids ?? []))];
  const complete = bindings.length > 0 && bindings.every((b) =>
    b.status === "EVIDENCE_BOUND" &&
    b.source_ids.length > 0 &&
    b.source_ids.every((id) => sourcesById.get(id)?.status === "SOURCE_QUALIFIED")
  );
  return { status: complete ? "EVIDENCE_BOUND" : "CANDIDATE", sourceIds };
}

// Grava em ARQUIVO, nao em stdout: o hook de alias tambem escreve no stdout e
// isso quebrava o JSON.parse do gerador.
const destino = process.env.TOOL_CONTRACTS_DUMP ?? "/tmp/tool-contracts.json";
writeFileSync(
  destino,
  JSON.stringify({
    tools: [...tools, ...candidateTools].map((t) => ({
      slug: t.slug,
      kind: t.kind,
      title: t.title,
      status: t.status ?? bindingMetadata(t.slug).status,
      publicacao: t.publicacao ?? "publicada",
      holds: t.holds ?? [],
      sourceIds: t.sourceIds ?? bindingMetadata(t.slug).sourceIds,
      faixa: t.bands?.length
        ? { min: Math.min(...t.bands.map((b) => b.min)), max: Math.max(...t.bands.map((b) => b.max)) }
        : null,
      referencias: (t.references ?? []).length,
      criteria: (t.criteria ?? []).map((c) => c.id),
      fields: (t.fields ?? []).map((c) => c.id),
      selects: (t.selects ?? []).map((c) => c.id),
    })),
    fontes: FONTES,
    bindings: BINDINGS,
    campos: CAMPOS,
    camposContexto: CAMPOS_CONTEXTO,
    privacy: PRIVACY_PROFILE,
    politica: POLITICA_FERRAMENTAS,
  }),
  "utf8",
);
process.stderr.write(`[tool-contracts] escrito em ${destino}\n`);

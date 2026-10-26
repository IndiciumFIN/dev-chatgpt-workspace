/**
 * Contrato de fonte. É a folha de rosto de uma fonte: de onde veio, com que
 * hash, com que trecho literal, com que pinpoint e quais validadores a
 * sustentam.
 *
 * A forma vem de `origin/preview/central-comando-20261026:src/core/governance/source-contract.ts`
 * (leitura, não checkout). O que mudou ao portar:
 *
 *   - `id` é o `sourceCanonicalId` (o mesmo do índice por artigo e do manifesto),
 *     não um id qualquer;
 *   - a fonte carrega o trecho literal (`quote`), o `pinpoint` e o
 *     `quoteSha256` — sem os três, a fonte é um palpite;
 *   - a validação é fail-closed e devolve o motivo, não um booleano mudo.
 */

export type SourceKind = "api" | "file" | "database" | "feed" | "manual";

export type SourceContract = {
  /** `sourceCanonicalId`. Ex.: `transversal-public.lei-12-965-2014.source`. */
  id: string;
  kind: SourceKind;
  owner: string;
  sourceType: string;
  templateId: string;
  normativeIds: string[];
  validators: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
  sourceRef: string;
  createdAt: string;
  updatedAt: string;
  /** Trecho literal da fonte. Vazio é fonte sem citação. */
  quote?: string;
  /** Onde, dentro da fonte, o trecho está. Vazio é fonte sem endereço. */
  pinpoint?: string;
  /** sha256 do trecho. É o que amarra a citação ao texto. */
  quoteSha256?: string;
  /** Lote de captura que viu a fonte. */
  intakeBatchId?: string;
  /** Átomo do kernel que carrega a afirmação. */
  atomId?: string;
  /** Pedido de admissão que consagra a fonte. */
  orderId?: string;
};

export type SourceContractViolation = {
  campo: string;
  motivo: string;
};

const naoVazio = (valor: unknown): valor is string =>
  typeof valor === "string" && valor.trim().length > 0;

const sha256Hex = (valor: unknown): valor is string =>
  typeof valor === "string" && /^[a-f0-9]{64}$/.test(valor);

/** O contrato está inteiro? Devolve a lista de violações — vazia é inteiro. */
export function validarContratoDeFonte(contrato: Partial<SourceContract>): SourceContractViolation[] {
  const violacoes: SourceContractViolation[] = [];
  if (!naoVazio(contrato.id)) {
    violacoes.push({ campo: "id", motivo: "a fonte sem sourceCanonicalId não tem identidade" });
  }
  if (!naoVazio(contrato.owner)) {
    violacoes.push({ campo: "owner", motivo: "a fonte sem dono não tem quem responda por ela" });
  }
  if (!naoVazio(contrato.sourceRef)) {
    violacoes.push({ campo: "sourceRef", motivo: "a fonte sem referência de origem não é rastreável" });
  }
  if (!sha256Hex(contrato.hash)) {
    violacoes.push({ campo: "hash", motivo: "a fonte sem sha256 válido não amarra o conteúdo" });
  }
  if (!Array.isArray(contrato.validators) || contrato.validators.length === 0) {
    violacoes.push({ campo: "validators", motivo: "a fonte sem validador não tem como ser conferida" });
  } else if (contrato.validators.some((id) => !naoVazio(id))) {
    violacoes.push({ campo: "validators", motivo: "validador sem nome não conta" });
  } else if (new Set(contrato.validators).size !== contrato.validators.length) {
    violacoes.push({ campo: "validators", motivo: "validador repetido não é dois validadores" });
  }
  if (contrato.quote !== undefined) {
    if (!naoVazio(contrato.quote)) {
      violacoes.push({ campo: "quote", motivo: "citação vazia não é citação" });
    }
    if (!naoVazio(contrato.pinpoint)) {
      violacoes.push({ campo: "pinpoint", motivo: "citação sem pinpoint não diz onde foi lida" });
    }
    if (!sha256Hex(contrato.quoteSha256)) {
      violacoes.push({ campo: "quoteSha256", motivo: "citação sem sha256 pode ter sido trocada" });
    }
  }
  return violacoes;
}

/** O contrato passa? Falha fechada: só passa quem não tem violação. */
export function contratoDeFonteEInteiro(contrato: Partial<SourceContract>): boolean {
  return validarContratoDeFonte(contrato).length === 0;
}

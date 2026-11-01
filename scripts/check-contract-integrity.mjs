#!/usr/bin/env node
/**
 * Portão de integridade, escopo e referência dos contratos de ferramentas (fail-closed).
 *
 *   node scripts/check-contract-integrity.mjs [--root <dir>]
 *                                          [--sources <rel>] [--bindings <rel>]
 *
 * Por que existe: `contracts/entities/tool-sources.v1.json` e
 * `contracts/entities/tool-bindings.v1.json` são consumidos pelo motor de
 * auditoria e pelos portões de cobertura. Um contrato que declara conformidade
 * de enum mas não tem integridade (hash real ou ausência declarada com motivo),
 * nem referência válida (source_ids que existem, decisão coerente com o estado,
 * evidência anexada) faz o resto da cadeia "aprovar" o que não viu.
 *
 * Este portão é mais estrito que um validador de enum: enum conforme não é
 * homologação.
 *
 * ── Duas decisões de desenho que evitam erros medidos ──
 *
 * 1. **Os enums são resolvidos escopados ao contrato que os governa.** O
 *    catálogo CKO tem `decision` em três contratos com valores diferentes:
 *    `applicability` (APPLICABLE|NOT_APPLICABLE_JUSTIFIED|HOLD),
 *    `authority_binding` (ALLOW|HOLD_HUMAN|REJECT|NOT_APPLICABLE_JUSTIFIED) e
 *    `release_gate` (HOLD|REJECTED|APPROVED). Resolver o enum pelo nome da
 *    chave mistura vocabulários — foi assim que um `BOUND` passou a `HOLD`,
 *    que também não pertence ao contrato que rege o binding.
 *
 * 2. **O ficheiro de bindings mistura dois tipos de objecto.** Uma
 *    `authority_binding` carrega `authority_class` e `decision`; uma
 *    `field_definition` NÃO carrega nenhum dos dois e aponta para a sua
 *    authority binding por `authority_binding_ref`. Imputar autoridade a uma
 *    definição de campo (por ex. `INTERNAL_NONCLINICAL`) rotula campos
 *    clínicos de Aldrete, Braden e Morse como não-clínicos. Aqui a ausência é
 *    a estrutura correcta: o portão exige que a referência resolva e que a
 *    autoridade venha do binding referenciado.
 *
 * Regras (todas reprovam — fail-closed):
 *   R1  source_type ∈ enum do contrato `source`
 *   R2  integrity.sha256 = 64 hex ≠ zeros, OU "NOT_AVAILABLE" com
 *       integrity.reason E integrity.artifact_ref declarados
 *   R3  integrity.sha256 = 64 zeros → sempre reprovado
 *   R4  authority_binding: authority_class presente e ∈ enum do contrato
 *       `authority_binding`; field_definition: authority_class AUSENTE
 *       (imputada é violação) e authority_binding_ref a resolver
 *   R5  authority_binding: decision presente e ∈ enum do `authority_binding`
 *   R6  coerência: HOLD_HUMAN não convive com status EVIDENCE_BOUND;
 *       ALLOW exige validator_ids e evidence_bundle_ids não vazios
 *   R7  integridade referencial: todo source_id existe no contrato de fontes
 *       e todo authority_binding_ref existe no de bindings
 *   R8  autoridade não-INTERNAL exige source_ids não vazio
 *   R9  fonte com hash real tem artifact_ref que existe no disco
 *   R10 canonical_id único; source_ids sem duplicados
 *   R11 integrity.snapshot_ref declarado e não vazio
 *   R12 status ∈ enum canónico e coerente com a evidência declarada
 *
 * Regra de desenho: ausência é HOLD. O portão nunca aprova um registo que não
 * tenha evidência — só declara que a falta de evidência está declarada.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEFAULT_SOURCES = "contracts/entities/tool-sources.v1.json";
const DEFAULT_BINDINGS = "contracts/entities/tool-bindings.v1.json";
const CATALOG = "contracts/cko-skeleton/catalog/cko-data.json";

const HEX64 = /^[0-9a-f]{64}$/;
const ZERO64 = "0".repeat(64);

function parseArgs(argv) {
  const out = { root: REPO_ROOT, sources: DEFAULT_SOURCES, bindings: DEFAULT_BINDINGS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") out.root = resolve(argv[++i]);
    else if (a === "--sources") out.sources = argv[++i];
    else if (a === "--bindings") out.bindings = argv[++i];
    else if (a === "--help" || a === "-h") {
      console.log("uso: node scripts/check-contract-integrity.mjs [--root <dir>] [--sources <rel>] [--bindings <rel>]");
      process.exit(0);
    } else throw new Error(`argumento desconhecido: ${a}`);
  }
  return out;
}

function readJson(root, rel) {
  const p = isAbsolute(rel) ? rel : join(root, rel);
  if (!existsSync(p)) throw new Error(`ficheiro ausente: ${rel}`);
  return { path: p, rel, data: JSON.parse(readFileSync(p, "utf8")) };
}

/** Contrato canónico (por id) do catálogo CKO, com os seus enums. */
function contractSchema(root, contractId) {
  const { rel, data } = readJson(root, CATALOG);
  const contracts = Array.isArray(data?.contracts) ? data.contracts : [];
  const c = contracts.find((x) => x && x.id === contractId);
  if (!c) {
    throw new Error(`contrato canónico '${contractId}' não encontrado em ${rel} (ids: ${contracts.map((x) => x?.id).join(", ")})`);
  }
  const props = c.schema?.properties || {};
  const enumOf = (key) => (Array.isArray(props[key]?.enum) ? props[key].enum : null);
  return {
    id: contractId,
    required: Array.isArray(c.schema?.required) ? c.schema.required : [],
    props,
    enumOf,
    rel
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];
  const fail = (rule, where, msg) => failures.push(`[${rule}] ${where}: ${msg}`);

  const cSource = contractSchema(args.root, "source");
  const cBinding = contractSchema(args.root, "authority_binding");
  const cField = contractSchema(args.root, "field_definition");
  const STATUS = new Set(cSource.enumOf("status") || []);
  const SOURCE_TYPE = new Set(cSource.enumOf("source_type") || []);
  const AUTH_CLASS = new Set(cBinding.enumOf("authority_class") || []);
  const DECISION = new Set(cBinding.enumOf("decision") || []);

  const sourcesDoc = readJson(args.root, args.sources);
  const bindingsDoc = readJson(args.root, args.bindings);
  const sources = sourcesDoc.data?.items;
  const bindings = bindingsDoc.data?.items;
  if (!Array.isArray(sources) || sources.length === 0) {
    console.error(`REPROVADO: ${args.sources} sem 'items' ou lista vazia`);
    process.exit(1);
  }
  if (!Array.isArray(bindings) || bindings.length === 0) {
    console.error(`REPROVADO: ${args.bindings} sem 'items' ou lista vazia`);
    process.exit(1);
  }

  // ---- fontes ----
  const sourceIds = new Set();
  for (const [i, src] of sources.entries()) {
    const where = `${args.sources}#items[${i}]${src?.canonical_id ? ` (${src.canonical_id})` : ""}`;
    if (!src || typeof src !== "object") { fail("R10", where, "item não é objecto"); continue; }
    if (typeof src.canonical_id !== "string" || !src.canonical_id) {
      fail("R10", where, "canonical_id ausente");
    } else if (sourceIds.has(src.canonical_id)) {
      fail("R10", where, `canonical_id duplicado: ${src.canonical_id}`);
    } else {
      sourceIds.add(src.canonical_id);
    }
    if (!SOURCE_TYPE.has(src.source_type)) {
      fail("R1", where, `source_type '${src.source_type}' fora do enum canónico (${[...SOURCE_TYPE].join(", ")})`);
    }
    if (!STATUS.has(src.status)) {
      fail("R12", where, `status '${src.status}' fora do enum canónico`);
    }
    const integrity = src.integrity;
    if (!integrity || typeof integrity !== "object") {
      fail("R2", where, "integrity ausente");
    } else {
      const sha = integrity.sha256;
      if (sha === ZERO64) {
        fail("R3", where, "integrity.sha256 = 64 zeros (hash placeholder nunca é integridade)");
      } else if (typeof sha === "string" && sha === "NOT_AVAILABLE") {
        if (typeof integrity.reason !== "string" || !integrity.reason.trim()) {
          fail("R2", where, "sha256 NOT_AVAILABLE sem integrity.reason declarado");
        }
        if (!("artifact_ref" in integrity)) {
          fail("R2", where, "sha256 NOT_AVAILABLE sem integrity.artifact_ref declarado");
        }
      } else if (typeof sha === "string" && HEX64.test(sha)) {
        const ref = integrity.artifact_ref;
        if (typeof ref !== "string" || !ref.trim()) {
          fail("R9", where, "sha256 real sem integrity.artifact_ref que aponte para o artefacto");
        } else {
          const p = isAbsolute(ref) ? ref : join(args.root, ref);
          if (!existsSync(p)) fail("R9", where, `integrity.artifact_ref não existe no disco: ${ref}`);
        }
      } else {
        fail("R2", where, `integrity.sha256 inválido: ${JSON.stringify(sha)}`);
      }
      if (typeof integrity.snapshot_ref !== "string" || !integrity.snapshot_ref.trim()) {
        fail("R11", where, "integrity.snapshot_ref ausente ou vazio");
      }
    }
  }

  // ---- bindings: classificar por forma, não por prefixo do id ----
  const isBinding = (x) =>
    x && typeof x === "object" && ("decision" in x || "requirement_id" in x) && !("authority_binding_ref" in x);
  const isField = (x) => x && typeof x === "object" && "authority_binding_ref" in x;

  const byId = new Map();
  for (const x of bindings) if (x && typeof x.canonical_id === "string") byId.set(x.canonical_id, x);

  const bindingIds = new Set();
  for (const [i, b] of bindings.entries()) {
    const where = `${args.bindings}#items[${i}]${b?.canonical_id ? ` (${b.canonical_id})` : ""}`;
    if (!b || typeof b !== "object") { fail("R10", where, "item não é objecto"); continue; }
    if (typeof b.canonical_id !== "string" || !b.canonical_id) {
      fail("R10", where, "canonical_id ausente");
    } else if (bindingIds.has(b.canonical_id)) {
      fail("R10", where, `canonical_id duplicado: ${b.canonical_id}`);
    } else {
      bindingIds.add(b.canonical_id);
    }
    if (!STATUS.has(b.status)) {
      fail("R12", where, `status '${b.status}' fora do enum canónico`);
    }
    if (!isBinding(b) && !isField(b)) {
      fail("R4", where, "item que não é authority_binding nem field_definition (tipo indecifrável)");
      continue;
    }

    if (isBinding(b)) {
      // ---- authority_binding ----
      if (!("authority_class" in b)) {
        fail("R4", where, "authority_binding sem authority_class (ausência não é imputável)");
      } else if (!AUTH_CLASS.has(b.authority_class)) {
        fail("R4", where, `authority_class '${b.authority_class}' fora do enum canónico (${[...AUTH_CLASS].join(", ")})`);
      }
      if (!("decision" in b)) {
        fail("R5", where, "authority_binding sem decision");
      } else if (!DECISION.has(b.decision)) {
        fail("R5", where, `decision '${b.decision}' fora do enum canónico do authority_binding (${[...DECISION].join(", ")})`);
      }
      const status = b.status;
      const decision = b.decision;
      if (decision === "HOLD_HUMAN" && status === "EVIDENCE_BOUND") {
        fail("R6", where, "decision HOLD_HUMAN com status EVIDENCE_BOUND (contraditório)");
      }
      if (status === "EVIDENCE_BOUND" && !(Array.isArray(b.evidence_bundle_ids) && b.evidence_bundle_ids.length)) {
        fail("R12", where, "status EVIDENCE_BOUND sem evidence_bundle_ids");
      }
      if (decision === "ALLOW") {
        if (!Array.isArray(b.validator_ids) || b.validator_ids.length === 0) {
          fail("R6", where, "decision ALLOW sem validator_ids");
        }
        if (!Array.isArray(b.evidence_bundle_ids) || b.evidence_bundle_ids.length === 0) {
          fail("R6", where, "decision ALLOW sem evidence_bundle_ids");
        }
      }
      const sids = Array.isArray(b.source_ids) ? b.source_ids : [];
      if (new Set(sids).size !== sids.length) fail("R10", where, "source_ids com duplicados");
      for (const sid of sids) {
        if (!sourceIds.has(sid)) fail("R7", where, `source_id inexistente no contrato de fontes: ${sid}`);
      }
      const ac = b.authority_class;
      if (ac && ac !== "INTERNAL_NONCLINICAL" && sids.length === 0) {
        fail("R8", where, `authority_class '${ac}' sem source_ids (autoridade sem fonte é infundada)`);
      }
    } else {
      // ---- field_definition ----
      if ("authority_class" in b) {
        fail("R4", where, `field_definition com authority_class imputada ('${b.authority_class}') — a autoridade vem do binding referenciado`);
      }
      if ("decision" in b) {
        fail("R5", where, `field_definition com decision imputada ('${b.decision}')`);
      }
      const ref = b.authority_binding_ref;
      if (typeof ref !== "string" || !ref.trim()) {
        fail("R7", where, "field_definition sem authority_binding_ref");
      } else if (!byId.has(ref)) {
        fail("R7", where, `authority_binding_ref inexistente: ${ref}`);
      } else {
        const alvo = byId.get(ref);
        if (!isBinding(alvo)) {
          fail("R7", where, `authority_binding_ref '${ref}' não é uma authority_binding`);
        } else {
          if (!AUTH_CLASS.has(alvo.authority_class)) {
            fail("R7", where, `authority_binding_ref '${ref}' sem authority_class válida`);
          }
          if (!DECISION.has(alvo.decision)) {
            fail("R7", where, `authority_binding_ref '${ref}' sem decision válida`);
          }
          if (alvo.status === "EVIDENCE_BOUND" && b.status === "EVIDENCE_BOUND" &&
              !(Array.isArray(alvo.evidence_bundle_ids) && alvo.evidence_bundle_ids.length)) {
            fail("R12", where, `EVIDENCE_BOUND herdado de '${ref}' sem evidence_bundle_ids`);
          }
        }
      }
    }
  }

  if (failures.length) {
    console.error(`REPROVADO: ${failures.length} violação(ões) de integridade/escopo/referência nos contratos.`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
  const nB = bindings.filter(isBinding).length;
  const nF = bindings.filter(isField).length;
  console.log(
    `PASS contratos: ${sources.length} fontes, ${nB} authority bindings e ${nF} field definitions com integridade, escopo e referência declarados.`
  );
}

main();

#!/usr/bin/env node
/**
 * Portão de integridade, escopo e referência dos contratos de ferramentas (fail-closed).
 *
 *   node scripts/check-contract-integrity.mjs [--root <dir>]
 *                                          [--sources <rel>] [--bindings <rel>]
 *                                          [--json] [--quiet]
 *
 * ── Princípio que rege este portão ──
 *
 * O portão é **derivado do contrato**, não de um conjunto de valores escritos à
 * mão: os enums, os `required`, os `pattern` e o `additionalProperties` saem do
 * catálogo CKO (`contracts/cko-skeleton/catalog/cko-data.json`). Um portão que
 * aceita mais do que o contrato permite é a mesma classe de defeito que um
 * validador de enum: deixa passar o que a cadeia devia reprovar.
 *
 * ── A forma canónica de uma fonte (medida, não presumida) ──
 *
 * O registo canónico tem 43 instâncias do contrato `source`
 * (`registers/governance/transversal-source-instances/`), e o materializador
 * (`scripts/materialize-transversal-public.py:100`) escreve exactamente:
 *
 *     "integrity": { "sha256": <64 hex>, "snapshot_ref": <caminho do snapshot> }
 *
 * e o schema canónico (`contracts/cko-schemas/source.schema.json`) declara
 * `integrity.sha256.pattern = ^[a-f0-9]{64}$` e
 * `integrity.additionalProperties = false`. Ou seja: **uma fonte tem sempre um
 * artefacto preservado e o hash dele.** O contrato `source` não tem — e não
 * pode ter, sem WORK ORDER — um estado para "documento não preservado": o
 * `NOT_AVAILABLE` com `reason` e `artifact_ref` é um registo que o contrato
 * não representa. Esse caso é reportado aqui como **lacuna de contrato**, com
 * nome, e não disfarçado de conformidade.
 *
 * ── Regras (todas reprovam — fail-closed) ──
 *
 *   Forma (contra o schema do contrato):
 *   R1.SOURCE_TYPE          source_type ∈ enum do contrato `source`
 *   R1.STATUS               status ∈ enum do contrato `source`
 *   R2.SHA256_FORMAT        integrity.sha256 casa o `pattern` do contrato
 *   R2.SHA256_ZEROS         64 zeros — hash placeholder nunca é integridade
 *   R2.SHA256_NOT_REPRESENTABLE
 *                            valor fora do `pattern` (ex.: NOT_AVAILABLE):
 *                            o contrato não tem estado para "não preservado"
 *   R3.SNAPSHOT_REF         snapshot_ref presente, não vazio, não-placeholder
 *   R4.AUTHORITY_CLASS      authority_binding: authority_class ∈ enum do
 *                            contrato `authority_binding`; field_definition:
 *                            AUSENTE (imputada é violação)
 *   R5.DECISION             authority_binding: decision ∈ enum do
 *                            `authority_binding`; field_definition: AUSENTE
 *   R6.ALLOW_WITHOUT_VALIDATORS
 *   R6.ALLOW_WITHOUT_EVIDENCE
 *   R6.HOLD_HUMAN_WITH_EVIDENCE_BOUND
 *   R6.EVIDENCE_BOUND_WITHOUT_BUNDLE
 *   R6.SOURCE_QUALIFIED_WITHOUT_ARTEFACT
 *   R7.SOURCE_REF_UNRESOLVED
 *   R7.BINDING_REF_UNRESOLVED
 *   R7.BINDING_REF_NOT_BINDING
 *   R7.BINDING_REF_WITHOUT_AUTHORITY
 *   R8.NON_INTERNAL_WITHOUT_SOURCE
 *   R9.ARTEFACT_MISSING     hash real sem artefacto no disco
 *   R9.HASH_MISMATCH        hash declarado ≠ hash recalculado do artefacto
 *   R10.MISSING_ID / R10.DUPLICATE_ID / R10.DUPLICATE_SOURCE_IDS
 *   R13.SCHEMA_SHAPE        propriedade fora do contrato
 *                            (`additionalProperties: false`) ou `required` em falta
 *
 * ── Decisões de desenho que evitam erros já medidos ──
 *
 * 1. **Os enums são resolvidos escopados ao contrato que os governa.** O
 *    catálogo tem `decision` em três contratos com valores diferentes
 *    (`applicability`, `authority_binding`, `release_gate`). Resolver pelo
 *    nome da chave mistura vocabulários.
 *
 * 2. **O ficheiro de bindings mistura dois tipos de objecto.** Uma
 *    `authority_binding` carrega `authority_class` e `decision`; uma
 *    `field_definition` NÃO carrega nenhum dos dois e aponta para a sua
 *    authority binding por `authority_binding_ref`. Imputar autoridade a uma
 *    definição de campo rotula campos clínicos de Aldrete, Braden e Morse como
 *    não-clínicos. A ausência é a estrutura correcta.
 *
 * 3. **As violações derivadas contam à parte.** 1 defeito num binding
 *    referenciado por 32 field definitions é 1 defeito, não 32.
 *
 * Regra de desenho: ausência é HOLD. O portão nunca aprova um registo que não
 * tenha evidência; e nunca aprova um registo que o contrato não representa.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEFAULT_SOURCES = "contracts/entities/tool-sources.v1.json";
const DEFAULT_BINDINGS = "contracts/entities/tool-bindings.v1.json";
const CATALOG = "contracts/cko-skeleton/catalog/cko-data.json";

const ZERO64 = "0".repeat(64);
const PLACEHOLDERS = /^(pending|pending_snapshot|todo|tbd|placeholder|n\/a|unknown|null|undefined|-\s*)$/i;

class UsageError extends Error {}

/* ── argumentos ─────────────────────────────────────────────────────────── */
function parseArgs(argv) {
  const out = { root: REPO_ROOT, sources: DEFAULT_SOURCES, bindings: DEFAULT_BINDINGS, json: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") out.root = resolve(argv[++i]);
    else if (a === "--sources") out.sources = argv[++i];
    else if (a === "--bindings") out.bindings = argv[++i];
    else if (a === "--json") out.json = true;
    else if (a === "--quiet") out.quiet = true;
    else if (a === "--help" || a === "-h") {
      console.log("uso: node scripts/check-contract-integrity.mjs [--root <dir>] [--sources <rel>] [--bindings <rel>] [--json] [--quiet]");
      process.exit(0);
    } else throw new UsageError(`argumento desconhecido: ${a}`);
  }
  return out;
}

/* ── leitura ────────────────────────────────────────────────────────────── */
function readJson(root, rel) {
  const p = isAbsolute(rel) ? rel : join(root, rel);
  if (!existsSync(p)) throw new Error(`ficheiro ausente: ${rel}`);
  let raw;
  try {
    raw = readFileSync(p, "utf8");
  } catch (e) {
    throw new Error(`ficheiro ilegível: ${rel} (${e.code || e.message})`);
  }
  try {
    return { path: p, rel, raw, data: JSON.parse(raw) };
  } catch (e) {
    throw new Error(`JSON inválido em ${rel}: ${e.message}`);
  }
}

/** Índice linha -> posição, para_messages com a linha real (o índice do array muda). */
function lineIndex(raw) {
  const lines = raw.split("\n");
  const map = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/"canonical_id"\s*:\s*"([^"]+)"/);
    if (m && !map.has(m[1])) map.set(m[1], i + 1);
  }
  return map;
}

/* ── contrato canónico ──────────────────────────────────────────────────── */
function loadContracts(root) {
  const { rel, data } = readJson(root, CATALOG);
  const list = Array.isArray(data?.contracts) ? data.contracts : [];
  const byId = new Map();
  for (const c of list) if (c && typeof c.id === "string") byId.set(c.id, c);
  return { rel, byId };
}

function contractOf(contracts, id) {
  const c = contracts.byId.get(id);
  if (!c) {
    throw new Error(`contrato canónico '${id}' não encontrado em ${contracts.rel}`);
  }
  return c.schema || {};
}

/* ── validador de forma (subconjunto de JSON Schema, derivado do contrato) ── */
function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (Number.isInteger(v)) return "integer";
  return typeof v;
}

function typeMatches(v, t) {
  if (t === "object") return v !== null && typeof v === "object" && !Array.isArray(v);
  if (t === "array") return Array.isArray(v);
  if (t === "integer") return Number.isInteger(v);
  if (t === "number") return typeof v === "number";
  if (t === "string") return typeof v === "string";
  if (t === "boolean") return typeof v === "boolean";
  if (t === "null") return v === null;
  return true;
}

/**
 * Valida a forma de um registo contra o schema do contrato.
 * Devolve [{rule, prop, msg}] — só o que é apanhável sem contexto.
 */
function validateShape(obj, schema, prefix = "") {
  const out = [];
  const props = schema.properties || {};
  const required = Array.isArray(schema.required) ? schema.required : [];

  for (const key of required) {
    if (!(key in obj)) {
      out.push({ rule: "R13.REQUIRED_MISSING", prop: prefix + key, msg: `"${key}" exigido pelo contrato e ausente` });
    }
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(obj)) {
      if (!(key in props)) {
        out.push({
          rule: "R13.PROPERTY_NOT_IN_CONTRACT",
          prop: prefix + key,
          msg: `"${key}" não existe no contrato (additionalProperties: false)`
        });
      }
    }
  }
  for (const [key, value] of Object.entries(obj)) {
    const ps = props[key];
    if (!ps) continue;
    const p = prefix + key;
    if (ps.type && !typeMatches(value, ps.type)) {
      out.push({ rule: "R13.TYPE", prop: p, msg: `tipo ${typeOf(value)} ≠ ${ps.type} exigido pelo contrato` });
      continue;
    }
    if (Array.isArray(ps.enum) && !ps.enum.includes(value)) {
      out.push({ rule: "R13.ENUM", prop: p, msg: `'${value}' fora do enum do contrato (${ps.enum.join(", ")})` });
    }
    if (ps.pattern && typeof value === "string" && !new RegExp(ps.pattern).test(value)) {
      out.push({ rule: "R13.PATTERN", prop: p, msg: `'${value}' não casa o pattern do contrato (${ps.pattern})` });
    }
    if (ps.minLength && typeof value === "string" && value.length < ps.minLength) {
      out.push({ rule: "R13.MIN_LENGTH", prop: p, msg: `string vazia ou curta demais (minLength ${ps.minLength})` });
    }
    if (ps.type === "object" && value && typeof value === "object") {
      out.push(...validateShape(value, ps, `${p}.`));
    }
    if (ps.type === "array" && Array.isArray(value) && ps.items) {
      for (let i = 0; i < value.length; i++) {
        const it = value[i];
        const ips = ps.items;
        if (ips.type && !typeMatches(it, ips.type)) {
          out.push({ rule: "R13.TYPE", prop: `${p}[${i}]`, msg: `tipo ${typeOf(it)} ≠ ${ips.type} exigido pelo contrato` });
        }
        if (ips.pattern && typeof it === "string" && !new RegExp(ips.pattern).test(it)) {
          out.push({ rule: "R13.PATTERN", prop: `${p}[${i}]`, msg: `'${it}' não casa o pattern do contrato (${ips.pattern})` });
        }
        if (ips.minLength && typeof it === "string" && it.length < ips.minLength) {
          out.push({ rule: "R13.MIN_LENGTH", prop: `${p}[${i}]`, msg: `string vazia ou curta demais (minLength ${ips.minLength})` });
        }
      }
    }
  }
  return out;
}

/* ── sha256 do artefacto ────────────────────────────────────────────────── */
function sha256Of(absPath) {
  try {
    return createHash("sha256").update(readFileSync(absPath)).digest("hex");
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];
  const derived = [];

  const fail = (rule, where, msg, isDerived = false) => {
    const rec = { rule, where, msg };
    if (isDerived) derived.push(rec); else failures.push(rec);
  };

  const contracts = loadContracts(args.root);
  const srcSchema = contractOf(contracts, "source");
  const bindSchema = contractOf(contracts, "authority_binding");

  const srcProps = srcSchema.properties || {};
  const bindProps = bindSchema.properties || {};
  const STATUS = new Set(srcProps.status?.enum || []);
  const SOURCE_TYPE = new Set(srcProps.source_type?.enum || []);
  const AUTH_CLASS = new Set(bindProps.authority_class?.enum || []);
  const DECISION = new Set(bindProps.decision?.enum || []);
  const SHA_PATTERN = srcProps.integrity?.properties?.sha256?.pattern || "^[0-9a-f]{64}$";
  const SHA_RE = new RegExp(SHA_PATTERN);

  const sourcesDoc = readJson(args.root, args.sources);
  const bindingsDoc = readJson(args.root, args.bindings);
  const srcLines = lineIndex(sourcesDoc.raw);
  const bindLines = lineIndex(bindingsDoc.raw);

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

  /* ── fontes ───────────────────────────────────────────────────────────── */
  const sourceIds = new Set();
  const sourceById = new Map();
  for (const src of sources) {
    if (src && typeof src.canonical_id === "string") sourceById.set(src.canonical_id, src);
  }

  for (const src of sources) {
    const id = src?.canonical_id;
    const line = id && srcLines.has(id) ? srcLines.get(id) : null;
    const where = `${args.sources}${line ? `:${line}` : ""}${id ? ` (${id})` : ""}`;
    if (!src || typeof src !== "object") { fail("R10.MISSING_ID", where, "item não é objecto"); continue; }

    // forma contra o contrato
    for (const v of validateShape(src, srcSchema)) {
      // `integrity.sha256` fora do pattern é reportado pela R2.SHA256_NOT_REPRESENTABLE,
      // que traz a mensagem com o WORK ORDER — não se conta duas vezes.
      if (v.prop === "integrity.sha256" && v.rule === "R13.PATTERN") continue;
      // `source_type` e `status` fora do enum são reportados pela R1, que traz
      // o enum canónico completo na mensagem.
      if ((v.prop === "source_type" || v.prop === "status") && v.rule === "R13.ENUM") continue;
      // propriedade dentro de `integrity` que o contrato não tem é lacuna de contrato
      const isIntegrityProp = v.rule === "R13.PROPERTY_NOT_IN_CONTRACT" && v.prop.startsWith("integrity.");
      fail(
        isIntegrityProp ? "R2.INTEGRITY_NOT_IN_CONTRACT" : v.rule,
        where,
        `${v.prop}: ${v.msg}` +
          (isIntegrityProp
            ? " — o contrato `source` não tem representação para esta propriedade (WORK ORDER do dono)"
            : "")
      );
    }

    if (typeof src.canonical_id !== "string" || !src.canonical_id) {
      fail("R10.MISSING_ID", where, "canonical_id ausente");
    } else if (sourceIds.has(src.canonical_id)) {
      fail("R10.DUPLICATE_ID", where, `canonical_id duplicado: ${src.canonical_id}`);
    } else {
      sourceIds.add(src.canonical_id);
    }

    if (!SOURCE_TYPE.has(src.source_type)) {
      fail("R1.SOURCE_TYPE", where, `source_type '${src.source_type}' fora do enum canónico (${[...SOURCE_TYPE].join(", ")})`);
    }
    if (!STATUS.has(src.status)) {
      fail("R1.STATUS", where, `status '${src.status}' fora do enum canónico (${[...STATUS].join(", ")})`);
    }

    const integrity = src.integrity;
    if (!integrity || typeof integrity !== "object") {
      fail("R2.SHA256_FORMAT", where, "integrity ausente");
    } else {
      const sha = integrity.sha256;
      if (sha === ZERO64) {
        fail("R2.SHA256_ZEROS", where, "integrity.sha256 = 64 zeros (hash placeholder nunca é integridade)");
      } else if (typeof sha !== "string" || !SHA_RE.test(sha)) {
        fail(
          "R2.SHA256_NOT_REPRESENTABLE",
          where,
          `integrity.sha256 '${sha}' não casa o pattern do contrato (${SHA_PATTERN}). ` +
            "O contrato `source` exige o hash de um artefacto preservado e não tem estado para " +
            "'documento não preservado': emendar o contrato (WORK ORDER) ou preservar o documento."
        );
      } else {
        // hash real: tem de haver artefacto, e o hash é recalculado
        const ref = integrity.artifact_ref ?? integrity.snapshot_ref;
        if (typeof ref !== "string" || !ref.trim()) {
          fail("R9.ARTEFACT_MISSING", where, "integrity.sha256 real sem caminho de artefacto (artifact_ref/snapshot_ref)");
        } else {
          const p = isAbsolute(ref) ? ref : join(args.root, ref);
          if (!existsSync(p) || !statSync(p).isFile()) {
            fail("R9.ARTEFACT_MISSING", where, `artefacto não existe no disco: ${ref}`);
          } else {
            const real = sha256Of(p);
            if (real && real !== sha) {
              fail("R9.HASH_MISMATCH", where, `hash declarado ≠ hash recalculado do artefacto (${ref}): declarado ${sha.slice(0, 12)}…, recalculado ${real.slice(0, 12)}…`);
            }
          }
        }
      }
      const snap = integrity.snapshot_ref;
      if (typeof snap !== "string" || !snap.trim()) {
        fail("R3.SNAPSHOT_REF", where, "integrity.snapshot_ref ausente ou vazio");
      } else if (PLACEHOLDERS.test(snap.trim())) {
        fail("R3.SNAPSHOT_REF", where, `integrity.snapshot_ref é um placeholder ('${snap}'), não um caminho de snapshot`);
      }
    }

    // matriz estado × evidência
    if (src.status === "SOURCE_QUALIFIED" && !SHA_RE.test(String(src.integrity?.sha256))) {
      fail("R6.SOURCE_QUALIFIED_WITHOUT_ARTEFACT", where, "status SOURCE_QUALIFIED sem hash de artefacto preservado");
    }
  }

  /* ── bindings ─────────────────────────────────────────────────────────── */
  const isBinding = (x) =>
    x && typeof x === "object" && ("decision" in x || "requirement_id" in x) && !("authority_binding_ref" in x);
  const isField = (x) => x && typeof x === "object" && "authority_binding_ref" in x;

  const byId = new Map();
  for (const x of bindings) if (x && typeof x.canonical_id === "string") byId.set(x.canonical_id, x);

  const bindingIds = new Set();
  for (const b of bindings) {
    const id = b?.canonical_id;
    const line = id && bindLines.has(id) ? bindLines.get(id) : null;
    const where = `${args.bindings}${line ? `:${line}` : ""}${id ? ` (${id})` : ""}`;
    if (!b || typeof b !== "object") { fail("R10.MISSING_ID", where, "item não é objecto"); continue; }

    if (typeof b.canonical_id !== "string" || !b.canonical_id) {
      fail("R10.MISSING_ID", where, "canonical_id ausente");
    } else if (bindingIds.has(b.canonical_id)) {
      fail("R10.DUPLICATE_ID", where, `canonical_id duplicado: ${b.canonical_id}`);
    } else {
      bindingIds.add(b.canonical_id);
    }
    if (!STATUS.has(b.status)) {
      fail("R1.STATUS", where, `status '${b.status}' fora do enum canónico (${[...STATUS].join(", ")})`);
    }
    if (!isBinding(b) && !isField(b)) {
      fail("R4.UNDECIDABLE_TYPE", where, "item que não é authority_binding nem field_definition (tipo indecifrável)");
      continue;
    }

    if (isBinding(b)) {
      if (!("authority_class" in b)) {
        fail("R4.AUTHORITY_CLASS", where, "authority_binding sem authority_class (ausência não é imputável)");
      } else if (!AUTH_CLASS.has(b.authority_class)) {
        fail("R4.AUTHORITY_CLASS", where, `authority_class '${b.authority_class}' fora do enum canónico (${[...AUTH_CLASS].join(", ")})`);
      }
      if (!("decision" in b)) {
        fail("R5.DECISION", where, "authority_binding sem decision");
      } else if (!DECISION.has(b.decision)) {
        fail("R5.DECISION", where, `decision '${b.decision}' fora do enum canónico do authority_binding (${[...DECISION].join(", ")})`);
      }
      const status = b.status;
      const decision = b.decision;
      if (decision === "HOLD_HUMAN" && status === "EVIDENCE_BOUND") {
        fail("R6.HOLD_HUMAN_WITH_EVIDENCE_BOUND", where, "decision HOLD_HUMAN com status EVIDENCE_BOUND (contraditório)");
      }
      if (status === "EVIDENCE_BOUND" && !(Array.isArray(b.evidence_bundle_ids) && b.evidence_bundle_ids.length)) {
        fail("R6.EVIDENCE_BOUND_WITHOUT_BUNDLE", where, "status EVIDENCE_BOUND sem evidence_bundle_ids");
      }
      if (decision === "ALLOW") {
        if (!Array.isArray(b.validator_ids) || b.validator_ids.length === 0) {
          fail("R6.ALLOW_WITHOUT_VALIDATORS", where, "decision ALLOW sem validator_ids");
        }
        if (!Array.isArray(b.evidence_bundle_ids) || b.evidence_bundle_ids.length === 0) {
          fail("R6.ALLOW_WITHOUT_EVIDENCE", where, "decision ALLOW sem evidence_bundle_ids");
        }
      }
      const sids = Array.isArray(b.source_ids) ? b.source_ids : [];
      if (new Set(sids).size !== sids.length) fail("R10.DUPLICATE_SOURCE_IDS", where, "source_ids com duplicados");
      for (const sid of sids) {
        if (!sourceIds.has(sid)) fail("R7.SOURCE_REF_UNRESOLVED", where, `source_id inexistente no contrato de fontes: ${sid}`);
      }
      const ac = b.authority_class;
      if (ac && ac !== "INTERNAL_NONCLINICAL" && sids.length === 0) {
        fail("R8.NON_INTERNAL_WITHOUT_SOURCE", where, `authority_class '${ac}' sem source_ids (autoridade sem fonte é infundada)`);
      }
    } else {
      // ---- field_definition: não recebe autoridade ----
      if ("authority_class" in b) {
        fail("R4.AUTHORITY_CLASS", where, `field_definition com authority_class imputada ('${b.authority_class}') — a autoridade vem do binding referenciado`);
      }
      if ("decision" in b) {
        fail("R5.DECISION", where, `field_definition com decision imputada ('${b.decision}')`);
      }
      const ref = b.authority_binding_ref;
      if (typeof ref !== "string" || !ref.trim()) {
        fail("R7.BINDING_REF_UNRESOLVED", where, "field_definition sem authority_binding_ref");
      } else if (!byId.has(ref)) {
        fail("R7.BINDING_REF_UNRESOLVED", where, `authority_binding_ref inexistente: ${ref}`);
      } else {
        const alvo = byId.get(ref);
        if (!isBinding(alvo)) {
          fail("R7.BINDING_REF_NOT_BINDING", where, `authority_binding_ref '${ref}' não é uma authority_binding`);
        } else {
          // violações derivadas: 1 defeito no binding ⇒ 1 defeito, não N
          if (!AUTH_CLASS.has(alvo.authority_class)) {
            fail("R7.BINDING_REF_WITHOUT_AUTHORITY", where, `authority_binding_ref '${ref}' sem authority_class válida`, true);
          }
          if (!DECISION.has(alvo.decision)) {
            fail("R7.BINDING_REF_WITHOUT_AUTHORITY", where, `authority_binding_ref '${ref}' sem decision válida`, true);
          }
          if (alvo.status === "EVIDENCE_BOUND" && b.status === "EVIDENCE_BOUND" &&
              !(Array.isArray(alvo.evidence_bundle_ids) && alvo.evidence_bundle_ids.length)) {
            fail("R6.EVIDENCE_BOUND_WITHOUT_BUNDLE", where, `EVIDENCE_BOUND herdado de '${ref}' sem evidence_bundle_ids`, true);
          }
        }
      }
    }
  }

  const total = failures.length + derived.length;
  if (total) {
    const contractGaps = failures.filter((f) => f.rule === "R2.SHA256_NOT_REPRESENTABLE" || f.rule === "R2.INTEGRITY_NOT_IN_CONTRACT");
    const blocking = failures.length - contractGaps.length;
    if (args.json) {
      console.log(JSON.stringify({
        status: "REPROVADO",
        total,
        blocking: failures.length,
        derived: derived.length,
        contract_gaps: contractGaps.length,
        violations: failures.map((f) => ({ rule: f.rule, where: f.where, msg: f.msg })),
        derived_violations: derived.map((f) => ({ rule: f.rule, where: f.where, msg: f.msg }))
      }, null, 2));
    } else {
      console.error(`REPROVADO: ${total} violação(ões) de integridade/escopo/referência nos contratos (${failures.length} primárias, ${derived.length} derivadas).`);
      for (const f of failures) console.error(`  [${f.rule}] ${f.where}: ${f.msg}`);
      if (derived.length) {
        console.error(`  — ${derived.length} violação(ões) derivadas (1 defeito no binding referenciado, contado uma vez):`);
        for (const f of derived) console.error(`  [${f.rule}] ${f.where}: ${f.msg}`);
      }
      if (contractGaps.length) {
        console.error(
          `  — ${contractGaps.length} caso(s) sem representação no contrato canónico: o contrato \`source\` exige ` +
          "hash de um artefacto preservado e não tem estado para 'documento não preservado'. " +
          "Exige WORK ORDER do dono (emendar o contrato ou preservar os documentos)."
        );
      }
    }
    process.exit(1);
  }

  const nB = bindings.filter(isBinding).length;
  const nF = bindings.filter(isField).length;
  if (args.json) {
    console.log(JSON.stringify({ status: "PASS", sources: sources.length, authority_bindings: nB, field_definitions: nF }, null, 2));
  } else if (!args.quiet) {
    console.log(
      `PASS contratos: ${sources.length} fontes, ${nB} authority bindings e ${nF} field definitions conformes ao contrato e com integridade, escopo e referência declarados.`
    );
  }
}

try {
  main();
} catch (e) {
  if (e instanceof UsageError) {
    console.error(`ERRO: ${e.message}`);
    console.error("uso: node scripts/check-contract-integrity.mjs [--root <dir>] [--sources <rel>] [--bindings <rel>] [--json] [--quiet]");
    process.exit(2);
  }
  console.error(`ERRO: ${e.message}`);
  process.exit(1);
}

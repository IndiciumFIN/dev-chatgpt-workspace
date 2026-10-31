#!/usr/bin/env node
/**
 * Validador de schema do inventário transversal de pendências.
 *
 *   node scripts/check-register-schema.mjs [--root <dir>] [--file <rel>]
 *
 * Fail-closed: qualquer campo ausente, id duplicado, estado desconhecido ou
 * incoerência entre `completeness` e `releaseGate` reprova o gate.
 *
 * Por que existe: o inventário `registers/pmo/cross-source-pending-intake.v1.json`
 * é a fonte que o gate de cobertura consome. Um registro malformado (ou
 * adulterado) faria o gate de cobertura "aprovar" pendências que ele não viu.
 * Validador de schema antes do validador de cobertura.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const DEFAULT_FILE = "registers/pmo/cross-source-pending-intake.v1.json";
const WO_STATUS = new Set(["PAUSED", "IN_PROGRESS", "QUEUED", "HOLD_HUMAN", "DONE", "BLOCKED"]);
const COMPLETENESS = new Set(["NOT_VERIFIED", "PARTIAL", "COMPLETE"]);
const RELEASE_GATE = new Set(["HOLD_HUMAN", "RELEASE_CANDIDATE", "RELEASED"]);
const GAP_STATUS = new Set(["OPEN", "CLOSED"]);

const args = process.argv.slice(2);
let root = ".";
let file = DEFAULT_FILE;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--root") root = args[++i] ?? "";
  else if (args[i] === "--file") file = args[++i] ?? "";
  else {
    console.error(`[check-register-schema] argumento desconhecido: ${args[i]}`);
    process.exit(2);
  }
}
const ROOT = resolve(process.cwd(), root || ".");
const path = join(ROOT, file);

if (!existsSync(path)) {
  console.log(`[check-register-schema] SKIP — ${file} ainda não aterrissou (T0.005). Ausência de insumo não é aprovação.`);
  process.exit(0);
}

const violations = [];
const add = (code, detail) => violations.push({ code, detail });

let doc;
try {
  doc = JSON.parse(readFileSync(path, "utf8"));
} catch (e) {
  console.error(`[check-register-schema] JSON inválido: ${e.message}`);
  process.exit(1);
}

if (doc.schemaVersion !== 1) add("SCHEMA_VERSION", `schemaVersion esperado 1, obtido ${JSON.stringify(doc.schemaVersion)}`);
if (doc.registerId !== "CE-CROSS-SOURCE-PENDING-INTAKE") add("REGISTER_ID", `registerId inesperado: ${JSON.stringify(doc.registerId)}`);
if (typeof doc.snapshotDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(doc.snapshotDate)) add("SNAPSHOT_DATE", `snapshotDate inválido: ${JSON.stringify(doc.snapshotDate)}`);
if (typeof doc.scope !== "string" || !doc.scope.trim()) add("SCOPE", "scope vazio");
if (!COMPLETENESS.has(doc.completeness)) add("COMPLETENESS", `completeness inválido: ${JSON.stringify(doc.completeness)}`);
if (!RELEASE_GATE.has(doc.releaseGate)) add("RELEASE_GATE", `releaseGate inválido: ${JSON.stringify(doc.releaseGate)}`);
if (typeof doc.policy !== "string" || doc.policy.trim().length < 20) add("POLICY", "policy ausente ou curta demais");
if (doc.completeness !== "COMPLETE" && doc.releaseGate === "RELEASED") add("COERENCIA", "releaseGate=RELEASED exige completeness=COMPLETE");

/* sourceSnapshots */
const ss = doc.sourceSnapshots ?? {};
for (const key of ["pmo", "simulados", "issues"]) {
  if (!ss[key] || typeof ss[key] !== "object") add("SNAPSHOT", `sourceSnapshots.${key} ausente`);
}
if (ss.pmo && typeof ss.pmo.revision !== "number") add("SNAPSHOT", "sourceSnapshots.pmo.revision deve ser número");
if (ss.issues && typeof ss.issues.observedCount !== "number") add("SNAPSHOT", "sourceSnapshots.issues.observedCount deve ser número");

/* Coleções precisam existir: omiti-las não pode produzir um falso OK. */
for (const key of ["pmo", "simulados", "openIssues", "coverageGaps"]) {
  if (!Array.isArray(doc[key])) add("COLECAO_AUSENTE", `${key} precisa ser um array explícito`);
}
if (Array.isArray(doc.openIssues) && ss.issues &&
    ss.issues.observedCount !== doc.openIssues.length) {
  add("SNAPSHOT_CONTAGEM", `observedCount=${ss.issues.observedCount}, openIssues=${doc.openIssues.length}`);
}
if (Array.isArray(doc.openIssues)) {
  for (const it of doc.openIssues) {
    const match = /^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\/issues\/(\d+)$/.exec(it.url ?? "");
    const id = typeof it.id === "string" ? /^(?:GH|ISSUE)-(\d+)$/.exec(it.id) : null;
    if (!match || !id || match[1] !== id[1] ||
        (it.number !== undefined && String(it.number) !== match[1])) {
      add("ISSUE_IDENTIDADE", `id, number e URL divergem em ${JSON.stringify(it.id)}`);
    }
  }
}

/* coleções */
const woIds = new Set((Array.isArray(doc.pmo) ? doc.pmo : []).map((w) => w.id));
function checkUnique(items, label, idKey = "id") {
  const seen = new Set();
  for (const it of items ?? []) {
    const id = it?.[idKey];
    if (!id) { add("ID_AUSENTE", `${label}: item sem ${idKey}`); continue; }
    if (seen.has(id)) add("ID_DUPLICADO", `${label}: ${id}`);
    seen.add(id);
  }
}

for (const it of (Array.isArray(doc.pmo) ? doc.pmo : [])) {
  if (!WO_STATUS.has(it.status)) add("STATUS_INVALIDO", `pmo ${it.id}: status ${JSON.stringify(it.status)}`);
  if (typeof it.evidenceCount !== "number" || it.evidenceCount < 0) add("EVIDENCIA", `pmo ${it.id}: evidenceCount inválido`);
}
checkUnique(doc.pmo, "pmo");

for (const it of (Array.isArray(doc.simulados) ? doc.simulados : [])) {
  if (!it.status) add("STATUS_INVALIDO", `simulados ${it.id}: status ausente`);
  if (it.wo && it.wo !== "UNRECONCILED" && !woIds.has(it.wo)) add("WO_DESCONHECIDA", `simulados ${it.id}: wo ${it.wo} não existe na fila`);
}
checkUnique(doc.simulados, "simulados");

for (const it of (Array.isArray(doc.openIssues) ? doc.openIssues : [])) {
  if (!it.url || !/^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\/issues\/\d+$/.test(it.url)) add("URL", `openIssues ${it.id}: url inválida`);
  if (!["OPEN", "CLOSED"].includes(it.state)) add("STATUS_INVALIDO", `openIssues ${it.id}: state ${JSON.stringify(it.state)}`);
  if (it.wo && it.wo !== "UNRECONCILED" && !woIds.has(it.wo)) add("WO_DESCONHECIDA", `openIssues ${it.id}: wo ${it.wo} não existe na fila`);
}
checkUnique(doc.openIssues, "openIssues");

for (const g of (Array.isArray(doc.coverageGaps) ? doc.coverageGaps : [])) {
  if (!GAP_STATUS.has(g.status)) add("GAP_STATUS", `${g.id}: status ${JSON.stringify(g.status)}`);
  if (typeof g.description !== "string" || g.description.trim().length < 10) add("GAP_DESCRICAO", `${g.id}: descrição ausente`);
}
checkUnique(doc.coverageGaps, "coverageGaps");

const counts = violations.reduce((a, v) => ((a[v.code] = (a[v.code] ?? 0) + 1), a), {});
if (!violations.length) {
  console.log(`[check-register-schema] OK — ${file} válido (${(Array.isArray(doc.pmo) ? doc.pmo : []).length} WOs · ${(Array.isArray(doc.simulados) ? doc.simulados : []).length} pendências · ${(Array.isArray(doc.openIssues) ? doc.openIssues : []).length} issues · ${(Array.isArray(doc.coverageGaps) ? doc.coverageGaps : []).length} gaps).`);
  process.exit(0);
}
console.error(`[check-register-schema] ${violations.length} violação(ões) em ${file}:`);
for (const [code, n] of Object.entries(counts)) console.error(`  ${code}: ${n}`);
for (const v of violations) console.error(`  - ${v.code}: ${v.detail}`);
process.exit(1);
